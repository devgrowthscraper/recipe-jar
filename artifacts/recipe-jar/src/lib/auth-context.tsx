import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, Profile } from "./supabase";

/** Derive a safe username from a User object */
function deriveUsername(u: User): string {
  const base = (u.email?.split("@")[0] ?? "").replace(/[^a-zA-Z0-9_]/g, "");
  return base.length >= 3 ? base : `user_${u.id.slice(0, 8)}`;
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /** Fetch the profile, and auto-create it if it doesn't exist yet */
  async function ensureProfile(u: User) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();

    if (existing) {
      setProfile(existing);
      return;
    }

    // Profile missing — create it now (happens after first sign-up)
    const { data: created } = await supabase
      .from("profiles")
      .upsert({ id: u.id, username: deriveUsername(u) }, { onConflict: "id" })
      .select()
      .single();

    setProfile(created ?? null);
  }

  async function refreshProfile() {
    if (user) await ensureProfile(user);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
