import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import {
  Search, Camera, Sparkles, BookOpen, PenLine, CheckCircle2,
  ArrowRight, UtensilsCrossed,
} from "lucide-react";
import { supabase, Recipe } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { RecipeCard } from "@/components/RecipeCard";

// ── Chip definitions ──────────────────────────────────────────────────────────
type ChipDef = {
  id: string;
  label: string;
  sort?: "most_liked";
  field?: "cuisine_tag" | "difficulty_tag" | "time_tag" | "diet_tag";
  value?: string;
  values?: string[];
};

const CHIPS: ChipDef[] = [
  { id: "most-liked",  label: "Most Liked",  sort: "most_liked" },
  { id: "quick",       label: "Quick meals", field: "time_tag",       value: "Under 15 min" },
  { id: "vegetarian",  label: "Vegetarian",  field: "diet_tag",       value: "Vegetarian" },
  { id: "vegan",       label: "Vegan",        field: "diet_tag",       value: "Vegan" },
  { id: "indian",      label: "Indian",       field: "cuisine_tag",    value: "Indian" },
  { id: "italian",     label: "Italian",      field: "cuisine_tag",    value: "Italian" },
  { id: "mexican",     label: "Mexican",      field: "cuisine_tag",    value: "Mexican" },
  { id: "chinese",     label: "Chinese",      field: "cuisine_tag",    value: "Chinese" },
  { id: "thai",        label: "Thai",         field: "cuisine_tag",    value: "Thai" },
  { id: "easy",        label: "Easy",         field: "difficulty_tag", value: "Easy" },
  { id: "under30",     label: "Under 30 min", field: "time_tag",       values: ["Under 15 min", "15-30 min"] },
];

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow border border-black/5 overflow-hidden animate-pulse">
      <div className="h-48 bg-neutral-100" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-5 bg-neutral-100 rounded-full w-3/4" />
        <div className="h-3 bg-neutral-100 rounded-full w-full" />
        <div className="h-3 bg-neutral-100 rounded-full w-5/6" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 bg-neutral-100 rounded-full w-16" />
          <div className="h-5 bg-neutral-100 rounded-full w-14" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-neutral-100 mt-2">
          <div className="h-4 bg-neutral-100 rounded-full w-10" />
          <div className="h-4 bg-neutral-100 rounded-full w-4" />
        </div>
      </div>
    </div>
  );
}

// ── How-it-works feature card ─────────────────────────────────────────────────
function FeatureCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
      <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mt-4 text-amber-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{description}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  function toggleChip(id: string) {
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isSortedByLiked = activeChips.has("most-liked");
  const filterChips = CHIPS.filter((c) => !c.sort && activeChips.has(c.id));

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("recipes")
      .select("*, profiles(id, username, avatar_url)")
      .order(isSortedByLiked ? "likes_count" : "created_at", { ascending: false });

    if (debouncedSearch) {
      query = query.or(
        `title.ilike.%${debouncedSearch}%,ingredients.ilike.%${debouncedSearch}%`,
      );
    }

    for (const chip of filterChips) {
      if (chip.values) {
        query = (query as any).in(chip.field, chip.values);
      } else if (chip.field && chip.value) {
        query = query.eq(chip.field, chip.value);
      }
    }

    const { data } = await query.limit(30);
    setRecipes(data || []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeChips]);

  const fetchUserInteractions = useCallback(async () => {
    if (!user) return;
    const [savedRes, likesRes] = await Promise.all([
      supabase.from("saved_recipes").select("recipe_id").eq("user_id", user.id),
      supabase.from("likes").select("recipe_id").eq("user_id", user.id),
    ]);
    setSavedIds(new Set((savedRes.data || []).map((r) => r.recipe_id)));
    setLikedIds(new Set((likesRes.data || []).map((r) => r.recipe_id)));
  }, [user]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);
  useEffect(() => { fetchUserInteractions(); }, [fetchUserInteractions]);

  const hasFilters = debouncedSearch || filterChips.length > 0;

  // ── Chip row (shared between hero and feed header) ────────────────────────
  const ChipRow = () => (
    <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {CHIPS.map((chip) => {
        const active = activeChips.has(chip.id);
        return (
          <button
            key={chip.id}
            data-testid={`chip-${chip.id}`}
            onClick={() => toggleChip(chip.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
              active
                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-orange-300 hover:text-orange-600"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col">

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-orange-50 to-amber-50 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-amber-900 mb-3 leading-tight">
            Stop losing recipes you love
          </h1>
          <p className="text-lg text-amber-700/70 mb-8 max-w-xl mx-auto leading-relaxed">
            Screenshot any recipe from Instagram or YouTube. AI organizes it for you.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
            <input
              type="search"
              data-testid="input-search"
              placeholder="Search by recipe name or ingredient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white bg-white shadow-lg text-base text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
            />
          </div>

          {/* Chip row */}
          <div className="max-w-2xl mx-auto">
            <ChipRow />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2 — HOW IT WORKS
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-amber-900 text-center mb-10">
            How Recipe Jar works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              iconBg="bg-orange-100"
              icon={<Camera className="w-8 h-8 text-orange-500" />}
              title="Screenshot a recipe"
              description="See a recipe on Instagram or YouTube? Just screenshot it and upload. Our AI reads the image and extracts everything."
            />
            <FeatureCard
              iconBg="bg-purple-100"
              icon={<Sparkles className="w-8 h-8 text-purple-500" />}
              title="AI organizes it for you"
              description="AI automatically tags your recipe by cuisine, difficulty, cook time, and diet type. No manual sorting needed."
            />
            <FeatureCard
              iconBg="bg-teal-100"
              icon={<BookOpen className="w-8 h-8 text-teal-500" />}
              title="Your personal cookbook"
              description="All your recipes in one place. Search, filter, and find exactly what you want when it is time to cook."
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 3 — POPULAR RECIPES (the actual feed)
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-4 bg-background" id="explore">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-amber-900">Explore recipes</h2>
            {!loading && (
              <span className="text-sm text-neutral-400">
                {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
                {hasFilters ? " matching your filters" : ""}
              </span>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : recipes.length === 0 ? (
            hasFilters ? (
              // No-results empty state
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
                  <UtensilsCrossed className="w-10 h-10 text-orange-300" />
                </div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">No recipes found</h3>
                <p className="text-neutral-500 text-sm mb-4">Try different filters or clear your search.</p>
                <button
                  onClick={() => { setSearch(""); setActiveChips(new Set()); }}
                  className="text-sm text-orange-500 hover:text-orange-600 font-semibold underline underline-offset-2 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              // Zero-recipe community empty state
              <div className="w-full rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-12 text-center">
                <h3 className="text-xl font-bold text-amber-900 mb-2">
                  The community is just getting started
                </h3>
                <p className="text-amber-700/70 mb-8">
                  Be one of the first to share a recipe
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <Link
                    href={user ? "/add-recipe" : "/login"}
                    className="bg-white rounded-2xl p-6 text-left shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-200 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3 group-hover:bg-orange-500 transition-colors">
                      <PenLine className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
                    </div>
                    <p className="font-semibold text-amber-900 text-sm">Write a recipe</p>
                    <p className="text-xs text-neutral-500 mt-1">Share your favourite dish with the community</p>
                  </Link>
                  <Link
                    href={user ? "/add-recipe" : "/login"}
                    className="bg-white rounded-2xl p-6 text-left shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-200 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-500 transition-colors">
                      <Camera className="w-5 h-5 text-purple-500 group-hover:text-white transition-colors" />
                    </div>
                    <p className="font-semibold text-amber-900 text-sm">Import from screenshot</p>
                    <p className="text-xs text-neutral-500 mt-1">Upload a screenshot and let AI extract the recipe</p>
                  </Link>
                </div>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={savedIds.has(recipe.id)}
                  isLiked={likedIds.has(recipe.id)}
                  onLikeToggle={fetchUserInteractions}
                  onSaveToggle={fetchUserInteractions}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 4 — IMPORT FEATURE SHOWCASE
      ════════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <div>
            <h2 className="text-2xl font-bold text-amber-900 mb-4">
              Import recipes from anywhere
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Screenshot a recipe from Instagram, YouTube, or any app. Upload it to
              Recipe Jar and our AI instantly extracts the title, ingredients, and steps
              into a clean recipe card.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Works with Instagram screenshots",
                "Works with YouTube screenshots",
                "AI extracts ingredients and steps automatically",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={user ? "/add-recipe" : "/login"}
              className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Try it now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: visual mockup */}
          <div className="flex items-center justify-center gap-4 select-none">
            {/* "Screenshot" card */}
            <div className="relative">
              <div className="w-40 bg-gray-200 rounded-2xl p-3 rotate-3 shadow-md border border-gray-300">
                <div className="h-3 bg-gray-400 rounded-full w-3/4 mb-2 opacity-60" />
                <div className="h-24 bg-gray-300 rounded-xl mb-2 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <div className="h-2 bg-gray-400 rounded-full opacity-50 mb-1" />
                <div className="h-2 bg-gray-400 rounded-full w-5/6 opacity-40 mb-1" />
                <div className="h-2 bg-gray-400 rounded-full w-4/6 opacity-30" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-6 h-6 text-orange-400 flex-shrink-0" />

            {/* "Recipe card" result */}
            <div className="w-44 bg-white rounded-2xl p-4 shadow-lg border border-orange-100">
              <div className="h-3 bg-orange-200 rounded-full w-2/3 mb-2" />
              <div className="h-20 bg-orange-50 rounded-xl mb-3 flex items-center justify-center">
                <UtensilsCrossed className="w-7 h-7 text-orange-300" />
              </div>
              <div className="h-2 bg-neutral-100 rounded-full mb-1.5" />
              <div className="h-2 bg-neutral-100 rounded-full w-5/6 mb-1.5" />
              <div className="h-2 bg-neutral-100 rounded-full w-4/6" />
              <div className="flex gap-1.5 mt-3">
                <div className="h-4 rounded-full bg-orange-100 w-12" />
                <div className="h-4 rounded-full bg-purple-100 w-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 5 — SIGN UP CTA (logged-out only)
      ════════════════════════════════════════════════════════════════ */}
      {!user && (
        <section className="py-8 px-4">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl py-16 px-6 text-center max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-3">
              Ready to build your cookbook?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Join the community and never lose a recipe again.
            </p>
            <Link href="/signup">
              <button className="bg-white text-orange-600 font-bold rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
                Create Free Account
              </button>
            </Link>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          SECTION 6 — FOOTER
      ════════════════════════════════════════════════════════════════ */}
      <footer className="bg-amber-900 text-white/60 py-10 px-4 mt-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            {/* Brand */}
            <div>
              <p className="text-white font-bold text-lg mb-1">Recipe Jar</p>
              <p className="text-sm">Save, share, and rediscover recipes.</p>
            </div>
            {/* Nav links */}
            <div className="flex gap-6 text-sm">
              <Link href="/" className="hover:text-white transition-colors">Feed</Link>
              {user && (
                <Link href="/add-recipe" className="hover:text-white transition-colors">Add Recipe</Link>
              )}
              <Link href={user ? "/profile" : "/login"} className="hover:text-white transition-colors">
                {user ? "My Profile" : "Sign In"}
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-xs text-white/40">
            {new Date().getFullYear()} Recipe Jar. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
