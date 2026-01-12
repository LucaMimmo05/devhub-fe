import { CommandEmpty, CommandList } from "cmdk";
import { Command, CommandInput } from "./command";
import { X } from "lucide-react";
import { Button } from "./button";

const SearchCommand = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-10">
      <Command className="w-full max-w-xl max-h-[50vh] rounded-xl border bg-popover shadow-lg overflow-hidden flex flex-col relative">
        <div className="flex justify-between items-center w-full border-b">
          <CommandInput
            autoFocus
            placeholder="Type or search something..."
            className="flex-1 py-2 px-3 border-none outline-none"
          />

          <Button
            variant="ghost"
            onClick={onClose}
            className="flex items-center justify-center text-muted-foreground hover:bg-transparent hover:text-foreground transition-colors px-3 py-2 h-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <CommandList className="flex-1 overflow-y-auto px-4">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No resource found
          </CommandEmpty>
        </CommandList>

        {/* FOOTER */}
        <div className="border-t px-4 py-2 text-right">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 border rounded">Esc</kbd> to
            return
          </p>
        </div>
      </Command>
    </div>
  );
};

export default SearchCommand;
