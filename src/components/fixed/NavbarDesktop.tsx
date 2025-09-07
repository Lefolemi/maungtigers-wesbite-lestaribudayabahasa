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

interface NavbarDesktopProps {
  navItems: NavItem[];
}

export default function NavbarDesktop({ navItems }: NavbarDesktopProps) {
  const [activeDropdown, setActiveDropdown] = useState<{
    label: string;
    align: "left" | "right";
    children: { label: string; path: string }[];
  } | null>(null);

  const { user, logout } = useUserSession();
  const { permissions } = useUserPerizinan();

  const canCreateArtikel = permissions["artikel"]?.boleh_buat ?? false;
  const canCreateKamus = permissions["kamus"]?.boleh_buat ?? false;

  const navPadding = "px-6 py-2";
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

  const handleMouseEnter = (item: NavItem) => {
    const children = getVisibleChildren(item.children);
    if (!children.length) return;
    setActiveDropdown({ label: item.label, align: item.align ?? "left", children });
  };

  const handleMouseLeave = () => setActiveDropdown(null);

  return (
    <div onMouseLeave={handleMouseLeave} className="hidden md:block relative">
      <nav className={`bg-sekunder text-white shadow-md ${navPadding}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center space-x-6">
            {navItems.filter((i) => i.align === "left").map((item) =>
              item.path ? (
                <Link key={item.path} to={item.path} className="hover:underline">
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onMouseEnter={() => handleMouseEnter(item)}
                  className="hover:underline"
                >
                  {item.label} ▼
                </button>
              )
            )}
          </div>

          {/* Right */}
          <div className="flex items-center space-x-4 relative">
            {user ? (
              <>
                {navItems.filter((i) => i.align === "right").map((item) =>
                  item.path ? (
                    <Link key={item.path} to={item.path} className="hover:underline">
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onMouseEnter={() => handleMouseEnter(item)}
                      className="hover:underline"
                    >
                      {item.label} ▼
                    </button>
                  )
                )}

                {/* Profile */}
                <div
                  className="relative"
                  onMouseEnter={() =>
                    setActiveDropdown({
                      label: "auth",
                      align: "right",
                      children: [
                        { label: "Profile", path: "/profile" },
                        { label: "Dashboard", path: "/dashboard" },
                        { label: "Kontribusi", path: "/lihat-kontribusi" },
                        { label: "Logout", path: "#" },
                      ],
                    })
                  }
                >
                  <button className="flex items-center space-x-2 hover:underline">
                    {user.profile_pic ? (
                      <img
                        src={user.profile_pic}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                        {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span>{user.username || user.email}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/register" className="hover:underline">Register</Link>
                <Link to="/login" className="hover:underline">Login</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mini Navbar Dropdown */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-sekunder text-white shadow-md"
            onMouseEnter={() => setActiveDropdown(activeDropdown)}
          >
            <div
              className={`max-w-7xl mx-auto flex py-2 gap-2 ${
                activeDropdown.align === "right" ? "justify-end" : "justify-start"
              }`}
            >
              {activeDropdown.children.map((child) =>
                child.label === "Logout" ? (
                  <button
                    key={child.label}
                    onClick={() => logout()}
                    className={menuItemClass + " cursor-pointer appearance-none bg-transparent border-0"}
                  >
                    {child.label}
                  </button>
                ) : (
                  <Link key={child.path} to={child.path} className={menuItemClass}>
                    {child.label}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}