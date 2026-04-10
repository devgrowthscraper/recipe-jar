import { useState } from "react";
import { Link } from "wouter";
import { Heart, Bookmark, Clock, ChefHat, Globe, Leaf } from "lucide-react";
import { Recipe } from "@/lib/supabase";
import { TagBadge } from "./TagBadge";
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
    if (!user) { setShowAuthModal(true); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    const newLiked = !optimisticLiked;
    setOptimisticLiked(newLiked);
    setOptimisticLikes((prev) => newLiked ? prev + 1 : prev - 1);

    if (newLiked) {
      await supabase.from("likes").insert({ user_id: user.id, recipe_id: recipe.id });
      await supabase.from("recipes").update({ likes_count: optimisticLikes + 1 }).eq("id", recipe.id);
    } else {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("recipe_id", recipe.id);
      await supabase.from("recipes").update({ likes_count: optimisticLikes - 1 }).eq("id", recipe.id);
    }

    onLikeToggle?.();
    setLikeLoading(false);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
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
          className="group bg-white rounded-2xl shadow-lg border border-black/5 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 overflow-hidden cursor-pointer"
        >
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="w-16 h-16 text-orange-200" />
              </div>
            )}
            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                data-testid={`button-save-${recipe.id}`}
                onClick={handleSave}
                className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-sm ${
                  optimisticSaved
                    ? "bg-orange-500 text-white"
                    : "bg-white/80 text-neutral-600 hover:bg-white hover:text-orange-500"
                }`}
              >
                <Bookmark className="w-4 h-4" fill={optimisticSaved ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Author */}
            {recipe.profiles && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                  {recipe.profiles.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-neutral-500">@{recipe.profiles.username}</span>
              </div>
            )}

            {/* Title */}
            <h3 className="font-bold text-amber-900 text-base leading-snug mb-2 line-clamp-2">
              {recipe.title}
            </h3>

            {/* Description */}
            {recipe.description && (
              <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 mb-3">
                {recipe.description}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {recipe.cuisine_tag && <TagBadge type="cuisine" value={recipe.cuisine_tag} />}
              {recipe.difficulty_tag && <TagBadge type="difficulty" value={recipe.difficulty_tag} />}
              {recipe.time_tag && <TagBadge type="time" value={recipe.time_tag} />}
              {recipe.diet_tag && <TagBadge type="diet" value={recipe.diet_tag} />}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <button
                data-testid={`button-like-${recipe.id}`}
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
                  optimisticLiked ? "text-red-500" : "text-neutral-400 hover:text-red-400"
                }`}
              >
                <Heart className="w-4 h-4" fill={optimisticLiked ? "currentColor" : "none"} />
                <span>{optimisticLikes}</span>
              </button>
              <span className="text-xs text-neutral-400">
                {new Date(recipe.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
