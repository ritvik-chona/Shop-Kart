import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { formatDate } from "../utils/format";
import { advanceOrderStatus, getMe, getOrderById } from "../services/api";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    getMe()
      .then((res) => setCustomer(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getOrderById(id);
      setOrder(res.data.order);
    } catch (err) {
      // The API answers 404 for an order belonging to somebody else, so the
      // page cannot be used to discover that it exists.
      if (err.response?.status === 404) setError("Order not found.");
      else if (err.response?.status === 400) setError("Invalid order link.");
      else setError("We couldn't load this order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Bonus: step the order through its delivery stages during development.
  const handleAdvance = async () => {
    try {
      setAdvancing(true);
      const res = await advanceOrderStatus(id);
      setOrder(res.data.order);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update the status.");
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <>
      <Navbar customerName={customer ? customer.fullName.split(" ")[0] : ""} />

      <main className="page">
        <Link className="back-link" to="/orders">
          &larr; Back to my orders
        </Link>

        {loading && <p className="state">Loading order...</p>}

        {!loading && error && (
          <div className="state error-state">
            <p>{error}</p>
            <button className="retry-btn" onClick={loadOrder}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <div className="cart-layout">
            <section className="cart-list">
              <div className="checkout-card">
                <h2>Items</h2>
                {order.items.map((item) => (
                  <div className="order-line" key={item.product}>
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <span className="order-line-name">
                      {item.name} &times; {item.quantity}
                      {/* The snapshot price, not today's catalogue price. */}
                      <small>
                        &#8377;{item.price.toLocaleString("en-IN")} at purchase
                      </small>
                    </span>
                    <span className="order-line-price">
                      &#8377;
                      {(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="checkout-card">
                <h2>Shipping Address</h2>
                <p className="address">
                  {order.shippingAddress.fullName}
                  <br />
                  {order.shippingAddress.addressLine1}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.pincode}
                  <br />
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            </section>

            <aside className="summary">
              <h2>Order #{order._id.slice(-8)}</h2>

              <div className="row">
                <span>Placed on</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
              <div className="row">
                <span>Payment</span>
                <strong>{order.paymentStatus}</strong>
              </div>
              <div className="row">
                <span>Status</span>
                <strong>{order.status.replace("_", " ")}</strong>
              </div>
              {order.razorpayPaymentId && (
                <div className="row">
                  <span>Payment id</span>
                  <strong className="mono">{order.razorpayPaymentId}</strong>
                </div>
              )}
              <div className="row total">
                <span>Total paid</span>
                <strong>
                  &#8377;{order.totalAmount.toLocaleString("en-IN")}
                </strong>
              </div>

              {order.paymentStatus === "PAID" && order.status !== "DELIVERED" && (
                <button
                  className="retry-btn full"
                  onClick={handleAdvance}
                  disabled={advancing}
                >
                  {advancing ? "Updating..." : "Advance status (dev)"}
                </button>
              )}

              <Link className="continue-link" to="/products">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </>
  );
};

export default OrderDetails;
