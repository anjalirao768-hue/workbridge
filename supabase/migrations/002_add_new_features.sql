-- Add new tables for OTP authentication, refund requests, and KYC verification

-- Update users table with new columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Create refund_requests table
CREATE TABLE IF NOT EXISTS refund_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL, -- Reference to project (can be external ID)
    reason TEXT NOT NULL CHECK (reason IN ('Work not delivered', 'Quality issues', 'Project cancelled', 'No longer required', 'Freelancer not responding')),
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create KYC verifications table
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL DEFAULT 'aadhaar',
    document_number TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for KYC documents
CREATE POLICY IF NOT EXISTS "Users can upload their own KYC documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'kyc-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY IF NOT EXISTS "Users can view their own KYC documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'kyc-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_created_at ON refund_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_refund_requests_updated_at 
    BEFORE UPDATE ON refund_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_kyc_verifications_updated_at 
    BEFORE UPDATE ON kyc_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();