import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import {
  Search, Camera, Sparkles, BookOpen, PenLine, CheckCircle2,
  ArrowRight, UtensilsCrossed, TrendingUp, Timer, ChefHat,
  Globe, Flame, Leaf, Egg, Sprout, SlidersHorizontal,
} from "lucide-react";
import { supabase, Recipe } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { RecipeCard } from "@/components/RecipeCard";

// ── Chip definitions (pills — cuisine, time, difficulty, sort) ────────────────
type ChipDef = {
  id: string;
  label: string;
  sort?: "most_liked";
  field?: "cuisine_tag" | "difficulty_tag" | "time_tag" | "diet_tag";
  value?: string;
  values?: string[];
};

// ── Quick filters (always-visible top row) ────────────────────────────────────
const QUICK_CHIPS: ChipDef[] = [
  { id: "most-liked", label: "Most Liked", sort: "most_liked" },
  { id: "quick",      label: "Quick Meals", field: "time_tag", value: "Under 15 min" },
  { id: "under30",    label: "Under 30 Min", field: "time_tag", values: ["Under 15 min", "15-30 min"] },
];

// ── Grouped filter sections ───────────────────────────────────────────────────
type FilterGroup = { label: string; chips: ChipDef[] };

const FILTER_GROUPS: FilterGroup[] = [
  {
    label: "Diet",
    chips: [
      { id: "vegan",      label: "Vegan",       field: "diet_tag", value: "Vegan" },
      { id: "vegetarian", label: "Vegetarian",   field: "diet_tag", value: "Vegetarian" },
      { id: "eggetarian", label: "Eggetarian",   field: "diet_tag", value: "Eggetarian" },
      { id: "non-veg",    label: "Non-Veg",      field: "diet_tag", value: "Non-Vegetarian" },
    ],
  },
  {
    label: "Cuisine",
    chips: [
      { id: "indian",  label: "Indian",  field: "cuisine_tag", value: "Indian" },
      { id: "italian", label: "Italian", field: "cuisine_tag", value: "Italian" },
      { id: "chinese", label: "Chinese", field: "cuisine_tag", value: "Chinese" },
      { id: "thai",    label: "Thai",    field: "cuisine_tag", value: "Thai" },
    ],
  },
  {
    label: "Difficulty",
    chips: [
      { id: "easy",   label: "Easy",   field: "difficulty_tag", value: "Easy" },
      { id: "medium", label: "Medium", field: "difficulty_tag", value: "Medium" },
      { id: "hard",   label: "Hard",   field: "difficulty_tag", value: "Hard" },
    ],
  },
  {
    label: "Cook Time",
    chips: [
      { id: "under15", label: "Under 15 Min", field: "time_tag", value: "Under 15 min" },
      { id: "1530",    label: "15–30 Min",    field: "time_tag", value: "15-30 min" },
      { id: "30plus",  label: "30+ Min",      field: "time_tag", value: "30+ min" },
    ],
  },
];

// All filter defs combined for query building
const ALL_FILTERS: ChipDef[] = [
  ...QUICK_CHIPS,
  ...FILTER_GROUPS.flatMap((g) => g.chips),
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

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  icon, iconBg, title, description,
}: { icon: React.ReactNode; iconBg: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
      <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mt-4 text-amber-900">{title}</h3>
      <p className="text-sm text-neutral-700 mt-2 leading-relaxed font-medium">{description}</p>
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
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

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
  const activeFilterDefs = ALL_FILTERS.filter((c) => !c.sort && activeChips.has(c.id));

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

    for (const f of activeFilterDefs) {
      if (f.values) {
        query = (query as any).in(f.field, f.values);
      } else if (f.field && f.value) {
        query = query.eq(f.field, f.value);
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

  const hasFilters = debouncedSearch || activeFilterDefs.length > 0;
  const activeCount = activeChips.size;

  return (
    <div className="flex flex-col min-h-screen">

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-orange-50 to-amber-50/60 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-amber-900 mb-3 leading-tight">
            Stop Losing Recipes You Love
          </h1>
          <p className="text-base text-neutral-700 mb-8 max-w-xl mx-auto leading-relaxed">
            Screenshot any recipe from Instagram or YouTube. AI organizes it for you instantly.
          </p>

          {/* Search bar + filter toggle unified */}
          <div className="relative max-w-2xl mx-auto mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
            <input
              type="search"
              data-testid="input-search"
              placeholder="Search by recipe name or ingredient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-28 py-4 rounded-2xl bg-white shadow-lg text-base text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all border border-orange-100"
            />
            {/* Divider + filter button inside the bar */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="w-px h-5 bg-neutral-200" />
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  showFilters || activeChips.size > 0
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-neutral-500 hover:text-orange-500 hover:bg-orange-50"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeChips.size > 0 ? (
                  <span className={`text-xs font-bold ${showFilters || activeChips.size > 0 ? "text-white" : "text-orange-500"}`}>
                    {activeChips.size}
                  </span>
                ) : (
                  <span>Filter</span>
                )}
              </button>
            </div>
          </div>

          {/* ── Grouped filters ── */}
          {showFilters && (
          <div className="max-w-2xl mx-auto flex flex-col gap-3 text-left mt-3">
            {FILTER_GROUPS.map((group) => (
              <div key={group.label} className="flex items-start gap-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide pt-2 w-20 flex-shrink-0 text-right whitespace-nowrap">
                  {group.label}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {group.chips.map((chip) => {
                    const active = activeChips.has(chip.id);
                    return (
                      <button
                        key={chip.id}
                        data-testid={`chip-${chip.id}`}
                        onClick={() => toggleChip(chip.id)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                          active
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                            : "bg-white text-neutral-600 border-neutral-200 hover:border-orange-300 hover:text-orange-600"
                        }`}
                      >
                        {chip.id === "vegan"       && <Sprout className="w-3.5 h-3.5" />}
                        {chip.id === "vegetarian"  && <Leaf className="w-3.5 h-3.5" />}
                        {chip.id === "eggetarian" && <Egg className="w-3.5 h-3.5" />}
                        {chip.id === "non-veg"    && <UtensilsCrossed className="w-3.5 h-3.5" />}
                        {["indian","italian","mexican","chinese","thai","japanese"].includes(chip.id) && <Globe className="w-3.5 h-3.5" />}
                        {["easy","medium","hard"].includes(chip.id) && <ChefHat className="w-3.5 h-3.5" />}
                        {["under15","1530","30plus"].includes(chip.id) && <Timer className="w-3.5 h-3.5" />}
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Active filter summary */}
          {activeCount > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-xs text-amber-700 font-medium">
                {activeCount} filter{activeCount > 1 ? "s" : ""} active
              </span>
              <button
                onClick={() => setActiveChips(new Set())}
                className="text-xs text-orange-500 hover:text-orange-600 font-semibold underline underline-offset-2 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2 — HOW IT WORKS
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-amber-900 text-center mb-10">
            How Recipe Jar Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              iconBg="bg-orange-100"
              icon={<Camera className="w-8 h-8 text-orange-500" />}
              title="Capture Recipes"
              description="See a recipe on Instagram or YouTube? Screenshot it and upload. Our AI reads the image and extracts everything."
            />
            <FeatureCard
              iconBg="bg-purple-100"
              icon={<Sparkles className="w-8 h-8 text-purple-500" />}
              title="AI Organizes It For You"
              description="AI automatically tags your recipe by cuisine, difficulty, cook time, and diet type. No manual sorting needed."
            />
            <FeatureCard
              iconBg="bg-teal-100"
              icon={<BookOpen className="w-8 h-8 text-teal-500" />}
              title="Your Personal Cookbook"
              description="All your recipes in one place. Search, filter, and find exactly what you want when it is time to cook."
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 3 — EXPLORE RECIPES
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-4 bg-background" id="explore">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-amber-900">Start Your Recipe Journey</h2>
            <p className="text-gray-600 text-center mt-2 font-medium">Create your own recipes or instantly import from a screenshot</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : recipes.length === 0 ? (
            hasFilters ? (
              <div className="text-center py-20 max-w-sm mx-auto">
                <div className="text-6xl mb-5">🔍</div>
                <h3 className="text-lg font-bold text-amber-900 mb-2">No Recipes Found</h3>
                <p className="text-neutral-500 text-sm mb-5 leading-relaxed">
                  No recipes match your current filters. Try adjusting or clearing them.
                </p>
                <button
                  onClick={() => { setSearch(""); setActiveChips(new Set()); }}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                  <Link
                    href={user ? "/add-recipe" : "/login"}
                    className="flex items-start gap-4 bg-white rounded-2xl px-5 py-5 text-left shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-300 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex-shrink-0 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                      <PenLine className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-900 text-base mb-0.5">Write a Recipe</p>
                      <p className="text-sm text-neutral-500 leading-relaxed font-semibold">Type out a recipe you love and share it with everyone</p>
                    </div>
                  </Link>
                  <Link
                    href={user ? "/add-recipe" : "/login"}
                    className="flex items-start gap-4 bg-white rounded-2xl px-5 py-5 text-left shadow-sm border border-purple-100 hover:shadow-md hover:border-purple-300 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex-shrink-0 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                      <Camera className="w-5 h-5 text-purple-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-900 text-base mb-0.5">Import a Screenshot</p>
                      <p className="text-sm text-neutral-500 leading-relaxed font-semibold">Upload a screenshot and AI extracts it into your recipe card</p>
                    </div>
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
      <section className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-amber-900 mb-4">
              Import Recipes From Anywhere
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Screenshot a recipe from Instagram, YouTube, or any app. Upload it and our AI
              instantly extracts the title, ingredients, and steps into a clean recipe card.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Works with Instagram screenshots",
                "Works with YouTube screenshots",
                "AI extracts ingredients and steps automatically",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-neutral-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={user ? "/add-recipe" : "/login"}
              className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors shadow-md"
            >
              Try It Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Visual mockup */}
          <div className="flex items-center justify-center gap-5 select-none bg-orange-50/60 rounded-3xl p-8">
            <div className="relative">
              <div className="w-36 bg-neutral-200 rounded-2xl p-3 rotate-3 shadow-md border border-neutral-300">
                <div className="h-2.5 bg-neutral-400 rounded-full w-3/4 mb-2 opacity-60" />
                <div className="h-20 bg-neutral-300 rounded-xl mb-2 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-neutral-400" />
                </div>
                <div className="h-1.5 bg-neutral-400 rounded-full opacity-50 mb-1" />
                <div className="h-1.5 bg-neutral-400 rounded-full w-5/6 opacity-40 mb-1" />
                <div className="h-1.5 bg-neutral-400 rounded-full w-4/6 opacity-30" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-orange-400 flex-shrink-0" />
            <div className="w-40 bg-white rounded-2xl p-4 shadow-lg border border-orange-100">
              <div className="h-2.5 bg-orange-200 rounded-full w-2/3 mb-2" />
              <div className="h-16 bg-orange-50 rounded-xl mb-3 flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-orange-300" />
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full mb-1.5" />
              <div className="h-1.5 bg-neutral-100 rounded-full w-5/6 mb-1.5" />
              <div className="h-1.5 bg-neutral-100 rounded-full w-4/6" />
              <div className="flex gap-1.5 mt-3">
                <div className="h-4 rounded-full bg-green-100 w-14 flex items-center justify-center">
                  <span className="text-[9px] text-green-600 font-semibold">Vegan</span>
                </div>
                <div className="h-4 rounded-full bg-orange-100 w-12 flex items-center justify-center">
                  <span className="text-[9px] text-orange-600 font-semibold">Easy</span>
                </div>
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
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl py-16 px-6 text-center max-w-5xl mx-auto shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-3">
              Ready To Build Your Cookbook?
            </h2>
            <p className="text-lg text-white/85 mb-8">
              Join the community and never lose a recipe again.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-white text-orange-500 font-bold rounded-xl px-8 py-3.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-sm no-underline"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          SECTION 6 — FOOTER
      ════════════════════════════════════════════════════════════════ */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🫙</span>
                <p className="text-amber-900 font-bold text-lg">Recipe Jar</p>
              </div>
              <p className="text-sm text-neutral-600">Save, share, and rediscover recipes.</p>
            </div>
            <div className="flex gap-8 text-sm">
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-neutral-900 mb-1">Browse</p>
                <Link href="/" className="text-neutral-600 hover:text-orange-500 transition-colors">Feed</Link>
                {user && (
                  <Link href="/add-recipe" className="text-neutral-600 hover:text-orange-500 transition-colors">Add Recipe</Link>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-neutral-900 mb-1">Account</p>
                <Link
                  href={user ? "/profile" : "/login"}
                  className="text-neutral-600 hover:text-orange-500 transition-colors"
                >
                  {user ? "My Profile" : "Sign In"}
                </Link>
                {!user && (
                  <Link href="/signup" className="text-neutral-600 hover:text-orange-500 transition-colors">
                    Create Account
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-5 text-xs text-neutral-400">
            {new Date().getFullYear()} Recipe Jar. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
