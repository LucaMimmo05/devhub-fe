import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, ShieldCheck, KeyRound, Mail } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/services";

type Step = "otp" | "password";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? "";

  const [step, setStep] = useState<Step>("otp");
  const [email] = useState(prefillEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-reset-otp`, { email, otp });
      setStep("password");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Invalid or expired code.";
      toast.error(msg);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
      toast.success("Password reset! You can now log in.");
      navigate("/auth/login", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Invalid or expired code.";
      toast.error(msg);
      // Se il codice era sbagliato, torniamo allo step OTP
      setOtp("");
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await axios.post(`${API_URL}/auth/resend-reset-otp`, { email });
      toast.success("A new code has been sent to your email.");
    } catch {
      toast.error("Failed to resend the code. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Step 1 — OTP */}
        {step === "otp" && (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-primary/10 rounded-full p-3">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code we sent to{" "}
                <span className="font-medium text-foreground">{email || "your email"}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp">Reset code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-lg tracking-widest"
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={loading || otp.length < 6}>
                {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Continue
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-primary underline underline-offset-4 disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend"}
              </button>
            </div>

            <Link
              to="/auth/forgot-password"
              className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Use a different email
            </Link>
          </>
        )}

        {/* Step 2 — New password */}
        {step === "password" && (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-primary/10 rounded-full p-3">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Create new password</h1>
              <p className="text-sm text-muted-foreground">
                Choose a strong password for your account.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                />
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p className="text-xs text-destructive">Password must be at least 6 characters.</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={
                    confirmPassword.length > 0 && confirmPassword !== newPassword
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={
                  loading ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword.length < 6 ||
                  newPassword !== confirmPassword
                }
              >
                {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Reset password
              </Button>
            </form>

            <button
              type="button"
              onClick={() => setStep("otp")}
              className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to code
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
