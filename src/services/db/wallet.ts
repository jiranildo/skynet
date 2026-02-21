import { supabase } from './client';
import type { TravelMoneyTransaction, WalletEarnOption, WalletSpendOption, WalletBuyPackage } from './types';
import { gamificationService } from './gamification';
export const walletService = {
    async getEarnOptions(): Promise<WalletEarnOption[]> {
        const { data, error } = await supabase.from('wallet_earn_options').select('*');
        if (error) throw error;
        return data as WalletEarnOption[];
    },

    async getSpendOptions(): Promise<WalletSpendOption[]> {
        const { data, error } = await supabase.from('wallet_spend_options').select('*');
        if (error) throw error;
        return data as WalletSpendOption[];
    },

    async getBuyPackages(): Promise<WalletBuyPackage[]> {
        const { data, error } = await supabase.from('wallet_buy_packages').select('*').order('amount', { ascending: true });
        if (error) throw error;
        return data as WalletBuyPackage[];
    },

    async getTransactions(): Promise<TravelMoneyTransaction[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('travel_money_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as TravelMoneyTransaction[];
    },

    async addTransaction(transaction: Omit<TravelMoneyTransaction, 'id' | 'created_at' | 'user_id'>): Promise<TravelMoneyTransaction> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Múltiplas inserções numa única chamada (ex: Transacao e Update de Balance)
        // O ideal seria RPC ou Trigger no banco, mas para MVP faremos via client

        // 1. Inserir a transação
        const { data, error } = await supabase
            .from('travel_money_transactions')
            .insert({ ...transaction, user_id: user.id })
            .select()
            .single();

        if (error) throw error;

        // 2. Atualizar saldo no user_gamification
        await gamificationService.updateBalance(transaction.amount, transaction.type);

        return data as TravelMoneyTransaction;
    }
};
