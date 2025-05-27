import { DragOverlay, useDraggable } from "@dnd-kit/core";
import { PromptCard } from "./prompt-card";
import { Prompt } from "@/types/prompt";

interface DragOverlayProps {
  activePrompt: Prompt | null;
}

export function DragOverlayComponent({ activePrompt }: DragOverlayProps) {
  if (!activePrompt) return null;

  return (
    <DragOverlay>
      <div className="w-[350px] opacity-80">
        <PromptCard
          prompt={activePrompt}
          onDelete={() => {}}
          onUpdate={() => Promise.resolve()}
          isDragging
        />
      </div>
    </DragOverlay>
  );
}