import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '@/services/supabase';

export function useTransactions() {
    return useQuery({
        queryKey: ['wallet_transactions'],
        queryFn: () => walletService.getTransactions(),
    });
}

export function useEarnOptions() {
    return useQuery({
        queryKey: ['wallet_earn_options'],
        queryFn: () => walletService.getEarnOptions(),
    });
}

export function useSpendOptions() {
    return useQuery({
        queryKey: ['wallet_spend_options'],
        queryFn: () => walletService.getSpendOptions(),
    });
}

export function useBuyPackages() {
    return useQuery({
        queryKey: ['wallet_buy_packages'],
        queryFn: () => walletService.getBuyPackages(),
    });
}

export function useAddTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (transaction: Omit<Parameters<typeof walletService.addTransaction>[0], 'id' | 'created_at' | 'user_id'>) =>
            walletService.addTransaction(transaction),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet_transactions'] });
            queryClient.invalidateQueries({ queryKey: ['gamification'] }); // balance changes
        },
    });
}
