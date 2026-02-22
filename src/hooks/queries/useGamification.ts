import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationService } from '@/services/supabase';

export function useGamification() {
    return useQuery({
        queryKey: ['gamification'],
        queryFn: () => gamificationService.getUserGamification(),
    });
}

export function useCatalogBadges() {
    return useQuery({
        queryKey: ['catalog_badges'],
        queryFn: () => gamificationService.getCatalogBadges(),
    });
}

export function useCatalogMissions() {
    return useQuery({
        queryKey: ['catalog_missions'],
        queryFn: () => gamificationService.getCatalogMissions(),
    });
}

export function useRanking() {
    return useQuery({
        queryKey: ['gamification_ranking'],
        queryFn: () => gamificationService.getRanking(),
    });
}

export function useBadges() {
    return useQuery({
        queryKey: ['badges'],
        queryFn: () => gamificationService.getUserBadges(),
    });
}

export function useMissions() {
    return useQuery({
        queryKey: ['missions'],
        queryFn: () => gamificationService.getUserMissions(),
    });
}

export function useAddXP() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (amount: number) => gamificationService.addXP(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gamification'] });
        },
    });
}

export function useUnlockBadge() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (badgeId: string) => gamificationService.unlockBadge(badgeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['badges'] });
        },
    });
}

export function useCompleteMission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (missionId: string) => gamificationService.completeMission(missionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['missions'] });
        },
    });
}
