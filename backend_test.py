#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

class WorkBridgeAPITester:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=default_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=default_headers)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Try to parse JSON response
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    print(f"   Response (text): {response.text[:200]}...")
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error (text): {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_signup(self, email, password):
        """Test user signup"""
        signup_data = {
            "email": email,
            "password": password,
            "cover_letter": "Test cover letter for API testing",
            "experiences": "Test experiences for API testing",
            "age": 30,
            "skills": ["JavaScript", "React", "Node.js"]
        }
        
        success, response = self.run_test(
            "User Signup",
            "POST",
            "/api/signup",
            200,  # Expecting 200 for successful signup
            data=signup_data
        )
        
        if success and isinstance(response, dict) and response.get('ok'):
            print(f"✅ Signup successful for {email}")
            return True, response.get('user', {})
        else:
            print(f"❌ Signup failed for {email}")
            return False, {}

    def test_login(self, email, password):
        """Test user login"""
        login_data = {
            "email": email,
            "password": password
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "/api/login",
            200,
            data=login_data
        )
        
        if success and isinstance(response, dict) and response.get('ok'):
            print(f"✅ Login successful for {email}")
            return True, response.get('user', {})
        else:
            print(f"❌ Login failed for {email}")
            return False, {}

    def test_user_me(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "/api/user/me",
            200
        )
        return success, response

    def test_projects_list(self):
        """Test getting projects list"""
        success, response = self.run_test(
            "List Projects",
            "GET",
            "/api/projects",
            200
        )
        return success, response

    def test_create_project(self):
        """Test creating a project"""
        project_data = {
            "title": "Test Project",
            "description": "This is a test project for API testing",
            "budget": 1000,
            "skills_required": ["JavaScript", "React"],
            "deadline": "2024-12-31"
        }
        
        success, response = self.run_test(
            "Create Project",
            "POST",
            "/api/projects",
            200,
            data=project_data
        )
        return success, response

def main():
    print("🚀 Starting WorkBridge API Testing...")
    print("=" * 50)
    
    tester = WorkBridgeAPITester()
    
    # Test data
    test_email = f"testuser_{datetime.now().strftime('%H%M%S')}@test.com"
    test_password = "password123"
    
    print(f"📧 Using test email: {test_email}")
    
    # Test 1: Signup
    signup_success, user_data = tester.test_signup(test_email, test_password)
    
    # Test 2: Login (only if signup worked)
    if signup_success:
        login_success, login_data = tester.test_login(test_email, test_password)
        
        # Test 3: Get current user info (only if login worked)
        if login_success:
            me_success, me_data = tester.test_user_me()
            
            # Test 4: List projects
            projects_success, projects_data = tester.test_projects_list()
            
            # Test 5: Create project (only if user is client)
            if me_success and isinstance(me_data, dict):
                user_role = me_data.get('role', 'unknown')
                print(f"👤 User role: {user_role}")
                
                if user_role == 'client':
                    create_success, create_data = tester.test_create_project()
                else:
                    print("ℹ️  Skipping project creation (user is not a client)")
    
    # Test 6: Test unauthenticated endpoints
    print("\n🔒 Testing unauthenticated access...")
    unauth_success, unauth_data = tester.test_user_me()
    if not unauth_success:
        print("✅ Unauthenticated access properly blocked")
    else:
        print("⚠️  Unauthenticated access allowed (potential security issue)")
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary:")
    print(f"   Tests run: {tester.tests_run}")
    print(f"   Tests passed: {tester.tests_passed}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())