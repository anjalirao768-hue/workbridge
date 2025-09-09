#!/usr/bin/env python3
"""
Check Chat Conversations Schema
==============================

This script checks the actual schema of the chat_conversations table
to see what columns exist and what's missing for closure functionality.
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

def check_schema():
    """Check the chat_conversations table schema"""
    if not load_env():
        return
    
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        return
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        
        print("🔍 Checking chat_conversations table schema...")
        
        # Get a sample conversation to see the actual columns
        response = supabase.table('chat_conversations').select('*').limit(1).execute()
        
        if response.data:
            conversation = response.data[0]
            print("\n✅ Current columns in chat_conversations table:")
            
            for column, value in conversation.items():
                print(f"  ✓ {column}: {type(value).__name__} = {value}")
            
            # Check for missing closure columns
            required_columns = ['closed_by', 'closure_note', 'closed_at', 'resolution_time_minutes']
            missing_columns = []
            
            print(f"\n🔍 Checking for required closure columns:")
            for column in required_columns:
                if column in conversation:
                    print(f"  ✅ {column}: EXISTS")
                else:
                    print(f"  ❌ {column}: MISSING")
                    missing_columns.append(column)
            
            if missing_columns:
                print(f"\n🚨 MISSING COLUMNS FOUND: {missing_columns}")
                print("\nRequired SQL to add missing columns:")
                print("```sql")
                
                for column in missing_columns:
                    if column == 'closed_by':
                        print(f"ALTER TABLE chat_conversations ADD COLUMN {column} UUID REFERENCES users(id);")
                    elif column == 'closure_note':
                        print(f"ALTER TABLE chat_conversations ADD COLUMN {column} TEXT;")
                    elif column == 'closed_at':
                        print(f"ALTER TABLE chat_conversations ADD COLUMN {column} TIMESTAMP WITH TIME ZONE;")
                    elif column == 'resolution_time_minutes':
                        print(f"ALTER TABLE chat_conversations ADD COLUMN {column} INTEGER;")
                
                print("```")
            else:
                print("\n✅ All required closure columns exist!")
        
        else:
            print("❌ No conversations found to check schema")
            
            # Try to create a test conversation to see what columns are available
            print("\n🔍 Attempting to create test conversation to check available columns...")
            
            test_response = supabase.table('chat_conversations').insert({
                'user_id': '00000000-0000-0000-0000-000000000000',  # Dummy UUID
                'status': 'waiting',
                'title': 'Schema Test'
            }).execute()
            
            if test_response.data:
                print("✅ Test conversation created, checking columns...")
                test_conv = test_response.data[0]
                
                for column, value in test_conv.items():
                    print(f"  ✓ {column}: {type(value).__name__}")
                
                # Clean up test conversation
                supabase.table('chat_conversations').delete().eq('id', test_conv['id']).execute()
                print("🧹 Test conversation cleaned up")
            
    except Exception as e:
        print(f"❌ Schema check failed: {e}")

if __name__ == "__main__":
    check_schema()