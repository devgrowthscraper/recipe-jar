import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  UtensilsCrossed, Bookmark, Heart, LogOut,
  Pencil, Trash2, Plus, ChevronDown, AlertCircle,
  Settings
} from "lucide-react";
import { supabase, Recipe } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { RecipeCard } from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Tab = "myRecipes" | "saved";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, profile, signOut, loading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("myRecipes");
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fade-out state for unsave
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());

  // Delete confirm state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (profile) {
      setEditUsername(profile.username);
      setEditAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      setLoading(true);
      const [myRes, savedRes, likesRes] = await Promise.all([
        supabase
          .from("recipes")
          .select("*, profiles(id, username, avatar_url)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("saved_recipes")
          .select("recipe_id, recipes(*, profiles(id, username, avatar_url))")
          .eq("user_id", user!.id)
          .order("saved_at", { ascending: false }),
        supabase.from("likes").select("recipe_id").eq("user_id", user!.id),
      ]);

      setMyRecipes(myRes.data || []);
      setSavedRecipes(
        (savedRes.data || [])
          .map((r: { recipe_id: string; recipes: Recipe | null }) => r.recipes)
          .filter(Boolean) as Recipe[]
      );
      setLikedIds(new Set((likesRes.data || []).map((r) => r.recipe_id)));
      setLoading(false);
    }
    fetchData();
  }, [user]);

  if (authLoading || !user || !profile) return null;

  const likesReceived = myRecipes.reduce((sum, r) => sum + (r.likes_count || 0), 0);
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // ── Handlers ─────────────────────────────────────────────────
  async function handleUnsave(recipeId: string) {
    setFadingIds((prev) => new Set([...prev, recipeId]));
    await supabase.from("saved_recipes").delete().eq("user_id", user.id).eq("recipe_id", recipeId);
    toast({ title: "Recipe removed from cookbook", variant: "info" });
    setTimeout(() => {
      setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      setFadingIds((prev) => {
        const next = new Set(prev);
        next.delete(recipeId);
        return next;
      });
    }, 300);
  }

  async function handleDeleteRecipe() {
    if (!deleteTargetId) return;
    setDeleting(true);
    await supabase.from("recipes").delete().eq("id", deleteTargetId);
    setMyRecipes((prev) => prev.filter((r) => r.id !== deleteTargetId));
    setDeleteTargetId(null);
    setDeleting(false);
    toast({ title: "Recipe deleted", variant: "info" });
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!editUsername.trim()) return;
    setSavingSettings(true);

    // Check username uniqueness (if changed)
    if (editUsername.trim() !== profile.username) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", editUsername.trim())
        .neq("id", user.id)
        .single();
      if (existing) {
        toast({ title: "Username taken", description: "Please choose a different username.", variant: "destructive" });
        setSavingSettings(false);
        return;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: editUsername.trim(),
        avatar_url: editAvatarUrl.trim() || null,
      })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profile updated!", variant: "success" });
      setSettingsOpen(false);
    }
    setSavingSettings(false);
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      {/* Delete confirm modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-amber-900 mb-1">Delete this recipe?</h3>
            <p className="text-sm text-neutral-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 rounded-xl border-neutral-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteRecipe}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">

        {/* ── Profile Header ── */}
        <div className="relative mb-16">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-orange-400 to-amber-500 rounded-b-3xl" />

          {/* Avatar — overlaps banner */}
          <div className="absolute left-6 sm:left-8 bottom-0 translate-y-1/2">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 ring-4 ring-white shadow-lg flex items-center justify-center text-white text-3xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Sign out — top right of banner */}
          <button
            data-testid="button-logout"
            onClick={() => { signOut(); setLocation("/"); }}
            className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-all duration-200 backdrop-blur-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>

        {/* Username + member since */}
        <div className="px-1 mb-6">
          <h1 className="text-2xl font-bold text-amber-900" data-testid="text-profile-username">
            @{profile.username}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Member since {memberSince}</p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[
            { icon: <UtensilsCrossed className="w-5 h-5 text-orange-400" />, value: myRecipes.length, label: "Recipes Posted" },
            { icon: <Bookmark className="w-5 h-5 text-orange-400" />, value: savedRecipes.length, label: "Recipes Saved" },
            { icon: <Heart className="w-5 h-5 text-orange-400" />, value: likesReceived, label: "Likes Received" },
          ].map(({ icon, value, label }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-neutral-50 p-4 text-center">
              <div className="flex justify-center mb-1">{icon}</div>
              <p className="text-2xl font-bold text-orange-500">{value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Tab toggles ── */}
        <div className="flex gap-1 bg-neutral-100 rounded-2xl p-1.5 mb-6 w-fit">
          <button
            data-testid="tab-my-recipes"
            onClick={() => setTab("myRecipes")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === "myRecipes"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            My Recipes
          </button>
          <button
            data-testid="tab-saved"
            onClick={() => setTab("saved")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === "saved"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved Recipes
          </button>
        </div>

        {/* ── Tab content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden animate-pulse">
                <div className="h-48 bg-neutral-100 rounded-t-2xl" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-4 bg-neutral-100 rounded-full w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : tab === "myRecipes" ? (
          myRecipes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-orange-200 flex items-center justify-center mx-auto mb-5">
                <Plus className="w-10 h-10 text-orange-300" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Share your first recipe</h3>
              <p className="text-neutral-500 text-sm mb-6">Your culinary creations will appear here.</p>
              <Link href="/add-recipe">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-6 font-semibold">
                  Add Recipe
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRecipes.map((recipe) => (
                <div key={recipe.id} className="relative group">
                  <RecipeCard
                    recipe={recipe}
                    isSaved={false}
                    isLiked={likedIds.has(recipe.id)}
                  />
                  {/* Edit / Delete overlay */}
                  <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link href={`/edit-recipe/${recipe.id}`}>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-white" />
                      </button>
                    </Link>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTargetId(recipe.id); }}
                      className="w-7 h-7 rounded-full bg-black/40 hover:bg-red-500/80 backdrop-blur-sm flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          savedRecipes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-orange-200 flex items-center justify-center mx-auto mb-5">
                <Bookmark className="w-10 h-10 text-orange-300" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Your cookbook is empty</h3>
              <p className="text-neutral-500 text-sm mb-6">Browse the feed and save recipes you love!</p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-6 font-semibold">
                  Browse Recipes
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className={`transition-all duration-300 ${
                    fadingIds.has(recipe.id) ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  }`}
                >
                  <div className="relative group">
                    <RecipeCard
                      recipe={recipe}
                      isSaved={true}
                      isLiked={likedIds.has(recipe.id)}
                    />
                    {/* Unsave overlay button */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUnsave(recipe.id); }}
                      className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500 text-white text-xs font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-orange-600"
                    >
                      <Bookmark className="w-3.5 h-3.5" fill="currentColor" />
                      Unsave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Settings collapsible ── */}
        <div className="mt-10 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-neutral-400" />
              Settings
            </span>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {settingsOpen && (
            <form onSubmit={handleSaveSettings} className="px-5 pb-5 flex flex-col gap-4 border-t border-neutral-100 pt-4">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="settings-username"
                  data-testid="input-settings-username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  minLength={3}
                  maxLength={30}
                  required
                  className="rounded-xl border-neutral-200 focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                />
                <p className="text-xs text-neutral-400">Only lowercase letters, numbers, and underscores.</p>
              </div>

              {/* Avatar URL */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-avatar" className="text-sm font-medium text-gray-700">
                  Avatar URL <span className="text-neutral-400 font-normal">(optional)</span>
                </Label>
                <Input
                  id="settings-avatar"
                  data-testid="input-settings-avatar"
                  placeholder="https://example.com/avatar.jpg"
                  value={editAvatarUrl}
                  onChange={(e) => { setEditAvatarUrl(e.target.value); setAvatarError(false); }}
                  className="rounded-xl border-neutral-200 focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                />
                {editAvatarUrl && !avatarError && (
                  <img
                    src={editAvatarUrl}
                    alt="Avatar preview"
                    className="w-14 h-14 rounded-full object-cover border border-neutral-200 mt-1"
                    onError={() => setAvatarError(true)}
                  />
                )}
                {editAvatarUrl && avatarError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Image could not be loaded. Check the URL.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                data-testid="button-save-settings"
                disabled={savingSettings}
                className="w-fit bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-6 font-semibold"
              >
                {savingSettings ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
