import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AuthFooterLink,
  AuthHeader,
  Field,
  FormError,
  GithubAuthButton,
  OrDivider,
  PasswordInput,
  PasswordMeter,
  SubmitButton,
  TextInput,
} from "@/components/auth/authParts";
import { isEmail, PASSWORD_MIN, usernameError, USERNAME_MAX, friendlyAuthError } from "@/components/auth/authRules";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/utils/githubAuth";

type Fields = "fullName" | "username" | "email" | "password";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<Fields, string>>({ fullName: "", username: "", email: "", password: "" });
  const [touched, setTouched] = useState<Partial<Record<Fields, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Uniqueness is only known server-side: show it on the field it belongs to.
  const [taken, setTaken] = useState<{ field: "email" | "username"; value: string } | null>(null);

  const errors: Record<Fields, string | null> = {
    fullName: !values.fullName.trim() ? "Tell us your name." : null,
    username: !values.username.trim() ? "Pick a username." : usernameError(values.username),
    email: !isEmail(values.email) ? "Enter a valid email address." : null,
    password: values.password.length < PASSWORD_MIN ? `Use at least ${PASSWORD_MIN} characters.` : null,
  };
  // Show a field's error once the user has left it, or after a submit attempt.
  const shown = (f: Fields) => {
    if (taken?.field === f && values[f].trim() === taken.value) {
      return f === "email" ? "This email already has an account." : "That username is taken.";
    }
    return (touched[f] && values[f]) || submitted ? errors[f] : null;
  };

  const update = (f: Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [f]: e.target.value }));
    setError(null);
  };
  const blur = (f: Fields) => () => setTouched((t) => ({ ...t, [f]: true }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    try {
      const email = values.email.trim();
      await register(values.fullName.trim(), values.username.trim(), email, values.password);
      toast.success("Account created. Check your inbox for the code.");
      navigate("/auth/verify-email", { replace: true, state: { email } });
    } catch (err) {
      const msg = apiErrorMessage(err, "Couldn't create your account. Please try again.");
      if (/email already exists/i.test(msg)) setTaken({ field: "email", value: values.email.trim() });
      else if (/username already exists/i.test(msg)) setTaken({ field: "username", value: values.username.trim() });
      else setError(friendlyAuthError(msg));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <AuthHeader title="Create your account" description="Free, and ready in under a minute." />

      <GithubAuthButton label="Sign up with GitHub" />
      <OrDivider label="or with email" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <FormError>{error}</FormError>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="fullName" label="Full name" error={shown("fullName")}>
            <TextInput
              id="fullName"
              autoComplete="name"
              autoFocus
              placeholder="Ada Lovelace"
              value={values.fullName}
              invalid={!!shown("fullName")}
              onChange={update("fullName")}
              onBlur={blur("fullName")}
            />
          </Field>
          <Field id="username" label="Username" error={shown("username")}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
              <TextInput
                id="username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={USERNAME_MAX}
                placeholder="ada"
                className="pl-7.5"
                value={values.username}
                invalid={!!shown("username")}
                onChange={update("username")}
                onBlur={blur("username")}
              />
            </div>
          </Field>
        </div>

        <Field id="email" label="Email" error={shown("email")} hint="We'll send a 6‑digit code to verify it.">
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            invalid={!!shown("email")}
            onChange={update("email")}
            onBlur={blur("email")}
          />
        </Field>

        <Field id="password" label="Password">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={values.password}
            invalid={submitted && !!errors.password}
            onChange={update("password")}
          />
          <PasswordMeter password={values.password} min={PASSWORD_MIN} invalid={submitted && !!errors.password} />
        </Field>

        <div className="pt-1">
          <SubmitButton loading={loading}>Create account</SubmitButton>
        </div>
      </form>

      <AuthFooterLink text="Already have an account?" linkText="Sign in" to="/auth/login" />
    </div>
  );
};

export default Register;
