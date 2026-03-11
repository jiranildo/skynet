import { supabase } from './client';
import type { Role } from './types';

export const rolesService = {
    /**
     * Fetch all roles from the database.
     */
    async getAll(): Promise<Role[]> {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
        return data as Role[];
    },

    /**
     * Fetch a single role by ID.
     */
    async getById(id: string): Promise<Role> {
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching role by id:', error);
            throw error;
        }
        return data as Role;
    },

    /**
     * Create a new role.
     */
    async create(role: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> {
        const { data, error } = await supabase
            .from('roles')
            .insert({
                name: role.name,
                description: role.description,
                permissions: role.permissions,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating role:', error);
            throw error;
        }
        return data as Role;
    },

    /**
     * Update an existing role.
     */
    async update(id: string, updates: Partial<Role>): Promise<Role> {
        const { data, error } = await supabase
            .from('roles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating role:', error);
            throw error;
        }
        return data as Role;
    },

    /**
     * Delete a role.
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('roles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting role:', error);
            throw error;
        }
    }
};
