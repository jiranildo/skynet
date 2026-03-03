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

        // We can decode the user JWT to know who is calling
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
        if (authError || !user) {
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
        const { action, userData, userId } = await req.json();

        // ---- Authorization Checks ---- //
        // If Caller is Admin (not Super Admin), restrict actions
        if (callerRole === 'admin') {
            // Admin can only create/edit users for their own entity
            if (userData?.entity_id && userData.entity_id !== callerEntityId) {
                return new Response(JSON.stringify({ error: 'Forbidden: Cannot manage users outside your entity' }), {
                    status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } else if (!userData?.entity_id) {
                // Se o admin não enviou o entity_id, forçamos o do admin
                userData.entity_id = callerEntityId;
            }

            // Admin cannot create super admins
            const targetRole = userData?.role?.toLowerCase();
            if (targetRole === 'super_admin') {
                return new Response(JSON.stringify({ error: 'Forbidden: Admins cannot create Super Admins' }), {
                    status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // If updating/deleting, Admin must only target users within their entity
            if ((action === 'update' || action === 'delete') && userId) {
                const { data: targetUser } = await supabaseAdmin.from('users').select('entity_id, role').eq('id', userId).single();
                if (!targetUser || targetUser.entity_id !== callerEntityId) {
                    return new Response(JSON.stringify({ error: 'Forbidden: User not found or outside your entity' }), {
                        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
                // Cannot modify another Super Admin
                if (targetUser.role?.toLowerCase() === 'super_admin') {
                    return new Response(JSON.stringify({ error: 'Forbidden: Cannot modify Super Admin accounts' }), {
                        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
            }
        }

        // ---- Execute Action ---- //
        if (action === 'create') {
            const { email, password, full_name, username, role, entity_id, status, created_by, force_password_reset, avatar_url } = userData;

            console.log('--- CREATING USER ---');
            console.log('Caller ID:', user.id, 'Role:', callerRole, 'Entity:', callerEntityId);
            console.log('User Data extracted entity_id:', entity_id);

            // Create Auth User
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name,
                    username,
                    role,
                    entity_id: entity_id || null, // EXPLICIT NULL
                    avatar_url: avatar_url || undefined,
                }
            });
            console.log('Create auth user result:', newUser ? newUser.user.id : 'no user', 'Error:', createError);

            if (createError) throw createError;

            // The profile might be created by trigger, but we can explicitly update it
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({
                    full_name,
                    username,
                    role,
                    entity_id: entity_id || null,
                    status: status || 'active',
                    created_by: created_by || user.id || null,
                    force_password_reset: force_password_reset || false,
                    avatar_url: avatar_url || undefined,
                })
                .eq('id', newUser.user.id);

            if (updateError) {
                console.error('Error updating public user:', updateError);
            }

            return new Response(JSON.stringify({ user: newUser.user }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });

        } else if (action === 'update') {
            const { email, password, full_name, username, role, entity_id, status, force_password_reset, avatar_url } = userData;

            // Update Auth User
            const authUpdates: any = { user_metadata: {} };
            if (email) authUpdates.email = email;
            if (password) authUpdates.password = password;
            if (full_name) authUpdates.user_metadata.full_name = full_name;
            if (username) authUpdates.user_metadata.username = username;
            if (role) authUpdates.user_metadata.role = role;
            if (entity_id) authUpdates.user_metadata.entity_id = entity_id;
            if (avatar_url) authUpdates.user_metadata.avatar_url = avatar_url;

            let authUpdated = false;
            if (Object.keys(authUpdates).length > 0 || Object.keys(authUpdates.user_metadata).length > 0) {
                const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdates);
                if (updateAuthError) throw updateAuthError;
                authUpdated = true;
            }

            // Update public user profile
            const publicUpdates: any = {};
            if (full_name) publicUpdates.full_name = full_name;
            if (username) publicUpdates.username = username;
            if (role) publicUpdates.role = role;
            if (entity_id) publicUpdates.entity_id = entity_id;
            if (status) publicUpdates.status = status;
            if (force_password_reset !== undefined) publicUpdates.force_password_reset = force_password_reset;
            if (avatar_url) publicUpdates.avatar_url = avatar_url;

            if (Object.keys(publicUpdates).length > 0) {
                const { error: updatePublicError } = await supabaseAdmin
                    .from('users')
                    .update(publicUpdates)
                    .eq('id', userId);
                if (updatePublicError) throw updatePublicError;
            }

            return new Response(JSON.stringify({ success: true, message: 'User updated' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });

        } else if (action === 'delete') {

            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
            if (deleteError) throw deleteError;

            return new Response(JSON.stringify({ success: true, message: 'User deleted' }), {
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
        console.error('Function error:', err);
        return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
