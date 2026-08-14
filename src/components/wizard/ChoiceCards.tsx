import type { ElementType } from "react";
import { cn } from "@/lib/utils";

export type ChoiceOption = {
  value: string;
  label: string;
  icon?: ElementType;
  /** Classes applied to the card when selected, e.g. "border-red-500 bg-red-500/10 text-red-500". Defaults to the primary color. */
  activeClassName?: string;
};

type Props = {
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
};

const ChoiceCards = ({ options, value, onChange }: Props) => (
  <div
    className="grid gap-3"
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
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 py-6 text-center transition-all duration-150",
            isActive
              ? (opt.activeClassName ?? "border-primary bg-primary/5 text-primary")
              : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50",
            isActive && "scale-[1.03]"
          )}
        >
          {opt.icon && <opt.icon className="h-5 w-5" />}
          <span className="font-medium text-sm">{opt.label}</span>
        </button>
      );
    })}
  </div>
);

export default ChoiceCards;
