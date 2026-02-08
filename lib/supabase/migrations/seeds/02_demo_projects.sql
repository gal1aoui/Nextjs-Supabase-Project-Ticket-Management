-- ===========================================
-- Demo Projects Seed Data
-- ===========================================
-- Sample projects for development/demo purposes
-- Note: Replace 'b3a1fbca-ee85-4786-95c9-2b9206becdc7' with actual user UUID

-- Uncomment and modify these when seeding with a real user:


insert into projects (id, name, description, color, created_by) values
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'E-Commerce Platform',
    'Building a modern e-commerce solution with Next.js and Stripe',
    '#3B82F6',
    'b3a1fbca-ee85-4786-95c9-2b9206becdc7'
  ),
  (
    'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
    'Mobile App Development',
    'React Native app for iOS and Android',
    '#10B981',
    'b3a1fbca-ee85-4786-95c9-2b9206becdc7'
  ),
  (
    'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
    'Marketing Campaign Q1',
    'Social media and content marketing initiatives',
    '#F59E0B',
    'b3a1fbca-ee85-4786-95c9-2b9206becdc7'
  )
on conflict (id) do nothing;

