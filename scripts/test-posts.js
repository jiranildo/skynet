
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPosts() {
    try {
        console.log('--- TEST POSTS START ---');

        console.log('\n[1] Fetching posts (anon key)...');
        const { data: posts, error: postError } = await supabase
            .from('posts')
            .select('*')
            .limit(5);

        if (postError) {
            console.error('ERROR fetching posts:', postError.message);
        } else {
            console.log(`SUCCESS: Found ${posts?.length ?? 0} posts.`);
            if (posts?.length > 0) {
                console.log('Sample Post:', posts[0]);
            }
        }

        console.log('\n[2] Checking auth user...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) console.error('Auth Error:', authError.message);
        else console.log('Current User:', user ? user.id : 'None (Anon)');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testPosts();
