import { supabase } from './client';
import type { Trip, User } from './types';
import { sendMessage } from './messages';
import { createNotification } from './notifications';

export const notifySharedGroups = async (trip: Trip, groupIds: string[], sender: User) => {
    if (!groupIds || groupIds.length === 0) return;

    try {
        console.log(`Sending notifications for trip ${trip.title} shared with groups:`, groupIds);

        // 1. Get all members of these groups (to send individual notifications)
        const { data: members, error: membersError } = await supabase
            .from('group_members')
            .select('user_id, group_id, groups(name)')
            .in('group_id', groupIds)
            .eq('status', 'accepted')
            .neq('user_id', sender.id);

        if (membersError) throw membersError;

        // 2. Send automated message to each group chat
        // We do this in parallel grouped by group_id
        const uniqueGroupIds = [...new Set(groupIds)];
        await Promise.all(uniqueGroupIds.map(async (groupId) => {
            const message = `Compartilhou um roteiro: *${trip.title}* para *${trip.destination}*`;
            try {
                await sendMessage(groupId, 'group', message);
            } catch (err) {
                console.error(`Error sending message to group ${groupId}:`, err);
            }
        }));

        // 3. Create individual notifications for each member
        if (members && members.length > 0) {
            // Group notifications to avoid overlapping if a user is in multiple groups (though here it's specific to each group share)
            await Promise.all(members.map(async (member: any) => {
                const groupName = member.groups?.name || 'um grupo';
                try {
                    await createNotification({
                        user_id: member.user_id,
                        type: 'shared_trip',
                        title: 'Novo Roteiro Compartilhado',
                        message: `${sender.full_name} compartilhou o roteiro "${trip.title}" com o grupo ${groupName}`,
                        related_user_id: sender.id,
                        related_trip_id: trip.id
                    } as any);
                } catch (err) {
                    console.error(`Error creating notification for user ${member.user_id}:`, err);
                }
            }));
        }

    } catch (error) {
        console.error('Error in notifySharedGroups:', error);
        // We don't throw here to avoid breaking the share flow if notification fails
    }
};
