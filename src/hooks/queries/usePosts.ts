import { useQuery } from '@tanstack/react-query';
import { getFeedPosts, getPostsByUser, getExplorePosts } from '../../services/db/posts';

// Hooks for Social Feed

export function useFeedPosts(limit: number = 20, offset: number = 0, targetUserId?: string) {
    return useQuery({
        queryKey: ['posts', 'feed', targetUserId, limit, offset],
        queryFn: () => getFeedPosts(limit, offset, targetUserId),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useUserPosts(userId: string) {
    return useQuery({
        queryKey: ['posts', 'user', userId],
        queryFn: () => getPostsByUser(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });
}

export function useExplorePosts(limit: number = 30) {
    return useQuery({
        queryKey: ['posts', 'explore', limit],
        queryFn: () => getExplorePosts(limit),
        staleTime: 1000 * 60 * 15, // 15 minutes for explore
    });
}
