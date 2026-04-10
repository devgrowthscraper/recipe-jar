-- Recipe Jar — RLS Fix
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new
--
-- This fixes the "new row violates row-level security policy for table profiles" error
-- by using a server-side trigger to create the profile row automatically when a user
-- signs up, then a SECURITY DEFINER function to let the frontend set the username
-- without needing a live session (handles email-confirmation-enabled projects too).

-- ============================================================
-- 1. AUTO-CREATE PROFILE ON AUTH USER CREATION (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    -- Temporary placeholder so the NOT NULL constraint is satisfied
    'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. SECURITY DEFINER FUNCTION TO SET USERNAME
--    Called by the frontend after signup — works even when
--    email confirmation is enabled and there is no session yet.
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_profile_username(p_user_id uuid, p_username text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Guard: reject if username is already taken by someone else
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE username = p_username AND id <> p_user_id
  ) THEN
    RAISE EXCEPTION 'username_taken';
  END IF;

  UPDATE public.profiles
  SET username = p_username
  WHERE id = p_user_id;
END;
$$;

-- ============================================================
-- 3. RE-CREATE PROFILES POLICIES (clean slate)
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_all"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;

-- Anyone can read profiles
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

-- Authenticated users can insert their own profile
-- (kept for cases where email confirmation is OFF and session is available)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
