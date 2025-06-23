import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Analytics from "../components/Analytics";
import axiosInstance from "../axiosInstance";
import { FaSpinner } from "react-icons/fa"; // For spinner icon

const AdminPanel = () => {
  const [organisers, setOrganisers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setloading] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrganisers = async () => {
      try {
        const response = await axiosInstance.get("/admin/organisers");
        setOrganisers(response.data.reverse());
      } catch (err) {
        setError("Failed to fetch users");
      }
    };
    fetchOrganisers();
  }, []);

  const handleToggleVerification = async (id, isVerified) => {
    setloading(id);
    try {
      await axiosInstance.patch(`/admin/organisers/${id}/verify`);
      setSuccess(`User ${isVerified ? "unverified" : "verified"} successfully`);

      setOrganisers(
        organisers.map((org) =>
          org._id === id ? { ...org, isVerified: !org.isVerified } : org
        )
      );
      setloading(null);
    } catch (err) {
      setloading(null);
      setError(`Failed to ${isVerified ? "unverify" : "verify"} user`);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Admin Panel</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Business Analytics Section */}
      <Analytics organisers={organisers} />

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {organisers.map((org) => (
            <tr key={org._id}>
              <td>{org.username}</td>
              <td>{org.email}</td>
              <td>{org.isVerified ? "Verified" : "Unverified"}</td>
              <td>
                <button
                  className={`btn ${
                    loading === org._id
                      ? "btn-secondary"
                      : org.isVerified
                      ? "btn-danger"
                      : "btn-success"
                  }`}
                  onClick={() =>
                    handleToggleVerification(org._id, org.isVerified)
                  }
                  disabled={loading === org._id} // Disable only the clicked button while loading
                >
                  {loading === org._id ? (
                    <FaSpinner className="spinner-border spinner-border-sm" />
                  ) : org.isVerified ? (
                    "Unverify"
                  ) : (
                    "Verify"
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
