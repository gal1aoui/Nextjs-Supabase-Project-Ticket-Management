-- Insert Projects
insert into projects (id, name, description, color, created_by) values
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'E-Commerce Platform', 'Building a modern e-commerce solution with Next.js and Stripe', '#3B82F6', 'b3a1fbca-ee85-4786-95c9-2b9206becdc7'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Mobile App Development', 'React Native app for iOS and Android', '#10B981', 'b3a1fbca-ee85-4786-95c9-2b9206becdc7'),
('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Marketing Campaign Q1', 'Social media and content marketing initiatives', '#F59E0B', 'b3a1fbca-ee85-4786-95c9-2b9206becdc7');

-- Insert Ticket States
insert into ticket_states (id, name, project_id, "order", color) values
('10000000-0000-0000-0000-000000000001', 'To Do', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 0, '#94A3B8'),
('10000000-0000-0000-0000-000000000002', 'In Progress', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, '#3B82F6'),
('10000000-0000-0000-0000-000000000003', 'Review', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, '#F59E0B'),
('10000000-0000-0000-0000-000000000004', 'Done', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, '#10B981');

-- Insert Ticket Priorities
insert into ticket_priorities (id, name, project_id, "order", color) values
('40000000-0000-0000-0000-000000000001', 'Low', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 0, '#94A3B8'),
('40000000-0000-0000-0000-000000000002', 'Medium', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, '#3B82F6'),
('40000000-0000-0000-0000-000000000003', 'High', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, '#F59E0B'),
('40000000-0000-0000-0000-000000000004', 'Urgent', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, '#EF4444');

-- Insert Tickets
insert into tickets (id, title, description, project_id, state_id, assigned_to, priority_id, created_by) values
('70000000-0000-0000-0000-000000000001', 'Fix mobile responsive issues', 'The checkout flow breaks on mobile devices', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000001', 'b3a1fbca-ee85-4786-95c9-2b9206becdc7', '40000000-0000-0000-0000-000000000003', 'b3a1fbca-ee85-4786-95c9-2b9206becdc7'),
('70000000-0000-0000-0000-000000000002', 'Upgrade dependencies', 'Update Next.js, React, and other core dependencies', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000001', 'b3a1fbca-ee85-4786-95c9-2b9206becdc7', '40000000-0000-0000-0000-000000000001', 'b3a1fbca-ee85-4786-95c9-2b9206becdc7'),
('70000000-0000-0000-0000-000000000003', 'Implement Stripe payment', 'Set up Stripe checkout and webhook handlers', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000002', 'b3a1fbca-ee85-4786-95c9-2b9206becdc7', '40000000-0000-0000-0000-000000000004', 'b3a1fbca-ee85-4786-95c9-2b9206becdc7');