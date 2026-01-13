import axios from "axios";
import { API_URL } from ".";

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const login = async (email: string, password: string) => {
  const response = await authApi.post(`/auth/login`, { email, password });
  return response.data;
};

export const refresh = async () => {
  const response = await authApi.post(`/auth/refresh`);
  return response.data;
};

export const logout = async () => {
  const response = await authApi.post(`/auth/logout`);
  return response.data;
};
