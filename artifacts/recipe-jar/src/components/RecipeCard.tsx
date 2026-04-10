import { useState } from "react";
import { Link } from "wouter";
import { Heart, Bookmark, UtensilsCrossed } from "lucide-react";
import { Recipe } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "./AuthModal";
import { formatDistanceToNow } from "date-fns";

type RecipeCardProps = {
  recipe: Recipe;
  isSaved?: boolean;
  isLiked?: boolean;
  onLikeToggle?: () => void;
  onSaveToggle?: () => void;
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

  const relativeTime = formatDistanceToNow(new Date(recipe.created_at), { addSuffix: true });

  return (
    <>
      <Link href={`/recipe/${recipe.id}`}>
        <div
          data-testid={`card-recipe-${recipe.id}`}
          className="group bg-white rounded-2xl shadow-lg border border-black/5 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 overflow-hidden cursor-pointer flex flex-col h-full"
        >
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden flex-shrink-0 rounded-t-2xl">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UtensilsCrossed className="w-16 h-16 text-orange-200" />
              </div>
            )}
          </div>

          {/* Card body */}
          <div className="p-5 flex flex-col flex-1">
            {/* Title */}
            <h3
              data-testid={`text-recipe-title-${recipe.id}`}
              className="font-bold text-amber-900 text-lg leading-snug mb-1 truncate"
            >
              {recipe.title}
            </h3>

            {/* Description */}
            {recipe.description && (
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                {recipe.description}
              </p>
            )}

            {/* Tags */}
            {(recipe.cuisine_tag || recipe.difficulty_tag || recipe.time_tag || recipe.diet_tag) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.cuisine_tag && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-orange-50 text-orange-700">
                    {recipe.cuisine_tag}
                  </span>
                )}
                {recipe.difficulty_tag && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                    {recipe.difficulty_tag}
                  </span>
                )}
                {recipe.time_tag && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700">
                    {recipe.time_tag}
                  </span>
                )}
                {recipe.diet_tag && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-50 text-green-700">
                    {recipe.diet_tag}
                  </span>
                )}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom row: heart+count | bookmark */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <button
                data-testid={`button-like-${recipe.id}`}
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
                  optimisticLiked ? "text-red-500" : "text-neutral-400 hover:text-red-400"
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  fill={optimisticLiked ? "currentColor" : "none"}
                />
                <span>{optimisticLikes}</span>
              </button>

              <button
                data-testid={`button-save-${recipe.id}`}
                onClick={handleSave}
                className={`flex items-center gap-1 text-sm transition-all duration-200 ${
                  optimisticSaved ? "text-orange-500" : "text-neutral-400 hover:text-orange-400"
                }`}
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={optimisticSaved ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* By + time */}
            <div className="flex items-center justify-between mt-2">
              {recipe.profiles ? (
                <span className="text-xs text-gray-400">
                  by {recipe.profiles.username}
                </span>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400">{relativeTime}</span>
            </div>
          </div>
        </div>
      </Link>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
