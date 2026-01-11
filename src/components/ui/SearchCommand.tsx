import { CommandEmpty, CommandList } from "cmdk";
import { Command, CommandInput } from "./command";

const SearchCommand = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Command className="w-full max-w-xl max-h-[50vh] rounded-xl border bg-popover shadow-lg overflow-hidden">
        <CommandInput
          autoFocus
          placeholder="Type or search something..."
          className="border-b"
        />

        <CommandList className="max-h-[60vh] overflow-y-auto">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No resource found
          </CommandEmpty>
        </CommandList>
      </Command>
    </div>
  );
};

export default SearchCommand;
