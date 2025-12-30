-- Add read_at and location columns to messages
alter table messages 
add column if not exists read_at timestamptz,
add column if not exists location_lat float8,
add column if not exists location_lng float8;

-- Add last_seen tracking for Groups and Communities
alter table group_members 
add column if not exists last_seen_at timestamptz default now();

alter table community_members 
add column if not exists last_seen_at timestamptz default now();

-- Add last_seen tracking for Direct Conversations
-- We track when each user last viewed this specific conversation
alter table conversations 
add column if not exists user1_last_seen timestamptz default now(),
add column if not exists user2_last_seen timestamptz default now();

-- Add is_deleted column for messages (Soft delete) or just rely on hard delete.
-- User asked for "Excluir Mensagens". We'll stick to Hard Delete for now as per plan, 
-- but IF we wanted soft delete per user, we'd need 'deleted_for' array.
-- Let's stick to the current plan which doesn't specify soft delete explicitly enough to complicate schema now.
-- Verify existing delete function does hard delete.
