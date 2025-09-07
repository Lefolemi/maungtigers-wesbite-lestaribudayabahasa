// src/routes/Beranda.tsx
import { Link } from "react-router-dom";

export default function Beranda() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative min-h-[80vh] bg-gradient-to-b from-primer to-sekunder flex items-center justify-center text-center px-6">
        <div className="max-w-3xl space-y-6">
          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            SETIAP BAHASA DAERAH ADALAH WARISAN BUDAYA BERHARGA
          </h1>

          {/* Intro Text */}
          <p className="text-lg md:text-xl text-white/90 drop-shadow-sm">
            Mari kita melestarikan bahasa-bahasa daerah dengan teknologi!
          </p>

          {/* Buttons Wrapper */}
          <div className="flex flex-col gap-4 mt-6 w-full max-w-md mx-auto">
            {/* INTRODUKSI Button */}
            <a
              href="/intro"
              className="px-6 py-3 bg-tersier text-white font-semibold rounded-figma-md shadow-lg hover:bg-red-500 transition w-full"
            >
              INTRODUKSI
            </a>

            {/* Gabung + Telusuri Buttons */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <a
                href="/register"
                className="flex-1 px-6 py-3 bg-sekunder text-white font-semibold rounded-figma-md shadow-lg hover:bg-sekunder/80 transition"
              >
                Gabung
              </a>
              <a
                href="/kamus"
                className="flex-1 px-6 py-3 bg-sekunder text-white font-semibold rounded-figma-md shadow-lg hover:bg-sekunder/80 transition"
              >
                Telusuri
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* White Box Section: Tentang Kami */}
      <section className="w-full bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          {/* Section Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black">
            Tentang Kami
          </h2>

          {/* Team Members Row */}
          <div className="flex flex-wrap justify-center gap-8">
            {/* Member 1 */}
            <div className="flex flex-col items-center space-y-3">
              <img
                src="/kami/zhahir.png"
                alt="Team 1"
                className="w-40 h-40 object-cover rounded-figma-lg"
              />
              <p className="font-semibold text-lg text-center">Zhahir</p>
              <p className="text-gray-600 text-center">Figma Designer</p>
            </div>

            {/* Member 2 */}
            <div className="flex flex-col items-center space-y-3">
              <img
                src="/kami/rezon.png"
                alt="Team 2"
                className="w-40 h-40 object-cover rounded-figma-lg"
              />
              <p className="font-semibold text-lg text-center">Rezon</p>
              <p className="text-gray-600 text-center">Programmer</p>
            </div>

            {/* Member 3 */}
            <div className="flex flex-col items-center space-y-3">
              <img
                src="/kami/via.png"
                alt="Team 3"
                className="w-40 h-40 object-cover rounded-figma-lg"
              />
              <p className="font-semibold text-lg text-center">Cintya</p>
              <p className="text-gray-600 text-center">Pembuat Artikel</p>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width Section: Kenapa Melestarikan Bahasa */}
      <section className="w-full bg-primer py-16">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* Section Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Kenapa kita harus melestarikan bahasa daerah?
          </h2>

          {/* Section Text */}
          <p className="text-white/90 max-w-3xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. 
            Maecenas non laoreet odio. Fusce lobortis porttitor purus, vel vestibulum libero
            pharetra vel.
          </p>

          {/* Pelajari Selengkapnya Button */}
          <Link
            to="/tentang-website"
            className="inline-block px-6 py-3 bg-sekunder text-white font-semibold rounded-figma-md shadow hover:bg-sekunder/90 transition"
          >
            Pelajari Selengkapnya
          </Link>
        </div>
      </section>

      {/* Placeholder White Section for Image */}
      <section className="w-full bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* This will be replaced with an image later */}
        </div>
      </section>

      {/* Full-width Section: Lestarikan Bahasa */}
      <section className="w-full bg-tersier py-16">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          {/* Section 1 */}
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Ayo mulai lestarikan bahasa daerah di era modern
            </h3>
            <p className="text-white/90 max-w-3xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod ex at libero bibendum, nec gravida enim imperdiet.
            </p>
            <Link
              to="/kamus"
              className="inline-block px-6 py-3 bg-sekunder text-white font-semibold rounded-figma-md shadow hover:bg-sekunder/90 transition"
            >
              Pelajari Selengkapnya
            </Link>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Bagaimana melestarikan bahasa daerah dapat melestarikan budaya lokal
            </h3>
            <p className="text-white/90 max-w-3xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod ex at libero bibendum, nec gravida enim imperdiet.
            </p>
            <Link
              to="/artikel"
              className="inline-block px-6 py-3 bg-sekunder text-white font-semibold rounded-figma-md shadow hover:bg-sekunder/90 transition"
            >
              Pelajari Selengkapnya
            </Link>
          </div>
        </div>
      </section>

      {/* Placeholder White Section for Image */}
      <section className="w-full bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* This will be replaced with an image later */}
        </div>
      </section>
    </div>
  );
}