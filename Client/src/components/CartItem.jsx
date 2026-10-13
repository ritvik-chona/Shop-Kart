import { Link } from "react-router-dom";

const CartItem = ({ item, pending, onQuantityChange, onRemove }) => {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  return (
    <article className="cart-row">
      <Link to={`/products/${product._id}`} className="cart-thumb">
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>

      <div className="cart-info">
        <span className="product-category">{product.category}</span>
        <Link to={`/products/${product._id}`} className="cart-name">
          {product.name}
        </Link>
        <p className="cart-unit">
          &#8377;{product.price.toLocaleString("en-IN")} each
        </p>
        <p className={product.stock > 0 ? "stock in" : "stock out"}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
      </div>

      <div className="cart-controls">
        <div className="qty">
          <button
            type="button"
            onClick={() => onQuantityChange(product._id, quantity - 1)}
            /* At 1 the user must use Remove, so the minus button stops there. */
            disabled={pending || quantity <= 1}
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <span className="qty-value">{pending ? "..." : quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(product._id, quantity + 1)}
            disabled={pending || quantity >= product.stock}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <p className="cart-line-total">
          &#8377;{lineTotal.toLocaleString("en-IN")}
        </p>

        <button
          type="button"
          className="remove-btn"
          onClick={() => onRemove(product._id)}
          disabled={pending}
        >
          Remove
        </button>
      </div>
    </article>
  );
};

export default CartItem;
