export interface Prompt {
  id: string;
  created_at: string;
  title: string;
  content: string;
  user_id?: string | null;
  best_for?: string | null;
  notes?: string | null;
  tags: string[];
}

export interface NewPrompt {
  title: string;
  content: string;
  best_for?: string | null;
  notes?: string | null;
  tags: string[];
}