import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AuthFooterLink,
  AuthHeader,
  Field,
  FormError,
  GithubAuthButton,
  OrDivider,
  PasswordInput,
  SubmitButton,
  TextInput,
} from "@/components/auth/authParts";
import { isEmail, friendlyAuthError } from "@/components/auth/authRules";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/utils/githubAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Prefilled after verifying an email or resetting a password.
  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const emailError = touched && email && !isEmail(email) ? "Enter a valid email address." : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    if (!isEmail(email) || !password) return;
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = apiErrorMessage(err, "Couldn't sign you in. Please try again.");
      if (msg === "EMAIL_NOT_VERIFIED") {
        toast.info("Verify your email to finish setting up your account.");
        navigate("/auth/verify-email", { state: { email: email.trim() } });
        return;
      }
      setError(friendlyAuthError(msg));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <AuthHeader title="Welcome back" description="Sign in to pick up where you left off." />

      <GithubAuthButton label="Continue with GitHub" />
      <OrDivider label="or with email" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <FormError>{error}</FormError>}

        <Field id="email" label="Email" error={emailError}>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            autoFocus={!email}
            placeholder="you@example.com"
            value={email}
            invalid={!!emailError}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            onBlur={() => email && setTouched(true)}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          aside={
            <Link to="/auth/forgot-password" state={{ email }} className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            autoFocus={!!email}
            placeholder="Your password"
            value={password}
            invalid={!!error}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
          />
        </Field>

        <div className="pt-1">
          <SubmitButton loading={loading} disabled={!email || !password}>Sign in</SubmitButton>
        </div>
      </form>

      <AuthFooterLink text="New to DevHub?" linkText="Create an account" to="/auth/register" />
    </div>
  );
};

export default Login;
