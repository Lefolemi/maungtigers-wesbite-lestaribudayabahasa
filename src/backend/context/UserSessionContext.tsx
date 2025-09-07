import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../supabase";

interface UserData {
  id: string; // auth_id
  user_id: number;
  email: string | null;
  username: string | null;
  nama: string | null;
  profile_pic: string | null;
  role: string | null;
  tanggal_dibuat: string | null;
}

interface UserSessionContextType {
  user: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserSessionContext = createContext<UserSessionContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("user")
        .select("user_id, nama, username, profile_pic, role, tanggal_dibuat")
        .eq("auth_id", authUser.id)
        .single();

      setUser({
        id: authUser.id,
        user_id: profile?.user_id ?? 0,
        email: authUser.email ?? null,
        username: profile?.username ?? null,
        nama: profile?.nama ?? null,
        profile_pic: profile?.profile_pic ?? null,
        role: profile?.role ?? null,
        tanggal_dibuat: profile?.tanggal_dibuat ?? null,
      });
    } catch (err) {
      console.error("Failed to load user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen to auth state changes and reload user automatically
    const { data: listener } = supabase.auth.onAuthStateChange((_event) => {
      loadUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <UserSessionContext.Provider value={{ user, loading, logout, refreshUser: loadUser }}>
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  return useContext(UserSessionContext);
}