import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUnreadMessagesCount, getUnreadNotificationsCount } from '../services/supabase';

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
        } else {
            setUnreadMessages(0);
            setUnreadNotifications(0);
        }
    }, [user, refreshCounts]);

    return { unreadMessages, unreadNotifications, refreshCounts };
};
