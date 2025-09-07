export default function NotFound() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primer px-4">
        <div className="bg-white rounded-figma-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-5xl font-extrabold text-primer mb-4">404</h1>
          <p className="text-black mb-6">
            Halaman tidak ditemukan
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-tersier text-white font-semibold rounded-figma-md shadow hover:bg-tersier/90 transition"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }