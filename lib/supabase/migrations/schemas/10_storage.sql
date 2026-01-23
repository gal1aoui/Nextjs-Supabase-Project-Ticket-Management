-- ===========================================
-- Storage Schema
-- ===========================================
-- Supabase Storage bucket configuration

-- Create avatars bucket
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
