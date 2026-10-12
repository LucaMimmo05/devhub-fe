import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  /** Classes for the selected state, e.g. "bg-red-500/15 text-red-400". Defaults to a neutral highlight. */
  activeClassName?: string;
};

type Props<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
};

// Inline pick-one control (status, priority) — every option visible, one click to change.
const SegmentedPicker = <T extends string>({
  options,
  value,
  onChange,
  disabled,
  className,
  ...rest
}: Props<T>) => (
  <div
    role="radiogroup"
    aria-label={rest["aria-label"]}
    className={cn("flex h-8 w-full rounded-lg border border-border bg-background/40 p-0.5", className)}
  >
    {options.map((opt) => {
      const active = opt.value === value;
      return (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={active}
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 truncate rounded-md px-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60",
            active
              ? (opt.activeClassName ?? "bg-muted text-foreground shadow-sm")
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedPicker;
