import { useState } from "react";
import { supabase } from "../../backend/supabase";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
      // Step 1: get auth_id by username from public.user
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("auth_id")
        .eq("username", identifier)
        .limit(1)
        .maybeSingle();

      if (userError || !userData?.auth_id) {
        setError("Username tidak ditemukan.");
        setLoading(false);
        return;
      }

      // Step 2: get email by auth_id from auth.users
      const { data: authData, error: authError } = await supabase
        .from("auth.users")
        .select("email")
        .eq("id", userData.auth_id)
        .limit(1)
        .maybeSingle();

      if (authError || !authData?.email) {
        setError("Gagal mendapatkan email untuk username ini.");
        setLoading(false);
        return;
      }

      emailToUse = authData.email;
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

    setMessage("Login berhasil!");
    setLoading(false);

    // TODO: post-login logic like redirect
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