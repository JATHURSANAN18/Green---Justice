import axios from "axios";

// Create axios instance with base URL
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Your backend URL
});

// Add token to requests if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth endpoints
export const login = (credentials) => API.post("/authorities/login", credentials);
export const register = (userData) => API.post("/authorities/register", userData);

// Report endpoints
export const getReports = () => API.get("/authorities/complaints");
export const getReportById = (id) => API.get(`/complaints/${id}/status`);
export const createReport = (data) => API.post("/complaints", data);
export const updateReport = (id, data) => API.patch(`/complaints/${id}/status`, data);
export const deleteReport = (id) => API.delete(`/authorities/complaints/${id}`);

export default API;
