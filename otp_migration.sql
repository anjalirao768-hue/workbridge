
-- WorkBridge OTP System Database Migration
-- Run this in your Supabase SQL Editor

-- 1. Add email_verified column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- 2. Create otp_codes table for persistent OTP storage
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- 4. Verify the tables exist
SELECT 'users table' as table_name, COUNT(*) as exists FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'email_verified'
UNION ALL
SELECT 'otp_codes table' as table_name, COUNT(*) as exists FROM information_schema.tables 
WHERE table_name = 'otp_codes';
