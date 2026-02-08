-- ===========================================
-- Default & Demo Ticket Priorities Seed Data
-- ===========================================

-- Default template priorities (project_id = NULL)
-- These serve as templates users can pick from when adding priorities to their project
insert into ticket_priorities (name, project_id, "order", color) values
  ('Low', null, 0, '#94A3B8'),
  ('Medium', null, 1, '#3B82F6'),
  ('High', null, 2, '#F59E0B'),
  ('Urgent', null, 3, '#EF4444')
on conflict (project_id, name) do nothing;

-- Demo project priorities
-- Note: Requires demo projects to be seeded first
insert into ticket_priorities (id, name, project_id, "order", color) values
  -- E-Commerce Platform priorities
  ('40000000-0000-0000-0000-000000000001', 'Low', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 0, '#94A3B8'),
  ('40000000-0000-0000-0000-000000000002', 'Medium', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, '#3B82F6'),
  ('40000000-0000-0000-0000-000000000003', 'High', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, '#F59E0B'),
  ('40000000-0000-0000-0000-000000000004', 'Urgent', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, '#EF4444')
on conflict (project_id, name) do nothing;
