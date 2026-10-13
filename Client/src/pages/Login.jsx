import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

const Login = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      // The JWT arrives as an HttpOnly cookie; React never touches it.
      await loginCustomer(form);
      // The provider mounted before anyone was logged in, so load this
      // customer's cart now that a session exists.
      await refreshCart();
      navigate("/home");
    } catch (err) {
      if (err.response?.status === 401) setError("Invalid Credentials");
      else setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="subtitle">Login to continue shopping.</p>

        {error && <div className="alert">{error}</div>}

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="john@gmail.com"
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Your password"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="switch">
          New to ShopKart? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
