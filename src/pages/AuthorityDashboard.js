import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ReportCard from "../components/ReportCard";
import "./AuthorityDashboard.css";

const AuthorityDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    try {
      setLoading(true);
      const storedReports = JSON.parse(localStorage.getItem("reports") || "[]");
      setReports(storedReports);
      setError("");
    } catch (err) {
      setError("Failed to fetch reports. Please try again.");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (id, status) => {
    try {
      const updatedReports = reports.map((report) =>
        report.id === id ? { ...report, status } : report
      );
      setReports(updatedReports);
      localStorage.setItem("reports", JSON.stringify(updatedReports));
    } catch (err) {
      alert("Failed to update status");
      console.error("Error updating status:", err);
    }
  };

  const deleteReport = (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this report?")) {
        const updatedReports = reports.filter((report) => report.id !== id);
        setReports(updatedReports);
        localStorage.setItem("reports", JSON.stringify(updatedReports));
      }
    } catch (err) {
      alert("Failed to delete report");
      console.error("Error deleting report:", err);
    }
  };

  const viewReportDetails = (id) => {
    const report = reports.find((r) => r.id === id);
    if (report) {
      alert(`
📋 Report Details

Category: ${report.categoryLabel || report.category}
Location: ${report.locationName}
Coordinates: ${report.latitude}, ${report.longitude}
Description: ${report.description}
Status: ${report.status}
Date: ${new Date(report.createdAt).toLocaleString()}
      `);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesFilter = filter === "all" || report.status === filter;
    const matchesSearch =
      (report.categoryLabel || report.category)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.locationName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    approved: reports.filter((r) => r.status === "approved").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Authority Dashboard</h1>

        <div className="stats-container">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>Total Reports</p>
          </div>
          <div className="stat-card pending">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
          <div className="stat-card approved">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
          <div className="stat-card resolved">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>

        <div className="filters-container">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="resolved">Resolved</option>
          </select>

          <button onClick={fetchReports} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="reports-list">
          {filteredReports.length === 0 ? (
            <div className="no-reports">
              <p>No reports found.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isAuthority={true}
                onUpdate={updateStatus}
                onDelete={deleteReport}
                onView={viewReportDetails}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AuthorityDashboard;