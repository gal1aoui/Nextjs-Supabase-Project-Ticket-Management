-- ===========================================
-- Meeting Attendees Policies
-- ===========================================
-- RLS policies for the meeting_attendees table

-- SELECT: Project members can view meeting attendees
create policy "Users can view meeting attendees"
  on meeting_attendees for select
  to authenticated
  using (
    exists (
      select 1 from meetings m
      where m.id = meeting_attendees.meeting_id
      and is_project_member(m.project_id, (select auth.uid()))
    )
  );

-- INSERT: Meeting creators or users with manage_meetings can add attendees
create policy "Meeting creators can add attendees"
  on meeting_attendees for insert
  to authenticated
  with check (
    exists (
      select 1 from meetings m
      where m.id = meeting_attendees.meeting_id
      and (
        m.created_by = (select auth.uid())
        or has_project_permission(m.project_id, (select auth.uid()), 'manage_meetings')
      )
    )
  );

-- UPDATE: Attendees can update their own status, creators can update any
create policy "Attendees can update their status"
  on meeting_attendees for update
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from meetings m
      where m.id = meeting_attendees.meeting_id
      and (
        m.created_by = (select auth.uid())
        or has_project_permission(m.project_id, (select auth.uid()), 'manage_meetings')
      )
    )
  );

-- DELETE: Meeting creators or users with manage_meetings can remove attendees
create policy "Meeting creators can remove attendees"
  on meeting_attendees for delete
  to authenticated
  using (
    exists (
      select 1 from meetings m
      where m.id = meeting_attendees.meeting_id
      and (
        m.created_by = (select auth.uid())
        or has_project_permission(m.project_id, (select auth.uid()), 'manage_meetings')
      )
    )
  );
