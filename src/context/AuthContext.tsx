import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    themeConfig: any;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    themeConfig: null,
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

    const applyTheme = (config: any) => {
        if (!config) return;
        const root = document.documentElement;
        if (config.primary_color) {
            root.style.setProperty('--primary-color', config.primary_color);
            // Default Tailwind orange is #f97316 (500)
            // It could be useful to calculate variants, but for now we apply it globally
        }
        if (config.secondary_color) {
            root.style.setProperty('--secondary-color', config.secondary_color);
        }
    };

    const loadUserTheme = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('entity_id, entities(theme_config)')
                .eq('id', userId)
                .single();
            const entityData: any = Array.isArray(data?.entities) ? data.entities[0] : data?.entities;

            if (entityData?.theme_config) {
                const config = entityData.theme_config;
                setThemeConfig(config);
                applyTheme(config);
            }
        } catch (err) {
            console.error('Failed to load theme config:', err);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserTheme(session.user.id);
            }
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserTheme(session.user.id);
            } else {
                setThemeConfig(null);
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
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
