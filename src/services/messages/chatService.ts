
import { supabase, Message, Conversation } from '../supabase';

export interface ChatMessage extends Message {
    sender?: { username: string; avatar_url: string; full_name?: string };
    reply_to?: ChatMessage;
    type: 'text' | 'image' | 'video' | 'file' | 'audio' | 'system' | 'location';
    read_at?: string;
    location_lat?: number;
    location_lng?: number;
}

// --- CONVERSATIONS ---


export const getConversationsKeyed = async (status: 'active' | 'archived' = 'active') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // This is the Direct Messages list
    const { data, error } = await supabase
        .from('conversations')
        .select(`
            *,
            user1:users!conversations_user1_id_fkey(id, username, full_name, avatar_url),
            user2:users!conversations_user2_id_fkey(id, username, full_name, avatar_url)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

    if (error) throw error;

    return data.map((c: any) => {
        const other = c.user1_id === user.id ? c.user2 : c.user1;

        // Check archive status
        const isArchived = c.user1_id === user.id ? c.user1_archived : c.user2_archived;
        if (status === 'active' && isArchived) return null;
        if (status === 'archived' && !isArchived) return null;

        return {
            ...c,
            otherUser: {
                ...other,
                last_seen: c.user1_id === user.id ? c.user2_last_seen : c.user1_last_seen
            }
        };
    }).filter(Boolean);
};

export const updateLastSeen = async (chatId: string, type: 'direct' | 'group' | 'community') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date().toISOString();

    if (type === 'direct') {
        // We need to know if we are user1 or user2
        const { data: conv } = await supabase.from('conversations').select('user1_id, user2_id').eq('id', chatId).single();
        if (!conv) return;

        if (conv.user1_id === user.id) {
            await supabase.from('conversations').update({ user1_last_seen: now }).eq('id', chatId);
        } else {
            await supabase.from('conversations').update({ user2_last_seen: now }).eq('id', chatId);
        }
    } else if (type === 'group') {
        await supabase.from('group_members').update({ last_seen_at: now }).match({ group_id: chatId, user_id: user.id });
        // Mark group message notifications as read
        await supabase.from('notifications')
            .update({ is_read: true })
            .match({ user_id: user.id, type: 'message', related_group_id: chatId });
    } else if (type === 'community') {
        await supabase.from('community_members').update({ last_seen_at: now }).match({ community_id: chatId, user_id: user.id });
        // Mark community message notifications as read
        await supabase.from('notifications')
            .update({ is_read: true })
            .match({ user_id: user.id, type: 'message', related_community_id: chatId });
    }
};

export const createDirectConversation = async (otherUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');

    // Check existing
    const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single();

    if (existing) {
        // If it was archived, unarchive it for me
        if (existing.user1_id === user.id && existing.user1_archived) {
            await supabase.from('conversations').update({ user1_archived: false }).eq('id', existing.id);
        } else if (existing.user2_id === user.id && existing.user2_archived) {
            await supabase.from('conversations').update({ user2_archived: false }).eq('id', existing.id);
        }
        return existing;
    }

    // Create new
    const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
            user1_id: user.id,
            user2_id: otherUserId,
            last_message_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return newConv;
};


// --- MESSAGES ---

export const getMessages = async (
    scope: { conversationId?: string; groupId?: string; communityId?: string },
    limit = 50
) => {
    let query = supabase
        .from('messages')
        .select(`
            *,
            sender:users!messages_sender_id_fkey(username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false }) // Fetch latest first for scrolling up? Or standard?
        // Usually chat is fetched latest-first then reversed in UI, or limit+offset
        .limit(limit);

    if (scope.conversationId) query = query.eq('conversation_id', scope.conversationId);
    else if (scope.groupId) query = query.eq('group_id', scope.groupId);
    else if (scope.communityId) query = query.eq('community_id', scope.communityId);
    else return [];

    const { data, error } = await query;
    if (error) throw error;

    // Reverse to chronological order for display
    return (data || []).reverse() as ChatMessage[];
};

export const sendMessage = async (
    params: {
        content: string;
        type?: 'text' | 'image' | 'location';
        replyToId?: string;
        location?: { lat: number; lng: number };
        conversationId?: string;
        groupId?: string;
        communityId?: string;
    }
) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');

    // 1. Resolve receiver_id for Direct Messages
    let receiverId = null;
    if (params.conversationId) {
        // We need to fetch the conversation to see who the other user is
        // optimization: pass receiverId in params if possible, but for safety fetching here
        const { data: conv } = await supabase
            .from('conversations')
            .select('user1_id, user2_id')
            .eq('id', params.conversationId)
            .single();

        if (conv) {
            receiverId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
        }
    }

    const msgData: any = {
        sender_id: user.id,
        content: params.content,
        type: params.type || 'text',
        reply_to_id: params.replyToId || null,
        location_lat: params.location?.lat,
        location_lng: params.location?.lng,
        receiver_id: receiverId // Add receiver_id for unread counts
    };

    if (params.conversationId) msgData.conversation_id = params.conversationId;
    if (params.groupId) msgData.group_id = params.groupId;
    if (params.communityId) msgData.community_id = params.communityId;

    const { data: messageData, error } = await supabase
        .from('messages')
        .insert(msgData)
        .select(`
            *,
            sender:users!messages_sender_id_fkey(username, full_name, avatar_url)
        `)
        .single();

    if (error) throw error;

    // 2. Create Notification for Receiver (Direct Messages only for now)
    if (receiverId) {
        await supabase.from('notifications').insert({
            user_id: receiverId,
            type: 'message', // New type
            related_user_id: user.id,
            related_post_id: null, // No post
            title: 'Nova mensagem',
            message: params.content, // Or snippet
            is_read: false
        });
    }

    // 3. Group/Community Notifications
    if (params.groupId) {
        // Fetch group members to notify
        const { data: members } = await supabase
            .from('group_members')
            .select('user_id')
            .eq('group_id', params.groupId)
            .eq('status', 'accepted')
            .neq('user_id', user.id); // Don't notify self

        if (members && members.length > 0) {
            const notifications = members.map(m => ({
                user_id: m.user_id,
                type: 'message',
                related_user_id: user.id,
                related_group_id: params.groupId, // New column
                title: 'Nova mensagem no grupo',
                message: params.content,
                is_read: false,
            }));
            await supabase.from('notifications').insert(notifications);
        }
    } else if (params.communityId) {
        // Fetch community members to notify
        // Warning: This could be large for big communities.
        const { data: members } = await supabase
            .from('community_members')
            .select('user_id')
            .eq('community_id', params.communityId)
            .eq('status', 'accepted')
            .neq('user_id', user.id);

        if (members && members.length > 0) {
            const notifications = members.map(m => ({
                user_id: m.user_id,
                type: 'message',
                related_user_id: user.id,
                related_community_id: params.communityId, // New column
                title: 'Nova mensagem na comunidade',
                message: params.content,
                is_read: false
            }));
            await supabase.from('notifications').insert(notifications);
        }
    }

    // Update last_message
    const now = new Date().toISOString();
    let lastMsgText = params.content;
    if (params.type === 'image') lastMsgText = 'Sent an image';
    if (params.type === 'location') lastMsgText = 'Shared a location';

    const updatePayload = {
        last_message: lastMsgText,
        last_message_at: now
    };

    if (params.conversationId) {
        // Also unarchive if new message comes? (Optional, but good UX)
        // For now, simple update
        await supabase.from('conversations').update(updatePayload).eq('id', params.conversationId);
    } else if (params.groupId) {
        await supabase.from('groups').update(updatePayload).eq('id', params.groupId);
    } else if (params.communityId) {
        // Communities might not track last_message in this table depending on schema, but assuming they do
        // or we skip it.
    }

    return messageData as ChatMessage;
};


export const uploadAttachment = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');

    const fileExt = file.name.split('.').pop();
    const fileName = `attachment_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
};

export const markRead = async (msgIds: string[]) => {
    if (!msgIds.length) return;
    await supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() }).in('id', msgIds);
};

export const deleteMessage = async (messageId: string) => {
    // Only verify sender if needed, but RLS usually handles that.
    await supabase.from('messages').delete().eq('id', messageId);
};

// --- MANAGEMENT ---

export const archiveConversation = async (conversationId: string, archive: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Auth required');

    // We need to know if we are user1 or user2
    const { data: conv } = await supabase.from('conversations').select('user1_id, user2_id').eq('id', conversationId).single();
    if (!conv) return;

    if (conv.user1_id === user.id) {
        await supabase.from('conversations').update({ user1_archived: archive }).eq('id', conversationId);
    } else if (conv.user2_id === user.id) {
        await supabase.from('conversations').update({ user2_archived: archive }).eq('id', conversationId);
    }
}

export const deleteConversation = async (conversationId: string) => {
    // HARD DELETE
    await supabase.from('conversations').delete().eq('id', conversationId);
}

export const getChatHeaderInfo = async (chatId: string, type: 'direct' | 'group' | 'community') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    if (type === 'direct') {
        const { data: conv, error } = await supabase
            .from('conversations')
            .select(`
                *,
                user1:users!conversations_user1_id_fkey(username, full_name, avatar_url),
                user2:users!conversations_user2_id_fkey(username, full_name, avatar_url)
            `)
            .eq('id', chatId)
            .single();

        if (error || !conv) return null;

        const other = conv.user1_id === user.id ? conv.user2 : conv.user1;
        // Check online status if we track it? For now just static info + last_seen
        const lastSeen = conv.user1_id === user.id ? conv.user2_last_seen : conv.user1_last_seen;

        return {
            name: other.full_name || other.username,
            avatar: other.avatar_url,
            isOnline: false, // You could calculate this from lastSeen
            subtitle: lastSeen ? `Visto por último: ${new Date(lastSeen).toLocaleTimeString()}` : 'Offline'
        };
    } else if (type === 'group') {
        const { data: group } = await supabase.from('groups').select('*').eq('id', chatId).single();
        if (!group) return null;

        const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', chatId)
            .eq('status', 'accepted');

        return {
            name: group.name,
            avatar: group.avatar_url,
            isOnline: true,
            subtitle: `${count || 0} membros`,
            createdBy: group.created_by
        };
    } else if (type === 'community') {
        const { data: comm } = await supabase.from('communities').select('*').eq('id', chatId).single();
        if (!comm) return null;

        const { count } = await supabase
            .from('community_members')
            .select('*', { count: 'exact', head: true })
            .eq('community_id', chatId)
            .eq('status', 'accepted');

        return {
            name: comm.name,
            avatar: comm.avatar_url,
            isOnline: true,
            subtitle: `${count || 0} membros`,
            createdBy: comm.created_by
        };
    }
    return null;
};
