-- Consolidate "Viajante" into "Role Básica (Free)"
-- ID for "Viajante" is '00000000-0000-0000-0000-000000000004'

-- 1. Rename and update permissions for the existing role
UPDATE public.roles
SET 
    name = 'Role Básica (Free)',
    description = 'Perfil padrão gratuito com acesso a recursos sociais e de viagem',
    permissions = '{
        "can_access_travel": true,
        "can_create_trips": true,
        "can_access_messages": true,
        "can_post_social": true,
        "can_access_explorer": true,
        "can_manage_checkins": true,
        "can_access_wallet": true,
        "can_access_my_space": true,
        "can_access_gamification": true,
        "can_access_notifications": true,
        "can_access_cellar": true,
        "can_access_drinks_food": true,
        "can_access_services_portal": true,
        "can_access_sara_ai": true,
        "can_show_floating_ai": true,
        "can_use_ai_features": true,
        "can_ai_search": true,
        "can_ai_personalize": false,
        "can_ai_generate": false
    }'::jsonb,
    updated_at = timezone('utc'::text, now())
WHERE id = '00000000-0000-0000-0000-000000000004';

-- 2. Delete the redundant role if it was partially created
DELETE FROM public.roles WHERE id = '00000000-0000-0000-0000-000000000005';
