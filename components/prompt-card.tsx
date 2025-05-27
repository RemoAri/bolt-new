"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Star, StarOff, Copy, Trash2, FolderIcon, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PromptForm } from "@/components/prompt-form";
import { NewPrompt } from "@/types/prompt";

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_favorite: boolean;
  folder: string;
  notes?: string;
  created_at?: string;
  best_for?: string;
}

interface PromptCardProps {
  prompt: Prompt;
  onFavoriteToggle: (id: string, isFavorite: boolean) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
  onMoveToFolder: (promptId: string, folder: string) => void;
  onEdit?: (prompt: Prompt) => void;
  folders?: string[];
}

export function PromptCard({
  prompt,
  onFavoriteToggle,
  onDelete,
  onCopy,
  onMoveToFolder,
  onEdit,
  folders = [],
}: PromptCardProps) {
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMoveToFolder = async (folder: string) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .update({ folder })
        .eq('id', prompt.id);

      if (error) throw error;

      onMoveToFolder(prompt.id, folder);
      setIsMoveDialogOpen(false);
      toast({
        title: "Success",
        description: folder ? "Prompt moved to folder" : "Prompt moved to root",
      });
    } catch (error) {
      console.error('Error moving prompt:', error);
      toast({
        title: "Error",
        description: "Failed to move prompt. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler for updating a prompt
  const handleEditPrompt = async (data: NewPrompt) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .update({
          title: data.title,
          content: data.content,
          notes: data.notes,
          tags: data.tags,
          folder: data.folder,
          best_for: data.best_for,
        })
        .eq('id', prompt.id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Prompt updated successfully' });
      setIsEditDialogOpen(false);
      // Optionally, trigger a refresh or callback here
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update prompt', variant: 'destructive' });
    }
  };

  // Prevent card click from firing when clicking on action buttons/menus
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <Card
        ref={cardRef}
        className="relative p-6 flex flex-col min-h-[260px] cursor-pointer hover:bg-muted/50 transition"
        onClick={() => setIsEditDialogOpen(true)}
      >
        {/* Top: Title, tags, and handle */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold mb-2">{prompt.title}</h2>
            <div className="flex flex-wrap gap-1 mb-2">
              {prompt.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          {/* Handle/Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={stopPropagation}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => { stopPropagation(e); onFavoriteToggle(prompt.id, !prompt.is_favorite); }}
              >
                {prompt.is_favorite ? (
                  <>
                    <StarOff className="mr-2 h-4 w-4" />
                    Remove from Favorites
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Add to Favorites
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { stopPropagation(e); setIsMoveDialogOpen(true); }}>
                <FolderIcon className="mr-2 h-4 w-4" />
                Move to Folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { stopPropagation(e); setIsEditDialogOpen(true); }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { stopPropagation(e); onDelete(prompt.id); }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Folder label */}
        {prompt.folder && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2 mt-1">
            <FolderIcon className="h-3 w-3" />
            <span>{prompt.folder}</span>
          </div>
        )}

        {/* Content: Prompt (collapsible) */}
        <div className="mt-2 mb-2">
          <button
            type="button"
            className="flex items-center gap-1 font-semibold mb-1 focus:outline-none"
            onClick={(e) => { stopPropagation(e); setPromptOpen((open) => !open); }}
          >
            Prompt
            {promptOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {promptOpen && (
            <div className="whitespace-pre-line text-sm text-foreground mb-2">
              {prompt.content}
            </div>
          )}
          {prompt.notes && (
            <>
              <button
                type="button"
                className="flex items-center gap-1 font-semibold mb-1 focus:outline-none"
                onClick={(e) => { stopPropagation(e); setNotesOpen((open) => !open); }}
              >
                Notes
                {notesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {notesOpen && (
                <div className="whitespace-pre-line text-sm text-muted-foreground">
                  {prompt.notes}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom: Actions and date */}
        <div className="flex items-center justify-between mt-auto pt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={(e) => { stopPropagation(e); onCopy(prompt.content); }}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={(e) => { stopPropagation(e); onEdit(prompt); }}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={(e) => { stopPropagation(e); onDelete(prompt.id); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {prompt.created_at && (
            <div className="text-sm text-muted-foreground">
              {new Date(prompt.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Move to Folder Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
            <DialogDescription>
              Choose a folder to move this prompt to
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleMoveToFolder("All")}
              >
                <FolderIcon className="mr-2 h-4 w-4" />
                All
              </Button>
              {folders.map((folder) => (
                <Button
                  key={folder}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleMoveToFolder(folder)}
                >
                  <FolderIcon className="mr-2 h-4 w-4" />
                  {folder}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog using PromptForm */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
          </DialogHeader>
          <PromptForm
            onSubmit={handleEditPrompt}
            customFolders={folders}
            initialValues={{
              title: prompt.title,
              content: prompt.content,
              notes: prompt.notes || "",
              tags: prompt.tags || [],
              folder: prompt.folder || "All",
              best_for: prompt.best_for || "",
            }}
            submitLabel="Save"
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}