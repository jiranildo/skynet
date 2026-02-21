import { supabase } from './client';
import type { FoodExperience, FoodReview } from './types';

export const foodExperienceService = {
    async getAll(): Promise<FoodExperience[]> {
        const { data, error } = await supabase
            .from('food_experiences')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as FoodExperience[];
    },

    async getById(id: string): Promise<FoodExperience> {
        const { data, error } = await supabase
            .from('food_experiences')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as FoodExperience;
    },

    async create(experience: Omit<FoodExperience, 'id' | 'created_at'>): Promise<FoodExperience> {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('food_experiences')
            .insert({
                ...experience,
                user_id: user?.id
            })
            .select()
            .single();

        if (error) throw error;
        return data as FoodExperience;
    },

    async update(id: string, updates: Partial<FoodExperience>): Promise<FoodExperience> {
        const { data, error } = await supabase
            .from('food_experiences')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as FoodExperience;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('food_experiences')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async updateWouldReturn(id: string, wouldReturn: boolean): Promise<FoodExperience> {
        const { data, error } = await supabase
            .from('food_experiences')
            .update({ would_return: wouldReturn })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as FoodExperience;
    }
};

export const foodReviewService = {
    async getByExperience(experienceId: string): Promise<FoodReview[]> {
        const { data, error } = await supabase
            .from('food_reviews')
            .select('*')
            .eq('experience_id', experienceId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as FoodReview[];
    },

    async create(review: Omit<FoodReview, 'id' | 'created_at'>): Promise<FoodReview> {
        const { data, error } = await supabase
            .from('food_reviews')
            .insert(review)
            .select()
            .single();

        if (error) throw error;

        // Atualizar estatísticas da experiência
        await this.updateExperienceStats(review.experience_id);

        return data as FoodReview;
    },

    async update(id: string, updates: Partial<FoodReview>): Promise<FoodReview> {
        const { data, error } = await supabase
            .from('food_reviews')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Atualizar estatísticas da experiência
        if (data) {
            await this.updateExperienceStats(data.experience_id);
        }

        return data as FoodReview;
    },

    async delete(id: string, experienceId: string): Promise<void> {
        const { error } = await supabase
            .from('food_reviews')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Atualizar estatísticas da experiência
        await this.updateExperienceStats(experienceId);
    },

    async getUserReview(experienceId: string, userId: string): Promise<FoodReview | null> {
        const { data, error } = await supabase
            .from('food_reviews')
            .select('*')
            .eq('experience_id', experienceId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data as FoodReview | null;
    },

    async updateExperienceStats(experienceId: string): Promise<void> {
        const reviews = await this.getByExperience(experienceId);

        const reviewsCount = reviews.length;
        const averageRating = reviewsCount > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
            : 0;

        await supabase
            .from('food_experiences')
            .update({
                reviews_count: reviewsCount,
                average_rating: averageRating
            })
            .eq('id', experienceId);
    }
};
