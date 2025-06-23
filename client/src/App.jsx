import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import AdminPanel from "./pages/Admin";
import DoctorPanel from "./pages/DoctorPanel";
import Profile from "./pages/Profile";
import AttritionExplainer from "./pages/Dashboard";
import UploadEmp from "./pages/UploadEmp";
import EmployeeList from "./pages/EmployeeList";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "animate.css";
import Notification from "./pages/Notification";

const App = () => {
  return (
    <Router>
      <div className="bg-custom vh-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<AttritionExplainer />} />
          <Route path="/dashboard_hr" element={<UploadEmp />} />
          <Route path="/attrition_emp" element={<EmployeeList />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
