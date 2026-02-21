import { supabase } from './client';
import type { User, UserDocument, UserTravelProfile, UserHealthInfo, Follower } from './types';

export const getUser = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    const counts = await getUserCounts(userId);
    return { ...data, ...counts } as User;
};

// Helper to get accurate counts
const getUserCounts = async (userId: string) => {
    const [
        { count: followersCount },
        { count: followingCount },
        { count: postsCount }
    ] = await Promise.all([
        supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId).eq('status', 'accepted'),
        supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId).eq('status', 'accepted'),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ]);

    return {
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
        posts_count: postsCount || 0
    };
};

export const ensureUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile) {
        const counts = await getUserCounts(user.id);
        return { ...profile, ...counts } as User;
    }

    // Create missing profile
    const { data: newProfile, error } = await supabase
        .from('users')
        .insert([
            {
                id: user.id,
                // email: user.email, // Not in schema
                full_name: user.user_metadata?.full_name || 'User',
                username: user.email?.split('@')[0] || 'user',
                avatar_url: user.user_metadata?.avatar_url,
            }
        ])
        .select()
        .single();

    if (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
    return { ...newProfile, followers_count: 0, following_count: 0, posts_count: 0 } as User;
};

export const getUserByUsername = async (username: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error) throw error;
    const counts = await getUserCounts(data.id);
    return { ...data, ...counts } as User;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
    const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data as User;
};

export const uploadAvatar = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
};


export const createUser = async (user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'followers_count' | 'following_count' | 'posts_count'>) => {
    const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();

    if (error) throw error;
    return data as User;
};

export const updatePrivacySettings = async (userId: string, privacySetting: 'public' | 'private' | 'friends') => {
    const { data, error } = await supabase
        .from('users')
        .update({ privacy_setting: privacySetting, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data as User;
};

// ==================== PERSONAL INFO SERVICES ====================

// --- Documents ---
export const getUserDocuments = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserDocument[];
};

export const addUserDocument = async (doc: UserDocument) => {
    const { data, error } = await supabase
        .from('user_documents')
        .insert(doc)
        .select()
        .single();

    if (error) throw error;
    return data as UserDocument;
};

export const deleteUserDocument = async (id: string) => {
    const { error } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// --- Travel Profile ---
export const getUserTravelProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_travel_profile')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserTravelProfile[];
};

export const addUserTravelProfile = async (item: UserTravelProfile) => {
    const { data, error } = await supabase
        .from('user_travel_profile')
        .insert(item)
        .select()
        .single();

    if (error) throw error;
    return data as UserTravelProfile;
};

export const deleteUserTravelProfile = async (id: string) => {
    const { error } = await supabase
        .from('user_travel_profile')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// --- Health Info ---
export const getUserHealthInfo = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_health_info')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserHealthInfo[];
};

export const addUserHealthInfo = async (item: UserHealthInfo) => {
    const { data, error } = await supabase
        .from('user_health_info')
        .insert(item)
        .select()
        .single();

    if (error) throw error;
    return data as UserHealthInfo;
};

export const deleteUserHealthInfo = async (id: string) => {
    const { error } = await supabase
        .from('user_health_info')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// ==================== AMIZADES / SEGUIR ====================

export const getPendingFriendRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Assuming 'followers' table is used for friendships/follows
    // 'pending' status was added via migration
    const { data, error } = await supabase
        .from('followers')
        .select(`
    *,
      follower: users!followers_follower_id_fkey(id, username, full_name, avatar_url)
      `)
        .eq('following_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching friend requests:', error);
        return [];
    }

    // Map to a structure similar to invites for the UI
    return data.map(item => ({
        id: item.id,
        type: 'friend',
        target_id: item.follower_id, // The user acting is the follower (requester)
        name: item.follower.username || item.follower.full_name,
        avatar_url: item.follower.avatar_url,
        created_at: item.created_at
    }));
};

export const respondToFriendRequest = async (followerId: string, accept: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (accept) {
        const { error } = await supabase
            .from('followers')
            .update({ status: 'accepted' })
            .eq('follower_id', followerId)
            .eq('following_id', user.id);

        if (error) throw error;

        // Optional: Auto-follow back?
        // For now, just accept.

        // Notify the requester (follower) that we accepted
        await supabase.from('notifications').insert({
            user_id: followerId, // Recipient is the one who asked
            type: 'system', // or 'friend_accept'
            title: 'Solicitação Aceita',
            message: `${user.user_metadata.full_name || user.email} aceitou sua solicitação de amizade.`,
            related_user_id: user.id, // We are the one who accepted
            is_read: false
        });

    } else {
        const { error } = await supabase
            .from('followers')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', user.id);

        if (error) throw error;
    }
};

// ==================== SEGUIDORES ====================

export const followUser = async (followerId: string, followingId: string) => {
    // 1. Check target privacy
    const { data: targetUser } = await supabase
        .from('users')
        .select('privacy_setting, username')
        .eq('id', followingId)
        .single();

    const isPrivate = targetUser?.privacy_setting !== 'public';
    const status = isPrivate ? 'pending' : 'accepted';

    // 2. Create Follow
    const { data, error } = await supabase
        .from('followers')
        .insert({
            follower_id: followerId,
            following_id: followingId,
            status
        })
        .select()
        .single();

    if (error) throw error;

    // 3. Notify Target
    if (status === 'accepted') {
        // If public, notify "started following you"
        await supabase.from('notifications').insert({
            user_id: followingId,
            type: 'follow',
            related_user_id: followerId,
            title: 'Novo Seguidor',
            message: 'Começou a seguir você',
            is_read: false
        });
    } else {
        // If pending, notify "requested to follow you"
        // Ensuring it appears in the main stream as well
        await supabase.from('notifications').insert({
            user_id: followingId,
            type: 'friend_request', // New type for generic notification
            related_user_id: followerId,
            title: 'Solicitação de Amizade',
            message: 'Quer seguir você',
            is_read: false
        });
    }

    return data as Follower;
};

export const unfollowUser = async (followerId: string, followingId: string) => {
    const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

    if (error) throw error;
};

export const getFollowers = async (userId: string) => {
    const { data, error } = await supabase
        .from('followers')
        .select('*, follower:users!followers_follower_id_fkey(*)')
        .eq('following_id', userId)
        .eq('status', 'accepted');

    if (error) throw error;
    return data;
};

export const getFollowing = async (userId: string) => {
    const { data, error } = await supabase
        .from('followers')
        .select('*, following:users!followers_following_id_fkey(*)')
        .eq('follower_id', userId)
        .eq('status', 'accepted');

    if (error) throw error;
    return data;
};

export const getFollowingWithDetails = async (userId: string) => {
    // Step 1: Get the IDs of users being followed
    const { data: relationData, error: relationError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId);

    if (relationError) {
        console.error('Error fetching follower relations:', relationError);
        throw relationError;
    }

    // If no following, return empty immediately
    if (!relationData || relationData.length === 0) {
        return [];
    }

    const followingIds = relationData.map(r => r.following_id);

    // Step 2: Fetch the actual user details for these IDs
    const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url')
        .in('id', followingIds);

    if (usersError) {
        console.error('Error fetching user details:', usersError);
        throw usersError;
    }

    return usersData || [];
};

export const searchUsers = async (query: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url, privacy_setting')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);

    if (error) throw error;
    return data;
};
