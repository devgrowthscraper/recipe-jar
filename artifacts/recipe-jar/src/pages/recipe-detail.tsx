import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  Heart, Bookmark, ArrowLeft, ChefHat, UtensilsCrossed,
  ShoppingBasket, Share2, Pencil, Trash2, X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase, Recipe } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Recipe URL copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Please copy the URL manually.", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!recipe) return;
    setDeleting(true);
    await supabase.from("recipes").delete().eq("id", recipe.id);
    toast({ title: "Recipe deleted." });
    setLocation("/");
  }

  // ── Loading skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-5 bg-neutral-100 rounded-full w-32 mb-6" />
        <div className="h-72 bg-neutral-100 rounded-2xl mb-6" />
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4">
          <div className="h-8 bg-neutral-100 rounded-full w-3/4" />
          <div className="flex gap-2">
            <div className="h-6 bg-neutral-100 rounded-full w-20" />
            <div className="h-6 bg-neutral-100 rounded-full w-16" />
          </div>
          <div className="h-4 bg-neutral-100 rounded-full w-full" />
          <div className="h-4 bg-neutral-100 rounded-full w-5/6" />
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────
  if (!recipe) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
          <ChefHat className="w-10 h-10 text-orange-300" />
        </div>
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
  const isOwner = user?.id === recipe.user_id;
  const relativeTime = formatDistanceToNow(new Date(recipe.created_at), { addSuffix: true });

  return (
    <>
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-amber-900 mb-1">Delete this recipe?</h3>
            <p className="text-sm text-neutral-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border-neutral-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-28 sm:pb-8" data-testid={`recipe-detail-${recipe.id}`}>

        {/* Back button */}
        <Link href="/">
          <button
            data-testid="button-back"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-orange-500 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Feed
          </button>
        </Link>

        {/* Hero image */}
        {recipe.image_url ? (
          <div className="w-full max-h-[400px] rounded-2xl overflow-hidden mb-6">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full max-h-[400px] object-cover rounded-2xl"
            />
          </div>
        ) : (
          <div className="w-full h-[200px] rounded-2xl mb-6 bg-gradient-to-r from-orange-100 via-amber-50 to-yellow-50 flex items-center justify-center">
            <UtensilsCrossed className="w-16 h-16 text-orange-200" />
          </div>
        )}

        {/* Main content card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-5">

          {/* Title */}
          <h1
            data-testid="text-recipe-title"
            className="text-3xl font-bold text-amber-900 leading-tight"
          >
            {recipe.title}
          </h1>

          {/* Tags */}
          {(recipe.cuisine_tag || recipe.difficulty_tag || recipe.time_tag || recipe.diet_tag) && (
            <div className="flex flex-wrap gap-2 mt-3">
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

          {/* Description */}
          {recipe.description && (
            <p className="text-gray-600 leading-relaxed mt-4">{recipe.description}</p>
          )}

          <hr className="my-6 border-neutral-100" />

          {/* Ingredients */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2 mb-4">
              <ShoppingBasket className="w-5 h-5 text-orange-500" />
              Ingredients
            </h2>
            <ul className="flex flex-col divide-y divide-neutral-50">
              {ingredients.map((ingredient, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 py-1.5 px-2 rounded-lg text-sm text-neutral-700 leading-relaxed ${
                    i % 2 === 0 ? "bg-orange-50/30" : ""
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div>
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2 mb-5">
              <ChefHat className="w-5 h-5 text-orange-500" />
              Steps
            </h2>
            <ol className="flex flex-col gap-4">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-neutral-700 leading-relaxed text-sm pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <hr className="my-6 border-neutral-100" />

          {/* Posted by */}
          {recipe.profiles && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {recipe.profiles.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-neutral-400">Posted by</p>
                <p className="text-sm font-semibold text-amber-900">@{recipe.profiles.username}</p>
              </div>
              <span className="ml-auto text-xs text-neutral-400">{relativeTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action bar — sticky on mobile, static below content on desktop */}
      <div className="fixed bottom-0 left-0 right-0 sm:static sm:max-w-3xl sm:mx-auto sm:px-4 sm:pb-8 z-40">
        <div className="bg-white/95 backdrop-blur-md border-t border-neutral-100 sm:border sm:rounded-2xl sm:shadow-lg px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">

          {/* Like */}
          <button
            data-testid="button-like"
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium ${
              isLiked
                ? "bg-red-50 border-red-200 text-red-500"
                : "bg-white border-neutral-200 text-neutral-600 hover:border-red-200 hover:text-red-400"
            }`}
          >
            <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
            {recipe.likes_count}
          </button>

          {/* Save */}
          <button
            data-testid="button-save"
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium ${
              isSaved
                ? "bg-orange-50 border-orange-200 text-orange-500"
                : "bg-white border-neutral-200 text-neutral-600 hover:border-orange-200 hover:text-orange-400"
            }`}
          >
            <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? "Saved" : "Save"}
          </button>

          {/* Share */}
          <button
            data-testid="button-share"
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 transition-all duration-200 text-sm font-medium bg-white"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Owner actions */}
          {isOwner && (
            <>
              <div className="flex-1" />
              <Link href={`/edit-recipe/${recipe.id}`}>
                <button
                  data-testid="button-edit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:border-orange-300 hover:text-orange-500 transition-all duration-200 text-sm font-medium bg-white"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              </Link>
              <button
                data-testid="button-delete"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all duration-200 text-sm font-medium bg-white"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
