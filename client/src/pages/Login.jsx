import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/login", formData);
      setMessage(response.data.message);
      setError("");

      if (response.data.user.role === "admin") {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/admin");
        window.location.reload();
      } else if (response.data.user.role === "doctor") {
        navigate("/doctor");
      } else {
        if (response.data.user.isVerified) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          navigate("/dashboard_hr");
          window.location.reload();
        } else {
          setMessage("Please verify your email before logging in.");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      setMessage("");
    }
  };

  return (
    <div className="container  d-flex justify-content-center align-items-center vh-100 ">
      <div className="row w-100 shadow-lg rounded-4 overflow-hidden">
        <div className="col-lg-6 d-none d-lg-block p-0">
          <img
            src="/images/login.svg"
            alt="Login Illustration"
            className="w-100 h-100 object-fit-cover"
          />
        </div>
        <div className="col-lg-6 bg-white p-5">
          <h2 className="text-center mb-4">Login</h2>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
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
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
