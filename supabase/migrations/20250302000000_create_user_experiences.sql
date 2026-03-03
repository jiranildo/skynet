-- Create user_experiences table
CREATE TABLE IF NOT EXISTS public.user_experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_experiences ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own acquired experiences"
    ON public.user_experiences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own acquired experiences"
    ON public.user_experiences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own acquired experiences"
    ON public.user_experiences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own acquired experiences"
    ON public.user_experiences FOR DELETE
    USING (auth.uid() = user_id);

-- Create Index for faster lookups
CREATE INDEX IF NOT EXISTS user_experiences_user_id_idx ON public.user_experiences (user_id);
