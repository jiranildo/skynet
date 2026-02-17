
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://owxefvoklmqohitcexvr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9rJd2w0yGXppeQ0IEVn5hw_5AOYQdpp';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GIOVANNA_ID = '2b675486-8f36-48ff-a9d9-2b57bfc01662';

async function testFetch() {
    console.log('Testing fetch for target:', GIOVANNA_ID);

    const { data, error } = await supabase
        .from('followers')
        .select(`
      *,
      follower:users!followers_follower_id_fkey(id, username, full_name, avatar_url)
    `)
        .eq('following_id', GIOVANNA_ID)
        .eq('status', 'pending');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

testFetch();
