import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Search, UtensilsCrossed } from "lucide-react";
import { supabase, Recipe } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { RecipeCard } from "@/components/RecipeCard";
import { Input } from "@/components/ui/input";

// ── Chip definitions ─────────────────────────────────────────────────────────
type ChipDef = {
  id: string;
  label: string;
  sort?: "most_liked";
  field?: "cuisine_tag" | "difficulty_tag" | "time_tag" | "diet_tag";
  value?: string;
  values?: string[]; // for OR within same field
};

const CHIPS: ChipDef[] = [
  { id: "most-liked",   label: "Most Liked",   sort: "most_liked" },
  { id: "quick",        label: "Quick meals",  field: "time_tag",       value: "Under 15 min" },
  { id: "vegetarian",   label: "Vegetarian",   field: "diet_tag",       value: "Vegetarian" },
  { id: "vegan",        label: "Vegan",         field: "diet_tag",       value: "Vegan" },
  { id: "indian",       label: "Indian",        field: "cuisine_tag",    value: "Indian" },
  { id: "italian",      label: "Italian",       field: "cuisine_tag",    value: "Italian" },
  { id: "mexican",      label: "Mexican",       field: "cuisine_tag",    value: "Mexican" },
  { id: "chinese",      label: "Chinese",       field: "cuisine_tag",    value: "Chinese" },
  { id: "thai",         label: "Thai",          field: "cuisine_tag",    value: "Thai" },
  { id: "easy",         label: "Easy",          field: "difficulty_tag", value: "Easy" },
  { id: "under30",      label: "Under 30 min",  field: "time_tag",       values: ["Under 15 min", "15-30 min"] },
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

  // Toggle a chip
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
      query = query.or(`title.ilike.%${debouncedSearch}%,ingredients.ilike.%${debouncedSearch}%`);
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Slim hero (logged-out only) ── */}
      {!user && (
        <div className="text-center py-8 mb-6">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">
            Screenshot it. Save it. Cook it.
          </h1>
          <p className="text-neutral-500 text-base max-w-lg mx-auto leading-relaxed">
            Turn recipe screenshots into your personal cookbook — powered by AI.
          </p>
        </div>
      )}

      {/* ── Search bar ── */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <Input
          type="search"
          data-testid="input-search"
          placeholder="Search by recipe name or ingredient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-2xl border-neutral-200 bg-white shadow-sm focus:shadow-md transition-shadow"
        />
      </div>

      {/* ── Chip row ── */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

      {/* ── Recipe count / loading info ── */}
      {!loading && (
        <p className="text-xs text-neutral-400 mb-5">
          {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
          {hasFilters ? " matching your filters" : ""}
        </p>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
            <UtensilsCrossed className="w-10 h-10 text-orange-300" />
          </div>
          {hasFilters ? (
            <>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">No recipes found</h3>
              <p className="text-neutral-500 text-sm mb-4">Try different filters or clear your search.</p>
              <button
                onClick={() => { setSearch(""); setActiveChips(new Set()); }}
                className="text-sm text-orange-500 hover:text-orange-600 font-semibold underline underline-offset-2 transition-colors"
              >
                Clear all filters →
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">No recipes yet</h3>
              <p className="text-neutral-500 text-sm mb-4">Be the first to share!</p>
              {user ? (
                <Link href="/add-recipe" className="text-sm text-orange-500 hover:text-orange-600 font-semibold underline underline-offset-2 transition-colors">
                  Add a recipe →
                </Link>
              ) : (
                <Link href="/signup" className="text-sm text-orange-500 hover:text-orange-600 font-semibold underline underline-offset-2 transition-colors">
                  Sign up to share →
                </Link>
              )}
            </>
          )}
        </div>
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
  );
}
