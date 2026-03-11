import { supabase } from './client';
import { User, Entity } from './types';

// Retorna todos os usuários se Super Admin, senão os da mesma entidade
export const getAdminUsers = async () => {
    console.log('[getAdminUsers] Starting fetch...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        console.log('[getAdminUsers] No session user found');
        return [];
    }

    let role = session.user.user_metadata?.role?.toLowerCase();
    let entityId = session.user.user_metadata?.entity_id;
    console.log('[getAdminUsers] User metadata:', { role, entityId });

    if (!role || (!entityId && role === 'admin')) {
        console.log('[getAdminUsers] Fetching fallback role from users table for id:', session.user.id);
        const { data: userRow, error: fetchErr } = await supabase.from('users').select('role, entity_id').eq('id', session.user.id).single();
        console.log('[getAdminUsers] Fallback fetch result:', { userRow, fetchErr });
        if (userRow) {
            role = role || userRow.role?.toLowerCase();
            entityId = entityId || userRow.entity_id;
        }
    }

    console.log('[getAdminUsers] Final role and entity resolved:', { role, entityId });

    let query = supabase.from('users').select('*, creator:created_by(id, full_name, username), entity:entities(id, name)');

    if (role === 'admin') {
        if (!entityId) {
            console.log('[getAdminUsers] Returning empty: admin with no entity');
            return []; // Admin without entity cannot see users
        }
        query = query.eq('entity_id', entityId);
    } else if (role !== 'super_admin') {
        console.log('[getAdminUsers] Returning empty: role is neither super_admin nor admin');
        return []; // Normal users cannot use this
    }

    console.log('[getAdminUsers] Executing main query...');
    const { data, error } = await query.order('created_at', { ascending: false });
    console.log('[getAdminUsers] Main query result:', { dataCount: data?.length, error });
    if (error) {
        console.error('Error fetching admin users:', error);
        return [];
    }
    return data as User[];
};

export interface ManageUserPayload {
    email?: string;
    password?: string;
    full_name?: string;
    username?: string;
    role?: string;
    role_id?: string;
    entity_id?: string;
    status?: string;
    created_by?: string;
    force_password_reset?: boolean;
    avatar_url?: string;
}

export const createAdminUser = async (userData: ManageUserPayload) => {
    const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'create', userData },
    });
    if (error) {
        let msg = error.message;
        if (error.context && typeof error.context.json === 'function') {
            try { const body = await error.context.json(); msg = body.error || msg; } catch (e) { }
        }
        throw new Error(msg);
    }
    return data;
};

export const updateAdminUser = async (userId: string, userData: ManageUserPayload) => {
    const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'update', userId, userData },
    });
    if (error) {
        let msg = error.message;
        if (error.context && typeof error.context.json === 'function') {
            try { const body = await error.context.json(); msg = body.error || msg; } catch (e) { }
        }
        throw new Error(msg);
    }
    return data;
};

export const deleteAdminUser = async (userId: string) => {
    const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'delete', userId },
    });
    if (error) {
        let msg = error.message;
        if (error.context && typeof error.context.json === 'function') {
            try { const body = await error.context.json(); msg = body.error || msg; } catch (e) { }
        }
        throw new Error(msg);
    }
    return data;
};

// --- Entities Management ---
export interface ManageEntityPayload {
    name?: string;
    type?: string;
    theme_config?: any;
}

export const getAdminEntities = async (role: string, entityId?: string) => {
    let query = supabase.from('entities').select('*');

    if (role === 'admin' && entityId) {
        query = query.eq('id', entityId);
    } else if (role !== 'super_admin') {
        throw new Error('Sem permissão para consultar empresas');
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data as Entity[];
};

export const createAdminEntity = async (entityData: ManageEntityPayload) => {
    const { data, error } = await supabase.functions.invoke('manage-entities', {
        body: { action: 'create', entityData },
    });
    if (error) throw error;
    return data;
};

export const updateAdminEntity = async (entityId: string, entityData: ManageEntityPayload) => {
    const { data, error } = await supabase.functions.invoke('manage-entities', {
        body: { action: 'update', entityId, entityData },
    });
    if (error) throw error;
    return data;
};

export const deleteAdminEntity = async (entityId: string) => {
    const { data, error } = await supabase.functions.invoke('manage-entities', {
        body: { action: 'delete', entityId },
    });
    if (error) throw error;
    return data;
};

// --- Marketplace Management ---

export interface AdminMarketplaceItem {
    id: string;
    title: string;
    seller: {
        id: string;
        full_name: string;
        username: string;
        avatar_url: string;
    } | null;
    price: number;
    currency: string;
    sales: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    cover_image: string;
    item_type: 'trip' | 'experience';
    category?: string;
    destination?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    visibility?: string;
}

export const getAdminMarketplaceItems = async (): Promise<AdminMarketplaceItem[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    let role = session.user.user_metadata?.role?.toLowerCase();
    let entityId = session.user.user_metadata?.entity_id;

    if (!role || (!entityId && role === 'admin')) {
        const { data: userRow } = await supabase.from('users').select('role, entity_id').eq('id', session.user.id).single();
        if (userRow) {
            role = role || userRow.role?.toLowerCase();
            entityId = entityId || userRow.entity_id;
        }
    }

    if (role !== 'super_admin' && role !== 'admin') return [];

    // 1. Fetch Experiences
    let expQuery = supabase
        .from('experiences')
        .select(`
            *,
            seller:supplier_id(id, full_name, username, avatar_url),
            user_experiences(quantity)
        `);

    if (role === 'admin' && entityId) {
        expQuery = expQuery.eq('supplier_id', entityId);
    }

    const { data: experiences, error: expError } = await expQuery.order('created_at', { ascending: false });

    // 2. Fetch Trips (All shared or marketplace related trips)
    let tripQuery = supabase
        .from('trips')
        .select(`
            *,
            seller:user_id(id, full_name, username, avatar_url),
            sales_count:user_purchased_trips(count)
        `);

    if (role === 'admin' && entityId) {
        // Admin usually sees items from their entity. 
    }

    const { data: trips, error: tripError } = await tripQuery.order('created_at', { ascending: false });

    if (expError) console.error('Error fetching admin experiences:', expError);
    if (tripError) console.error('Error fetching admin trips:', tripError);

    const normalizedExperiences: AdminMarketplaceItem[] = (experiences || []).map(item => ({
        id: item.id,
        title: item.title,
        seller: item.seller as any,
        price: item.price,
        currency: item.currency || 'TM',
        sales: item.user_experiences?.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0) || 0,
        status: item.status || 'pending',
        created_at: item.created_at,
        cover_image: item.cover_image || '',
        item_type: 'experience',
        category: item.category,
        location: item.location,
        visibility: 'public'
    }));

    const normalizedTrips: AdminMarketplaceItem[] = (trips || []).map(item => ({
        id: item.id,
        title: item.title,
        seller: item.seller as any,
        price: item.price_tm || 0,
        currency: 'TM',
        sales: item.sales_count?.[0]?.count || 0,
        status: item.status || 'approved',
        created_at: item.created_at,
        cover_image: item.cover_image || '',
        item_type: 'trip',
        category: 'Roteiro',
        destination: item.destination,
        start_date: item.start_date,
        end_date: item.end_date,
        visibility: item.visibility
    }));

    // Combine and sort
    return [...normalizedExperiences, ...normalizedTrips].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
};

export const updateMarketplaceItemStatus = async (
    itemId: string,
    itemType: 'trip' | 'experience',
    status: 'approved' | 'rejected' | 'pending'
) => {
    const table = itemType === 'trip' ? 'trips' : 'experiences';
    const { data, error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', itemId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteAdminMarketplaceItem = async (itemId: string, itemType: 'trip' | 'experience') => {
    const table = itemType === 'trip' ? 'trips' : 'experiences';
    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemId);

    if (error) throw error;
    return true;
};

// --- Analytics ---
export const getAdminAnalytics = async (role: string, entityId?: string, days: number = 30) => {
    const { data, error } = await supabase.rpc('get_admin_analytics', {
        p_role: role,
        p_entity_id: entityId,
        p_days: days
    });

    if (error) {
        console.error('Error fetching admin analytics:', error);
        throw error;
    }
    return data;
};
