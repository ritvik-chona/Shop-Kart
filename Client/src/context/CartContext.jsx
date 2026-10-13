import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import {
  addToCartApi,
  getCart,
  removeFromCartApi,
  updateCartQuantityApi,
} from "../services/api";

// A Context is a value made available to every component below the provider,
// without passing it down through props at each level.
const CartContext = createContext(null);

// Any component can call this instead of importing the context object itself.
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a CartProvider");
  return context;
};

// Pages that are reachable without a session. Fetching the cart there would
// always answer 401, so the first load is skipped on them.
const PUBLIC_PATHS = ["/", "/login", "/register"];

export const CartProvider = ({ children }) => {
  const { pathname } = useLocation();
  // The server's cart is mirrored here once, and every component reads this
  // one copy. There is no second fetch anywhere in the app.
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Which single product currently has a request in flight, so only that row
  // shows a pending state instead of the whole page.
  const [pendingId, setPendingId] = useState("");
  const [actionError, setActionError] = useState("");

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getCart();
      setCartItems(res.data.cart);
    } catch (err) {
      // 401 simply means nobody is logged in yet; that is not an error state.
      if (err.response?.status === 401) setCartItems([]);
      else setError("Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) {
      setLoading(false);
      return;
    }
    refreshCart();
    // Only the first landing matters: after login, Login.jsx calls
    // refreshCart() itself, and every mutation returns the updated cart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCart]);

  // Every mutation returns the updated cart from the server, so the shared
  // state is replaced with the database's version rather than being patched
  // locally and hoping the two stay equal.
  const runMutation = async (productId, request) => {
    try {
      setPendingId(productId);
      setActionError("");
      const res = await request();
      setCartItems(res.data.cart);
      return { ok: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setActionError(message);
      return { ok: false, message };
    } finally {
      setPendingId("");
    }
  };

  const addToCart = (productId) =>
    runMutation(productId, () => addToCartApi(productId));

  const updateQuantity = (productId, quantity) =>
    runMutation(productId, () => updateCartQuantityApi(productId, quantity));

  const removeFromCart = (productId) =>
    runMutation(productId, () => removeFromCartApi(productId));

  const clearCartState = () => {
    setCartItems([]);
    setActionError("");
  };

  // Derived values: recomputed from cartItems, never stored separately, so
  // they can never disagree with the cart.
  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const isInCart = useCallback(
    (productId) => cartItems.some((item) => item.product._id === productId),
    [cartItems]
  );

  const value = {
    cartItems,
    loading,
    error,
    pendingId,
    actionError,
    totalItems,
    subtotal,
    isInCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearCartState,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
