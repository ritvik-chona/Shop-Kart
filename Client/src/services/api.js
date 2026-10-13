import axios from "axios";

// One shared axios instance so every request carries the same base URL
// and sends/accepts cookies.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:6769",
  withCredentials: true,
});

// Customer / authentication
export const registerCustomer = (data) => api.post("/customers/register", data);
export const loginCustomer = (data) => api.post("/customers/login", data);
export const getMe = () => api.get("/customers/me");
export const logoutCustomer = () => api.post("/customers/logout");

// Products
// axios turns the params object into ?search=...&category=... and skips
// any key whose value is undefined.
export const getProducts = ({ search, category, sort } = {}) =>
  api.get("/products", {
    params: {
      search: search || undefined,
      category: category || undefined,
      sort: sort || undefined,
    },
  });

export const getProductById = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get("/products/categories/list");

// Wishlist (all of these require a valid session cookie)
export const getWishlist = () => api.get("/wishlist");
export const getWishlistIds = () => api.get("/wishlist/ids");
export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);
export const toggleWishlist = (productId) => api.patch(`/wishlist/${productId}/toggle`);

// Cart
export const getCart = () => api.get("/cart");
export const addToCartApi = (productId) => api.post(`/cart/${productId}`);
export const updateCartQuantityApi = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });
export const removeFromCartApi = (productId) => api.delete(`/cart/${productId}`);

// Orders and payment
export const createPaymentOrder = (shippingAddress) =>
  api.post("/orders/create-payment-order", { shippingAddress });
export const verifyPayment = (payload) => api.post("/orders/verify-payment", payload);
export const markPaymentFailed = (orderId) =>
  api.post(`/orders/${orderId}/payment-failed`);
export const getOrders = () => api.get("/orders");
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);
export const advanceOrderStatus = (orderId) => api.patch(`/orders/${orderId}/status`);

// The navbar badge has no parent in common with the pages that change the
// wishlist, so a browser event is used to tell it to refresh its count.
export const WISHLIST_CHANGED = "wishlist-changed";
export const notifyWishlistChanged = () =>
  window.dispatchEvent(new Event(WISHLIST_CHANGED));

export default api;
