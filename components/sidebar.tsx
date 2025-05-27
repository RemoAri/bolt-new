"use client";

import { useState } from "react";
import { FileText, ChevronLeft, ChevronRight, FolderClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PromptSearch } from "@/components/prompt-search";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  recentTags: string[];
  onTagClick: (tag: string) => void;
  activeTag: string | null;
  onSearch: (query: string) => void;
}

export function Sidebar({ recentTags, onTagClick, activeTag, onSearch }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const folders = [
    { name: "Work", count: 12 },
    { name: "Creative Writing", count: 8 },
    { name: "Development", count: 15 },
    { name: "Marketing", count: 6 },
  ];

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
                {folders.map((folder) => (
                  <Button
                    key={folder.name}
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <FolderClosed className="h-4 w-4" />
                    <span className="flex-1 text-left">{folder.name}</span>
                    <span className="text-xs text-muted-foreground">{folder.count}</span>
                  </Button>
                ))}
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

      {!collapsed && (
        <div className="mt-auto p-4 border-t">
          <Button className="w-full gap-2">
            <FileText className="h-4 w-4" />
            New Prompt
          </Button>
        </div>
      )}
    </div>
  );
}