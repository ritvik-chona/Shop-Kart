import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMe, getOrderById } from "../services/api";

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((res) => setCustomer(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // The confirmation reads the saved order back from the database, so what is
  // shown is what was actually persisted, not what the browser believed.
  useEffect(() => {
    getOrderById(id)
      .then((res) => setOrder(res.data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Navbar customerName={customer ? customer.fullName.split(" ")[0] : ""} />

      <main className="page">
        {loading && <p className="state">Loading your confirmation...</p>}

        {!loading && !order && (
          <div className="state error-state">
            <p>We couldn&apos;t find that order.</p>
            <Link className="cta" to="/orders">
              View My Orders
            </Link>
          </div>
        )}

        {!loading && order && (
          <section className="success-card">
            <div className="success-icon">&#10003;</div>
            <h1>Order Placed Successfully</h1>
            <p className="success-sub">
              Thank you. Your payment has been verified and your order is saved.
            </p>

            <div className="success-rows">
              <div className="row">
                <span>Order ID</span>
                <strong className="mono">{order._id}</strong>
              </div>
              <div className="row">
                <span>Items</span>
                <strong>
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </strong>
              </div>
              <div className="row">
                <span>Payment</span>
                <strong>{order.paymentStatus}</strong>
              </div>
              <div className="row">
                <span>Status</span>
                <strong>{order.status.replace("_", " ")}</strong>
              </div>
              <div className="row total">
                <span>Total</span>
                <strong>
                  &#8377;{order.totalAmount.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div className="success-actions">
              <Link className="cta" to="/orders">
                View My Orders
              </Link>
              <Link className="continue-link" to="/products">
                Continue Shopping
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default OrderSuccess;
