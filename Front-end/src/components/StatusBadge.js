import React from "react";
import "./StatusBadge.css";

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "resolved":
        return "status-resolved";
      default:
        return "status-default";
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status || "Unknown"}
    </span>
  );
};

export default StatusBadge;