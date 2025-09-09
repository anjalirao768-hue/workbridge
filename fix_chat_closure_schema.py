#!/usr/bin/env python3
"""
Fix Chat Closure Schema
=======================

This script adds the missing columns to the chat_conversations table
to support the chat closure functionality.
"""

import os
from supabase import create_client, Client

def load_env():
    """Load environment variables"""
    try:
        with open('/app/.env.local', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
        return True
    except Exception as e:
        print(f"❌ Failed to load environment: {e}")
        return False

def fix_schema():
    """Add missing columns to chat_conversations table"""
    if not load_env():
        return False
    
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or supabase_key:
        print("❌ Missing Supabase credentials")
        return False
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        
        print("🔧 Adding missing columns to chat_conversations table...")
        
        # SQL commands to add missing columns
        sql_commands = [
            "ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES users(id);",
            "ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS closure_note TEXT;", 
            "ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS resolution_time_minutes INTEGER;"
        ]
        
        for i, sql in enumerate(sql_commands, 1):
            print(f"\n📝 Executing SQL {i}/3:")
            print(f"   {sql}")
            
            try:
                result = supabase.rpc('exec_sql', {'sql': sql}).execute()
                print(f"   ✅ Success")
            except Exception as e:
                print(f"   ❌ Failed: {e}")
                # Try alternative approach using direct SQL execution
                try:
                    # For Supabase, we need to use the SQL editor or direct database access
                    print(f"   ⚠️ Direct SQL execution not available via Python client")
                    print(f"   💡 Please run this SQL manually in Supabase SQL Editor:")
                    print(f"      {sql}")
                except Exception as e2:
                    print(f"   ❌ Alternative approach failed: {e2}")
        
        print(f"\n🎯 MANUAL MIGRATION REQUIRED")
        print(f"Please run the following SQL in your Supabase SQL Editor:")
        print(f"")
        print(f"-- Add missing columns for chat closure functionality")
        for sql in sql_commands:
            print(f"{sql}")
        
        print(f"\n-- Optional: Add trigger for automatic resolution time calculation")
        print(f"""
CREATE OR REPLACE FUNCTION calculate_resolution_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
        NEW.closed_at = NOW();
        NEW.resolution_time_minutes = EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_closure_trigger
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION calculate_resolution_time();
""")
        
        return True
        
    except Exception as e:
        print(f"❌ Schema fix failed: {e}")
        return False

def verify_fix():
    """Verify that the columns were added successfully"""
    if not load_env():
        return False
    
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        
        print("\n🔍 Verifying schema fix...")
        
        # Try to select with the new columns
        response = supabase.table('chat_conversations').select('id, closed_by, closure_note, resolution_time_minutes').limit(1).execute()
        
        if response.data is not None:  # Even empty array means columns exist
            print("✅ Schema fix successful! All closure columns are now available.")
            return True
        else:
            print("❌ Schema fix verification failed")
            return False
            
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        print("This likely means the columns still need to be added manually")
        return False

if __name__ == "__main__":
    print("🔧 Chat Closure Schema Fix")
    print("=" * 40)
    
    success = fix_schema()
    
    if success:
        print("\n" + "=" * 40)
        print("✅ Migration script completed")
        print("Please run the SQL commands manually in Supabase SQL Editor")
        print("Then run this script again to verify the fix")
    else:
        print("\n❌ Migration script failed")