import axios from "axios";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "/api";

export const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000,
});

// Attach auth token if present
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("rustci_token");
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Normalize responses and basic error shape
http.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message || "Request failed";
    return Promise.reject({
      status,
      message,
      data: error?.response?.data,
    });
  }
);

export default http;

