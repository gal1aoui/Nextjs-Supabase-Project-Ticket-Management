-- ===========================================
-- Event Attendees Policies
-- ===========================================
-- RLS policies for the event_attendees table
-- Event creator is auto-added via trigger (security definer bypasses RLS)

-- SELECT: Attendees can view attendees of events they belong to
-- For project events: all project members can see attendees
-- For personal events: only the event creator can see attendees
create policy "Users can view event attendees"
  on event_attendees for select
  to authenticated
  using (
    exists (
      select 1 from events e
      where e.id = event_id
      and (
        -- Personal event: only creator
        (e.project_id is null and e.created_by = (select auth.uid()))
        -- Project event: any project member
        or (e.project_id is not null and is_project_member(e.project_id, (select auth.uid())))
      )
    )
  );

-- INSERT: Event managers can add attendees to project events
-- Personal event creators can add attendees to their own events
create policy "Users can add event attendees"
  on event_attendees for insert
  to authenticated
  with check (
    exists (
      select 1 from events e
      where e.id = event_id
      and (
        -- Personal event: only creator
        (e.project_id is null and e.created_by = (select auth.uid()))
        -- Project event: user has manage_events permission
        or (e.project_id is not null and has_project_permission(e.project_id, (select auth.uid()), 'manage_events'))
      )
    )
  );

-- UPDATE: Attendees can update their own status (RSVP: accepted/declined/tentative)
-- Event managers can update any attendee status for project events
create policy "Users can update event attendee status"
  on event_attendees for update
  to authenticated
  using (
    -- Self: update own RSVP status
    user_id = (select auth.uid())
    or exists (
      select 1 from events e
      where e.id = event_id
      and (
        -- Personal event: only creator
        (e.project_id is null and e.created_by = (select auth.uid()))
        -- Project event: user has manage_events permission
        or (e.project_id is not null and has_project_permission(e.project_id, (select auth.uid()), 'manage_events'))
      )
    )
  )
  with check (
    user_id = (select auth.uid())
    or exists (
      select 1 from events e
      where e.id = event_id
      and (
        (e.project_id is null and e.created_by = (select auth.uid()))
        or (e.project_id is not null and has_project_permission(e.project_id, (select auth.uid()), 'manage_events'))
      )
    )
  );

-- DELETE: Event managers can remove attendees from project events
-- Personal event creators can remove attendees from their own events
-- Attendees can remove themselves (leave event)
create policy "Users can remove event attendees"
  on event_attendees for delete
  to authenticated
  using (
    -- Self: leave event
    user_id = (select auth.uid())
    or exists (
      select 1 from events e
      where e.id = event_id
      and (
        -- Personal event: only creator
        (e.project_id is null and e.created_by = (select auth.uid()))
        -- Project event: user has manage_events permission
        or (e.project_id is not null and has_project_permission(e.project_id, (select auth.uid()), 'manage_events'))
      )
    )
  );
