# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a full-stack Recipe Jar web application.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (shared api-server); Supabase (recipe-jar frontend)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### recipe-jar (Main App)
- **Type**: React + Vite web app
- **Preview path**: `/` (root)
- **Port**: 23134
- **Description**: Full-stack Recipe Jar app using Supabase for auth and database
- **Key files**:
  - `artifacts/recipe-jar/src/lib/supabase.ts` — Supabase client + types
  - `artifacts/recipe-jar/src/lib/auth-context.tsx` — Auth context provider
  - `artifacts/recipe-jar/src/pages/feed.tsx` — Main recipe feed page
  - `artifacts/recipe-jar/src/pages/recipe-detail.tsx` — Recipe detail page
  - `artifacts/recipe-jar/src/pages/add-recipe.tsx` — Add recipe form
  - `artifacts/recipe-jar/src/pages/profile.tsx` — User profile with saved recipes
  - `artifacts/recipe-jar/src/pages/login.tsx` — Login page
  - `artifacts/recipe-jar/src/pages/signup.tsx` — Signup with username step
  - `artifacts/recipe-jar/src/components/Navbar.tsx` — Sticky glassmorphism navbar
  - `artifacts/recipe-jar/src/components/RecipeCard.tsx` — Recipe card with like/save
  - `artifacts/recipe-jar/src/components/AuthModal.tsx` — Login prompt modal
  - `artifacts/recipe-jar/src/components/TagBadge.tsx` — Colored tag pill badge

### api-server (Backend)
- **Type**: Express API
- **Preview path**: `/api`
- **Port**: 8080

## Supabase Setup

Run `supabase-setup.sql` in the Supabase SQL Editor to create all tables and RLS policies.

### Tables:
1. `profiles` — user profiles (id, username, avatar_url)
2. `recipes` — recipes with tags, ingredients, steps, likes_count
3. `saved_recipes` — user saved recipes (many-to-many)
4. `likes` — user recipe likes (many-to-many)

### Required Env Secrets:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Design System

- **Primary**: Orange (#F97316)
- **Background**: Warm cream (#FFFBEB)
- **Cards**: White with rounded-2xl and shadow-lg
- **Font**: Inter (Google Fonts)
- **Tag badges**: Cuisine=orange, Difficulty=blue, Time=purple, Diet=green
