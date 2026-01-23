-- ===========================================
-- Roles Policies
-- ===========================================
-- RLS policies for the roles table

-- SELECT: Authenticated users can view roles
create policy "Roles are viewable by authenticated users"
  on roles for select
  to authenticated
  using (true);

-- Note: Roles are system-managed, no INSERT/UPDATE/DELETE policies needed
-- Admin operations should be done via service role or database directly
