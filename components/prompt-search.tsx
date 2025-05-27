"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import debounce from "lodash.debounce";

interface PromptSearchProps {
  onSearch: (query: string) => void;
  variant?: "default" | "sidebar";
}

export function PromptSearch({ onSearch, variant = "default" }: PromptSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query);
    }, 300),
    []
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <div className={cn(
      variant === "default" && "sticky top-[3.5rem] z-30 -mx-6 mb-4 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      variant === "sidebar" && "relative"
    )}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={variant === "sidebar" ? "Search..." : "Search prompts..."}
          className={cn(
            "pl-9 pr-9",
            variant === "sidebar" && "h-9"
          )}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}