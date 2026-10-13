import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CheckoutForm from "../components/CheckoutForm";
import { useCart } from "../context/CartContext";
import {
  createPaymentOrder,
  getMe,
  markPaymentFailed,
  verifyPayment,
} from "../services/api";
import { loadRazorpayScript } from "../utils/razorpay";

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, loading, subtotal, totalItems, clearCartState } = useCart();

  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  // One label for the whole multi-step payment flow, so the button can say
  // what is actually happening at each stage.
  const [stage, setStage] = useState("idle");

  useEffect(() => {
    getMe()
      .then((res) => {
        setCustomer(res.data);
        // The shipping form starts from the profile, which the user can edit.
        setForm((current) => ({
          ...current,
          fullName: current.fullName || res.data.fullName,
          phone: current.phone || res.data.phone,
        }));
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Opening /checkout directly with nothing in the cart is a dead end, so the
  // user is sent back to the cart once loading has finished.
  useEffect(() => {
    if (!loading && cartItems.length === 0 && stage === "idle") {
      navigate("/cart", { replace: true });
    }
  }, [loading, cartItems.length, stage, navigate]);

  const handleChange = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const next = {};

    // trim() means a field of spaces counts as empty.
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
      next.phone = "Enter a valid 10 digit phone number";
    if (!form.addressLine1.trim()) next.addressLine1 = "Address is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.state.trim()) next.state = "State is required";
    if (!form.pincode.trim()) next.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode.trim()))
      next.pincode = "Pincode must contain 6 digits";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async () => {
    setServerError("");

    // The backend is not called at all while the form is obviously invalid.
    if (!validate()) return;

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setServerError(
        "Could not load the payment window. Check your connection and try again."
      );
      return;
    }

    let checkout;
    try {
      setStage("creating");
      // No amount is sent. The server reads the cart and prices it itself.
      const res = await createPaymentOrder(form);
      checkout = res.data;
    } catch (error) {
      setStage("idle");
      setServerError(
        error.response?.data?.message || "Unable to start checkout. Please try again."
      );
      return;
    }

    setStage("paying");

    const razorpayCheckout = new window.Razorpay({
      key: checkout.key,
      amount: checkout.amount,
      currency: checkout.currency,
      name: "ShopKart",
      description: "ShopKart Order",
      order_id: checkout.razorpayOrderId,
      prefill: { name: form.fullName, contact: form.phone },
      handler: async (response) => {
        // Reaching this callback does not mean the payment is valid. The
        // details are sent to the server, which checks the signature.
        try {
          setStage("verifying");
          await verifyPayment({
            shopKartOrderId: checkout.shopKartOrderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          // The server emptied the cart, so the shared state follows.
          clearCartState();
          navigate(`/order-success/${checkout.shopKartOrderId}`, { replace: true });
        } catch (error) {
          setStage("idle");
          setServerError(
            error.response?.data?.message ||
              "We could not verify your payment. Your cart has not been cleared."
          );
        }
      },
      modal: {
        // Closing the window is not a failure, just an abandoned attempt.
        ondismiss: () => setStage("idle"),
      },
    });

    razorpayCheckout.on("payment.failed", async () => {
      setStage("idle");
      setServerError(
        "Payment failed. Your cart has not been cleared, please try again."
      );
      try {
        await markPaymentFailed(checkout.shopKartOrderId);
      } catch {
        // Recording the failure is best effort; the message above is enough.
      }
    });

    razorpayCheckout.open();
  };

  const buttonLabel = () => {
    if (stage === "creating") return "Preparing your order...";
    if (stage === "paying") return "Waiting for payment...";
    if (stage === "verifying") return "Verifying payment...";
    return "Pay with Razorpay";
  };

  const busy = stage !== "idle";

  return (
    <>
      <Navbar customerName={customer ? customer.fullName.split(" ")[0] : ""} />

      <main className="page">
        <header className="page-head">
          <h1>Checkout</h1>
          <p>Confirm where this order should be delivered.</p>
        </header>

        {loading && <p className="state">Loading your cart...</p>}

        {!loading && cartItems.length > 0 && (
          <div className="cart-layout">
            <CheckoutForm
              form={form}
              errors={errors}
              onChange={handleChange}
              disabled={busy}
            />

            <aside className="summary">
              <h2>Order Summary</h2>

              {cartItems.map((item) => (
                <div className="row" key={item.product._id}>
                  <span>
                    {item.product.name} &times; {item.quantity}
                  </span>
                  <strong>
                    &#8377;
                    {(item.product.price * item.quantity).toLocaleString("en-IN")}
                  </strong>
                </div>
              ))}

              <div className="row">
                <span>Items</span>
                <strong>{totalItems}</strong>
              </div>

              <div className="row total">
                <span>Total</span>
                <strong>&#8377;{subtotal.toLocaleString("en-IN")}</strong>
              </div>

              {serverError && <div className="alert">{serverError}</div>}

              <button
                className="checkout-btn"
                onClick={handlePlaceOrder}
                disabled={busy}
              >
                {buttonLabel()}
              </button>

              <p className="summary-note">
                Test mode only. The final amount is calculated by the server.
              </p>

              <Link className="continue-link" to="/cart">
                Back to cart
              </Link>
            </aside>
          </div>
        )}
      </main>
    </>
  );
};

export default Checkout;
