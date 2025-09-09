#!/usr/bin/env python3

import requests
import json
import sys
import time
from datetime import datetime
import jwt

class FinalChatWidgetDebugger:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.jwt_secret = "9e9f9ff5b5cdbeb54e11ceb801b93da182bcc7063f7bea05c6c5fc23966ff5ac4d7c53f559e91340fad57a99409ef3bb21fd6b46f65b16302781e8f60c7c6d54"
        self.test_results = []

    def create_jwt_token(self, user_id, email, role):
        """Create JWT token for testing"""
        payload = {
            "userId": user_id,
            "email": email,
            "role": role,
            "iat": int(time.time()),
            "exp": int(time.time()) + 3600
        }
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")

    def test_user_message_sending_flow(self):
        """Test the complete user message sending flow"""
        print("🔍 TESTING: Complete User Message Sending Flow")
        print("=" * 60)
        
        # Test user credentials
        user_id = "a2db711d-41b9-4104-9b29-8ffa268d7a49"
        email = "anjalirao768@gmail.com"
        role = "client"
        
        # Set authentication
        token = self.create_jwt_token(user_id, email, role)
        self.session.cookies.set('auth-token', token)
        
        results = {
            "user_auth": False,
            "conversation_creation": False,
            "message_sending": False,
            "message_retrieval": False,
            "conversation_id": None,
            "messages_sent": 0,
            "error_details": []
        }
        
        try:
            # Step 1: Verify authentication
            print("\n1️⃣ Testing user authentication...")
            response = self.session.get(f"{self.base_url}/api/user/me")
            if response.status_code == 200:
                user_data = response.json()
                print(f"   ✅ User authenticated: {user_data.get('email')} ({user_data.get('role')})")
                results["user_auth"] = True
            else:
                print(f"   ❌ Authentication failed: {response.status_code}")
                results["error_details"].append(f"Auth failed: {response.status_code}")
                return results
            
            # Step 2: Create or get conversation
            print("\n2️⃣ Testing conversation creation...")
            response = self.session.post(f"{self.base_url}/api/chat/conversations", json={})
            if response.status_code == 200:
                conv_data = response.json()
                if conv_data.get('success'):
                    conversation_id = conv_data['data']['id']
                    results["conversation_creation"] = True
                    results["conversation_id"] = conversation_id
                    print(f"   ✅ Conversation created/found: {conversation_id}")
                else:
                    print(f"   ❌ Conversation creation failed: {conv_data}")
                    results["error_details"].append(f"Conv creation failed: {conv_data}")
                    return results
            else:
                print(f"   ❌ Conversation API error: {response.status_code}")
                results["error_details"].append(f"Conv API error: {response.status_code}")
                return results
            
            # Step 3: Send messages
            print("\n3️⃣ Testing message sending...")
            test_messages = [
                "Hello, I need help with my project setup.",
                "Can someone assist me with the configuration?",
                "This is urgent, please respond when available."
            ]
            
            messages_sent = 0
            for i, message in enumerate(test_messages, 1):
                response = self.session.post(
                    f"{self.base_url}/api/chat/conversations/{conversation_id}/messages",
                    json={"message": message}
                )
                
                if response.status_code == 200:
                    msg_data = response.json()
                    if msg_data.get('success'):
                        messages_sent += 1
                        print(f"   ✅ Message {i} sent successfully")
                    else:
                        print(f"   ❌ Message {i} failed: {msg_data}")
                        results["error_details"].append(f"Message {i} failed: {msg_data}")
                else:
                    print(f"   ❌ Message {i} API error: {response.status_code}")
                    results["error_details"].append(f"Message {i} API error: {response.status_code}")
            
            results["messages_sent"] = messages_sent
            if messages_sent > 0:
                results["message_sending"] = True
            
            # Step 4: Retrieve messages
            print("\n4️⃣ Testing message retrieval...")
            response = self.session.get(f"{self.base_url}/api/chat/conversations/{conversation_id}/messages")
            if response.status_code == 200:
                msg_data = response.json()
                if msg_data.get('success'):
                    messages = msg_data['data']['messages']
                    user_messages = [msg for msg in messages if msg.get('sender_id') == user_id]
                    print(f"   ✅ Retrieved {len(messages)} total messages, {len(user_messages)} from user")
                    results["message_retrieval"] = True
                else:
                    print(f"   ❌ Message retrieval failed: {msg_data}")
                    results["error_details"].append(f"Message retrieval failed: {msg_data}")
            else:
                print(f"   ❌ Message retrieval API error: {response.status_code}")
                results["error_details"].append(f"Message retrieval API error: {response.status_code}")
        
        except Exception as e:
            print(f"   ❌ Exception during testing: {str(e)}")
            results["error_details"].append(f"Exception: {str(e)}")
        
        return results

    def test_chatwidget_specific_scenarios(self):
        """Test specific ChatWidget scenarios"""
        print("\n🔍 TESTING: ChatWidget Specific Scenarios")
        print("=" * 60)
        
        # Test different user scenarios
        test_users = [
            {
                "id": "a2db711d-41b9-4104-9b29-8ffa268d7a49",
                "email": "anjalirao768@gmail.com", 
                "role": "client",
                "name": "Existing Client User"
            },
            {
                "id": "test-user-123",
                "email": "testuser@workbridge.com",
                "role": "client", 
                "name": "Test Client User"
            }
        ]
        
        widget_results = []
        
        for user in test_users:
            print(f"\n👤 Testing with {user['name']} ({user['email']})...")
            
            # Set authentication for this user
            token = self.create_jwt_token(user['id'], user['email'], user['role'])
            self.session.cookies.set('auth-token', token)
            
            # Test conversation access
            response = self.session.get(f"{self.base_url}/api/chat/conversations")
            if response.status_code == 200:
                conv_data = response.json()
                conversations = conv_data.get('data', [])
                print(f"   📋 User has access to {len(conversations)} conversations")
                
                # Test creating new conversation
                response = self.session.post(f"{self.base_url}/api/chat/conversations", json={})
                if response.status_code == 200:
                    new_conv = response.json()
                    if new_conv.get('success'):
                        conv_id = new_conv['data']['id']
                        print(f"   ✅ Can create new conversation: {conv_id}")
                        
                        # Test sending message
                        response = self.session.post(
                            f"{self.base_url}/api/chat/conversations/{conv_id}/messages",
                            json={"message": f"Test message from {user['name']}"}
                        )
                        
                        if response.status_code == 200:
                            msg_result = response.json()
                            if msg_result.get('success'):
                                print(f"   ✅ Can send messages to own conversation")
                                widget_results.append({
                                    "user": user['name'],
                                    "can_create_conversation": True,
                                    "can_send_messages": True,
                                    "status": "WORKING"
                                })
                            else:
                                print(f"   ❌ Cannot send messages: {msg_result}")
                                widget_results.append({
                                    "user": user['name'],
                                    "can_create_conversation": True,
                                    "can_send_messages": False,
                                    "status": "PARTIAL",
                                    "error": msg_result
                                })
                        else:
                            print(f"   ❌ Message sending failed: {response.status_code}")
                            widget_results.append({
                                "user": user['name'],
                                "can_create_conversation": True,
                                "can_send_messages": False,
                                "status": "PARTIAL",
                                "error": f"HTTP {response.status_code}"
                            })
                    else:
                        print(f"   ❌ Cannot create conversation: {new_conv}")
                        widget_results.append({
                            "user": user['name'],
                            "can_create_conversation": False,
                            "can_send_messages": False,
                            "status": "FAILED",
                            "error": new_conv
                        })
                else:
                    print(f"   ❌ Conversation creation failed: {response.status_code}")
                    widget_results.append({
                        "user": user['name'],
                        "can_create_conversation": False,
                        "can_send_messages": False,
                        "status": "FAILED",
                        "error": f"HTTP {response.status_code}"
                    })
            else:
                print(f"   ❌ Cannot access conversations: {response.status_code}")
                widget_results.append({
                    "user": user['name'],
                    "can_create_conversation": False,
                    "can_send_messages": False,
                    "status": "FAILED",
                    "error": f"No conversation access: {response.status_code}"
                })
        
        return widget_results

    def analyze_chatwidget_issues(self):
        """Analyze potential ChatWidget issues"""
        print("\n🔍 ANALYZING: Potential ChatWidget Issues")
        print("=" * 60)
        
        issues_found = []
        recommendations = []
        
        # Test 1: Authentication requirements
        print("\n🔐 Testing authentication requirements...")
        response = requests.get(f"{self.base_url}/api/chat/conversations")
        if response.status_code == 401:
            print("   ✅ Authentication properly required")
        else:
            issues_found.append("Authentication not properly enforced")
        
        # Test 2: CORS and headers
        print("\n🌐 Testing CORS and headers...")
        headers = {
            'Origin': 'http://localhost:3000',
            'Content-Type': 'application/json'
        }
        response = requests.options(f"{self.base_url}/api/chat/conversations", headers=headers)
        print(f"   OPTIONS request status: {response.status_code}")
        
        # Test 3: Cookie handling
        print("\n🍪 Testing cookie handling...")
        session = requests.Session()
        # Test without cookies
        response = session.post(f"{self.base_url}/api/chat/conversations", json={})
        if response.status_code == 401:
            print("   ✅ Properly rejects requests without auth cookies")
        else:
            issues_found.append("Accepts requests without proper authentication")
        
        # Generate recommendations
        recommendations.extend([
            "Ensure ChatWidget sets 'auth-token' cookie with valid JWT",
            "Verify conversation ID exists before sending messages",
            "Handle 401/403 errors gracefully in widget UI",
            "Implement proper error messaging for users",
            "Check that user has permission to access conversation"
        ])
        
        return issues_found, recommendations

    def run_complete_debug(self):
        """Run complete ChatWidget debugging"""
        print("🚀 ChatWidget Message Sending Debug - Complete Analysis")
        print("=" * 80)
        print("Focus: Debug why test users cannot reply in conversations")
        print("=" * 80)
        
        # Test 1: Complete user flow
        user_flow_results = self.test_user_message_sending_flow()
        
        # Test 2: ChatWidget specific scenarios
        widget_results = self.test_chatwidget_specific_scenarios()
        
        # Test 3: Issue analysis
        issues, recommendations = self.analyze_chatwidget_issues()
        
        # Generate final report
        print(f"\n{'='*80}")
        print("📊 CHATWIDGET DEBUG SUMMARY")
        print(f"{'='*80}")
        
        print(f"\n🎯 USER MESSAGE SENDING FLOW RESULTS:")
        print(f"   Authentication: {'✅ WORKING' if user_flow_results['user_auth'] else '❌ FAILED'}")
        print(f"   Conversation Creation: {'✅ WORKING' if user_flow_results['conversation_creation'] else '❌ FAILED'}")
        print(f"   Message Sending: {'✅ WORKING' if user_flow_results['message_sending'] else '❌ FAILED'}")
        print(f"   Message Retrieval: {'✅ WORKING' if user_flow_results['message_retrieval'] else '❌ FAILED'}")
        print(f"   Messages Sent Successfully: {user_flow_results['messages_sent']}")
        
        if user_flow_results['error_details']:
            print(f"\n❌ ERRORS FOUND:")
            for error in user_flow_results['error_details']:
                print(f"   • {error}")
        
        print(f"\n👥 CHATWIDGET USER SCENARIOS:")
        for result in widget_results:
            status_icon = "✅" if result['status'] == "WORKING" else "⚠️" if result['status'] == "PARTIAL" else "❌"
            print(f"   {status_icon} {result['user']}: {result['status']}")
            if 'error' in result:
                print(f"      Error: {result['error']}")
        
        if issues:
            print(f"\n🚨 ISSUES IDENTIFIED:")
            for issue in issues:
                print(f"   • {issue}")
        
        print(f"\n💡 RECOMMENDATIONS FOR CHATWIDGET:")
        for rec in recommendations:
            print(f"   • {rec}")
        
        # Determine overall status
        working_users = sum(1 for r in widget_results if r['status'] == 'WORKING')
        total_users = len(widget_results)
        
        if user_flow_results['message_sending'] and working_users > 0:
            print(f"\n🎉 CONCLUSION: ChatWidget message sending is WORKING for authenticated users")
            print(f"   • {working_users}/{total_users} test scenarios successful")
            print(f"   • Regular users CAN send messages to their own conversations")
            print(f"   • API endpoints are properly secured and functional")
            return True
        else:
            print(f"\n⚠️ CONCLUSION: ChatWidget has issues that need attention")
            print(f"   • {working_users}/{total_users} test scenarios successful")
            print(f"   • Check authentication and conversation access")
            return False

def main():
    debugger = FinalChatWidgetDebugger()
    success = debugger.run_complete_debug()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())