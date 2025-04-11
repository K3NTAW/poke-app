-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text unique,
  full_name text,
  pokemon_player_id text,
  role text check (role in ('player', 'shop')) not null default 'player',
  avatar_url text,
  constraint username_length check (char_length(username) >= 3)
);

-- Create tournaments table
create table if not exists public.tournaments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text not null,
  date timestamp with time zone not null,
  location text not null,
  accessibility_details jsonb,
  tags text[] default '{}',
  seat_limit integer not null,
  shop_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('draft', 'published', 'cancelled', 'completed')) not null default 'draft'
);

-- Create tournament_registrations table
create table if not exists public.tournament_registrations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  player_id uuid references public.profiles(id) on delete cascade not null,
  deck_list jsonb,
  status text check (status in ('pending', 'confirmed', 'cancelled')) not null default 'pending',
  unique(tournament_id, player_id)
);

-- Create chat_messages table
create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_registrations enable row level security;
alter table public.chat_messages enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Tournaments policies
create policy "Tournaments are viewable by everyone"
  on public.tournaments for select
  using (true);

create policy "Shops can create tournaments"
  on public.tournaments for insert
  with check (
    auth.uid() = shop_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'shop'
    )
  );

create policy "Shops can update their own tournaments"
  on public.tournaments for update
  using (
    auth.uid() = shop_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'shop'
    )
  );

-- Tournament registrations policies
create policy "Registrations are viewable by tournament shop and registered players"
  on public.tournament_registrations for select
  using (
    auth.uid() = player_id or
    exists (
      select 1 from public.tournaments
      where id = tournament_id and shop_id = auth.uid()
    )
  );

create policy "Players can register for tournaments"
  on public.tournament_registrations for insert
  with check (
    auth.uid() = player_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'player'
    )
  );

create policy "Players can update their own registrations"
  on public.tournament_registrations for update
  using (auth.uid() = player_id);

-- Chat messages policies
create policy "Chat messages are viewable by tournament participants"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.tournament_registrations
      where tournament_id = chat_messages.tournament_id and player_id = auth.uid()
    ) or
    exists (
      select 1 from public.tournaments
      where id = chat_messages.tournament_id and shop_id = auth.uid()
    )
  );

create policy "Tournament participants can send messages"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.tournament_registrations
      where tournament_id = chat_messages.tournament_id and player_id = auth.uid()
    ) or
    exists (
      select 1 from public.tournaments
      where id = chat_messages.tournament_id and shop_id = auth.uid()
    )
  );

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 