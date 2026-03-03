import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Initialize Supabase Client with Service Role Key
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Verify User JWT
        const authHeader = req.headers.get('Authorization')!;
        const jwt = authHeader.replace('Bearer ', '');

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
        if (authError || !user) {
            console.error('[authError] Failed to verify JWT:', authError, 'user:', user);
            return new Response(JSON.stringify({ error: 'Unauthorized', details: authError }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        let callerRole = user.user_metadata?.role?.toLowerCase();
        let callerEntityId = user.user_metadata?.entity_id;

        if (!callerRole || (!callerEntityId && callerRole === 'admin')) {
            const { data: userRow } = await supabaseAdmin.from('users').select('role, entity_id').eq('id', user.id).single();
            if (userRow) {
                callerRole = callerRole || userRow.role?.toLowerCase();
                callerEntityId = callerEntityId || userRow.entity_id;
            }
        }

        if (callerRole !== 'super_admin' && callerRole !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden: Requires admin privileges' }), {
                status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Parse Request Body
        const { action, entityData, entityId } = await req.json();

        // ---- Authorization Checks ---- //
        if (callerRole === 'admin') {
            // Admins can only update their OWN entity
            if (action === 'create' || action === 'delete') {
                return new Response(JSON.stringify({ error: 'Forbidden: Admins cannot create or delete entities' }), {
                    status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            if (action === 'update' && entityId !== callerEntityId) {
                return new Response(JSON.stringify({ error: 'Forbidden: Cannot manage entities outside your own' }), {
                    status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        // ---- Execute Action ---- //
        if (action === 'create') {
            const { name, type, theme_config } = entityData;

            const { data: newEntity, error: createError } = await supabaseAdmin
                .from('entities')
                .insert([{ name, type, theme_config: theme_config || {} }])
                .select()
                .single();

            if (createError) throw createError;

            return new Response(JSON.stringify({ entity: newEntity }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });

        } else if (action === 'update') {
            const { name, type, theme_config } = entityData;

            const updates: any = {};
            if (name !== undefined) updates.name = name;
            // Admin users cannot change their own entity type, only super_admin can do it, but we'll accept it from super_admin or let admin update their own name/theme
            if (callerRole === 'super_admin' && type !== undefined) updates.type = type;
            if (theme_config !== undefined) updates.theme_config = theme_config;

            if (Object.keys(updates).length > 0) {
                const { error: updatePublicError } = await supabaseAdmin
                    .from('entities')
                    .update(updates)
                    .eq('id', entityId);

                if (updatePublicError) throw updatePublicError;
            }

            return new Response(JSON.stringify({ success: true, message: 'Entity updated' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });

        } else if (action === 'delete') {

            const { error: deleteError } = await supabaseAdmin.from('entities').delete().eq('id', entityId);
            if (deleteError) throw deleteError;

            return new Response(JSON.stringify({ success: true, message: 'Entity deleted' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });

        } else {
            return new Response(JSON.stringify({ error: 'Invalid action' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

    } catch (err: any) {
        console.error('[Function Error] Details:', err, err.stack);
        return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
