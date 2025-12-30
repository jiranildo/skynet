
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMarketplace() {
    console.log('Checking marketplace_listings table...');
    const { data: listings, error } = await supabase.from('marketplace_listings').select('*');
    if (error) {
        console.error('Error fetching listings:', error);
    } else {
        console.log(`Found ${listings?.length || 0} listings.`);
        console.log(listings);
    }

    console.log('Checking trips table...');
    const { data: trips, error: tripError } = await supabase.from('trips').select('id, title, user_id, metadata').limit(5);
    if (tripError) {
        console.error('Error fetching trips:', tripError);
    } else {
        console.log(`Found ${trips?.length || 0} trips.`);
    }
}

checkMarketplace();
