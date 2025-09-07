// src/routes/TentangWebsite.tsx
import { Link } from "react-router-dom";

export default function TentangWebsite() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-40 bg-primer flex items-center justify-center text-center px-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
                    Tentang BahasaIndahNusantara
                </h1>
            </div>

            {/* White Box Section: Tentang Website Summary */}
            <section className="w-full bg-white py-16">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-stretch gap-12">
                {/* Text Content - 70% */}
                <div className="md:w-7/10 space-y-4 text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-primer">
                    Tentang Website
                    </h2>
                    <p className="text-gray-700 max-w-xl">
                    Website ini dibuat untuk melestarikan bahasa dan budaya daerah Nusantara. 
                    Melalui kamus, cerita, dan makna kata, kami ingin menyediakan wadah yang mudah diakses 
                    agar pengetahuan budaya tetap hidup dan tidak hilang seiring waktu.
                    </p>
                    <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-tersier text-white font-semibold rounded-figma-md shadow hover:bg-tersier/90 transition"
                    >
                    Kembali ke Beranda
                    </Link>
                </div>

                {/* Image - 30% */}
                <div className="md:w-3/10 flex items-center">
                    <img
                    src="/images/tentang-website.png" // replace with your image
                    alt="Tentang Website Illustration"
                    className="w-full h-full rounded-figma-lg object-cover shadow-lg"
                    />
                </div>
                </div>
            </div>
            </section>

            {/* Visi dan Misi Section */}
            <section className="w-full bg-primer py-16">
            <div className="max-w-6xl mx-auto px-6 space-y-12">
                {/* Section Heading */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center drop-shadow-lg">
                Visi dan Misi
                </h2>

                {/* Visi & Misi Boxes */}
                <div className="flex flex-col md:flex-row gap-8">
                {/* Visi */}
                <div className="md:w-1/2 space-y-4">
                    <div className="bg-sekunder text-white rounded-figma-md p-4 shadow-md">
                    <h3 className="text-2xl font-bold">Visi</h3>
                    </div>
                    <div className="bg-white text-gray-700 rounded-figma-md p-6 shadow-md">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    </div>
                </div>

                {/* Misi */}
                <div className="md:w-1/2 space-y-4">
                    <div className="bg-sekunder text-white rounded-figma-md p-4 shadow-md">
                    <h3 className="text-2xl font-bold">Misi</h3>
                    </div>
                    <div className="bg-white text-gray-700 rounded-figma-md p-6 shadow-md">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    </div>
                </div>
                </div>
            </div>
            </section>

            {/* Perkenalkan Kami Section */}
            <section className="w-full bg-sekunder py-12">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
                Perkenalkan Kami
                </h2>
            </div>
            </section>

            {/* White Box Section: Team Summary */}
            <section className="w-full bg-white py-16 space-y-12">
            <div className="max-w-6xl mx-auto px-6 space-y-12">
                
                {/* Rezon */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Image - 30% */}
                <div className="md:w-3/10 flex justify-center">
                    <img
                    src="/kami/rezon.png"
                    alt="Rezon"
                    className="w-full h-full rounded-figma-lg object-cover shadow-lg"
                    />
                </div>

                {/* Text Content - 70% */}
                <div className="md:w-7/10 space-y-4 text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-primer">Rezon</h3>
                    <p className="text-gray-700 max-w-xl">
                    Rezon adalah anggota tim yang fokus pada pengembangan konten dan riset bahasa daerah.
                    </p>
                </div>
                </div>

                {/* Zhahir */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Image - 30% */}
                <div className="md:w-3/10 flex justify-center">
                    <img
                    src="/kami/zhahir.png"
                    alt="Zhahir"
                    className="w-full h-full rounded-figma-lg object-cover shadow-lg"
                    />
                </div>

                {/* Text Content - 70% */}
                <div className="md:w-7/10 space-y-4 text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-primer">Zhahir</h3>
                    <p className="text-gray-700 max-w-xl">
                    Zhahir berperan dalam desain dan manajemen proyek, memastikan website mudah diakses oleh semua orang.
                    </p>
                </div>
                </div>

                {/* Cintya */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Image - 30% */}
                <div className="md:w-3/10 flex justify-center">
                    <img
                    src="/kami/via.png"
                    alt="Cintya"
                    className="w-full h-full rounded-figma-lg object-cover shadow-lg"
                    />
                </div>

                {/* Text Content - 70% */}
                <div className="md:w-7/10 space-y-4 text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-primer">Cintya</h3>
                    <p className="text-gray-700 max-w-xl">
                    Cintya bertanggung jawab atas dokumentasi konten dan menjaga kualitas materi budaya yang dipublikasikan.
                    </p>
                </div>
                </div>

            </div>
            </section>

            {/* Terima Kasih Section */}
            <section className="w-full bg-sekunder py-12">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg">
                Terima kasih telah mengunjungi!
                </h2>
            </div>
            </section>
        </div>
    );
}