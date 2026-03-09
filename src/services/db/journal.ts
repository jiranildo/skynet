import { supabase } from './client';
import type { TripJournalEntry } from './types';

export const getTripJournalEntries = async (tripId: string) => {
    const { data, error } = await supabase
        .from('trip_journal')
        .select('*, user:user_id(id, full_name, avatar_url, username)')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data as (TripJournalEntry & { user: any })[];
};

export const createJournalEntry = async (entry: Omit<TripJournalEntry, 'id' | 'created_at' | 'updated_at' | 'user'>) => {
    const { data, error } = await supabase
        .from('trip_journal')
        .insert(entry)
        .select('*, user:user_id(id, full_name, avatar_url, username)')
        .single();

    if (error) throw error;
    return data as TripJournalEntry;
};

export const updateJournalEntry = async (id: string, updates: Partial<TripJournalEntry>) => {
    const { data, error } = await supabase
        .from('trip_journal')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, user:user_id(id, full_name, avatar_url, username)')
        .single();

    if (error) throw error;
    return data as TripJournalEntry;
};

export const deleteJournalEntry = async (id: string) => {
    const { error } = await supabase
        .from('trip_journal')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
