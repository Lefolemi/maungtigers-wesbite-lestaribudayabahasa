// api/admin-get-users.ts
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ users: data });
}