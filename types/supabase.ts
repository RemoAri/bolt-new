export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: string
          created_at: string
          title: string
          content: string
          user_id: string | null
          best_for: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          content: string
          user_id?: string | null
          best_for?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          content?: string
          user_id?: string | null
          best_for?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}