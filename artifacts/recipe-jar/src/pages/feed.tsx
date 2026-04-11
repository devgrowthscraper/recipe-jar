import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Search, Camera, Sparkles, BookOpen, PenLine, CheckCircle2,
  ArrowRight, UtensilsCrossed, SlidersHorizontal, Heart, Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  icon, iconBg, title, description,
}: { icon: React.ReactNode; iconBg: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 min-h-[220px]">
      <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mt-4 text-amber-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{description}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");

  function handleSearch() {
    const q = search.trim();
    navigate(q ? `/recipes?search=${encodeURIComponent(q)}` : "/recipes");
  }

  function handleFilterClick() {
    navigate("/recipes?filters=open");
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-orange-50 to-amber-50/60 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-amber-900 mb-3 leading-tight">
            Stop Losing Recipes You Love
          </h1>
          <p className="text-base text-neutral-700 mb-8 max-w-xl mx-auto leading-relaxed">
            Screenshot any recipe from Instagram or YouTube. AI organizes it for you instantly.
          </p>

          {/* Search + filter bar — both redirect to /recipes */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-2xl shadow-lg overflow-hidden">

              {/* Filter button — opens /recipes with filters */}
              <button
                onClick={handleFilterClick}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-4 border-r border-gray-200 text-sm font-semibold text-neutral-500 hover:text-orange-500 transition-colors duration-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filter</span>
              </button>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search butter chicken, pasta, tofu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-4 py-4 text-base text-neutral-800 placeholder:text-neutral-400 focus:outline-none bg-transparent"
              />

              {/* Search icon */}
              <button
                onClick={handleSearch}
                className="flex-shrink-0 mx-3 w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <Search className="w-4 h-4 text-white" />
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2 — FEATURES (6 cards)
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-amber-900 text-center mb-10">
            Why Home Cooks Love Recipe Jar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              iconBg="bg-orange-100"
              icon={<Camera className="w-7 h-7 text-orange-500" />}
              title="Capture Recipes"
              description="Screenshot any recipe from Instagram or YouTube. Upload it and AI extracts everything instantly."
            />
            <FeatureCard
              iconBg="bg-purple-100"
              icon={<Sparkles className="w-7 h-7 text-purple-500" />}
              title="AI Auto-Tagging"
              description="Every recipe gets tagged by cuisine, difficulty, cook time, and diet type automatically."
            />
            <FeatureCard
              iconBg="bg-teal-100"
              icon={<BookOpen className="w-7 h-7 text-teal-500" />}
              title="Personal Cookbook"
              description="All your saved recipes organized in one place. Search, filter, and find them in seconds."
            />
            <FeatureCard
              iconBg="bg-pink-100"
              icon={<Heart className="w-7 h-7 text-pink-500" />}
              title="Like And Save"
              description="Heart the recipes you love. Bookmark your favorites and build your personal collection easily."
            />
            <FeatureCard
              iconBg="bg-blue-100"
              icon={<Search className="w-7 h-7 text-blue-500" />}
              title="Smart Search"
              description="Search by recipe name, ingredient, or cuisine. Smart filters help you find dishes fast."
            />
            <FeatureCard
              iconBg="bg-green-100"
              icon={<Users className="w-7 h-7 text-green-500" />}
              title="Community Recipes"
              description="Browse recipes shared by home cooks worldwide. Discover new dishes and share yours too."
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 3 — WRITE / IMPORT CTA CARDS
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href={user ? "/add-recipe" : "/login"}
              className="flex items-start gap-4 bg-white rounded-2xl px-5 py-5 text-left shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-300 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex-shrink-0 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                <PenLine className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-base mb-0.5">Write a Recipe</p>
                <p className="text-sm text-neutral-500 leading-relaxed font-semibold">Type out a recipe you love and share it with everyone</p>
              </div>
            </Link>
            <Link
              href={user ? "/add-recipe" : "/login"}
              className="flex items-start gap-4 bg-white rounded-2xl px-5 py-5 text-left shadow-sm border border-purple-100 hover:shadow-md hover:border-purple-300 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex-shrink-0 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <Camera className="w-5 h-5 text-purple-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-base mb-0.5">Import a Screenshot</p>
                <p className="text-sm text-neutral-500 leading-relaxed font-semibold">Upload a screenshot and AI extracts it into your recipe card</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 4 — IMPORT FEATURE SHOWCASE
      ════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-amber-900 mb-4">
              Import Recipes From Anywhere
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Screenshot a recipe from Instagram, YouTube, or any app. Upload it and our AI
              instantly extracts the title, ingredients, and steps into a clean recipe card.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Works with Instagram screenshots",
                "Works with YouTube screenshots",
                "AI extracts ingredients and steps automatically",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-neutral-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={user ? "/add-recipe" : "/login"}
              className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors shadow-md"
            >
              Try It Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Visual mockup */}
          <div className="flex items-center justify-center gap-5 select-none bg-orange-50/60 rounded-3xl p-8">
            <div className="relative">
              <div className="w-36 bg-neutral-200 rounded-2xl p-3 rotate-3 shadow-md border border-neutral-300">
                <div className="h-2.5 bg-neutral-400 rounded-full w-3/4 mb-2 opacity-60" />
                <div className="h-20 bg-neutral-300 rounded-xl mb-2 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-neutral-400" />
                </div>
                <div className="h-1.5 bg-neutral-400 rounded-full opacity-50 mb-1" />
                <div className="h-1.5 bg-neutral-400 rounded-full w-5/6 opacity-40 mb-1" />
                <div className="h-1.5 bg-neutral-400 rounded-full w-4/6 opacity-30" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-orange-400 flex-shrink-0" />
            <div className="w-40 bg-white rounded-2xl p-4 shadow-lg border border-orange-100">
              <div className="h-2.5 bg-orange-200 rounded-full w-2/3 mb-2" />
              <div className="h-16 bg-orange-50 rounded-xl mb-3 flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-orange-300" />
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full mb-1.5" />
              <div className="h-1.5 bg-neutral-100 rounded-full w-5/6 mb-1.5" />
              <div className="h-1.5 bg-neutral-100 rounded-full w-4/6" />
              <div className="flex gap-1.5 mt-3">
                <div className="h-4 rounded-full bg-green-100 w-14 flex items-center justify-center">
                  <span className="text-[9px] text-green-600 font-semibold">Vegan</span>
                </div>
                <div className="h-4 rounded-full bg-orange-100 w-12 flex items-center justify-center">
                  <span className="text-[9px] text-orange-600 font-semibold">Easy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 5 — SIGN UP CTA (logged-out only)
      ════════════════════════════════════════════════════════════════ */}
      {!user && (
        <section className="py-8 px-4">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl py-16 px-6 text-center max-w-5xl mx-auto shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-3">
              Ready To Build Your Cookbook?
            </h2>
            <p className="text-lg text-white/85 mb-8">
              Join the community and never lose a recipe again.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-white text-orange-500 font-bold rounded-xl px-8 py-3.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-sm no-underline"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          SECTION 6 — FOOTER
      ════════════════════════════════════════════════════════════════ */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🫙</span>
                <p className="text-amber-900 font-bold text-lg">Recipe Jar</p>
              </div>
              <p className="text-sm text-neutral-600">Save, share, and rediscover recipes.</p>
            </div>
            <div className="flex gap-8 text-sm">
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-neutral-900 mb-1">Browse</p>
                <Link href="/recipes" className="text-neutral-600 hover:text-orange-500 transition-colors">Recipes</Link>
                {user && (
                  <Link href="/add-recipe" className="text-neutral-600 hover:text-orange-500 transition-colors">Add Recipe</Link>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-neutral-900 mb-1">Account</p>
                <Link
                  href={user ? "/profile" : "/login"}
                  className="text-neutral-600 hover:text-orange-500 transition-colors"
                >
                  {user ? "My Profile" : "Sign In"}
                </Link>
                {!user && (
                  <Link href="/signup" className="text-neutral-600 hover:text-orange-500 transition-colors">
                    Create Account
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-5 text-xs text-neutral-400">
            {new Date().getFullYear()} Recipe Jar. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
