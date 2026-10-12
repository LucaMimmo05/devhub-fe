import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Called once all digits are in, e.g. to submit right away. */
  onComplete?: (value: string) => void;
  length: number;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
};

/**
 * One box per digit. Typing moves forward, Backspace moves back, arrows navigate, and pasting
 * (or the phone's one-time-code autofill) fills every box at once.
 */
const OtpInput = ({ value, onChange, onComplete, length, invalid, disabled, autoFocus }: Props) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  // Latest value, ahead of the re-render: fast typing fires the next key before `value` updates.
  const current = useRef(value);
  useEffect(() => {
    current.current = value;
  }, [value]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  // A rejected code is cleared: put the cursor back at the start.
  useEffect(() => {
    if (invalid && !value) refs.current[0]?.focus();
  }, [invalid, value]);

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const set = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    current.current = clean;
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
    return clean;
  };

  const handleInput = (i: number, raw: string) => {
    const v = current.current;
    // An overwritten box reports old + new digit: keep only what was typed.
    const typed = raw.replace(/\D/g, "").replace(v[i] ?? "", "") || raw.replace(/\D/g, "").slice(-1);
    if (!typed) return;
    // Digits stay contiguous: typing past the end lands in the first empty box.
    const at = Math.min(i, v.length);
    // Several digits at once: paste or autofill into any box.
    if (typed.length > 1) {
      const filled = set(v.slice(0, at) + typed);
      focus(filled.length);
      return;
    }
    set(v.slice(0, at) + typed + v.slice(at + 1));
    focus(at + 1);
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const v = current.current;
    if (e.key === "Backspace") {
      e.preventDefault();
      if (v[i]) set(v.slice(0, i) + v.slice(i + 1));
      else if (i > 0) {
        set(v.slice(0, i - 1) + v.slice(i));
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focus(i + 1);
    }
  };

  return (
    <div className="flex gap-2 sm:gap-2.5" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={(e) => {
            e.preventDefault();
            handleInput(i, e.clipboardData.getData("text"));
          }}
          className={cn(
            "h-13 w-full min-w-0 rounded-lg border border-input bg-card/40 text-center font-mono text-xl font-semibold tabular-nums caret-primary outline-none transition-[border-color,box-shadow,background-color]",
            "focus:border-primary/60 focus:ring-3 focus:ring-primary/15 disabled:opacity-60",
            d && "border-foreground/20 bg-card",
            invalid && "border-destructive/70 focus:ring-destructive/15 motion-safe:animate-[shake_0.3s_ease-in-out]",
            // A gap in the middle reads as "123 456"
            i === Math.floor(length / 2) - 1 && "mr-1.5 sm:mr-2.5"
          )}
        />
      ))}
    </div>
  );
};

export default OtpInput;
