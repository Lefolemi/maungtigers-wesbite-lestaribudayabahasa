import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,            // Still the same URL
    process.env.SUPABASE_SERVICE_ROLE_KEY!     // Private, server-only
);

export default async function handler(req, res) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ users: data.users });
}
