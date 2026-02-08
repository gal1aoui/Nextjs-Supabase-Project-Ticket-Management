-- ===========================================
-- Default & Demo Ticket States Seed Data
-- ===========================================

-- Default template states (project_id = NULL)
-- These serve as templates users can pick from when adding states to their project
insert into ticket_states (name, project_id, "order", color) values
  ('Backlog', null, 0, '#6B7280'),
  ('To Do', null, 1, '#94A3B8'),
  ('In Progress', null, 2, '#3B82F6'),
  ('Review', null, 3, '#F59E0B'),
  ('Done', null, 4, '#10B981')
on conflict (project_id, name) do nothing;

-- Demo project states
-- Note: Requires demo projects to be seeded first
insert into ticket_states (id, name, project_id, "order", color) values
  -- E-Commerce Platform states
  ('10000000-0000-0000-0000-000000000001', 'Backlog', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 0, '#6B7280'),
  ('10000000-0000-0000-0000-000000000002', 'To Do', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, '#94A3B8'),
  ('10000000-0000-0000-0000-000000000003', 'In Progress', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, '#3B82F6'),
  ('10000000-0000-0000-0000-000000000004', 'Review', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, '#F59E0B'),
  ('10000000-0000-0000-0000-000000000005', 'Done', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 4, '#10B981')
on conflict (project_id, name) do nothing;
