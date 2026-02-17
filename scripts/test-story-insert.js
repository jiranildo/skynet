
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStoryInsert() {
    console.log('--- TEST STORY INSERT ---');

    // 1. Identify User (Need a user content ID to link... can't without login)
    // Since we can't login easily as the user without password, we can't insert as them.
    // EXCEPT if I enable a temporary "public insert" policy for debugging? No, risky.

    // I will check if any user exists at all.
    const { data: users } = await supabase.from('users').select('*');
    console.log(`Public Users found: ${users?.length}`);

    if (users && users.length > 0) {
        console.log('First User:', users[0]);
    }
}

testStoryInsert();
