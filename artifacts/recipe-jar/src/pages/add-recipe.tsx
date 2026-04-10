import { useState } from "react";
import { useLocation } from "wouter";
import { ChefHat, ImageIcon, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CUISINE_TAGS = ["Indian", "Italian", "Mexican", "Chinese", "American", "Thai", "Japanese", "Mediterranean"];
const DIFFICULTY_TAGS = ["Easy", "Medium", "Hard"];
const TIME_TAGS = ["Under 15 min", "15-30 min", "30-60 min", "Over 1 hour"];
const DIET_TAGS = ["Vegetarian", "Vegan", "Non-Vegetarian", "Pescatarian"];

export default function AddRecipePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [cuisineTag, setCuisineTag] = useState("");
  const [difficultyTag, setDifficultyTag] = useState("");
  const [timeTag, setTimeTag] = useState("");
  const [dietTag, setDietTag] = useState("");

  if (!user) {
    setLocation("/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !ingredients.trim() || !steps.trim()) {
      toast({ title: "Required fields missing", description: "Title, ingredients, and steps are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.from("recipes").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      ingredients: ingredients.trim(),
      steps: steps.trim(),
      image_url: imageUrl.trim() || null,
      cuisine_tag: cuisineTag || null,
      difficulty_tag: difficultyTag || null,
      time_tag: timeTag || null,
      diet_tag: dietTag || null,
      likes_count: 0,
    }).select().single();

    if (error) {
      toast({ title: "Error saving recipe", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Recipe saved!", description: `"${title}" has been added to Recipe Jar.` });
    setLocation(`/recipe/${data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Add a Recipe</h1>
          <p className="text-sm text-neutral-500">Share your culinary creation with the world</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Title */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-lg p-6 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-amber-900">Basic Info</h2>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title" className="text-sm font-medium text-neutral-700">
              Recipe Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              data-testid="input-recipe-title"
              placeholder="e.g. Classic Spaghetti Carbonara"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-xl border-neutral-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-neutral-700">
              Description
            </Label>
            <Textarea
              id="description"
              data-testid="input-recipe-description"
              placeholder="A brief description of your recipe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl border-neutral-200 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="image-url" className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-neutral-400" />
              Image URL
            </Label>
            <Input
              id="image-url"
              data-testid="input-recipe-image"
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="rounded-xl border-neutral-200"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-lg p-6 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-amber-900">Tags</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-neutral-700">Cuisine</Label>
              <Select value={cuisineTag} onValueChange={setCuisineTag}>
                <SelectTrigger data-testid="select-cuisine" className="rounded-xl border-neutral-200">
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CUISINE_TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-neutral-700">Difficulty</Label>
              <Select value={difficultyTag} onValueChange={setDifficultyTag}>
                <SelectTrigger data-testid="select-difficulty" className="rounded-xl border-neutral-200">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {DIFFICULTY_TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-neutral-700">Cook Time</Label>
              <Select value={timeTag} onValueChange={setTimeTag}>
                <SelectTrigger data-testid="select-time" className="rounded-xl border-neutral-200">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {TIME_TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-neutral-700">Diet</Label>
              <Select value={dietTag} onValueChange={setDietTag}>
                <SelectTrigger data-testid="select-diet" className="rounded-xl border-neutral-200">
                  <SelectValue placeholder="Select diet" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {DIET_TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-lg p-6 flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold text-amber-900">
              Ingredients <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">One ingredient per line</p>
          </div>
          <Textarea
            data-testid="input-recipe-ingredients"
            placeholder={`2 cups all-purpose flour\n1 tsp salt\n3 large eggs`}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
            rows={8}
            className="rounded-xl border-neutral-200 resize-none font-mono text-sm"
          />
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-lg p-6 flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold text-amber-900">
              Instructions <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">One step per line</p>
          </div>
          <Textarea
            data-testid="input-recipe-steps"
            placeholder={`Mix the flour and salt together in a large bowl.\nCrack the eggs into the center and stir gradually.\nKnead for 10 minutes until smooth.`}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            required
            rows={10}
            className="rounded-xl border-neutral-200 resize-none text-sm"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          data-testid="button-submit-recipe"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-4 text-base font-semibold shadow-lg shadow-orange-200 transition-all duration-200 hover:shadow-xl"
        >
          {loading ? "Saving recipe..." : "Save Recipe"}
        </Button>
      </form>
    </div>
  );
}
