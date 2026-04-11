import { useState } from "react";
import { Link, useLocation } from "wouter";
import { UtensilsCrossed, Menu, PlusCircle, LogOut, User, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();
  const { user, profile, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => location === href;

  const avatarInitial = profile?.username?.charAt(0).toUpperCase()
    || user?.email?.charAt(0).toUpperCase()
    || null;

  return (
    <nav className="sticky top-0 z-50 border-b border-black/5 backdrop-blur-lg bg-white/80 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-amber-900">Recipe Jar</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">

          <Link
            href="/recipes"
            data-testid="nav-link-recipes"
            className={`text-sm font-medium transition-all duration-200 relative pb-0.5 ${
              isActive("/recipes")
                ? "text-amber-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber-500 after:rounded-full"
                : "text-neutral-600 hover:text-amber-600"
            }`}
          >
            Recipes
          </Link>

          {user && (
            <>
              <Link
                href="/add-recipe"
                data-testid="nav-link-add-recipe"
                className={`text-sm font-medium transition-all duration-200 relative pb-0.5 ${
                  isActive("/add-recipe")
                    ? "text-amber-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber-500 after:rounded-full"
                    : "text-neutral-600 hover:text-amber-600"
                }`}
              >
                Add Recipe
              </Link>
              <Link
                href="/profile"
                data-testid="nav-link-my-profile"
                className={`text-sm font-medium transition-all duration-200 relative pb-0.5 ${
                  isActive("/profile")
                    ? "text-amber-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber-500 after:rounded-full"
                    : "text-neutral-600 hover:text-amber-600"
                }`}
              >
                My Profile
              </Link>
            </>
          )}

          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <div
                  data-testid="nav-avatar"
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-105 transition-transform"
                >
                  {avatarInitial ?? <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                </div>
              </Link>
              <button
                data-testid="button-logout"
                onClick={signOut}
                className="text-neutral-400 hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <Button
                data-testid="button-sign-in"
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 shadow-sm"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button data-testid="button-menu" className="p-2 rounded-lg hover:bg-amber-50 transition-colors">
              <Menu className="w-5 h-5 text-amber-900" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-white/95 backdrop-blur-xl">
            <div className="flex flex-col gap-6 pt-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-amber-900">Recipe Jar</span>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/recipes"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive("/recipes") ? "bg-amber-50 text-amber-600" : "text-neutral-600 hover:bg-amber-50 hover:text-amber-600"
                  }`}
                >
                  Recipes
                </Link>

                {user && (
                  <>
                    <Link
                      href="/add-recipe"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive("/add-recipe") ? "bg-amber-50 text-amber-600" : "text-neutral-600 hover:bg-amber-50 hover:text-amber-600"
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Recipe
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive("/profile") ? "bg-amber-50 text-amber-600" : "text-neutral-600 hover:bg-amber-50 hover:text-amber-600"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                  </>
                )}
              </div>

              {user ? (
                <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-3 px-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
                      {avatarInitial ?? <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      {profile ? `@${profile.username}` : user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => { signOut(); setOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-neutral-100">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-semibold">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
