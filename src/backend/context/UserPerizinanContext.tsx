import { createContext, useContext, useEffect, useState } from "react";
import { useUserSession } from "./UserSessionContext";
import { supabase } from "../supabase";

type Perizinan = {
  [tipeKonten: string]: {
    boleh_buat: boolean;
    boleh_edit: boolean;
    boleh_setujui: boolean;
  };
};

const UserPerizinanContext = createContext<{
  permissions: Perizinan;
  loading: boolean;
}>({
  permissions: {},
  loading: true,
});

export const UserPerizinanProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserSession();
  const [permissions, setPermissions] = useState<Perizinan>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissions({});
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("perizinan_user")
        .select("*")
        .eq("user_id", user.user_id);

      if (error) {
        console.error("Error fetching perizinan:", error);
        setPermissions({});
      } else {
        const map: Perizinan = {};
        data.forEach((row) => {
          map[row.tipe_konten] = {
            boleh_buat: row.boleh_buat === true || row.boleh_buat === "t",
            boleh_edit: row.boleh_edit === true || row.boleh_edit === "t",
            boleh_setujui: row.boleh_setujui === true || row.boleh_setujui === "t",
          };
        });
        setPermissions(map);
      }

      setLoading(false);
    };

    fetchPermissions();
  }, [user]);

  return (
    <UserPerizinanContext.Provider value={{ permissions, loading }}>
      {children}
    </UserPerizinanContext.Provider>
  );
};

export const useUserPerizinan = () => useContext(UserPerizinanContext);
