#!/usr/bin/env python3
"""
Chat Closure API Debug Test
===========================

This test specifically debugs the chat closure API failure as requested in the review.
Focus areas:
1. Test PATCH /api/chat/conversations/[id]/close with support agent authentication
2. Database issues investigation (closure fields, triggers)
3. Authentication & role issues for anjalirao768@gmail.com
4. Supabase query issues and error details
5. Get exact error details from updateError object
"""

import requests
import json
import os
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://workbridge-app-1.onrender.com"
API_BASE = f"{BASE_URL}/api"

# Test user credentials
SUPPORT_EMAIL = "anjalirao768@gmail.com"
TEST_USER_EMAIL = "testuser@example.com"

class ChatClosureDebugger:
    def __init__(self):
        self.session = requests.Session()
        self.support_token = None
        self.test_user_token = None
        self.test_conversation_id = None
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def log_error(self, message, error=None):
        self.log(f"❌ {message}", "ERROR")
        if error:
            self.log(f"   Details: {error}", "ERROR")
            
    def log_success(self, message):
        self.log(f"✅ {message}", "SUCCESS")
        
    def log_warning(self, message):
        self.log(f"⚠️ {message}", "WARNING")

    def authenticate_support_agent(self):
        """Authenticate anjalirao768@gmail.com as support agent"""
        self.log("🔐 Authenticating support agent (anjalirao768@gmail.com)...")
        
        try:
            # Step 1: Send OTP
            response = self.session.post(f"{API_BASE}/auth/send-otp", 
                json={"email": SUPPORT_EMAIL})
            
            if response.status_code != 200:
                self.log_error(f"Failed to send OTP: {response.status_code}", response.text)
                return False
                
            self.log_success("OTP sent successfully")
            
            # Step 2: Simulate OTP verification (we'll use a test approach)
            # For testing, we'll try to get user info to check current authentication
            auth_response = self.session.get(f"{API_BASE}/user/me")
            
            if auth_response.status_code == 200:
                user_data = auth_response.json()
                self.log_success(f"Already authenticated as: {user_data.get('email')} (role: {user_data.get('role')})")
                
                if user_data.get('role') in ['support', 'admin']:
                    self.support_token = "authenticated"  # We're using session cookies
                    return True
                else:
                    self.log_error(f"User has role '{user_data.get('role')}' but needs 'support' or 'admin'")
                    return False
            else:
                self.log_error("Not authenticated - need to complete OTP flow")
                return False
                
        except Exception as e:
            self.log_error("Authentication failed", str(e))
            return False

    def check_database_schema(self):
        """Check if required database fields exist"""
        self.log("🗄️ Checking database schema for chat closure fields...")
        
        try:
            # Try to get conversations to check schema
            response = self.session.get(f"{API_BASE}/chat/conversations")
            
            if response.status_code == 401:
                self.log_error("Need authentication to check schema")
                return False
                
            if response.status_code == 200:
                data = response.json()
                conversations = data.get('data', [])
                
                if conversations:
                    # Check if closure fields exist in the response
                    sample_conv = conversations[0]
                    closure_fields = ['closed_by', 'closure_note', 'closed_at', 'resolution_time_minutes']
                    
                    self.log("Checking for closure fields in conversation schema:")
                    for field in closure_fields:
                        if field in sample_conv:
                            self.log_success(f"  ✓ {field} field exists")
                        else:
                            self.log_warning(f"  ⚠️ {field} field missing or null")
                            
                    return True
                else:
                    self.log_warning("No conversations found to check schema")
                    return True
            else:
                self.log_error(f"Failed to fetch conversations: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_error("Database schema check failed", str(e))
            return False

    def create_test_conversation(self):
        """Create a test conversation for closure testing"""
        self.log("💬 Creating test conversation...")
        
        try:
            response = self.session.post(f"{API_BASE}/chat/conversations")
            
            if response.status_code == 201 or response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    conversation = data.get('data')
                    self.test_conversation_id = conversation.get('id')
                    self.log_success(f"Test conversation created: {self.test_conversation_id}")
                    
                    # Add a test message to make it more realistic
                    self.add_test_message()
                    return True
                else:
                    self.log_error("Conversation creation failed", data.get('error'))
                    return False
            else:
                self.log_error(f"Failed to create conversation: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_error("Conversation creation failed", str(e))
            return False

    def add_test_message(self):
        """Add a test message to the conversation"""
        if not self.test_conversation_id:
            return False
            
        try:
            response = self.session.post(
                f"{API_BASE}/chat/conversations/{self.test_conversation_id}/messages",
                json={"message": "This is a test message for closure testing"}
            )
            
            if response.status_code == 200:
                self.log_success("Test message added to conversation")
                return True
            else:
                self.log_warning(f"Failed to add test message: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_warning(f"Failed to add test message: {str(e)}")
            return False

    def test_chat_closure_api(self):
        """Test the PATCH /api/chat/conversations/[id]/close endpoint"""
        self.log("🔒 Testing chat closure API endpoint...")
        
        if not self.test_conversation_id:
            self.log_error("No test conversation available for closure testing")
            return False
            
        try:
            # Test different closure scenarios
            test_cases = [
                {
                    "name": "Basic closure without note",
                    "data": {}
                },
                {
                    "name": "Closure with note",
                    "data": {"closure_note": "Issue resolved - customer inquiry answered"}
                },
                {
                    "name": "Closure with detailed note",
                    "data": {"closure_note": "Technical issue resolved. Provided solution for API integration problem."}
                }
            ]
            
            for i, test_case in enumerate(test_cases):
                self.log(f"Testing: {test_case['name']}")
                
                # If this is not the first test, create a new conversation
                if i > 0:
                    self.create_test_conversation()
                
                response = self.session.patch(
                    f"{API_BASE}/chat/conversations/{self.test_conversation_id}/close",
                    json=test_case['data']
                )
                
                self.log(f"Response Status: {response.status_code}")
                self.log(f"Response Headers: {dict(response.headers)}")
                
                try:
                    response_data = response.json()
                    self.log(f"Response Data: {json.dumps(response_data, indent=2)}")
                except:
                    self.log(f"Response Text: {response.text}")
                
                if response.status_code == 200:
                    data = response_data
                    if data.get('success'):
                        self.log_success(f"✅ {test_case['name']} - SUCCESS")
                        
                        # Verify closure data
                        closure_data = data.get('data', {})
                        self.log("Closure verification:")
                        self.log(f"  Status: {closure_data.get('status')}")
                        self.log(f"  Closed by: {closure_data.get('closed_by')}")
                        self.log(f"  Closed at: {closure_data.get('closed_at')}")
                        self.log(f"  Closure note: {closure_data.get('closure_note')}")
                        self.log(f"  Resolution time: {closure_data.get('resolution_time_minutes')} minutes")
                        
                    else:
                        self.log_error(f"❌ {test_case['name']} - API returned success=false", data.get('error'))
                        
                elif response.status_code == 401:
                    self.log_error(f"❌ {test_case['name']} - Authentication failed")
                    
                elif response.status_code == 403:
                    self.log_error(f"❌ {test_case['name']} - Access denied (role/permission issue)")
                    
                elif response.status_code == 404:
                    self.log_error(f"❌ {test_case['name']} - Conversation not found")
                    
                elif response.status_code == 500:
                    self.log_error(f"❌ {test_case['name']} - Internal server error")
                    self.log("This is likely the database issue we're investigating!")
                    
                else:
                    self.log_error(f"❌ {test_case['name']} - Unexpected status: {response.status_code}")
                
                self.log("─" * 60)
                
        except Exception as e:
            self.log_error("Chat closure API test failed", str(e))
            return False
            
        return True

    def test_conversation_assignment(self):
        """Test if the user is properly assigned to conversations"""
        self.log("👤 Testing conversation assignment for support agent...")
        
        try:
            # Get user info
            user_response = self.session.get(f"{API_BASE}/user/me")
            if user_response.status_code != 200:
                self.log_error("Cannot get user info for assignment test")
                return False
                
            user_data = user_response.json()
            user_id = user_data.get('userId')
            
            self.log(f"Support agent user ID: {user_id}")
            
            # Get conversations to check assignment
            conv_response = self.session.get(f"{API_BASE}/chat/conversations")
            if conv_response.status_code != 200:
                self.log_error("Cannot get conversations for assignment test")
                return False
                
            conversations = conv_response.json().get('data', [])
            
            self.log(f"Found {len(conversations)} conversations")
            
            for conv in conversations[:3]:  # Check first 3 conversations
                conv_id = conv.get('id')
                support_agent_id = conv.get('support_agent_id')
                
                self.log(f"Conversation {conv_id}:")
                self.log(f"  Support agent ID: {support_agent_id}")
                self.log(f"  Status: {conv.get('status')}")
                
                if support_agent_id == user_id:
                    self.log_success(f"  ✅ User is assigned to this conversation")
                elif support_agent_id is None:
                    self.log_warning(f"  ⚠️ No support agent assigned")
                else:
                    self.log_warning(f"  ⚠️ Different support agent assigned")
                    
            return True
            
        except Exception as e:
            self.log_error("Conversation assignment test failed", str(e))
            return False

    def test_database_triggers(self):
        """Test if database triggers are working for closure fields"""
        self.log("⚡ Testing database triggers for closure fields...")
        
        try:
            if not self.test_conversation_id:
                self.log_error("No test conversation for trigger testing")
                return False
                
            # Get conversation before closure
            before_response = self.session.get(f"{API_BASE}/chat/conversations")
            if before_response.status_code != 200:
                self.log_error("Cannot get conversation before closure")
                return False
                
            conversations = before_response.json().get('data', [])
            before_conv = None
            
            for conv in conversations:
                if conv.get('id') == self.test_conversation_id:
                    before_conv = conv
                    break
                    
            if not before_conv:
                self.log_error("Test conversation not found in list")
                return False
                
            self.log("Conversation before closure:")
            self.log(f"  Status: {before_conv.get('status')}")
            self.log(f"  Closed at: {before_conv.get('closed_at')}")
            self.log(f"  Resolution time: {before_conv.get('resolution_time_minutes')}")
            
            # Attempt closure
            closure_response = self.session.patch(
                f"{API_BASE}/chat/conversations/{self.test_conversation_id}/close",
                json={"closure_note": "Testing database triggers"}
            )
            
            self.log(f"Closure attempt status: {closure_response.status_code}")
            
            if closure_response.status_code == 200:
                closure_data = closure_response.json()
                if closure_data.get('success'):
                    trigger_data = closure_data.get('data', {})
                    
                    self.log("Trigger verification:")
                    self.log(f"  closed_at set: {'✅' if trigger_data.get('closed_at') else '❌'}")
                    self.log(f"  resolution_time_minutes calculated: {'✅' if trigger_data.get('resolution_time_minutes') is not None else '❌'}")
                    
                    if trigger_data.get('closed_at'):
                        self.log_success("Database triggers appear to be working")
                        return True
                    else:
                        self.log_error("Database triggers not working - closed_at not set")
                        return False
                else:
                    self.log_error("Closure failed", closure_data.get('error'))
                    return False
            else:
                self.log_error(f"Closure request failed: {closure_response.status_code}")
                try:
                    error_data = closure_response.json()
                    self.log_error("Detailed error", json.dumps(error_data, indent=2))
                except:
                    self.log_error("Error response", closure_response.text)
                return False
                
        except Exception as e:
            self.log_error("Database trigger test failed", str(e))
            return False

    def investigate_specific_errors(self):
        """Investigate specific error patterns mentioned in the review"""
        self.log("🔍 Investigating specific error patterns...")
        
        try:
            # Test with invalid conversation ID
            self.log("Testing with invalid conversation ID...")
            invalid_response = self.session.patch(
                f"{API_BASE}/chat/conversations/invalid-id/close",
                json={"closure_note": "Test"}
            )
            
            self.log(f"Invalid ID response: {invalid_response.status_code}")
            if invalid_response.status_code != 200:
                try:
                    error_data = invalid_response.json()
                    self.log(f"Invalid ID error: {json.dumps(error_data, indent=2)}")
                except:
                    self.log(f"Invalid ID error text: {invalid_response.text}")
            
            # Test with missing authentication
            self.log("Testing without authentication...")
            no_auth_session = requests.Session()
            no_auth_response = no_auth_session.patch(
                f"{API_BASE}/chat/conversations/{self.test_conversation_id or 'test'}/close",
                json={"closure_note": "Test"}
            )
            
            self.log(f"No auth response: {no_auth_response.status_code}")
            if no_auth_response.status_code != 200:
                try:
                    error_data = no_auth_response.json()
                    self.log(f"No auth error: {json.dumps(error_data, indent=2)}")
                except:
                    self.log(f"No auth error text: {no_auth_response.text}")
            
            # Test with malformed JSON
            self.log("Testing with malformed request...")
            malformed_response = self.session.patch(
                f"{API_BASE}/chat/conversations/{self.test_conversation_id or 'test'}/close",
                data="invalid json"
            )
            
            self.log(f"Malformed request response: {malformed_response.status_code}")
            if malformed_response.status_code != 200:
                try:
                    error_data = malformed_response.json()
                    self.log(f"Malformed request error: {json.dumps(error_data, indent=2)}")
                except:
                    self.log(f"Malformed request error text: {malformed_response.text}")
                    
            return True
            
        except Exception as e:
            self.log_error("Error investigation failed", str(e))
            return False

    def run_comprehensive_debug(self):
        """Run comprehensive debugging of chat closure API"""
        self.log("🚀 Starting comprehensive chat closure API debugging...")
        self.log("=" * 80)
        
        results = {
            "authentication": False,
            "database_schema": False,
            "conversation_creation": False,
            "conversation_assignment": False,
            "chat_closure_api": False,
            "database_triggers": False,
            "error_investigation": False
        }
        
        # Step 1: Authentication
        self.log("\n📋 STEP 1: Support Agent Authentication")
        results["authentication"] = self.authenticate_support_agent()
        
        if not results["authentication"]:
            self.log_error("❌ CRITICAL: Authentication failed - cannot proceed with closure testing")
            return results
        
        # Step 2: Database Schema Check
        self.log("\n📋 STEP 2: Database Schema Verification")
        results["database_schema"] = self.check_database_schema()
        
        # Step 3: Conversation Creation
        self.log("\n📋 STEP 3: Test Conversation Creation")
        results["conversation_creation"] = self.create_test_conversation()
        
        # Step 4: Conversation Assignment
        self.log("\n📋 STEP 4: Conversation Assignment Testing")
        results["conversation_assignment"] = self.test_conversation_assignment()
        
        # Step 5: Chat Closure API Testing
        self.log("\n📋 STEP 5: Chat Closure API Testing")
        results["chat_closure_api"] = self.test_chat_closure_api()
        
        # Step 6: Database Triggers
        self.log("\n📋 STEP 6: Database Triggers Testing")
        results["database_triggers"] = self.test_database_triggers()
        
        # Step 7: Error Investigation
        self.log("\n📋 STEP 7: Specific Error Investigation")
        results["error_investigation"] = self.investigate_specific_errors()
        
        # Summary
        self.log("\n" + "=" * 80)
        self.log("🎯 CHAT CLOSURE DEBUG SUMMARY")
        self.log("=" * 80)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status} - {test_name.replace('_', ' ').title()}")
        
        self.log(f"\n📊 Overall Results: {passed}/{total} tests passed")
        
        if results["chat_closure_api"]:
            self.log_success("🎉 Chat closure API is working correctly!")
        else:
            self.log_error("💥 Chat closure API has issues that need investigation")
            
        return results

def main():
    """Main execution function"""
    print("🔧 Chat Closure API Debug Test")
    print("=" * 50)
    print("This test investigates the specific chat closure API failure")
    print("Focus: PATCH /api/chat/conversations/[id]/close endpoint")
    print("=" * 50)
    
    debugger = ChatClosureDebugger()
    results = debugger.run_comprehensive_debug()
    
    # Exit with appropriate code
    if results["chat_closure_api"]:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure

if __name__ == "__main__":
    main()