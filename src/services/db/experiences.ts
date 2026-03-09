import { supabase } from '../supabase';
import { Experience, ExperienceReview } from './types';

export const getSupplierExperiences = async (supplierId: string): Promise<Experience[]> => {
    const { data, error } = await supabase
        .from('experiences')
        .select('*, user_experiences(quantity)')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching supplier experiences:', error);
        return [];
    }

    return (data || []).map(exp => {
        const sales = exp.user_experiences?.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0) || 0;
        return {
            ...exp,
            sales_count: sales,
            total_revenue: sales * exp.price
        };
    });
};

export const getMarketplaceExperiences = async (): Promise<Experience[]> => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('experiences')
        .select('*, seller:supplier_id(full_name, avatar_url, username)')
        .or(`validity_start_date.lte.${today},validity_start_date.is.null`)
        .or(`validity_end_date.gte.${today},validity_end_date.is.null`)
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
    // Check if user already has this experience available
    const { data: existing } = await supabase
        .from('user_experiences')
        .select('*')
        .eq('user_id', userId)
        .eq('experience_id', experienceId)
        .eq('status', 'available')
        .single();

    if (existing) {
        // Increment quantity
        const { data, error } = await supabase
            .from('user_experiences')
            .update({ quantity: (existing.quantity || 1) + 1 })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) {
            console.error('Error incrementing experience quantity:', error);
            return null;
        }
        return data;
    } else {
        // Create new record
        const { data, error } = await supabase
            .from('user_experiences')
            .insert([{ user_id: userId, experience_id: experienceId, status: 'available', quantity: 1 }])
            .select()
            .single();

        if (error) {
            console.error('Error acquiring experience:', error);
            return null;
        }
        return data;
    }
};

export const useUserExperience = async (userExperienceId: string) => {
    // Get current quantity
    const { data: existing } = await supabase
        .from('user_experiences')
        .select('quantity')
        .eq('id', userExperienceId)
        .single();

    if (!existing) return false;

    const newQuantity = (existing.quantity || 1) - 1;

    if (newQuantity <= 0) {
        const { error } = await supabase
            .from('user_experiences')
            .update({ status: 'used', quantity: 0 })
            .eq('id', userExperienceId);

        if (error) {
            console.error('Error marking experience as used:', error);
            return false;
        }
    } else {
        const { error } = await supabase
            .from('user_experiences')
            .update({ quantity: newQuantity })
            .eq('id', userExperienceId);

        if (error) {
            console.error('Error decrementing experience quantity:', error);
            return false;
        }
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
