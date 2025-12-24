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
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  caption?: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  country?: string;
  start_date: string;
  end_date: string;
  travelers: number;
  budget?: number;
  status: string;
  notes?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
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
  image_url: string;
  created_at?: string;
  expires_at?: string;
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

export const createUser = async (user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'followers_count' | 'following_count' | 'posts_count'>) => {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();

  if (error) throw error;
  return data as User;
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

export const createPost = async (post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count'>) => {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
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
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data as Trip[];
};

export const createTrip = async (trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('trips')
    .insert(trip)
    .select()
    .single();

  if (error) throw error;
  return data as Trip;
};

export const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
  const { data, error } = await supabase
    .from('trips')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', tripId)
    .select()
    .single();

  if (error) throw error;
  return data as Trip;
};

export const deleteTrip = async (tripId: string) => {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);

  if (error) throw error;
};

// ==================== MENSAGENS ====================

export const getConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) throw error;
  return data as Conversation[];
};

export const getMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${conversationId},receiver_id.eq.${conversationId}`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Message[];
};

export const sendMessage = async (message: Omit<Message, 'id' | 'created_at' | 'is_read'>) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
};

export const markMessageAsRead = async (messageId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId);

  if (error) throw error;
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
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Comment[];
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
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Story[];
  },

  async create(story: Omit<Story, 'id' | 'created_at' | 'expires_at'>): Promise<Story> {
    const { data, error } = await supabase
      .from('stories')
      .insert(story)
      .select()
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
  }
};
