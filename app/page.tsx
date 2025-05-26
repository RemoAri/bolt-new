"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { PromptForm } from "@/components/prompt-form";
import { PromptGrid } from "@/components/prompt-grid";
import { Prompt, NewPrompt } from "@/types/prompt";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Ensure each prompt has a valid tags array
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-6">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Prompts</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your collection of AI prompts.
            </p>
          </div>
          <PromptForm onSubmit={addPrompt} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <PromptGrid 
            prompts={prompts} 
            onDelete={deletePrompt}
            onUpdate={updatePrompt}
          />
        )}
      </main>
    </div>
  );
}