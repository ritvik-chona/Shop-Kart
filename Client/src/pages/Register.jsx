import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCustomer } from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // One handler for every input: the input's name matches a key in form.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 6) next.password = "Minimum 6 characters";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone)) next.phone = "Enter a 10 digit number";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    try {
      setLoading(true);
      await registerCustomer(form);
      navigate("/login");
    } catch (error) {
      setServerError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your ShopKart account</h1>
        <p className="subtitle">Shop faster with a saved profile.</p>

        {serverError && <div className="alert">{serverError}</div>}

        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="John Doe"
        />
        {errors.fullName && <span className="error">{errors.fullName}</span>}

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="john@gmail.com"
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="At least 6 characters"
        />
        {errors.password && <span className="error">{errors.password}</span>}

        <label>Phone Number</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="9876543210"
        />
        {errors.phone && <span className="error">{errors.phone}</span>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
