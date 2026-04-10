import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Heart, Bookmark, ArrowLeft, ChefHat, Clock, Globe, Leaf, List, User, BarChart3 } from "lucide-react";
import { supabase, Recipe } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { TagBadge } from "@/components/TagBadge";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    async function fetchRecipe() {
      const { data } = await supabase
        .from("recipes")
        .select("*, profiles(id, username, avatar_url)")
        .eq("id", id)
        .single();
      setRecipe(data);
      setLoading(false);
    }
    fetchRecipe();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    async function fetchInteractions() {
      const [likeRes, saveRes] = await Promise.all([
        supabase.from("likes").select("id").eq("user_id", user!.id).eq("recipe_id", id).single(),
        supabase.from("saved_recipes").select("id").eq("user_id", user!.id).eq("recipe_id", id).single(),
      ]);
      setIsLiked(!!likeRes.data);
      setIsSaved(!!saveRes.data);
    }
    fetchInteractions();
  }, [user, id]);

  async function handleLike() {
    if (!user) { setShowAuthModal(true); return; }
    if (likeLoading || !recipe) return;
    setLikeLoading(true);
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setRecipe((prev) => prev ? { ...prev, likes_count: prev.likes_count + (newLiked ? 1 : -1) } : prev);

    if (newLiked) {
      await supabase.from("likes").insert({ user_id: user.id, recipe_id: recipe.id });
      await supabase.from("recipes").update({ likes_count: recipe.likes_count + 1 }).eq("id", recipe.id);
    } else {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("recipe_id", recipe.id);
      await supabase.from("recipes").update({ likes_count: recipe.likes_count - 1 }).eq("id", recipe.id);
    }
    setLikeLoading(false);
  }

  async function handleSave() {
    if (!user) { setShowAuthModal(true); return; }
    if (saveLoading || !recipe) return;
    setSaveLoading(true);
    const newSaved = !isSaved;
    setIsSaved(newSaved);

    if (newSaved) {
      await supabase.from("saved_recipes").insert({ user_id: user.id, recipe_id: recipe.id });
    } else {
      await supabase.from("saved_recipes").delete().eq("user_id", user.id).eq("recipe_id", recipe.id);
    }
    setSaveLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-8 bg-neutral-100 rounded-xl w-1/3 mb-8" />
        <div className="h-64 bg-neutral-100 rounded-2xl mb-6" />
        <div className="h-8 bg-neutral-100 rounded-xl w-2/3 mb-4" />
        <div className="h-4 bg-neutral-100 rounded-full w-full mb-2" />
        <div className="h-4 bg-neutral-100 rounded-full w-5/6" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <ChefHat className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-amber-900 mb-2">Recipe not found</h2>
        <p className="text-neutral-500 mb-6">This recipe may have been removed.</p>
        <Button onClick={() => setLocation("/")} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl">
          Back to Feed
        </Button>
      </div>
    );
  }

  const ingredients = recipe.ingredients.split("\n").filter(Boolean);
  const steps = recipe.steps.split("\n").filter(Boolean);

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8" data-testid={`recipe-detail-${recipe.id}`}>
        {/* Back button */}
        <button
          onClick={() => setLocation("/")}
          data-testid="button-back"
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-orange-500 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </button>

        {/* Image */}
        <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-orange-100 to-amber-50">
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-20 h-20 text-orange-200" />
            </div>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-900 leading-tight mb-2" data-testid="text-recipe-title">
              {recipe.title}
            </h1>
            {recipe.profiles && (
              <Link href={`/user/${recipe.profiles.id}`} className="flex items-center gap-2 mt-1 group">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                  {recipe.profiles.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-neutral-500 group-hover:text-orange-500 transition-colors">
                  @{recipe.profiles.username}
                </span>
              </Link>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-shrink-0">
            <button
              data-testid="button-like"
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium ${
                isLiked
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "bg-white border-neutral-200 text-neutral-600 hover:border-red-200 hover:text-red-500"
              }`}
            >
              <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
              {recipe.likes_count}
            </button>
            <button
              data-testid="button-save"
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium ${
                isSaved
                  ? "bg-orange-50 border-orange-200 text-orange-500"
                  : "bg-white border-neutral-200 text-neutral-600 hover:border-orange-200 hover:text-orange-500"
              }`}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-neutral-600 leading-relaxed mb-5">{recipe.description}</p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {recipe.cuisine_tag && <TagBadge type="cuisine" value={recipe.cuisine_tag} />}
          {recipe.difficulty_tag && <TagBadge type="difficulty" value={recipe.difficulty_tag} />}
          {recipe.time_tag && <TagBadge type="time" value={recipe.time_tag} />}
          {recipe.diet_tag && <TagBadge type="diet" value={recipe.diet_tag} />}
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-lg p-6 mb-5">
          <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-orange-500" />
            Ingredients
          </h2>
          <ul className="flex flex-col gap-2">
            {ingredients.map((ingredient, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-neutral-700 leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-lg p-6">
          <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Instructions
          </h2>
          <ol className="flex flex-col gap-5">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-neutral-700 leading-relaxed text-sm pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
