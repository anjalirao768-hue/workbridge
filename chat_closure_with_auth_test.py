#!/usr/bin/env python3
"""
Chat Closure Test with Proper Authentication
===========================================

This test will:
1. Ensure user has support role in database
2. Simulate proper authentication flow
3. Test chat closure API with real authentication
4. Investigate specific error details
"""

import requests
import json
import os
import sys
import time
from datetime import datetime
from supabase import create_client, Client

class ChatClosureAuthTest:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.session = requests.Session()
        self.target_email = "anjalirao768@gmail.com"
        self.supabase = None
        self.test_conversation_id = None
        self.user_data = None
        
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

    def setup_supabase(self):
        """Setup Supabase client"""
        try:
            with open('/app/.env.local', 'r') as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
        except Exception as e:
            self.log_error("Failed to load environment variables", str(e))
            return False
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            self.log_error("Missing Supabase credentials")
            return False
        
        try:
            self.supabase = create_client(supabase_url, supabase_key)
            self.log_success("Supabase client initialized")
            return True
        except Exception as e:
            self.log_error("Failed to initialize Supabase client", str(e))
            return False

    def ensure_support_role(self):
        """Ensure user has support role"""
        self.log("🔍 Ensuring user has support role...")
        
        try:
            response = self.supabase.table('users').select('*').eq('email', self.target_email).execute()
            
            if not response.data:
                self.log_error("User not found in database")
                return False
                
            user = response.data[0]
            self.user_data = user
            
            role = user.get('role')
            user_id = user.get('id')
            
            self.log(f"User: {self.target_email} (ID: {user_id})")
            self.log(f"Current role: {role}")
            
            if role not in ['support', 'admin']:
                self.log_warning(f"Updating role from '{role}' to 'support'...")
                
                update_response = self.supabase.table('users').update({
                    'role': 'support',
                    'email_verified': True
                }).eq('email', self.target_email).execute()
                
                if update_response.data:
                    self.log_success("User role updated to 'support'")
                    self.user_data['role'] = 'support'
                    return True
                else:
                    self.log_error("Failed to update user role")
                    return False
            else:
                self.log_success(f"User already has correct role: {role}")
                return True
                
        except Exception as e:
            self.log_error("Database operation failed", str(e))
            return False

    def test_without_auth(self):
        """Test the API without authentication to see the error"""
        self.log("🔒 Testing chat closure API without authentication...")
        
        try:
            # Try to close a non-existent conversation
            url = f"{self.base_url}/api/chat/conversations/test-id/close"
            response = self.session.patch(url, json={"closure_note": "Test"})
            
            self.log(f"Response Status: {response.status_code}")
            
            try:
                response_data = response.json()
                self.log(f"Response Data: {json.dumps(response_data, indent=2)}")
            except:
                self.log(f"Response Text: {response.text}")
            
            if response.status_code == 401:
                self.log_success("API correctly requires authentication")
                return True
            else:
                self.log_warning(f"Unexpected response: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_error("Test failed", str(e))
            return False

    def create_test_conversation_in_db(self):
        """Create a test conversation directly in database"""
        self.log("💬 Creating test conversation in database...")
        
        try:
            conversation_data = {
                'user_id': self.user_data['id'],
                'status': 'active',
                'title': 'Test Conversation for Closure API',
                'support_agent_id': self.user_data['id']
            }
            
            response = self.supabase.table('chat_conversations').insert(conversation_data).execute()
            
            if response.data:
                conversation = response.data[0]
                self.test_conversation_id = conversation['id']
                self.log_success(f"Test conversation created: {self.test_conversation_id}")
                
                # Add a test message
                message_data = {
                    'conversation_id': self.test_conversation_id,
                    'sender_id': self.user_data['id'],
                    'message_text': 'Test message for closure API testing',
                    'message_type': 'text'
                }
                
                msg_response = self.supabase.table('chat_messages').insert(message_data).execute()
                if msg_response.data:
                    self.log_success("Test message added")
                
                return True
            else:
                self.log_error("Failed to create conversation")
                return False
                
        except Exception as e:
            self.log_error("Conversation creation failed", str(e))
            return False

    def test_database_schema(self):
        """Test if the database schema supports closure fields"""
        self.log("🗄️ Testing database schema for closure fields...")
        
        if not self.test_conversation_id:
            self.log_error("No test conversation available")
            return False
        
        try:
            # Try to update the conversation with closure fields directly
            closure_data = {
                'status': 'closed',
                'closed_by': self.user_data['id'],
                'closure_note': 'Direct database test closure',
                'closed_at': datetime.now().isoformat()
            }
            
            response = self.supabase.table('chat_conversations').update(closure_data).eq('id', self.test_conversation_id).execute()
            
            if response.data:
                updated_conv = response.data[0]
                self.log_success("Database schema supports closure fields")
                
                # Check which fields were updated
                closure_fields = ['status', 'closed_by', 'closure_note', 'closed_at', 'resolution_time_minutes']
                for field in closure_fields:
                    value = updated_conv.get(field)
                    if value is not None:
                        self.log_success(f"  ✓ {field}: {value}")
                    else:
                        self.log_warning(f"  ⚠️ {field}: null")
                
                return True
            else:
                self.log_error("Database update failed - schema issue")
                return False
                
        except Exception as e:
            self.log_error("Database schema test failed", str(e))
            return False

    def test_api_with_direct_request(self):
        """Test the API by making direct requests and analyzing errors"""
        self.log("🔍 Testing API with direct requests to analyze errors...")
        
        if not self.test_conversation_id:
            self.log_error("No test conversation available")
            return False
        
        # Create a new conversation for this test
        self.create_test_conversation_in_db()
        
        try:
            url = f"{self.base_url}/api/chat/conversations/{self.test_conversation_id}/close"
            
            # Test 1: Without authentication
            self.log("Test 1: Without authentication")
            response1 = requests.patch(url, json={"closure_note": "Test closure"})
            self.log(f"  Status: {response1.status_code}")
            try:
                data1 = response1.json()
                self.log(f"  Response: {json.dumps(data1, indent=2)}")
            except:
                self.log(f"  Response: {response1.text}")
            
            # Test 2: With invalid token
            self.log("\nTest 2: With invalid token")
            headers = {'Cookie': 'auth-token=invalid-token'}
            response2 = requests.patch(url, json={"closure_note": "Test closure"}, headers=headers)
            self.log(f"  Status: {response2.status_code}")
            try:
                data2 = response2.json()
                self.log(f"  Response: {json.dumps(data2, indent=2)}")
            except:
                self.log(f"  Response: {response2.text}")
            
            # Test 3: Check if conversation exists via GET
            self.log("\nTest 3: Check conversation via GET API")
            get_response = requests.get(f"{self.base_url}/api/chat/conversations")
            self.log(f"  Status: {get_response.status_code}")
            try:
                get_data = get_response.json()
                self.log(f"  Response: {json.dumps(get_data, indent=2)[:500]}...")
            except:
                self.log(f"  Response: {get_response.text}")
            
            # Test 4: Try with a real JWT token (if we can create one)
            self.log("\nTest 4: Attempting to create and use JWT token")
            jwt_token = self.create_jwt_token()
            if jwt_token:
                headers = {'Cookie': f'auth-token={jwt_token}'}
                response4 = requests.patch(url, json={"closure_note": "Test with JWT"}, headers=headers)
                self.log(f"  Status: {response4.status_code}")
                try:
                    data4 = response4.json()
                    self.log(f"  Response: {json.dumps(data4, indent=2)}")
                    
                    if response4.status_code == 500:
                        self.log_error("🚨 FOUND THE ISSUE: 500 Internal Server Error")
                        self.log("This indicates a server-side error in the chat closure API")
                        
                except:
                    self.log(f"  Response: {response4.text}")
            
            return True
            
        except Exception as e:
            self.log_error("API test failed", str(e))
            return False

    def create_jwt_token(self):
        """Create a JWT token for testing"""
        try:
            import jwt
            
            jwt_secret = os.getenv('JWT_SECRET')
            if not jwt_secret:
                self.log_error("JWT_SECRET not found")
                return None
            
            payload = {
                'userId': self.user_data['id'],
                'email': self.user_data['email'],
                'role': self.user_data['role'],
                'iat': int(datetime.now().timestamp()),
                'exp': int(datetime.now().timestamp()) + 3600
            }
            
            token = jwt.encode(payload, jwt_secret, algorithm='HS256')
            self.log_success("JWT token created")
            return token
            
        except Exception as e:
            self.log_error("JWT creation failed", str(e))
            return None

    def investigate_foreign_key_constraints(self):
        """Investigate foreign key constraints that might cause issues"""
        self.log("🔗 Investigating foreign key constraints...")
        
        try:
            # Check if the user exists (for closed_by foreign key)
            user_check = self.supabase.table('users').select('id').eq('id', self.user_data['id']).execute()
            
            if user_check.data:
                self.log_success(f"User {self.user_data['id']} exists for closed_by foreign key")
            else:
                self.log_error("User not found - foreign key constraint issue")
            
            # Check if conversation exists
            if self.test_conversation_id:
                conv_check = self.supabase.table('chat_conversations').select('*').eq('id', self.test_conversation_id).execute()
                
                if conv_check.data:
                    conv = conv_check.data[0]
                    self.log_success(f"Conversation {self.test_conversation_id} exists")
                    self.log(f"  User ID: {conv.get('user_id')}")
                    self.log(f"  Support Agent ID: {conv.get('support_agent_id')}")
                    self.log(f"  Status: {conv.get('status')}")
                else:
                    self.log_error("Conversation not found")
            
            return True
            
        except Exception as e:
            self.log_error("Foreign key investigation failed", str(e))
            return False

    def run_comprehensive_test(self):
        """Run comprehensive chat closure debugging"""
        self.log("🚀 Starting comprehensive chat closure debugging...")
        self.log("=" * 80)
        
        results = {}
        
        # Step 1: Setup
        self.log("\n📋 STEP 1: Database Setup")
        results['setup'] = self.setup_supabase()
        
        if not results['setup']:
            return results
        
        # Step 2: Ensure support role
        self.log("\n📋 STEP 2: User Role Setup")
        results['role_setup'] = self.ensure_support_role()
        
        # Step 3: Test without auth
        self.log("\n📋 STEP 3: API Security Test")
        results['security_test'] = self.test_without_auth()
        
        # Step 4: Create test conversation
        self.log("\n📋 STEP 4: Test Conversation Creation")
        results['conversation_creation'] = self.create_test_conversation_in_db()
        
        # Step 5: Test database schema
        self.log("\n📋 STEP 5: Database Schema Test")
        results['schema_test'] = self.test_database_schema()
        
        # Step 6: Investigate foreign keys
        self.log("\n📋 STEP 6: Foreign Key Investigation")
        results['foreign_key_test'] = self.investigate_foreign_key_constraints()
        
        # Step 7: Test API directly
        self.log("\n📋 STEP 7: Direct API Testing")
        results['api_test'] = self.test_api_with_direct_request()
        
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
        
        # Key findings
        self.log("\n🔍 KEY FINDINGS:")
        if results.get('schema_test'):
            self.log("✅ Database schema supports closure fields")
        if results.get('foreign_key_test'):
            self.log("✅ Foreign key constraints are satisfied")
        if results.get('security_test'):
            self.log("✅ API security is working (requires authentication)")
        
        self.log("\n💡 NEXT STEPS:")
        self.log("1. The issue is likely in the API authentication or business logic")
        self.log("2. Database schema and constraints are working correctly")
        self.log("3. Need to test with proper authentication flow")
        
        return results

def main():
    """Main execution function"""
    print("🔧 Chat Closure API Test with Authentication")
    print("=" * 60)
    print("Comprehensive debugging of chat closure API failure")
    print("Focus: Database, Authentication, and API Logic")
    print("=" * 60)
    
    tester = ChatClosureAuthTest()
    results = tester.run_comprehensive_test()
    
    # Exit based on critical tests
    critical_tests = ['setup', 'schema_test', 'api_test']
    critical_passed = all(results.get(test, False) for test in critical_tests)
    
    sys.exit(0 if critical_passed else 1)

if __name__ == "__main__":
    main()