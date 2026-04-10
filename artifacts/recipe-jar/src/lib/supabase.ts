import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export type Recipe = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  ingredients: string;
  steps: string;
  image_url: string | null;
  cuisine_tag: string | null;
  difficulty_tag: string | null;
  time_tag: string | null;
  diet_tag: string | null;
  likes_count: number;
  created_at: string;
  profiles?: Profile;
};

export type SavedRecipe = {
  id: string;
  user_id: string;
  recipe_id: string;
  saved_at: string;
};

export type Like = {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
};
