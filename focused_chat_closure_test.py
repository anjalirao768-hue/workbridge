#!/usr/bin/env python3
"""
Focused Chat Closure API Test
============================

This test focuses specifically on debugging the chat closure API failure.
It will:
1. Check user role in database
2. Create a test conversation
3. Test the PATCH /api/chat/conversations/[id]/close endpoint
4. Investigate specific error details
"""

import requests
import json
import os
import sys
from datetime import datetime
from supabase import create_client, Client

class FocusedChatClosureTest:
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
            # Load environment variables
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

    def check_user_role(self):
        """Check and ensure user has support role"""
        self.log("🔍 Checking user role in database...")
        
        try:
            response = self.supabase.table('users').select('*').eq('email', self.target_email).execute()
            
            if not response.data:
                self.log_error("User not found in database")
                return False
                
            user = response.data[0]
            self.user_data = user
            
            role = user.get('role')
            email_verified = user.get('email_verified')
            user_id = user.get('id')
            
            self.log(f"User found: {self.target_email}")
            self.log(f"  User ID: {user_id}")
            self.log(f"  Role: {role}")
            self.log(f"  Email verified: {email_verified}")
            
            if role not in ['support', 'admin']:
                self.log_warning(f"User has '{role}' role, updating to 'support'...")
                
                # Update user role to support
                update_response = self.supabase.table('users').update({
                    'role': 'support',
                    'email_verified': True
                }).eq('email', self.target_email).execute()
                
                if update_response.data:
                    self.log_success("User role updated to 'support'")
                    self.user_data['role'] = 'support'
                    self.user_data['email_verified'] = True
                    return True
                else:
                    self.log_error("Failed to update user role")
                    return False
            else:
                self.log_success(f"User has correct role: {role}")
                return True
                
        except Exception as e:
            self.log_error("Database query failed", str(e))
            return False

    def create_jwt_token(self):
        """Create a JWT token for the user"""
        try:
            import jwt
            
            jwt_secret = os.getenv('JWT_SECRET')
            if not jwt_secret:
                self.log_error("JWT_SECRET not found in environment")
                return None
            
            payload = {
                'userId': self.user_data['id'],
                'email': self.user_data['email'],
                'role': self.user_data['role'],
                'iat': int(datetime.now().timestamp()),
                'exp': int(datetime.now().timestamp()) + 86400  # 24 hours
            }
            
            token = jwt.encode(payload, jwt_secret, algorithm='HS256')
            self.log_success("JWT token created successfully")
            return token
            
        except Exception as e:
            self.log_error("Failed to create JWT token", str(e))
            return None

    def authenticate_session(self):
        """Authenticate the session with JWT token"""
        token = self.create_jwt_token()
        if not token:
            return False
            
        # Set the auth token as a cookie
        self.session.cookies.set('auth-token', token, domain='localhost')
        
        # Test authentication
        try:
            response = self.session.get(f"{self.base_url}/api/user/me")
            
            if response.status_code == 200:
                user_info = response.json()
                self.log_success(f"Authentication successful: {user_info.get('email')} ({user_info.get('role')})")
                return True
            else:
                self.log_error(f"Authentication failed: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_error("Authentication test failed", str(e))
            return False

    def create_test_conversation(self):
        """Create a test conversation for closure testing"""
        self.log("💬 Creating test conversation...")
        
        try:
            # Create conversation directly in database
            conversation_data = {
                'user_id': self.user_data['id'],
                'status': 'active',
                'title': 'Test Conversation for Closure',
                'support_agent_id': self.user_data['id']  # Assign to the support agent
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
                    'message_text': 'This is a test message for closure testing',
                    'message_type': 'text'
                }
                
                msg_response = self.supabase.table('chat_messages').insert(message_data).execute()
                if msg_response.data:
                    self.log_success("Test message added to conversation")
                
                return True
            else:
                self.log_error("Failed to create test conversation")
                return False
                
        except Exception as e:
            self.log_error("Conversation creation failed", str(e))
            return False

    def test_chat_closure_endpoint(self):
        """Test the chat closure API endpoint"""
        self.log("🔒 Testing chat closure API endpoint...")
        
        if not self.test_conversation_id:
            self.log_error("No test conversation available")
            return False
        
        test_cases = [
            {
                "name": "Basic closure without note",
                "data": {},
                "expected_success": True
            },
            {
                "name": "Closure with note",
                "data": {"closure_note": "Issue resolved - customer inquiry answered"},
                "expected_success": True
            }
        ]
        
        for i, test_case in enumerate(test_cases):
            self.log(f"\n--- Test Case {i+1}: {test_case['name']} ---")
            
            # Create new conversation for each test after the first
            if i > 0:
                self.create_test_conversation()
            
            try:
                url = f"{self.base_url}/api/chat/conversations/{self.test_conversation_id}/close"
                self.log(f"URL: {url}")
                self.log(f"Data: {json.dumps(test_case['data'])}")
                
                response = self.session.patch(url, json=test_case['data'])
                
                self.log(f"Response Status: {response.status_code}")
                self.log(f"Response Headers: {dict(response.headers)}")
                
                try:
                    response_data = response.json()
                    self.log(f"Response Data: {json.dumps(response_data, indent=2)}")
                except:
                    self.log(f"Response Text: {response.text}")
                    response_data = {}
                
                # Analyze the response
                if response.status_code == 200:
                    if response_data.get('success'):
                        self.log_success(f"✅ {test_case['name']} - SUCCESS")
                        
                        # Verify closure data
                        closure_data = response_data.get('data', {})
                        self.log("Closure verification:")
                        self.log(f"  Status: {closure_data.get('status')}")
                        self.log(f"  Closed by: {closure_data.get('closed_by')}")
                        self.log(f"  Closed at: {closure_data.get('closed_at')}")
                        self.log(f"  Closure note: {closure_data.get('closure_note')}")
                        self.log(f"  Resolution time: {closure_data.get('resolution_time_minutes')} minutes")
                        
                    else:
                        self.log_error(f"❌ {test_case['name']} - API returned success=false", response_data.get('error'))
                        
                elif response.status_code == 401:
                    self.log_error(f"❌ {test_case['name']} - Authentication failed")
                    
                elif response.status_code == 403:
                    self.log_error(f"❌ {test_case['name']} - Access denied (role/permission issue)")
                    
                elif response.status_code == 404:
                    self.log_error(f"❌ {test_case['name']} - Conversation not found")
                    
                elif response.status_code == 500:
                    self.log_error(f"❌ {test_case['name']} - Internal server error")
                    self.log("🔍 This is likely the database issue we're investigating!")
                    
                    # Try to get more details from the database
                    self.investigate_database_error()
                    
                else:
                    self.log_error(f"❌ {test_case['name']} - Unexpected status: {response.status_code}")
                
            except Exception as e:
                self.log_error(f"Test case failed: {test_case['name']}", str(e))
        
        return True

    def investigate_database_error(self):
        """Investigate database-related errors"""
        self.log("🔍 Investigating database schema and constraints...")
        
        try:
            # Check if conversation exists
            conv_response = self.supabase.table('chat_conversations').select('*').eq('id', self.test_conversation_id).execute()
            
            if conv_response.data:
                conversation = conv_response.data[0]
                self.log("Conversation found in database:")
                self.log(f"  ID: {conversation.get('id')}")
                self.log(f"  Status: {conversation.get('status')}")
                self.log(f"  User ID: {conversation.get('user_id')}")
                self.log(f"  Support Agent ID: {conversation.get('support_agent_id')}")
                self.log(f"  Closed by: {conversation.get('closed_by')}")
                self.log(f"  Closed at: {conversation.get('closed_at')}")
                self.log(f"  Closure note: {conversation.get('closure_note')}")
                
                # Check if closure fields exist
                closure_fields = ['closed_by', 'closure_note', 'closed_at', 'resolution_time_minutes']
                for field in closure_fields:
                    if field in conversation:
                        self.log_success(f"  ✓ {field} field exists")
                    else:
                        self.log_error(f"  ✗ {field} field missing")
                        
            else:
                self.log_error("Conversation not found in database")
                
            # Try to manually update the conversation to test database constraints
            self.log("Testing manual database update...")
            
            update_data = {
                'status': 'closed',
                'closed_by': self.user_data['id'],
                'closure_note': 'Manual test closure'
            }
            
            manual_response = self.supabase.table('chat_conversations').update(update_data).eq('id', self.test_conversation_id).execute()
            
            if manual_response.data:
                self.log_success("Manual database update successful")
                self.log("This suggests the API code has an issue, not the database schema")
            else:
                self.log_error("Manual database update failed")
                self.log("This suggests a database schema or constraint issue")
                
        except Exception as e:
            self.log_error("Database investigation failed", str(e))

    def check_database_triggers(self):
        """Check if database triggers exist for closure fields"""
        self.log("⚡ Checking database triggers...")
        
        try:
            # This would require direct database access to check triggers
            # For now, we'll test if the triggers work by checking if closed_at gets set automatically
            
            if self.test_conversation_id:
                # Get conversation before update
                before_response = self.supabase.table('chat_conversations').select('*').eq('id', self.test_conversation_id).execute()
                
                if before_response.data:
                    before_conv = before_response.data[0]
                    self.log(f"Before update - closed_at: {before_conv.get('closed_at')}")
                    
                    # Update status to closed
                    update_response = self.supabase.table('chat_conversations').update({
                        'status': 'closed',
                        'closed_by': self.user_data['id']
                    }).eq('id', self.test_conversation_id).execute()
                    
                    if update_response.data:
                        after_conv = update_response.data[0]
                        self.log(f"After update - closed_at: {after_conv.get('closed_at')}")
                        
                        if after_conv.get('closed_at') and not before_conv.get('closed_at'):
                            self.log_success("Database trigger is working - closed_at was set automatically")
                        else:
                            self.log_warning("Database trigger may not be working - closed_at not set")
                            
        except Exception as e:
            self.log_error("Trigger check failed", str(e))

    def run_focused_test(self):
        """Run the focused chat closure test"""
        self.log("🚀 Starting focused chat closure API test...")
        self.log("=" * 80)
        
        # Step 1: Setup
        if not self.setup_supabase():
            return False
            
        # Step 2: Check user role
        if not self.check_user_role():
            return False
            
        # Step 3: Authenticate session
        if not self.authenticate_session():
            return False
            
        # Step 4: Create test conversation
        if not self.create_test_conversation():
            return False
            
        # Step 5: Test chat closure endpoint
        self.test_chat_closure_endpoint()
        
        # Step 6: Check database triggers
        self.check_database_triggers()
        
        self.log("=" * 80)
        self.log("🎯 Focused chat closure test completed")
        
        return True

def main():
    """Main execution function"""
    print("🔧 Focused Chat Closure API Test")
    print("=" * 50)
    print("Debugging the specific chat closure API failure")
    print("Focus: PATCH /api/chat/conversations/[id]/close")
    print("=" * 50)
    
    tester = FocusedChatClosureTest()
    success = tester.run_focused_test()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()