import * as React from "react";
import { Search } from "lucide-react";
import { Input, type InputProps } from "../primitives/input.js";
import { cn } from "../primitives/utils.js";

export interface SearchInputProps extends Omit<InputProps, "type"> {
  onSearchChange?: (value: string) => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      onSearchChange,
      onChange,
      placeholder = "Search...",
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onSearchChange?.(e.target.value);
    };

    return (
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          placeholder={placeholder}
          className={cn("pl-9", className)}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
