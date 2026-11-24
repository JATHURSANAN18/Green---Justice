import axios from "axios";

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
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
export const getReports = (district) => 
  API.get("/authorities/complaints", { params: { district } });
export const getReportById = (id) => API.get(`/complaints/${id}/status`);
export const createReport = (data) => API.post("/complaints", data);
export const updateReport = (id, data) => API.post(`/complaints/${id}/status`, data);
export const deleteReport = (id) => API.post(`/authorities/complaints/${id}/delete`);

export default API;
