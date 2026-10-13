import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import {
  getCategories,
  getMe,
  getProducts,
  getWishlistIds,
} from "../services/api";

const Products = () => {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  // A Set gives an O(1) "is this product saved?" check while rendering.
  const [savedIds, setSavedIds] = useState(new Set());

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // The page is protected in the same way as Home: ask the server who we are.
  useEffect(() => {
    getMe()
      .then((res) => setCustomer(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // The category list comes from the database, so it stays correct as the
  // catalogue grows.
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.categories))
      .catch(() => setCategories([]));
  }, []);

  // Only the ids are fetched, which is enough to decide each heart icon.
  useEffect(() => {
    getWishlistIds()
      .then((res) => setSavedIds(new Set(res.data.ids)))
      .catch(() => setSavedIds(new Set()));
  }, []);

  // Refetch whenever a filter changes. The 400 ms timer is a debounce: typing
  // "phone" fires one request instead of five.
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getProducts({ search, category, sort });
        setProducts(res.data.products);
      } catch {
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    }, 400);

    // Cleanup cancels the previous timer on every keystroke.
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  // Called by a card after the server confirms the change, so the UI follows
  // the database rather than guessing.
  const handleWishlistChange = (productId, saved) => {
    setSavedIds((current) => {
      const next = new Set(current);
      if (saved) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  return (
    <>
      <Navbar customerName={customer ? customer.fullName.split(" ")[0] : ""} />

      <main className="page">
        <header className="page-head">
          <h1>Products</h1>
          <p>Browse the ShopKart catalogue.</p>
        </header>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
          categories={categories}
        />

        {loading && <p className="state">Loading products...</p>}

        {!loading && error && <p className="state error-state">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="state">No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <p className="result-count">{products.length} products found</p>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  saved={savedIds.has(product._id)}
                  onWishlistChange={handleWishlistChange}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default Products;
