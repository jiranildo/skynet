import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Expose for debugging/signup
(window as any).supabase = supabase;


// ==================== TIPOS ====================

export interface User {
  id: string;
  username: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  avatar_url: string;
  bio?: string;
  website?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  privacy_setting?: 'public' | 'private' | 'friends';
  // Settings
  location?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  show_location?: boolean;
  show_followers?: boolean;
  show_following?: boolean;
  allow_messages?: boolean;
  allow_tagging?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  notification_channels?: {
    likes?: boolean;
    comments?: boolean;
    new_followers?: boolean;
    messages?: boolean;
    trip_updates?: boolean;
    marketing?: boolean;
  };
  sara_enabled?: boolean;
  sara_config?: {
    check_in_reminders?: boolean;
    upcoming_activities?: boolean;
    doc_expiration?: boolean;
    weather_alerts?: boolean;
    relevant_posts?: boolean;
    post_suggestions?: boolean;
    smart_suggestions?: boolean;
    budget_alerts?: boolean;
    itinerary_conflicts?: boolean;
    custom_instructions?: string;
  };
  app_config?: {
    sound_effects?: boolean;
    autoplay?: boolean;
    high_quality?: boolean;
    data_saver?: boolean;
  };
}

export interface Post {
  id: string;
  user_id: string;
  caption?: string;
  image_url?: string;
  media_urls?: string[]; // Array of URLs for carousel
  location?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  users?: User; // Join result
  visibility?: 'public' | 'private' | 'friends' | 'custom';
}

export interface FeedPost {
  id: string; // Changed to string to match UUID
  username: string;
  userAvatar: string;
  location: string;
  image: string;
  likes: number;
  caption: string;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  isSaved: boolean;
  userId: string;
  visibility?: 'public' | 'private' | 'friends' | 'custom';
  media_urls?: string[];
}

export interface TripMember {
  id: string;
  name: string;
  avatar: string;
  permission: 'view' | 'edit' | 'admin';
  joinedAt: string;
}

export interface Trip {
  id: string;
  user_id: string;
  owner?: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: 'business' | 'leisure' | 'family' | 'romantic' | 'adventure' | 'cultural' | 'luxury';
  budget: number;
  travelers: number;
  description?: string;
  status: 'planning' | 'confirmed' | 'completed';
  cover_image?: string;
  itinerary?: any;
  created_at?: string;
  updated_at?: string;
  metadata?: any;
  // UI bridging fields (optional)
  places?: any[]; // legacy alias for itinerary
  sharedWith?: any[];
  pendingSuggestions?: any[];
  isShared?: boolean;
  permissions?: string;
  visibility?: 'public' | 'followers' | 'private';
  marketplaceConfig?: {
    isListed: boolean;
    price: number;
    currency: 'TM' | 'BRL';
    description?: string;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  group_id?: string;
  community_id?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  members_count: number;
  last_message?: string;
  last_message_at?: string;
  is_public?: boolean;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  cover_image?: string;
  created_at: string;
  members_count: number;
  category: string;
  is_public: boolean;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  last_message_at: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  is_read: boolean;
  related_user_id?: string;
  related_post_id?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface TripFavorite {
  id: string;
  user_id: string;
  destination: string;
  country?: string;
  description?: string;
  image_url?: string;
  price?: number;
  category?: string;
  created_at: string;
}

export interface FoodExperience {
  id?: string;
  user_id?: string;
  type: 'restaurant' | 'wine' | 'dish' | 'drink';
  name: string;
  location?: string;
  restaurant?: string;
  date?: string;
  price?: string;
  rating?: number;
  notes?: string;
  description?: string;
  image_url?: string;
  would_return?: boolean | null;
  reviews_count?: number;
  average_rating?: number;
  created_at?: string;
}

export interface FoodReview {
  id?: string;
  experience_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  would_return?: boolean;
  created_at?: string;
}

export interface CellarWine {
  id?: string;
  user_id?: string;
  name: string;
  producer?: string;
  vintage?: number;
  type: 'red' | 'white' | 'rose' | 'sparkling' | 'fortified' | 'dessert';
  country?: string;
  region?: string;
  grapes?: string;
  quantity: number;
  section?: string;
  shelf?: string;
  position?: string;
  price?: number;
  rating?: number;
  notes?: string;
  image_url?: string;
  alcohol_content?: number;
  serving_temp?: string;
  decant_time?: string;
  aging_potential?: string;
  food_pairing?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FlightBooking {
  id?: string;
  user_id?: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  passengers: number;
  class: 'economy' | 'premium' | 'business' | 'first';
  airline?: string;
  flight_number?: string;
  price?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_reference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HotelBooking {
  id?: string;
  user_id?: string;
  hotel_name: string;
  location: string;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
  room_type?: string;
  price?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_reference?: string;
  amenities?: string[];
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CarRental {
  id?: string;
  user_id?: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  dropoff_date: string;
  car_type: string;
  car_model?: string;
  company?: string;
  price?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_reference?: string;
  insurance_included: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TravelPackage {
  id?: string;
  user_id?: string;
  package_name: string;
  destination: string;
  duration_days: number;
  start_date: string;
  travelers: number;
  price?: number;
  includes?: string[];
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_reference?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Story {
  id?: string;
  user_id?: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  created_at?: string;
  expires_at?: string;
  likes_count?: number;
  views_count?: number;
  users?: User;
}

export interface Reel {
  id?: string;
  user_id?: string;
  video_url: string;
  thumbnail_url?: string;
  caption?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at?: string;
  updated_at?: string;
  users?: User;
}

export const getReels = async () => {
  const { data, error } = await supabase
    .from('reels')
    .select(`
      *,
      users (
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as (Reel & { users: User })[];
};

export const getReelsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('reels')
    .select(`
      *,
      users (
        username,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as (Reel & { users: User })[];
};

export const createReel = async (reel: Omit<Reel, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count'>) => {
  const { data, error } = await supabase
    .from('reels')
    .insert(reel)
    .select()
    .single();

  if (error) throw error;
  return data as Reel;
};

export const likeReel = async (reelId: string, userId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .insert({ reel_id: reelId, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const unlikeReel = async (reelId: string, userId: string) => {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('reel_id', reelId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const checkIfReelLiked = async (reelId: string, userId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('reel_id', reelId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

export const getReelComments = async (reelId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      users (
        username,
        avatar_url
      )
    `)
    .eq('reel_id', reelId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const addReelComment = async (reelId: string, userId: string, content: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({ reel_id: reelId, user_id: userId, content })
    .select(`
      *,
      users (
        username,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return data;
};

// ==================== PERSONAL INFO TYPES ====================

export interface UserDocument {
  id?: string;
  user_id?: string;
  type: 'passport' | 'visa' | 'id_card' | 'driver_license' | 'other';
  number: string;
  country?: string;
  expiry_date?: string;
  image_url?: string;
  created_at?: string;
}

export interface UserTravelProfile {
  id?: string;
  user_id?: string;
  preference_type: 'seat' | 'meal' | 'frequent_flyer' | 'hotel' | 'car' | 'other';
  value: string;
  description?: string;
  created_at?: string;
}

export interface UserHealthInfo {
  id?: string;
  user_id?: string;
  category: 'blood_type' | 'condition' | 'medication' | 'vaccine' | 'allergy' | 'emergency_contact' | 'insurance';
  name: string;
  details?: string;
  date_ref?: string;
  expiry_date?: string;
  created_at?: string;
}

export interface SavedPost {
  id?: string;
  user_id?: string;
  post_id: string;
  created_at?: string;
}

// ==================== USUÁRIOS ====================

export const getUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as User;
};

export const ensureUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) return profile as User;

  // Create missing profile
  const { data: newProfile, error } = await supabase
    .from('users')
    .insert([
      {
        id: user.id,
        // email: user.email, // Not in schema
        full_name: user.user_metadata?.full_name || 'User',
        username: user.email?.split('@')[0] || 'user',
        avatar_url: user.user_metadata?.avatar_url,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
  return newProfile;
};

export const getUserByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) throw error;
  return data as User;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as User;
};

export const uploadAvatar = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
};


export const createUser = async (user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'followers_count' | 'following_count' | 'posts_count'>) => {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();

  if (error) throw error;
  return data as User;
};

export const updatePrivacySettings = async (userId: string, privacySetting: 'public' | 'private' | 'friends') => {
  const { data, error } = await supabase
    .from('users')
    .update({ privacy_setting: privacySetting, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as User;
};


// ==================== PERSONAL INFO SERVICES ====================

// --- Documents ---
export const getUserDocuments = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as UserDocument[];
};

export const addUserDocument = async (doc: UserDocument) => {
  const { data, error } = await supabase
    .from('user_documents')
    .insert(doc)
    .select()
    .single();

  if (error) throw error;
  return data as UserDocument;
};

export const deleteUserDocument = async (id: string) => {
  const { error } = await supabase
    .from('user_documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// --- Travel Profile ---
export const getUserTravelProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_travel_profile')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as UserTravelProfile[];
};

export const addUserTravelProfile = async (item: UserTravelProfile) => {
  const { data, error } = await supabase
    .from('user_travel_profile')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data as UserTravelProfile;
};

export const deleteUserTravelProfile = async (id: string) => {
  const { error } = await supabase
    .from('user_travel_profile')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// --- Health Info ---
export const getUserHealthInfo = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_health_info')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as UserHealthInfo[];
};

export const addUserHealthInfo = async (item: UserHealthInfo) => {
  const { data, error } = await supabase
    .from('user_health_info')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data as UserHealthInfo;
};

export const deleteUserHealthInfo = async (id: string) => {
  const { error } = await supabase
    .from('user_health_info')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ==================== POSTS ====================

export const getPosts = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as Post[];
};

export const getPostsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Post[];
};

export const getFeedPosts = async (limit = 20, offset = 0, targetUserId?: string) => {
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const currentUserId = currentUser?.id;

  let query = supabase
    .from('posts')
    .select(`
      *,
      users (
        username,
        avatar_url,
        privacy_setting
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (targetUserId) {
    query = query.eq('user_id', targetUserId);
    // When fetching posts for a specific user, apply privacy logic
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('privacy_setting')
      .eq('id', targetUserId)
      .single();

    if (userError) throw userError;

    if (targetUser.privacy_setting === 'private' && targetUserId !== currentUserId) {
      // If target user is private and not the current user, check if current user is a follower
      const { count: isFollowing, error: followError } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (followError) throw followError;

      if (isFollowing === 0) {
        // Not following, return empty array
        return [];
      }
    } else if (targetUser.privacy_setting === 'friends' && targetUserId !== currentUserId) {
      // If target user is friends-only and not the current user, check if current user is a friend
      // For simplicity, assuming 'friends' means 'following' for now.
      const { count: isFollowing, error: followError } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (followError) throw followError;

      if (isFollowing === 0) {
        // Not following, return empty array
        return [];
      }
    }
    // If public, or current user is the target user, or current user is following, proceed.
  } else {
    // For general feed, only show posts from followed users and self
    if (currentUserId) {
      const { data: followingUsers, error: followError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', currentUserId);

      if (followError) throw followError;

      const followedUserIds = followingUsers?.map(f => f.following_id) || [];
      followedUserIds.push(currentUserId); // Include current user's posts

      // Filter posts by these user IDs
      query = query.in('user_id', followedUserIds);

    } else {
      // If no current user (guest), only show public posts from public users
      query = query.eq('visibility', 'public').eq('users.privacy_setting', 'public');
    }
  }

  const { data: posts, error } = await query;

  if (error) throw error;

  // If there's no logged-in user, we can't check isLiked/isSaved properly, defaults to false
  // Or we can do a secondary query if we have a user
  let likedPostIds = new Set<string>();
  let savedPostIds = new Set<string>();

  if (currentUser) {
    const { data: likes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUser.id);

    const { data: saved } = await supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', currentUser.id);

    likes?.forEach(l => likedPostIds.add(l.post_id));
    saved?.forEach(s => savedPostIds.add(s.post_id));
  }

  // Map to FeedPost format
  return posts.map((post: any) => {
    // Calculate timeAgo
    const created = new Date(post.created_at);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);
    let timeAgo = '';

    if (diffInSeconds < 60) timeAgo = 'Just now';
    else if (diffInSeconds < 3600) timeAgo = `${Math.floor(diffInSeconds / 60)}m ago`;
    else if (diffInSeconds < 86400) timeAgo = `${Math.floor(diffInSeconds / 3600)}h ago`;
    else timeAgo = `${Math.floor(diffInSeconds / 86400)}d ago`;

    return {
      id: post.id,
      username: post.users?.username || 'Unknown',
      userAvatar: post.users?.avatar_url || 'https://via.placeholder.com/40',
      location: post.location || '',
      image: post.image_url || '',
      likes: post.likes_count || 0,
      caption: post.caption || '',
      comments: post.comments_count || 0,
      timeAgo,
      isLiked: likedPostIds.has(post.id),
      isSaved: savedPostIds.has(post.id),
      userId: post.user_id,
      visibility: post.visibility,
      media_urls: post.media_urls || [],
    } as FeedPost;
  });
};

export const getRecentStories = async () => {
  // To keep it simple and fulfill "reais dos usuarios", we'll fetch users 
  // who have posts, ordered by their latest post.
  const { data, error } = await supabase
    .from('posts')
    .select(`
      user_id,
      users (
        id,
        username,
        avatar_url,
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  // Deduplicate users
  const usersMap = new Map();
  data?.forEach((post: any) => {
    const userData = post.users;
    if (userData && !usersMap.has(userData.id)) {
      usersMap.set(userData.id, {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar_url,
        hasStory: true
      });
    }
  });

  return Array.from(usersMap.values());
};

export const uploadPostImage = async (file: File | Blob) => {
  return uploadFile('posts', file);
};

export const uploadFile = async (bucket: string, file: File | Blob) => {
  let fileExt = 'png'; // Default for blobs if type not found
  if (file instanceof File) {
    fileExt = file.name.split('.').pop() || 'png';
  } else if (file.type) {
    fileExt = file.type.split('/')[1] || 'png';
  }

  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};


export const createPost = async (post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count'>) => {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();

  if (error) throw error;
  return data as Post;
};

export const updatePost = async (postId: string, updates: Partial<Pick<Post, 'caption' | 'location' | 'image_url' | 'visibility'>>) => {
  const { data, error } = await supabase
    .from('posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;
  return data as Post;
};


export const deletePost = async (postId: string) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
};



// ==================== VIAGENS ====================

export const getTrips = async (userId: string) => {
  // Fetch trips where user is owner OR user is in sharedWith
  // Since sharedWith is inside metadata JSONB, checking for existence of an element in a JSON array can be complex with simple OR.
  // For simplicity and to ensure we get both, we might need a complex query or filtering.

  // Try to use the OR syntax with JSON containment if supported, otherwise falling back to fetching and filtering might be needed
  // but let's try a robust approach assuming 'metadata' column exists.

  const { data, error } = await supabase
    .from('trips')
    .select('*, users:user_id(id, full_name, avatar_url, username)')
    // We want trips where (user_id = userId) OR (metadata->sharedWith @> '[{"id": "userId"}]')
    // Note: JSON containment operator @> requires correct spacing/formatting in raw SQL or filter
    .or(`user_id.eq.${userId},metadata->sharedWith.cs.[{"id": "${userId}"}]`)
    .order('start_date', { ascending: false });

  if (error) throw error;

  // Map metadata fields back to top-level for UI compatibility
  return (data || []).map((t: any) => ({
    ...t,
    sharedWith: t.metadata?.sharedWith,
    pendingSuggestions: t.metadata?.pendingSuggestions,
    marketplaceConfig: t.metadata?.marketplaceConfig,
    isShared: t.user_id !== userId, // Mark as shared if not owned by current user
    owner: t.users // Map joined user data to 'owner' prop
  })) as Trip[];
};


export const getMarketplaceTrips = async () => {
  // Query marketplace_listings joined with trips and users (sellers)
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(`
      *,
      trip:trips (
        *,
        users:user_id (
          id,
          username,
          full_name,
          avatar_url,
          privacy_setting,
          followers_count,
          posts_count
        )
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map to Trip structure with injected marketplace info
  // Map to Trip structure with injected marketplace info
  return (data || [])
    .filter((listing: any) => listing.trip && listing.trip.users) // Filter out items where trip or user is hidden/missing
    .map((listing: any) => ({
      ...listing.trip,
      marketplaceConfig: {
        isListed: true,
        price: listing.price,
        currency: listing.currency,
        description: listing.description
      },
      seller: listing.trip.users,
      listing_id: listing.id // Keep reference to listing ID
    })) as (Trip & { seller: User, listing_id: string })[];
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
      users:following_id (
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

  const { data, error } = await supabase
    .from('trips')
    .insert({ ...rest, metadata })
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

// ==================== MENSAGENS ====================

export const getConversationsWithDetails = async (userId: string) => {
  console.log('Fetching conversations for user:', userId);
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      user1:users!conversation_user1_id_fkey(username, avatar_url, full_name),
      user2:users!conversation_user2_id_fkey(username, avatar_url, full_name)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  console.log('Fetched conversations count:', data?.length || 0);

  // Transform to friendlier format
  return data.map((c: any) => {
    const otherUser = c.user1_id === userId ? c.user2 : c.user1;
    return {
      ...c,
      otherUser
    };
  });
};

export const getOrCreateConversation = async (otherUserId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const userId1 = user.id;
  const userId2 = otherUserId;

  // Sort IDs to match the UNIQUE(user1_id, user2_id) logic if we decide to enforce order
  // For now, let's just check both possibilities or use the sorted approach
  const [sorted1, sorted2] = [userId1, userId2].sort();

  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .eq('user1_id', sorted1)
    .eq('user2_id', sorted2)
    .maybeSingle();

  if (existing) return existing;

  const { data: newConv, error: createError } = await supabase
    .from('conversations')
    .insert({
      user1_id: sorted1,
      user2_id: sorted2,
      last_message_at: new Date().toISOString()
    })
    .select()
    .single();

  if (createError) throw createError;
  return newConv;
};




export const getNotificationsWithDetails = async (userId: string) => {
  // 1. Fetch raw notifications
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!notifications || notifications.length === 0) return [];

  // 2. Extract IDs for related entities
  const relatedUserIds = [...new Set(notifications.map(n => n.related_user_id).filter(Boolean))];
  const relatedPostIds = [...new Set(notifications.map(n => n.related_post_id).filter(Boolean))];

  // 3. Fetch related entities in parallel
  const [usersResult, postsResult] = await Promise.all([
    relatedUserIds.length > 0
      ? supabase.from('users').select('id, username, avatar_url').in('id', relatedUserIds)
      : { data: [], error: null },
    relatedPostIds.length > 0
      ? supabase.from('posts').select('id, image_url').in('id', relatedPostIds)
      : { data: [], error: null }
  ]);

  if (usersResult.error) console.error('Error fetching related users:', usersResult.error);
  if (postsResult.error) console.error('Error fetching related posts:', postsResult.error);

  const usersMap = new Map((usersResult.data?.map(u => [u.id, u]) || []) as [string, any][]);
  const postsMap = new Map((postsResult.data?.map(p => [p.id, p]) || []) as [string, any][]);

  // 4. Join data
  return notifications.map(n => ({
    ...n,
    related_user: n.related_user_id ? usersMap.get(n.related_user_id) : null,
    related_post: n.related_post_id ? postsMap.get(n.related_post_id) : null
  }));
};

export const markMessageAsRead = async (messageId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId);

  if (error) throw error;
};

export const getUnreadMessagesCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
};

// ==================== NOTIFICAÇÕES ====================

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Notification[];
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

export const deleteNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
};

export const getUnreadNotificationsCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
};

// ==================== CURTIDAS ====================

export const likePost = async (postId: string, userId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .insert({ post_id: postId, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as Like;
};

export const unlikePost = async (postId: string, userId: string) => {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const getPostLikes = async (postId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('post_id', postId);

  if (error) throw error;
  return data as Like[];
};

// ==================== COMENTÁRIOS ====================

export const getComments = async (postId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      users (
        username,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as (Comment & { users: { username: string; avatar_url: string } })[];
};

export const createComment = async (comment: Omit<Comment, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single();

  if (error) throw error;
  return data as Comment;
};

export const updateComment = async (commentId: string, content: string) => {
  const { data, error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data as Comment;
};

export const deleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
};

// ==================== SEGUIDORES ====================

export const followUser = async (followerId: string, followingId: string) => {
  const { data, error } = await supabase
    .from('followers')
    .insert({ follower_id: followerId, following_id: followingId })
    .select()
    .single();

  if (error) throw error;
  return data as Follower;
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) throw error;
};

export const getFollowers = async (userId: string) => {
  const { data, error } = await supabase
    .from('followers')
    .select('*')
    .eq('following_id', userId);

  if (error) throw error;
  return data as Follower[];
};

export const getFollowing = async (userId: string) => {
  const { data, error } = await supabase
    .from('followers')
    .select('*')
    .eq('follower_id', userId);

  if (error) throw error;
  return data as Follower[];
};

export const getFollowingWithDetails = async (userId: string) => {
  // Step 1: Get the IDs of users being followed
  const { data: relationData, error: relationError } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', userId);

  if (relationError) {
    console.error('Error fetching follower relations:', relationError);
    throw relationError;
  }

  // If no following, return empty immediately
  if (!relationData || relationData.length === 0) {
    return [];
  }

  const followingIds = relationData.map(r => r.following_id);

  // Step 2: Fetch the actual user details for these IDs
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, username, full_name, avatar_url')
    .in('id', followingIds);

  if (usersError) {
    console.error('Error fetching user details:', usersError);
    throw usersError;
  }

  return usersData || [];
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

// ==================== EXPERIÊNCIAS GASTRONÔMICAS ====================

export const foodExperienceService = {
  async getAll(): Promise<FoodExperience[]> {
    const { data, error } = await supabase
      .from('food_experiences')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as FoodExperience[];
  },

  async getById(id: string): Promise<FoodExperience> {
    const { data, error } = await supabase
      .from('food_experiences')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as FoodExperience;
  },

  async create(experience: Omit<FoodExperience, 'id' | 'created_at'>): Promise<FoodExperience> {
    const { data, error } = await supabase
      .from('food_experiences')
      .insert(experience)
      .select()
      .single();

    if (error) throw error;
    return data as FoodExperience;
  },

  async update(id: string, updates: Partial<FoodExperience>): Promise<FoodExperience> {
    const { data, error } = await supabase
      .from('food_experiences')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FoodExperience;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('food_experiences')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateWouldReturn(id: string, wouldReturn: boolean): Promise<FoodExperience> {
    const { data, error } = await supabase
      .from('food_experiences')
      .update({ would_return: wouldReturn })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FoodExperience;
  }
};

// ==================== AVALIAÇÕES DE EXPERIÊNCIAS GASTRONÔMICAS ====================

export const foodReviewService = {
  async getByExperience(experienceId: string): Promise<FoodReview[]> {
    const { data, error } = await supabase
      .from('food_reviews')
      .select('*')
      .eq('experience_id', experienceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as FoodReview[];
  },

  async create(review: Omit<FoodReview, 'id' | 'created_at'>): Promise<FoodReview> {
    const { data, error } = await supabase
      .from('food_reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;

    // Atualizar estatísticas da experiência
    await this.updateExperienceStats(review.experience_id);

    return data as FoodReview;
  },

  async update(id: string, updates: Partial<FoodReview>): Promise<FoodReview> {
    const { data, error } = await supabase
      .from('food_reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Atualizar estatísticas da experiência
    if (data) {
      await this.updateExperienceStats(data.experience_id);
    }

    return data as FoodReview;
  },

  async delete(id: string, experienceId: string): Promise<void> {
    const { error } = await supabase
      .from('food_reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Atualizar estatísticas da experiência
    await this.updateExperienceStats(experienceId);
  },

  async getUserReview(experienceId: string, userId: string): Promise<FoodReview | null> {
    const { data, error } = await supabase
      .from('food_reviews')
      .select('*')
      .eq('experience_id', experienceId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as FoodReview | null;
  },

  async updateExperienceStats(experienceId: string): Promise<void> {
    const reviews = await this.getByExperience(experienceId);

    const reviewsCount = reviews.length;
    const averageRating = reviewsCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
      : 0;

    await supabase
      .from('food_experiences')
      .update({
        reviews_count: reviewsCount,
        average_rating: averageRating
      })
      .eq('id', experienceId);
  }
};

// ==================== ADEGA (CELLAR) ====================

const CELLAR_STORAGE_KEY = 'cellar_wines_local';

// Funções auxiliares para armazenamento local
const getLocalWines = (): CellarWine[] => {
  try {
    const stored = localStorage.getItem(CELLAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalWines = (wines: CellarWine[]): void => {
  try {
    localStorage.setItem(CELLAR_STORAGE_KEY, JSON.stringify(wines));
  } catch (error) {
    console.error('Erro ao salvar vinhos localmente:', error);
  }
};

export const cellarService = {
  async getAll(): Promise<CellarWine[]> {
    const { data: { user } } = await supabase.auth.getUser();

    // Se não houver usuário autenticado, usa armazenamento local
    if (!user) {
      console.log('Usando armazenamento local para vinhos');
      return getLocalWines();
    }

    const { data, error } = await supabase
      .from('cellar_wines')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CellarWine[];
  },

  async getById(id: string): Promise<CellarWine> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const wines = getLocalWines();
      const wine = wines.find(w => w.id === id);
      if (!wine) throw new Error('Vinho não encontrado');
      return wine;
    }

    const { data, error } = await supabase
      .from('cellar_wines')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as CellarWine;
  },

  async create(wine: Omit<CellarWine, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<CellarWine> {
    const { data: { user } } = await supabase.auth.getUser();

    // Se não houver usuário, salva localmente
    if (!user) {
      const wines = getLocalWines();
      const newWine: CellarWine = {
        ...wine,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      wines.unshift(newWine);
      saveLocalWines(wines);
      return newWine;
    }

    const { data, error } = await supabase
      .from('cellar_wines')
      .insert({ ...wine, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as CellarWine;
  },

  async update(id: string, updates: Partial<CellarWine>): Promise<CellarWine> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const wines = getLocalWines();
      const index = wines.findIndex(w => w.id === id);
      if (index === -1) throw new Error('Vinho não encontrado');

      wines[index] = {
        ...wines[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveLocalWines(wines);
      return wines[index];
    }

    const { data, error } = await supabase
      .from('cellar_wines')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CellarWine;
  },

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const wines = getLocalWines();
      const filtered = wines.filter(w => w.id !== id);
      saveLocalWines(filtered);
      return;
    }

    const { error } = await supabase
      .from('cellar_wines')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateQuantity(id: string, quantity: number): Promise<CellarWine> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const wines = getLocalWines();
      const index = wines.findIndex(w => w.id === id);
      if (index === -1) throw new Error('Vinho não encontrado');

      wines[index] = {
        ...wines[index],
        quantity,
        updated_at: new Date().toISOString()
      };
      saveLocalWines(wines);
      return wines[index];
    }

    const { data, error } = await supabase
      .from('cellar_wines')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CellarWine;
  },

  async getByType(type: string): Promise<CellarWine[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const wines = getLocalWines();
      return wines.filter(w => w.type === type);
    }

    const { data, error } = await supabase
      .from('cellar_wines')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CellarWine[];
  },

  async getStats(): Promise<{
    totalWines: number;
    totalBottles: number;
    totalValue: number;
    averageRating: number;
    byType: Record<string, number>;
    byCountry: Record<string, number>;
    byVintage: Record<string, number>;
  }> {
    const wines = await this.getAll();

    const stats = {
      totalWines: wines.length,
      totalBottles: wines.reduce((sum, wine) => sum + wine.quantity, 0),
      totalValue: wines.reduce((sum, wine) => sum + (wine.price || 0) * wine.quantity, 0),
      averageRating: wines.reduce((sum, wine) => sum + (wine.rating || 0), 0) / wines.length || 0,
      byType: {} as Record<string, number>,
      byCountry: {} as Record<string, number>,
      byVintage: {} as Record<string, number>,
    };

    wines.forEach(wine => {
      // Por tipo
      stats.byType[wine.type] = (stats.byType[wine.type] || 0) + wine.quantity;

      // Por país
      if (wine.country) {
        stats.byCountry[wine.country] = (stats.byCountry[wine.country] || 0) + wine.quantity;
      }

      // Por safra
      if (wine.vintage) {
        const vintageKey = wine.vintage.toString();
        stats.byVintage[vintageKey] = (stats.byVintage[vintageKey] || 0) + wine.quantity;
      }
    });

    return stats;
  }
};

// ==================== RESERVAS DE VOOS ====================

export const flightBookingService = {
  async getAll(): Promise<FlightBooking[]> {
    const { data, error } = await supabase
      .from('flight_bookings')
      .select('*')
      .order('departure_date', { ascending: false });

    if (error) throw error;
    return data as FlightBooking[];
  },

  async getById(id: string): Promise<FlightBooking> {
    const { data, error } = await supabase
      .from('flight_bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as FlightBooking;
  },

  async create(booking: Omit<FlightBooking, 'id' | 'created_at' | 'updated_at'>): Promise<FlightBooking> {
    const { data, error } = await supabase
      .from('flight_bookings')
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data as FlightBooking;
  },

  async update(id: string, updates: Partial<FlightBooking>): Promise<FlightBooking> {
    const { data, error } = await supabase
      .from('flight_bookings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FlightBooking;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('flight_bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ==================== RESERVAS DE HOTÉIS ====================

export const hotelBookingService = {
  async getAll(): Promise<HotelBooking[]> {
    const { data, error } = await supabase
      .from('hotel_bookings')
      .select('*')
      .order('check_in', { ascending: false });

    if (error) throw error;
    return data as HotelBooking[];
  },

  async getById(id: string): Promise<HotelBooking> {
    const { data, error } = await supabase
      .from('hotel_bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as HotelBooking;
  },

  async create(booking: Omit<HotelBooking, 'id' | 'created_at' | 'updated_at'>): Promise<HotelBooking> {
    const { data, error } = await supabase
      .from('hotel_bookings')
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data as HotelBooking;
  },

  async update(id: string, updates: Partial<HotelBooking>): Promise<HotelBooking> {
    const { data, error } = await supabase
      .from('hotel_bookings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as HotelBooking;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('hotel_bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ==================== ALUGUEL DE CARROS ====================

export const carRentalService = {
  async getAll(): Promise<CarRental[]> {
    const { data, error } = await supabase
      .from('car_rentals')
      .select('*')
      .order('pickup_date', { ascending: false });

    if (error) throw error;
    return data as CarRental[];
  },

  async getById(id: string): Promise<CarRental> {
    const { data, error } = await supabase
      .from('car_rentals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as CarRental;
  },

  async create(rental: Omit<CarRental, 'id' | 'created_at' | 'updated_at'>): Promise<CarRental> {
    const { data, error } = await supabase
      .from('car_rentals')
      .insert(rental)
      .select()
      .single();

    if (error) throw error;
    return data as CarRental;
  },

  async update(id: string, updates: Partial<CarRental>): Promise<CarRental> {
    const { data, error } = await supabase
      .from('car_rentals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CarRental;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('car_rentals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ==================== PACOTES DE VIAGEM ====================

export const travelPackageService = {
  async getAll(): Promise<TravelPackage[]> {
    const { data, error } = await supabase
      .from('travel_packages')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as TravelPackage[];
  },

  async getById(id: string): Promise<TravelPackage> {
    const { data, error } = await supabase
      .from('travel_packages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as TravelPackage;
  },

  async create(packageData: Omit<TravelPackage, 'id' | 'created_at' | 'updated_at'>): Promise<TravelPackage> {
    const { data, error } = await supabase
      .from('travel_packages')
      .insert(packageData)
      .select()
      .single();

    if (error) throw error;
    return data as TravelPackage;
  },

  async update(id: string, updates: Partial<TravelPackage>): Promise<TravelPackage> {
    const { data, error } = await supabase
      .from('travel_packages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as TravelPackage;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('travel_packages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ==================== STORIES ====================

export const storyService = {
  async getAll(): Promise<Story[]> {
    const { data, error } = await supabase
      .from('stories')
      .select('*, users(username, avatar_url)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Story[];
  },

  async getByUser(userId: string): Promise<Story[]> {
    const { data, error } = await supabase
      .from('stories')
      .select('*, users(username, avatar_url)')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Story[];
  },

  async getActiveStories(): Promise<Story[]> {
    return this.getAll();
  },

  async create(story: Omit<Story, 'id' | 'created_at' | 'expires_at' | 'users'>): Promise<Story> {
    const { data, error } = await supabase
      .from('stories')
      .insert(story)
      .select('*, users(username, avatar_url)')
      .single();

    if (error) throw error;
    return data as Story;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async markAsViewed(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_story_views', { story_id: id });
    if (error) {
      // If RPC fails, fallback to simple update
      await supabase
        .from('stories')
        .update({ views_count: supabase.rpc('increment', { row: 'views_count', x: 1 }) })
        .eq('id', id);
    }
  }
};

// ==================== REELS ====================

export const reelService = {
  async getAll(): Promise<Reel[]> {
    const { data, error } = await supabase
      .from('reels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Reel[];
  },

  async getById(id: string): Promise<Reel> {
    const { data, error } = await supabase
      .from('reels')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Reel;
  },

  async create(reel: Omit<Reel, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count'>): Promise<Reel> {
    const { data, error } = await supabase
      .from('reels')
      .insert(reel)
      .select()
      .single();

    if (error) throw error;
    return data as Reel;
  },

  async update(id: string, updates: Partial<Reel>): Promise<Reel> {
    const { data, error } = await supabase
      .from('reels')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Reel;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reels')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async incrementViews(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_reel_views', { reel_id: id });
    if (error) throw error;
  }
};

// ==================== POSTS SALVOS ====================

export const savedPostService = {
  async getAll(userId: string): Promise<SavedPost[]> {
    const { data, error } = await supabase
      .from('saved_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SavedPost[];
  },

  async save(userId: string, postId: string): Promise<SavedPost> {
    const { data, error } = await supabase
      .from('saved_posts')
      .insert({ user_id: userId, post_id: postId })
      .select()
      .single();

    if (error) throw error;
    return data as SavedPost;
  },

  async unsave(userId: string, postId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;
  },

  async isSaved(userId: string, postId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    return !error && !!data;
  },

  async getSavedPosts(userId: string): Promise<FeedPost[]> {
    const { data: saved, error: savedError } = await supabase
      .from('saved_posts')
      .select(`
        post_id,
        posts (
          *,
          users (
            username,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (savedError) throw savedError;

    // Filter out potential null posts and map to FeedPost format
    const posts = saved
      .filter(s => s.posts !== null)
      .map(s => {
        const p = s.posts as any;
        return {
          id: p.id,
          username: p.users.username,
          userAvatar: p.users.avatar_url,
          location: p.location || '',
          image: p.image_url,
          likes: p.likes_count,
          caption: p.caption || '',
          comments: p.comments_count,
          timeAgo: new Date(p.created_at).toLocaleDateString(),
          isLiked: false, // Will be checked in the frontend or we could secondary query
          isSaved: true,
          userId: p.user_id
        } as FeedPost;
      });

    return posts;
  }
};

// ==================== EXPLORAR & BUSCA ====================

export const getExplorePosts = async (limit = 30) => {
  // Only show public posts from public users in Explore
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users!inner (
        username,
        avatar_url,
        privacy_setting
      )
    `)
    .eq('visibility', 'public')
    .eq('users.privacy_setting', 'public')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map((post: any) => ({
    id: post.id,
    username: post.users?.username || 'Unknown',
    userAvatar: post.users?.avatar_url || '',
    location: post.location || '',
    image: post.image_url || '',
    likes: post.likes_count || 0,
    caption: post.caption || '',
    comments: post.comments_count || 0,
    timeAgo: new Date(post.created_at).toLocaleDateString(),
    isLiked: false,
    isSaved: false,
    userId: post.user_id,
    visibility: post.visibility,
  }));
};

export const searchUsers = async (query: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, avatar_url, privacy_setting')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  return data;
};

export const searchPosts = async (query: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      caption,
      image_url,
      users (
        username
      )
    `)
    .ilike('caption', `%${query}%`)
    .limit(10);

  if (error) throw error;
  return data;
};

// ==================== GRUPOS & COMUNIDADES (CRUD COMPLETO) ====================

// --- GRUPOS ---

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


// --- COMUNIDADES ---

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

export const getMessages = async (chatId: string, type: 'direct' | 'group' | 'community') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return []; // Should handle auth better

  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:users!sender_id (
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: true });

  if (type === 'direct') {
    // Logic for direct messages (requires complex OR with current user)
    // Simplified: assuming chatId matches the conversation ID or other user ID logic handled higher up
    // For now, let's assume chatId IS the conversation/connection ID
    query = query.eq('conversation_id', chatId);
  } else if (type === 'group') {
    query = query.eq('group_id', chatId);
  } else if (type === 'community') {
    query = query.eq('community_id', chatId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((msg: any) => ({
    id: msg.id,
    text: msg.content,
    sender: msg.sender_id === (user?.id) ? 'me' : msg.sender?.username, // Simplify for UI
    avatar: msg.sender?.avatar_url,
    time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    created_at: msg.created_at,
    sender_id: msg.sender_id // Add this for precise ID checks
  }));
};

export const sendMessage = async (chatId: string, type: 'direct' | 'group' | 'community', content: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const payload: any = {
    sender_id: user.id,
    content,
    created_at: new Date().toISOString()
  };

  if (type === 'direct') {
    // Determine receiver or use conversation_id
    // payload.receiver_id = chatId; 
    payload.conversation_id = chatId; // Assume chatId is conversation ID for simplicity
  } else if (type === 'group') {
    payload.group_id = chatId;
  } else if (type === 'community') {
    payload.community_id = chatId;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
};
