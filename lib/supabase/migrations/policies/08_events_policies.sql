-- ===========================================
-- Events Policies
-- ===========================================
-- RLS policies for the events table
-- Two types: project events (project_id NOT NULL) and personal events (project_id IS NULL)

-- ===========================================
-- Project Events (project_id IS NOT NULL)
-- ===========================================

-- SELECT: Project members can view project events
create policy "Members can view project events"
  on events for select
  to authenticated
  using (
    project_id is not null
    and is_project_member(project_id, (select auth.uid()))
  );

-- INSERT: Users with manage_events permission can create project events
create policy "Members with manage_events can create project events"
  on events for insert
  to authenticated
  with check (
    project_id is not null
    and (select auth.uid()) = created_by
    and has_project_permission(project_id, (select auth.uid()), 'manage_events')
  );

-- UPDATE: Users with manage_events permission can update project events
create policy "Members with manage_events can update project events"
  on events for update
  to authenticated
  using (
    project_id is not null
    and has_project_permission(project_id, (select auth.uid()), 'manage_events')
  )
  with check (
    project_id is not null
  );

-- DELETE: Users with manage_events permission can delete project events
create policy "Members with manage_events can delete project events"
  on events for delete
  to authenticated
  using (
    project_id is not null
    and has_project_permission(project_id, (select auth.uid()), 'manage_events')
  );

-- ===========================================
-- Personal Events (project_id IS NULL)
-- ===========================================

-- SELECT: Users can view their own personal events
create policy "Users can view own personal events"
  on events for select
  to authenticated
  using (
    project_id is null
    and created_by = (select auth.uid())
  );

-- INSERT: Users can create their own personal events
create policy "Users can create personal events"
  on events for insert
  to authenticated
  with check (
    project_id is null
    and (select auth.uid()) = created_by
  );

-- UPDATE: Users can update their own personal events
create policy "Users can update own personal events"
  on events for update
  to authenticated
  using (
    project_id is null
    and created_by = (select auth.uid())
  )
  with check (
    project_id is null
    and created_by = (select auth.uid())
  );

-- DELETE: Users can delete their own personal events
create policy "Users can delete own personal events"
  on events for delete
  to authenticated
  using (
    project_id is null
    and created_by = (select auth.uid())
  );
