import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Search, Filter, ChefHat, Sparkles } from "lucide-react";
import { supabase, Recipe } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { RecipeCard } from "@/components/RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CUISINE_TAGS = ["Italian", "Mexican", "Asian", "Indian", "Mediterranean", "American", "French", "Japanese"];
const DIFFICULTY_TAGS = ["Easy", "Medium", "Hard"];
const TIME_TAGS = ["Under 15 min", "Under 30 min", "Under 1 hour", "Over 1 hour"];
const DIET_TAGS = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Keto", "Paleo"];

export default function FeedPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("recipes")
      .select("*, profiles(id, username, avatar_url)")
      .order("created_at", { ascending: false });

    if (debouncedSearch) {
      query = query.ilike("title", `%${debouncedSearch}%`);
    }
    if (selectedCuisine) query = query.eq("cuisine_tag", selectedCuisine);
    if (selectedDifficulty) query = query.eq("difficulty_tag", selectedDifficulty);
    if (selectedTime) query = query.eq("time_tag", selectedTime);
    if (selectedDiet) query = query.eq("diet_tag", selectedDiet);

    const { data } = await query.limit(48);
    setRecipes(data || []);
    setLoading(false);
  }, [debouncedSearch, selectedCuisine, selectedDifficulty, selectedTime, selectedDiet]);

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

  const hasFilters = selectedCuisine || selectedDifficulty || selectedTime || selectedDiet || search;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero for logged-out users */}
      {!user && (
        <div className="text-center py-12 mb-10 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border border-orange-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-3">
            Your recipes, finally organized.
          </h1>
          <p className="text-neutral-500 text-base sm:text-lg max-w-md mx-auto mb-8 leading-relaxed">
            Save recipes from anywhere, find them when you need them.
          </p>
          <Link href="/signup">
            <Button
              data-testid="button-get-started"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-8 py-3 text-base font-semibold shadow-lg shadow-orange-200 transition-all duration-200 hover:shadow-xl hover:scale-105"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </Link>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              type="search"
              data-testid="input-search"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl border-neutral-200 bg-white shadow-sm h-11"
            />
          </div>
          <Button
            data-testid="button-filter"
            variant="outline"
            onClick={() => setFilterOpen(!filterOpen)}
            className={`rounded-xl border-neutral-200 bg-white shadow-sm h-11 px-4 gap-2 ${filterOpen ? "border-orange-300 text-orange-600" : ""}`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && <span className="w-2 h-2 rounded-full bg-orange-500" />}
          </Button>
          {hasFilters && (
            <Button
              data-testid="button-clear-filters"
              variant="ghost"
              onClick={clearFilters}
              className="rounded-xl text-neutral-500 hover:text-neutral-700 h-11 px-4"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-lg p-5 flex flex-col gap-4">
            {/* Cuisine */}
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Cuisine</p>
              <div className="flex flex-wrap gap-2">
                {CUISINE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    data-testid={`filter-cuisine-${tag}`}
                    onClick={() => setSelectedCuisine(selectedCuisine === tag ? "" : tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                      selectedCuisine === tag
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Difficulty</p>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    data-testid={`filter-difficulty-${tag}`}
                    onClick={() => setSelectedDifficulty(selectedDifficulty === tag ? "" : tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                      selectedDifficulty === tag
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Cook Time</p>
              <div className="flex flex-wrap gap-2">
                {TIME_TAGS.map((tag) => (
                  <button
                    key={tag}
                    data-testid={`filter-time-${tag}`}
                    onClick={() => setSelectedTime(selectedTime === tag ? "" : tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                      selectedTime === tag
                        ? "bg-purple-500 text-white border-purple-500"
                        : "bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Diet */}
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Diet</p>
              <div className="flex flex-wrap gap-2">
                {DIET_TAGS.map((tag) => (
                  <button
                    key={tag}
                    data-testid={`filter-diet-${tag}`}
                    onClick={() => setSelectedDiet(selectedDiet === tag ? "" : tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                      selectedDiet === tag
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-green-50 text-green-600 border-green-100 hover:border-green-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-neutral-500 mb-5">
          {recipes.length === 0 ? "No recipes found" : `${recipes.length} recipe${recipes.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Recipe grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden animate-pulse">
              <div className="h-48 bg-neutral-100" />
              <div className="p-5 flex flex-col gap-3">
                <div className="h-4 bg-neutral-100 rounded-full w-3/4" />
                <div className="h-3 bg-neutral-100 rounded-full w-full" />
                <div className="h-3 bg-neutral-100 rounded-full w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
            <ChefHat className="w-10 h-10 text-orange-300" />
          </div>
          <h3 className="text-lg font-semibold text-amber-900 mb-2">No recipes here yet</h3>
          <p className="text-neutral-500 text-sm mb-6">
            {hasFilters ? "Try adjusting your filters." : "Be the first to share a recipe!"}
          </p>
          {user && (
            <Link href="/add-recipe">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-6 font-semibold">
                Add a Recipe
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
