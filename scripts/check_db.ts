
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVisibility() {
    console.log('Searching for user Iranildo...');
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .ilike('username', '%Iranildo%');

    if (userError) {
        console.error('Error finding user:', userError);
        return;
    }

    if (!users || users.length === 0) {
        console.log('User Iranildo not found.');
        // Try listing all users to see valid names
        const { data: allUsers } = await supabase.from('users').select('username').limit(5);
        console.log('Some users:', allUsers);
        return;
    }

    const targetUser = users[0];
    console.log(`Found user: ${targetUser.username} (ID: ${targetUser.id})`);
    console.log('Privacy Setting:', targetUser.privacy_setting);

    // Check Reels
    console.log('Checking Reels...');
    const { data: reels, error: reelError } = await supabase
        .from('reels')
        .select('*')
        .eq('user_id', targetUser.id);

    if (reelError) console.error('Error fetching reels:', reelError);
    else console.log(`Found ${reels?.length || 0} reels.`);

    // Check "History" (Stories)
    console.log('Checking Stories (table "stories")...');
    const { data: stories, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', targetUser.id);

    if (storyError) {
        console.error('Error fetching stories (table might not exist):', storyError.message);
        // Fallback checks
        const { data: storyPosts, error: spError } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', targetUser.id)
            .eq('type', 'story');

        if (spError) console.log('Error checking posts type=story:', spError.message);
        else console.log(`Found ${storyPosts?.length || 0} posts with type='story'.`);
    } else {
        console.log(`Found ${stories?.length || 0} stories.`);
    }
}

checkVisibility();
