import { supabase } from './client';
import type { Group, Community } from './types';
// ==================== GRUPOS ====================

export const createGroup = async (name: string, description: string, members: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // 1. Create Group
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            name,
            description,
            created_by: user.id
        })
        .select()
        .single();

    if (groupError) throw groupError;

    // 2. Add members (including creator as admin)
    const membersToAdd = [
        { group_id: group.id, user_id: user.id, role: 'admin' },
        ...members.map(memberId => ({ group_id: group.id, user_id: memberId, role: 'member' }))
    ];

    const { error: membersError } = await supabase
        .from('group_members')
        .insert(membersToAdd);

    if (membersError) {
        console.error('Error adding group members:', membersError);
        // Ideally rollback group here
        throw membersError;
    }

    return group;
};

export const getGroups = async (userId: string) => {
    // Fetch groups where user is a member OR creator

    // 1. Get groups by membership
    const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

    if (memberError) throw memberError;

    // 2. Get groups by ownership (created_by)
    const { data: ownedData, error: ownedError } = await supabase
        .from('groups')
        .select('id')
        .eq('created_by', userId);

    if (ownedError) throw ownedError;

    // Combine IDs
    const groupIds = new Set([
        ...(memberData?.map((item: any) => item.group_id) || []),
        ...(ownedData?.map((item: any) => item.id) || [])
    ]);

    if (groupIds.size === 0) return [];

    const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', Array.from(groupIds));

    if (groupsError) throw groupsError;

    return groupsData as Group[];
};

export const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    const { data, error } = await supabase
        .from('groups')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', groupId)
        .select()
        .single();

    if (error) throw error;
    return data as Group;
};

export const deleteGroup = async (groupId: string) => {
    const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

    if (error) throw error;
};

export const leaveGroup = async (groupId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

    if (error) throw error;
};


// ==================== COMUNIDADES ====================

export const createCommunity = async (name: string, description: string, category: string, isPublic: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // 1. Create Community
    const { data: community, error: commError } = await supabase
        .from('communities')
        .insert({
            name,
            description,
            category,
            is_public: isPublic,
            created_by: user.id
        })
        .select()
        .single();

    if (commError) throw commError;

    // 2. Add creator as admin
    const { error: memberError } = await supabase
        .from('community_members')
        .insert({
            community_id: community.id,
            user_id: user.id,
            role: 'admin'
        });

    if (memberError) {
        console.error('Error adding community admin:', memberError);
        throw memberError;
    }

    return community;
};

export const getCommunities = async () => {
    // Fetch communities the user is a member of OR created (My Communities)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    console.log('Fetching communities for user:', user.id);

    // 1. Get communities by membership
    const { data: memberData, error: memberError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id);

    if (memberError) {
        console.error('Error fetching community memberships:', memberError);
        throw memberError;
    }

    // 2. Get communities by ownership
    const { data: ownedData, error: ownedError } = await supabase
        .from('communities')
        .select('id')
        .eq('created_by', user.id);

    if (ownedError) {
        console.error('Error fetching owned communities:', ownedError);
        // Don't throw, just continue with members? No, safer to throw or log
        throw ownedError;
    }

    const communityIds = new Set([
        ...(memberData?.map((item: any) => item.community_id) || []),
        ...(ownedData?.map((item: any) => item.id) || [])
    ]);

    console.log('Found Community IDs (Member + Owned):', Array.from(communityIds));

    if (communityIds.size === 0) return [];

    const { data: communitiesData, error: commError } = await supabase
        .from('communities')
        .select('*')
        .in('id', Array.from(communityIds));

    if (commError) {
        console.error('Error fetching community details:', commError);
        throw commError;
    }

    console.log('Fetched Communities Data count:', communitiesData?.length || 0);
    return communitiesData as Community[];
};

export const getAllCommunities = async () => {
    // Fetch ALL public communities (for discovery)
    const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('is_public', true)
        .order('members_count', { ascending: false });

    if (error) throw error;
    return data as Community[];
};

export const updateCommunity = async (communityId: string, updates: Partial<Community>) => {
    const { data, error } = await supabase
        .from('communities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', communityId)
        .select()
        .single();

    if (error) throw error;
    return data as Community;
};

export const deleteCommunity = async (communityId: string) => {
    const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);

    if (error) throw error;
};

export const joinCommunity = async (communityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Check if already member
    const { data: existing } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (existing) return; // Already a member

    const { error } = await supabase
        .from('community_members')
        .insert({
            community_id: communityId,
            user_id: user.id,
            role: 'member'
        });

    if (error) throw error;
};

export const leaveCommunity = async (communityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

    if (error) throw error;
};
