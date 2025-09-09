-- SQL script to assign support role to anjalirao768@gmail.com
-- Run this in your Supabase SQL editor

-- Update the user role to 'support'
UPDATE users 
SET role = 'support' 
WHERE email = 'anjalirao768@gmail.com';

-- Verify the update
SELECT id, email, role, created_at 
FROM users 
WHERE email = 'anjalirao768@gmail.com';

-- Optional: Also verify email is verified
UPDATE users 
SET email_verified = true 
WHERE email = 'anjalirao768@gmail.com' AND email_verified = false;