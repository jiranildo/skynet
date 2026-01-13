import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUnreadMessagesCount, getUnreadNotificationsCount, supabase } from '../services/supabase';

export const useUnreadCounts = () => {
    const { user } = useAuth();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const refreshCounts = useCallback(async () => {
        if (user) {
            try {
                const [mCount, nCount] = await Promise.all([
                    getUnreadMessagesCount(user.id),
                    getUnreadNotificationsCount(user.id)
                ]);
                setUnreadMessages(mCount);
                setUnreadNotifications(nCount);
            } catch (error) {
                console.error("Error refreshing counts:", error);
            }
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            refreshCounts();

            // Real-time subscription for messages
            const messagesSubscription = supabase
                .channel('unread-messages-count')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'messages',
                        filter: `receiver_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log("🔔 Message change detected!", payload);
                        refreshCounts(); // Refresh on any change to user's messages
                    }
                )
                .subscribe((status) => {
                    console.log("🔔 Message subscription status:", status);
                });

            // Real-time subscription for notifications
            const notificationsSubscription = supabase
                .channel('unread-notifications-count')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log("🔔 Notification change detected!", payload);
                        refreshCounts();
                    }
                )
                .subscribe((status) => {
                    console.log("🔔 Notification subscription status:", status);
                });

            return () => {
                messagesSubscription.unsubscribe();
                notificationsSubscription.unsubscribe();
            };
        } else {
            setUnreadMessages(0);
            setUnreadNotifications(0);
        }
    }, [user, refreshCounts]);

    return { unreadMessages, unreadNotifications, refreshCounts };
};
