// src/routes/Beranda.tsx
import { Link } from "react-router-dom";

export default function Beranda() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative min-h-[80vh] flex items-center justify-center text-center px-6">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/tentang/main_laptop.webp')" }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primer to-sekunder opacity-80"></div>

      {/* Content */}
      <div className="relative max-w-3xl space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          SETIAP BAHASA DAERAH ADALAH WARISAN BUDAYA BERHARGA
        </h1>

        <p className="text-lg md:text-xl text-white/90 drop-shadow-sm">
          Mari kita melestarikan bahasa-bahasa daerah dengan teknologi!
        </p>

        <div className="flex flex-col gap-4 mt-6 w-full max-w-md mx-auto">
          <a
            href="/intro"
            className="px-6 py-3 bg-tersier text-white font-semibold rounded-figma-md shadow-lg hover:bg-red-500 transition w-full"
          >
            INTRODUKSI
          </a>

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
              <p className="text-gray-600 text-center">Riset dan dokumentai konten</p>
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
            Melestarikan bahasa daerah sangat penting karena bahasa merupakan bagian integral dari identitas budaya suatu komunitas. Bahasa mencerminkan sejarah, nilai, dan cara pandang masyarakat terhadap dunia. Kehilangan bahasa daerah berarti kehilangan sebagian dari warisan budaya yang tak ternilai harganya.
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

      {/* White Section for Image */}
      <section className="w-full">
        <img
          src="/tentang/peta_suku.png" // ganti sesuai file di public/
          alt="Ilustrasi"
          className="w-full object-cover"
        />
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
            Di era modern ini, pelestarian bahasa daerah dapat dilakukan dengan berbagai cara kreatif. Generasi muda dapat memanfaatkan teknologi dan media sosial untuk memperkenalkan dan menggunakan bahasa daerah. Misalnya, membuat konten digital seperti video, lagu, atau artikel yang menggunakan bahasa daerah dapat menarik minat generasi muda untuk lebih mengenal dan mencintai bahasa tersebut.
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
            Bahasa daerah bukan hanya alat komunikasi, tetapi juga wadah untuk menyampaikan nilai-nilai budaya, cerita rakyat, dan kearifan lokal. Dengan melestarikan bahasa daerah, kita juga turut menjaga kelangsungan budaya lokal yang terkandung di dalamnya. Penggunaan bahasa daerah dalam kehidupan sehari-hari, pendidikan, dan kegiatan budaya dapat memperkuat ikatan sosial dan identitas budaya masyarakat.
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

      {/* White Section for Image */}
      <section className="w-full">
        <img
          src="/tentang/adat_papua.jpg" // ganti sesuai file di public/
          alt="Ilustrasi"
          className="w-full object-cover"
        />
      </section>
    </div>
  );
}