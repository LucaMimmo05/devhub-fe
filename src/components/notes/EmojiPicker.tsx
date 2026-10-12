import { useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// A curated set for developer notes; anything else can be pasted in the field below.
const GROUPS: { label: string; emojis: string[] }[] = [
  { label: "Notes", emojis: ["📝", "📌", "💡", "🧠", "📚", "📖", "🗒️", "📎", "✏️", "🔖"] },
  { label: "Work", emojis: ["🚀", "🐛", "🔧", "🛠️", "⚙️", "🧪", "🧩", "🏗️", "🧹", "📦"] },
  { label: "Tech", emojis: ["💻", "🖥️", "🗄️", "☁️", "🐳", "🌐", "🔒", "🔑", "🔗", "📊"] },
  { label: "Status", emojis: ["✅", "⚠️", "❗", "🔥", "⭐", "🎯", "⏱️", "📅", "💬", "🎉"] },
];

// Rough check that the pasted text is a single emoji (incl. ZWJ sequences and flags).
const looksLikeEmoji = (value: string) => /^\p{Extended_Pictographic}/u.test(value) || /^\p{Regional_Indicator}{2}$/u.test(value);

type Props = {
  value?: string | null;
  onChange: (emoji: string) => void;
  onRemove: () => void;
  children: ReactNode;
  triggerClassName?: string;
  label?: string;
};

const EmojiPicker = ({ value, onChange, onRemove, children, triggerClassName, label = "Choose an icon" }: Props) => {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  const pick = (emoji: string) => {
    setOpen(false);
    setCustom("");
    if (emoji !== value) onChange(emoji);
  };

  const customValid = custom.trim() !== "" && looksLikeEmoji(custom.trim());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={label} className={triggerClassName}>
        {children}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[17.5rem] p-0">
        <div className="max-h-72 overflow-y-auto p-2">
          {GROUPS.map((g) => (
            <div key={g.label} className="mb-1.5">
              <p className="px-1 pb-1 text-[11px] font-medium text-muted-foreground">{g.label}</p>
              <div className="grid grid-cols-10 gap-0.5">
                {g.emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => pick(e)}
                    aria-label={e}
                    className={cn(
                      "flex h-6.5 w-6.5 items-center justify-center rounded-md text-base transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                      e === value && "bg-primary/15 ring-1 ring-primary/50"
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <form
          className="flex items-center gap-2 border-t border-border/60 p-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (customValid) pick(custom.trim());
          }}
        >
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (customValid) pick(custom.trim());
              }
            }}
            placeholder="Paste any emoji"
            maxLength={16}
            aria-label="Custom emoji"
            className="h-8 min-w-0 flex-1 rounded-md border border-border bg-background/40 px-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {value ? (
            <button
              type="button"
              onClick={() => { setOpen(false); onRemove(); }}
              className="h-8 shrink-0 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              Remove
            </button>
          ) : null}
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
