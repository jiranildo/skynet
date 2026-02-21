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
      )
    `);

    // 3. Apply OR filter
    // We want trips where:
    // - user is the owner (user_id = userId)
    // - OR user is in legacy metadata->sharedWith
    // - OR user is in trip_members (id IN memberTripIds)
    const memberIdsStr = memberTripIds.length > 0 ? `,id.in.(${memberTripIds.join(',')})` : '';
    query = query.or(`user_id.eq.${userId},metadata->sharedWith.cs.[{"id": "${userId}"}]${memberIdsStr}`);

    const { data, error } = await query.order('start_date', { ascending: false });

    if (error) throw error;

    // Map metadata fields back to top-level for UI compatibility
    return (data || []).map((t: any) => ({
        ...t,
        sharedWith: t.metadata?.sharedWith,
        pendingSuggestions: t.metadata?.pendingSuggestions,
        marketplaceConfig: t.metadata?.marketplaceConfig,
        isShared: t.user_id !== userId, // Mark as shared if not owned by current user
        owner: t.users, // Map joined user data to 'owner' prop
        permissions: t.trip_members?.find((m: any) => m.user_id === userId)?.role || (t.user_id === userId ? 'admin' : 'view')
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

    const { data: listings } = await supabase
        .from('marketplace_listings')
        .select('trip_id')
        .eq('is_active', true);

    if (listings) {
        listedTripIds = listings.map(l => l.trip_id);
    }

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
      marketplace_listings (
        id,
        price,
        currency,
        description,
        is_active,
        created_at
      ),
      trip_members (
        user_id,
        role,
        status
      )
    `)
        .order('created_at', { ascending: false });

    if (currentUserId) {
        const followedStr = `(${[...followedUserIds, currentUserId].join(',')})`;
        const memberTripsStr = memberTripIds.length > 0 ? `,id.in.(${memberTripIds.join(',')})` : '';
        const listedTripsStr = listedTripIds.length > 0 ? `,id.in.(${listedTripIds.join(',')})` : '';

        // Fetch Public OR Followed OR Self OR Is Member OR Is Listed
        query = query.or(`visibility.eq.public,user_id.in.${followedStr}${memberTripsStr}${listedTripsStr}`);
    } else {
        // Guest: Public OR Listed
        const listedTripsStr = listedTripIds.length > 0 ? `,id.in.(${listedTripIds.join(',')})` : '';
        if (listedTripsStr) {
            query = query.or(`visibility.eq.public${listedTripsStr}`);
        } else {
            query = query.eq('visibility', 'public');
        }
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

            // Handle marketplace_listings safely (can be object or array)
            let listings: any[] = [];
            if (Array.isArray(trip.marketplace_listings)) {
                listings = trip.marketplace_listings;
            } else if (trip.marketplace_listings && typeof trip.marketplace_listings === 'object') {
                listings = [trip.marketplace_listings];
            }

            const activeListing = listings.find((l: any) => l.is_active);

            // Inject config so UI can use it
            if (activeListing) {
                trip.marketplaceConfig = activeListing;
            }

            // Check if I am a confirmed member of this trip
            const isMember = trip.trip_members && trip.trip_members.some((m: any) => m.user_id === currentUserId && m.status === 'accepted');

            // 1. If actively listed in Marketplace, always show
            if (activeListing) return true;

            // 2. Public trips always show
            if (visibility === 'public') return true;

            // 3. Followers/Network trips show if followed OR is mine
            // We explicitly check for 'followers', 'friends', or 'network' as these are commonly used interchangeably for "My Network"
            if (['followers', 'friends', 'network'].includes(visibility)) return isFollowed || isMine;

            // 4. Private trips: Hide unless explicitly shared (Member)
            if (visibility === 'private') {
                return isMember;
            }
            return false;
        });
    } else {
        validTrips = validTrips.filter((t: any) => t.visibility === 'public');
    }

    // 4. Map to return format
    return validTrips.map((trip: any) => {
        let listingsArr: any[] = [];
        if (Array.isArray(trip.marketplace_listings)) {
            listingsArr = trip.marketplace_listings;
        } else if (trip.marketplace_listings && typeof trip.marketplace_listings === 'object') {
            listingsArr = [trip.marketplace_listings];
        }

        const activeListing = listingsArr.find((l: any) => l.is_active);

        return {
            ...trip,
            marketplaceConfig: activeListing ? {
                isListed: true,
                price: activeListing.price,
                currency: activeListing.currency,
                description: activeListing.description
            } : undefined,
            seller: trip.users,
            listing_id: activeListing?.id
        };
    }) as (Trip & { seller: User, listing_id?: string })[];
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
    const { sharedWith, pendingSuggestions, marketplaceConfig, ...rest } = trip;
    const metadata = { ...(trip as any).metadata, sharedWith, pendingSuggestions, marketplaceConfig };

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
        marketplaceConfig: data.metadata?.marketplaceConfig
    } as Trip;
};

export const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    // Extract UI fields to metadata
    const { sharedWith, pendingSuggestions, marketplaceConfig, metadata: existingMeta, ...rest } = updates;

    let payload: any = { ...rest, updated_at: new Date().toISOString() };

    // Only touch metadata if we have updates for it
    const hasMetadataUpdates =
        sharedWith !== undefined ||
        pendingSuggestions !== undefined ||
        marketplaceConfig !== undefined ||
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
        marketplaceConfig: data.metadata?.marketplaceConfig
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
