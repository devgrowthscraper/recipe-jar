import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Sparkles, Upload, Pen, AlertCircle,
  CheckCircle, Loader2, Plus, Camera, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type Tab = "write" | "import";

interface RecipeForm {
  title: string;
  description: string;
  ingredients: string;
  steps: string;
  imageUrl: string;
}

export default function AddRecipePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>("write");
  const [submitting, setSubmitting] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // Form fields
  const [form, setForm] = useState<RecipeForm>({
    title: "",
    description: "",
    ingredients: "",
    steps: "",
    imageUrl: "",
  });

  // Screenshot import state
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  if (!user) {
    setLocation("/login");
    return null;
  }

  function updateForm(field: keyof RecipeForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ── Photo upload (Write tab) ───────────────────────────────────
  async function handlePhotoSelect(file: File) {
    setPhotoError("");
    setPhotoUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("recipe-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(data.path);
      updateForm("imageUrl", urlData.publicUrl);
    } catch (err: unknown) {
      setPhotoPreview(null);
      setPhotoError(err instanceof Error ? err.message : "Upload failed. Try again.");
      updateForm("imageUrl", "");
    } finally {
      setPhotoUploading(false);
    }
  }

  function handleRemovePhoto() {
    setPhotoPreview(null);
    setPhotoError("");
    updateForm("imageUrl", "");
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  // ── Screenshot drag-and-drop ──────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) processScreenshot(file);
  }, []);

  function processScreenshot(file: File) {
    setScreenshot(file);
    setExtractSuccess(false);
    setExtractError("");
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  // Compress image via Canvas to max 1024px wide, JPEG 0.8 quality
  async function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1024;
        let { width, height } = img;
        if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
        const canvas = document.createElement("canvas");
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not available")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
      img.src = url;
    });
  }

  async function doExtractRequest(base64: string, mimeType: string) {
    const res = await fetch("/api/ai/extract-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType }),
      signal: AbortSignal.timeout(35_000),
    });
    const data = await res.json();
    if (res.status === 504 || data?.error === "timeout") throw new Error("timeout");
    if (!res.ok || data?.error) throw new Error(data?.error || "extraction_failed");
    return data;
  }

  async function handleExtract() {
    if (!screenshot) return;
    setExtracting(true);
    setExtractError("");

    try {
      const { base64, mimeType } = await compressImage(screenshot);

      let data: Record<string, string> | null = null;
      try {
        data = await doExtractRequest(base64, mimeType);
      } catch (firstErr) {
        console.warn("[extract] first attempt failed, retrying:", firstErr);
        try {
          data = await doExtractRequest(base64, mimeType);
        } catch (retryErr: unknown) {
          const msg = retryErr instanceof Error ? retryErr.message : String(retryErr);
          if (msg === "timeout" || msg.includes("TimeoutError")) {
            throw new Error("timeout");
          }
          throw new Error("api_error");
        }
      }

      if (!data?.title) throw new Error("parse_error");

      setForm({
        title: data.title || "",
        description: data.description || "",
        ingredients: data.ingredients || "",
        steps: data.steps || "",
        imageUrl: "",
      });
      setExtractSuccess(true);
      setActiveTab("write");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[extract] failed:", msg);
      if (msg === "timeout" || msg.includes("TimeoutError")) {
        setExtractError("Processing took too long. Try a smaller or clearer image.");
      } else if (msg === "parse_error") {
        setExtractError("AI response was unexpected. Please try a different image.");
      } else {
        setExtractError("Could not process this image. Please try again.");
      }
    } finally {
      setExtracting(false);
    }
  }

  // ── Submit ─────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.ingredients.trim() || !form.steps.trim()) {
      toast({
        title: "Required fields missing",
        description: "Title, ingredients, and steps are required.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // Safety net: ensure profile row exists before inserting recipe
    {
      const base = (user.email?.split("@")[0] ?? "").replace(/[^a-zA-Z0-9_]/g, "");
      const username = base.length >= 3 ? base : `user_${user.id.slice(0, 8)}`;
      await supabase
        .from("profiles")
        .upsert({ id: user.id, username }, { onConflict: "id", ignoreDuplicates: true });
    }

    // 1. Insert recipe (without tags first)
    const { data: recipe, error: insertError } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        ingredients: form.ingredients.trim(),
        steps: form.steps.trim(),
        image_url: form.imageUrl.trim() || null,
        likes_count: 0,
      })
      .select()
      .single();

    if (insertError || !recipe) {
      toast({ title: "Error saving recipe", description: insertError?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // 2. Auto-tag via edge function
    setTagging(true);
    try {
      const tagRes = await fetch("/api/ai/tag-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          ingredients: form.ingredients.trim(),
          steps: form.steps.trim(),
        }),
      });
      const tags = tagRes.ok ? await tagRes.json() : null;

      if (tags && !tags.error) {
        await supabase.from("recipes").update({
          cuisine_tag: tags.cuisine_tag || null,
          difficulty_tag: tags.difficulty_tag || null,
          time_tag: tags.time_tag || null,
          diet_tag: tags.diet_tag || null,
        }).eq("id", recipe.id);
      }
    } catch {
      // Tagging is nice-to-have — don't block on failure
    } finally {
      setTagging(false);
    }

    toast({ title: "Recipe published!", description: `"${form.title.trim()}" is live on Recipe Jar.`, variant: "success" });
    setLocation("/");
  }

  const inputClass =
    "rounded-xl border-neutral-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all";

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 relative">
      {/* Loading overlay */}
      {(submitting || tagging) && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl animate-pulse">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <p className="text-base font-semibold text-amber-900">
            {tagging ? "AI is tagging your recipe..." : "Saving recipe..."}
          </p>
          <p className="text-sm text-neutral-500">Just a moment</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Add a Recipe</h1>
          <p className="text-sm text-neutral-500">Share your culinary creation with the world</p>
        </div>
      </div>

      {/* Tab toggles */}
      <div className="flex gap-1 bg-neutral-100 rounded-2xl p-1.5 mb-7">
        <button
          data-testid="tab-write-recipe"
          type="button"
          onClick={() => setActiveTab("write")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === "write"
              ? "bg-white text-amber-600 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Pen className="w-4 h-4" />
          Write Recipe
        </button>
        <button
          data-testid="tab-import-screenshot"
          type="button"
          onClick={() => setActiveTab("import")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === "import"
              ? "bg-white text-amber-600 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Import from Image
        </button>
      </div>

      {/* ── TAB 1: WRITE RECIPE ── */}
      {activeTab === "write" && (
        <>
          {/* Extraction success banner */}
          {extractSuccess && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-6">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Recipe extracted!</p>
                <p className="text-xs text-green-700 mt-0.5">Review and edit below, then publish.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Basic info card */}
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
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
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
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-neutral-400" />
                  Recipe Photo <span className="text-neutral-400 font-normal">(optional)</span>
                </Label>

                {/* Hidden file input */}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoSelect(file);
                  }}
                />

                {photoPreview ? (
                  /* Preview with remove button */
                  <div className="relative h-32 rounded-xl overflow-hidden border border-neutral-200">
                    <img
                      src={photoPreview}
                      alt="Recipe photo preview"
                      className="w-full h-full object-cover"
                    />
                    {photoUploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                      </div>
                    )}
                    {!photoUploading && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>
                ) : (
                  /* Upload area */
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="h-32 w-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50/40 transition-all duration-200"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm font-medium">Add a photo</span>
                  </button>
                )}

                {photoError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {photoError}
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
                value={form.ingredients}
                onChange={(e) => updateForm("ingredients", e.target.value)}
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
                value={form.steps}
                onChange={(e) => updateForm("steps", e.target.value)}
                required
                rows={6}
                className={`${inputClass} resize-none text-sm`}
              />
            </div>

            {/* AI tagging note */}
            <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                AI will automatically suggest cuisine, difficulty, time, and diet tags after publishing.
              </p>
            </div>

            <Button
              type="submit"
              data-testid="button-submit-recipe"
              disabled={submitting || tagging}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl py-4 text-base font-semibold shadow-lg shadow-amber-200 transition-all duration-200 hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {submitting || tagging ? "Publishing..." : "Publish Recipe"}
            </Button>
          </form>
        </>
      )}

      {/* ── TAB 2: IMPORT FROM SCREENSHOT ── */}
      {activeTab === "import" && (
        <div className="flex flex-col gap-6">
          {/* Drop zone */}
          <div
            data-testid="dropzone-screenshot"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-amber-400 bg-amber-50"
                : "border-gray-300 bg-white hover:border-amber-300 hover:bg-amber-50/50"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Upload className="w-7 h-7 text-amber-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-neutral-700">Drop an image here or click to upload</p>
              <p className="text-sm text-neutral-500 mt-1">Any recipe image works. Photos, screenshots, or scans.</p>
            </div>
            <span className="text-xs text-neutral-400">JPG, PNG, WEBP accepted</span>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            data-testid="input-screenshot-file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processScreenshot(file);
            }}
          />

          {/* Fallback button */}
          <div className="text-center -mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-amber-600 hover:text-amber-700 underline underline-offset-2 font-medium"
            >
              Or browse for a file
            </button>
          </div>

          {/* Preview + status */}
          {screenshotPreview && (
            <div className="bg-white rounded-2xl border border-black/5 shadow-lg overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Screenshot preview */}
                <div className="sm:w-1/2 bg-neutral-50 flex items-center justify-center p-4 min-h-[200px]">
                  <img
                    src={screenshotPreview}
                    alt="Uploaded image"
                    className="max-h-[220px] w-full object-contain rounded-xl"
                  />
                </div>

                {/* Status panel */}
                <div className="sm:w-1/2 p-6 flex flex-col items-center justify-center gap-4 border-t sm:border-t-0 sm:border-l border-neutral-100">
                  {extracting ? (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-amber-900">AI is reading your recipe...</p>
                        <p className="text-xs text-neutral-500 mt-1">This takes a few seconds</p>
                      </div>
                    </>
                  ) : extractError ? (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      </div>
                      <p className="text-sm text-red-600 text-center">{extractError}</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl text-sm border-neutral-200"
                      >
                        Try another image
                      </Button>
                    </>
                  ) : extractSuccess ? (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-sm font-semibold text-green-800 text-center">Recipe extracted!</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-amber-900">Image ready</p>
                        <p className="text-xs text-neutral-500 mt-1">AI will extract the recipe for you</p>
                      </div>
                      <Button
                        type="button"
                        data-testid="button-extract-recipe"
                        onClick={handleExtract}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Extract Recipe
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
