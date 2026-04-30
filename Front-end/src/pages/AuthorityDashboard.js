import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ReportCard from "../components/ReportCard";
import { getReports, updateReport, deleteReport as apiDeleteReport } from "../api/index";
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

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Get logged in authority's district
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const district = user.region;
      
      const res = await getReports(district);
      const fetchedReports = res.data || [];
      const sortedReports = fetchedReports.sort((a, b) => new Date(b.report_date || b.createdAt) - new Date(a.report_date || a.createdAt));
      setReports(sortedReports);
      setError("");
    } catch (err) {
      setError("Failed to fetch reports. Please try again.");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const updateId = Number(id);
    // Keep a backup for rollback
    const previousReports = [...reports];
    
    // Optimistic Update
    setReports((prev) =>
      prev.map((report) =>
        (Number(report.complaint_id || report.id) === updateId)
          ? { ...report, status }
          : report
      )
    );

    try {
      await updateReport(id, { status });
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert("Failed to update status: " + errMsg);
      console.error("Error updating status:", err);
      // Rollback on failure
      setReports(previousReports);
    }
  };

  const deleteReport = async (id) => {
    console.log("Frontend: Requesting delete for ID:", id);
    const delId = Number(id);
    try {
      if (window.confirm("Are you sure you want to delete this report?")) {
        await apiDeleteReport(delId);
        setReports((prev) =>
          prev.filter(
            (report) => 
              Number(report.complaint_id || report.id) !== delId
          )
        );
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert("Failed to delete report: " + errMsg);
      console.error("Error deleting report:", err);
    }
  };

  const viewReportDetails = (id) => {
    const viewId = Number(id);
    const report = reports.find(
      (r) => Number(r.complaint_id || r.id) === viewId
    );
    if (report) {
      alert(`
📋 Report Details

Type: ${report.violation_type || report.categoryLabel || report.category}
Status: ${report.status}
Date: ${new Date(report.report_date || report.createdAt).toLocaleString()}
      `);
    }
  };

  const getReportId = (report) => report.complaint_id || report.id;

  const filteredReports = reports.filter((report) => {
    const matchesFilter = filter === "all" || report.status === filter;
    const searchTarget = (
      (report.violation_type || report.categoryLabel || report.category || "") +
      (report.description || "") +
      (report.locationName || "")
    ).toLowerCase();
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    approved: reports.filter((r) => r.status === "approved").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    notViewed: reports.filter((r) => r.status === "Not Viewed").length,
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
            <h3>{stats.notViewed}</h3>
            <p>Not Viewed</p>
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
            <option value="Not Viewed">Not Viewed</option>
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
                key={getReportId(report)}
                report={report}
                isAuthority={true}
                onUpdate={(id, status) => updateStatus(id, status)}
                onDelete={(id) => deleteReport(id)}
                onView={(id) => viewReportDetails(id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AuthorityDashboard;
