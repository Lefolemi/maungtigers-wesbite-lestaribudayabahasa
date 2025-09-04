import { useState } from "react";
import { supabase } from "../../backend/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!identifier || !password) {
      setError("Mohon isi email/username dan password.");
      return;
    }

    setLoading(true);

    let emailToUse = identifier;
    const isEmail = identifier.includes("@");

    if (!isEmail) {
      const res = await fetch(`/api/get-email-by-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier }),
      });

      const data = await res.json();

      if (!res.ok || !data.email) {
        console.error("API error response:", data);
        setError(data.error || "Username tidak ditemukan.");
        setLoading(false);
        return;
      }

      emailToUse = data.email;
    }

    // Step 3: login with email + password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Step 4: get logged in user data
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Gagal mengambil data pengguna.");
      setLoading(false);
      return;
    }

    // Step 5: fetch numeric user_id from public.user using auth_id
    const { data: userRecord, error: userRecordError } = await supabase
      .from("user")
      .select("user_id")
      .eq("auth_id", userData.user.id)
      .single();

    if (userRecordError || !userRecord) {
      setError("Gagal menemukan user record.");
      setLoading(false);
      return;
    }

    const numericUserId = userRecord.user_id;

    // Step 6: check if user is suspended
    const { data: activeSuspension, error: suspendError } = await supabase
      .from("suspend_user")
      .select("*")
      .eq("user_id", numericUserId)
      .eq("status", "aktif")
      .limit(1)
      .single();

    if (suspendError && suspendError.code !== "PGRST116") { // ignore "no rows found" error
      console.error("Failed to check suspension:", suspendError.message);
      setLoading(false);
      return;
    } else if (activeSuspension) {
      setError(
        `Akun anda sedang disuspend sampai ${new Date(
          activeSuspension.lepas_suspend
        ).toLocaleString()}.\nAlasan: ${activeSuspension.alasan}`
      );
      setLoading(false);
      return;
    }

    // Step 7: fetch username from public.user table
    const { data: profileData, error: profileError } = await supabase
      .from("user")
      .select("username")
      .eq("user_id", numericUserId)
      .single();

    if (!profileError && profileData) {
      userData.user.user_metadata = {
        ...userData.user.user_metadata,
        username: profileData.username,
      };
    }

    navigate("/"); // redirect to homepage/dashboard
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Email atau Username"
          className="w-full p-2 border rounded"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>
      {error && <p className="text-red-600 mt-4">{error}</p>}
      {message && <p className="text-green-600 mt-4">{message}</p>}
    </div>
  );
}