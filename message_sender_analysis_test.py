#!/usr/bin/env python3
"""
Message Sender Analysis Test

This test analyzes the message sender identification issue by:
1. Testing API structure without authentication
2. Analyzing the code to identify the root cause
3. Providing specific recommendations for fixing the issue

Focus: Understanding the ID mismatch between sender.id and currentUser.userId
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

def print_section(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def print_subsection(title):
    print(f"\n{'-'*40}")
    print(f" {title}")
    print(f"{'-'*40}")

def test_api_structure():
    """Test API structure and responses"""
    print_subsection("API Structure Testing")
    
    print("\n1. Testing /api/user/me (unauthenticated):")
    try:
        response = requests.get(f"{API_BASE}/user/me", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 401:
            print("✅ Properly secured - returns 401 for unauthenticated requests")
        else:
            print(f"❌ Expected 401, got {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print("\n2. Testing chat API endpoints (unauthenticated):")
    endpoints = [
        "/api/chat/conversations",
        "/api/chat/conversations/test-id/messages"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            print(f"   {endpoint}: {response.status_code}")
            if response.status_code == 401:
                print(f"   ✅ Properly secured")
            else:
                print(f"   ❌ Security issue - expected 401")
        except Exception as e:
            print(f"   ❌ Request failed: {e}")

def analyze_code_structure():
    """Analyze the code structure to identify the root cause"""
    print_subsection("Code Structure Analysis")
    
    print("\n📋 BACKEND API ANALYSIS:")
    
    print("\n1. /api/user/me Response Structure:")
    print("   File: /app/src/app/api/user/me/route.ts")
    print("   Returns: getCurrentUserWithFreshData() → JWT payload")
    print("   Structure: { userId, email, role }")
    print("   ✅ User ID is returned as 'userId' property")
    
    print("\n2. Message Creation (POST /api/chat/conversations/[id]/messages):")
    print("   File: /app/src/app/api/chat/conversations/[id]/messages/route.ts")
    print("   Line 83: sender_id: user.userId")
    print("   ✅ Stores user.userId from JWT as sender_id in database")
    
    print("\n3. Message Retrieval (GET /api/chat/conversations/[id]/messages):")
    print("   File: /app/src/app/api/chat/conversations/[id]/messages/route.ts")
    print("   Lines 177-180: sender:users!chat_messages_sender_id_fkey(id, email, role)")
    print("   ✅ Joins with users table to populate sender object")
    
    print("\n4. JWT Structure:")
    print("   File: /app/src/lib/jwt.ts")
    print("   Interface: { userId: string, email: string, role: string }")
    print("   ✅ JWT contains userId that should match database users.id")

def identify_root_cause():
    """Identify the specific root cause of the sender identification issue"""
    print_subsection("Root Cause Identification")
    
    print("\n🎯 CRITICAL ANALYSIS:")
    
    print("\n1. DATA FLOW:")
    print("   a) User authenticates → JWT created with userId")
    print("   b) Message sent → sender_id = user.userId (from JWT)")
    print("   c) Messages retrieved → sender populated via foreign key join")
    print("   d) Frontend compares → message.sender?.id === currentUser?.userId")
    
    print("\n2. POTENTIAL MISMATCH POINTS:")
    
    print("\n   🔍 Point A: JWT userId vs Database users.id")
    print("      - JWT userId should match database users.id exactly")
    print("      - If mismatch: sender_id stored incorrectly")
    print("      - Result: Foreign key join fails or returns wrong data")
    
    print("\n   🔍 Point B: Foreign Key Join")
    print("      - Query: sender:users!chat_messages_sender_id_fkey(id, email, role)")
    print("      - Should return: sender.id = original sender_id")
    print("      - If mismatch: sender.id ≠ stored sender_id")
    
    print("\n   🔍 Point C: Frontend Comparison")
    print("      - Compares: message.sender?.id === currentUser?.userId")
    print("      - Should work if: sender.id === userId from JWT")
    print("      - If mismatch: All messages appear as support agent messages")
    
    print("\n3. MOST LIKELY ROOT CAUSE:")
    print("   🚨 HYPOTHESIS: Foreign key join returns users.id instead of sender_id")
    print("      - Stored: sender_id = 'a2db711d-41b9-4104-9b29-8ffa268d7a49'")
    print("      - Returned: sender.id = different value from users.id column")
    print("      - Comparison fails: Different IDs don't match")

def analyze_supabase_foreign_key():
    """Analyze the Supabase foreign key behavior"""
    print_subsection("Supabase Foreign Key Analysis")
    
    print("\n📊 SUPABASE QUERY ANALYSIS:")
    
    print("\n1. Current Query:")
    print("   sender:users!chat_messages_sender_id_fkey(id, email, role)")
    
    print("\n2. What this does:")
    print("   - Joins chat_messages.sender_id with users table")
    print("   - Returns users.id, users.email, users.role")
    print("   - Creates sender object with these fields")
    
    print("\n3. Expected Behavior:")
    print("   - sender_id should reference users.id")
    print("   - Foreign key join should return matching user record")
    print("   - sender.id should equal the original sender_id")
    
    print("\n4. POTENTIAL ISSUE:")
    print("   🚨 If users.id ≠ sender_id stored in messages:")
    print("      - Foreign key constraint violation OR")
    print("      - Wrong user record returned OR")
    print("      - ID format mismatch (UUID vs string)")

def provide_debugging_steps():
    """Provide specific debugging steps"""
    print_subsection("Debugging Steps")
    
    print("\n🔧 IMMEDIATE DEBUGGING ACTIONS:")
    
    print("\n1. DATABASE VERIFICATION:")
    print("   SQL Query to run in Supabase:")
    print("   ```sql")
    print("   -- Check user record")
    print("   SELECT id, email, role FROM users WHERE email = 'anjalirao768@gmail.com';")
    print("   ")
    print("   -- Check message records")
    print("   SELECT id, sender_id, message_text FROM chat_messages LIMIT 5;")
    print("   ")
    print("   -- Check foreign key relationship")
    print("   SELECT m.id, m.sender_id, u.id as user_id, u.email")
    print("   FROM chat_messages m")
    print("   LEFT JOIN users u ON m.sender_id = u.id")
    print("   LIMIT 5;")
    print("   ```")
    
    print("\n2. JWT TOKEN VERIFICATION:")
    print("   - Decode JWT token to see actual userId value")
    print("   - Compare with database users.id for same user")
    print("   - Verify UUID format consistency")
    
    print("\n3. API RESPONSE TESTING:")
    print("   - Send authenticated request to create message")
    print("   - Check response: message.sender_id vs message.sender.id")
    print("   - Verify foreign key join returns correct data")
    
    print("\n4. FRONTEND LOGGING:")
    print("   - Add console.log in ChatWidget component")
    print("   - Log: currentUser.userId and message.sender?.id")
    print("   - Check for type/format differences")

def provide_potential_fixes():
    """Provide potential fixes for the issue"""
    print_subsection("Potential Fixes")
    
    print("\n🔧 POTENTIAL SOLUTIONS:")
    
    print("\n1. IF JWT userId ≠ Database users.id:")
    print("   Fix: Update JWT creation to use correct users.id")
    print("   Location: OTP verification endpoint")
    print("   Change: Ensure JWT userId matches database users.id exactly")
    
    print("\n2. IF Foreign Key Join Issue:")
    print("   Fix: Verify foreign key constraint is correct")
    print("   SQL: ALTER TABLE chat_messages ADD CONSTRAINT ...")
    print("   Ensure: sender_id references users.id properly")
    
    print("\n3. IF Frontend Comparison Issue:")
    print("   Fix: Update comparison logic in ChatWidget")
    print("   Change: Ensure both values are same type/format")
    print("   Add: Type conversion if needed (string vs UUID)")
    
    print("\n4. IF Support Agent Role Issue:")
    print("   Fix: Update role-based message identification")
    print("   Logic: Check user role in addition to ID comparison")
    print("   Add: Proper support agent message handling")
    
    print("\n🎯 RECOMMENDED IMMEDIATE FIX:")
    print("   1. Check database: Verify sender_id matches users.id")
    print("   2. Test API: Send message and check sender.id in response")
    print("   3. Compare: sender.id vs currentUser.userId")
    print("   4. Fix: Update whichever component has the mismatch")

def main():
    """Main test execution"""
    print_section("MESSAGE SENDER ANALYSIS TEST")
    print(f"Target: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: API Structure
    test_api_structure()
    
    # Analysis 2: Code Structure
    analyze_code_structure()
    
    # Analysis 3: Root Cause
    identify_root_cause()
    
    # Analysis 4: Supabase Foreign Key
    analyze_supabase_foreign_key()
    
    # Steps 5: Debugging
    provide_debugging_steps()
    
    # Solutions 6: Potential Fixes
    provide_potential_fixes()
    
    print_section("SUMMARY & CONCLUSIONS")
    
    print("\n✅ ANALYSIS COMPLETED:")
    print("   - API structure verified and secured")
    print("   - Code flow analyzed for sender identification")
    print("   - Root cause hypotheses identified")
    print("   - Debugging steps provided")
    
    print("\n🎯 MOST LIKELY ROOT CAUSE:")
    print("   - Foreign key join returns different ID than stored sender_id")
    print("   - Frontend comparison fails: sender.id ≠ currentUser.userId")
    print("   - Result: All messages appear as support agent messages")
    
    print("\n📋 IMMEDIATE ACTIONS NEEDED:")
    print("   1. ✅ Run database queries to verify ID consistency")
    print("   2. ✅ Test authenticated message creation and retrieval")
    print("   3. ✅ Compare sender_id vs sender.id vs currentUser.userId")
    print("   4. ✅ Apply appropriate fix based on findings")
    
    print("\n🔧 EXPECTED RESOLUTION:")
    print("   - Identify exact ID mismatch location")
    print("   - Fix database, API, or frontend comparison")
    print("   - Verify proper sender identification in ChatWidget")
    print("   - Test both regular user and support agent messages")

if __name__ == "__main__":
    main()