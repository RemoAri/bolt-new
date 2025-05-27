"use client";

import { useState, useEffect } from "react";
import { FileText, ChevronLeft, ChevronRight, Briefcase, Heart, Search, Tag, FolderIcon, Plus, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, FOLDERS } from "@/lib/utils";
import { PromptSearch } from "@/components/prompt-search";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FolderDialog } from '@/components/folder-dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createBrowserClient } from '@supabase/ssr';

interface SidebarProps {
  recentTags: string[];
  onTagClick: (tag: string) => void;
  activeTag: string | null;
  onSearch: (query: string) => void;
  activeFolder: string | null;
  onFolderClick: (folderId: string) => void;
  promptCounts: Record<string, number>;
}

export function Sidebar({
  recentTags,
  onTagClick,
  activeTag,
  onSearch,
  activeFolder,
  onFolderClick,
  promptCounts,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFolderCreated = (folderName: string) => {
    setCustomFolders(prev => [...prev, folderName]);
  };

  const handleDeleteFolder = async (folderName: string) => {
    try {
      // First, move all prompts in this folder to "All"
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ folder: 'All' })
        .eq('folder', folderName);

      if (updateError) throw updateError;

      // Remove the folder from custom folders
      setCustomFolders(prev => prev.filter(f => f !== folderName));
      
      // If the deleted folder was active, switch to "All"
      if (activeFolder === folderName) {
        onFolderClick("All");
      }

      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: "Failed to delete folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-muted/10 transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[280px]"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5" />
            <span>Prompts</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto h-8 w-8", collapsed && "ml-0")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!collapsed && (
        <div className="p-4">
          <PromptSearch onSearch={onSearch} variant="sidebar" />
        </div>
      )}

      <ScrollArea className="flex-1 px-3">
        {!collapsed && (
          <>
            <div className="py-4">
              <h2 className="px-2 text-xs font-semibold text-muted-foreground mb-2">
                FOLDERS
              </h2>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    activeFolder === "All" && "bg-accent"
                  )}
                  onClick={() => onFolderClick("All")}
                >
                  <FileText className="h-4 w-4" />
                  <span className="flex-1 text-left">All Prompts</span>
                  <span className="text-xs text-muted-foreground">
                    {Object.values(promptCounts).reduce((a, b) => a + b, 0)}
                  </span>
                </Button>
                {FOLDERS.map((folder) => (
                  <Button
                    key={folder}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      activeFolder === folder && "bg-accent"
                    )}
                    onClick={() => onFolderClick(folder)}
                  >
                    {folder === 'Work' ? <Briefcase className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                    <span className="flex-1 text-left">{folder}</span>
                    <span className="text-xs text-muted-foreground">
                      {promptCounts[folder] || 0}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="py-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="text-xs font-semibold text-muted-foreground">
                  CUSTOM FOLDERS
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsFolderDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {customFolders.length > 0 ? (
                  customFolders.map((folder) => (
                    <div key={folder} className="flex items-center group">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-2",
                          activeFolder === folder && "bg-accent"
                        )}
                        onClick={() => onFolderClick(folder)}
                      >
                        <FolderIcon className="h-4 w-4" />
                        <span className="flex-1 text-left">{folder}</span>
                        <span className="text-xs text-muted-foreground">
                          {promptCounts[folder] || 0}
                        </span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteFolder(folder)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Folder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                ) : (
                  <div className="px-2 text-sm text-muted-foreground">
                    No custom folders yet
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <h2 className="px-2 text-xs font-semibold text-muted-foreground mb-2">
                RECENT TAGS
              </h2>
              <div className="flex flex-wrap gap-1 px-2">
                {recentTags.map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-6 text-xs",
                      activeTag === tag && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => onTagClick(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </ScrollArea>

      <FolderDialog
        open={isFolderDialogOpen}
        onOpenChange={setIsFolderDialogOpen}
        onSuccess={handleFolderCreated}
      />
    </div>
  );
}