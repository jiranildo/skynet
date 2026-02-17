
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) { console.error('Missing Env'); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStories() {
    console.log('--- DEBUG STORIES ---');

    // 1. Fetch ALL stories (ignore time)
    const { data: allStories, error: allError } = await supabase
        .from('stories')
        .select('*');

    if (allError) console.error('Error fetching all:', allError);
    else console.log(`Total Stories in DB: ${allStories?.length}`);

    if (allStories && allStories.length > 0) {
        console.log('Sample Story:', allStories[0]);
        console.log('Now (ISO):', new Date().toISOString());
        console.log('Expires At:', allStories[0].expires_at);

        // Check if it WOULD be returned by the query
        const isVisible = new Date(allStories[0].expires_at) > new Date();
        console.log(`Is Visible (Expires > Now)? ${isVisible}`);
    }

    // 2. Run the exact query used in app
    const { data: visibleStories, error: visibleError } = await supabase
        .from('stories')
        .select('*, users(username, avatar_url)')
        .gt('expires_at', new Date().toISOString());

    if (visibleError) console.error('Error in App Query:', visibleError);
    else console.log(`Stories visible to App Query: ${visibleStories?.length}`);
}

debugStories();
