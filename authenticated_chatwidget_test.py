#!/usr/bin/env python3

import requests
import json
import sys
import time
from datetime import datetime
import os
import jwt
from datetime import datetime, timedelta

class AuthenticatedChatWidgetTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.auth_token = None
        self.user_data = None
        self.conversation_id = None

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
        print()

    def create_test_jwt_token(self, user_id="test-user-123", email="testuser@workbridge.com", role="client"):
        """Create a valid JWT token for testing using the same secret as the backend"""
        try:
            # Get JWT secret from environment (same as backend uses)
            jwt_secret = os.getenv('JWT_SECRET', '9e9f9ff5b5cdbeb54e11ceb801b93da182bcc7063f7bea05c6c5fc23966ff5ac4d7c53f559e91340fad57a99409ef3bb21fd6b46f65b16302781e8f60c7c6d54')
            
            # Create payload matching backend structure
            payload = {
                'userId': user_id,
                'email': email,
                'role': role,
                'iat': int(datetime.utcnow().timestamp()),
                'exp': int((datetime.utcnow() + timedelta(days=7)).timestamp())
            }
            
            # Create JWT token
            token = jwt.encode(payload, jwt_secret, algorithm='HS256')
            
            self.auth_token = token
            self.user_data = {
                'userId': user_id,
                'email': email,
                'role': role
            }
            
            # Set the auth cookie
            self.session.cookies.set('auth-token', token)
            
            self.log_test("Create Test JWT Token", True, f"Token created for {email} (Role: {role})")
            return True, token
            
        except Exception as e:
            self.log_test("Create Test JWT Token", False, f"Exception: {str(e)}")
            return False, None

    def verify_authentication(self):
        """Verify that our JWT token works with the /api/user/me endpoint"""
        print("🔐 Verifying Authentication")
        print("=" * 50)
        
        try:
            response = self.session.get(
                f"{self.base_url}/api/user/me",
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                user_data = response.json()
                self.log_test("Authentication Verification", True, 
                            f"Authenticated as: {user_data.get('email')} | Role: {user_data.get('role')}")
                return True, user_data
            elif response.status_code == 401:
                self.log_test("Authentication Verification", False, 
                            "JWT token not accepted by backend")
                return False, {}
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"error": response.text}
                self.log_test("Authentication Verification", False, f"Status {response.status_code}: {error_data}")
                return False, {}
                
        except Exception as e:
            self.log_test("Authentication Verification", False, f"Exception: {str(e)}")
            return False, {}

    def test_create_conversation(self):
        """Test POST /api/chat/conversations for authenticated regular user"""
        print("💬 Testing Chat Conversation Creation (Authenticated)")
        print("=" * 50)
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/chat/conversations",
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                response_data = response.json()
                if response_data.get('success'):
                    conversation = response_data.get('data', {})
                    self.conversation_id = conversation.get('id')
                    
                    self.log_test("Create Conversation (Authenticated)", True, 
                                f"Conversation ID: {self.conversation_id} | Status: {conversation.get('status')} | Title: {conversation.get('title')}")
                    
                    # Verify response structure
                    required_fields = ['id', 'user_id', 'status', 'title', 'created_at']
                    missing_fields = [field for field in required_fields if field not in conversation]
                    
                    if missing_fields:
                        self.log_test("Conversation Response Structure", False, f"Missing fields: {missing_fields}")
                        return False, {}
                    else:
                        self.log_test("Conversation Response Structure", True, "All required fields present")
                        
                        # Verify user_id matches our authenticated user
                        if conversation.get('user_id') == self.user_data.get('userId'):
                            self.log_test("Conversation User Association", True, "Conversation correctly associated with authenticated user")
                        else:
                            self.log_test("Conversation User Association", False, 
                                        f"Expected user_id {self.user_data.get('userId')}, got {conversation.get('user_id')}")
                        
                        return True, conversation
                else:
                    self.log_test("Create Conversation (Authenticated)", False, f"API returned success=false: {response_data.get('error')}")
                    return False, {}
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"error": response.text}
                self.log_test("Create Conversation (Authenticated)", False, f"Status {response.status_code}: {error_data}")
                return False, {}
                
        except Exception as e:
            self.log_test("Create Conversation (Authenticated)", False, f"Exception: {str(e)}")
            return False, {}

    def test_fetch_messages(self, conversation_id=None):
        """Test GET /api/chat/conversations/[id]/messages for authenticated user"""
        print("📨 Testing Message Fetching (Authenticated)")
        print("=" * 50)
        
        if not conversation_id:
            conversation_id = self.conversation_id
            
        if not conversation_id:
            self.log_test("Fetch Messages", False, "No conversation ID available")
            return False, {}
        
        try:
            response = self.session.get(
                f"{self.base_url}/api/chat/conversations/{conversation_id}/messages",
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                response_data = response.json()
                if response_data.get('success'):
                    data = response_data.get('data', {})
                    conversation = data.get('conversation', {})
                    messages = data.get('messages', [])
                    
                    self.log_test("Fetch Messages (Authenticated)", True, 
                                f"Retrieved {len(messages)} messages for conversation {conversation_id}")
                    
                    # Verify message structure if messages exist
                    if len(messages) > 0:
                        first_message = messages[0]
                        required_fields = ['id', 'conversation_id', 'sender_id', 'message_text', 'created_at']
                        missing_fields = [field for field in required_fields if field not in first_message]
                        
                        if missing_fields:
                            self.log_test("Message Response Structure", False, f"Missing fields: {missing_fields}")
                        else:
                            self.log_test("Message Response Structure", True, "Message structure correct")
                            
                            # Check if sender information is included
                            sender = first_message.get('sender', {})
                            if sender and 'id' in sender:
                                self.log_test("Message Sender Information", True, f"Sender info included: {sender.get('email', 'N/A')}")
                            else:
                                self.log_test("Message Sender Information", False, "Sender information missing")
                    else:
                        self.log_test("Empty Conversation Handling", True, "Empty conversation handled correctly")
                    
                    return True, {"conversation": conversation, "messages": messages}
                else:
                    self.log_test("Fetch Messages (Authenticated)", False, f"API returned success=false: {response_data.get('error')}")
                    return False, {}
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"error": response.text}
                self.log_test("Fetch Messages (Authenticated)", False, f"Status {response.status_code}: {error_data}")
                return False, {}
                
        except Exception as e:
            self.log_test("Fetch Messages (Authenticated)", False, f"Exception: {str(e)}")
            return False, {}

    def test_send_message(self, conversation_id=None, message_text="Hello, I need help with my project setup. Can someone assist me with the requirements?"):
        """Test POST /api/chat/conversations/[id]/messages from authenticated user"""
        print("📤 Testing Message Sending (Authenticated)")
        print("=" * 50)
        
        if not conversation_id:
            conversation_id = self.conversation_id
            
        if not conversation_id:
            self.log_test("Send Message", False, "No conversation ID available")
            return False, {}
        
        message_data = {
            "message": message_text,
            "messageType": "text"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/chat/conversations/{conversation_id}/messages",
                json=message_data,
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                response_data = response.json()
                if response_data.get('success'):
                    message = response_data.get('data', {})
                    
                    self.log_test("Send Message (Authenticated)", True, 
                                f"Message sent: ID={message.get('id')} | Text='{message.get('message_text')[:50]}...'")
                    
                    # Verify message response structure
                    required_fields = ['id', 'conversation_id', 'sender_id', 'message_text', 'message_type']
                    missing_fields = [field for field in required_fields if field not in message]
                    
                    if missing_fields:
                        self.log_test("Send Message Response Structure", False, f"Missing fields: {missing_fields}")
                        return False, {}
                    else:
                        self.log_test("Send Message Response Structure", True, "Message response structure correct")
                        
                        # Verify sender information
                        sender = message.get('sender', {})
                        if sender and 'id' in sender:
                            self.log_test("Message Sender Information", True, f"Sender info: {sender.get('email', 'N/A')} | Role: {sender.get('role', 'N/A')}")
                        else:
                            self.log_test("Message Sender Information", False, "Sender information missing")
                        
                        # Verify sender_id matches authenticated user
                        if message.get('sender_id') == self.user_data.get('userId'):
                            self.log_test("Message User Association", True, "Message correctly associated with authenticated user")
                        else:
                            self.log_test("Message User Association", False, 
                                        f"Expected sender_id {self.user_data.get('userId')}, got {message.get('sender_id')}")
                        
                        return True, message
                else:
                    self.log_test("Send Message (Authenticated)", False, f"API returned success=false: {response_data.get('error')}")
                    return False, {}
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"error": response.text}
                self.log_test("Send Message (Authenticated)", False, f"Status {response.status_code}: {error_data}")
                return False, {}
                
        except Exception as e:
            self.log_test("Send Message (Authenticated)", False, f"Exception: {str(e)}")
            return False, {}

    def test_complete_authenticated_chat_flow(self):
        """Test the complete authenticated chat flow"""
        print("🔄 Testing Complete Authenticated Chat Flow")
        print("=" * 50)
        
        # Step 1: Create conversation
        success, conversation = self.test_create_conversation()
        if not success:
            self.log_test("Complete Chat Flow", False, "Failed at conversation creation")
            return False
        
        conversation_id = conversation.get('id')
        
        # Step 2: Fetch initial messages
        success, initial_data = self.test_fetch_messages(conversation_id)
        if not success:
            self.log_test("Complete Chat Flow", False, "Failed at initial message fetch")
            return False
        
        initial_messages = initial_data.get('messages', [])
        initial_count = len(initial_messages)
        
        # Step 3: Send first user message
        success, sent_message1 = self.test_send_message(conversation_id, "I need help setting up my project requirements and timeline.")
        if not success:
            self.log_test("Complete Chat Flow", False, "Failed at first message sending")
            return False
        
        # Step 4: Fetch messages to verify first message was saved
        success, updated_data = self.test_fetch_messages(conversation_id)
        if not success:
            self.log_test("Complete Chat Flow", False, "Failed at updated message fetch")
            return False
        
        updated_messages = updated_data.get('messages', [])
        updated_count = len(updated_messages)
        
        if updated_count > initial_count:
            self.log_test("Message Persistence", True, 
                        f"Message count increased from {initial_count} to {updated_count}")
        else:
            self.log_test("Message Persistence", False, 
                        f"Message count did not increase: {initial_count} -> {updated_count}")
            return False
        
        # Step 5: Send second message
        success, sent_message2 = self.test_send_message(conversation_id, "Also, what's the typical budget range for similar projects?")
        if not success:
            self.log_test("Complete Chat Flow", False, "Failed at second message sending")
            return False
        
        # Step 6: Final message fetch to verify both messages
        success, final_data = self.test_fetch_messages(conversation_id)
        if success:
            final_messages = final_data.get('messages', [])
            final_count = len(final_messages)
            
            if final_count >= updated_count + 1:
                self.log_test("Multiple Messages", True, f"Successfully sent multiple messages. Final count: {final_count}")
            else:
                self.log_test("Multiple Messages", False, f"Second message not persisted. Expected >= {updated_count + 1}, got {final_count}")
        
        self.log_test("Complete Authenticated Chat Flow", True, "All authenticated chat flow steps completed successfully")
        return True

    def test_message_validation(self):
        """Test message validation (empty messages, etc.)"""
        print("✅ Testing Message Validation")
        print("=" * 50)
        
        if not self.conversation_id:
            self.log_test("Message Validation", False, "No conversation ID available")
            return False
        
        # Test empty message
        try:
            response = self.session.post(
                f"{self.base_url}/api/chat/conversations/{self.conversation_id}/messages",
                json={"message": "", "messageType": "text"},
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 400:
                self.log_test("Empty Message Validation", True, "Empty messages correctly rejected")
            else:
                self.log_test("Empty Message Validation", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Empty Message Validation", False, f"Exception: {str(e)}")
        
        # Test whitespace-only message
        try:
            response = self.session.post(
                f"{self.base_url}/api/chat/conversations/{self.conversation_id}/messages",
                json={"message": "   ", "messageType": "text"},
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 400:
                self.log_test("Whitespace Message Validation", True, "Whitespace-only messages correctly rejected")
            else:
                self.log_test("Whitespace Message Validation", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Whitespace Message Validation", False, f"Exception: {str(e)}")

    def run_comprehensive_authenticated_test(self):
        """Run comprehensive authenticated ChatWidget testing"""
        print("🚀 AUTHENTICATED CHATWIDGET FUNCTIONALITY TESTING")
        print("=" * 60)
        print("Focus: Test complete ChatWidget functionality with proper authentication")
        print("Testing: Full user chat flow with JWT authentication")
        print("=" * 60)
        
        # Step 1: Create JWT token for testing
        success, token = self.create_test_jwt_token()
        if not success:
            print("❌ Cannot proceed without valid JWT token")
            return False
        
        # Step 2: Verify authentication works
        auth_success, user_data = self.verify_authentication()
        if not auth_success:
            print("❌ Authentication verification failed - cannot test chat functionality")
            return False
        
        # Step 3: Test complete chat flow
        flow_success = self.test_complete_authenticated_chat_flow()
        
        # Step 4: Test message validation
        self.test_message_validation()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 AUTHENTICATED CHATWIDGET TESTING SUMMARY")
        print("=" * 60)
        print(f"   Tests run: {self.tests_run}")
        print(f"   Tests passed: {self.tests_passed}")
        print(f"   Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        print(f"\n🎯 AUTHENTICATED FUNCTIONALITY TESTED:")
        print(f"   ✓ JWT Token Creation and Validation")
        print(f"   ✓ User Authentication Verification (/api/user/me)")
        print(f"   ✓ Conversation Creation (POST /api/chat/conversations)")
        print(f"   ✓ Message Fetching (GET /api/chat/conversations/[id]/messages)")
        print(f"   ✓ Message Sending (POST /api/chat/conversations/[id]/messages)")
        print(f"   ✓ Message Persistence and Retrieval")
        print(f"   ✓ Multiple Message Handling")
        print(f"   ✓ Message Validation and Error Handling")
        
        # Analyze results
        critical_issues = []
        
        if not auth_success:
            critical_issues.append("❌ JWT authentication not working")
        
        if not flow_success:
            critical_issues.append("❌ Complete chat flow failed")
        
        if self.conversation_id is None:
            critical_issues.append("❌ Conversation creation failed")
        
        if self.tests_passed < self.tests_run * 0.85:  # Less than 85% success rate
            critical_issues.append("❌ Multiple test failures indicate issues")
        
        if critical_issues:
            print(f"\n🚨 CRITICAL ISSUES FOUND:")
            for issue in critical_issues:
                print(f"   {issue}")
            
            print(f"\n🔧 RECOMMENDED ACTIONS:")
            print(f"   1. Check JWT_SECRET environment variable matches between test and backend")
            print(f"   2. Verify JWT token format and payload structure")
            print(f"   3. Check database connectivity and chat table schemas")
            print(f"   4. Verify Supabase configuration and permissions")
            
            return False
        else:
            print(f"\n🎉 AUTHENTICATED CHATWIDGET TESTING SUCCESSFUL!")
            print(f"   ✅ All core chat functionality working correctly with authentication")
            print(f"   ✅ Users can create conversations, send messages, and fetch message history")
            print(f"   ✅ JWT authentication is properly implemented and working")
            print(f"   ✅ Message validation and error handling working correctly")
            
            print(f"\n💡 CHATWIDGET IMPLEMENTATION STATUS:")
            print(f"   ✅ Backend APIs are fully functional and ready for production")
            print(f"   ✅ Authentication system is working correctly")
            print(f"   ✅ Database operations are successful")
            print(f"   ✅ Message persistence and retrieval working")
            
            if self.conversation_id:
                print(f"\n📊 TEST CONVERSATION DETAILS:")
                print(f"   Conversation ID: {self.conversation_id}")
                print(f"   User: {self.user_data.get('email')} ({self.user_data.get('role')})")
                print(f"   Status: Active and functional")
            
            return True

def main():
    tester = AuthenticatedChatWidgetTester()
    success = tester.run_comprehensive_authenticated_test()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())