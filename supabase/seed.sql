-- WorkBridge Seed Data for Demo
-- This creates sample users, projects, and transactions for testing

-- Insert demo users (passwords are 'password123' hashed with bcrypt)
INSERT INTO users (id, email, password_hash, cover_letter, experiences, age, skills, role, kyc_status) VALUES
-- Admin user
('550e8400-e29b-41d4-a716-446655440001', 'admin@workbridge.com', '$2b$10$rOgK1YsNq4R1YsNq4R1YsO1YsNq4R1YsNq4R1YsNq4R1YsNq4R1Ys', 'Platform Administrator', 'System Administration', 30, ARRAY['Admin', 'Platform Management'], 'admin', 'verified'),

-- Client users
('550e8400-e29b-41d4-a716-446655440002', 'client1@example.com', '$2b$10$rOgK1YsNq4R1YsNq4R1YsO1YsNq4R1YsNq4R1YsNq4R1YsNq4R1Ys', 'Looking for talented developers for my startup projects', 'Founded 2 successful startups, need ongoing dev support', 35, ARRAY['Project Management', 'Product Strategy'], 'client', 'verified'),

('550e8400-e29b-41d4-a716-446655440003', 'client2@example.com', '$2b$10$rOgK1YsNq4R1YsNq4R1YsO1YsNq4R1YsNq4R1YsNq4R1YsNq4R1Ys', 'E-commerce business owner seeking web developers', 'Running online stores for 5+ years', 42, ARRAY['E-commerce', 'Digital Marketing'], 'client', 'pending'),

-- Freelancer users  
('550e8400-e29b-41d4-a716-446655440004', 'freelancer1@example.com', '$2b$10$rOgK1YsNq4R1YsNq4R1YsO1YsNq4R1YsNq4R1YsNq4R1YsNq4R1Ys', 'Full-stack developer with 5+ years experience in React and Node.js', 'Built 20+ web applications, specialized in modern JS frameworks', 28, ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL'], 'freelancer', 'verified'),

('550e8400-e29b-41d4-a716-446655440005', 'freelancer2@example.com', '$2b$10$rOgK1YsNq4R1YsNq4R1YsO1YsNq4R1YsNq4R1YsNq4R1YsNq4R1Ys', 'UI/UX Designer and Frontend Developer', 'Created designs for 50+ websites and mobile apps', 26, ARRAY['Figma', 'React', 'TailwindCSS', 'UI/UX Design'], 'freelancer', 'verified'),

('550e8400-e29b-41d4-a716-446655440006', 'freelancer3@example.com', '$2b$10$rOgK1YsNq4R1YsNq4R1YsO1YsNq4R1YsNq4R1YsNq4R1YsNq4R1Ys', 'Mobile app developer specializing in React Native', 'Published 10+ apps on App Store and Play Store', 24, ARRAY['React Native', 'iOS', 'Android', 'Firebase'], 'freelancer', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Insert demo projects
INSERT INTO projects (id, client_id, freelancer_id, title, description, budget, status, skills_required, deadline) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'E-commerce Website Development', 'Need a modern e-commerce website with payment integration, user authentication, and admin panel', 5000.00, 'in_progress', ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe'], NOW() + INTERVAL '30 days'),

('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'Mobile App UI Design', 'Design modern UI/UX for a food delivery mobile application', 2500.00, 'in_progress', ARRAY['Figma', 'UI/UX Design', 'Mobile Design'], NOW() + INTERVAL '20 days'),

('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', NULL, 'WordPress to React Migration', 'Migrate existing WordPress site to modern React application', 3500.00, 'open', ARRAY['React', 'WordPress', 'API Integration'], NOW() + INTERVAL '45 days'),

('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'React Native Mobile App', 'Build cross-platform mobile app for task management', 4000.00, 'completed', ARRAY['React Native', 'Firebase', 'Push Notifications'], NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Insert milestones for projects
INSERT INTO milestones (id, project_id, title, description, amount, status, due_date) VALUES
-- E-commerce project milestones
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Project Setup & Authentication', 'Set up project structure, database, and user authentication system', 1500.00, 'approved', NOW() + INTERVAL '7 days'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Product Catalog & Shopping Cart', 'Implement product listing, filtering, and shopping cart functionality', 2000.00, 'in_progress', NOW() + INTERVAL '15 days'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Payment Integration & Admin Panel', 'Integrate Stripe payments and build admin dashboard', 1500.00, 'pending', NOW() + INTERVAL '25 days'),

-- Mobile app design milestones
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'User Research & Wireframes', 'Conduct user research and create initial wireframes', 800.00, 'approved', NOW() + INTERVAL '5 days'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'High-Fidelity Designs', 'Create final UI designs and interactive prototypes', 1200.00, 'submitted', NOW() + INTERVAL '12 days'),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Design System & Handoff', 'Create design system and prepare developer handoff', 500.00, 'pending', NOW() + INTERVAL '18 days'),

-- React Native app milestones (completed project)
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440004', 'App Development & Testing', 'Complete app development with all features', 4000.00, 'paid', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Insert escrows
INSERT INTO escrows (id, milestone_id, amount, status, external_escrow_id, funded_at, released_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 1500.00, 'released', 'ESC_001', NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 2000.00, 'funded', 'ESC_002', NOW() - INTERVAL '5 days', NULL),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', 800.00, 'released', 'ESC_003', NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days'),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440005', 1200.00, 'funded', 'ESC_004', NOW() - INTERVAL '3 days', NULL),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440007', 4000.00, 'released', 'ESC_005', NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Insert transactions
INSERT INTO transactions (id, user_id, project_id, milestone_id, escrow_id, type, amount, description, status, external_transaction_id) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'escrow_fund', 1500.00, 'Funded escrow for project setup milestone', 'completed', 'TXN_001'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'escrow_release', 1425.00, 'Released escrow payment (5% platform fee deducted)', 'completed', 'TXN_002'),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 'escrow_fund', 2000.00, 'Funded escrow for shopping cart milestone', 'completed', 'TXN_003'),
('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440003', 'escrow_fund', 800.00, 'Funded escrow for user research milestone', 'completed', 'TXN_004'),
('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440003', 'escrow_release', 760.00, 'Released escrow payment (5% platform fee deducted)', 'completed', 'TXN_005')
ON CONFLICT (id) DO NOTHING;

-- Insert sample dispute
INSERT INTO disputes (id, milestone_id, raised_by, reason, status, admin_notes, auto_review_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'The submitted designs do not match the agreed requirements. Missing key screens and the color scheme is different from what was discussed.', 'open', NULL, NOW() + INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- Insert audit events
INSERT INTO audit_events (event_type, user_id, project_id, milestone_id, data) VALUES
('user_signup', '550e8400-e29b-41d4-a716-446655440002', NULL, NULL, '{"role": "client", "email": "client1@example.com"}'),
('user_signup', '550e8400-e29b-41d4-a716-446655440004', NULL, NULL, '{"role": "freelancer", "email": "freelancer1@example.com"}'),
('project_created', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', NULL, '{"title": "E-commerce Website Development", "budget": 5000}'),
('project_assigned', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', NULL, '{"freelancer_id": "550e8400-e29b-41d4-a716-446655440004"}'),
('milestone_created', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '{"title": "Project Setup & Authentication", "amount": 1500}'),
('escrow_funded', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '{"amount": 1500, "escrow_id": "880e8400-e29b-41d4-a716-446655440001"}'),
('milestone_approved', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '{"approved_at": "2024-01-15T10:00:00Z"}'),
('escrow_released', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '{"amount": 1425, "fee": 75, "escrow_id": "880e8400-e29b-41d4-a716-446655440001"}'),
('dispute_raised', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440005', '{"reason": "Designs do not match requirements", "dispute_id": "aa0e8400-e29b-41d4-a716-446655440001"}')