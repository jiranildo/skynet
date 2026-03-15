import { supabase } from './client';
import { Trip, User } from './types';

export interface AgentStats {
    active_trips: number;
    supported_travelers: number;
    managed_budget: number;
    total_spent: number;
    monthly_earnings: number;
    average_rating: number;
}

export interface AgentDashboardData {
    totalTrips: number;
    totalTravelers: number;
    totalEarnings: number;
    agentGrowth: any[];
    statusDistribution: any[];
    recentActivity: any[];
}

export const getAgentAnalyticsDashboard = async (userId: string, days: number = 30): Promise<AgentDashboardData | null> => {
    try {
        const { data, error } = await supabase.rpc('get_agent_dashboard_analytics', {
            p_user_id: userId,
            p_days: days
        });

        if (error) throw error;
        return data as AgentDashboardData;
    } catch (error) {
        console.error('Error fetching agent dashboard analytics:', error);
        return null;
    }
};

export function calculateTripTotalSpent(trip: any): number {
    let total = 0;

    // 1. Manual expenses
    const expenses = trip.metadata?.expenses as { amount?: number }[] || [];
    total += expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);

    // 2. Itinerary prices
    if (trip.itinerary) {
        Object.values(trip.itinerary).forEach((dayActivities: any) => {
            if (Array.isArray(dayActivities)) {
                dayActivities.forEach((activity: any) => {
                    if (activity.price) {
                        if (typeof activity.price === 'number') {
                            total += activity.price;
                        } else if (typeof activity.price === 'string') {
                            // Extract number from price string (e.g. "R$ 150" -> 150)
                            const match = activity.price.match(/[\d.,]+/);
                            if (match) {
                                const numStr = match[0].replace(/\./g, '').replace(',', '.');
                                const num = parseFloat(numStr);
                                if (!isNaN(num)) {
                                    total += num;
                                }
                            }
                        }
                    }
                });
            }
        });
    }

    return total;
}

export function calculateItineraryProgress(trip: any): number {
    if (!trip.itinerary || Object.keys(trip.itinerary).length === 0) return 0;

    // We count a day as "planned" if it has at least one confirmed activity
    // or we can count total confirmed activities vs some baseline.
    // The simplest and most visual way (matching the modal's simple % metric): 
    // count how many days have at least one confirmed item vs total days.

    // Calculate total days
    const startDate = trip.start_date ? new Date(trip.start_date) : new Date();
    const endDate = trip.end_date ? new Date(trip.end_date) : new Date();
    const diffTime = endDate.getTime() - startDate.getTime();
    const totalDays = isNaN(diffTime) ? 1 : Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    let daysWithActivities = 0;

    for (let i = 0; i < totalDays; i++) {
        const dayActivities = trip.itinerary[i] || [];
        // Check if there's at least one confirmed activity that is not just a placeholder
        const hasConfirmed = dayActivities.some((a: any) => a.status === 'confirmed');
        if (hasConfirmed) {
            daysWithActivities++;
        }
    }

    return totalDays > 0 ? Math.round((daysWithActivities / totalDays) * 100) : 0;
}

export const getAgentStats = async (userId: string): Promise<AgentStats> => {
    try {
        const { data: userData } = await supabase.from('users').select('entity_id').eq('id', userId).single();
        const entityId = userData?.entity_id;

        let tripQuery = supabase.from('trips').select('id, travelers, budget, metadata');

        if (entityId) {
            tripQuery = tripQuery.or(`user_id.eq.${userId},responsible_agent_id.eq.${userId},responsible_agency_id.eq.${entityId},metadata->assignedAgents.cs.[{"id":"${userId}"}]`);
        } else {
            tripQuery = tripQuery.or(`user_id.eq.${userId},responsible_agent_id.eq.${userId},metadata->assignedAgents.cs.[{"id":"${userId}"}]`);
        }

        const { data: trips, error: tripsError } = await tripQuery;

        if (tripsError) throw tripsError;

        const supported_travelers = trips?.reduce((acc, trip) => acc + (trip.travelers || 1), 0) || 0;

        let managed_budget = 0;
        let total_spent = 0;

        trips?.forEach(trip => {
            // Calculate Budget
            let budget = 5000; // Default budget if not specified
            if (trip.budget) {
                const bStr = String(trip.budget);
                if (bStr === '1' || bStr === 'low' || bStr === 'budget') budget = 3000;
                else if (bStr === '2' || bStr === 'medium' || bStr === 'standard') budget = 8000;
                else if (bStr === '3' || bStr === 'high' || bStr === 'luxury') budget = 15000;
                else budget = typeof trip.budget === 'number' && trip.budget > 3 ? trip.budget : 5000;
            }
            managed_budget += budget;

            // Calculate Expenses (including itinerary)
            total_spent += calculateTripTotalSpent(trip);
        });

        // Get TM Balance (Earnings)
        const { data: balance } = await supabase
            .from('user_gamification')
            .select('tm_balance')
            .eq('user_id', userId)
            .single();

        return {
            active_trips: trips?.length || 0,
            supported_travelers,
            managed_budget,
            total_spent,
            monthly_earnings: Number(balance?.tm_balance) || 0,
            average_rating: 4.9 // Placeholder until we have a ratings table for agents
        };
    } catch (error) {
        console.error('Error fetching agent stats:', error);
        return {
            active_trips: 0,
            supported_travelers: 0,
            managed_budget: 0,
            total_spent: 0,
            monthly_earnings: 0,
            average_rating: 0
        };
    }
};

export const getManagedTrips = async (userId: string): Promise<Trip[]> => {
    const { data: userData } = await supabase.from('users').select('entity_id').eq('id', userId).single();
    const entityId = userData?.entity_id;

    let query = supabase.from('trips').select('*, users:user_id(full_name, avatar_url), responsible_agent:responsible_agent_id(full_name), responsible_agency:responsible_agency_id(name)');

    if (entityId) {
        query = query.or(`user_id.eq.${userId},responsible_agent_id.eq.${userId},responsible_agency_id.eq.${entityId},metadata->assignedAgents.cs.[{"id":"${userId}"}]`);
    } else {
        query = query.or(`user_id.eq.${userId},responsible_agent_id.eq.${userId},metadata->assignedAgents.cs.[{"id":"${userId}"}]`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching managed trips:', error);
        return [];
    }

    return data || [];
};

export const createManagedTrip = async (tripData: Partial<Trip>): Promise<Trip | null> => {
    const { data, error } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single();

    if (error) {
        console.error('Error creating managed trip:', error);
        return null;
    }

    return data;
};

export const updateManagedTrip = async (tripId: string, updates: Partial<Trip>): Promise<Trip | null> => {
    const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId)
        .select()
        .single();

    if (error) {
        console.error('Error updating managed trip:', error);
        return null;
    }

    return data;
};

export const deleteManagedTrip = async (tripId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

    if (error) {
        console.error('Error deleting managed trip:', error);
        return false;
    }

};

export const searchAgentClients = async (queryTerm: string): Promise<{ id: string, full_name: string, email: string, avatar_url?: string }[]> => {
    if (!queryTerm || queryTerm.length < 2) return [];

    // First, verify the agent's entity_id
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return [];

    // Fetch user entity id
    const { data: userData } = await supabase.from('users').select('entity_id').eq('id', userId).single();
    const entityId = userData?.entity_id;

    // If agent has no entity, maybe they shouldn't see anyone or just fallback. Let's let them search all their travelers.
    // However, the rule states to show "users and groups registered in the platform and the agent to associate".
    // A broader query:
    const q = supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .or(`full_name.ilike.%${queryTerm}%,email.ilike.%${queryTerm}%`)
        .limit(10);

    // Example: Only return users from same entity if entityId exists, or just let them search any user they want if they are creating trips for clients (assuming clients are any user).
    // Let's go broad first, since a trip can be for anyone in the world joining Skynet. 

    const { data, error } = await q;
    if (error) {
        console.error('Error searching clients:', error);
        return [];
    }

    return data || [];
};

export const syncTripUsers = async (tripId: string, users: { id: string, full_name?: string, email?: string }[], currentMetadata: any = {}) => {
    // 1. Prepare legacy metadata updates
    const updatedMetadata = {
        ...currentMetadata,
        sharedWith: users.map(u => ({ id: u.id, full_name: u.full_name, email: u.email }))
    };

    // Update the trip with new travelers count and metadata
    const { error: tripError } = await supabase
        .from('trips')
        .update({
            travelers: Math.max(1, users.length),
            metadata: updatedMetadata,
            updated_at: new Date().toISOString()
        })
        .eq('id', tripId);

    if (tripError) {
        console.error('Error updating trip metadata for users:', tripError);
        return false;
    }

    // 2. Synchronize trip_members
    // Get current user to avoid deleting the owner
    const { data: tripData } = await supabase.from('trips').select('user_id').eq('id', tripId).single();

    // First, remove existing members (except owner and groups)
    const { data: existingMembers } = await supabase
        .from('trip_members')
        .select('user_id, group_id')
        .eq('trip_id', tripId);

    const membersToDelete = (existingMembers || []).filter(m =>
        (m.user_id && m.user_id !== tripData?.user_id) || m.group_id
    );

    if (membersToDelete.length > 0) {
        await supabase
            .from('trip_members')
            .delete()
            .eq('trip_id', tripId)
            .neq('user_id', tripData?.user_id || '00000000-0000-0000-0000-000000000000');
    }

    // Then, insert new members
    if (users.length > 0) {
        const userInserts = users.map(u => ({
            trip_id: tripId,
            user_id: u.id,
            role: 'view',
            status: 'accepted'
        }));

        // Filter out the owner just in case they were added to the list
        const filteredInserts = userInserts.filter(i => i.user_id !== tripData?.user_id);

        if (filteredInserts.length > 0) {
            const { error: memberError } = await supabase.from('trip_members').insert(filteredInserts);
            if (memberError) {
                console.error('Error inserting trip members:', memberError);
                return false;
            }
        }
    }

    return true;
};
