import { FileQuestion } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
      <p className="text-muted-foreground max-w-sm">
        Create your first prompt by clicking the "New Prompt" button above.
      </p>
    </div>
  );
}