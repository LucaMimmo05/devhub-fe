import { forwardRef, useState } from "react";
import { Link } from "react-router-dom";
import { SiGithub } from "react-icons/si";
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiErrorMessage, startGithubLogin } from "@/utils/githubAuth";
import { passwordStrength } from "./authRules";
import { cn } from "@/lib/utils";

export const AuthHeader = ({ icon, title, description }: { icon?: React.ReactNode; title: string; description?: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    {icon && (
      <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm">
        {icon}
      </span>
    )}
    <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h1>
    {description && <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>}
  </div>
);

const inputClass =
  "h-11 w-full rounded-lg border border-input bg-card/40 px-3.5 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-primary/60 focus-visible:ring-3 focus-visible:ring-primary/15 aria-[invalid=true]:border-destructive/70 aria-[invalid=true]:focus-visible:ring-destructive/15 disabled:opacity-60";

type FieldProps = {
  id: string;
  label: string;
  /** Right side of the label row, e.g. a "Forgot password?" link. */
  aside?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
};

export const Field = ({ id, label, aside, hint, error, children }: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between gap-2">
      <label htmlFor={id} className="text-[13px] font-medium">{label}</label>
      {aside}
    </div>
    {children}
    {error ? (
      <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
      </p>
    ) : (
      hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>
    )}
  </div>
);

export const TextInput = forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => (
    <input ref={ref} aria-invalid={invalid || undefined} className={cn(inputClass, className)} {...props} />
  )
);
TextInput.displayName = "TextInput";

export const PasswordInput = forwardRef<HTMLInputElement, Omit<React.ComponentProps<"input">, "type"> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          aria-invalid={invalid || undefined}
          className={cn(inputClass, "pr-11", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

const STRENGTH_COLORS = ["", "bg-red-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-400"];

/** Four-segment meter plus the minimum-length rule, shown under a new-password field. */
export const PasswordMeter = ({ password, min, invalid }: { password: string; min: number; invalid?: boolean }) => {
  const { score, label } = passwordStrength(password);
  const longEnough = password.length >= min;
  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <div className={cn("flex gap-1 transition-opacity", !password && "opacity-0")}>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full bg-muted transition-colors duration-300", password && i <= score && STRENGTH_COLORS[score])} />
        ))}
      </div>
      <p className="flex items-center justify-between text-xs text-muted-foreground">
        <span className={cn("flex items-center gap-1 transition-colors", longEnough ? "text-emerald-400" : invalid && "text-destructive")}>
          {invalid && !longEnough ? <AlertCircle className="h-3 w-3" /> : <Check className={cn("h-3 w-3", !longEnough && "opacity-40")} />}
          At least {min} characters
        </span>
        {password && <span>{label}</span>}
      </p>
    </div>
  );
};

/** Error banner at the top of a form: wrong credentials, expired code… */
export const FormError = ({ children }: { children: React.ReactNode }) => (
  <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
    <div className="min-w-0">{children}</div>
  </div>
);

export const SubmitButton = ({ loading, children, disabled, ...props }: React.ComponentProps<"button"> & { loading?: boolean }) => (
  <button
    type="submit"
    disabled={disabled || loading}
    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
    {...props}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

/** Signs in with GitHub, or creates an account already connected to it. */
export const GithubAuthButton = ({ label }: { label: string }) => {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await startGithubLogin();
        } catch (err) {
          setBusy(false);
          toast.error(apiErrorMessage(err, "GitHub sign-in isn't available right now."));
        }
      }}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-card/60 text-sm font-medium transition-all hover:border-foreground/20 hover:bg-card active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SiGithub className="h-4 w-4" />}
      {label}
    </button>
  );
};

export const OrDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 text-xs text-muted-foreground">
    <span className="h-px flex-1 bg-border" />
    {label}
    <span className="h-px flex-1 bg-border" />
  </div>
);

/** "1 Email — 2 Code — 3 Password" for multi-page flows. */
export const StepIndicator = ({ steps, current }: { steps: string[]; current: number }) => (
  <ol className="flex items-center gap-2 text-xs" aria-label={`Step ${current + 1} of ${steps.length}`}>
    {steps.map((s, i) => (
      <li key={s} className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums transition-colors",
            i < current ? "bg-primary/15 text-primary" : i === current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {i < current ? <Check className="h-3 w-3" /> : i + 1}
        </span>
        <span className={cn(i === current ? "font-medium text-foreground" : "text-muted-foreground")}>{s}</span>
        {i < steps.length - 1 && <span className="h-px w-5 bg-border" aria-hidden />}
      </li>
    ))}
  </ol>
);

export const AuthFooterLink = ({ text, to, linkText, state }: { text: string; to: string; linkText: string; state?: unknown }) => (
  <p className="text-center text-sm text-muted-foreground">
    {text}{" "}
    <Link to={to} state={state} className="font-medium text-primary underline-offset-4 hover:underline">
      {linkText}
    </Link>
  </p>
);
