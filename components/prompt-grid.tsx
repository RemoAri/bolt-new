"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prompt, NewPrompt } from "@/types/prompt";
import { PromptCard } from "@/components/prompt-card";
import { EmptyState } from "@/components/empty-state";
import { PromptSearch } from "@/components/prompt-search";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn, getTagColor } from "@/lib/utils";

interface PromptGridProps {
  prompts: Prompt[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: Partial<NewPrompt>) => Promise<void>;
}

export function PromptGrid({ prompts: initialPrompts, onDelete, onUpdate }: PromptGridProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>(initialPrompts);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    setPrompts(initialPrompts);
    filterPrompts(activeTag || "");
  }, [initialPrompts]);

  const filterPrompts = (query: string, tag?: string | null) => {
    setIsSearching(true);
    const lowercaseQuery = query.toLowerCase();
    const filterTag = tag !== undefined ? tag : activeTag;
    
    const filtered = prompts.filter((prompt) => {
      const matchesQuery = 
        prompt.title.toLowerCase().includes(lowercaseQuery) ||
        prompt.content.toLowerCase().includes(lowercaseQuery) ||
        prompt.best_for?.toLowerCase().includes(lowercaseQuery) ||
        prompt.notes?.toLowerCase().includes(lowercaseQuery) ||
        prompt.tags?.some(t => t.toLowerCase().includes(lowercaseQuery));

      if (filterTag) {
        return prompt.tags?.includes(filterTag) && matchesQuery;
      }
      
      return matchesQuery;
    });
    
    setFilteredPrompts(filtered);
    setIsSearching(false);
  };

  const handleSearch = (query: string) => {
    filterPrompts(query);
  };

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null);
      filterPrompts("", null);
    } else {
      setActiveTag(tag);
      filterPrompts("", tag);
    }
  };

  const handleDelete = async (id: string) => {
    setPrompts(prompts.filter(prompt => prompt.id !== id));
    setFilteredPrompts(filteredPrompts.filter(prompt => prompt.id !== id));
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Failed to delete prompt:", error);
      setPrompts(initialPrompts);
      setFilteredPrompts(initialPrompts);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedPromptId(id === selectedPromptId ? null : id);
  };

  if (prompts.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="space-y-4">
        <PromptSearch onSearch={handleSearch} />
        
        {activeTag && (
          <div className="flex items-center gap-2 px-6">
            <span className="text-sm text-muted-foreground">Filtered by tag:</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs capitalize cursor-pointer",
                getTagColor(activeTag)
              )}
              onClick={() => handleTagClick(activeTag)}
            >
              {activeTag}
              <X className="ml-1 h-3 w-3" />
            </Badge>
            <span className="text-sm text-muted-foreground">
              ({filteredPrompts.length} {filteredPrompts.length === 1 ? 'result' : 'results'})
            </span>
          </div>
        )}

        <AnimatePresence>
          {isSearching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No prompts found</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onDelete={handleDelete}
                  onUpdate={onUpdate}
                  isSelected={prompt.id === selectedPromptId}
                  onSelect={handleSelect}
                  onTagClick={handleTagClick}
                  activeTag={activeTag}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}