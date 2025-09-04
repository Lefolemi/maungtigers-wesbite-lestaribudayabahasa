// /api/expire-suspensions.ts
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("suspend_user")
      .update({ status: "kadaluarsa" })
      .lte("lepas_suspend", now)
      .eq("status", "aktif");

    if (error) {
      return res.status(500).json({ error: "Failed to update suspensions", details: error.message });
    }

    const updatedData = data as { suspend_id: number }[] | null;

    return res.json({ updated: updatedData?.length ?? 0 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}