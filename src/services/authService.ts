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

export const register = async (fullName: string, username: string, email: string, password: string) => {
  const response = await authApi.post(`/auth/register`, { fullName, username, email, password });
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

export const verifyEmail = async (email: string, otp: string) => {
  const response = await authApi.post(`/email/verify`, { email, otp });
  return response.data;
};

export const resendVerificationEmail = async (email: string) => {
  const response = await authApi.post(`/email/resend`, { email });
  return response.data;
};
