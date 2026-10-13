import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import {
  getMe,
  getWishlist,
  notifyWishlistChanged,
  removeFromWishlist,
} from "../services/api";

const Wishlist = () => {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");

  useEffect(() => {
    getMe()
      .then((res) => setCustomer(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // useCallback keeps the same function reference between renders, so the
  // effect below does not re-run on every render and the Try Again button can
  // reuse exactly the same request.
  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getWishlist();
      setItems(res.data.wishlist);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      await removeFromWishlist(productId);
      // Update the list in place instead of refetching the whole page.
      setItems((current) => current.filter((item) => item._id !== productId));
      notifyWishlistChanged();
    } catch {
      setError("Unable to remove that product. Please try again.");
    } finally {
      setRemovingId("");
    }
  };

  return (
    <>
      <Navbar customerName={customer ? customer.fullName.split(" ")[0] : ""} />

      <main className="page">
        <header className="page-head">
          <h1>My Wishlist</h1>
          <p>
            {loading
              ? "Loading your saved products..."
              : `${items.length} ${items.length === 1 ? "product" : "products"} saved`}
          </p>
        </header>

        {loading && <p className="state">Loading your wishlist...</p>}

        {!loading && error && (
          <div className="state error-state">
            <p>Something went wrong.</p>
            <p>{error}</p>
            <button className="retry-btn" onClick={loadWishlist}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="state empty-state">
            <div className="empty-icon">&#10084;</div>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <Link className="cta" to="/products">
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="product-grid">
            {items.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
                removing={removingId === product._id}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default Wishlist;
