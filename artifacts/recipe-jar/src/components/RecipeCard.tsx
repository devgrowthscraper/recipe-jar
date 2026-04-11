import { useState } from "react";
import { Link } from "wouter";
import { Heart, Bookmark, UtensilsCrossed, ChefHat, Clock } from "lucide-react";
import { Recipe } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "./AuthModal";

type RecipeCardProps = {
  recipe: Recipe;
  isSaved?: boolean;
  isLiked?: boolean;
  onLikeToggle?: () => void;
  onSaveToggle?: () => void;
};

const DIET_STYLES: Record<string, string> = {
  "Vegan":          "bg-green-50 text-green-700",
  "Vegetarian":     "bg-emerald-50 text-emerald-700",
  "Eggetarian":     "bg-yellow-50 text-yellow-700",
  "Non-Vegetarian": "bg-rose-50 text-rose-700",
};

export function RecipeCard({ recipe, isSaved = false, isLiked = false, onLikeToggle, onSaveToggle }: RecipeCardProps) {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
  const [optimisticSaved, setOptimisticSaved] = useState(isSaved);
  const [optimisticLikes, setOptimisticLikes] = useState(recipe.likes_count);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuthModal(true); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    const newLiked = !optimisticLiked;
    const newCount = newLiked ? optimisticLikes + 1 : optimisticLikes - 1;
    setOptimisticLiked(newLiked);
    setOptimisticLikes(newCount);
    if (newLiked) {
      await supabase.from("likes").insert({ user_id: user.id, recipe_id: recipe.id });
      await supabase.from("recipes").update({ likes_count: newCount }).eq("id", recipe.id);
    } else {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("recipe_id", recipe.id);
      await supabase.from("recipes").update({ likes_count: newCount }).eq("id", recipe.id);
    }
    onLikeToggle?.();
    setLikeLoading(false);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuthModal(true); return; }
    if (saveLoading) return;
    setSaveLoading(true);
    const newSaved = !optimisticSaved;
    setOptimisticSaved(newSaved);
    if (newSaved) {
      await supabase.from("saved_recipes").insert({ user_id: user.id, recipe_id: recipe.id });
    } else {
      await supabase.from("saved_recipes").delete().eq("user_id", user.id).eq("recipe_id", recipe.id);
    }
    onSaveToggle?.();
    setSaveLoading(false);
  };

  return (
    <>
      <Link href={`/recipe/${recipe.id}`}>
        <div
          data-testid={`card-recipe-${recipe.id}`}
          className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full cursor-pointer"
        >
          {/* Image with like pill overlay */}
          <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden flex-shrink-0">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UtensilsCrossed className="w-14 h-14 text-amber-200" />
              </div>
            )}

            {/* Like pill */}
            <button
              data-testid={`button-like-${recipe.id}`}
              onClick={handleLike}
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-sm hover:scale-105 transition-all duration-200"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${optimisticLiked ? "text-red-500 fill-red-500" : "text-gray-400"}`}
              />
              <span className={`text-xs font-semibold ${optimisticLiked ? "text-red-500" : "text-gray-500"}`}>
                {optimisticLikes}
              </span>
            </button>
          </div>

          {/* Card body */}
          <div className="p-4 flex flex-col flex-1">

            {/* Cuisine tag */}
            {recipe.cuisine_tag && (
              <span className="inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800 mb-2">
                {recipe.cuisine_tag}
              </span>
            )}

            {/* Title */}
            <h3
              data-testid={`text-recipe-title-${recipe.id}`}
              className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2"
            >
              {recipe.title}
            </h3>

            {/* Difficulty + time */}
            {(recipe.difficulty_tag || recipe.time_tag) && (
              <div className="flex items-center gap-3 mb-3">
                {recipe.difficulty_tag && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <ChefHat className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    {recipe.difficulty_tag}
                  </span>
                )}
                {recipe.time_tag && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    {recipe.time_tag}
                  </span>
                )}
              </div>
            )}

            <div className="flex-1" />

            {/* Bottom: author + diet + save */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold flex-shrink-0">
                  {recipe.profiles?.username?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <span className="text-xs text-gray-400 truncate">
                  {recipe.profiles?.username ?? "Unknown"}
                </span>
                {recipe.diet_tag && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                    DIET_STYLES[recipe.diet_tag] ?? "bg-gray-50 text-gray-600"
                  }`}>
                    {recipe.diet_tag}
                  </span>
                )}
              </div>

              <button
                data-testid={`button-save-${recipe.id}`}
                onClick={handleSave}
                className="flex-shrink-0 transition-all duration-200 hover:scale-110"
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    optimisticSaved ? "text-amber-500 fill-amber-500" : "text-gray-300 hover:text-amber-400"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </Link>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
