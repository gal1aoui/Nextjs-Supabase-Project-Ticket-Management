-- Seed data for user: 7dc97cc1-2e1b-4579-a6c3-03623fab166a

-- Insert Projects
INSERT INTO projects (id, name, description, color, created_by) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'E-Commerce Platform', 'Building a modern e-commerce solution with Next.js and Stripe', '#3B82F6', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Mobile App Development', 'React Native app for iOS and Android', '#10B981', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Marketing Campaign Q1', 'Social media and content marketing initiatives', '#F59E0B', '7dc97cc1-2e1b-4579-a6c3-03623fab166a');

-- Insert Ticket States for E-Commerce Platform
INSERT INTO ticket_states (id, name, project_id, "order", color) VALUES
('10000000-0000-0000-0000-000000000001', 'To Do', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 0, '#94A3B8'),
('10000000-0000-0000-0000-000000000002', 'In Progress', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, '#3B82F6'),
('10000000-0000-0000-0000-000000000003', 'Review', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, '#F59E0B'),
('10000000-0000-0000-0000-000000000004', 'Done', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, '#10B981');

-- Insert Ticket States for Mobile App Development
INSERT INTO ticket_states (id, name, project_id, "order", color) VALUES
('20000000-0000-0000-0000-000000000001', 'Backlog', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 0, '#6B7280'),
('20000000-0000-0000-0000-000000000002', 'In Development', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 1, '#8B5CF6'),
('20000000-0000-0000-0000-000000000003', 'Testing', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 2, '#EC4899'),
('20000000-0000-0000-0000-000000000004', 'Deployed', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 3, '#22C55E');

-- Insert Ticket States for Marketing Campaign
INSERT INTO ticket_states (id, name, project_id, "order", color) VALUES
('30000000-0000-0000-0000-000000000001', 'Planning', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 0, '#A78BFA'),
('30000000-0000-0000-0000-000000000002', 'In Production', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 1, '#FB923C'),
('30000000-0000-0000-0000-000000000003', 'Published', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 2, '#34D399');

-- Insert Ticket Priorities for E-Commerce Platform
INSERT INTO ticket_priorities (id, name, project_id, "order", color) VALUES
('40000000-0000-0000-0000-000000000001', 'Low', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 0, '#94A3B8'),
('40000000-0000-0000-0000-000000000002', 'Medium', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, '#3B82F6'),
('40000000-0000-0000-0000-000000000003', 'High', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, '#F59E0B'),
('40000000-0000-0000-0000-000000000004', 'Urgent', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, '#EF4444');

-- Insert Ticket Priorities for Mobile App Development
INSERT INTO ticket_priorities (id, name, project_id, "order", color) VALUES
('50000000-0000-0000-0000-000000000001', 'Low', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 0, '#94A3B8'),
('50000000-0000-0000-0000-000000000002', 'Medium', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 1, '#3B82F6'),
('50000000-0000-0000-0000-000000000003', 'High', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 2, '#F59E0B'),
('50000000-0000-0000-0000-000000000004', 'Critical', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 3, '#DC2626');

-- Insert Ticket Priorities for Marketing Campaign
INSERT INTO ticket_priorities (id, name, project_id, "order", color) VALUES
('60000000-0000-0000-0000-000000000001', 'Nice to Have', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 0, '#D1D5DB'),
('60000000-0000-0000-0000-000000000002', 'Important', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 1, '#FB923C'),
('60000000-0000-0000-0000-000000000003', 'Urgent', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 2, '#DC2626');

-- Insert Tickets for E-Commerce Platform
INSERT INTO tickets (id, title, description, project_id, state_id, assigned_to, priority_id, created_by) VALUES
-- To Do
('70000000-0000-0000-0000-000000000001', 'Fix mobile responsive issues on checkout page', 'The checkout flow breaks on mobile devices below 375px width', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000001', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '40000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('70000000-0000-0000-0000-000000000002', 'Upgrade dependencies to latest versions', 'Update Next.js, React, and other core dependencies', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000001', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '40000000-0000-0000-0000-000000000001', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('70000000-0000-0000-0000-000000000003', 'Add loading skeletons for product pages', 'Implement skeleton screens for better perceived performance', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000001', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '40000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
-- In Progress
('70000000-0000-0000-0000-000000000004', 'Implement Stripe payment integration', 'Set up Stripe checkout and webhook handlers for payment processing', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '40000000-0000-0000-0000-000000000004', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('70000000-0000-0000-0000-000000000005', 'Build product search with filters', 'Implement full-text search with category, price, and rating filters', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '40000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
-- Review
('70000000-0000-0000-0000-000000000006', 'User authentication system with OAuth', 'Google and GitHub OAuth integration completed, needs testing', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '40000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('70000000-0000-0000-0000-000000000007', 'Shopping cart functionality', 'Add to cart, update quantities, and persist cart state', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '40000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
-- Done
('70000000-0000-0000-0000-000000000008', 'Setup project repository and CI/CD', 'GitHub repository with automated testing and deployment to Vercel', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000004', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '40000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('70000000-0000-0000-0000-000000000009', 'Design system and component library', 'Created reusable components with Tailwind CSS and shadcn/ui', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000004', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '40000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('70000000-0000-0000-0000-000000000010', 'Database schema design', 'PostgreSQL schema with Prisma ORM setup complete', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '10000000-0000-0000-0000-000000000004', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '40000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a');

-- Insert Tickets for Mobile App Development
INSERT INTO tickets (id, title, description, project_id, state_id, assigned_to, priority_id, created_by) VALUES
-- Backlog
('80000000-0000-0000-0000-000000000001', 'Implement push notifications', 'Set up Firebase Cloud Messaging for iOS and Android', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '20000000-0000-0000-0000-000000000001', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '50000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('80000000-0000-0000-0000-000000000002', 'Add offline mode support', 'Implement local storage and sync mechanism', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '20000000-0000-0000-0000-000000000001', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '50000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
-- In Development
('80000000-0000-0000-0000-000000000003', 'User profile management screen', 'Edit profile, upload avatar, change password functionality', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '20000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '50000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('80000000-0000-0000-0000-000000000004', 'Biometric authentication', 'Face ID and Touch ID integration for secure login', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '20000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '50000000-0000-0000-0000-000000000004', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
-- Testing
('80000000-0000-0000-0000-000000000005', 'Home feed with infinite scroll', 'Lazy loading feed with pull-to-refresh', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '20000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '50000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
-- Deployed
('80000000-0000-0000-0000-000000000006', 'Onboarding flow', 'Multi-step welcome screens with animations', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '20000000-0000-0000-0000-000000000004', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '50000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('80000000-0000-0000-0000-000000000007', 'Splash screen and app icon', 'Branded launch screen and icon for both platforms', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '20000000-0000-0000-0000-000000000004', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '50000000-0000-0000-0000-000000000001', '7dc97cc1-2e1b-4579-a6c3-03623fab166a');

-- Insert Tickets for Marketing Campaign
INSERT INTO tickets (id, title, description, project_id, state_id, assigned_to, priority_id, created_by) VALUES
-- Planning
('90000000-0000-0000-0000-000000000001', 'Q1 social media content calendar', 'Plan 90 days of Instagram, Twitter, and LinkedIn posts', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '30000000-0000-0000-0000-000000000001', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '60000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('90000000-0000-0000-0000-000000000002', 'Email marketing automation setup', 'Configure Mailchimp workflows for lead nurturing', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '30000000-0000-0000-0000-000000000001', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '60000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
-- In Production
('90000000-0000-0000-0000-000000000003', 'Product launch video', 'Create 60-second promotional video for YouTube and social media', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '30000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '60000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('90000000-0000-0000-0000-000000000004', 'Blog post series on industry trends', 'Write 5 SEO-optimized articles for company blog', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '30000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '60000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
-- Published
('90000000-0000-0000-0000-000000000005', 'Launch announcement press release', 'Distributed to tech publications and news outlets', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '30000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '60000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a'),
('90000000-0000-0000-0000-000000000006', 'Website landing page redesign', 'New hero section with improved conversion rate', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '30000000-0000-0000-0000-000000000003', '7dc97cc1-2e1b-4579-a6c3-03623fab166a', '60000000-0000-0000-0000-000000000002', '7dc97cc1-2e1b-4579-a6c3-03623fab166a');