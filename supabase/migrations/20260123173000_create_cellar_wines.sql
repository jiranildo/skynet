-- Create cellar_wines table if it doesn't exist
create table if not exists public.cellar_wines (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  producer text,
  vintage integer,
  type text check (type in ('red', 'white', 'rose', 'sparkling', 'fortified', 'dessert')) not null,
  country text,
  region text,
  grapes text,
  quantity integer default 1,
  section text,
  shelf text,
  position text,
  price decimal(10,2),
  rating decimal(3,1),
  notes text,
  image_url text,
  alcohol_content decimal(4,1),
  serving_temp text,
  decant_time text,
  aging_potential text,
  food_pairing text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.cellar_wines enable row level security;

-- Create policies
create policy "Users can view their own wines"
  on public.cellar_wines for select
  using (auth.uid() = user_id);

create policy "Users can insert their own wines"
  on public.cellar_wines for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own wines"
  on public.cellar_wines for update
  using (auth.uid() = user_id);

create policy "Users can delete their own wines"
  on public.cellar_wines for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists cellar_wines_user_id_idx on public.cellar_wines(user_id);
create index if not exists cellar_wines_type_idx on public.cellar_wines(type);
