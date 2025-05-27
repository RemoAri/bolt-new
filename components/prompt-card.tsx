"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Star, StarOff, Copy, Trash2, FolderIcon } from "lucide-react";
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
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_favorite: boolean;
  folder: string;
}

interface PromptCardProps {
  prompt: Prompt;
  onFavoriteToggle: (id: string, isFavorite: boolean) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
  onMoveToFolder: (promptId: string, folder: string) => void;
  folders?: string[];
}

export function PromptCard({
  prompt,
  onFavoriteToggle,
  onDelete,
  onCopy,
  onMoveToFolder,
  folders = [],
}: PromptCardProps) {
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

  return (
    <Card className="group relative overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none tracking-tight">
            {prompt.title}
          </h3>
          {prompt.folder && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FolderIcon className="h-3 w-3" />
              <span>{prompt.folder}</span>
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onFavoriteToggle(prompt.id, !prompt.is_favorite)}
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
            <DropdownMenuItem onClick={() => onCopy(prompt.content)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Content
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsMoveDialogOpen(true)}>
              <FolderIcon className="mr-2 h-4 w-4" />
              Move to Folder
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(prompt.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {prompt.content}
        </p>
        <div className="mt-4 flex flex-wrap gap-1">
          {prompt.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

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
    </Card>
  );
}