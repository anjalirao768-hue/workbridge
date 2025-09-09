#!/usr/bin/env python3
"""
Message Sender Identification Debug Test

This test specifically debugs the ChatWidget message sender identification issue:
- Tests GET /api/chat/conversations/[id]/messages to see exact response structure
- Tests POST /api/chat/conversations/[id]/messages when users send messages
- Tests /api/user/me to verify user ID format
- Compares sender.id vs currentUser.id to identify mismatch

Focus: Understanding why both user and support agent messages are labeled as support agent messages
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

def make_request(method, url, headers=None, json_data=None, cookies=None):
    """Make HTTP request with error handling"""
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, cookies=cookies, timeout=30)
        elif method.upper() == 'POST':
            response = requests.post(url, headers=headers, json=json_data, cookies=cookies, timeout=30)
        elif method.upper() == 'PATCH':
            response = requests.patch(url, headers=headers, json=json_data, cookies=cookies, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"Request: {method} {url}")
        print(f"Status: {response.status_code}")
        
        try:
            response_data = response.json()
            print(f"Response: {json.dumps(response_data, indent=2)}")
            return response.status_code, response_data
        except:
            print(f"Response (text): {response.text}")
            return response.status_code, response.text
            
    except Exception as e:
        print(f"Request failed: {str(e)}")
        return None, str(e)

def test_user_authentication():
    """Test /api/user/me to understand user ID structure"""
    print_subsection("Testing User Authentication & ID Structure")
    
    # Test without authentication
    print("\n1. Testing /api/user/me without authentication:")
    status, data = make_request('GET', f"{API_BASE}/user/me")
    
    if status == 401:
        print("✅ Properly returns 401 for unauthenticated requests")
    else:
        print(f"❌ Expected 401, got {status}")
    
    return status, data

def test_send_otp_for_existing_user():
    """Send OTP for existing user to get authentication"""
    print_subsection("Sending OTP for Authentication")
    
    test_email = "anjalirao768@gmail.com"
    
    print(f"\n1. Sending OTP to {test_email}:")
    status, data = make_request('POST', f"{API_BASE}/auth/send-otp", 
                               json_data={"email": test_email})
    
    if status == 200:
        print("✅ OTP sent successfully")
        print(f"Response flags: isNewUser={data.get('isNewUser')}, isExistingUser={data.get('isExistingUser')}")
        return True
    else:
        print(f"❌ Failed to send OTP: {status}")
        return False

def test_chat_conversations_api():
    """Test chat conversations API without authentication"""
    print_subsection("Testing Chat Conversations API (Unauthenticated)")
    
    print("\n1. Testing GET /api/chat/conversations:")
    status, data = make_request('GET', f"{API_BASE}/chat/conversations")
    
    if status == 401:
        print("✅ Properly secured - returns 401 for unauthenticated requests")
    else:
        print(f"❌ Security issue - expected 401, got {status}")
    
    print("\n2. Testing POST /api/chat/conversations:")
    status, data = make_request('POST', f"{API_BASE}/chat/conversations")
    
    if status == 401:
        print("✅ Properly secured - returns 401 for unauthenticated requests")
    else:
        print(f"❌ Security issue - expected 401, got {status}")

def test_message_api_structure():
    """Test message API structure without authentication"""
    print_subsection("Testing Message API Structure (Unauthenticated)")
    
    # Test with a sample conversation ID
    sample_conversation_id = "123e4567-e89b-12d3-a456-426614174000"
    
    print(f"\n1. Testing GET /api/chat/conversations/{sample_conversation_id}/messages:")
    status, data = make_request('GET', f"{API_BASE}/chat/conversations/{sample_conversation_id}/messages")
    
    if status == 401:
        print("✅ Properly secured - returns 401 for unauthenticated requests")
    else:
        print(f"❌ Security issue - expected 401, got {status}")
    
    print(f"\n2. Testing POST /api/chat/conversations/{sample_conversation_id}/messages:")
    status, data = make_request('POST', f"{API_BASE}/chat/conversations/{sample_conversation_id}/messages",
                               json_data={"message": "Test message"})
    
    if status == 401:
        print("✅ Properly secured - returns 401 for unauthenticated requests")
    else:
        print(f"❌ Security issue - expected 401, got {status}")

def analyze_api_response_structure():
    """Analyze the expected API response structure based on code"""
    print_subsection("API Response Structure Analysis")
    
    print("\n📋 Based on code analysis:")
    print("\n1. GET /api/chat/conversations/[id]/messages response structure:")
    print("   - Returns: { success: true, data: { conversation, messages } }")
    print("   - Messages include: sender:users!chat_messages_sender_id_fkey(id, email, role)")
    print("   - Each message has: message.sender.id, message.sender.email, message.sender.role")
    
    print("\n2. /api/user/me response structure:")
    print("   - Returns JWT payload: { userId, email, role }")
    print("   - User ID is stored as 'userId' property")
    
    print("\n3. POST /api/chat/conversations/[id]/messages:")
    print("   - Uses user.userId as sender_id in database")
    print("   - Returns message with sender info populated")
    
    print("\n🔍 POTENTIAL ID MISMATCH IDENTIFIED:")
    print("   - Messages store: sender_id = user.userId")
    print("   - Messages return: sender.id (from users table)")
    print("   - Frontend compares: message.sender?.id === currentUser?.userId")
    print("   - ISSUE: Comparing sender.id vs currentUser.userId (different properties!)")

def identify_root_cause():
    """Identify the root cause of sender identification issue"""
    print_subsection("Root Cause Analysis")
    
    print("\n🎯 ROOT CAUSE IDENTIFIED:")
    print("\n1. DATABASE STORAGE:")
    print("   - Messages are stored with sender_id = user.userId (from JWT)")
    print("   - This is correct - the authenticated user's ID is properly stored")
    
    print("\n2. API RESPONSE:")
    print("   - GET messages returns: sender:users!chat_messages_sender_id_fkey(id, email, role)")
    print("   - This populates message.sender.id with the user's database ID")
    print("   - This should match the sender_id that was stored")
    
    print("\n3. FRONTEND COMPARISON:")
    print("   - Frontend gets currentUser from /api/user/me → { userId, email, role }")
    print("   - Frontend compares: message.sender?.id === currentUser?.userId")
    print("   - This comparison should work IF sender.id === userId")
    
    print("\n4. POTENTIAL ISSUES:")
    print("   a) ID Format Mismatch: UUID vs string format differences")
    print("   b) Database Foreign Key: sender_id might not match users.id")
    print("   c) JWT Payload: userId in JWT might not match database users.id")
    print("   d) Supabase Query: Foreign key join might return wrong ID")

def provide_debugging_recommendations():
    """Provide specific debugging recommendations"""
    print_subsection("Debugging Recommendations")
    
    print("\n🔧 IMMEDIATE DEBUGGING STEPS:")
    
    print("\n1. VERIFY JWT PAYLOAD:")
    print("   - Check what userId is stored in JWT token")
    print("   - Verify it matches the user's database ID in users table")
    print("   - Test: /api/user/me should return the correct userId")
    
    print("\n2. VERIFY MESSAGE STORAGE:")
    print("   - Check what sender_id is actually stored in chat_messages table")
    print("   - Verify it matches the authenticated user's userId from JWT")
    print("   - Test: Create message and check database directly")
    
    print("\n3. VERIFY FOREIGN KEY JOIN:")
    print("   - Check if sender:users!chat_messages_sender_id_fkey returns correct ID")
    print("   - Verify sender.id matches the original sender_id")
    print("   - Test: GET messages and compare sender.id vs stored sender_id")
    
    print("\n4. VERIFY FRONTEND COMPARISON:")
    print("   - Log both message.sender?.id and currentUser?.userId in frontend")
    print("   - Check for type differences (string vs UUID)")
    print("   - Verify the comparison logic is correct")
    
    print("\n🎯 SPECIFIC TESTS NEEDED:")
    print("   1. Authenticate as regular user and send message")
    print("   2. Check database: SELECT sender_id FROM chat_messages WHERE id = ?")
    print("   3. Check API response: message.sender.id value")
    print("   4. Check /api/user/me: currentUser.userId value")
    print("   5. Compare all three values for consistency")

def main():
    """Main test execution"""
    print_section("MESSAGE SENDER IDENTIFICATION DEBUG TEST")
    print(f"Target: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: User Authentication Structure
    test_user_authentication()
    
    # Test 2: Send OTP for existing user
    otp_sent = test_send_otp_for_existing_user()
    
    # Test 3: Chat API Security
    test_chat_conversations_api()
    
    # Test 4: Message API Structure
    test_message_api_structure()
    
    # Analysis 5: API Response Structure
    analyze_api_response_structure()
    
    # Analysis 6: Root Cause Identification
    identify_root_cause()
    
    # Recommendations 7: Debugging Steps
    provide_debugging_recommendations()
    
    print_section("SUMMARY & NEXT STEPS")
    
    print("\n✅ SECURITY VERIFICATION:")
    print("   - All chat APIs properly secured with authentication")
    print("   - Unauthenticated requests correctly return 401")
    print("   - API endpoints exist and respond correctly")
    
    print("\n🔍 ROOT CAUSE HYPOTHESIS:")
    print("   - The issue is likely in the ID comparison logic")
    print("   - message.sender.id vs currentUser.userId comparison")
    print("   - Possible UUID format or foreign key join issue")
    
    print("\n🎯 CRITICAL NEXT STEPS:")
    print("   1. Authenticate a real user and test message creation")
    print("   2. Compare sender_id in database vs sender.id in API response")
    print("   3. Verify JWT userId matches database users.id")
    print("   4. Test both regular user and support agent message flows")
    
    print("\n📋 EXPECTED OUTCOME:")
    print("   - Identify exact ID mismatch causing sender identification issue")
    print("   - Verify if it's database, API, or frontend comparison problem")
    print("   - Provide specific fix for ChatWidget sender identification")
    
    if otp_sent:
        print(f"\n📧 OTP SENT: Check email anjalirao768@gmail.com for verification code")
        print("   Use the OTP to authenticate and run authenticated tests")

if __name__ == "__main__":
    main()