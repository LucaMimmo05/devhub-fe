import axios from "axios";
import { API_URL } from ".";

export const authApi = axios.create({
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

// Password change reuses the reset flow: a 6-digit code is emailed, then exchanged for the new password.
export const sendPasswordCode = async (email: string) => {
  await authApi.post(`/auth/forgot-password`, { email });
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  await authApi.post(`/auth/reset-password`, { email, otp, newPassword });
};

// "Sign in with GitHub": public, returns the same session payload as /auth/login.
export const getGithubLoginUrl = async (): Promise<string> => (await authApi.get(`/auth/github/url`)).data.url;

export const loginWithGithub = async (code: string, state: string) => {
  const response = await authApi.post(`/auth/github`, { code, state });
  return response.data;
};
