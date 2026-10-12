import { useEffect, type ElementType } from "react";
import { cn } from "@/lib/utils";

export type ChoiceOption = {
  value: string;
  label: string;
  /** Short line under the label explaining the choice. */
  description?: string;
  icon?: ElementType;
  /** Classes applied to the card when selected, e.g. "border-red-500 bg-red-500/10 text-red-500". Defaults to the primary color. */
  activeClassName?: string;
};

type Props = {
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  /** Pick options with the number keys 1..n and show the key on each card. */
  shortcuts?: boolean;
};

const ChoiceCards = ({ options, value, onChange, shortcuts = false }: Props) => {
  useEffect(() => {
    if (!shortcuts) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable=true]")) return;
      const opt = options[Number(e.key) - 1];
      if (opt) onChange(opt.value);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts, options, onChange]);

  const hasDescriptions = options.some((o) => o.description);

  return (
  <div
    // With descriptions the cards need room: stack them on phones.
    className={cn("grid gap-3", hasDescriptions && "max-sm:grid-cols-1!")}
    style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 3)}, minmax(0, 1fr))` }}
  >
    {options.map((opt) => {
      const isActive = opt.value === value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 py-6 text-center transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98]",
            isActive
              ? (opt.activeClassName ?? "border-primary bg-primary/5 text-primary")
              : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50",
            isActive && "scale-[1.03]"
          )}
        >
          {shortcuts && (
            <kbd className="absolute left-2.5 top-2 font-sans text-[10px] font-medium text-muted-foreground/60">
              {options.indexOf(opt) + 1}
            </kbd>
          )}
          {opt.icon && <opt.icon className="h-5 w-5" />}
          <span className="font-medium text-sm">{opt.label}</span>
          {opt.description && (
            <span className={cn("text-xs leading-snug", isActive ? "opacity-80" : "text-muted-foreground")}>
              {opt.description}
            </span>
          )}
        </button>
      );
    })}
  </div>
  );
};

export default ChoiceCards;
