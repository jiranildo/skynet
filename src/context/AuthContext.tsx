import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    themeConfig: any;
    permissions: Record<string, boolean>;
    hasPermission: (permission: string) => boolean;
    isAdmin: boolean;
    isAgent: boolean;
    isSupplier: boolean;
    isSuperAdmin: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    themeConfig: null,
    permissions: {},
    hasPermission: () => false,
    isAdmin: false,
    isAgent: false,
    isSupplier: false,
    isSuperAdmin: false,
    signOut: async () => { },
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [themeConfig, setThemeConfig] = useState<any>(null);
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAgent, setIsAgent] = useState(false);
    const [isSupplier, setIsSupplier] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const applyTheme = (config: any) => {
        if (!config) return;
        const root = document.documentElement;
        if (config.primary_color) {
            root.style.setProperty('--primary-color', config.primary_color);
        }
        if (config.secondary_color) {
            root.style.setProperty('--secondary-color', config.secondary_color);
        }
    };

    const loadUserData = async (userId: string) => {
        console.log('[AuthContext] Loading user data for:', userId);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role, role_id, entities(theme_config), roles(name, permissions)')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('[AuthContext] Error loading user data:', error);
                throw error;
            }

            console.log('[AuthContext] Final User Profile:', {
                role: data?.role,
                role_id: data?.role_id,
                has_roles_data: !!data?.roles,
            });

            // Legacy role status for labels & compatibility
            const roleStr = data?.role?.toLowerCase() || '';
            setIsAdmin(roleStr === 'admin' || roleStr === 'superadmin' || roleStr === 'super_admin');
            setIsAgent(roleStr === 'agente');
            setIsSupplier(roleStr === 'fornecedor');
            setIsSuperAdmin(roleStr === 'superadmin' || roleStr === 'super_admin');

            // Load Theme
            const entityData: any = Array.isArray(data?.entities) ? data.entities[0] : data?.entities;
            if (entityData?.theme_config) {
                applyTheme(entityData.theme_config);
            }

            // Load Permissions
            const roleData: any = Array.isArray(data?.roles) ? data.roles[0] : data?.roles;
            if (roleData?.permissions) {
                console.log('[AuthContext] SUCCESS: Permissions loaded for role:', roleData.name);
                console.log('[AuthContext] Permissions Object:', JSON.stringify(roleData.permissions, null, 2));
                setPermissions(roleData.permissions);
            } else {
                console.warn('[AuthContext] WARNING: No permissions found in roleData. roleData exists?', !!roleData);
                if (roleData) console.log('[AuthContext] roleData keys:', Object.keys(roleData));
            }
        } catch (err) {
            console.error('[AuthContext] CRITICAL: Failed to load user data:', err);
        }
    };

    const hasPermission = useCallback((permission: string) => {
        if (permissions['all'] === true) return true;
        return !!permissions[permission];
    }, [permissions]);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserData(session.user.id);
            }
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserData(session.user.id);
            } else {
                setThemeConfig(null);
                setPermissions({});
                // Reset theme to defaults
                document.documentElement.style.removeProperty('--primary-color');
                document.documentElement.style.removeProperty('--secondary-color');
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        session,
        loading,
        themeConfig,
        permissions,
        hasPermission,
        isAdmin,
        isAgent,
        isSupplier,
        isSuperAdmin,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
