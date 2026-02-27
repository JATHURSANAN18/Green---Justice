import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🚨 Report System</Link>
      </div>
      
      <div className="navbar-links">
        <Link to="/">Home</Link>
        
        {/* Public Report Button - Visible to everyone */}
        <Link to="/report" className="report-link">
          🚀 Report Violation
        </Link>
        
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <span className="user-name">Welcome, {user?.name || "User"}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;