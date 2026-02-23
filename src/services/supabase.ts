import { supabase } from './db/client';

export * from './db/types';
export * from './db/users';
export * from './db/posts';
export * from './db/reels';
export * from './db/trips';
export * from './db/food';
export * from './db/cellar';
export * from './db/bookings';
export * from './db/groups';
export * from './db/messages';
export * from './db/notifications';
export * from './db/gamification';
export * from './db/wallet';
export * from './db/sharing';

export { supabase };
export default supabase;
