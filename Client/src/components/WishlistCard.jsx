import { Link } from "react-router-dom";

const WishlistCard = ({ product, onRemove, removing }) => {
  const inStock = product.stock > 0;

  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>

      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">
          &#8377;{product.price.toLocaleString("en-IN")}
        </p>

        <p className={inStock ? "stock in" : "stock out"}>
          {inStock ? `${product.stock} units left` : "Out of stock"}
        </p>

        <div className="card-actions">
          <Link className="view-btn" to={`/products/${product._id}`}>
            View Details
          </Link>
          <button
            type="button"
            className="wishlist-btn saved"
            onClick={() => onRemove(product._id)}
            disabled={removing}
          >
            {removing ? "Removing..." : "\u2665 Remove"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default WishlistCard;
