import { useState } from "react";
import { Folder } from "@/types/folder";
import { Button } from "@/components/ui/button";
import { FolderClosed, FolderOpen, Plus, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const folderSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
});

interface FolderListProps {
  folders: Folder[];
  activeFolder: string | null;
  onFolderClick: (folderId: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onRenameFolder: (id: string, name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
}

export function FolderList({
  folders,
  activeFolder,
  onFolderClick,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const form = useForm<z.infer<typeof folderSchema>>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleCreateSubmit = async (values: z.infer<typeof folderSchema>) => {
    try {
      await onCreateFolder(values.name);
      setIsCreating(false);
      form.reset();
      toast.success("Folder created successfully");
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const handleRenameSubmit = async (values: z.infer<typeof folderSchema>) => {
    if (!editingFolder) return;
    try {
      await onRenameFolder(editingFolder.id, values.name);
      setEditingFolder(null);
      form.reset();
      toast.success("Folder renamed successfully");
    } catch (error) {
      toast.error("Failed to rename folder");
    }
  };

  return (
    <div className="space-y-1">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="flex items-center"
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              activeFolder === folder.id && "bg-accent"
            )}
            onClick={() => onFolderClick(folder.id)}
          >
            {activeFolder === folder.id ? (
              <FolderOpen className="h-4 w-4" />
            ) : (
              <FolderClosed className="h-4 w-4" />
            )}
            <span className="flex-1 text-left truncate">{folder.name}</span>
            <span className="text-xs text-muted-foreground">
              {folder.promptCount || 0}
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-1"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  setEditingFolder(folder);
                  form.setValue("name", folder.name);
                }}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDeleteFolder(folder.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Folder</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter folder name" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingFolder} onOpenChange={(open) => !open && setEditingFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRenameSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter folder name" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingFolder(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}