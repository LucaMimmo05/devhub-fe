import { Command } from "lucide-react";

const isMac =
  typeof navigator !== "undefined" &&
  navigator.userAgent.toUpperCase().includes("MAC");

const ShortcutHint = () => {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
      <kbd className="h-5 min-w-5 px-1 flex items-center justify-center rounded border bg-muted text-muted-foreground">
        {isMac ? (
          <Command size={12} className="translate-y-[0.5px]" />
        ) : (
          <span className="text-xs font-medium">Ctrl</span>
        )}
      </kbd>

      <kbd className="h-5 min-w-5 px-1 flex items-center justify-center rounded border bg-muted text-muted-foreground text-xs font-medium">
        K
      </kbd>
    </div>
  );
};

export default ShortcutHint;
