import { useContext, useState, createContext, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState();

  useEffect(() => {
    const { session, error } = supabase.auth.session();

    setUser(session?.user ?? null);
    const { subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    signIn: () =>
      supabase.auth.signInWithOAuth({
        provider: "google",
      }),
    signOut: () => supabase.auth.signOut(),
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
