import { supabase } from './client';
import type { CellarWine } from './types';

const CELLAR_STORAGE_KEY = 'cellar_wines_local';

// Funções auxiliares para armazenamento local
const getLocalWines = (): CellarWine[] => {
    try {
        const stored = localStorage.getItem(CELLAR_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveLocalWines = (wines: CellarWine[]): void => {
    try {
        localStorage.setItem(CELLAR_STORAGE_KEY, JSON.stringify(wines));
    } catch (error) {
        console.error('Erro ao salvar vinhos localmente:', error);
    }
};

export const cellarService = {
    async getAll(): Promise<CellarWine[]> {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        // Se não houver usuário autenticado, usa armazenamento local
        if (!user) {
            console.log('Usando armazenamento local para vinhos');
            return getLocalWines();
        }

        const { data, error } = await supabase
            .from('cellar_wines')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        console.log('Fetching wines for user:', user.id);


        if (error) {
            console.error('Error fetching wines:', JSON.stringify(error, null, 2));
            throw error;
        }
        return data as CellarWine[];
    },

    async getById(id: string): Promise<CellarWine> {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
            const wines = getLocalWines();
            const wine = wines.find(w => w.id === id);
            if (!wine) throw new Error('Vinho não encontrado');
            return wine;
        }

        const { data, error } = await supabase
            .from('cellar_wines')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as CellarWine;
    },

    async create(wine: Omit<CellarWine, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<CellarWine> {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        // Se não houver usuário, salva localmente
        if (!user) {
            const wines = getLocalWines();
            const newWine: CellarWine = {
                ...wine,
                id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            wines.unshift(newWine);
            saveLocalWines(wines);
            return newWine;
        }

        const { data, error } = await supabase
            .from('cellar_wines')
            .insert({ ...wine, user_id: user.id })
            .select()
            .single();

        if (error) {
            console.error('Error creating wine:', JSON.stringify(error, null, 2));
            throw error;
        }

        try {
            const { data: followers } = await supabase.from('followers').select('follower_id').eq('following_id', user.id).eq('status', 'accepted');
            if (followers && followers.length > 0) {
                const followerIds = followers.map(f => f.follower_id);
                const { data: userConfigs } = await supabase.from('users').select('id, notification_channels').in('id', followerIds);

                const { createNotification } = await import('./notifications');
                for (const f of followers) {
                    const uf = userConfigs?.find(c => c.id === f.follower_id);
                    if (uf?.notification_channels && uf.notification_channels.cellar_updates === false) continue;
                    
                    await createNotification({
                        user_id: f.follower_id,
                        type: 'system',
                        title: 'Nova garrafa na Adega',
                        message: `Adicionou ${data.quantity} un de ${data.name} na Adega.`,
                        related_user_id: user.id
                    }).catch(e => console.error(e));
                }
            }
        } catch (e) { console.error('Notify Error:', e); }

        return data as CellarWine;
    },

    async update(id: string, updates: Partial<CellarWine>): Promise<CellarWine> {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
            const wines = getLocalWines();
            const index = wines.findIndex(w => w.id === id);
            if (index === -1) throw new Error('Vinho não encontrado');

            wines[index] = {
                ...wines[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            saveLocalWines(wines);
            return wines[index];
        }

        const { data, error } = await supabase
            .from('cellar_wines')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as CellarWine;
    },

    async delete(id: string): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
            const wines = getLocalWines();
            const filtered = wines.filter(w => w.id !== id);
            saveLocalWines(filtered);
            return;
        }

        const { data: currentWine } = await supabase.from('cellar_wines').select('name').eq('id', id).single();

        const { error } = await supabase
            .from('cellar_wines')
            .delete()
            .eq('id', id);

        if (error) throw error;

        if (currentWine) {
             try {
                const { data: followers } = await supabase.from('followers').select('follower_id').eq('following_id', user.id).eq('status', 'accepted');
                if (followers && followers.length > 0) {
                    const followerIds = followers.map(f => f.follower_id);
                    const { data: userConfigs } = await supabase.from('users').select('id, notification_channels').in('id', followerIds);
    
                    const { createNotification } = await import('./notifications');
                    for (const f of followers) {
                        const uf = userConfigs?.find(c => c.id === f.follower_id);
                        if (uf?.notification_channels && uf.notification_channels.cellar_updates === false) continue;

                        await createNotification({
                            user_id: f.follower_id,
                            type: 'system',
                            title: 'Adega Atualizada',
                            message: `Removeu o vinho ${currentWine.name} da sua Adega.`,
                            related_user_id: user.id
                        }).catch(e => console.error(e));
                    }
                }
            } catch (e) { console.error('Notify Error:', e); }
        }
    },

    async updateQuantity(id: string, quantity: number): Promise<CellarWine> {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
            const wines = getLocalWines();
            const index = wines.findIndex(w => w.id === id);
            if (index === -1) throw new Error('Vinho não encontrado');

            wines[index] = {
                ...wines[index],
                quantity,
                updated_at: new Date().toISOString()
            };
            saveLocalWines(wines);
            return wines[index];
        }

        const { data: currentWine } = await supabase.from('cellar_wines').select('name, quantity').eq('id', id).single();

        const { data, error } = await supabase
            .from('cellar_wines')
            .update({ quantity, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        if (currentWine && currentWine.quantity !== quantity) {
            try {
                const { data: followers } = await supabase.from('followers').select('follower_id').eq('following_id', user.id).eq('status', 'accepted');
                if (followers && followers.length > 0) {
                    const followerIds = followers.map(f => f.follower_id);
                    const { data: userConfigs } = await supabase.from('users').select('id, notification_channels').in('id', followerIds);

                    const { createNotification } = await import('./notifications');
                    const diff = quantity - currentWine.quantity;
                    const actionMsg = diff > 0 ? `Adicionou +${diff}` : `Consumiu ${Math.abs(diff)}`;
                    for (const f of followers) {
                        const uf = userConfigs?.find(c => c.id === f.follower_id);
                        if (uf?.notification_channels && uf.notification_channels.cellar_updates === false) continue;

                        await createNotification({
                            user_id: f.follower_id,
                            type: 'system',
                            title: 'Atualização na Adega',
                            message: `${actionMsg} un de ${data.name} na Adega.`,
                            related_user_id: user.id
                        }).catch(e => console.error(e));
                    }
                }
            } catch (e) { console.error('Notify Error:', e); }
        }

        return data as CellarWine;
    },

    async getByType(type: string): Promise<CellarWine[]> {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
            const wines = getLocalWines();
            return wines.filter(w => w.type === type);
        }

        const { data, error } = await supabase
            .from('cellar_wines')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', type)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as CellarWine[];
    },

    async getStats(): Promise<{
        totalWines: number;
        totalBottles: number;
        totalValue: number;
        averageRating: number;
        byType: Record<string, number>;
        byCountry: Record<string, number>;
        byVintage: Record<string, number>;
    }> {
        const wines = await this.getAll();

        const stats = {
            totalWines: wines.length,
            totalBottles: wines.reduce((sum, wine) => sum + wine.quantity, 0),
            totalValue: wines.reduce((sum, wine) => sum + (wine.price || 0) * wine.quantity, 0),
            averageRating: wines.reduce((sum, wine) => sum + (wine.rating || 0), 0) / wines.length || 0,
            byType: {} as Record<string, number>,
            byCountry: {} as Record<string, number>,
            byVintage: {} as Record<string, number>,
        };

        wines.forEach(wine => {
            // Por tipo
            stats.byType[wine.type] = (stats.byType[wine.type] || 0) + wine.quantity;

            // Por país
            if (wine.country) {
                stats.byCountry[wine.country] = (stats.byCountry[wine.country] || 0) + wine.quantity;
            }

            // Por safra
            if (wine.vintage) {
                const vintageKey = wine.vintage.toString();
                stats.byVintage[vintageKey] = (stats.byVintage[vintageKey] || 0) + wine.quantity;
            }
        });

        return stats;
    }
};
