import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

type NavItem = {
  label: string;
  path?: string;
  children?: { label: string; path: string; requiresArtikelPermission?: boolean }[];
  align: "left" | "right";
};

const navItems: NavItem[] = [
  { label: "Beranda", path: "/", align: "left" },
  {
    label: "Tentang",
    align: "left",
    children: [
      { label: "Tentang Website", path: "/tentang-website" },
    ],
  },
  {
    label: "Kontribusi",
    align: "left",
    children: [
      { label: "Kamus", path: "/kamus" },
      { label: "Cerita", path: "/cerita" },
      { label: "Makna Kata", path: "/makna-kata" },
    ],
  },
  { label: "Artikel", path: "/artikel", align: "left" },
  {
    label: "Buat",
    align: "right",
    children: [
      { label: "Kamus", path: "/kamus/buat" },
      { label: "Cerita", path: "/cerita/buat" },
      { label: "Makna Kata", path: "/makna-kata/buat" },
      { label: "Artikel", path: "/artikel/buat", requiresArtikelPermission: true },
    ],
  },
];

export default function Navbar() {
  return (
    <>
      <NavbarDesktop navItems={navItems} />
      <NavbarMobile navItems={navItems} />
    </>
  );
}