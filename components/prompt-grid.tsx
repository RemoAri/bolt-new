"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prompt, NewPrompt } from "@/types/prompt";
import { PromptCard } from "@/components/prompt-card";
import { EmptyState } from "@/components/empty-state";
import { PromptSearch } from "@/components/prompt-search";

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

  useEffect(() => {
    setPrompts(initialPrompts);
    setFilteredPrompts(initialPrompts);
  }, [initialPrompts]);

  const handleSearch = (query: string) => {
    setIsSearching(true);
    const lowercaseQuery = query.toLowerCase();
    
    const filtered = prompts.filter((prompt) =>
      prompt.title.toLowerCase().includes(lowercaseQuery) ||
      prompt.content.toLowerCase().includes(lowercaseQuery) ||
      prompt.best_for?.toLowerCase().includes(lowercaseQuery) ||
      prompt.notes?.toLowerCase().includes(lowercaseQuery) ||
      prompt.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredPrompts(filtered);
    setIsSearching(false);
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
    <AnimatePresence>
      {isSearching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
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
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6"
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
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}