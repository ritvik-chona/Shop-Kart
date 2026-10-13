import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMe } from "../services/api";

const Home = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ask the server who we are. A 401 means the cookie is missing or invalid.
    const fetchCustomer = async () => {
      try {
        const res = await getMe();
        setCustomer(res.data);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [navigate]);

  if (loading) return <div className="loader">Loading...</div>;
  if (!customer) return null;

  return (
    <>
      <Navbar customerName={customer.fullName.split(" ")[0]} />

      <main className="page">
        <section className="hero">
          <h1>Welcome back, {customer.fullName}</h1>
          <p>Your ShopKart account is active.</p>
          <Link className="cta" to="/products">
            Start Shopping
          </Link>
        </section>

        <section className="profile-card">
          <h2>Your Details</h2>
          <div className="row">
            <span>Name</span>
            <strong>{customer.fullName}</strong>
          </div>
          <div className="row">
            <span>Email</span>
            <strong>{customer.email}</strong>
          </div>
          <div className="row">
            <span>Phone</span>
            <strong>{customer.phone}</strong>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
