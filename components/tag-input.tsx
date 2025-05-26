"use client";

import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { cn, getTagColor, getUniqueTags } from '@/lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}

export function TagInput({ value = [], onChange, className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load all unique tags when component mounts
    const loadTags = async () => {
      const tags = await getUniqueTags();
      setAllTags(tags);
    };
    loadTags();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const tag = inputValue.trim().toLowerCase();

    if ((e.key === 'Enter' || e.key === ',') && tag) {
      e.preventDefault();
      if (!value.includes(tag)) {
        const newTags = [...value, tag];
        onChange(newTags);
        setInputValue('');
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Backspace' && !tag && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(',', '');
    setInputValue(newValue);

    if (newValue.trim()) {
      // Filter all known tags for suggestions
      const filtered = allTags.filter(tag => 
        tag.toLowerCase().includes(newValue.toLowerCase()) &&
        !value.includes(tag)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const selectSuggestion = (tag: string) => {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("space-y-2 relative", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <Badge
            key={tag}
            variant="secondary"
            className={cn("px-2 py-1 text-xs capitalize", getTagColor(tag))}
          >
            {tag}
            <button
              type="button"
              className="ml-1 rounded-full outline-none focus:outline-none"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(!!suggestions.length)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Add tags (press Enter or comma to add)"
          className="w-full"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md">
            <div className="p-1">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion}
                  className="w-full text-left px-2 py-1 text-sm rounded hover:bg-accent hover:text-accent-foreground capitalize"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}