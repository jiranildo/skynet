import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Log headers for debugging
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        headersObj[key] = key.toLowerCase() === 'authorization' ? `${value.substring(0, 15)}...` : value;
    });
    console.log('[manage-users] Request Headers:', JSON.stringify(headersObj));

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
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            console.error('[manage-users] Missing Authorization header');
            return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        const jwt = authHeader.replace('Bearer ', '');

        // We can decode the user JWT to know who is calling
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
        if (authError || !user) {
            console.error('[manage-users] Auth error:', authError, 'User:', user);
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
        const body = await req.json();
        console.log('[manage-users] Request Body:', JSON.stringify(body));
        const { action, userData, userId } = body;

        // ---- Authorization Checks ---- //
        // If Caller is Admin (not Super Admin), restrict actions
        if (callerRole === 'admin') {
            // Admin can only create/edit users for their own entity
            if (userData?.entity_id && userData.entity_id !== callerEntityId) {
                return new Response(JSON.stringify({ error: 'Forbidden: Cannot manage users outside your entity' }), {
                    status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } else if (!userData?.entity_id && action === 'create') {
                // Se o admin não enviou o entity_id na criação, forçamos o do admin
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
            const { email, password, full_name, username, role, role_id, entity_id, status, created_by, force_password_reset, avatar_url } = userData;

            console.log('--- CREATING USER ---');
            console.log('Caller ID:', user.id, 'Role:', callerRole, 'Entity:', callerEntityId);
            console.log('User Data:', JSON.stringify(userData));

            // Create Auth User
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name,
                    username,
                    role,
                    role_id: role_id || null,
                    entity_id: entity_id || null,
                    avatar_url: avatar_url || undefined,
                    status: status || 'active'
                }
            });

            if (createError) {
                console.error('[manage-users] Create auth user error:', createError);
                throw createError;
            }

            console.log('[manage-users] Created auth user:', newUser.user.id);

            // Set ban_duration if status is suspended/banned
            if (status === 'suspended' || status === 'banned') {
                await supabaseAdmin.auth.admin.updateUserById(newUser.user.id, {
                    ban_duration: '87600h' // 10 years
                });
            }

            // The profile might be created by trigger, but we can explicitly update it
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({
                    full_name,
                    username,
                    role,
                    role_id: role_id || null,
                    entity_id: entity_id || null,
                    status: status || 'active',
                    created_by: created_by || user.id || null,
                    force_password_reset: force_password_reset || false,
                    avatar_url: avatar_url || undefined,
                })
                .eq('id', newUser.user.id);

            if (updateError) {
                console.error('[manage-users] Error updating public user profile:', updateError);
                // We don't throw here because the user is already created in Auth
            }

            return new Response(JSON.stringify({ user: newUser.user }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });

        } else if (action === 'update') {
            const { email, password, full_name, username, role, role_id, entity_id, status, force_password_reset, avatar_url } = userData;

            console.log('--- UPDATING USER ---', userId);
            console.log('Update Data:', JSON.stringify(userData));

            // Update Auth User
            const authUpdates: any = { user_metadata: {} };
            if (email) authUpdates.email = email;
            if (password) authUpdates.password = password;
            if (full_name) authUpdates.user_metadata.full_name = full_name;
            if (username) authUpdates.user_metadata.username = username;
            if (role) authUpdates.user_metadata.role = role;
            if (role_id) authUpdates.user_metadata.role_id = role_id;
            if (entity_id) authUpdates.user_metadata.entity_id = entity_id;
            if (avatar_url) authUpdates.user_metadata.avatar_url = avatar_url;

            // Sync status to metadata and ban_duration
            if (status) {
                authUpdates.user_metadata.status = status;
                if (status === 'suspended' || status === 'banned') {
                    authUpdates.ban_duration = '87600h';
                } else if (status === 'active') {
                    authUpdates.ban_duration = 'none';
                }
            }

            let authUpdated = false;
            // Only update if there are changes (keys in authUpdates or keys in user_metadata)
            if (Object.keys(authUpdates).length > 1 || Object.keys(authUpdates.user_metadata).length > 0) {
                console.log('[manage-users] Updating auth user with:', JSON.stringify(authUpdates));
                const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdates);
                if (updateAuthError) {
                    console.error('[manage-users] Update auth user error:', updateAuthError);
                    throw updateAuthError;
                }
                authUpdated = true;
            }

            // Update public user profile
            const publicUpdates: any = {};
            if (full_name) publicUpdates.full_name = full_name;
            if (username) publicUpdates.username = username;
            if (role) publicUpdates.role = role;
            if (role_id) publicUpdates.role_id = role_id;
            if (entity_id) publicUpdates.entity_id = entity_id;
            if (status) publicUpdates.status = status;
            if (force_password_reset !== undefined) publicUpdates.force_password_reset = force_password_reset;
            if (avatar_url) publicUpdates.avatar_url = avatar_url;

            if (Object.keys(publicUpdates).length > 0) {
                console.log('[manage-users] Updating public user profile with:', JSON.stringify(publicUpdates));
                const { error: updatePublicError } = await supabaseAdmin
                    .from('users')
                    .update(publicUpdates)
                    .eq('id', userId);

                if (updatePublicError) {
                    console.error('[manage-users] Update public user error:', updatePublicError);
                    throw updatePublicError;
                }
            }

            return new Response(JSON.stringify({ success: true, message: 'User updated successfully' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });

        } else if (action === 'delete') {
            console.log('--- DELETING USER ---', userId);

            if (!userId) {
                return new Response(JSON.stringify({ error: 'Missing userId for delete' }), {
                    status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 1. Delete from public users table first to avoid FK constraint issues
            // (The users_id_fkey on auth.users is likely NO ACTION)
            console.log('[manage-users] Deleting public user record for:', userId);
            const { error: publicDeleteError } = await supabaseAdmin
                .from('users')
                .delete()
                .eq('id', userId);

            if (publicDeleteError) {
                console.error('[manage-users] Public user delete error:', publicDeleteError);
                // We might want to continue anyway if the record is already gone
            }

            // 2. Delete from auth users
            console.log('[manage-users] Deleting auth user for:', userId);
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
            if (deleteError) {
                console.error('[manage-users] Auth delete user error:', deleteError);
                throw deleteError;
            }

            return new Response(JSON.stringify({ success: true, message: 'User deleted successfully' }), {
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
        console.error('[manage-users] Uncaught error:', err);
        return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});

