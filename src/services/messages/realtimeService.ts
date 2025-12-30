
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';

type SubscriptionCallback = (payload: any) => void;

export class RealtimeManager {
    private channels: Map<string, RealtimeChannel> = new Map();

    subscribeToChat(chatId: string, onMessage: SubscriptionCallback) {
        if (this.channels.has(chatId)) return;

        const channel = supabase.channel(`chat:${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${chatId}` // Limitations of filters with OR.. better to separate
                    // Actually, Realtime filters are simple. 
                    // Better strategy: Listen to Global Messages for this User? No, too much data.
                    // Channel per chat is standard.
                },
                (payload) => onMessage(payload.new)
            )
            .subscribe();

        this.channels.set(chatId, channel);
    }

    // For Group/Community, logic is similar but different filter
    subscribeToGroup(groupId: string, onMessage: SubscriptionCallback) {
        const key = `group:${groupId}`;
        if (this.channels.has(key)) return;

        const channel = supabase.channel(key)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
                (payload) => onMessage(payload.new)
            )
            .subscribe();
        this.channels.set(key, channel);
    }

    subscribeToCommunity(commId: string, onMessage: SubscriptionCallback) {
        const key = `comm:${commId}`;
        if (this.channels.has(key)) return;

        const channel = supabase.channel(key)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `community_id=eq.${commId}` },
                (payload) => onMessage(payload.new)
            )
            .subscribe();
        this.channels.set(key, channel);
    }

    subscribeToUserEvents(userId: string, onInvite: SubscriptionCallback) {
        // Listen for new Invites in group_members
        const key = `user:${userId}`;
        if (this.channels.has(key)) return;

        const channel = supabase.channel(key)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'group_members', filter: `user_id=eq.${userId}` },
                (payload) => {
                    if (payload.new.status === 'invited') onInvite(payload.new);
                }
            )
            .subscribe();
        this.channels.set(key, channel);
    }

    unsubscribe(idOrKey: string) {
        const channel = this.channels.get(idOrKey);
        if (channel) {
            supabase.removeChannel(channel);
            this.channels.delete(idOrKey);
        }
    }

    unsubscribeAll() {
        this.channels.forEach(ch => supabase.removeChannel(ch));
        this.channels.clear();
    }
}

export const realtimeManager = new RealtimeManager();
