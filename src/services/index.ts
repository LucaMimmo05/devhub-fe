import axios from "axios";

export const API_URL = "http://localhost:8080";

export const mainCallApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

mainCallApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se il server risponde 401, la sessione è scaduta → pulizia e redirect al login
mainCallApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      delete axios.defaults.headers.common["Authorization"];
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);
