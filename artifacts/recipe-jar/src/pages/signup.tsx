import { useState } from "react";
import { Link, useLocation } from "wouter";
import { UtensilsCrossed, Eye, EyeOff, Camera, Sparkles, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

const FEATURES = [
  { icon: Camera,   label: "Screenshot Import"  },
  { icon: Sparkles, label: "AI Auto-tagging"    },
  { icon: BookOpen, label: "Personal Cookbook"  },
];

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState<"signup" | "username">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    if (data.user) {
      setUserId(data.user.id);
      setStep("username");
    }
    setLoading(false);
  }

  async function handleSetUsername(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);

    const { error } = await supabase.rpc("set_profile_username", {
      p_user_id: userId,
      p_username: username.trim(),
    });

    if (error) {
      const isUsernameTaken = error.message?.includes("username_taken");
      toast({
        title: isUsernameTaken ? "Username taken" : "Error",
        description: isUsernameTaken
          ? "Please choose a different username."
          : error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    await refreshProfile();
    toast({ title: "Welcome to Recipe Jar!", description: `Your account is ready, @${username.trim()}` });
    setLocation("/");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left: marketing panel ── */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-400 to-amber-500 flex-col items-center justify-center p-12 text-white">
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-amber-900">Recipe Jar</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {step === "signup" ? (
              <>
                <h1 className="text-2xl font-bold text-amber-900 mb-1">Create Your Account</h1>
                <p className="text-sm text-gray-500 mb-6">Join the community and start saving recipes</p>

                <form onSubmit={handleSignup} className="space-y-5">
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
                      className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
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
                        minLength={6}
                        className="w-full rounded-xl border border-gray-200 py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
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
                      data-testid="button-submit-signup"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3.5 font-semibold transition-all duration-200"
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
                </form>

                <p className="text-center text-sm text-neutral-500 mt-5">
                  Already have an account?{" "}
                  <Link href="/login" className="text-orange-500 font-medium hover:text-orange-600">
                    Sign in
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
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-amber-900 mb-1">Choose a Username</h1>
                <p className="text-sm text-gray-500 mb-6">This is how others will find you</p>

                <form onSubmit={handleSetUsername} className="space-y-5">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                    <input
                      id="username"
                      type="text"
                      data-testid="input-username"
                      placeholder="yourname"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      required
                      minLength={3}
                      maxLength={30}
                      className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
                    />
                    <p className="text-xs text-neutral-400 mt-1.5">Only lowercase letters, numbers, and underscores.</p>
                  </div>

                  <div className="mt-6">
                    <Button
                      type="submit"
                      data-testid="button-submit-username"
                      disabled={loading || username.length < 3}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3.5 font-semibold transition-all duration-200"
                    >
                      {loading ? "Setting up..." : "Get Started"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
