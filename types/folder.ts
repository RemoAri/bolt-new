export interface Folder {
  id: string;
  name: string;
  created_at: string;
  user_id?: string | null;
  icon?: string | null;
  color?: string | null;
}

export interface NewFolder {
  name: string;
  icon?: string | null;
  color?: string | null;
}