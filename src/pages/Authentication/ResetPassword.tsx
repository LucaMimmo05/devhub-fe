import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { resendResetCode, resetPassword, verifyResetCode } from "@/services/authService";
import { AuthHeader, Field, FormError, PasswordInput, PasswordMeter, StepIndicator, SubmitButton } from "@/components/auth/authParts";
import OtpInput from "@/components/auth/OtpInput";
import ResendCode from "@/components/auth/ResendCode";
import { OTP_LENGTH, PASSWORD_MIN, RESET_STEPS, friendlyAuthError } from "@/components/auth/authRules";
import { apiErrorMessage } from "@/utils/githubAuth";

type Step = "code" | "password";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const [step, setStep] = useState<Step>("code");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reached without going through "Forgot password" (e.g. a reload): start over there.
  if (!email) return <Navigate to="/auth/forgot-password" replace />;

  const checkCode = async (code: string) => {
    if (code.length < OTP_LENGTH || loading) return;
    setLoading(true);
    setError(null);
    try {
      await verifyResetCode(email, code);
      setStep("password");
    } catch (err) {
      setError(friendlyAuthError(apiErrorMessage(err, "That code is wrong or has expired.")));
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const mismatch = confirm.length > 0 && confirm !== password;
  const canSave = password.length >= PASSWORD_MIN && confirm === password;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmTouched(true);
    if (!canSave) return;
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email, otp, password);
      toast.success("Password updated. Sign in with your new password.");
      navigate("/auth/login", { replace: true, state: { email } });
    } catch (err) {
      // Most likely the code expired between the two steps: ask for a fresh one.
      setError(friendlyAuthError(apiErrorMessage(err, "That code is no longer valid. Request a new one.")));
      setOtp("");
      setStep("code");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <StepIndicator steps={RESET_STEPS} current={step === "code" ? 1 : 2} />

      {step === "code" ? (
        <>
          <AuthHeader
            icon={<MailCheck className="h-5 w-5" />}
            title="Enter the code"
            description={
              <>
                We sent a 6‑digit code to <span className="font-medium text-foreground">{email}</span>.
              </>
            }
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkCode(otp);
            }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-3">
              <OtpInput
                value={otp}
                onChange={(v) => { setOtp(v); setError(null); }}
                onComplete={checkCode}
                length={OTP_LENGTH}
                invalid={!!error}
                disabled={loading}
                autoFocus
              />
              {error && <FormError>{error}</FormError>}
              <ResendCode onResend={() => resendResetCode(email)} />
            </div>
            <SubmitButton loading={loading} disabled={otp.length < OTP_LENGTH}>Continue</SubmitButton>
          </form>
          <Link
            to="/auth/forgot-password"
            state={{ email }}
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Use a different email
          </Link>
        </>
      ) : (
        <>
          <AuthHeader
            icon={<LockKeyhole className="h-5 w-5" />}
            title="Choose a new password"
            description={<>For <span className="font-medium text-foreground">{email}</span>. You'll use it to sign in from now on.</>}
          />
          <form onSubmit={save} noValidate className="flex flex-col gap-4">
            {error && <FormError>{error}</FormError>}
            <Field id="new-password" label="New password">
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                autoFocus
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordMeter password={password} min={PASSWORD_MIN} />
            </Field>
            <Field id="confirm-password" label="Confirm password" error={(confirmTouched || confirm.length >= password.length) && mismatch ? "Passwords don't match." : null}>
              <PasswordInput
                id="confirm-password"
                autoComplete="new-password"
                placeholder="Type it again"
                value={confirm}
                invalid={confirmTouched && mismatch}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => confirm && setConfirmTouched(true)}
              />
            </Field>
            <div className="pt-1">
              <SubmitButton loading={loading} disabled={!canSave}>Update password</SubmitButton>
            </div>
          </form>
          <button
            type="button"
            onClick={() => { setStep("code"); setError(null); }}
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to the code
          </button>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
