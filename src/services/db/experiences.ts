import { supabase } from '../supabase';
import { Experience, ExperienceReview } from './types';

export const getSupplierExperiences = async (supplierId: string): Promise<Experience[]> => {
    const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching supplier experiences:', error);
        return [];
    }
    return data || [];
};

export const getMarketplaceExperiences = async (): Promise<Experience[]> => {
    const { data, error } = await supabase
        .from('experiences')
        .select('*, seller:supplier_id(full_name, avatar_url, username)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching marketplace experiences:', error);
        return [];
    }
    return data || [];
};

export const createExperience = async (experienceData: Omit<Experience, 'id' | 'created_at' | 'updated_at'>): Promise<Experience | null> => {
    const { data, error } = await supabase
        .from('experiences')
        .insert([experienceData])
        .select()
        .single();

    if (error) {
        console.error('Error creating experience:', error);
        return null;
    }
    return data;
};

export const updateExperience = async (experienceId: string, updates: Partial<Experience>): Promise<Experience | null> => {
    const { data, error } = await supabase
        .from('experiences')
        .update(updates)
        .eq('id', experienceId)
        .select()
        .single();

    if (error) {
        console.error('Error updating experience:', error);
        return null;
    }
    return data;
};

export const deleteExperience = async (experienceId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', experienceId);

    if (error) {
        console.error('Error deleting experience:', error);
        return false;
    }
    return true;
};

export const getExperienceReviews = async (experienceId: string) => {
    const { data, error } = await supabase
        .from('experience_reviews')
        .select('*, user:user_id(full_name, avatar_url, username)')
        .eq('experience_id', experienceId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching experience reviews:', error);
        return [];
    }
    return data;
};

export const submitExperienceReview = async (reviewData: Omit<ExperienceReview, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('experience_reviews')
        .insert([reviewData])
        .select()
        .single();

    if (error) {
        console.error('Error submitting experience review:', error);
        return null;
    }
    return data;
};

export async function uploadExperienceFile(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('experience-media')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
    }

    const { data } = supabase.storage
        .from('experience-media')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

export const getUserAcquiredExperiences = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_experiences')
        .select('*, experience:experience_id(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching acquired experiences:', error);
        return [];
    }
    return data;
};

export const acquireExperience = async (userId: string, experienceId: string) => {
    const { data, error } = await supabase
        .from('user_experiences')
        .insert([{ user_id: userId, experience_id: experienceId, status: 'available' }])
        .select()
        .single();

    if (error) {
        console.error('Error acquiring experience:', error);
        return null;
    }
    return data;
};

export const useUserExperience = async (userExperienceId: string) => {
    const { error } = await supabase
        .from('user_experiences')
        .update({ status: 'used' })
        .eq('id', userExperienceId);

    if (error) {
        console.error('Error using user experience:', error);
        return false;
    }
    return true;
};

export const checkExperienceAcquisition = async (userId: string, experienceId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('user_experiences')
        .select('id')
        .eq('user_id', userId)
        .eq('experience_id', experienceId)
        .limit(1);

    if (error) {
        console.error('Error checking experience acquisition:', error);
        return false;
    }
    return data && data.length > 0;
};
