import { useState } from "react";
import { Link, useLocation } from "wouter";
import { UtensilsCrossed, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

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

    // Check if username is taken
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim())
      .single();

    if (existing) {
      toast({ title: "Username taken", description: "Please choose a different username.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .insert({ id: userId, username: username.trim() });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    await refreshProfile();
    toast({ title: "Welcome to Recipe Jar!", description: `Your account is ready, @${username.trim()}` });
    setLocation("/");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-amber-900">Recipe Jar</span>
          </Link>

          {step === "signup" ? (
            <>
              <h1 className="text-xl font-bold text-amber-900 mt-6 mb-1">Create your account</h1>
              <p className="text-sm text-neutral-500">Start saving recipes you love</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-amber-900 mt-6 mb-1">Choose a username</h1>
              <p className="text-sm text-neutral-500">This is how others will find you</p>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-black/5 p-6">
          {step === "signup" ? (
            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 rounded-xl border-neutral-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    data-testid="input-password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 pr-10 rounded-xl border-neutral-200"
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

              <Button
                type="submit"
                data-testid="button-submit-signup"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 font-semibold transition-all duration-200"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSetUsername} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username" className="text-sm font-medium text-neutral-700">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="username"
                    type="text"
                    data-testid="input-username"
                    placeholder="yourname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    required
                    minLength={3}
                    maxLength={30}
                    className="pl-10 rounded-xl border-neutral-200"
                  />
                </div>
                <p className="text-xs text-neutral-400">Only lowercase letters, numbers, and underscores.</p>
              </div>

              <Button
                type="submit"
                data-testid="button-submit-username"
                disabled={loading || username.length < 3}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 font-semibold transition-all duration-200"
              >
                {loading ? "Setting up..." : "Get Started"}
              </Button>
            </form>
          )}
        </div>

        {step === "signup" && (
          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-500 font-medium hover:text-orange-600">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
