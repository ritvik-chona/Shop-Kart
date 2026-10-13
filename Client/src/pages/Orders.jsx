import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import { getMe, getOrders } from "../services/api";

const Orders = () => {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then((res) => setCustomer(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Wrapped so the Try Again button can re-run exactly the same request.
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getOrders();
      setOrders(res.data.orders);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("We couldn't load your orders.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <>
      <Navbar customerName={customer ? customer.fullName.split(" ")[0] : ""} />

      <main className="page">
        <header className="page-head">
          <h1>My Orders</h1>
          <p>
            {loading
              ? "Loading your order history..."
              : `${orders.length} ${orders.length === 1 ? "order" : "orders"} placed`}
          </p>
        </header>

        {loading && <p className="state">Loading your orders...</p>}

        {!loading && error && (
          <div className="state error-state">
            <p>Something went wrong.</p>
            <p>{error}</p>
            <button className="retry-btn" onClick={loadOrders}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="state empty-state">
            <div className="empty-icon cart-icon">&#128230;</div>
            <h2>You have not placed any orders yet</h2>
            <p>Your completed orders will appear here.</p>
            <Link className="cta" to="/products">
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="order-list">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default Orders;
