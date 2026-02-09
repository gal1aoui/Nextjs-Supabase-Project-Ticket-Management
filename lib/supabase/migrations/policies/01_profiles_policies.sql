-- ===========================================
-- Profiles Policies
-- ===========================================
-- RLS policies for the profiles table
-- Profiles are auto-created via trigger on auth.users insert

-- SELECT: Public profiles are viewable by everyone
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

-- INSERT: Users can only insert their own profile
create policy "Users can insert their own profile"
  on profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- UPDATE: Users can only update their own profile
create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- DELETE: Users can only delete their own profile
create policy "Users can delete own profile"
  on profiles for delete
  to authenticated
  using ((select auth.uid()) = id);
