import { useContext, useState, createContext, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState();

  useEffect(() => {
    // async function getSession() {
    //   console.log("SUPABASE AUTH");
    //   console.log(supabase.auth);
    //   const {
    //     data: { session },
    //   } = await supabase.auth.getSession();
    //   const {
    //     data: { subscription },
    //   } = await supabase.auth.onAuthStateChange((_event, session) => {
    //     setUser(session?.user ?? null);
    //   });
    //   return () => subscription.unsubscribe();
    // }
    // getSession();
  }, []);

  const value = {
    signIn: () => console.log("HELLO"),
    // supabase.auth.signInWithOAuth({
    //   provider: "google",
    // }),
    signOut: () => supabase.auth.signOut(),
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
