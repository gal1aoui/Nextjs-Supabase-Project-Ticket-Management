-- Insert Projects
insert into projects (id, name, description, color, created_by) values
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'E-Commerce Platform', 'Building a modern e-commerce solution with Next.js and Stripe', '#3B82F6', '0c683691-f926-4205-a0f9-9c11156f9348'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Mobile App Development', 'React Native app for iOS and Android', '#10B981', '0c683691-f926-4205-a0f9-9c11156f9348'),
('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Marketing Campaign Q1', 'Social media and content marketing initiatives', '#F59E0B', '0c683691-f926-4205-a0f9-9c11156f9348');

-- Project members will be auto-added via trigger

-- Insert Ticket States
insert into ticket_states (id, name, project_id, "order", color) values
('10000000-0000-0000-0000-000000000001', 'To Do', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 0, '#94A3B8'),
('10000000-0000-0000-0000-000000000002', 'In Progress', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, '#3B82F6'),
('10000000-0000-0000-0000-000000000003', 'Review', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, '#F59E0B'),
('10000000-0000-0000-0000-000000000004', 'Done', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, '#10B981'),
('20000000-0000-0000-0000-000000000001', 'Backlog', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 0, '#6B7280'),
('20000000-0000-0000-0000-000000000002', 'In Development', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 1, '#8B5CF6'),
('20000000-0000-0000-0000-000000000003', 'Testing', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 2, '#EC4899'),
('20000000-0000-0000-0000-000000000004', 'Deployed', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 3, '#22C55E'),
('30000000-0000-0000-0000-000000000001', 'Planning', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 0, '#A78BFA'),
('30000000-0000-0000-0000-000000000002', 'In Production', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 1, '#FB923C'),
('30000000-0000-0000-0000-000000000003', 'Published', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 2, '#34D399');

-- Insert Ticket Priorities
insert into ticket_priorities (id, name, project_id, "order", color) values
('40000000-0000-0000-0000-000000000001', 'Low', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 0, '#94A3B8'),
('40000000-0000-0000-0000-000000000002', 'Medium', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, '#3B82F6'),
('40000000-0000-0000-0000-000000000003', 'High', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, '#F59E0B'),
('40000000-0000-0000-0000-000000000004', 'Urgent', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, '#EF4444'),
('50000000-0000-0000-0000-000000000001', 'Low', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 0, '#94A3B8'),
('50000000-0000-0000-0000-000000000002', 'Medium', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 1, '#3B82F6'),
('50000000-0000-0000-0000-000000000003', 'High', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 2, '#F59E0B'),
('50000000-0000-0000-0000-000000000004', 'Critical', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 3, '#DC2626'),
('60000000-0000-0000-0000-000000000001', 'Nice to Have', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 0, '#D1D5DB'),
('60000000-0000-0000-0000-000000000002', 'Important', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 1, '#FB923C'),
('60000000-0000-0000-0000-000000000003', 'Urgent', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 2, '#DC2626');

-- Insert Tickets
insert into tickets (id, title, description, project_id, state_id, assigned_to, priority_id, created_by) values
('70000000-0000-0000-0000-000000000001', 'Fix mobile responsive issues', 'The checkout flow breaks on mobile', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000001', '0c683691-f926-4205-a0f9-9c11156f9348', '40000000-0000-0000-0000-000000000003', '0c683691-f926-4205-a0f9-9c11156f9348'),
('70000000-0000-0000-0000-000000000002', 'Upgrade dependencies', 'Update Next.js and React', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000001', '0c683691-f926-4205-a0f9-9c11156f9348', '40000000-0000-0000-0000-000000000001', '0c683691-f926-4205-a0f9-9c11156f9348');