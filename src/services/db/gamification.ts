import { supabase } from './client';
import type { UserGamification, UserBadge, UserMission, GamificationBadgeCatalog, GamificationMissionCatalog } from './types';

export const gamificationService = {
    async getCatalogBadges(): Promise<GamificationBadgeCatalog[]> {
        const { data, error } = await supabase.from('gamification_badges').select('*');
        if (error) throw error;
        return data as GamificationBadgeCatalog[];
    },

    async getCatalogMissions(): Promise<GamificationMissionCatalog[]> {
        const { data, error } = await supabase.from('gamification_missions').select('*');
        if (error) throw error;
        return data as GamificationMissionCatalog[];
    },

    async getRanking(): Promise<any[]> {
        const { data, error } = await supabase
            .from('gamification_ranking_view')
            .select('*')
            .order('xp', { ascending: false })
            .limit(100);

        if (error) throw error;

        return data.map((item, index) => ({
            rank: index + 1,
            user_id: item.user_id,
            name: item.name || 'Viajante',
            avatar: item.avatar || 'https://via.placeholder.com/80',
            level: item.level,
            xp: item.xp,
            badges: item.badges_count,
            trips: item.trips_count
        }));
    },

    async getUserGamification(): Promise<UserGamification> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code === 'PGRST116') {
            // Create if doesn't exist
            const newGamification: UserGamification = {
                user_id: user.id,
                level: 1,
                current_xp: 0,
                next_level_xp: 100,
                tm_balance: 500.00
            };
            const { data: newData, error: insertError } = await supabase
                .from('user_gamification')
                .insert(newGamification)
                .select()
                .single();

            if (insertError) throw insertError;
            return newData;
        }

        if (error) throw error;
        return data;
    },

    async addXP(amount: number): Promise<UserGamification> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const currentData = await this.getUserGamification();

        let newXP = currentData.current_xp + amount;
        let newLevel = currentData.level;
        let nextLevelXP = currentData.next_level_xp;

        while (newXP >= nextLevelXP) {
            newXP -= nextLevelXP;
            newLevel++;
            nextLevelXP = Math.floor(nextLevelXP * 1.5);
        }

        const { data, error } = await supabase
            .from('user_gamification')
            .update({
                current_xp: newXP,
                level: newLevel,
                next_level_xp: nextLevelXP,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateBalance(amount: number, type: 'earn' | 'spend'): Promise<number> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const currentData = await this.getUserGamification();
        const newBalance = type === 'earn'
            ? Number(currentData.tm_balance) + amount
            : Number(currentData.tm_balance) - amount;

        const { error } = await supabase
            .from('user_gamification')
            .update({
                tm_balance: newBalance,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

        if (error) throw error;
        return newBalance;
    },

    async getUserBadges(): Promise<UserBadge[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', user.id);

        if (error) throw error;
        return data as UserBadge[];
    },

    async unlockBadge(badgeId: string): Promise<UserBadge> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // UPSERT pattern
        const { data, error } = await supabase
            .from('user_badges')
            .upsert({
                user_id: user.id,
                badge_id: badgeId,
                unlocked: true,
                unlocked_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, badge_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getUserMissions(): Promise<UserMission[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('user_missions')
            .select('*')
            .eq('user_id', user.id);

        if (error) throw error;
        return data as UserMission[];
    },

    async completeMission(missionId: string): Promise<UserMission> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('user_missions')
            .upsert({
                user_id: user.id,
                mission_id: missionId,
                completed: true,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, mission_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
