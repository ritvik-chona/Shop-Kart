import { Link } from "react-router-dom";
import WishlistButton from "./WishlistButton";
import AddToCartButton from "./AddToCartButton";

const ProductCard = ({ product, saved, onWishlistChange }) => {
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
          {/* Intl formats 2999 as 2,999 using the Indian digit grouping. */}
          &#8377;{product.price.toLocaleString("en-IN")}
        </p>

        <p className={inStock ? "stock in" : "stock out"}>
          {inStock ? `${product.stock} units left` : "Out of stock"}
        </p>

        <div className="card-actions">
          <AddToCartButton product={product} />
          <Link className="view-btn" to={`/products/${product._id}`}>
            View Details
          </Link>
          <WishlistButton
            productId={product._id}
            saved={saved}
            onChange={onWishlistChange}
          />
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
