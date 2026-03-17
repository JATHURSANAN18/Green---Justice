import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicReport from "./pages/PublicReport";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/report" element={<PublicReport />} />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <AuthorityDashboard />
      </ProtectedRoute>
    }
  />

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
      </div>
    </Router>
  );
}

export default App;