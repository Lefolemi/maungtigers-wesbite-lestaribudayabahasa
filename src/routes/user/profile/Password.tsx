import { useState } from "react";
import zxcvbn from "zxcvbn";
import { supabase } from "../../../backend/supabase";
import { useUserSession } from "../../../backend/context/UserSessionContext";

export default function GantiPassword() {
  const { user } = useUserSession();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Check strength on every input
  const result = zxcvbn(newPassword);
  const scoreLabels = ["Sangat Lemah", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Mohon isi semua kolom.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password baru harus minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Re-authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setError("Password saat ini salah.");
        setLoading(false);
        return;
      }

      // Step 2: Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage("Password berhasil diganti!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ganti Password</h1>

      <form onSubmit={handleChangePassword}>
        {/* Current Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Password Saat Ini
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Masukkan password lama"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password Baru</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Buat password yang kuat"
            className="w-full px-3 py-2 border rounded"
          />

          {newPassword && (
            <div className="mt-2 text-sm">
              <p>Kekuatan: {scoreLabels[result.score]}</p>
              <p className={newPassword.length < 6 ? "text-red-600" : "text-gray-600"}>
                Password harus minimal 6 karakter
              </p>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ketik ulang password baru"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Mengganti..." : "Ganti Password"}
        </button>

        {/* Messages */}
        {error && <p className="text-red-600 mt-4">{error}</p>}
        {message && <p className="text-green-600 mt-4">{message}</p>}
      </form>
    </div>
  );
}