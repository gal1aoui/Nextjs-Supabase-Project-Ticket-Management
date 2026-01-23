-- ===========================================
-- Profiles Schema
-- ===========================================
-- User profiles linked to auth.users

create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  email text,
  avatar_url text,
  website text,
  constraint username_length check (char_length(username) >= 3)
);

-- Indexes
create index idx_profiles_username on profiles(username);
create index idx_profiles_full_name on profiles(full_name);

-- Enable RLS
alter table profiles enable row level security;

-- ===========================================
-- Trigger: Auto-create profile on user signup
-- ===========================================
create function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, username)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    new.raw_user_meta_data->>'username'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
