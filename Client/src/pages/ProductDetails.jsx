import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistButton from "../components/WishlistButton";
import AddToCartButton from "../components/AddToCartButton";
import { getMe, getProductById, getWishlistIds } from "../services/api";

const ProductDetails = () => {
  // useParams reads the ":id" segment out of the current URL.
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMe()
      .then((res) => setCustomer(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getProductById(id);
        setProduct(res.data.product);
      } catch (err) {
        if (err.response?.status === 404) setError("Product not found.");
        else if (err.response?.status === 400) setError("Invalid product link.");
        else setError("Something went wrong while loading this product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Whether this product is already saved is a server fact, so it is fetched.
  useEffect(() => {
    getWishlistIds()
      .then((res) => setSaved(res.data.ids.includes(id)))
      .catch(() => setSaved(false));
  }, [id]);

  const inStock = product && product.stock > 0;

  return (
    <>
      <Navbar customerName={customer ? customer.fullName.split(" ")[0] : ""} />

      <main className="page">
        <Link className="back-link" to="/products">
          &larr; Back to products
        </Link>

        {loading && <p className="state">Loading product...</p>}

        {!loading && error && <p className="state error-state">{error}</p>}

        {!loading && !error && product && (
          <section className="details">
            <div className="details-image">
              <img src={product.image} alt={product.name} />
            </div>

            <div className="details-body">
              <span className="product-category">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="details-price">
                &#8377;{product.price.toLocaleString("en-IN")}
              </p>
              <p className="details-description">{product.description}</p>

              <p className={inStock ? "stock in" : "stock out"}>
                {inStock ? `${product.stock} units in stock` : "Out of stock"}
              </p>

              <div className="details-actions">
                <AddToCartButton product={product} block />
                <WishlistButton
                  productId={product._id}
                  saved={saved}
                  onChange={(productId, isSaved) => setSaved(isSaved)}
                  block
                />
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default ProductDetails;
