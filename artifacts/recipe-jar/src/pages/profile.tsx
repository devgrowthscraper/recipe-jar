import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ChefHat, Bookmark, Heart, LogOut, Edit3 } from "lucide-react";
import { supabase, Recipe } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { RecipeCard } from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";

type Tab = "myRecipes" | "saved";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("myRecipes");
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      setLoading(true);
      const [myRes, savedRes, likesRes] = await Promise.all([
        supabase.from("recipes").select("*, profiles(id, username, avatar_url)").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("saved_recipes").select("recipe_id, recipes(*, profiles(id, username, avatar_url))").eq("user_id", user!.id).order("saved_at", { ascending: false }),
        supabase.from("likes").select("recipe_id").eq("user_id", user!.id),
      ]);

      setMyRecipes(myRes.data || []);
      setSavedRecipes((savedRes.data || []).map((r: { recipe_id: string; recipes: Recipe | null }) => r.recipes).filter(Boolean) as Recipe[]);
      setLikedIds(new Set((likesRes.data || []).map((r) => r.recipe_id)));
      setSavedIds(new Set((savedRes.data || []).map((r: { recipe_id: string }) => r.recipe_id)));
      setLoading(false);
    }
    fetchData();
  }, [user]);

  if (authLoading || !user || !profile) return null;

  const displayedRecipes = tab === "myRecipes" ? myRecipes : savedRecipes;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900" data-testid="text-profile-username">
                @{profile.username}
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
              <div className="flex gap-4 mt-2">
                <span className="text-sm font-medium text-neutral-700">
                  <span className="text-amber-900 font-bold">{myRecipes.length}</span> recipes
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  <span className="text-amber-900 font-bold">{savedRecipes.length}</span> saved
                </span>
              </div>
            </div>
          </div>
          <button
            data-testid="button-logout"
            onClick={() => { signOut(); setLocation("/"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:text-red-500 hover:border-red-200 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 mb-6 w-fit">
        <button
          data-testid="tab-my-recipes"
          onClick={() => setTab("myRecipes")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === "myRecipes"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-neutral-600 hover:text-orange-500"
          }`}
        >
          <ChefHat className="w-4 h-4" />
          My Recipes
        </button>
        <button
          data-testid="tab-saved"
          onClick={() => setTab("saved")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === "saved"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-neutral-600 hover:text-orange-500"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden animate-pulse">
              <div className="h-48 bg-neutral-100" />
              <div className="p-5 flex flex-col gap-3">
                <div className="h-4 bg-neutral-100 rounded-full w-3/4" />
                <div className="h-3 bg-neutral-100 rounded-full w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedRecipes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
            {tab === "myRecipes" ? (
              <ChefHat className="w-10 h-10 text-orange-300" />
            ) : (
              <Bookmark className="w-10 h-10 text-orange-300" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            {tab === "myRecipes" ? "No recipes yet" : "Nothing saved yet"}
          </h3>
          <p className="text-neutral-500 text-sm mb-6">
            {tab === "myRecipes"
              ? "Share your first recipe with the community."
              : "Browse the feed and save recipes you love."}
          </p>
          {tab === "myRecipes" ? (
            <Link href="/add-recipe">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-6 font-semibold">
                Add a Recipe
              </Button>
            </Link>
          ) : (
            <Link href="/">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-6 font-semibold">
                Browse Feed
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSaved={savedIds.has(recipe.id)}
              isLiked={likedIds.has(recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
