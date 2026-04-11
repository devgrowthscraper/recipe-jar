import { useState } from "react";
import { Link, useLocation } from "wouter";
import { UtensilsCrossed, Eye, EyeOff, Camera, Sparkles, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const FEATURES = [
  { icon: Camera,   label: "Image Import"  },
  { icon: Sparkles, label: "AI Auto-tagging"    },
  { icon: BookOpen, label: "Personal Cookbook"  },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      setLocation("/");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left: marketing panel ── */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-amber-400 to-amber-600 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Welcome to Recipe Jar</h2>
          <p className="text-white/85 text-base leading-relaxed mb-10">
            Save recipes from Instagram and YouTube. AI organizes them for you.
          </p>
          <div className="flex flex-col gap-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
                <Icon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-sm font-semibold text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-amber-50/40">
        <div className="w-full max-w-md">

          {/* Mini logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-amber-900">Recipe Jar</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-amber-900 mb-1">Welcome Back</h1>
            <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  data-testid="input-email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    data-testid="input-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  data-testid="button-submit-login"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl py-3.5 font-semibold transition-all duration-200"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-5">
              Don't have an account?{" "}
              <Link href="/signup" className="text-amber-600 font-medium hover:text-amber-700">
                Sign up
              </Link>
            </p>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Link
              href="/"
              className="block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Continue as guest
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
