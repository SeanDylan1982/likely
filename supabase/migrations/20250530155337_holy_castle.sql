-- Create favorites table
create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content_id integer not null,
  content_type text not null check (content_type in ('movie', 'tv')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index favorites_user_id_idx on public.favorites(user_id);
create unique index favorites_user_content_idx on public.favorites(user_id, content_id, content_type);

-- Set up row level security
alter table public.favorites enable row level security;

-- Create policies
create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);