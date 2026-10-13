import { useState } from "react";
import { notifyWishlistChanged, toggleWishlist } from "../services/api";

// Shared by the product card and the product details page.
// It owns only its own request state: whether this product is saved, and
// whether a request is in flight.
const WishlistButton = ({ productId, saved, onChange, block = false }) => {
  const [status, setStatus] = useState("idle"); // idle | saving | error
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    // Guard against a second click while the first request is still running.
    if (status === "saving") return;

    try {
      setStatus("saving");
      setMessage("");
      const res = await toggleWishlist(productId);
      // Report the new value upward; the parent owns the saved state.
      onChange(productId, res.data.saved);
      notifyWishlistChanged();
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Unable to save product. Please try again.");
    }
  };

  const label = () => {
    if (status === "saving") return "Saving...";
    return saved ? "\u2665 Remove from Wishlist" : "\u2661 Add to Wishlist";
  };

  return (
    <>
      <button
        type="button"
        className={`wishlist-btn${saved ? " saved" : ""}${block ? " block" : ""}`}
        onClick={handleClick}
        disabled={status === "saving"}
      >
        {label()}
      </button>
      {status === "error" && <span className="wishlist-error">{message}</span>}
    </>
  );
};

export default WishlistButton;
