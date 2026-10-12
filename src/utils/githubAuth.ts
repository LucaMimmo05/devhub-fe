import { getGithubConnectUrl } from "@/services/githubService";
import { getGithubLoginUrl } from "@/services/authService";

const RETURN_KEY = "devhub.github.returnTo";

const store = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the callback falls back to the GitHub page.
  }
};

/** Sends the signed-in user to GitHub to link their account, then back to `returnTo`. */
export const startGithubConnect = async (returnTo = window.location.pathname) => {
  store(RETURN_KEY, returnTo);
  window.location.assign(await getGithubConnectUrl());
};

/** "Sign in with GitHub" from the login/register pages. */
export const startGithubLogin = async () => {
  window.location.assign(await getGithubLoginUrl());
};

export const takeGithubReturnTo = (fallback: string) => {
  try {
    const value = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
    return value && value.startsWith("/") ? value : fallback;
  } catch {
    return fallback;
  }
};

/** The API puts a human-readable reason in `message`. */
export const apiErrorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
