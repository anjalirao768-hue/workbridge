-- Chat Closure System Enhancement
-- This migration adds the complete chat lifecycle management

-- Update chat_conversations table to support closure functionality
ALTER TABLE chat_conversations 
ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS closure_note TEXT,
ADD COLUMN IF NOT EXISTS resolution_time_minutes INTEGER;

-- Update status enum to include proper lifecycle states
ALTER TABLE chat_conversations 
DROP CONSTRAINT IF EXISTS chat_conversations_status_check;

ALTER TABLE chat_conversations 
ADD CONSTRAINT chat_conversations_status_check 
CHECK (status IN ('waiting', 'assigned', 'active', 'closed'));

-- Update default status to 'waiting' for new conversations
ALTER TABLE chat_conversations 
ALTER COLUMN status SET DEFAULT 'waiting';

-- Create index for closed_by for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_conversations_closed_by ON chat_conversations(closed_by);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_closed_at ON chat_conversations(closed_at);

-- Create function to calculate resolution time when closing
CREATE OR REPLACE FUNCTION calculate_resolution_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Only calculate resolution time when status changes to 'closed'
    IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
        NEW.closed_at = NOW();
        NEW.resolution_time_minutes = EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 60;
    END IF;
    
    -- Auto-assign support agent when they first respond
    IF NEW.support_agent_id IS NOT NULL AND OLD.support_agent_id IS NULL THEN
        NEW.status = 'assigned';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic resolution time calculation
DROP TRIGGER IF EXISTS chat_closure_trigger ON chat_conversations;
CREATE TRIGGER chat_closure_trigger
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION calculate_resolution_time();

-- Add notification preferences table for future use
CREATE TABLE IF NOT EXISTS chat_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('chat_closed', 'new_message', 'agent_assigned')),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_id ON chat_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_conversation_id ON chat_notifications(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_is_read ON chat_notifications(is_read);

-- Insert some sample closure reasons for dropdown (optional)
CREATE TABLE IF NOT EXISTS chat_closure_reasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reason TEXT NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default closure reasons
INSERT INTO chat_closure_reasons (reason, display_order) VALUES
('Issue resolved', 1),
('Question answered', 2),
('Request completed', 3),
('Duplicate ticket', 4),
('User not responding', 5),
('Escalated to technical team', 6),
('No further action required', 7)
ON CONFLICT (reason) DO NOTHING;

-- Create view for chat analytics (future-proofing)
CREATE OR REPLACE VIEW chat_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    status,
    COUNT(*) as ticket_count,
    AVG(resolution_time_minutes) as avg_resolution_time,
    MAX(resolution_time_minutes) as max_resolution_time,
    MIN(resolution_time_minutes) as min_resolution_time
FROM chat_conversations 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), status
ORDER BY date DESC, status;