import { Link } from "react-router-dom";
import { formatDate } from "../utils/format";

// Status values come from the backend enum; this only maps them to a class.
const STATUS_CLASS = {
  PENDING_PAYMENT: "pending",
  PLACED: "placed",
  CONFIRMED: "placed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
};

const OrderCard = ({ order }) => {
  return (
    <article className="order-card">
      <header className="order-head">
        <div>
          <h3>Order #{order._id.slice(-8)}</h3>
          <p className="order-date">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`badge ${STATUS_CLASS[order.status] || "pending"}`}>
          {order.status.replace("_", " ")}
        </span>
      </header>

      <div className="order-items">
        {order.items.map((item) => (
          <div className="order-line" key={item.product}>
            <img src={item.image} alt={item.name} loading="lazy" />
            <span className="order-line-name">
              {item.name} &times; {item.quantity}
            </span>
            <span className="order-line-price">
              &#8377;{(item.price * item.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      <footer className="order-foot">
        <div>
          <span className="order-total-label">Total</span>
          <strong className="order-total">
            &#8377;{order.totalAmount.toLocaleString("en-IN")}
          </strong>
        </div>
        <Link className="view-btn inline" to={`/orders/${order._id}`}>
          View Details
        </Link>
      </footer>
    </article>
  );
};

export default OrderCard;
