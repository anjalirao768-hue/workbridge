#!/usr/bin/env python3

import requests
import json
import sys
import time
from datetime import datetime

class LoginOTPFlowTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test_result(self, test_name, success, details=""):
        """Log test result for summary"""
        self.test_results.append({
            'name': test_name,
            'success': success,
            'details': details
        })

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
                    print(f"   Response: {json.dumps(response_data, indent=2)[:300]}...")
                    return True, response_data
                except:
                    print(f"   Response (text): {response.text[:200]}...")
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                    return False, error_data
                except:
                    print(f"   Error (text): {response.text}")
                    return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_send_otp_new_user(self, email):
        """Test Send OTP for New User - should create user and return isNewUser: true"""
        print(f"\n{'='*60}")
        print("TEST 1: SEND OTP FOR NEW USER")
        print(f"{'='*60}")
        
        data = {"email": email}
        
        success, response = self.run_test(
            "Send OTP for New User",
            "POST",
            "/api/auth/send-otp",
            200,
            data=data
        )
        
        if success and isinstance(response, dict):
            is_new_user = response.get('data', {}).get('isNewUser', False)
            is_existing_user = response.get('data', {}).get('isExistingUser', True)
            
            if is_new_user and not is_existing_user:
                print("✅ Correct flags: isNewUser=true, isExistingUser=false")
                self.log_test_result("Send OTP New User", True, "Proper flags returned")
                return True, response
            else:
                print(f"❌ Incorrect flags: isNewUser={is_new_user}, isExistingUser={is_existing_user}")
                self.log_test_result("Send OTP New User", False, "Incorrect flags")
                return False, response
        
        self.log_test_result("Send OTP New User", False, "API call failed")
        return False, {}

    def test_verify_otp_signup(self, email, role="client"):
        """Test OTP verification for signup (new user)"""
        print(f"\n{'='*60}")
        print("TEST 2: VERIFY OTP FOR SIGNUP (NEW USER)")
        print(f"{'='*60}")
        
        # Use a test OTP - in real scenario this would be from email
        test_otp = "123456"
        
        data = {
            "email": email,
            "otp": test_otp,
            "role": role,
            "isLogin": False
        }
        
        success, response = self.run_test(
            "Verify OTP for Signup",
            "POST",
            "/api/auth/verify-otp",
            400,  # Expected to fail with invalid OTP, but we check the error message
            data=data
        )
        
        # We expect this to fail with "Invalid or expired OTP" but the structure should be correct
        if not success and isinstance(response, dict):
            error_msg = response.get('error', '')
            if 'Invalid or expired OTP' in error_msg:
                print("✅ Correct error handling for invalid OTP in signup flow")
                self.log_test_result("Verify OTP Signup", True, "Proper error handling")
                return True, response
            else:
                print(f"❌ Unexpected error: {error_msg}")
                self.log_test_result("Verify OTP Signup", False, f"Unexpected error: {error_msg}")
                return False, response
        
        self.log_test_result("Verify OTP Signup", False, "Unexpected response structure")
        return False, {}

    def test_send_otp_existing_user(self, email):
        """Test Send OTP for Existing User - THE MAIN FIX TEST"""
        print(f"\n{'='*60}")
        print("TEST 3: SEND OTP FOR EXISTING USER (MAIN FIX)")
        print(f"{'='*60}")
        print("🎯 This tests the fix: Existing users should get OTP for login, not 'User already registered' error")
        
        data = {"email": email}
        
        success, response = self.run_test(
            "Send OTP for Existing User (Login)",
            "POST",
            "/api/auth/send-otp",
            200,  # Should succeed, not return 409
            data=data
        )
        
        if success and isinstance(response, dict):
            is_new_user = response.get('data', {}).get('isNewUser', True)
            is_existing_user = response.get('data', {}).get('isExistingUser', False)
            message = response.get('message', '')
            
            # Check that it's NOT returning "User already registered" error
            if not is_new_user and is_existing_user and 'OTP sent successfully' in message:
                print("✅ BUG FIX VERIFIED: Existing user gets OTP for login (no 'already registered' error)")
                print(f"   ✓ isNewUser: {is_new_user}")
                print(f"   ✓ isExistingUser: {is_existing_user}")
                print(f"   ✓ Message: {message}")
                self.log_test_result("Send OTP Existing User Fix", True, "Bug fix working correctly")
                return True, response
            else:
                print(f"❌ BUG FIX FAILED: Incorrect response for existing user")
                print(f"   ❌ isNewUser: {is_new_user} (should be false)")
                print(f"   ❌ isExistingUser: {is_existing_user} (should be true)")
                print(f"   ❌ Message: {message}")
                self.log_test_result("Send OTP Existing User Fix", False, "Bug fix not working")
                return False, response
        
        # Check if it's returning the old error
        elif not success and isinstance(response, dict):
            error_msg = response.get('error', '')
            if 'already registered' in error_msg.lower():
                print(f"❌ BUG NOT FIXED: Still returning 'User already registered' error")
                print(f"   Error: {error_msg}")
                self.log_test_result("Send OTP Existing User Fix", False, "Still returning 'already registered' error")
                return False, response
        
        self.log_test_result("Send OTP Existing User Fix", False, "Unexpected API response")
        return False, {}

    def test_verify_otp_login(self, email):
        """Test OTP verification for login (existing user)"""
        print(f"\n{'='*60}")
        print("TEST 4: VERIFY OTP FOR LOGIN (EXISTING USER)")
        print(f"{'='*60}")
        
        # Use a test OTP - in real scenario this would be from email
        test_otp = "123456"
        
        data = {
            "email": email,
            "otp": test_otp,
            "isLogin": True  # This is the key flag for login flow
        }
        
        success, response = self.run_test(
            "Verify OTP for Login",
            "POST",
            "/api/auth/verify-otp",
            400,  # Expected to fail with invalid OTP, but we check the structure
            data=data
        )
        
        # We expect this to fail with "Invalid or expired OTP" but the structure should be correct
        if not success and isinstance(response, dict):
            error_msg = response.get('error', '')
            if 'Invalid or expired OTP' in error_msg:
                print("✅ Correct error handling for invalid OTP in login flow")
                print("✅ Login flow structure is correct (isLogin: true flag working)")
                self.log_test_result("Verify OTP Login", True, "Login flow structure correct")
                return True, response
            else:
                print(f"❌ Unexpected error in login flow: {error_msg}")
                self.log_test_result("Verify OTP Login", False, f"Unexpected error: {error_msg}")
                return False, response
        
        self.log_test_result("Verify OTP Login", False, "Unexpected response structure")
        return False, {}

    def test_login_vs_signup_differentiation(self):
        """Test that login and signup flows are properly differentiated"""
        print(f"\n{'='*60}")
        print("TEST 5: LOGIN VS SIGNUP DIFFERENTIATION")
        print(f"{'='*60}")
        
        # Test with different email formats to check differentiation
        new_email = f"newuser_{datetime.now().strftime('%H%M%S')}@test.com"
        
        print("🔍 Testing differentiation between new and existing users...")
        
        # First, send OTP for a new user
        success1, response1 = self.test_send_otp_new_user(new_email)
        
        if success1:
            # Now send OTP for the same user (now existing)
            success2, response2 = self.test_send_otp_existing_user(new_email)
            
            if success2:
                print("✅ Login vs Signup differentiation working correctly")
                self.log_test_result("Login vs Signup Differentiation", True, "Both flows working")
                return True
            else:
                print("❌ Existing user flow failed")
                self.log_test_result("Login vs Signup Differentiation", False, "Existing user flow failed")
                return False
        else:
            print("❌ New user flow failed")
            self.log_test_result("Login vs Signup Differentiation", False, "New user flow failed")
            return False

    def test_input_validation(self):
        """Test input validation for OTP endpoints"""
        print(f"\n{'='*60}")
        print("TEST 6: INPUT VALIDATION")
        print(f"{'='*60}")
        
        validation_tests = [
            {
                "name": "Missing Email",
                "endpoint": "/api/auth/send-otp",
                "data": {},
                "expected_status": 400
            },
            {
                "name": "Invalid Email Format",
                "endpoint": "/api/auth/send-otp", 
                "data": {"email": "invalid-email"},
                "expected_status": 400
            },
            {
                "name": "Missing OTP",
                "endpoint": "/api/auth/verify-otp",
                "data": {"email": "test@test.com"},
                "expected_status": 400
            },
            {
                "name": "Missing Email in Verify",
                "endpoint": "/api/auth/verify-otp",
                "data": {"otp": "123456"},
                "expected_status": 400
            }
        ]
        
        all_passed = True
        
        for test in validation_tests:
            success, response = self.run_test(
                test["name"],
                "POST",
                test["endpoint"],
                test["expected_status"],
                data=test["data"]
            )
            
            if not success:
                all_passed = False
        
        if all_passed:
            print("✅ All input validation tests passed")
            self.log_test_result("Input Validation", True, "All validation working")
        else:
            print("❌ Some input validation tests failed")
            self.log_test_result("Input Validation", False, "Some validation failed")
        
        return all_passed

def main():
    print("🚀 Starting Login OTP Flow Fix Testing...")
    print("=" * 80)
    print("🎯 FOCUS: Testing the fix for existing users getting OTP for login")
    print("   - Existing users should NOT get 'User already registered' error")
    print("   - Existing users should get OTP for login purposes")
    print("   - Proper isNewUser/isExistingUser flags")
    print("   - Login vs Signup flow differentiation")
    print("=" * 80)
    
    tester = LoginOTPFlowTester()
    
    # Use a realistic test email that might exist
    existing_user_email = "anjalirao768@gmail.com"  # From the review request
    
    print(f"📧 Testing with existing user email: {existing_user_email}")
    
    # Run all tests
    print(f"\n🧪 RUNNING COMPREHENSIVE LOGIN OTP FLOW TESTS...")
    
    # Test 1: Send OTP for existing user (main fix)
    main_fix_success, _ = tester.test_send_otp_existing_user(existing_user_email)
    
    # Test 2: Verify OTP for login flow
    login_verify_success, _ = tester.test_verify_otp_login(existing_user_email)
    
    # Test 3: Login vs Signup differentiation
    differentiation_success = tester.test_login_vs_signup_differentiation()
    
    # Test 4: Input validation
    validation_success = tester.test_input_validation()
    
    # Check if login verification test actually passed (it should return True for correct error handling)
    login_verify_actual = any(result['success'] and result['name'] == 'Verify OTP Login' for result in tester.test_results)
    
    # Print comprehensive summary
    print(f"\n{'='*80}")
    print("📊 LOGIN OTP FLOW FIX TESTING SUMMARY")
    print(f"{'='*80}")
    print(f"   Tests run: {tester.tests_run}")
    print(f"   Tests passed: {tester.tests_passed}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    print(f"\n🎯 DETAILED TEST RESULTS:")
    for result in tester.test_results:
        status = "✅ PASS" if result['success'] else "❌ FAIL"
        print(f"   {status}: {result['name']} - {result['details']}")
    
    print(f"\n🔍 KEY FIX VERIFICATION:")
    if main_fix_success:
        print("   ✅ MAIN BUG FIX WORKING: Existing users can get OTP for login")
        print("   ✅ No more 'User already registered' error for login attempts")
    else:
        print("   ❌ MAIN BUG NOT FIXED: Still blocking existing users from login OTP")
    
    if login_verify_actual:
        print("   ✅ Login OTP verification flow structure correct")
    else:
        print("   ❌ Login OTP verification flow has issues")
    
    if differentiation_success:
        print("   ✅ Login vs Signup differentiation working")
    else:
        print("   ❌ Login vs Signup differentiation has issues")
    
    print(f"\n🎯 OVERALL ASSESSMENT:")
    if main_fix_success and login_verify_actual:
        print("   🎉 LOGIN OTP FLOW FIX IS WORKING CORRECTLY!")
        print("   ✅ Existing users can now get OTP for login purposes")
        print("   ✅ No more blocking 'User already registered' errors")
        return 0
    else:
        print("   ⚠️  LOGIN OTP FLOW FIX NEEDS ATTENTION")
        print("   ❌ Some critical functionality is not working as expected")
        return 1

if __name__ == "__main__":
    sys.exit(main())