/** Mirrors the backend's RegisterRequest / ResetPasswordRequest validation. */
export const PASSWORD_MIN = 8;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
/** users.email and user_profiles.first_name are varchar(100). */
export const EMAIL_MAX = 100;
export const FULL_NAME_MAX = 100;
export const OTP_LENGTH = 6;
/** OTPs expire after 5 minutes on the backend (OtpService.OTP_EXPIRATION). */
export const OTP_TTL_SECONDS = 5 * 60;
export const RESEND_COOLDOWN_SECONDS = 30;

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const usernameError = (v: string) => {
  const u = v.trim();
  if (!u) return null;
  if (u.length < USERNAME_MIN) return `At least ${USERNAME_MIN} characters.`;
  if (u.length > USERNAME_MAX) return `At most ${USERNAME_MAX} characters.`;
  if (!/^[a-zA-Z0-9_-]+$/.test(u)) return "Letters, numbers, - and _ only.";
  return null;
};

export type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string };

/** Rough strength: length plus variety. Only advisory; the backend enforces the minimum length. */
export const passwordStrength = (p: string): Strength => {
  if (!p) return { score: 0, label: "" };
  let score = 0;
  if (p.length >= PASSWORD_MIN) score++;
  if (p.length >= 12) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p) && /[^a-zA-Z0-9]/.test(p)) score++;
  if (p.length < PASSWORD_MIN) score = Math.min(score, 1);
  const s = Math.max(1, score) as Strength["score"];
  return { score: s, label: ["", "Too weak", "Okay", "Good", "Strong"][s] };
};

export const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Forgot-password flow, spread over /auth/forgot-password and /auth/reset-password. */
export const RESET_STEPS = ["Email", "Code", "New password"];

// Backend messages → what the user should read. Unknown messages pass through unchanged.
const FRIENDLY: [RegExp, string][] = [
  [/^(invalid credentials|user not found)$/i, "Wrong email or password."],
  [/invalid otp|invalid or expired/i, "That code is wrong or has expired. Check your latest email, or send a new code."],
  [/no account found/i, "There's no DevHub account with that email."],
  [/email does not exist/i, "There's no DevHub account with that email."],
  [/email already exists/i, "An account with this email already exists. Sign in instead?"],
  [/username already exists/i, "That username is taken. Try another one."],
  [/^otp_locked$/i, "Too many wrong codes, so this one no longer works. Send a new code."],
  [/^too_many_attempts$/i, "Too many attempts. Wait a few minutes and try again."],
];

export const friendlyAuthError = (message: string) => FRIENDLY.find(([re]) => re.test(message))?.[1] ?? message;
