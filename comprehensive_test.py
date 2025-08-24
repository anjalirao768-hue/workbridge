#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

class WorkBridgeComprehensiveTest:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "name": name,
            "success": success,
            "details": details
        }
        self.test_results.append(result)
        
        status = "✅" if success else "❌"
        print(f"{status} {name}: {details}")

    def test_api_endpoint(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Test a single API endpoint"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        try:
            if method == 'GET':
                response = self.session.get(url, headers=default_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=default_headers)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True, f"Status {response.status_code}")
                    return True, response_data
                except:
                    self.log_test(name, True, f"Status {response.status_code} (non-JSON)")
                    return True, response.text
            else:
                try:
                    error_data = response.json()
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}: {error_data.get('error', 'Unknown error')}")
                except:
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_authentication_flow(self):
        """Test complete authentication flow"""
        print("\n🔐 Testing Authentication Flow...")
        
        # Test 1: User Signup
        timestamp = datetime.now().strftime('%H%M%S')
        test_users = [
            {
                "email": f"client_{timestamp}@test.com",
                "password": "password123",
                "role_expected": "user",
                "cover_letter": "I am a client looking to hire freelancers",
                "experiences": "I have managed web development projects",
                "age": 30,
                "skills": ["Project Management", "Web Development"]
            },
            {
                "email": f"freelancer_{timestamp}@test.com", 
                "password": "password123",
                "role_expected": "user",
                "cover_letter": "I am a freelancer specializing in web development",
                "experiences": "5 years of full-stack development experience",
                "age": 28,
                "skills": ["JavaScript", "React", "Node.js", "Python"]
            }
        ]
        
        authenticated_users = []
        
        for user_data in test_users:
            # Signup
            signup_success, signup_response = self.test_api_endpoint(
                f"Signup - {user_data['email']}",
                "POST",
                "/api/signup",
                200,
                data=user_data
            )
            
            if signup_success and isinstance(signup_response, dict) and signup_response.get('ok'):
                user_info = signup_response.get('user', {})
                
                # Login
                login_success, login_response = self.test_api_endpoint(
                    f"Login - {user_data['email']}",
                    "POST", 
                    "/api/login",
                    200,
                    data={"email": user_data['email'], "password": user_data['password']}
                )
                
                if login_success and isinstance(login_response, dict) and login_response.get('ok'):
                    authenticated_users.append({
                        "email": user_data['email'],
                        "user_info": login_response.get('user', {}),
                        "expected_role": user_data['role_expected']
                    })
        
        return authenticated_users

    def test_user_management_apis(self, authenticated_users):
        """Test user management APIs"""
        print("\n👤 Testing User Management APIs...")
        
        for user in authenticated_users:
            # Test /api/user/me
            me_success, me_response = self.test_api_endpoint(
                f"Get User Info - {user['email']}",
                "GET",
                "/api/user/me", 
                200
            )
            
            if me_success and isinstance(me_response, dict):
                expected_role = user['expected_role']
                actual_role = me_response.get('role')
                
                if actual_role == expected_role:
                    self.log_test(f"Role Verification - {user['email']}", True, f"Role: {actual_role}")
                else:
                    self.log_test(f"Role Verification - {user['email']}", False, f"Expected {expected_role}, got {actual_role}")

    def test_role_update_apis(self, authenticated_users):
        """Test role update functionality"""
        print("\n🔄 Testing Role Update APIs...")
        
        if authenticated_users:
            user = authenticated_users[0]  # Test with first user
            
            # Test updating to client role
            client_update_success, client_response = self.test_api_endpoint(
                f"Update to Client Role - {user['email']}",
                "POST",
                "/api/user/update-role",
                200,
                data={"role": "client"}
            )
            
            if client_update_success:
                # Verify role change
                me_success, me_response = self.test_api_endpoint(
                    f"Verify Client Role - {user['email']}",
                    "GET",
                    "/api/user/me",
                    200
                )
                
                if me_success and isinstance(me_response, dict):
                    if me_response.get('role') == 'client':
                        self.log_test(f"Client Role Update Verified - {user['email']}", True, "Role successfully updated to client")
                    else:
                        self.log_test(f"Client Role Update Verified - {user['email']}", False, f"Role is {me_response.get('role')}, expected client")

    def test_projects_api(self):
        """Test projects API functionality"""
        print("\n📋 Testing Projects API...")
        
        # Test listing projects (this might fail due to database issues)
        projects_success, projects_response = self.test_api_endpoint(
            "List Projects",
            "GET",
            "/api/projects",
            200
        )
        
        # Test creating a project (requires client role)
        project_data = {
            "title": "Test Web Development Project",
            "description": "A test project for API validation",
            "budget": 2500,
            "skills_required": ["JavaScript", "React", "Node.js"],
            "deadline": "2024-12-31"
        }
        
        create_success, create_response = self.test_api_endpoint(
            "Create Project",
            "POST",
            "/api/projects", 
            200,
            data=project_data
        )

    def test_security_aspects(self):
        """Test security aspects"""
        print("\n🔒 Testing Security Aspects...")
        
        # Test accessing protected endpoints without authentication
        # First, clear any existing session
        self.session.cookies.clear()
        
        unauth_success, unauth_response = self.test_api_endpoint(
            "Unauthenticated Access to /api/user/me",
            "GET",
            "/api/user/me",
            401  # Should return 401 Unauthorized
        )
        
        # Test accessing projects without auth
        unauth_projects_success, unauth_projects_response = self.test_api_endpoint(
            "Unauthenticated Access to /api/projects",
            "GET", 
            "/api/projects",
            401  # Should return 401 Unauthorized
        )

    def test_api_error_handling(self):
        """Test API error handling"""
        print("\n⚠️ Testing API Error Handling...")
        
        # Test signup with missing data
        missing_data_success, missing_response = self.test_api_endpoint(
            "Signup with Missing Data",
            "POST",
            "/api/signup",
            400,  # Should return 400 Bad Request
            data={"email": "test@test.com"}  # Missing password
        )
        
        # Test login with invalid credentials
        invalid_login_success, invalid_response = self.test_api_endpoint(
            "Login with Invalid Credentials",
            "POST",
            "/api/login", 
            401,  # Should return 401 Unauthorized
            data={"email": "nonexistent@test.com", "password": "wrongpassword"}
        )
        
        # Test duplicate email signup
        duplicate_email = f"duplicate_{datetime.now().strftime('%H%M%S')}@test.com"
        
        # First signup
        first_signup_success, first_response = self.test_api_endpoint(
            "First Signup with Email",
            "POST",
            "/api/signup",
            200,
            data={
                "email": duplicate_email,
                "password": "password123",
                "age": 25,
                "skills": ["Testing"]
            }
        )
        
        # Duplicate signup
        if first_signup_success:
            duplicate_success, duplicate_response = self.test_api_endpoint(
                "Duplicate Email Signup",
                "POST",
                "/api/signup",
                400,  # Should return 400 Bad Request
                data={
                    "email": duplicate_email,
                    "password": "password123",
                    "age": 25,
                    "skills": ["Testing"]
                }
            )

    def run_comprehensive_test(self):
        """Run all tests"""
        print("🚀 Starting WorkBridge Comprehensive Testing...")
        print("=" * 60)
        
        # Test 1: Authentication Flow
        authenticated_users = self.test_authentication_flow()
        
        # Test 2: User Management APIs
        if authenticated_users:
            self.test_user_management_apis(authenticated_users)
            self.test_role_update_apis(authenticated_users)
        
        # Test 3: Projects API
        self.test_projects_api()
        
        # Test 4: Security Aspects
        self.test_security_aspects()
        
        # Test 5: Error Handling
        self.test_api_error_handling()
        
        # Print detailed results
        self.print_detailed_results()
        
        return self.tests_passed == self.tests_run

    def print_detailed_results(self):
        """Print detailed test results"""
        print("\n" + "=" * 60)
        print("📊 COMPREHENSIVE TEST RESULTS")
        print("=" * 60)
        
        # Group results by category
        categories = {
            "Authentication": [],
            "User Management": [],
            "Role Management": [],
            "Projects": [],
            "Security": [],
            "Error Handling": []
        }
        
        for result in self.test_results:
            name = result['name']
            if any(keyword in name.lower() for keyword in ['signup', 'login']):
                categories["Authentication"].append(result)
            elif any(keyword in name.lower() for keyword in ['user info', 'role verification']):
                categories["User Management"].append(result)
            elif any(keyword in name.lower() for keyword in ['role update', 'client role']):
                categories["Role Management"].append(result)
            elif 'project' in name.lower():
                categories["Projects"].append(result)
            elif any(keyword in name.lower() for keyword in ['unauthenticated', 'security']):
                categories["Security"].append(result)
            elif any(keyword in name.lower() for keyword in ['missing', 'invalid', 'duplicate', 'error']):
                categories["Error Handling"].append(result)
        
        for category, results in categories.items():
            if results:
                print(f"\n📂 {category}:")
                passed = sum(1 for r in results if r['success'])
                total = len(results)
                print(f"   {passed}/{total} tests passed")
                
                for result in results:
                    status = "✅" if result['success'] else "❌"
                    print(f"   {status} {result['name']}")
                    if result['details']:
                        print(f"      └─ {result['details']}")
        
        print(f"\n🎯 OVERALL SUMMARY:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL TESTS PASSED!")
        else:
            print(f"\n⚠️  {self.tests_run - self.tests_passed} TESTS FAILED")
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   ❌ {result['name']}: {result['details']}")

def main():
    tester = WorkBridgeComprehensiveTest()
    success = tester.run_comprehensive_test()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())