import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Sparkles, ImageIcon, AlertCircle, Pencil, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Track originals to detect changes
  const [origTitle, setOrigTitle] = useState("");
  const [origIngredients, setOrigIngredients] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
        setFetching(false);
        return;
      }

      // Redirect if not the owner
      if (data.user_id !== user?.id) {
        setLocation(`/recipe/${id}`);
        return;
      }

      setTitle(data.title);
      setOrigTitle(data.title);
      setDescription(data.description || "");
      setIngredients(data.ingredients);
      setOrigIngredients(data.ingredients);
      setSteps(data.steps);
      setImageUrl(data.image_url || "");
      setFetching(false);
    }

    if (user !== undefined) load();
  }, [id, user]);

  if (!user) {
    setLocation("/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !ingredients.trim() || !steps.trim()) {
      toast({
        title: "Required fields missing",
        description: "Title, ingredients, and steps are required.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase
      .from("recipes")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        ingredients: ingredients.trim(),
        steps: steps.trim(),
        image_url: imageUrl.trim() || null,
      })
      .eq("id", id);

    if (updateError) {
      toast({ title: "Error updating recipe", description: updateError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Re-tag if title or ingredients changed
    const titleChanged = title.trim() !== origTitle;
    const ingredientsChanged = ingredients.trim() !== origIngredients;

    if (titleChanged || ingredientsChanged) {
      setTagging(true);
      try {
        const { data: tags, error: tagError } = await supabase.functions.invoke("auto-tag-recipe", {
          body: {
            title: title.trim(),
            ingredients: ingredients.trim(),
            steps: steps.trim(),
          },
        });

        if (!tagError && tags && !tags.error) {
          await supabase.from("recipes").update({
            cuisine_tag: tags.cuisine_tag || null,
            difficulty_tag: tags.difficulty_tag || null,
            time_tag: tags.time_tag || null,
            diet_tag: tags.diet_tag || null,
          }).eq("id", id);
        }
      } catch {
        // Non-blocking
      } finally {
        setTagging(false);
      }
    }

    toast({ title: "Recipe updated!", variant: "success" });
    setLocation(`/recipe/${id}`);
  }

  const inputClass =
    "rounded-xl border-neutral-200 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all";

  // ── Loading ───────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-pulse flex flex-col gap-6">
        <div className="h-8 bg-neutral-100 rounded-xl w-1/3" />
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
          <div className="h-5 bg-neutral-100 rounded-full w-1/4" />
          <div className="h-10 bg-neutral-100 rounded-xl" />
          <div className="h-20 bg-neutral-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-neutral-500">Recipe not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 relative">
      {/* Loading overlay */}
      {(submitting || tagging) && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl animate-pulse">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <p className="text-base font-semibold text-amber-900">
            {tagging ? "AI is re-tagging your recipe..." : "Saving changes..."}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
          <Pencil className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Edit Recipe</h1>
          <p className="text-sm text-neutral-500">Update your recipe details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-lg p-6 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-amber-900">Basic Info</h2>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              data-testid="input-recipe-title"
              placeholder="e.g., Grandma's Butter Chicken"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-neutral-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              data-testid="input-recipe-description"
              placeholder="A short description of this recipe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="image-url" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-neutral-400" />
              Image URL <span className="text-neutral-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="image-url"
              data-testid="input-recipe-image"
              placeholder="Paste an image URL"
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); setImageError(false); }}
              className={inputClass}
            />
            {imageUrl && !imageError && (
              <div className="mt-2 rounded-xl overflow-hidden border border-neutral-100 max-h-[200px]">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full max-h-[200px] object-cover rounded-xl"
                  onError={() => setImageError(true)}
                />
              </div>
            )}
            {imageUrl && imageError && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Image could not be loaded. Check the URL.
              </p>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-lg p-6 flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold text-amber-900">
              Ingredients <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">Enter one ingredient per line</p>
          </div>
          <Textarea
            data-testid="input-recipe-ingredients"
            placeholder={`1 cup rice\n2 tbsp oil\n1 onion, chopped`}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
            rows={6}
            className={`${inputClass} resize-none font-mono text-sm`}
          />
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-lg p-6 flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold text-amber-900">
              Steps <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">Enter one step per line</p>
          </div>
          <Textarea
            data-testid="input-recipe-steps"
            placeholder={`Wash and soak the rice\nHeat oil in a pan\nSaute onions until golden`}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            required
            rows={6}
            className={`${inputClass} resize-none text-sm`}
          />
        </div>

        {/* AI re-tag note */}
        <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
          <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <p className="text-xs text-orange-700">
            If you changed the title or ingredients, AI will automatically re-tag this recipe.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation(`/recipe/${id}`)}
            className="flex-1 rounded-xl border-neutral-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            data-testid="button-submit-recipe"
            disabled={submitting || tagging}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
          >
            {submitting || tagging ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
