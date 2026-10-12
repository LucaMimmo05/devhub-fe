import { useState, type ReactNode } from "react";
import { addMonths, addWeeks, endOfMonth, format } from "date-fns";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hover affordance shared by every editable piece: looks like plain text until you point at it.
const editableSurface =
  "-mx-1.5 rounded-md px-1.5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring";

type InlineTextProps = {
  value: string;
  onCommit: (value: string) => void;
  /** Return an error message to keep the field open, or null when the value is fine. */
  validate?: (value: string) => string | null;
  disabled?: boolean;
  multiline?: boolean;
  placeholder: string;
  maxLength: number;
  className?: string;
  label: string;
};

/** Text that turns into a field on click. Enter or blur saves, Esc cancels. */
export const InlineText = ({
  value,
  onCommit,
  validate,
  disabled,
  multiline,
  placeholder,
  maxLength,
  className,
  label,
}: InlineTextProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const error = draft !== null && validate ? validate(draft.trim()) : null;

  if (disabled) {
    return value ? <div className={className}>{value}</div> : null;
  }

  const commit = () => {
    if (draft === null) return;
    if (error) return;
    const next = draft.trim();
    setDraft(null);
    if (next !== value) onCommit(next);
  };

  if (draft === null) {
    return (
      <button
        type="button"
        onClick={() => setDraft(value)}
        aria-label={`Edit ${label}`}
        className={cn(editableSurface, "block w-[calc(100%+0.75rem)] cursor-text text-left", className, !value && "text-muted-foreground/60")}
      >
        {value || placeholder}
      </button>
    );
  }

  const shared = {
    value: draft,
    autoFocus: true,
    maxLength,
    placeholder,
    "aria-label": label,
    "aria-invalid": !!error,
    onBlur: () => (error ? setDraft(null) : commit()),
    className: cn(
      "-mx-1.5 block w-[calc(100%+0.75rem)] resize-none rounded-md bg-muted/50 px-1.5 outline-none ring-1 ring-ring/60 field-sizing-content",
      error && "ring-destructive/70",
      className
    ),
  };

  return (
    <div>
      {multiline ? (
        <textarea
          {...shared}
          rows={1}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") { e.preventDefault(); setDraft(null); }
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
          }}
        />
      ) : (
        <input
          {...shared}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") { e.preventDefault(); setDraft(null); }
            if (e.key === "Enter") { e.preventDefault(); commit(); }
          }}
        />
      )}
      <p className={cn("mt-1 text-xs", error ? "text-destructive" : "text-muted-foreground/70")}>
        {error ?? (multiline ? "Enter to save · Shift + Enter for a new line · Esc to cancel" : "Enter to save · Esc to cancel")}
      </p>
    </div>
  );
};

type PickerOption<T extends string> = { value: T; label: string; dotClassName?: string; hint?: string };

/** A badge that opens a pick-one menu; the choice applies immediately. */
export const InlinePicker = <T extends string>({
  value,
  options,
  onChange,
  disabled,
  label,
  triggerClassName,
  children,
}: {
  value: T;
  options: PickerOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  label: string;
  /** Replaces the default badge-like trigger styling, e.g. for a chip. */
  triggerClassName?: string;
  children: ReactNode;
}) => {
  if (disabled) return <>{children}</>;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Change ${label}`}
        className={triggerClassName ?? "group flex items-center gap-0.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"}
      >
        {children}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 min-w-44 overflow-y-auto">
        {options.map((opt) => (
          <DropdownMenuItem key={opt.value} onClick={() => opt.value !== value && onChange(opt.value)} className="gap-2.5">
            {opt.dotClassName && <span className={cn("h-2 w-2 shrink-0 rounded-full", opt.dotClassName)} />}
            <span className="flex-1 truncate">{opt.label}</span>
            {opt.hint && <span className="text-xs text-muted-foreground">{opt.hint}</span>}
            {opt.value === value && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/** Deadline trigger + calendar popover with quick presets; picking a day applies immediately. */
export const InlineDate = ({
  value,
  onChange,
  onClear,
  disabled,
  triggerClassName,
  children,
}: {
  value?: Date;
  onChange: (date: Date) => void;
  onClear?: () => void;
  disabled?: boolean;
  /** Replaces the default text-like trigger styling, e.g. for a chip. */
  triggerClassName?: string;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  if (disabled) return <>{children}</>;

  const today = new Date();
  const presets = [
    { label: "In 1 week", date: addWeeks(today, 1) },
    { label: "In 2 weeks", date: addWeeks(today, 2) },
    { label: "End of month", date: endOfMonth(today) },
    { label: "In 3 months", date: addMonths(today, 3) },
  ];
  const pick = (d: Date) => {
    setOpen(false);
    if (!value || format(d, "yyyy-MM-dd") !== format(value, "yyyy-MM-dd")) onChange(d);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={triggerClassName ?? cn(editableSurface, "flex items-center gap-1.5 py-0.5")}
        aria-label="Change due date"
      >
        {children}
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-auto flex-col p-0 sm:flex-row">
        {/* Quick picks: a column beside the calendar, a row above it on phones */}
        <div className="flex gap-1 overflow-x-auto border-b border-border/60 p-2 sm:w-44 sm:flex-col sm:border-b-0 sm:border-r">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => pick(p.date)}
              className="flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
            >
              {p.label}
              <span className="hidden tabular-nums text-muted-foreground/60 sm:inline">{format(p.date, "d MMM")}</span>
            </button>
          ))}
          {value && onClear && (
            <button
              type="button"
              onClick={() => { setOpen(false); onClear(); }}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:bg-muted focus-visible:outline-none sm:mt-auto"
            >
              <X className="h-3.5 w-3.5" /> Remove due date
            </button>
          )}
        </div>
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value ?? today}
          onSelect={(d) => d && pick(d)}
        />
      </PopoverContent>
    </Popover>
  );
};
