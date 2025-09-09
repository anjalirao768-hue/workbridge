#!/usr/bin/env python3

import requests
import json
import sys
import time
from datetime import datetime
import jwt

class AuthenticatedChatTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.jwt_secret = "9e9f9ff5b5cdbeb54e11ceb801b93da182bcc7063f7bea05c6c5fc23966ff5ac4d7c53f559e91340fad57a99409ef3bb21fd6b46f65b16302781e8f60c7c6d54"

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED")
        
        if details:
            print(f"   {details}")

    def create_test_jwt_token(self, user_id, email, role):
        """Create a test JWT token for authentication"""
        payload = {
            "userId": user_id,
            "email": email,
            "role": role,
            "iat": int(time.time()),
            "exp": int(time.time()) + 3600  # 1 hour expiry
        }
        
        token = jwt.encode(payload, self.jwt_secret, algorithm="HS256")
        return token

    def make_authenticated_request(self, method, endpoint, data=None, user_id=None, email=None, role="client", expect_status=200):
        """Make authenticated HTTP request"""
        url = f"{self.base_url}{endpoint}"
        
        # Create JWT token for the user
        if user_id and email:
            token = self.create_test_jwt_token(user_id, email, role)
            # Set the auth token as a cookie
            self.session.cookies.set('auth-token', token)
        
        headers = {'Content-Type': 'application/json'}
        
        print(f"\n🔍 {method} {endpoint}")
        print(f"   URL: {url}")
        print(f"   User: {email} ({role})")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers)

            print(f"   Status: {response.status_code}")
            
            # Try to parse JSON response
            try:
                response_data = response.json()
                print(f"   Response: {json.dumps(response_data, indent=2)[:400]}...")
            except:
                response_data = {"text": response.text}
                print(f"   Response (text): {response.text[:200]}...")

            success = response.status_code == expect_status
            return success, response_data, response.status_code

        except Exception as e:
            print(f"   Error: {str(e)}")
            return False, {"error": str(e)}, 0

    def test_user_authentication(self):
        """Test user authentication with JWT token"""
        print(f"\n{'='*60}")
        print("PHASE 1: JWT AUTHENTICATION TESTING")
        print(f"{'='*60}")
        
        # Test with a regular user
        test_user_id = "a2db711d-41b9-4104-9b29-8ffa268d7a49"
        test_email = "anjalirao768@gmail.com"
        test_role = "client"
        
        # Test /api/user/me with authentication
        success, response, status = self.make_authenticated_request(
            'GET',
            '/api/user/me',
            user_id=test_user_id,
            email=test_email,
            role=test_role,
            expect_status=200
        )
        
        if success and response.get('email') == test_email:
            self.log_test("JWT Authentication", True, f"User authenticated successfully: {response.get('role')}")
            return True, test_user_id, test_email, test_role
        else:
            self.log_test("JWT Authentication", False, f"Authentication failed: {response}")
            return False, None, None, None

    def test_conversation_creation(self, user_id, email, role):
        """Test creating a new conversation"""
        print(f"\n{'='*60}")
        print("PHASE 2: CONVERSATION CREATION TESTING")
        print(f"{'='*60}")
        
        # Test creating a new conversation
        success, response, status = self.make_authenticated_request(
            'POST',
            '/api/chat/conversations',
            data={},
            user_id=user_id,
            email=email,
            role=role,
            expect_status=200
        )
        
        if success and response.get('success'):
            conversation_data = response.get('data', {})
            conversation_id = conversation_data.get('id')
            
            self.log_test("Create Conversation", True, f"Conversation created: {conversation_id}")
            return True, conversation_id
        else:
            self.log_test("Create Conversation", False, f"Failed to create conversation: {response}")
            return False, None

    def test_message_sending(self, user_id, email, role, conversation_id):
        """Test sending messages to a conversation"""
        print(f"\n{'='*60}")
        print("PHASE 3: MESSAGE SENDING TESTING")
        print(f"{'='*60}")
        
        if not conversation_id:
            print("⚠️  No conversation ID available, skipping message tests")
            return False
        
        # Test 1: Send a valid message
        test_message = "Hello, I need help with my project. Can someone assist me?"
        
        success, response, status = self.make_authenticated_request(
            'POST',
            f'/api/chat/conversations/{conversation_id}/messages',
            data={"message": test_message},
            user_id=user_id,
            email=email,
            role=role,
            expect_status=200
        )
        
        if success and response.get('success'):
            message_data = response.get('data', {})
            self.log_test("Send Valid Message", True, f"Message sent: {message_data.get('id')}")
            
            # Test 2: Send another message (reply scenario)
            reply_message = "I'm still waiting for a response. This is urgent."
            
            success2, response2, status2 = self.make_authenticated_request(
                'POST',
                f'/api/chat/conversations/{conversation_id}/messages',
                data={"message": reply_message},
                user_id=user_id,
                email=email,
                role=role,
                expect_status=200
            )
            
            if success2 and response2.get('success'):
                self.log_test("Send Reply Message", True, "User can send multiple messages")
                return True
            else:
                self.log_test("Send Reply Message", False, f"Failed to send reply: {response2}")
                return False
        else:
            self.log_test("Send Valid Message", False, f"Failed to send message: {response}")
            return False

    def test_message_validation(self, user_id, email, role, conversation_id):
        """Test message validation"""
        print(f"\n{'='*60}")
        print("PHASE 4: MESSAGE VALIDATION TESTING")
        print(f"{'='*60}")
        
        if not conversation_id:
            print("⚠️  No conversation ID available, skipping validation tests")
            return False
        
        # Test 1: Empty message
        success, response, status = self.make_authenticated_request(
            'POST',
            f'/api/chat/conversations/{conversation_id}/messages',
            data={"message": ""},
            user_id=user_id,
            email=email,
            role=role,
            expect_status=400
        )
        
        if status == 400 and 'required' in str(response.get('error', '')).lower():
            self.log_test("Empty Message Validation", True, "Empty messages properly rejected")
        else:
            self.log_test("Empty Message Validation", False, f"Unexpected response: {response}")
        
        # Test 2: Whitespace-only message
        success, response, status = self.make_authenticated_request(
            'POST',
            f'/api/chat/conversations/{conversation_id}/messages',
            data={"message": "   "},
            user_id=user_id,
            email=email,
            role=role,
            expect_status=400
        )
        
        if status == 400:
            self.log_test("Whitespace Message Validation", True, "Whitespace-only messages properly rejected")
        else:
            self.log_test("Whitespace Message Validation", False, f"Unexpected response: {response}")

    def test_conversation_access(self, user_id, email, role, conversation_id):
        """Test conversation access and message retrieval"""
        print(f"\n{'='*60}")
        print("PHASE 5: CONVERSATION ACCESS TESTING")
        print(f"{'='*60}")
        
        if not conversation_id:
            print("⚠️  No conversation ID available, skipping access tests")
            return False
        
        # Test getting messages from the conversation
        success, response, status = self.make_authenticated_request(
            'GET',
            f'/api/chat/conversations/{conversation_id}/messages',
            user_id=user_id,
            email=email,
            role=role,
            expect_status=200
        )
        
        if success and response.get('success'):
            conversation_data = response.get('data', {})
            messages = conversation_data.get('messages', [])
            
            self.log_test("Get Conversation Messages", True, f"Retrieved {len(messages)} messages")
            
            # Check if user can see their own messages
            user_messages = [msg for msg in messages if msg.get('sender_id') == user_id]
            if user_messages:
                self.log_test("User Message Visibility", True, f"User can see {len(user_messages)} of their messages")
                return True
            else:
                self.log_test("User Message Visibility", False, "User cannot see their own messages")
                return False
        else:
            self.log_test("Get Conversation Messages", False, f"Failed to get messages: {response}")
            return False

    def test_different_user_access(self, conversation_id):
        """Test access with a different user (should be denied)"""
        print(f"\n{'='*60}")
        print("PHASE 6: CROSS-USER ACCESS TESTING")
        print(f"{'='*60}")
        
        if not conversation_id:
            print("⚠️  No conversation ID available, skipping cross-user tests")
            return False
        
        # Test with a different user
        different_user_id = "different-user-id-123"
        different_email = "different@test.com"
        
        # Try to send message as different user
        success, response, status = self.make_authenticated_request(
            'POST',
            f'/api/chat/conversations/{conversation_id}/messages',
            data={"message": "I shouldn't be able to send this"},
            user_id=different_user_id,
            email=different_email,
            role="client",
            expect_status=403
        )
        
        if status == 403:
            self.log_test("Cross-User Message Sending", True, "Different user properly denied access")
        else:
            self.log_test("Cross-User Message Sending", False, f"Security issue: {status} - {response}")
        
        # Try to access messages as different user
        success, response, status = self.make_authenticated_request(
            'GET',
            f'/api/chat/conversations/{conversation_id}/messages',
            user_id=different_user_id,
            email=different_email,
            role="client",
            expect_status=403
        )
        
        if status == 403:
            self.log_test("Cross-User Message Access", True, "Different user properly denied access")
            return True
        else:
            self.log_test("Cross-User Message Access", False, f"Security issue: {status} - {response}")
            return False

    def test_support_agent_access(self, conversation_id):
        """Test support agent access to conversation"""
        print(f"\n{'='*60}")
        print("PHASE 7: SUPPORT AGENT ACCESS TESTING")
        print(f"{'='*60}")
        
        if not conversation_id:
            print("⚠️  No conversation ID available, skipping support agent tests")
            return False
        
        # Test with support agent
        support_user_id = "support-agent-123"
        support_email = "support@workbridge.com"
        
        # Support agent should be able to send messages
        success, response, status = self.make_authenticated_request(
            'POST',
            f'/api/chat/conversations/{conversation_id}/messages',
            data={"message": "Hello! I'm here to help you with your project."},
            user_id=support_user_id,
            email=support_email,
            role="support",
            expect_status=200
        )
        
        if success and response.get('success'):
            self.log_test("Support Agent Message Sending", True, "Support agent can send messages")
        else:
            self.log_test("Support Agent Message Sending", False, f"Support agent denied: {response}")
        
        # Support agent should be able to access messages
        success, response, status = self.make_authenticated_request(
            'GET',
            f'/api/chat/conversations/{conversation_id}/messages',
            user_id=support_user_id,
            email=support_email,
            role="support",
            expect_status=200
        )
        
        if success and response.get('success'):
            self.log_test("Support Agent Message Access", True, "Support agent can access messages")
            return True
        else:
            self.log_test("Support Agent Message Access", False, f"Support agent denied: {response}")
            return False

    def run_comprehensive_test(self):
        """Run all authenticated chat tests"""
        print("🚀 Starting Authenticated ChatWidget Message Testing...")
        print("=" * 80)
        print("Focus: Test actual message sending with authenticated users")
        print("=" * 80)
        
        # Phase 1: Authentication
        auth_success, user_id, email, role = self.test_user_authentication()
        
        if not auth_success:
            print("❌ Authentication failed, cannot proceed with chat tests")
            return self.tests_passed, self.tests_run
        
        # Phase 2: Conversation Creation
        conv_success, conversation_id = self.test_conversation_creation(user_id, email, role)
        
        # Phase 3: Message Sending
        if conv_success:
            self.test_message_sending(user_id, email, role, conversation_id)
            
            # Phase 4: Message Validation
            self.test_message_validation(user_id, email, role, conversation_id)
            
            # Phase 5: Conversation Access
            self.test_conversation_access(user_id, email, role, conversation_id)
            
            # Phase 6: Cross-User Access
            self.test_different_user_access(conversation_id)
            
            # Phase 7: Support Agent Access
            self.test_support_agent_access(conversation_id)
        
        # Print summary
        print(f"\n{'='*80}")
        print("📊 AUTHENTICATED CHAT MESSAGE TESTING SUMMARY")
        print(f"{'='*80}")
        print(f"   Tests run: {self.tests_run}")
        print(f"   Tests passed: {self.tests_passed}")
        print(f"   Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        print(f"\n🎯 KEY FUNCTIONALITY TESTED:")
        print(f"   ✓ JWT Authentication with chat APIs")
        print(f"   ✓ Conversation creation for regular users")
        print(f"   ✓ Message sending by conversation owners")
        print(f"   ✓ Message validation and error handling")
        print(f"   ✓ Conversation access control")
        print(f"   ✓ Cross-user access restrictions")
        print(f"   ✓ Support agent permissions")
        
        return self.tests_passed, self.tests_run

def main():
    tester = AuthenticatedChatTester()
    passed, total = tester.run_comprehensive_test()
    
    if passed == total:
        print(f"\n🎉 All authenticated chat tests passed!")
        print(f"✅ ChatWidget message sending functionality is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Review findings above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())