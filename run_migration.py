#!/usr/bin/env python3

import requests
import json
import os

def run_migration():
    """Run the new features migration using Supabase REST API"""
    
    supabase_url = "https://bufgalmkwblyqkkpcgxh.supabase.co"
    service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJiss3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmdhbG1rd2JseXFra3BjZ3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYxMjQ1NiwiZXhwIjoyMDcxMTg4NDU2fQ.ogTQDYlyYss7l1pMlsdIoNh4PDwGISNxjb2HZddzPJs"
    
    # Read the migration file
    with open('/app/supabase/migrations/002_add_new_features.sql', 'r') as f:
        migration_sql = f.read()
    
    print("Running new features migration...")
    print("Migration SQL:")
    print(migration_sql[:500] + "..." if len(migration_sql) > 500 else migration_sql)
    
    # Try to execute via RPC (if available)
    headers = {
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'apikey': service_key
    }
    
    # Check if users table has email_verified column
    print("\nChecking users table structure...")
    try:
        response = requests.get(
            f"{supabase_url}/rest/v1/users?select=email_verified&limit=1",
            headers=headers
        )
        print(f"Users table check status: {response.status_code}")
        if response.status_code == 200:
            print("✅ email_verified column exists")
        else:
            print(f"❌ Issue with users table: {response.text}")
    except Exception as e:
        print(f"Error checking users table: {e}")

if __name__ == "__main__":
    run_migration()