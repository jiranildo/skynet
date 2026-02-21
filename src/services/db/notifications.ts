import { supabase } from './client';
import type { Notification } from './types';

export const getNotificationsWithDetails = async (userId: string) => {
    // 1. Fetch raw notifications
    const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    if (!notifications || notifications.length === 0) return [];

    // 2. Extract IDs for related entities
    const relatedUserIds = [...new Set(notifications.map(n => n.related_user_id).filter(Boolean))];
    const relatedPostIds = [...new Set(notifications.map(n => n.related_post_id).filter(Boolean))];

    // 3. Fetch related entities in parallel
    const [usersResult, postsResult] = await Promise.all([
        relatedUserIds.length > 0
            ? supabase.from('users').select('id, username, avatar_url').in('id', relatedUserIds)
            : { data: [], error: null },
        relatedPostIds.length > 0
            ? supabase.from('posts').select('id, image_url').in('id', relatedPostIds)
            : { data: [], error: null }
    ]);

    if (usersResult.error) console.error('Error fetching related users:', usersResult.error);
    if (postsResult.error) console.error('Error fetching related posts:', postsResult.error);

    const usersMap = new Map((usersResult.data?.map(u => [u.id, u]) || []) as [string, any][]);
    const postsMap = new Map((postsResult.data?.map(p => [p.id, p]) || []) as [string, any][]);

    // 4. Join data
    return notifications.map(n => ({
        ...n,
        related_user: n.related_user_id ? usersMap.get(n.related_user_id) : null,
        related_post: n.related_post_id ? postsMap.get(n.related_post_id) : null
    }));
};

export const getNotifications = async (userId: string) => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => {
    const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

    if (error) throw error;
    return data as Notification;
};

export const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) throw error;
};

export const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

    if (error) throw error;
};

export const getUnreadNotificationsCount = async (userId: string) => {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw error;
    return count || 0;
};

export const markAllNotificationsAsRead = async (userId: string) => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw error;
};
