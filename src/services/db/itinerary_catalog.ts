import { supabase } from '../supabase';

export interface ItineraryCatalog {
  id: string;
  title: string;
  destination: string;
  duration_days: number;
  description?: string;
  image_url?: string;
  category?: string;
  itinerary_data: any; // JSONB that matches the trip.itinerary format
  entity_id?: string; // Relation to entities table
  user_id?: string; // Relation to users table
  created_at: string;
}

export const getItineraryCatalogs = async (entityId?: string): Promise<ItineraryCatalog[]> => {
  let query = supabase
    .from('itinerary_catalog')
    .select('*')
    .order('created_at', { ascending: false });

  if (entityId) {
    query = query.eq('entity_id', entityId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching itinerary catalogs:', error);
    throw error;
  }

  return data || [];
};

export const createItineraryCatalog = async (catalog: Omit<ItineraryCatalog, 'id' | 'created_at'>): Promise<ItineraryCatalog> => {
  const { data, error } = await supabase
    .from('itinerary_catalog')
    .insert([catalog])
    .select()
    .single();

  if (error) {
    console.error('Error creating itinerary catalog:', error);
    throw error;
  }

  return data;
};

export const updateItineraryCatalog = async (id: string, catalog: Partial<Omit<ItineraryCatalog, 'id' | 'created_at'>>): Promise<ItineraryCatalog> => {
  const { data, error } = await supabase
    .from('itinerary_catalog')
    .update(catalog)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating itinerary catalog with id ${id}:`, error);
    throw error;
  }

  return data;
};

export const bulkCreateItineraryCatalog = async (catalogs: Omit<ItineraryCatalog, 'id' | 'created_at'>[]): Promise<ItineraryCatalog[]> => {
  const { data, error } = await supabase
    .from('itinerary_catalog')
    .insert(catalogs)
    .select();

  if (error) {
    console.error('Error bulk creating itinerary catalogs:', error);
    throw error;
  }

  return data || [];
};

export const deleteItineraryCatalog = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('itinerary_catalog')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting itinerary catalog with id ${id}:`, error);
    throw error;
  }
};
