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
    voice_uri?: string;
    voice_enabled?: boolean;
    avatar_type?: 'icon' | 'image';
    avatar_url?: string;
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
  feeling?: string;
  tagged_users?: string[];
  status_update?: string;
  review_data?: any;
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
  feeling?: string;
  tagged_users?: string[];
  status_update?: string;
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
  related_trip_id?: string;
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
  status?: 'in_cellar' | 'wishlist' | 'consumed';
  is_favorite?: boolean;
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
  best_drinking_window?: string;
  food_pairing?: string;
  terroir?: string;
  intensity?: number;
  visual_perception?: string;
  olfactory_perception?: string;
  palate_perception?: string;
  description?: string;
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

// ==================== GAMIFICATION TYPES ====================

export interface UserGamification {
  user_id: string;
  level: number;
  current_xp: number;
  next_level_xp: number;
  tm_balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserBadge {
  id?: string;
  user_id?: string;
  badge_id: string;
  current_progress: number;
  unlocked: boolean;
  unlocked_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserMission {
  id?: string;
  user_id?: string;
  mission_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TravelMoneyTransaction {
  id?: string;
  user_id?: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  category: string;
  created_at?: string;
}

export interface GamificationBadgeCatalog {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: number;
  reward: number;
  category: 'travel' | 'social' | 'food' | 'special';
  created_at?: string;
}

export interface GamificationMissionCatalog {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  total: number;
  created_at?: string;
}

export interface WalletEarnOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  color: string;
  created_at?: string;
}

export interface WalletSpendOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  cost: number;
  color: string;
  created_at?: string;
}

export interface WalletBuyPackage {
  id: string;
  amount: number;
  price: string;
  bonus: number;
  created_at?: string;
}
