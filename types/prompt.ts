export interface Folder {
  id: string;
  name: string;
  created_at: string;
  user_id?: string | null;
  icon: string;
  color: string;
}

export interface Prompt {
  id: string;
  created_at: string;
  title: string;
  content: string;
  user_id?: string | null;
  best_for?: string | null;
  notes?: string | null;
  tags: string[];
  folder_id: string | null;
}

export interface NewPrompt {
  title: string;
  content: string;
  best_for?: string | null;
  notes?: string | null;
  tags: string[];
  folder_id?: string | null;
}