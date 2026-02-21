import { supabase } from './client';
import type { Message, Conversation } from './types';

export const getConversationsWithDetails = async (userId: string) => {
    console.log('Fetching conversations for user:', userId);
    const { data, error } = await supabase
        .from('conversations')
        .select(`
    *,
      user1: users!conversation_user1_id_fkey(username, avatar_url, full_name),
      user2: users!conversation_user2_id_fkey(username, avatar_url, full_name)
      `)
        .or(`user1_id.eq.${userId}, user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

    if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }

    console.log('Fetched conversations count:', data?.length || 0);

    // Transform to friendlier format
    return data.map((c: any) => {
        const otherUser = c.user1_id === userId ? c.user2 : c.user1;
        return {
            ...c,
            otherUser
        };
    });
};

export const getOrCreateConversation = async (otherUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const userId1 = user.id;
    const userId2 = otherUserId;

    // Sort IDs to match the UNIQUE(user1_id, user2_id) logic if we decide to enforce order
    // For now, let's just check both possibilities or use the sorted approach
    const [sorted1, sorted2] = [userId1, userId2].sort();

    const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user1_id', sorted1)
        .eq('user2_id', sorted2)
        .maybeSingle();

    if (existing) return existing;

    const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
            user1_id: sorted1,
            user2_id: sorted2,
            last_message_at: new Date().toISOString()
        })
        .select()
        .single();

    if (createError) throw createError;
    return newConv;
};

export const markMessageAsRead = async (messageId: string) => {
    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

    if (error) throw error;
};

export const getUnreadMessagesCount = async (userId: string) => {
    const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false);

    if (error) throw error;
    return count || 0;
};

export const getMessages = async (chatId: string, type: 'direct' | 'group' | 'community') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return []; // Should handle auth better

    let query = supabase
        .from('messages')
        .select(`
    *,
      sender: users!sender_id(
        username,
        avatar_url
      )
      `)
        .order('created_at', { ascending: true });

    if (type === 'direct') {
        // Logic for direct messages (requires complex OR with current user)
        // Simplified: assuming chatId matches the conversation ID or other user ID logic handled higher up
        // For now, let's assume chatId IS the conversation/connection ID
        query = query.eq('conversation_id', chatId);
    } else if (type === 'group') {
        query = query.eq('group_id', chatId);
    } else if (type === 'community') {
        query = query.eq('community_id', chatId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender_id === (user?.id) ? 'me' : msg.sender?.username, // Simplify for UI
        avatar: msg.sender?.avatar_url,
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        created_at: msg.created_at,
        sender_id: msg.sender_id // Add this for precise ID checks
    }));
};

export const sendMessage = async (chatId: string, type: 'direct' | 'group' | 'community', content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const payload: any = {
        sender_id: user.id,
        content,
        created_at: new Date().toISOString()
    };

    if (type === 'direct') {
        // Determine receiver or use conversation_id
        // payload.receiver_id = chatId; 
        payload.conversation_id = chatId; // Assume chatId is conversation ID for simplicity
    } else if (type === 'group') {
        payload.group_id = chatId;
    } else if (type === 'community') {
        payload.community_id = chatId;
    }

    const { data, error } = await supabase
        .from('messages')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data;
};
