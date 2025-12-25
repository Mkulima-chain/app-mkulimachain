"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface SearchableSelectProps<T> {
  value?: string;
  onValueChange: (value: string) => void;
  options: T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  getDisplayLabel?: (option: T) => string; // Label d'affichage optionnel (plus lisible)
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect<T>({
  value,
  onValueChange,
  options,
  getOptionValue,
  getOptionLabel,
  getDisplayLabel,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat trouvé",
  className,
  disabled = false,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedOption = React.useMemo(
    () => options.find((opt) => getOptionValue(opt) === value),
    [options, value, getOptionValue]
  );
  
  // Utiliser getDisplayLabel si fourni, sinon getOptionLabel
  const getDisplayText = React.useCallback((option: T) => {
    return getDisplayLabel ? getDisplayLabel(option) : getOptionLabel(option);
  }, [getDisplayLabel, getOptionLabel]);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) =>
      getOptionLabel(opt).toLowerCase().includes(query)
    );
  }, [options, searchQuery, getOptionLabel]);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedOption && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? getDisplayText(selectedOption) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setSearchQuery("");
              }
            }}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option) => {
              const optionValue = getOptionValue(option);
              const isSelected = value === optionValue;
              return (
                <button
                  key={optionValue}
                  type="button"
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => handleSelect(optionValue)}
                >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {getDisplayText(option)}
                  </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

