import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { verifyEmail, resendVerificationEmail } from "@/services/authService";
import { AuthFooterLink, AuthHeader, Field, FormError, StepIndicator, SubmitButton, TextInput } from "@/components/auth/authParts";
import OtpInput from "@/components/auth/OtpInput";
import ResendCode from "@/components/auth/ResendCode";
import { isEmail, OTP_LENGTH, friendlyAuthError } from "@/components/auth/authRules";
import { apiErrorMessage } from "@/utils/githubAuth";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email ?? "";
  // After a reload the router state is gone: ask for the address instead of failing silently.
  const [email, setEmail] = useState(stateEmail);
  const [editingEmail, setEditingEmail] = useState(!stateEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (code: string) => {
    if (!isEmail(email) || code.length < OTP_LENGTH || loading) return;
    setLoading(true);
    setError(null);
    try {
      await verifyEmail(email.trim(), code);
      toast.success("Email verified. Sign in to get started.");
      navigate("/auth/login", { replace: true, state: { email: email.trim() } });
    } catch (err) {
      setError(friendlyAuthError(apiErrorMessage(err, "That code is wrong or has expired.")));
      setOtp("");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <StepIndicator steps={["Account", "Verify email"]} current={1} />
      <AuthHeader
        icon={<MailCheck className="h-5 w-5" />}
        title="Check your inbox"
        description={
          editingEmail ? (
            "Enter the email you signed up with and the 6‑digit code we sent there."
          ) : (
            <>
              We sent a 6‑digit code to <span className="font-medium text-foreground">{email}</span>.{" "}
              <button type="button" onClick={() => setEditingEmail(true)} className="font-medium text-primary underline-offset-4 hover:underline">
                Wrong address?
              </button>
            </>
          )
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify(otp);
        }}
        noValidate
        className="flex flex-col gap-5"
      >
        {editingEmail && (
          <Field id="email" label="Email">
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        )}

        <div className="flex flex-col gap-3">
          <OtpInput
            value={otp}
            onChange={(v) => { setOtp(v); setError(null); }}
            onComplete={verify}
            length={OTP_LENGTH}
            invalid={!!error}
            disabled={loading}
            autoFocus={!editingEmail}
          />
          {error && <FormError>{error}</FormError>}
          {isEmail(email) && <ResendCode onResend={() => resendVerificationEmail(email.trim())} />}
        </div>

        <SubmitButton loading={loading} disabled={!isEmail(email) || otp.length < OTP_LENGTH}>Verify email</SubmitButton>
      </form>

      <p className="text-center text-xs text-muted-foreground">Can't find it? Check spam, or wait a minute — emails can take a moment.</p>
      <AuthFooterLink text="Already verified?" linkText="Sign in" to="/auth/login" state={{ email }} />
    </div>
  );
};

export default VerifyEmail;
