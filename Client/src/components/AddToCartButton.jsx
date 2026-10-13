import { useCart } from "../context/CartContext";

// Reads and writes the shared cart state. It keeps no cart copy of its own.
const AddToCartButton = ({ product, block = false }) => {
  const { addToCart, pendingId, isInCart } = useCart();

  const outOfStock = product.stock < 1;
  const saving = pendingId === product._id;
  const alreadyInCart = isInCart(product._id);

  const label = () => {
    if (outOfStock) return "Out of stock";
    if (saving) return "Adding...";
    return alreadyInCart ? "Add Another" : "Add to Cart";
  };

  return (
    <button
      type="button"
      className={`cart-add-btn${block ? " block" : ""}`}
      onClick={() => addToCart(product._id)}
      /* Disabled while saving, so a double click cannot send two requests. */
      disabled={saving || outOfStock}
    >
      {label()}
    </button>
  );
};

export default AddToCartButton;
