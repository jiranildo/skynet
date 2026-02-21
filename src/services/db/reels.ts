import { supabase } from './client';
import type { Reel, User } from './types';

export const getReels = async () => {
    const { data, error } = await supabase
        .from('reels')
        .select(`
      *,
      users (
        username,
        avatar_url
      )
    `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Reel & { users: User })[];
};

export const getReelsByUser = async (userId: string) => {
    const { data, error } = await supabase
        .from('reels')
        .select(`
      *,
      users (
        username,
        avatar_url
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Reel & { users: User })[];
};

export const createReel = async (reel: Omit<Reel, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count'>) => {
    const { data, error } = await supabase
        .from('reels')
        .insert(reel)
        .select()
        .single();

    if (error) throw error;
    return data as Reel;
};

export const likeReel = async (reelId: string, userId: string) => {
    const { data, error } = await supabase
        .from('likes')
        .insert({ reel_id: reelId, user_id: userId })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const unlikeReel = async (reelId: string, userId: string) => {
    const { error } = await supabase
        .from('likes')
        .delete()
        .eq('reel_id', reelId)
        .eq('user_id', userId);

    if (error) throw error;
};

export const checkIfReelLiked = async (reelId: string, userId: string) => {
    const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('reel_id', reelId)
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw error;
    return !!data;
};

export const getReelComments = async (reelId: string) => {
    const { data, error } = await supabase
        .from('comments')
        .select(`
      *,
      users (
        username,
        avatar_url
      )
    `)
        .eq('reel_id', reelId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

export const addReelComment = async (reelId: string, userId: string, content: string) => {
    const { data, error } = await supabase
        .from('comments')
        .insert({ reel_id: reelId, user_id: userId, content })
        .select(`
      *,
      users (
        username,
        avatar_url
      )
    `)
        .single();

    if (error) throw error;
    return data;
};
