import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../supabase"; // Corrected import path

interface UserData {
  id: string; // This is auth_id (UUID from supabase.auth)
  user_id: number; // PK from public.user
  email: string | null;
  username: string | null;
  nama: string | null;
  profile_pic: string | null;
  role: string | null;
  tanggal_dibuat: string | null;
}

interface UserSessionContextType {
  user: UserData | null;
  loading: boolean; // Add loading state here
  logout: () => Promise<void>;
}

const UserSessionContext = createContext<UserSessionContextType>({
  user: null,
  loading: true, // Set default loading state to true
  logout: async () => {},
});

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true); // Initial loading state is true

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
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

      setLoading(false);
    };

    loadUser();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <UserSessionContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  return useContext(UserSessionContext);
}