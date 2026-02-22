import { supabase } from './client';
import type { Trip, User, TripFavorite } from './types';

export const getTrips = async (userId: string) => {
    // 1. Get IDs of trips where user is a member
    const { data: memberships } = await supabase
        .from('trip_members')
        .select('trip_id')
        .eq('user_id', userId)
        .eq('status', 'accepted');

    const memberTripIds = memberships?.map(m => m.trip_id) || [];

    // 1.5 Get IDs of trips user has purchased
    const { data: purchases } = await supabase
        .from('user_purchased_trips')
        .select('trip_id')
        .eq('user_id', userId);

    const purchasedTripIds = purchases?.map(p => p.trip_id) || [];

    // 2. Build the query
    let query = supabase
        .from('trips')
        .select(`
      *,
      users:user_id(id, full_name, avatar_url, username),
      trip_members (
        user_id,
        role,
        status
      ),
      user_purchased_trips (
        id,
        user_id
      )
    `);

    // 3. Apply OR filter
    // We want trips where:
    // - user is the owner (user_id = userId)
    // - OR user is in legacy metadata->sharedWith
    // - OR user is in trip_members (id IN memberTripIds)
    // - OR user has purchased the trip (id IN purchasedTripIds)
    const memberIdsStr = memberTripIds.length > 0 ? `,id.in.(${memberTripIds.join(',')})` : '';
    const purchasedIdsStr = purchasedTripIds.length > 0 ? `,id.in.(${purchasedTripIds.join(',')})` : '';
    query = query.or(`user_id.eq.${userId},metadata->sharedWith.cs.[{"id": "${userId}"}]${memberIdsStr}${purchasedIdsStr}`);

    const { data, error } = await query.order('start_date', { ascending: false });

    if (error) throw error;

    // Map metadata fields back to top-level for UI compatibility
    return (data || []).map((t: any) => ({
        ...t,
        sharedWith: t.metadata?.sharedWith,
        pendingSuggestions: t.metadata?.pendingSuggestions,
        marketplaceConfig: t.metadata?.marketplaceConfig,
        expenses: t.metadata?.expenses,
        isShared: t.user_id !== userId, // Mark as shared if not owned by current user
        owner: t.users, // Map joined user data to 'owner' prop
        permissions: t.trip_members?.find((m: any) => m.user_id === userId)?.role || (t.user_id === userId ? 'admin' : 'view'),
        isPurchased: t.user_id === userId || (t.user_purchased_trips && t.user_purchased_trips.some((p: any) => p.user_id === userId))
    })) as Trip[];
};


export const getMarketplaceTrips = async () => {
    // Fetch current user
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    // 1. Get Followed Users AND Member Trips (if logged in)
    let followedUserIds: string[] = [];
    let memberTripIds: string[] = [];
    let listedTripIds: string[] = [];

    if (currentUserId) {
        const { data: following } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', currentUserId)
            .eq('status', 'accepted');

        if (following) {
            followedUserIds = following.map(f => f.following_id);
        }

        const { data: memberships } = await supabase
            .from('trip_members')
            .select('trip_id')
            .eq('user_id', currentUserId)
            .eq('status', 'accepted');

        if (memberships) {
            memberTripIds = memberships.map(m => m.trip_id);
        }
    }

    // 2. Build Query on TRIPS table
    let query = supabase
        .from('trips')
        .select(`
      *,
      users!inner (
        id,
        username,
        full_name,
        avatar_url,
        privacy_setting,
        followers_count,
        posts_count
      ),
      trip_members (
        user_id,
        role,
        status
      ),
      user_purchased_trips (
        id,
        user_id
      )
    `)
        .order('created_at', { ascending: false });

    if (currentUserId) {
        const followedStr = `(${[...followedUserIds, currentUserId].join(',')})`;
        const memberTripsStr = memberTripIds.length > 0 ? `,id.in.(${memberTripIds.join(',')})` : '';

        // Fetch Public OR Followed OR Self OR Is Member OR Has Price > 0
        query = query.or(`visibility.eq.public,price_tm.gt.0,user_id.in.${followedStr}${memberTripsStr}`);
    } else {
        // Guest: Public OR Has Price > 0
        query = query.or(`visibility.eq.public,price_tm.gt.0`);
    }

    const { data: rawTrips, error } = await query;

    if (error) throw error;

    // 3. In-Memory Filter for strict visibility
    let validTrips = rawTrips || [];

    if (currentUserId) {
        const followedSet = new Set(followedUserIds);

        validTrips = validTrips.filter((trip: any) => {
            const isMine = trip.user_id === currentUserId;
            const isFollowed = followedSet.has(trip.user_id);
            const visibility = trip.visibility || 'private';
            const isListed = trip.price_tm > 0;

            // Check if I am a confirmed member of this trip
            const isMember = trip.trip_members && trip.trip_members.some((m: any) => m.user_id === currentUserId && m.status === 'accepted');

            // 1. If actively listed in Marketplace (price_tm > 0), always show
            if (isListed) return true;

            // 2. Public trips always show
            if (visibility === 'public') return true;

            // 3. Followers/Network trips show if followed OR is mine
            if (['followers', 'friends', 'network'].includes(visibility)) return isFollowed || isMine;

            // 4. Private trips: Hide unless explicitly shared (Member)
            if (visibility === 'private') {
                return isMember || isMine;
            }
            return false;
        });
    } else {
        validTrips = validTrips.filter((t: any) => t.visibility === 'public' || t.price_tm > 0);
    }

    // 4. Map to return format
    return validTrips.map((trip: any) => {
        const isPurchased = currentUserId ? (trip.user_id === currentUserId || (trip.user_purchased_trips && trip.user_purchased_trips.some((p: any) => p.user_id === currentUserId))) : false;

        return {
            ...trip,
            marketplaceConfig: trip.price_tm > 0 ? {
                isListed: true,
                price: trip.price_tm,
                currency: 'TM'
            } : undefined,
            isPurchased,
            seller: trip.users
        };
    }) as (Trip & { seller: User, isPurchased: boolean })[];
};

export const createMarketplaceListing = async (listing: {
    trip_id: string;
    seller_id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    category?: string;
}) => {
    const { data, error } = await supabase
        .from('marketplace_listings')
        .upsert([{ ...listing, is_active: true }], { onConflict: 'trip_id' })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteMarketplaceListing = async (tripId: string) => {
    const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('trip_id', tripId);

    if (error) throw error;
};



export const getNetworkUsers = async (userId: string) => {
    // Get users that the current user receives posts from (followings) 
    // OR users that follow the current user. "Network" usually implies mutual or one-way connection.
    // Let's get people the user follows for now (following_id).

    const { data, error } = await supabase
        .from('followers')
        .select(`
      following_id,
      users: following_id(
        id,
        username,
        full_name,
        avatar_url
      )
        `)
        .eq('follower_id', userId);

    if (error) throw error;

    // Transform to simple User array
    return data.map((item: any) => item.users) as User[];
};

export const createTrip = async (trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) => {
    // Extract UI fields to metadata
    const { sharedWith, pendingSuggestions, marketplaceConfig, expenses, ...rest } = trip;
    const metadata = { ...(trip as any).metadata, sharedWith, pendingSuggestions, marketplaceConfig, expenses };

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
        .from('trips')
        .insert({ ...rest, metadata, user_id: user.id })
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        sharedWith: data.metadata?.sharedWith,
        pendingSuggestions: data.metadata?.pendingSuggestions,
        marketplaceConfig: data.metadata?.marketplaceConfig,
        expenses: data.metadata?.expenses
    } as Trip;
};

export const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    // Extract UI fields to metadata
    const { sharedWith, pendingSuggestions, marketplaceConfig, expenses, metadata: existingMeta, ...rest } = updates;

    let payload: any = { ...rest, updated_at: new Date().toISOString() };

    // Only touch metadata if we have updates for it
    const hasMetadataUpdates =
        sharedWith !== undefined ||
        pendingSuggestions !== undefined ||
        marketplaceConfig !== undefined ||
        expenses !== undefined ||
        existingMeta !== undefined;

    if (hasMetadataUpdates) {
        // Note: This still assumes 'existingMeta' contains the FULL existing metadata if we want to merge.
        // If 'existingMeta' is partial, we might lose data. Ideally we should use jsonb_set or fetch-merge-update.
        // For now, we strictly ensure we don't overwrite with empty object if no metadata args provided.
        // If metadata is provided in updates (e.g. atomic update), use it.
        // If we have existingMeta locally (e.g. from state), use it.
        // Otherwise, we must be careful. For now, assume existingMeta is passed if we want to preserve.
        payload.metadata = {
            ...(existingMeta || {}),
        };
        if (sharedWith !== undefined) payload.metadata.sharedWith = sharedWith;
        if (pendingSuggestions !== undefined) payload.metadata.pendingSuggestions = pendingSuggestions;
        if (marketplaceConfig !== undefined) payload.metadata.marketplaceConfig = marketplaceConfig;
        if (expenses !== undefined) payload.metadata.expenses = expenses;
    }

    const { data, error } = await supabase
        .from('trips')
        .update(payload)
        .eq('id', tripId)
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        sharedWith: data.metadata?.sharedWith,
        pendingSuggestions: data.metadata?.pendingSuggestions,
        marketplaceConfig: data.metadata?.marketplaceConfig,
        expenses: data.metadata?.expenses
    } as Trip;
};

export const deleteTrip = async (tripId: string) => {
    const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

    if (error) throw error;
};

// ==================== FAVORITOS DE VIAGEM ====================

export const getTripFavorites = async (userId: string) => {
    const { data, error } = await supabase
        .from('trip_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as TripFavorite[];
};

export const addTripFavorite = async (favorite: Omit<TripFavorite, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('trip_favorites')
        .insert(favorite)
        .select()
        .single();

    if (error) throw error;
    return data as TripFavorite;
};

export const removeTripFavorite = async (favoriteId: string) => {
    const { error } = await supabase
        .from('trip_favorites')
        .delete()
        .eq('id', favoriteId);

    if (error) throw error;
};
