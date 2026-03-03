import { supabase } from './client';
import type { Entity, User } from './types';

/**
 * Fetches all active agencies (entities of type 'agency').
 */
export const getAgencies = async () => {
    const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('type', 'agency')
        .order('name');

    if (error) {
        console.error('Error fetching agencies:', error);
        throw error;
    }
    return data as Entity[];
};

/**
 * Fetches agents associated with a specific agency, or all agents if no agencyId is provided.
 */
export const getAgents = async (agencyId?: string) => {
    let query = supabase
        .from('users')
        .select('id, full_name, avatar_url, username, entity_id')
        .eq('role', 'agente');

    if (agencyId) {
        query = query.eq('entity_id', agencyId);
    }

    const { data, error } = await query.order('full_name');

    if (error) {
        console.error('Error fetching agents:', error);
        throw error;
    }
    return data as User[];
};

/**
 * Fetches details for a specific entity.
 */
export const getEntity = async (entityId: string) => {
    const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('id', entityId)
        .single();

    if (error) {
        console.error('Error fetching entity:', error);
        throw error;
    }
    return data as Entity;
};
