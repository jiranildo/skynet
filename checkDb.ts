import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: users, error } = await supabase
        .from('users')
        .select('id, full_name, role, entity_id, created_by, creator:created_by(id, full_name, username)')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log("LAST 5 USERS:");
    console.log(JSON.stringify(users, null, 2));
    if (error) console.error("ERROR:", error);
}

check();
