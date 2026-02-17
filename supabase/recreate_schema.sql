-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- ==================== USERS ====================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  trips_count INTEGER DEFAULT 0,
  visited_countries_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Settings
  notifications_enabled BOOLEAN DEFAULT TRUE,
  privacy_enabled BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'pt-BR',
  theme TEXT DEFAULT 'system',
  
  -- App Config
  sound_effects BOOLEAN DEFAULT TRUE,
  autoplay BOOLEAN DEFAULT TRUE,
  high_quality BOOLEAN DEFAULT TRUE,
  data_saver BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url, username)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication errors on re-runs (though schema drop handles this)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill existing users
INSERT INTO public.users (id, username, full_name, avatar_url)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'username', 'user_' || substr(id::text, 1, 8)),
  COALESCE(raw_user_meta_data->>'full_name', 'Unknown User'),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ==================== POSTS ====================
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  caption TEXT,
  image_url TEXT,
  media_urls TEXT[], -- Array of URLs
  location TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'public', -- 'public', 'private', 'friends'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public posts are viewable by everyone" 
ON public.posts FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" 
ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" 
ON public.posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- ==================== EXPERIÊNCIAS GASTRONÔMICAS (FOOD) ====================
CREATE TABLE public.food_experiences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL, -- 'restaurant', 'wine', 'dish', 'drink'
  name TEXT NOT NULL,
  location TEXT,
  restaurant TEXT,
  date DATE,
  price TEXT,
  rating NUMERIC,
  notes TEXT,
  description TEXT,
  image_url TEXT,
  would_return BOOLEAN,
  reviews_count INTEGER DEFAULT 0,
  average_rating NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.food_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own experiences" 
ON public.food_experiences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiences" 
ON public.food_experiences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiences" 
ON public.food_experiences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiences" 
ON public.food_experiences FOR DELETE USING (auth.uid() = user_id);

-- ==================== STORIES ====================
CREATE TABLE public.stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image', -- 'image', 'video'
  duration INTEGER DEFAULT 5,
  caption TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active stories are viewable by everyone" 
ON public.stories FOR SELECT USING (expires_at > NOW());

CREATE POLICY "Users can insert own stories" 
ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" 
ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- ==================== REELS ====================
CREATE TABLE public.reels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reels viewable by everyone" ON public.reels FOR SELECT USING (true);
CREATE POLICY "Users can insert own reels" ON public.reels FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==================== TRIPS ====================
CREATE TABLE public.trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  status TEXT DEFAULT 'planned', -- 'planned', 'ongoing', 'completed'
  trip_type TEXT,
  cover_image TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trips viewable by owner" ON public.trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trips" ON public.trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON public.trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON public.trips FOR DELETE USING (auth.uid() = user_id);

-- ==================== STORAGE BUCKETS (If needed) ====================
-- Note: Buckets are global, but we can set policies.
-- Inserting logic to ensure buckets exist is tricky in SQL directly without pg_net or extensions.
-- Assuming buckets 'posts', 'stories', 'reels', 'avatars' exist or are managed via dashboard.
-- Creating storage policies just in case policies were wiped.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true), ('stories', 'stories', true), ('reels', 'reels', true), ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('posts', 'stories', 'reels', 'avatars'));
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
