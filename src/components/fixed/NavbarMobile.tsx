import { Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserPerizinan } from "../../backend/context/UserPerizinanContext";
import { useUserSession } from "../../backend/context/UserSessionContext";

type NavItem = {
  label: string;
  path?: string;
  children?: { label: string; path: string; requiresArtikelPermission?: boolean }[];
  align?: "left" | "right";
};

interface NavbarMobileProps {
  navItems: NavItem[];
}

export default function NavbarMobile({ navItems }: NavbarMobileProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useUserSession();
  const { permissions } = useUserPerizinan();

  const canCreateArtikel = permissions["artikel"]?.boleh_buat ?? false;
  const canCreateKamus = permissions["kamus"]?.boleh_buat ?? false;

  const menuItemClass = "px-4 py-2 hover:bg-primer/20 text-white rounded transition";

  const getVisibleChildren = (children: NavItem["children"]) => {
    if (!children) return [];
    return children
      .filter((child) => {
        if (child.requiresArtikelPermission) return canCreateArtikel;
        if (child.path === "/kamus/buat") return canCreateKamus;
        return true;
      })
      .map((child) => ({ label: child.label, path: child.path! }));
  };

  return (
    <div className="md:hidden">
      <div className="bg-sekunder text-white px-6 py-2 flex justify-between items-center">
        <span className="font-bold">Logo</span>
        <button onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-sekunder text-white"
          >
            <div className="flex flex-col gap-2 p-4">
              {navItems.map((item) => {
                const children = getVisibleChildren(item.children);
                return (
                  <div key={item.label}>
                    {item.path ? (
                      <Link to={item.path} className={menuItemClass}>
                        {item.label}
                      </Link>
                    ) : (
                      <>
                        <span className="font-semibold">{item.label}</span>
                        <div className="flex flex-col ml-4 mt-1 gap-1">
                          {children.map((c) =>
                            c.label === "Logout" ? (
                              <button
                                key={c.label}
                                onClick={logout}
                                className={menuItemClass + " cursor-pointer appearance-none bg-transparent border-0"}
                              >
                                {c.label}
                              </button>
                            ) : (
                              <Link key={c.path} to={c.path} className={menuItemClass}>
                                {c.label}
                              </Link>
                            )
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {user && (
                <div className="mt-4 border-t border-white/30 pt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {user.profile_pic ? (
                      <img
                        src={user.profile_pic}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                        {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span>{user.username || user.email}</span>
                  </div>

                  <Link to="/profile" className={menuItemClass}>Profile</Link>
                  <Link to="/dashboard" className={menuItemClass}>Dashboard</Link>
                  <Link to="/lihat-kontribusi" className={menuItemClass}>Kontribusi</Link>
                  <button
                    onClick={logout}
                    className={menuItemClass + " cursor-pointer appearance-none bg-transparent border-0"}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}