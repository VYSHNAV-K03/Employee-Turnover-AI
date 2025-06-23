import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  useEffect(() => {
    if (userEmail) {
      fetchNotifications();
      setTimeout(() => {
        markAllAsRead(); // Auto mark as read
        fetchNotifications();
      }, 4000);
    }
  }, [userEmail]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:7000/api/notifications/${userEmail}`
      );
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `http://localhost:7000/api/notifications/mark-read/${userEmail}`
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Notifications</h2>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="alert alert-info text-center">
          No notifications found.
        </div>
      ) : (
        <div className="row g-3">
          {notifications.map((notification) => (
            <div className="col-md-6 col-lg-4" key={notification._id}>
              <div
                className={`card shadow-sm border-0 ${
                  notification.read ? "bg-light" : "bg-warning"
                }`}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <h6 className="mb-0">
                      {notification.read ? (
                        <span className="badge bg-secondary">Read</span>
                      ) : (
                        <span className="badge bg-primary">Unread</span>
                      )}
                    </h6>
                    <small className="text-muted">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <p className="card-text">{notification.emailContent}</p>
                  <div className="text-end">
                    <button
                      className={`btn btn-sm ${
                        notification.read
                          ? "btn-outline-secondary"
                          : "btn-primary"
                      }`}
                      disabled={notification.read}
                      onClick={() => markAllAsRead()}
                    >
                      {notification.read ? "Already Read" : "Mark as Read"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;
