import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

type FilterOption = {
  label: string;
  value: string;
};

type DropdownFilterProps = {
  value?: string;
  onChange: (value?: string) => void;
  options: FilterOption[];
  placeholder: string;
  width?: string;
};

const DropdownFilter = ({
  value,
  onChange,
  options,
  placeholder,
  width = "w-50",
}: DropdownFilterProps) => {
  const [open, setOpen] = React.useState(false);

  const selected = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild >
        <Button
          variant="outline"
          role="combobox"
          className={cn(width, "justify-between flex-1 lg:flex-[unset] border-dashed")}
        >
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn(width, "p-0")}>
        <Command>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {options.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.value}
                onSelect={() => {
                  onChange(opt.value === value ? undefined : opt.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === opt.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {opt.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DropdownFilter;
