import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Search, UtensilsCrossed, Sparkles, X, ArrowUpDown, SlidersHorizontal, ChevronDown } from "lucide-react";
import { supabase, Recipe } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { RecipeCard } from "@/components/RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CUISINE_OPTIONS = ["Indian", "Italian", "Mexican", "Chinese", "American", "Thai", "Japanese", "Mediterranean"];
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];
const TIME_OPTIONS = ["Under 15 min", "15-30 min", "30-60 min", "Over 1 hour"];
const DIET_OPTIONS = ["Vegetarian", "Vegan", "Non-Vegetarian", "Pescatarian"];

type SortMode = "newest" | "most_liked";

function PillGroup({
  label,
  options,
  selected,
  onSelect,
  activeClass,
  inactiveClass,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  activeClass: string;
  inactiveClass: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {options.map((opt) => (
          <button
            key={opt}
            data-testid={`filter-${label.toLowerCase().replace(/\s/g, "-")}-${opt}`}
            onClick={() => onSelect(selected === opt ? "" : opt)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all duration-200 whitespace-nowrap ${
              selected === opt ? activeClass : inactiveClass
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden animate-pulse">
      <div className="h-48 bg-neutral-100 rounded-t-2xl" />
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

export default function FeedPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("recipes")
      .select("*, profiles(id, username, avatar_url)")
      .order(sortMode === "newest" ? "created_at" : "likes_count", { ascending: false });

    if (debouncedSearch) {
      query = query.or(`title.ilike.%${debouncedSearch}%,ingredients.ilike.%${debouncedSearch}%`);
    }
    if (selectedCuisine) query = query.eq("cuisine_tag", selectedCuisine);
    if (selectedDifficulty) query = query.eq("difficulty_tag", selectedDifficulty);
    if (selectedTime) query = query.eq("time_tag", selectedTime);
    if (selectedDiet) query = query.eq("diet_tag", selectedDiet);

    const { data } = await query.limit(30);
    setRecipes(data || []);
    setLoading(false);
  }, [debouncedSearch, selectedCuisine, selectedDifficulty, selectedTime, selectedDiet, sortMode]);

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

  const clearFilters = () => {
    setSelectedCuisine("");
    setSelectedDifficulty("");
    setSelectedTime("");
    setSelectedDiet("");
    setSearch("");
  };

  const tagFilterCount = [selectedCuisine, selectedDifficulty, selectedTime, selectedDiet].filter(Boolean).length;
  const activeFilterCount = [...[selectedCuisine, selectedDifficulty, selectedTime, selectedDiet], debouncedSearch].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      {/* Hero — shown only for logged-out users */}
      {!user && (
        <div className="text-center py-10 mb-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border border-orange-100/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-200">
            <UtensilsCrossed className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-2">
            Your recipes, finally organized.
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base max-w-sm mx-auto mb-7 leading-relaxed">
            Save recipes from anywhere, find them when you need them.
          </p>
          <Link href="/signup">
            <Button
              data-testid="button-get-started"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-7 py-2.5 text-sm font-semibold shadow-lg shadow-orange-200 transition-all duration-200 hover:shadow-xl hover:scale-105"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </Link>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          type="search"
          data-testid="input-search"
          placeholder="Search recipes by name or ingredient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl border-neutral-200 bg-white shadow-sm h-11"
        />
      </div>

      {/* Toolbar row: Filters toggle + Sort */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2">
          {/* Filters toggle button */}
          <button
            data-testid="button-toggle-filters"
            onClick={() => setFiltersOpen((o) => !o)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
              filtersOpen || tagFilterCount > 0
                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-orange-300 hover:text-orange-600"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {tagFilterCount > 0 && (
              <span className="ml-0.5 bg-white text-orange-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
                {tagFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Clear filters badge */}
          {hasFilters && (
            <button
              data-testid="button-clear-filters"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1.5 rounded-full transition-all duration-200"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}

          {!loading && !hasFilters && (
            <p className="text-xs text-neutral-400">{recipes.length} recipe{recipes.length !== 1 ? "s" : ""}</p>
          )}
        </div>

        {/* Sort toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
          <button
            data-testid="sort-newest"
            onClick={() => setSortMode("newest")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              sortMode === "newest"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Newest
          </button>
          <button
            data-testid="sort-most-liked"
            onClick={() => setSortMode("most_liked")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              sortMode === "most_liked"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            Most Liked
          </button>
        </div>
      </div>

      {/* Collapsible filter panel */}
      {filtersOpen && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 mb-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <PillGroup
            label="Cuisine"
            options={CUISINE_OPTIONS}
            selected={selectedCuisine}
            onSelect={setSelectedCuisine}
            activeClass="bg-orange-500 text-white border-orange-500"
            inactiveClass="bg-orange-50 text-orange-700 border-orange-100 hover:border-orange-300"
          />
          <PillGroup
            label="Difficulty"
            options={DIFFICULTY_OPTIONS}
            selected={selectedDifficulty}
            onSelect={setSelectedDifficulty}
            activeClass="bg-blue-500 text-white border-blue-500"
            inactiveClass="bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300"
          />
          <PillGroup
            label="Cook Time"
            options={TIME_OPTIONS}
            selected={selectedTime}
            onSelect={setSelectedTime}
            activeClass="bg-purple-500 text-white border-purple-500"
            inactiveClass="bg-purple-50 text-purple-700 border-purple-100 hover:border-purple-300"
          />
          <PillGroup
            label="Diet"
            options={DIET_OPTIONS}
            selected={selectedDiet}
            onSelect={setSelectedDiet}
            activeClass="bg-green-500 text-white border-green-500"
            inactiveClass="bg-green-50 text-green-700 border-green-100 hover:border-green-300"
          />
        </div>
      )}

      {/* Recipe grid */}
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
              <p className="text-neutral-500 text-sm mb-6">Try adjusting your filters!</p>
              <Button
                data-testid="button-reset-filters"
                onClick={clearFilters}
                variant="outline"
                className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                Reset filters
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">No recipes yet</h3>
              <p className="text-neutral-500 text-sm mb-6">Be the first to share!</p>
              {user ? (
                <Link href="/add-recipe">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-6 font-semibold">
                    Add a Recipe
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-6 font-semibold">
                    Get Started
                  </Button>
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
