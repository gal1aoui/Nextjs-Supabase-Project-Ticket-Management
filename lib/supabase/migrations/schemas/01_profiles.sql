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
