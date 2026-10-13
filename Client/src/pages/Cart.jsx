import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";
import { getMe } from "../services/api";

const Cart = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  // The page reads the shared cart; it never fetches its own copy.
  const {
    cartItems,
    loading,
    error,
    pendingId,
    actionError,
    totalItems,
    subtotal,
    updateQuantity,
    removeFromCart,
    refreshCart,
  } = useCart();

  useEffect(() => {
    getMe()
      .then((res) => setCustomer(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  return (
    <>
      <Navbar customerName={customer ? customer.fullName.split(" ")[0] : ""} />

      <main className="page">
        <header className="page-head">
          <h1>My Cart</h1>
          <p>
            {loading
              ? "Loading your items..."
              : `${totalItems} ${totalItems === 1 ? "item" : "items"} in your cart`}
          </p>
        </header>

        {loading && <p className="state">Loading your cart...</p>}

        {!loading && error && (
          <div className="state error-state">
            <p>Something went wrong.</p>
            <p>{error}</p>
            <button className="retry-btn" onClick={refreshCart}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="state empty-state">
            <div className="empty-icon cart-icon">&#128722;</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven&apos;t added anything yet.</p>
            <Link className="cta" to="/products">
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-layout">
            <section className="cart-list">
              {actionError && <div className="alert">{actionError}</div>}

              {cartItems.map((item) => (
                <CartItem
                  key={item.product._id}
                  item={item}
                  pending={pendingId === item.product._id}
                  onQuantityChange={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </section>

            <aside className="summary">
              <h2>Order Summary</h2>

              <div className="row">
                <span>Items</span>
                <strong>{totalItems}</strong>
              </div>
              <div className="row">
                <span>Subtotal</span>
                <strong>&#8377;{subtotal.toLocaleString("en-IN")}</strong>
              </div>
              <div className="row">
                <span>Delivery</span>
                <strong className="free">Free</strong>
              </div>
              <div className="row total">
                <span>Total</span>
                <strong>&#8377;{subtotal.toLocaleString("en-IN")}</strong>
              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

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

export default Cart;
