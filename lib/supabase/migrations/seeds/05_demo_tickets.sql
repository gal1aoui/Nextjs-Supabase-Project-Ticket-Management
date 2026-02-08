-- ===========================================
-- Demo Tickets Seed Data
-- ===========================================
-- Sample tickets for demo projects
-- Note: Requires demo projects, states, and priorities to be seeded first

-- Uncomment when seeding with demo data:


insert into tickets (id, title, description, project_id, state_id, assigned_to, priority_id, sort_order, created_by) values
  (
    '70000000-0000-0000-0000-000000000001',
    'Fix mobile responsive issues',
    'The checkout flow breaks on mobile devices below 375px width',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '10000000-0000-0000-0000-000000000002',
    'b3a1fbca-ee85-4786-95c9-2b9206becdc7',
    '40000000-0000-0000-0000-000000000003',
    0,
    'b3a1fbca-ee85-4786-95c9-2b9206becdc7'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    'Upgrade dependencies',
    'Update Next.js to 16, React to 19, and other core dependencies',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '10000000-0000-0000-0000-000000000001',
    'b3a1fbca-ee85-4786-95c9-2b9206becdc7',
    '40000000-0000-0000-0000-000000000001',
    0,
    'b3a1fbca-ee85-4786-95c9-2b9206becdc7'
  ),
  (
    '70000000-0000-0000-0000-000000000003',
    'Implement Stripe payment',
    'Set up Stripe checkout and webhook handlers for payment processing',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '10000000-0000-0000-0000-000000000003',
    'b3a1fbca-ee85-4786-95c9-2b9206becdc7',
    '40000000-0000-0000-0000-000000000004',
    0,
    'b3a1fbca-ee85-4786-95c9-2b9206becdc7'
  )
on conflict (id) do nothing;

