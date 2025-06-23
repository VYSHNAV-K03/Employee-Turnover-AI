import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axiosInstance.post("/register/user", formData);
      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      setError("");
      setErrors({});
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      setMessage("");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 ">
      <div className="row w-100 shadow-lg rounded-4 overflow-hidden">
        <div className="col-lg-6 d-none d-lg-block p-0">
          <img
            src="/images/register.svg"
            alt="Register Illustration"
            className="w-100 h-100 object-fit-cover"
          />
        </div>
        <div className="col-lg-6 bg-white p-5">
          <h2 className="text-center mb-4">Register</h2>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && (
                <div className="text-danger">{errors.username}</div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <div className="text-danger">{errors.email}</div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <div className="text-danger">{errors.password}</div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                type="text"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && (
                <div className="text-danger">{errors.phone}</div>
              )}
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
