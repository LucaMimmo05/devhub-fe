import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { verifyEmail, resendVerificationEmail } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !email) return;
    setLoading(true);
    try {
      await verifyEmail(email, otp.trim());
      toast.success("Email verified! You can now log in.");
      navigate("/auth/login", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Invalid or expired code. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await resendVerificationEmail(email);
      toast.success("Verification code resent!");
    } catch {
      toast.error("Failed to resend code. Try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-primary/10 rounded-full p-3">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email || "your email"}</span>.
            Enter it below to activate your account.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="otp">Verification code</Label>
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

          <Button type="submit" disabled={loading || otp.length < 4}>
            {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            Verify Email
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
      </div>
    </div>
  );
};

export default VerifyEmail;
