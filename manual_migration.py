#!/usr/bin/env python3

import requests
import json

def run_sql_via_api(sql_command):
    """Execute SQL via Supabase REST API"""
    
    supabase_url = "https://bufgalmkwblyqkkpcgxh.supabase.co"
    service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmdhbG1rd2JseXFra3BjZ3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYxMjQ1NiwiZXhwIjoyMDcxMTg4NDU2fQ.ogTQDYlyYss7l1pMlsdIoNh4PDwGISNxjb2HZddzPJs"
    
    headers = {
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'apikey': service_key
    }
    
    # Try to execute via RPC (if available)
    try:
        response = requests.post(
            f"{supabase_url}/rest/v1/rpc/exec_sql",
            json={"sql": sql_command},
            headers=headers
        )
        
        print(f"SQL execution status: {response.status_code}")
        print(f"Response: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error executing SQL: {e}")
        return False

def create_otp_table_manually():
    """Create OTP table by inserting a dummy record and letting Supabase infer schema"""
    
    supabase_url = "https://bufgalmkwblyqkkpcgxh.supabase.co"
    service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmdhbG1rd2JseXFra3BjZ3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYxMjQ1NiwiZXhwIjoyMDcxMTg4NDU2fQ.ogTQDYlyYss7l1pMlsdIoNh4PDwGISNxjb2HZddzPJs"
    
    headers = {
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'apikey': service_key,
        'Prefer': 'return=minimal'
    }
    
    print("🔧 Attempting to create otp_codes table manually...")
    
    # Since we can't execute raw SQL, let's check if we can access the Supabase dashboard
    # or use a different approach
    
    # Let's try to check what tables exist
    try:
        # Try to access a non-existent table to see the error format
        response = requests.get(
            f"{supabase_url}/rest/v1/otp_codes?select=*&limit=1",
            headers=headers
        )
        
        print(f"otp_codes table check: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 404:
            print("❌ otp_codes table does not exist")
            print("📝 You need to create the table manually in Supabase dashboard")
            print("   or run the migration SQL directly in the SQL editor")
            return False
        elif response.status_code == 200:
            print("✅ otp_codes table exists!")
            return True
        else:
            print(f"⚠️ Unexpected response: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error checking table: {e}")
        return False

def check_users_table():
    """Check if users table has email_verified column"""
    
    supabase_url = "https://bufgalmkwblyqkkpcgxh.supabase.co"
    service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmdhbG1rd2JseXFra3BjZ3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYxMjQ1NiwiZXhwIjoyMDcxMTg4NDU2fQ.ogTQDYlyYss7l1pMlsdIoNh4PDwGISNxjb2HZddzPJs"
    
    headers = {
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'apikey': service_key
    }
    
    try:
        response = requests.get(
            f"{supabase_url}/rest/v1/users?select=id,email,email_verified&limit=1",
            headers=headers
        )
        
        print(f"users table check: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ users table has email_verified column")
            return True
        elif "email_verified does not exist" in response.text:
            print("❌ users table missing email_verified column")
            return False
        else:
            print(f"⚠️ Unexpected response: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error checking users table: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Manual Migration for OTP System...")
    print("=" * 50)
    
    print("\n1. Checking users table...")
    users_ok = check_users_table()
    
    print("\n2. Checking otp_codes table...")
    otp_ok = create_otp_table_manually()
    
    if users_ok and otp_ok:
        print("\n✅ Database schema is ready for OTP system")
    else:
        print("\n❌ Database schema needs manual setup")
        print("\nTo fix this, go to your Supabase dashboard and run:")
        print("1. ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;")
        print("2. CREATE TABLE IF NOT EXISTS otp_codes (")
        print("     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,")
        print("     email TEXT NOT NULL UNIQUE,")
        print("     otp TEXT NOT NULL,")
        print("     expires_at TIMESTAMP WITH TIME ZONE NOT NULL,")
        print("     attempts INTEGER DEFAULT 0,")
        print("     max_attempts INTEGER DEFAULT 3,")
        print("     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
        print("   );")
        print("3. CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);")
        print("4. CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);")