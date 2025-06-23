import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaBell } from "react-icons/fa"; // Import Font Awesome Icon

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (user?.email) {
      fetchUnreadNotifications();
    }
  }, [user]);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:7000/api/notifications/unread/${user.email}`
      );
      const count = response.data.unreadCount;
      setUnreadCount(count);

      if (count > 0) {
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          EmployeeTurnover
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            {isLoggedIn ? (
              <>
                {user.role === "admin" ? (
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <>
                    {/* Notification Icon with Badge */}
                    <li className="nav-item position-relative">
                      <Link className="nav-link" to="/notification">
                        <FaBell size={20} className="me-2" />
                        {unreadCount > 0 && (
                          <span className="badge bg-danger position-absolute top-2  translate-middle">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" to="/dashboard_hr">
                        Dashboard
                      </Link>
                    </li>
                  </>
                )}

                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Popup Notification */}
      {showPopup && (
        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 1050 }}
        >
          <div className="toast show bg-warning text-dark">
            <div className="toast-body">
              You have unread notifications. Check Notifications.
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
