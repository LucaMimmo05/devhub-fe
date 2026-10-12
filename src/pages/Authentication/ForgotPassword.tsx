import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { sendPasswordCode } from "@/services/authService";
import { AuthHeader, Field, FormError, StepIndicator, SubmitButton, TextInput } from "@/components/auth/authParts";
import { isEmail, RESET_STEPS, friendlyAuthError } from "@/components/auth/authRules";
import { apiErrorMessage } from "@/utils/githubAuth";


const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const invalid = touched && !isEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isEmail(email)) return;
    setLoading(true);
    setError(null);
    try {
      await sendPasswordCode(email.trim());
      navigate("/auth/reset-password", { state: { email: email.trim() } });
    } catch (err) {
      setError(friendlyAuthError(apiErrorMessage(err, "Couldn't send the code. Please try again.")));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <StepIndicator steps={RESET_STEPS} current={0} />
      <AuthHeader
        icon={<KeyRound className="h-5 w-5" />}
        title="Reset your password"
        description="Enter your account's email and we'll send you a 6‑digit code to set a new password."
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <FormError>{error}</FormError>}
        <Field id="email" label="Email" error={invalid ? "Enter a valid email address." : null}>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            value={email}
            invalid={invalid}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            onBlur={() => email && setTouched(true)}
          />
        </Field>
        <div className="pt-1">
          <SubmitButton loading={loading} disabled={!email}>Send code</SubmitButton>
        </div>
      </form>

      <Link
        to="/auth/login"
        state={{ email }}
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </div>
  );
};

export default ForgotPassword;
