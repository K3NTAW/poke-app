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
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string | null
          full_name: string | null
          pokemon_player_id: string | null
          role: 'player' | 'shop'
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          pokemon_player_id?: string | null
          role?: 'player' | 'shop'
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          pokemon_player_id?: string | null
          role?: 'player' | 'shop'
          avatar_url?: string | null
        }
      }
      tournaments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          date: string
          location: string
          accessibility_details: Json | null
          tags: string[]
          seat_limit: number
          shop_id: string
          status: 'draft' | 'published' | 'cancelled' | 'completed'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          date: string
          location: string
          accessibility_details?: Json | null
          tags?: string[]
          seat_limit: number
          shop_id: string
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          date?: string
          location?: string
          accessibility_details?: Json | null
          tags?: string[]
          seat_limit?: number
          shop_id?: string
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
        }
      }
      tournament_registrations: {
        Row: {
          id: string
          created_at: string
          tournament_id: string
          player_id: string
          deck_list: Json | null
          status: 'pending' | 'confirmed' | 'cancelled'
        }
        Insert: {
          id?: string
          created_at?: string
          tournament_id: string
          player_id: string
          deck_list?: Json | null
          status?: 'pending' | 'confirmed' | 'cancelled'
        }
        Update: {
          id?: string
          created_at?: string
          tournament_id?: string
          player_id?: string
          deck_list?: Json | null
          status?: 'pending' | 'confirmed' | 'cancelled'
        }
      }
      chat_messages: {
        Row: {
          id: string
          created_at: string
          tournament_id: string
          user_id: string
          content: string
        }
        Insert: {
          id?: string
          created_at?: string
          tournament_id: string
          user_id: string
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          tournament_id?: string
          user_id?: string
          content?: string
        }
      }
    }
  }
} 