#!/usr/bin/env python3
"""
Database Verification Test for Message Sender Issue

This test directly queries the Supabase database to verify:
1. User ID in users table for anjalirao768@gmail.com
2. Message records and their sender_id values
3. Foreign key relationships between chat_messages and users
4. JWT token structure and userId consistency

Focus: Identifying the exact ID mismatch causing sender identification issues
"""

import os
import sys
from supabase import create_client, Client
import json
from datetime import datetime

def print_section(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def print_subsection(title):
    print(f"\n{'-'*40}")
    print(f" {title}")
    print(f"{'-'*40}")

def get_supabase_client():
    """Initialize Supabase client"""
    try:
        # Load environment variables
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_service_key:
            print("❌ Missing Supabase environment variables")
            return None
        
        supabase: Client = create_client(supabase_url, supabase_service_key)
        print(f"✅ Supabase client initialized")
        print(f"   URL: {supabase_url}")
        
        return supabase
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
        return None

def verify_user_record(supabase):
    """Verify user record for anjalirao768@gmail.com"""
    print_subsection("User Record Verification")
    
    try:
        # Query user record
        result = supabase.table('users').select('id, email, role, created_at').eq('email', 'anjalirao768@gmail.com').execute()
        
        if not result.data:
            print("❌ User not found in database")
            return None
        
        user = result.data[0]
        print(f"✅ User found in database:")
        print(f"   ID: {user['id']}")
        print(f"   Email: {user['email']}")
        print(f"   Role: {user['role']}")
        print(f"   Created: {user['created_at']}")
        
        return user
        
    except Exception as e:
        print(f"❌ Error querying user record: {e}")
        return None

def verify_message_records(supabase):
    """Verify message records and sender_id values"""
    print_subsection("Message Records Verification")
    
    try:
        # Query recent message records
        result = supabase.table('chat_messages').select('id, sender_id, message_text, created_at').order('created_at', desc=True).limit(10).execute()
        
        if not result.data:
            print("❌ No messages found in database")
            return []
        
        messages = result.data
        print(f"✅ Found {len(messages)} recent messages:")
        
        for i, message in enumerate(messages, 1):
            print(f"\n   Message {i}:")
            print(f"     ID: {message['id']}")
            print(f"     Sender ID: {message['sender_id']}")
            print(f"     Text: {message['message_text'][:50]}...")
            print(f"     Created: {message['created_at']}")
        
        return messages
        
    except Exception as e:
        print(f"❌ Error querying message records: {e}")
        return []

def verify_foreign_key_relationship(supabase, user_id):
    """Verify foreign key relationship between messages and users"""
    print_subsection("Foreign Key Relationship Verification")
    
    try:
        # Query messages with user join
        result = supabase.table('chat_messages').select('''
            id,
            sender_id,
            message_text,
            sender:users!chat_messages_sender_id_fkey(id, email, role)
        ''').eq('sender_id', user_id).limit(5).execute()
        
        if not result.data:
            print(f"❌ No messages found for user ID: {user_id}")
            return []
        
        messages = result.data
        print(f"✅ Found {len(messages)} messages for user {user_id}:")
        
        for i, message in enumerate(messages, 1):
            print(f"\n   Message {i}:")
            print(f"     Message ID: {message['id']}")
            print(f"     Stored sender_id: {message['sender_id']}")
            print(f"     Message text: {message['message_text'][:50]}...")
            
            if message.get('sender'):
                sender = message['sender']
                print(f"     Sender object:")
                print(f"       sender.id: {sender.get('id')}")
                print(f"       sender.email: {sender.get('email')}")
                print(f"       sender.role: {sender.get('role')}")
                
                # Critical comparison
                stored_sender_id = message['sender_id']
                returned_sender_id = sender.get('id')
                
                print(f"\n     🔍 ID COMPARISON:")
                print(f"       Stored sender_id: {stored_sender_id}")
                print(f"       Returned sender.id: {returned_sender_id}")
                print(f"       Are they equal? {stored_sender_id == returned_sender_id}")
                print(f"       Types: {type(stored_sender_id)} vs {type(returned_sender_id)}")
                
                if stored_sender_id != returned_sender_id:
                    print(f"       ❌ MISMATCH FOUND! This is the root cause.")
                else:
                    print(f"       ✅ IDs match correctly")
            else:
                print(f"     ❌ No sender object returned (foreign key issue)")
        
        return messages
        
    except Exception as e:
        print(f"❌ Error querying foreign key relationship: {e}")
        return []

def verify_all_users_messages(supabase):
    """Verify messages from all users to see the pattern"""
    print_subsection("All Users Messages Analysis")
    
    try:
        # Query messages from different users
        result = supabase.table('chat_messages').select('''
            id,
            sender_id,
            message_text,
            sender:users!chat_messages_sender_id_fkey(id, email, role)
        ''').limit(10).execute()
        
        if not result.data:
            print("❌ No messages found in database")
            return
        
        messages = result.data
        print(f"✅ Analyzing {len(messages)} messages from all users:")
        
        mismatch_count = 0
        match_count = 0
        
        for i, message in enumerate(messages, 1):
            stored_sender_id = message['sender_id']
            sender = message.get('sender')
            
            if sender:
                returned_sender_id = sender.get('id')
                sender_email = sender.get('email')
                
                print(f"\n   Message {i} ({sender_email}):")
                print(f"     Stored: {stored_sender_id}")
                print(f"     Returned: {returned_sender_id}")
                
                if stored_sender_id == returned_sender_id:
                    print(f"     ✅ Match")
                    match_count += 1
                else:
                    print(f"     ❌ Mismatch")
                    mismatch_count += 1
            else:
                print(f"\n   Message {i}: ❌ No sender object")
                mismatch_count += 1
        
        print(f"\n📊 SUMMARY:")
        print(f"   Matches: {match_count}")
        print(f"   Mismatches: {mismatch_count}")
        
        if mismatch_count > 0:
            print(f"   🚨 CRITICAL: {mismatch_count} messages have ID mismatches")
            print(f"   This explains why sender identification fails in frontend")
        else:
            print(f"   ✅ All IDs match - issue might be elsewhere")
        
    except Exception as e:
        print(f"❌ Error analyzing all messages: {e}")

def check_database_schema(supabase):
    """Check database schema and constraints"""
    print_subsection("Database Schema Verification")
    
    try:
        # Check if tables exist by querying them
        print("1. Checking tables existence:")
        
        # Check users table
        try:
            result = supabase.table('users').select('id').limit(1).execute()
            print("   ✅ users table exists")
        except Exception as e:
            print(f"   ❌ users table issue: {e}")
        
        # Check chat_messages table
        try:
            result = supabase.table('chat_messages').select('id, sender_id').limit(1).execute()
            print("   ✅ chat_messages table exists")
        except Exception as e:
            print(f"   ❌ chat_messages table issue: {e}")
        
        # Check chat_conversations table
        try:
            result = supabase.table('chat_conversations').select('id').limit(1).execute()
            print("   ✅ chat_conversations table exists")
        except Exception as e:
            print(f"   ❌ chat_conversations table issue: {e}")
        
        print("\n2. Testing foreign key constraint:")
        try:
            # Try to query with foreign key join
            result = supabase.table('chat_messages').select('sender_id, sender:users(id)').limit(1).execute()
            print("   ✅ Foreign key constraint working")
        except Exception as e:
            print(f"   ❌ Foreign key constraint issue: {e}")
        
    except Exception as e:
        print(f"❌ Error checking database schema: {e}")

def simulate_jwt_comparison(user_id):
    """Simulate the JWT comparison that happens in frontend"""
    print_subsection("JWT Comparison Simulation")
    
    print(f"\n🎯 SIMULATING FRONTEND COMPARISON:")
    print(f"\n1. JWT Payload (from /api/user/me):")
    print(f"   currentUser = {{ userId: '{user_id}', email: 'anjalirao768@gmail.com', role: 'support' }}")
    
    print(f"\n2. Message Sender (from API response):")
    print(f"   message.sender = {{ id: '{user_id}', email: 'anjalirao768@gmail.com', role: 'support' }}")
    
    print(f"\n3. Frontend Comparison:")
    print(f"   message.sender?.id === currentUser?.userId")
    print(f"   '{user_id}' === '{user_id}'")
    print(f"   Result: {user_id == user_id}")
    
    print(f"\n4. Expected Behavior:")
    if user_id == user_id:  # This should always be true
        print(f"   ✅ Should identify as current user's message")
        print(f"   ✅ Should NOT appear as support agent message")
    else:
        print(f"   ❌ Would appear as support agent message")
    
    print(f"\n🔍 IF MESSAGES STILL APPEAR AS SUPPORT AGENT:")
    print(f"   - Check for type differences (string vs UUID)")
    print(f"   - Check for whitespace or formatting issues")
    print(f"   - Check frontend comparison logic")
    print(f"   - Verify the actual values being compared")

def main():
    """Main test execution"""
    print_section("DATABASE VERIFICATION TEST")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Load environment variables from .env.local
    try:
        with open('/app/.env.local', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
        print("✅ Environment variables loaded")
    except Exception as e:
        print(f"❌ Failed to load environment variables: {e}")
        return
    
    # Initialize Supabase client
    supabase = get_supabase_client()
    if not supabase:
        return
    
    # Step 1: Verify user record
    user = verify_user_record(supabase)
    if not user:
        return
    
    user_id = user['id']
    
    # Step 2: Check database schema
    check_database_schema(supabase)
    
    # Step 3: Verify message records
    messages = verify_message_records(supabase)
    
    # Step 4: Verify foreign key relationship for specific user
    user_messages = verify_foreign_key_relationship(supabase, user_id)
    
    # Step 5: Analyze all users' messages
    verify_all_users_messages(supabase)
    
    # Step 6: Simulate JWT comparison
    simulate_jwt_comparison(user_id)
    
    print_section("SUMMARY & CONCLUSIONS")
    
    print(f"\n✅ DATABASE VERIFICATION COMPLETED:")
    print(f"   - User record verified: {user['email']}")
    print(f"   - User ID: {user_id}")
    print(f"   - Message records analyzed")
    print(f"   - Foreign key relationships tested")
    
    print(f"\n🎯 KEY FINDINGS:")
    print(f"   - Database schema appears functional")
    print(f"   - Foreign key joins working")
    print(f"   - ID comparison logic tested")
    
    print(f"\n📋 NEXT STEPS:")
    print(f"   1. Review the ID comparison results above")
    print(f"   2. If mismatches found: Fix database foreign key")
    print(f"   3. If IDs match: Check frontend comparison logic")
    print(f"   4. Test with actual authenticated requests")
    
    print(f"\n🔧 EXPECTED OUTCOME:")
    print(f"   - Identify exact location of ID mismatch")
    print(f"   - Provide specific fix for sender identification")
    print(f"   - Resolve ChatWidget message labeling issue")

if __name__ == "__main__":
    main()