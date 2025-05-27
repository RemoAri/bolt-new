"use client";

import { useState } from "react";
import { Prompt, NewPrompt } from "@/types/prompt";
import { formatDate, copyToClipboard, getTagColor, cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Check, Trash2, ChevronDown, ChevronUp, Edit2, Save } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TagInput } from "@/components/tag-input";

const promptSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(1, "Content is required").max(10000, "Content must be less than 10000 characters"),
  best_for: z.string().max(100, "Best for must be less than 100 characters").optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  tags: z.array(z.string()).optional(),
});

interface PromptCardProps {
  prompt: Prompt;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<NewPrompt>) => Promise<void>;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
}

export function PromptCard({ 
  prompt, 
  onDelete, 
  onUpdate, 
  isSelected = false, 
  onSelect,
  onTagClick,
  activeTag
}: PromptCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof promptSchema>>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title: prompt.title,
      content: prompt.content,
      best_for: prompt.best_for || "",
      notes: prompt.notes || "",
      tags: prompt.tags || [],
    },
  });

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const success = await copyToClipboard(prompt.content);
    if (success) {
      setIsCopied(true);
      toast.success("Prompt copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      toast.error("Failed to copy prompt");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      handleCopy();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardSelect();
    }
  };

  const handleCardSelect = () => {
    if (!isEditing) {
      setIsDialogOpen(true);
      onSelect?.(prompt.id);
    }
  };

  const handleSubmit = async (values: z.infer<typeof promptSchema>) => {
    try {
      await onUpdate(prompt.id, values);
      setIsEditing(false);
      toast.success("Changes saved successfully");
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onTagClick?.(tag);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full"
        tabIndex={0}
        role="article"
        aria-selected={isSelected}
        onKeyDown={handleKeyDown}
        onClick={handleCardSelect}
      >
        <Card 
          className={`h-full flex flex-col transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary ${
            isSelected ? 'border-primary border-2' : ''
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="line-clamp-1">{prompt.title}</CardTitle>
              {prompt.best_for && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {prompt.best_for}
                </Badge>
              )}
            </div>
            <CardDescription>{formatDate(new Date(prompt.created_at))}</CardDescription>
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {prompt.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={cn(
                      "text-xs capitalize cursor-pointer transition-colors",
                      getTagColor(tag),
                      activeTag === tag && "ring-2 ring-primary"
                    )}
                    onClick={(e) => handleTagClick(tag, e)}
                    role="button"
                    aria-label={`Filter by tag: ${tag}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-full justify-between text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContent(!showContent);
                }}
                aria-expanded={showContent}
              >
                <span>Prompt</span>
                {showContent ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {showContent && (
                <div className="mt-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                  <pre className="whitespace-pre-wrap font-sans">{prompt.content}</pre>
                </div>
              )}
            </div>
            
            {prompt.notes && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-between text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotes(!showNotes);
                  }}
                  aria-expanded={showNotes}
                >
                  <span>Notes</span>
                  {showNotes ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {showNotes && (
                  <div className="mt-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                    {prompt.notes}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-24 transition-all duration-200"
              onClick={handleCopy}
            >
              {isCopied ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setIsDialogOpen(true);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this prompt? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onDelete(prompt.id);
                        toast.success("Prompt deleted successfully");
                      }}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardFooter>
        </Card>
      </motion.article>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Prompt" : prompt.title}
            </DialogTitle>
          </DialogHeader>

          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-[200px] font-mono text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="best_for"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Best For</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(prompt.created_at))}
                  </p>
                </div>
                {prompt.best_for && (
                  <Badge variant="secondary">{prompt.best_for}</Badge>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Content</p>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm whitespace-pre-wrap">{prompt.content}</pre>
                </div>
              </div>
              {prompt.tags && prompt.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={cn(
                          "capitalize cursor-pointer",
                          getTagColor(tag),
                          activeTag === tag && "ring-2 ring-primary"
                        )}
                        onClick={(e) => handleTagClick(tag, e)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {prompt.notes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Notes</p>
                  <div className="rounded-md bg-muted p-4">
                    <p className="text-sm text-muted-foreground">{prompt.notes}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}