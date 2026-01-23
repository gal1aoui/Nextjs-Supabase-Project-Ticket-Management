-- ===========================================
-- Roles Seed Data
-- ===========================================
-- Default system roles with permissions

insert into roles (name, description, is_system, permissions) values
  (
    'Owner',
    'Full project access - can manage all aspects of the project',
    true,
    '["manage_project", "manage_members", "manage_roles", "manage_tickets", "manage_states", "manage_priorities", "manage_meetings", "view_reports"]'::jsonb
  ),
  (
    'Admin',
    'Project management access - can manage members, tickets, and settings',
    true,
    '["manage_members", "manage_tickets", "manage_states", "manage_priorities", "manage_meetings", "view_reports"]'::jsonb
  ),
  (
    'Manager',
    'Can manage tickets, states, priorities, and meetings',
    true,
    '["manage_tickets", "manage_states", "manage_priorities", "manage_meetings", "view_reports"]'::jsonb
  ),
  (
    'Product Owner',
    'Defines requirements and priorities',
    true,
    '["manage_tickets", "manage_priorities", "view_reports"]'::jsonb
  ),
  (
    'Scrum Master',
    'Facilitates team processes and meetings',
    true,
    '["manage_tickets", "manage_states", "manage_meetings", "view_reports"]'::jsonb
  ),
  (
    'Developer',
    'Works on assigned tickets',
    true,
    '["create_tickets", "update_own_tickets", "comment"]'::jsonb
  ),
  (
    'Tester',
    'Tests features and reports bugs',
    true,
    '["create_tickets", "update_tickets", "comment"]'::jsonb
  ),
  (
    'Designer',
    'Creates designs and assets',
    true,
    '["create_tickets", "update_own_tickets", "comment"]'::jsonb
  ),
  (
    'Guest',
    'View-only access to project',
    true,
    '["view_tickets"]'::jsonb
  )
on conflict (name) do nothing;
