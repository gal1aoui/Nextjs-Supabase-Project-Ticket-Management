-- ============================================
-- Notification Triggers
-- Purpose: Auto-create notifications when relevant events occur
-- ============================================

-- ===========================================
-- Helper: Insert a notification
-- ===========================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  -- Don't insert if user_id is NULL
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- Helper: Get the current acting user ID
-- Uses auth.uid() but falls back gracefully
-- ===========================================
CREATE OR REPLACE FUNCTION get_acting_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT auth.uid());
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- Helper: Get display name for a user
-- ===========================================
CREATE OR REPLACE FUNCTION get_user_display_name(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_name TEXT;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN 'Someone';
  END IF;

  SELECT COALESCE(full_name, email, 'Someone') INTO v_name
  FROM profiles WHERE id = p_user_id;

  RETURN COALESCE(v_name, 'Someone');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 1. Ticket Assigned (INSERT + UPDATE)
-- ===========================================
CREATE OR REPLACE FUNCTION notify_ticket_assigned()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_id UUID;
  v_actor_name TEXT;
BEGIN
  -- Skip if no assignee
  IF NEW.assigned_to IS NULL THEN
    RETURN NEW;
  END IF;

  -- For UPDATE, skip if assigned_to didn't actually change
  IF TG_OP = 'UPDATE' AND OLD.assigned_to IS NOT DISTINCT FROM NEW.assigned_to THEN
    RETURN NEW;
  END IF;

  -- Determine the actor: for INSERT use created_by, for UPDATE use auth.uid() or created_by
  IF TG_OP = 'INSERT' THEN
    v_actor_id := NEW.created_by;
  ELSE
    v_actor_id := COALESCE(get_acting_user_id(), NEW.created_by);
  END IF;

  -- Don't notify if user assigned to themselves
  IF NEW.assigned_to = v_actor_id THEN
    RETURN NEW;
  END IF;

  v_actor_name := get_user_display_name(v_actor_id);

  PERFORM create_notification(
    NEW.assigned_to,
    'ticket_assigned',
    'Ticket assigned to you',
    v_actor_name || ' assigned you to "' || NEW.title || '"',
    jsonb_build_object(
      'project_id', NEW.project_id,
      'ticket_id', NEW.id,
      'actor_id', v_actor_id,
      'actor_name', v_actor_name,
      'target_name', get_user_display_name(NEW.assigned_to),
      'resource_name', NEW.title
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire on both INSERT and UPDATE
CREATE TRIGGER on_ticket_assigned_insert
  AFTER INSERT ON tickets
  FOR EACH ROW
  WHEN (NEW.assigned_to IS NOT NULL)
  EXECUTE FUNCTION notify_ticket_assigned();

CREATE TRIGGER on_ticket_assigned_update
  AFTER UPDATE ON tickets
  FOR EACH ROW
  WHEN (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to)
  EXECUTE FUNCTION notify_ticket_assigned();

-- ===========================================
-- 2. Ticket State Changed
-- ===========================================
CREATE OR REPLACE FUNCTION notify_ticket_state_changed()
RETURNS TRIGGER AS $$
DECLARE
  v_new_state TEXT;
  v_actor_id UUID;
  v_actor_name TEXT;
BEGIN
  IF OLD.state_id IS NOT DISTINCT FROM NEW.state_id THEN
    RETURN NEW;
  END IF;

  v_actor_id := COALESCE(get_acting_user_id(), NEW.created_by);

  SELECT name INTO v_new_state FROM ticket_states WHERE id = NEW.state_id;
  v_actor_name := get_user_display_name(v_actor_id);

  -- Notify assignee (if not the actor)
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to IS DISTINCT FROM v_actor_id THEN
    PERFORM create_notification(
      NEW.assigned_to,
      'ticket_state_changed',
      'Ticket status updated',
      v_actor_name || ' moved "' || NEW.title || '" to ' || COALESCE(v_new_state, 'a new state'),
      jsonb_build_object('project_id', NEW.project_id, 'ticket_id', NEW.id, 'actor_id', v_actor_id, 'actor_name', v_actor_name, 'resource_name', NEW.title)
    );
  END IF;

  -- Notify creator (if different from assignee and actor)
  IF NEW.created_by IS NOT NULL
     AND NEW.created_by IS DISTINCT FROM v_actor_id
     AND NEW.created_by IS DISTINCT FROM NEW.assigned_to THEN
    PERFORM create_notification(
      NEW.created_by,
      'ticket_state_changed',
      'Ticket status updated',
      v_actor_name || ' moved "' || NEW.title || '" to ' || COALESCE(v_new_state, 'a new state'),
      jsonb_build_object('project_id', NEW.project_id, 'ticket_id', NEW.id, 'actor_id', v_actor_id, 'actor_name', v_actor_name, 'resource_name', NEW.title)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ticket_state_changed
  AFTER UPDATE ON tickets
  FOR EACH ROW
  WHEN (OLD.state_id IS DISTINCT FROM NEW.state_id)
  EXECUTE FUNCTION notify_ticket_state_changed();

-- ===========================================
-- 3. Ticket Priority Changed
-- ===========================================
CREATE OR REPLACE FUNCTION notify_ticket_priority_changed()
RETURNS TRIGGER AS $$
DECLARE
  v_new_priority TEXT;
  v_actor_id UUID;
  v_actor_name TEXT;
BEGIN
  IF OLD.priority_id IS NOT DISTINCT FROM NEW.priority_id THEN
    RETURN NEW;
  END IF;

  v_actor_id := COALESCE(get_acting_user_id(), NEW.created_by);

  -- Only notify the assignee if it's someone else
  IF NEW.assigned_to IS NULL OR NEW.assigned_to IS NOT DISTINCT FROM v_actor_id THEN
    RETURN NEW;
  END IF;

  SELECT name INTO v_new_priority FROM ticket_priorities WHERE id = NEW.priority_id;
  v_actor_name := get_user_display_name(v_actor_id);

  PERFORM create_notification(
    NEW.assigned_to,
    'ticket_priority_changed',
    'Ticket priority updated',
    v_actor_name || ' changed priority of "' || NEW.title || '" to ' || COALESCE(v_new_priority, 'none'),
    jsonb_build_object('project_id', NEW.project_id, 'ticket_id', NEW.id, 'actor_id', v_actor_id, 'actor_name', v_actor_name, 'target_name', get_user_display_name(NEW.assigned_to), 'resource_name', NEW.title)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ticket_priority_changed
  AFTER UPDATE ON tickets
  FOR EACH ROW
  WHEN (OLD.priority_id IS DISTINCT FROM NEW.priority_id)
  EXECUTE FUNCTION notify_ticket_priority_changed();

-- ===========================================
-- 4. Ticket Comment Created
-- ===========================================
CREATE OR REPLACE FUNCTION notify_ticket_commented()
RETURNS TRIGGER AS $$
DECLARE
  v_ticket RECORD;
  v_actor_name TEXT;
  v_actor_id UUID;
BEGIN
  -- The commenter is stored directly in the row
  v_actor_id := NEW.user_id;

  SELECT id, title, project_id, created_by, assigned_to
  INTO v_ticket FROM tickets WHERE id = NEW.ticket_id;

  v_actor_name := get_user_display_name(v_actor_id);

  -- Notify ticket assignee (if not the commenter)
  IF v_ticket.assigned_to IS NOT NULL AND v_ticket.assigned_to IS DISTINCT FROM v_actor_id THEN
    PERFORM create_notification(
      v_ticket.assigned_to,
      'ticket_commented',
      'New comment on ticket',
      v_actor_name || ' commented on "' || v_ticket.title || '"',
      jsonb_build_object('project_id', v_ticket.project_id, 'ticket_id', v_ticket.id, 'actor_id', v_actor_id, 'actor_name', v_actor_name, 'resource_name', v_ticket.title)
    );
  END IF;

  -- Notify ticket creator (if different from assignee and commenter)
  IF v_ticket.created_by IS NOT NULL
     AND v_ticket.created_by IS DISTINCT FROM v_actor_id
     AND v_ticket.created_by IS DISTINCT FROM v_ticket.assigned_to THEN
    PERFORM create_notification(
      v_ticket.created_by,
      'ticket_commented',
      'New comment on ticket',
      v_actor_name || ' commented on "' || v_ticket.title || '"',
      jsonb_build_object('project_id', v_ticket.project_id, 'ticket_id', v_ticket.id, 'actor_id', v_actor_id, 'actor_name', v_actor_name, 'resource_name', v_ticket.title)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ticket_comment_created
  AFTER INSERT ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_commented();

-- ===========================================
-- 5. Comment @Mention
-- ===========================================
CREATE OR REPLACE FUNCTION notify_comment_mention()
RETURNS TRIGGER AS $$
DECLARE
  v_comment RECORD;
  v_ticket RECORD;
  v_actor_name TEXT;
BEGIN
  SELECT id, ticket_id, user_id INTO v_comment FROM ticket_comments WHERE id = NEW.comment_id;

  -- Don't notify if user mentions themselves
  IF NEW.mentioned_user_id = v_comment.user_id THEN
    RETURN NEW;
  END IF;

  SELECT id, title, project_id INTO v_ticket FROM tickets WHERE id = v_comment.ticket_id;

  v_actor_name := get_user_display_name(v_comment.user_id);

  PERFORM create_notification(
    NEW.mentioned_user_id,
    'comment_mention',
    'You were mentioned',
    v_actor_name || ' mentioned you in "' || v_ticket.title || '"',
    jsonb_build_object('project_id', v_ticket.project_id, 'ticket_id', v_ticket.id, 'actor_id', v_comment.user_id, 'actor_name', v_actor_name, 'target_name', get_user_display_name(NEW.mentioned_user_id), 'resource_name', v_ticket.title)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_mention_created
  AFTER INSERT ON comment_mentions
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_mention();

-- ===========================================
-- 6. Project Member Invited
-- ===========================================
CREATE OR REPLACE FUNCTION notify_project_member_invited()
RETURNS TRIGGER AS $$
DECLARE
  v_project_name TEXT;
  v_inviter_name TEXT;
BEGIN
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;

  SELECT name INTO v_project_name FROM projects WHERE id = NEW.project_id;
  v_inviter_name := get_user_display_name(NEW.invited_by);

  PERFORM create_notification(
    NEW.user_id,
    'project_invite',
    'Project invitation',
    v_inviter_name || ' invited you to join "' || v_project_name || '"',
    jsonb_build_object('project_id', NEW.project_id, 'actor_id', NEW.invited_by, 'actor_name', v_inviter_name, 'target_name', get_user_display_name(NEW.user_id), 'resource_name', v_project_name)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_member_invited
  AFTER INSERT ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_project_member_invited();

-- ===========================================
-- 7. Project Member Status Changed
-- ===========================================
CREATE OR REPLACE FUNCTION notify_project_member_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  v_project_name TEXT;
  v_member_name TEXT;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT name INTO v_project_name FROM projects WHERE id = NEW.project_id;
  v_member_name := get_user_display_name(NEW.user_id);

  -- Member accepted invitation -> notify inviter
  IF OLD.status = 'pending' AND NEW.status = 'active' AND NEW.invited_by IS NOT NULL THEN
    PERFORM create_notification(
      NEW.invited_by,
      'project_invite_accepted',
      'Invitation accepted',
      v_member_name || ' accepted your invitation to "' || v_project_name || '"',
      jsonb_build_object('project_id', NEW.project_id, 'actor_id', NEW.user_id, 'actor_name', v_member_name, 'resource_name', v_project_name)
    );
  END IF;

  -- Member removed -> notify the member
  IF NEW.status = 'inactive' AND OLD.status = 'active' THEN
    PERFORM create_notification(
      NEW.user_id,
      'member_removed',
      'Removed from project',
      'You were removed from "' || v_project_name || '"',
      jsonb_build_object('project_id', NEW.project_id, 'target_name', get_user_display_name(NEW.user_id), 'resource_name', v_project_name)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_member_status_changed
  AFTER UPDATE ON project_members
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_project_member_status_changed();

-- ===========================================
-- 8. Event Attendee Invited
-- ===========================================
CREATE OR REPLACE FUNCTION notify_event_attendee_invited()
RETURNS TRIGGER AS $$
DECLARE
  v_event RECORD;
  v_creator_name TEXT;
BEGIN
  SELECT id, title, project_id, created_by INTO v_event FROM events WHERE id = NEW.event_id;

  -- Don't notify the creator being auto-added
  IF NEW.user_id = v_event.created_by THEN
    RETURN NEW;
  END IF;

  v_creator_name := get_user_display_name(v_event.created_by);

  PERFORM create_notification(
    NEW.user_id,
    'event_invite',
    'Event invitation',
    v_creator_name || ' invited you to "' || v_event.title || '"',
    jsonb_build_object('project_id', v_event.project_id, 'event_id', v_event.id, 'actor_id', v_event.created_by, 'actor_name', v_creator_name, 'target_name', get_user_display_name(NEW.user_id), 'resource_name', v_event.title)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_event_attendee_invited
  AFTER INSERT ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_attendee_invited();

-- ===========================================
-- 9. Event Attendee Response Changed
-- ===========================================
CREATE OR REPLACE FUNCTION notify_event_attendee_response()
RETURNS TRIGGER AS $$
DECLARE
  v_event RECORD;
  v_responder_name TEXT;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT id, title, project_id, created_by INTO v_event FROM events WHERE id = NEW.event_id;

  -- Don't notify creator about their own response
  IF NEW.user_id = v_event.created_by THEN
    RETURN NEW;
  END IF;

  v_responder_name := get_user_display_name(NEW.user_id);

  PERFORM create_notification(
    v_event.created_by,
    'event_response',
    'Event response',
    v_responder_name || ' ' || NEW.status || ' your event "' || v_event.title || '"',
    jsonb_build_object('project_id', v_event.project_id, 'event_id', v_event.id, 'actor_id', NEW.user_id, 'actor_name', v_responder_name, 'resource_name', v_event.title)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_event_attendee_response
  AFTER UPDATE ON event_attendees
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_event_attendee_response();

-- ===========================================
-- 10. Sprint Status Changed
-- ===========================================
CREATE OR REPLACE FUNCTION notify_sprint_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_id UUID;
  v_sprint_name TEXT;
  v_notification_type TEXT;
  v_title TEXT;
  v_message TEXT;
  v_member RECORD;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  v_actor_id := COALESCE(get_acting_user_id(), NEW.created_by);
  v_sprint_name := NEW.name;

  IF NEW.status = 'active' THEN
    v_notification_type := 'sprint_started';
    v_title := 'Sprint started';
    v_message := 'Sprint "' || v_sprint_name || '" has started';
  ELSIF NEW.status = 'completed' THEN
    v_notification_type := 'sprint_completed';
    v_title := 'Sprint completed';
    v_message := 'Sprint "' || v_sprint_name || '" has been completed';
  ELSE
    RETURN NEW;
  END IF;

  -- Notify all active project members (except the actor)
  FOR v_member IN
    SELECT user_id FROM project_members
    WHERE project_id = NEW.project_id
      AND status = 'active'
      AND user_id IS DISTINCT FROM v_actor_id
  LOOP
    PERFORM create_notification(
      v_member.user_id,
      v_notification_type,
      v_title,
      v_message,
      jsonb_build_object('project_id', NEW.project_id, 'sprint_id', NEW.id, 'actor_id', v_actor_id, 'actor_name', get_user_display_name(v_actor_id), 'resource_name', v_sprint_name)
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_sprint_status_changed
  AFTER UPDATE ON sprints
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_sprint_status_changed();
