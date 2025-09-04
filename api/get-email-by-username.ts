import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // Step 1: Get auth_id from public.user
    const { data: userData, error: userError } = await supabaseAdmin
      .from("user")
      .select("auth_id")
      .eq("username", username)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: "User not found", details: userError?.message });
    }

    // Step 2: Use Admin API to get user by id
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userData.auth_id);

    if (authError || !authData || !authData.user) {
      return res.status(500).json({ error: "Failed to get email", details: authError?.message });
    }

    // Access email inside the user property
    return res.json({ email: authData.user.email });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}