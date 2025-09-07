// src/components/layout/Footer.tsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-sekunder text-white py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-12">
        {/* Branding + Mission */}
        <div className="flex flex-col items-center md:items-start md:w-1/3">
          <div className="flex items-center gap-3 mb-2">
            <img src="/favicon.ico" alt="BIN Logo" className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Bahasa Indah Nusantara</h2>
          </div>
          <p className="text-sm text-white/80 mb-4 text-center md:text-left">
            Ayo kita melestarikan bahasa-bahasa daerah dengan teknologi!
          </p>
        </div>

        {/* Link cards */}
        <div className="flex flex-col md:flex-row gap-8 md:w-2/3">
          <div className="flex flex-col gap-3 bg-white/10 rounded-lg p-4 flex-1">
            <h3 className="font-semibold mb-2">Navigasi</h3>
            <Link to="/" className="hover:underline text-sm">Beranda</Link>
            <Link to="/artikel" className="hover:underline text-sm">Tentang website</Link>
            <Link to="/cerita" className="hover:underline text-sm">Profile</Link>
            <Link to="/kamus" className="hover:underline text-sm">Dashboard</Link>
            <Link to="/kamus" className="hover:underline text-sm">Kontribusi user</Link>
          </div>
          <div className="flex flex-col gap-3 bg-white/10 rounded-lg p-4 flex-1">
            <h3 className="font-semibold mb-2">Kontribusi & Artikel</h3>
            <Link to="/makna-kata" className="hover:underline text-sm">Artikel</Link>
            <Link to="/tentang-website" className="hover:underline text-sm">Kamus</Link>
            <Link to="/timeline" className="hover:underline text-sm">Cerita</Link>
            <Link to="/makna-kata" className="hover:underline text-sm">Makna Kata</Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-12 border-t border-white/20 pt-4 text-center text-sm text-white/70">
        © 2025 Bahasa Indah Nusantara | Maung Tigers UBL <br />
        WEBSITE INI DIBUAT UNTUK KOMPETISI WEB DEVELOPMENT IITC 2025
      </div>
    </footer>
  );
}