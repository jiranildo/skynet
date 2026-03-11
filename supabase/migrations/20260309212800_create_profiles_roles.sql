-- Create the roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create policies for roles
CREATE POLICY "Roles are viewable by everyone" ON public.roles
    FOR SELECT USING (true);

CREATE POLICY "Only super_admins can insert roles" ON public.roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Only super_admins can update roles" ON public.roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Only super_admins can delete roles" ON public.roles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Add role_id to users table (keeping the old string role for backwards compatibility during transition)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- Insert default roles
INSERT INTO public.roles (id, name, description, permissions)
VALUES 
    (
        '00000000-0000-0000-0000-000000000001', 
        'Super Administrador', 
        'Acesso total ao sistema', 
        '{"all": true, "manage_users": true, "manage_roles": true, "manage_agencies": true, "manage_content": true}'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000002', 
        'Administrador', 
        'Acesso administrativo geral', 
        '{"all": false, "manage_users": true, "manage_roles": false, "manage_agencies": true, "manage_content": true}'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000003', 
        'Agente Financeiro', 
        'Acesso a relatórios financeiros e faturamento', 
        '{"all": false, "manage_users": false, "manage_roles": false, "manage_agencies": false, "manage_content": false, "view_financials": true, "manage_financials": true}'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000004', 
        'Viajante', 
        'Usuário padrão da plataforma', 
        '{"all": false, "manage_users": false, "manage_roles": false, "manage_agencies": false, "manage_content": false, "create_trips": true}'::jsonb
    )
ON CONFLICT (name) DO NOTHING;

-- Map existing user string roles to the new role_id where possible
UPDATE public.users 
SET role_id = '00000000-0000-0000-0000-000000000001'
WHERE role = 'super_admin' AND role_id IS NULL;

UPDATE public.users 
SET role_id = '00000000-0000-0000-0000-000000000002'
WHERE role = 'admin' AND role_id IS NULL;

UPDATE public.users 
SET role_id = '00000000-0000-0000-0000-000000000004'
WHERE role = 'viajante' AND role_id IS NULL;
