import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  WISHLIST_CHANGED,
  getWishlistIds,
  logoutCustomer,
} from "../services/api";
import { useCart } from "../context/CartContext";

const Navbar = ({ customerName }) => {
  const navigate = useNavigate();
  const [wishlistCount, setWishlistCount] = useState(0);
  // The count is read from the shared cart state, never fetched separately.
  const { totalItems, clearCartState } = useCart();

  // The count always comes from the backend, never from a local guess.
  const loadCount = useCallback(async () => {
    try {
      const res = await getWishlistIds();
      setWishlistCount(res.data.count);
    } catch {
      setWishlistCount(0);
    }
  }, []);

  useEffect(() => {
    loadCount();

    // Pages fire this event after a successful add or remove, so the badge
    // refreshes without any global state library.
    window.addEventListener(WISHLIST_CHANGED, loadCount);
    return () => window.removeEventListener(WISHLIST_CHANGED, loadCount);
  }, [loadCount]);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch {
      // The cookie may already be expired; leave the session either way.
    } finally {
      clearCartState();
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <Link className="brand" to="/home">
        ShopKart
      </Link>

      <div className="nav-links">
        {/* NavLink adds the "active" class when its route is the current one. */}
        <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")}>
          Products
        </NavLink>
        <NavLink to="/wishlist" className={({ isActive }) => (isActive ? "active" : "")}>
          Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
        </NavLink>
        <NavLink to="/cart" className={({ isActive }) => (isActive ? "active" : "")}>
          Cart{totalItems > 0 ? ` (${totalItems})` : ""}
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
          Orders
        </NavLink>
      </div>

      <div className="nav-right">
        {customerName && <span className="hello">Hi, {customerName}</span>}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
