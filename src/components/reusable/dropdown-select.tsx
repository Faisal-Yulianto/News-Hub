"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icon } from "@iconify/react";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

interface DropdownSelectProps<T extends string> {
  label: string;
  buttonIcon?: string;
  width?: number;
  options: readonly Option<T>[];
  selected?: T | null;
  onChange: (value: T) => void;
}

export function DropdownSelect<T extends string>({
  label,
  buttonIcon,
  width = 150,
  options,
  selected,
  onChange,
}: DropdownSelectProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild className="relative">
        <Button
          variant="outline"
          role="combobox"
          className={`text-[12px] w-[${width}px] flex justify-between`}
        >
          {selected ? options.find((o) => o.value === selected)?.label : label}
          {buttonIcon && <Icon icon={buttonIcon} />}
        </Button>
      </PopoverTrigger>

      <PopoverContent className={`w-[${width}px] p-0`}>
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className="text-[12px]"
                >
                  {item.icon && <Icon icon={item.icon} />}
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
