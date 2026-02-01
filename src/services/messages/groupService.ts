
import { supabase, Group, Community, User } from '../supabase';

// --- GROUPS ---

export const createGroup = async (name: string, description: string, initialMemberIds: string[], imageFile?: File, isPublic: boolean = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    let avatar_url = null;
    if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `group_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        avatar_url = publicUrlData.publicUrl;
    }

    // 1. Create Group
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            name,
            description,
            created_by: user.id,
            avatar_url,
            is_public: isPublic
        })
        .select()
        .single();

    if (groupError) throw groupError;

    // 2. Add creator as ADMIN (accepted)
    const membersToAdd = [{
        group_id: group.id,
        user_id: user.id,
        role: 'admin',
        status: 'accepted'
    }];

    // 3. Invite other members (invited)
    // If public, members are optional, but if provided, they are invited.
    initialMemberIds.forEach(id => {
        if (id !== user.id) {
            membersToAdd.push({
                group_id: group.id,
                user_id: id,
                role: 'member',
                status: 'accepted'
            });
        }
    });

    const { error: membersError } = await supabase
        .from('group_members')
        .insert(membersToAdd);

    if (membersError) throw membersError;

    return group;
};

export const createCommunity = async (name: string, description: string, imageFile?: File, isPublic: boolean = true) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    let avatar_url = null;
    let cover_image = null;

    if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `community_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        avatar_url = publicUrlData.publicUrl;
    }

    // 1. Create Community
    const { data: community, error: commError } = await supabase
        .from('communities')
        .insert({
            name,
            description,
            created_by: user.id,
            avatar_url,
            cover_image,
            is_public: isPublic,
            category: 'general' // Default category
        })
        .select()
        .single();

    if (commError) throw commError;

    // 2. Add creator as ADMIN
    const { error: memberError } = await supabase
        .from('community_members')
        .insert({
            community_id: community.id,
            user_id: user.id,
            role: 'admin',
            status: 'accepted'
        });

    if (memberError) throw memberError;

    return community;
};


// --- UPDATED GET FUNCTIONS ---

export const getMyGroups = async (includeArchived: boolean = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: memberships, error } = await supabase
        .from('group_members')
        .select('group_id, is_archived, groups(*)')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

    if (error) throw error;

    // Filter by archive status
    const filteredMemberships = memberships.filter((m: any) => {
        if (includeArchived) return m.is_archived;
        return !m.is_archived;
    });

    const groupsMap = new Map();
    filteredMemberships?.forEach((m: any) => {
        if (m.groups) groupsMap.set(m.groups.id, m.groups);
    });

    const groups = Array.from(groupsMap.values()) as Group[];

    // Fetch real member counts
    const groupsWithCounts = await Promise.all(groups.map(async (g) => {
        const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', g.id)
            .eq('status', 'accepted');
        return { ...g, members_count: count || 0 };
    }));

    return groupsWithCounts;
};

export const getMyCommunities = async (includeArchived: boolean = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: memberships, error } = await supabase
        .from('community_members')
        .select('community_id, is_archived, communities(*)')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

    if (error) throw error;

    const filteredMemberships = memberships.filter((m: any) => {
        if (includeArchived) return m.is_archived;
        return !m.is_archived;
    });

    const commsMap = new Map();
    filteredMemberships?.forEach((m: any) => {
        if (m.communities) commsMap.set(m.communities.id, m.communities);
    });

    const comms = Array.from(commsMap.values()) as Community[];

    // Fetch real member counts
    const commsWithCounts = await Promise.all(comms.map(async (c) => {
        const { count } = await supabase
            .from('community_members')
            .select('*', { count: 'exact', head: true })
            .eq('community_id', c.id)
            .eq('status', 'accepted');
        return { ...c, members_count: count || 0 };
    }));

    return commsWithCounts;
};


// --- MANAGEMENT (Archive/Delete/Edit) ---

export const archiveGroup = async (groupId: string, archive: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    await supabase.from('group_members')
        .update({ is_archived: archive })
        .eq('group_id', groupId)
        .eq('user_id', user.id);
};

export const archiveCommunity = async (communityId: string, archive: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    await supabase.from('community_members')
        .update({ is_archived: archive })
        .eq('community_id', communityId)
        .eq('user_id', user.id);
};

export const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    // Only owner can update details, but RLS should handle that.
    const { error } = await supabase.from('groups').update(updates).eq('id', groupId);
    if (error) throw error;
};

export const updateCommunity = async (communityId: string, updates: Partial<Community>) => {
    const { error } = await supabase.from('communities').update(updates).eq('id', communityId);
    if (error) throw error;
};

export const deleteGroup = async (groupId: string) => {
    // Requires Owner permissions (RLS)
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) throw error;
};

export const deleteCommunity = async (communityId: string) => {
    const { error } = await supabase.from('communities').delete().eq('id', communityId);
    if (error) throw error;
};


export const joinCommunity = async (communityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if community is public
    const { data: comm } = await supabase.from('communities').select('is_public').eq('id', communityId).single();

    const status = comm?.is_public ? 'accepted' : 'requested';

    const { error } = await supabase.from('community_members').insert({
        community_id: communityId,
        user_id: user.id,
        role: 'member',
        status
    });

    if (error) throw error;
    return status;
};


// --- INVITES ---

export const getPendingGroupInvites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: groupInvites, error: groupError } = await supabase
        .from('group_members')
        .select(`
            id,
            group_id,
            role,
            joined_at,
            groups:group_id (
                id,
                name,
                avatar_url
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'invited');

    if (groupError) throw groupError;

    // TODO: Add Community invites if we distinguish them in DB schema or just use same table?
    // Current schema separates tables.
    const { data: commInvites, error: commError } = await supabase
        .from('community_members')
        .select(`
            id,
            community_id,
            role,
            joined_at,
            communities:community_id (
                id,
                name,
                avatar_url
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'invited');

    if (commError) throw commError;

    // Normalize
    // Normalize
    const groups = groupInvites
        ?.filter((i: any) => i.groups)
        .map((i: any) => ({
            id: i.id, // membership id
            target_id: i.groups.id,
            name: i.groups.name,
            avatar_url: i.groups.avatar_url,
            type: 'group' as const,
            role: i.role,
            sent_at: i.joined_at
        })) || [];

    const comms = commInvites
        ?.filter((i: any) => i.communities)
        .map((i: any) => ({
            id: i.id,
            target_id: i.communities.id,
            name: i.communities.name,
            avatar_url: i.communities.avatar_url,
            type: 'community' as const,
            role: i.role,
            sent_at: i.joined_at
        })) || [];

    return [...groups, ...comms];
};

export const respondToGroupInvite = async (
    type: 'group' | 'community',
    targetId: string, // group_id or community_id
    accept: boolean
) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const table = type === 'group' ? 'group_members' : 'community_members';
    const idField = type === 'group' ? 'group_id' : 'community_id';

    if (accept) {
        const { error } = await supabase
            .from(table)
            .update({ status: 'accepted', joined_at: new Date().toISOString() })
            .eq(idField, targetId)
            .eq('user_id', user.id);
        if (error) throw error;
    } else {
        // Reject = delete membership row? or status 'rejected'? 
        // Usually delete so they can be invited again or just declutter.
        const { error } = await supabase
            .from(table)
            .delete()
            .eq(idField, targetId)
            .eq('user_id', user.id);
        if (error) throw error;
    }
};



// --- MEMBERS MANAGEMENT ---

export const getGroupMembers = async (groupId: string) => {
    // 1. Get Membership Data
    const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('id, user_id, role')
        .eq('group_id', groupId)
        .eq('status', 'accepted');

    if (membersError) {
        console.error('Error fetching group members:', membersError);
        throw membersError;
    }

    if (!members || members.length === 0) return [];

    const userIds = members.map(m => m.user_id);

    // 2. Get User Details
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);

    if (usersError) {
        console.error('Error fetching member details:', usersError);
        throw usersError;
    }

    // 3. Merge
    // We filter out any members whose user details couldn't be found (deleted users?)
    return members.map(m => {
        const user = users?.find(u => u.id === m.user_id);
        if (!user) return null;
        return {
            ...user,
            role: m.role,
            membershipId: m.id
        };
    }).filter(m => m !== null);
};

export const getCommunityMembers = async (communityId: string) => {
    // 1. Get Membership Data
    const { data: members, error: membersError } = await supabase
        .from('community_members')
        .select('id, user_id, role')
        .eq('community_id', communityId)
        .eq('status', 'accepted');

    if (membersError) {
        console.error('Error fetching community members:', membersError);
        throw membersError;
    }

    if (!members || members.length === 0) return [];

    const userIds = members.map(m => m.user_id);

    // 2. Get User Details
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);

    if (usersError) {
        console.error('Error fetching member details:', usersError);
        throw usersError;
    }

    return members.map(m => {
        const user = users?.find(u => u.id === m.user_id);
        if (!user) return null;
        return {
            ...user,
            role: m.role,
            membershipId: m.id
        };
    }).filter(m => m !== null);
};

export const addGroupMember = async (groupId: string, userId: string) => {
    const { error } = await supabase
        .from('group_members')
        .insert({
            group_id: groupId,
            user_id: userId,
            role: 'member',
            status: 'accepted' // Auto-accept added members by admin
        });
    if (error) throw error;

    // Notify user
    const { data: group } = await supabase.from('groups').select('name').eq('id', groupId).single();
    if (group) {
        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'system', // or 'group_add'
            title: 'Novo Grupo',
            message: `Você foi adicionado ao grupo "${group.name}"`,
            is_read: false
        });
    }
};

export const addCommunityMember = async (communityId: string, userId: string) => {
    const { error } = await supabase
        .from('community_members')
        .insert({
            community_id: communityId,
            user_id: userId,
            role: 'member',
            status: 'accepted'
        });
    if (error) throw error;

    // Notify user
    const { data: comm } = await supabase.from('communities').select('name').eq('id', communityId).single();
    if (comm) {
        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'system',
            title: 'Nova Comunidade',
            message: `Você foi adicionado à comunidade "${comm.name}"`,
            is_read: false
        });
    }
};

export const removeGroupMember = async (groupId: string, userId: string) => {
    const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
    if (error) throw error;
};

export const removeCommunityMember = async (communityId: string, userId: string) => {
    const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);
    if (error) throw error;
};

export const uploadGroupAvatar = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `group_avatar_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
};

export const leaveGroup = async (groupId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);
    if (error) throw error;
};

export const leaveCommunity = async (communityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);
    if (error) throw error;
};
