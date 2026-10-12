import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/utils/githubAuth";
import { formatSeconds, OTP_TTL_SECONDS, RESEND_COOLDOWN_SECONDS } from "./authRules";

/**
 * "Code expires in 4:12 · Resend in 0:24": counts down the code's lifetime and gates the resend
 * link behind a short cooldown, restarting both after a resend.
 */
const ResendCode = ({ onResend }: { onResend: () => Promise<unknown> }) => {
  const [sentAt, setSentAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsed = Math.floor((now - sentAt) / 1000);
  const expiresIn = Math.max(0, OTP_TTL_SECONDS - elapsed);
  const cooldown = Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed);

  const resend = async () => {
    setBusy(true);
    try {
      await onResend();
      setSentAt(Date.now());
      setNow(Date.now());
      toast.success("We sent you a new code.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't send a new code. Try again in a moment."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="tabular-nums" aria-live="off">
        {expiresIn > 0 ? (
          <>Code expires in <span className="font-medium text-foreground">{formatSeconds(expiresIn)}</span></>
        ) : (
          <span className="text-amber-400">This code has expired — request a new one.</span>
        )}
      </span>
      <button
        type="button"
        onClick={resend}
        disabled={busy || cooldown > 0}
        className="flex items-center gap-1.5 font-medium text-primary underline-offset-4 transition-colors hover:underline disabled:pointer-events-none disabled:text-muted-foreground"
      >
        {busy && <Loader2 className="h-3 w-3 animate-spin" />}
        {cooldown > 0 ? <span className="tabular-nums">Resend in {formatSeconds(cooldown)}</span> : "Send a new code"}
      </button>
    </div>
  );
};

export default ResendCode;
