"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { PromptForm } from "@/components/prompt-form";
import { PromptGrid } from "@/components/prompt-grid";
import { Sidebar } from "@/components/sidebar";
import { Prompt, NewPrompt } from "@/types/prompt";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const validPrompts = (data || []).map(prompt => ({
        ...prompt,
        tags: Array.isArray(prompt.tags) ? prompt.tags : []
      }));

      setPrompts(validPrompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast.error("Failed to load prompts. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function addPrompt(newPrompt: NewPrompt) {
    try {
      const promptData = {
        ...newPrompt,
        tags: Array.isArray(newPrompt.tags) ? newPrompt.tags : []
      };

      const { data, error } = await supabase
        .from("prompts")
        .insert([promptData])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setPrompts([data[0], ...prompts]);
        toast.success("Prompt added successfully");
      }
    } catch (error) {
      console.error("Error adding prompt:", error);
      toast.error("Failed to add prompt. Please try again.");
      throw error;
    }
  }

  async function updatePrompt(id: string, updatedPrompt: Partial<NewPrompt>) {
    try {
      const promptData = {
        ...updatedPrompt,
        tags: Array.isArray(updatedPrompt.tags) ? updatedPrompt.tags : []
      };

      const { data, error } = await supabase
        .from("prompts")
        .update(promptData)
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setPrompts(prompts.map(p => p.id === id ? data[0] : p));
        toast.success("Prompt updated successfully");
      }
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast.error("Failed to update prompt. Please try again.");
      throw error;
    }
  }

  async function deletePrompt(id: string) {
    try {
      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast.error("Failed to delete prompt. Please try again.");
      throw error;
    }
  }

  const recentTags = Array.from(new Set(prompts.flatMap(p => p.tags || []))).slice(0, 10);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTag(null);
  };

  const handleTagClick = (tag: string) => {
    setActiveTag(activeTag === tag ? null : tag);
    setSearchQuery("");
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        recentTags={recentTags}
        onTagClick={handleTagClick}
        activeTag={activeTag}
        onSearch={handleSearch}
      />
      <div className="flex-1 flex flex-col">
        <Header>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Prompt Library</h1>
            <p className="text-sm text-muted-foreground">
              Organize and manage your AI prompts
            </p>
          </div>
          <PromptForm onSubmit={addPrompt} />
        </Header>
        <main className="flex-1 container py-6 overflow-auto">
          <PromptGrid
            prompts={prompts}
            onDelete={deletePrompt}
            onUpdate={updatePrompt}
            activeTag={activeTag}
            searchQuery={searchQuery}
          />
        </main>
      </div>
    </div>
  );
}