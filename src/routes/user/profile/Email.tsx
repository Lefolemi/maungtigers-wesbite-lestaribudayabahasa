import { useState } from "react";
import { supabase } from "../../../backend/supabase";
import { useUserSession } from "../../../backend/context/UserSessionContext";

export default function GantiEmail() {
  const { user } = useUserSession();

  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!newEmail || !password) {
      setError("Mohon isi email baru dan password.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: re-authenticate with current email + password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password,
      });

      if (signInError) {
        setError("Password salah atau sesi tidak valid.");
        setLoading(false);
        return;
      }

      // Step 2: update email (works without verification if disabled in Supabase)
      const { data, error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage("Email berhasil diganti!");
        console.log("Updated user:", data);
      }
    } catch (err: any) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ganti Email</h1>
      <form onSubmit={handleChangeEmail}>
        {/* Current Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Email Saat Ini
          </label>
          <input
            type="email"
            value={user?.email ?? ""}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-100"
          />
        </div>

        {/* New Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email Baru</label>
          <input
            type="email"
            placeholder="contoh: user123@gmail.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Konfirmasi Password
          </label>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Mengganti..." : "Ganti Email"}
        </button>

        {/* Messages */}
        {error && <p className="text-red-600 mt-4">{error}</p>}
        {message && <p className="text-green-600 mt-4">{message}</p>}
      </form>
    </div>
  );
}