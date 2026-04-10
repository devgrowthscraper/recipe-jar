import { useState, useEffect, useCallback } from "react";
import {
  Search, SlidersHorizontal, UtensilsCrossed, ChefHat,
  Globe, Timer, Leaf, Egg, Sprout,
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

const QUICK_CHIPS: ChipDef[] = [
  { id: "most-liked", label: "Most Liked", sort: "most_liked" },
  { id: "quick",      label: "Quick Meals", field: "time_tag", value: "Under 15 min" },
  { id: "under30",    label: "Under 30 Min", field: "time_tag", values: ["Under 15 min", "15-30 min"] },
];

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
      { id: "indian",   label: "Indian",   field: "cuisine_tag", value: "Indian" },
      { id: "italian",  label: "Italian",  field: "cuisine_tag", value: "Italian" },
      { id: "mexican",  label: "Mexican",  field: "cuisine_tag", value: "Mexican" },
      { id: "chinese",  label: "Chinese",  field: "cuisine_tag", value: "Chinese" },
      { id: "thai",     label: "Thai",     field: "cuisine_tag", value: "Thai" },
      { id: "american", label: "American", field: "cuisine_tag", value: "American" },
      { id: "japanese", label: "Japanese", field: "cuisine_tag", value: "Japanese" },
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RecipesPage() {
  const { user } = useAuth();

  // Read initial search from URL param
  const initialSearch = (() => {
    try { return new URLSearchParams(window.location.search).get("search") ?? ""; }
    catch { return ""; }
  })();

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  function handleSearch() { setDebouncedSearch(search); }

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
  const activeCount = activeChips.size;
  const hasFilters = !!(debouncedSearch || activeFilterDefs.length > 0);

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

    const { data } = await query.limit(100);
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

  return (
    <div className="min-h-screen bg-background">

      {/* ── Search + filter header ── */}
      <div className="bg-gradient-to-b from-orange-50 to-amber-50/60 px-4 pt-8 pb-6">
        <div className="max-w-3xl mx-auto">

          {/* Recipe count */}
          <div className="mb-4 text-center min-h-[20px]">
            {!loading && (
              <p className="text-sm text-neutral-500 font-medium">
                {hasFilters
                  ? (
                    <>
                      <span className="text-orange-500 font-semibold">{recipes.length}</span>
                      {" "}recipe{recipes.length !== 1 ? "s" : ""} found
                      {debouncedSearch && (
                        <span className="text-neutral-400"> for "{debouncedSearch}"</span>
                      )}
                    </>
                  )
                  : (
                    <><span className="text-orange-500 font-semibold">{recipes.length}</span> recipes</>
                  )
                }
              </p>
            )}
          </div>

          {/* Unified search + filter bar */}
          <div className="flex items-center bg-white rounded-2xl shadow-lg overflow-hidden">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-4 border-r border-gray-200 text-sm font-semibold transition-colors duration-200 ${
                showFilters || activeChips.size > 0
                  ? "text-orange-500"
                  : "text-neutral-500 hover:text-orange-500"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeChips.size > 0 ? (
                <span className="text-xs font-bold text-orange-500">{activeChips.size}</span>
              ) : (
                <span>Filter</span>
              )}
            </button>

            <input
              type="text"
              data-testid="input-search"
              placeholder="Search butter chicken, pasta, tofu..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value) setDebouncedSearch("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-4 text-base text-neutral-800 placeholder:text-neutral-400 focus:outline-none bg-transparent"
            />

            <button
              onClick={handleSearch}
              className="flex-shrink-0 mx-3 w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Grouped filter chips */}
          {showFilters && (
            <div className="flex flex-col gap-3 text-left mt-3">
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
                          {chip.id === "vegan"      && <Sprout className="w-3.5 h-3.5" />}
                          {chip.id === "vegetarian" && <Leaf className="w-3.5 h-3.5" />}
                          {chip.id === "eggetarian" && <Egg className="w-3.5 h-3.5" />}
                          {chip.id === "non-veg"    && <UtensilsCrossed className="w-3.5 h-3.5" />}
                          {["indian","italian","mexican","chinese","thai","japanese","american"].includes(chip.id) && <Globe className="w-3.5 h-3.5" />}
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

          {/* Active filter count + clear */}
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
      </div>

      {/* ── Recipe grid ── */}
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-500 font-medium mb-3">
                No recipes found{debouncedSearch ? ` for "${debouncedSearch}"` : ""}
              </p>
              {hasFilters && (
                <button
                  onClick={() => { setSearch(""); setDebouncedSearch(""); setActiveChips(new Set()); }}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  Clear filters
                </button>
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
      </div>

    </div>
  );
}
