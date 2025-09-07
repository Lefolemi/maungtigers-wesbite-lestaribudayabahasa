import { useState } from "react";
import { supabase } from "../../backend/supabase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password || !username || !nama) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      console.error("Auth signup error:", signUpError);
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data?.user) {
      setError("Gagal mendapatkan ID pengguna dari Supabase Auth.");
      setLoading(false);
      return;
    }

    const auth_id = data.user.id;

    const { error: insertError } = await supabase.from("user").insert([
      {
        auth_id,
        nama: nama || null,
        username: username || null,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      let customMessage = insertError.message;

      if (insertError.code === "23505") {
        if (customMessage.includes("username")) customMessage = "Username sudah digunakan.";
        else if (customMessage.includes("email")) customMessage = "Email sudah terdaftar.";
        else customMessage = "Data sudah ada di database.";
      } else if (insertError.code === "23514") {
        customMessage = "Data tidak sesuai dengan aturan.";
      }

      setError(customMessage);
    } else {
      setMessage("Registrasi berhasil! Periksa email Anda untuk verifikasi.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primer flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Daftar Akun</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primer focus:border-primer transition"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primer focus:border-primer transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primer focus:border-primer transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primer focus:border-primer transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-tersier text-white py-3 rounded-xl font-semibold hover:bg-tersier/90 transition disabled:opacity-50"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        {error && <p className="text-red-600 mt-4 text-center font-medium">{error}</p>}
        {message && <p className="text-green-600 mt-4 text-center font-medium">{message}</p>}
      </div>
    </div>
  );
}