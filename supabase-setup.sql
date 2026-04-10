-- Recipe Jar - Supabase Database Setup
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. RECIPES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  ingredients text NOT NULL,
  steps text NOT NULL,
  image_url text,
  cuisine_tag text,
  difficulty_tag text,
  time_tag text,
  diet_tag text,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. SAVED_RECIPES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- ============================================================
-- 4. LIKES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- ============================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. PROFILES POLICIES
-- ============================================================
-- Anyone can read profiles
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 7. RECIPES POLICIES
-- ============================================================
-- Anyone can read all recipes
CREATE POLICY "recipes_select_all" ON public.recipes
  FOR SELECT USING (true);

-- Authenticated users can insert their own recipes
CREATE POLICY "recipes_insert_own" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update only their own recipes
CREATE POLICY "recipes_update_own" ON public.recipes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete only their own recipes
CREATE POLICY "recipes_delete_own" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 8. SAVED_RECIPES POLICIES
-- ============================================================
-- Users can read only their own saved recipes
CREATE POLICY "saved_recipes_select_own" ON public.saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can save recipes
CREATE POLICY "saved_recipes_insert_own" ON public.saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unsave their own
CREATE POLICY "saved_recipes_delete_own" ON public.saved_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 9. LIKES POLICIES
-- ============================================================
-- Anyone can read likes (for public count display)
CREATE POLICY "likes_select_all" ON public.likes
  FOR SELECT USING (true);

-- Authenticated users can insert likes
CREATE POLICY "likes_insert_own" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "likes_delete_own" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);
