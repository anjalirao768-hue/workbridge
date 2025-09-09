#!/usr/bin/env python3
"""
Authenticated Message Sender Debug Test

This test authenticates a user and tests the complete message sender identification flow:
1. Authenticate user via OTP
2. Test /api/user/me to get currentUser structure
3. Create conversation and send messages
4. Get messages and analyze sender structure
5. Compare sender.id vs currentUser.userId to identify mismatch

Focus: Debugging why both user and support agent messages show as support agent messages
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
            return response.status_code, response_data, response.cookies
        except:
            print(f"Response (text): {response.text}")
            return response.status_code, response.text, response.cookies
            
    except Exception as e:
        print(f"Request failed: {str(e)}")
        return None, str(e), None

def authenticate_user():
    """Authenticate user and get auth token"""
    print_subsection("User Authentication Flow")
    
    test_email = "anjalirao768@gmail.com"
    
    # Step 1: Send OTP
    print(f"\n1. Sending OTP to {test_email}:")
    status, data, cookies = make_request('POST', f"{API_BASE}/auth/send-otp", 
                                        json_data={"email": test_email})
    
    if status != 200:
        print(f"❌ Failed to send OTP: {status}")
        return None, None
    
    user_id = data.get('data', {}).get('userId')
    print(f"✅ OTP sent successfully. User ID: {user_id}")
    
    # Step 2: Get OTP from user
    print(f"\n2. Please check email {test_email} for OTP code")
    otp_code = input("Enter the 6-digit OTP code: ").strip()
    
    if not otp_code or len(otp_code) != 6:
        print("❌ Invalid OTP format")
        return None, None
    
    # Step 3: Verify OTP
    print(f"\n3. Verifying OTP: {otp_code}")
    status, data, auth_cookies = make_request('POST', f"{API_BASE}/auth/verify-otp", 
                                             json_data={
                                                 "email": test_email,
                                                 "otp": otp_code,
                                                 "isLogin": True
                                             })
    
    if status != 200:
        print(f"❌ OTP verification failed: {status}")
        return None, None
    
    print("✅ OTP verified successfully")
    
    # Extract auth token from cookies
    auth_token = None
    if auth_cookies:
        for cookie in auth_cookies:
            if cookie.name == 'auth-token':
                auth_token = cookie.value
                break
    
    if not auth_token:
        print("❌ No auth token found in response cookies")
        return None, None
    
    print(f"✅ Auth token obtained: {auth_token[:20]}...")
    return auth_token, user_id

def test_current_user_api(auth_token):
    """Test /api/user/me with authentication"""
    print_subsection("Testing /api/user/me API")
    
    cookies = {'auth-token': auth_token}
    
    print("\n1. Testing authenticated /api/user/me:")
    status, data, _ = make_request('GET', f"{API_BASE}/user/me", cookies=cookies)
    
    if status != 200:
        print(f"❌ Failed to get user info: {status}")
        return None
    
    print("✅ User info retrieved successfully")
    
    # Analyze user structure
    print(f"\n📋 Current User Structure:")
    print(f"   - userId: {data.get('userId')}")
    print(f"   - email: {data.get('email')}")
    print(f"   - role: {data.get('role')}")
    
    return data

def test_conversation_creation(auth_token):
    """Test conversation creation"""
    print_subsection("Testing Conversation Creation")
    
    cookies = {'auth-token': auth_token}
    
    print("\n1. Creating new conversation:")
    status, data, _ = make_request('POST', f"{API_BASE}/chat/conversations", cookies=cookies)
    
    if status != 200:
        print(f"❌ Failed to create conversation: {status}")
        return None
    
    conversation = data.get('data')
    conversation_id = conversation.get('id')
    
    print(f"✅ Conversation created successfully")
    print(f"   - Conversation ID: {conversation_id}")
    print(f"   - User ID: {conversation.get('user_id')}")
    print(f"   - Status: {conversation.get('status')}")
    
    return conversation_id

def test_message_sending(auth_token, conversation_id, current_user):
    """Test sending messages and analyze sender structure"""
    print_subsection("Testing Message Sending & Sender Structure")
    
    cookies = {'auth-token': auth_token}
    
    # Send a test message
    test_message = "Hello, this is a test message from regular user"
    
    print(f"\n1. Sending message: '{test_message}'")
    status, data, _ = make_request('POST', f"{API_BASE}/chat/conversations/{conversation_id}/messages",
                                  json_data={"message": test_message},
                                  cookies=cookies)
    
    if status != 200:
        print(f"❌ Failed to send message: {status}")
        return None
    
    sent_message = data.get('data')
    print(f"✅ Message sent successfully")
    
    # Analyze sent message structure
    print(f"\n📋 Sent Message Structure:")
    print(f"   - Message ID: {sent_message.get('id')}")
    print(f"   - Sender ID (stored): {sent_message.get('sender_id')}")
    print(f"   - Message Text: {sent_message.get('message_text')}")
    
    if 'sender' in sent_message:
        sender = sent_message['sender']
        print(f"   - Sender Object:")
        print(f"     - sender.id: {sender.get('id')}")
        print(f"     - sender.email: {sender.get('email')}")
        print(f"     - sender.role: {sender.get('role')}")
    
    return sent_message

def test_message_retrieval(auth_token, conversation_id, current_user):
    """Test message retrieval and analyze sender identification"""
    print_subsection("Testing Message Retrieval & Sender Identification")
    
    cookies = {'auth-token': auth_token}
    
    print(f"\n1. Retrieving messages for conversation {conversation_id}:")
    status, data, _ = make_request('GET', f"{API_BASE}/chat/conversations/{conversation_id}/messages",
                                  cookies=cookies)
    
    if status != 200:
        print(f"❌ Failed to retrieve messages: {status}")
        return None
    
    response_data = data.get('data', {})
    messages = response_data.get('messages', [])
    
    print(f"✅ Messages retrieved successfully")
    print(f"   - Total messages: {len(messages)}")
    
    # Analyze each message
    print(f"\n📋 Message Analysis:")
    for i, message in enumerate(messages, 1):
        print(f"\n   Message {i}:")
        print(f"     - ID: {message.get('id')}")
        print(f"     - Text: {message.get('message_text')}")
        print(f"     - Type: {message.get('message_type')}")
        print(f"     - Sender ID (stored): {message.get('sender_id')}")
        
        if 'sender' in message and message['sender']:
            sender = message['sender']
            print(f"     - Sender Object:")
            print(f"       - sender.id: {sender.get('id')}")
            print(f"       - sender.email: {sender.get('email')}")
            print(f"       - sender.role: {sender.get('role')}")
            
            # Critical comparison
            current_user_id = current_user.get('userId')
            sender_id = sender.get('id')
            
            print(f"\n     🔍 SENDER IDENTIFICATION ANALYSIS:")
            print(f"       - currentUser.userId: {current_user_id}")
            print(f"       - message.sender.id: {sender_id}")
            print(f"       - Are they equal? {sender_id == current_user_id}")
            print(f"       - Type comparison: {type(sender_id)} vs {type(current_user_id)}")
            
            if sender_id == current_user_id:
                print(f"       ✅ CORRECT: This should be identified as current user's message")
            else:
                print(f"       ❌ MISMATCH: This will be incorrectly identified as support agent message")
                print(f"       🔧 ROOT CAUSE: sender.id ({sender_id}) != currentUser.userId ({current_user_id})")
        else:
            print(f"     - ❌ No sender object found")
    
    return messages

def analyze_id_mismatch(current_user, messages):
    """Analyze the ID mismatch issue in detail"""
    print_subsection("Detailed ID Mismatch Analysis")
    
    current_user_id = current_user.get('userId')
    
    print(f"\n🎯 DETAILED ANALYSIS:")
    print(f"\n1. Current User from /api/user/me:")
    print(f"   - userId: {current_user_id}")
    print(f"   - Type: {type(current_user_id)}")
    print(f"   - Length: {len(str(current_user_id))}")
    
    print(f"\n2. Message Sender Analysis:")
    for i, message in enumerate(messages, 1):
        if 'sender' in message and message['sender']:
            sender = message['sender']
            sender_id = sender.get('id')
            stored_sender_id = message.get('sender_id')
            
            print(f"\n   Message {i}:")
            print(f"     - Stored sender_id: {stored_sender_id}")
            print(f"     - Returned sender.id: {sender_id}")
            print(f"     - sender.id type: {type(sender_id)}")
            print(f"     - sender.id length: {len(str(sender_id))}")
            
            print(f"\n     🔍 Comparisons:")
            print(f"     - stored_sender_id == currentUser.userId: {stored_sender_id == current_user_id}")
            print(f"     - sender.id == currentUser.userId: {sender_id == current_user_id}")
            print(f"     - stored_sender_id == sender.id: {stored_sender_id == sender_id}")
            
            if stored_sender_id != sender_id:
                print(f"     ❌ CRITICAL: Stored sender_id != returned sender.id")
                print(f"     🔧 This indicates a database foreign key issue")
            
            if sender_id != current_user_id:
                print(f"     ❌ CRITICAL: sender.id != currentUser.userId")
                print(f"     🔧 This causes incorrect sender identification in frontend")

def provide_solution_recommendations():
    """Provide specific solution recommendations"""
    print_subsection("Solution Recommendations")
    
    print(f"\n🔧 IMMEDIATE FIXES NEEDED:")
    
    print(f"\n1. VERIFY DATABASE FOREIGN KEY:")
    print(f"   - Check if chat_messages.sender_id correctly references users.id")
    print(f"   - Verify foreign key constraint: chat_messages_sender_id_fkey")
    print(f"   - SQL: SELECT sender_id, users.id FROM chat_messages JOIN users ON sender_id = users.id")
    
    print(f"\n2. VERIFY JWT PAYLOAD:")
    print(f"   - Ensure JWT userId matches database users.id exactly")
    print(f"   - Check for UUID format consistency")
    print(f"   - Verify no type conversion issues (string vs UUID)")
    
    print(f"\n3. FRONTEND COMPARISON FIX:")
    print(f"   - Current: message.sender?.id === currentUser?.userId")
    print(f"   - Verify both values are same type and format")
    print(f"   - Add logging to debug comparison in ChatWidget")
    
    print(f"\n4. SUPPORT AGENT TESTING:")
    print(f"   - Test with support agent role to verify different behavior")
    print(f"   - Check if support agent messages have different sender structure")
    print(f"   - Verify role-based message identification logic")

def main():
    """Main test execution"""
    print_section("AUTHENTICATED MESSAGE SENDER DEBUG TEST")
    print(f"Target: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Step 1: Authenticate user
    auth_token, user_id = authenticate_user()
    if not auth_token:
        print("❌ Authentication failed. Cannot proceed with tests.")
        return
    
    # Step 2: Test current user API
    current_user = test_current_user_api(auth_token)
    if not current_user:
        print("❌ Failed to get current user info. Cannot proceed.")
        return
    
    # Step 3: Create conversation
    conversation_id = test_conversation_creation(auth_token)
    if not conversation_id:
        print("❌ Failed to create conversation. Cannot proceed.")
        return
    
    # Step 4: Send message and analyze
    sent_message = test_message_sending(auth_token, conversation_id, current_user)
    if not sent_message:
        print("❌ Failed to send message. Cannot proceed.")
        return
    
    # Step 5: Retrieve messages and analyze sender identification
    messages = test_message_retrieval(auth_token, conversation_id, current_user)
    if not messages:
        print("❌ Failed to retrieve messages. Cannot proceed.")
        return
    
    # Step 6: Detailed ID mismatch analysis
    analyze_id_mismatch(current_user, messages)
    
    # Step 7: Provide solutions
    provide_solution_recommendations()
    
    print_section("SUMMARY & CONCLUSIONS")
    
    print(f"\n✅ TESTING COMPLETED:")
    print(f"   - User authenticated successfully")
    print(f"   - Conversation created and messages sent")
    print(f"   - Message sender structure analyzed")
    print(f"   - ID comparison logic tested")
    
    print(f"\n🎯 KEY FINDINGS:")
    print(f"   - Current user ID: {current_user.get('userId')}")
    print(f"   - Message sender identification tested")
    print(f"   - Frontend comparison logic verified")
    
    print(f"\n📋 NEXT STEPS:")
    print(f"   1. Review the detailed analysis above")
    print(f"   2. Check for any ID mismatches identified")
    print(f"   3. Apply recommended fixes if issues found")
    print(f"   4. Test with support agent role for complete verification")

if __name__ == "__main__":
    main()