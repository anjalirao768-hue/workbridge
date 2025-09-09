#!/usr/bin/env python3

import requests
import json
import sys
import time
from datetime import datetime

class ComprehensiveLoginOTPTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.critical_tests_passed = 0
        self.critical_tests_total = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, is_critical=False):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        if is_critical:
            self.critical_tests_total += 1
            
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=default_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=default_headers)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                if is_critical:
                    self.critical_tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
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

def main():
    print("🚀 Starting Comprehensive Login OTP Flow Testing...")
    print("=" * 80)
    print("🎯 FOCUS: Verifying the login OTP flow fix is working correctly")
    print("=" * 80)
    
    tester = ComprehensiveLoginOTPTester()
    
    # Test emails
    existing_user_email = "anjalirao768@gmail.com"  # Known existing user
    new_user_email = f"testuser_{datetime.now().strftime('%H%M%S')}@test.com"
    
    print(f"📧 Testing with:")
    print(f"   Existing user: {existing_user_email}")
    print(f"   New user: {new_user_email}")
    
    # CRITICAL TEST 1: Send OTP for Existing User (Main Fix)
    print(f"\n{'='*60}")
    print("🎯 CRITICAL TEST 1: SEND OTP FOR EXISTING USER")
    print("   This is the main bug fix - existing users should get OTP, not error")
    print(f"{'='*60}")
    
    success1, response1 = tester.run_test(
        "Send OTP for Existing User (Main Fix)",
        "POST",
        "/api/auth/send-otp",
        200,
        data={"email": existing_user_email},
        is_critical=True
    )
    
    main_fix_working = False
    if success1 and isinstance(response1, dict):
        data = response1.get('data', {})
        is_new_user = data.get('isNewUser', True)
        is_existing_user = data.get('isExistingUser', False)
        message = response1.get('message', '')
        
        if not is_new_user and is_existing_user and 'OTP sent successfully' in message:
            print("🎉 MAIN BUG FIX VERIFIED: Existing user gets OTP for login!")
            print(f"   ✓ isNewUser: {is_new_user} (correct)")
            print(f"   ✓ isExistingUser: {is_existing_user} (correct)")
            print(f"   ✓ Message: {message}")
            main_fix_working = True
        else:
            print("❌ MAIN BUG FIX FAILED: Incorrect response structure")
    
    # CRITICAL TEST 2: Send OTP for New User
    print(f"\n{'='*60}")
    print("🎯 CRITICAL TEST 2: SEND OTP FOR NEW USER")
    print("   New users should get proper flags")
    print(f"{'='*60}")
    
    success2, response2 = tester.run_test(
        "Send OTP for New User",
        "POST",
        "/api/auth/send-otp",
        200,
        data={"email": new_user_email},
        is_critical=True
    )
    
    new_user_working = False
    if success2 and isinstance(response2, dict):
        data = response2.get('data', {})
        is_new_user = data.get('isNewUser', False)
        is_existing_user = data.get('isExistingUser', True)
        
        if is_new_user and not is_existing_user:
            print("✅ New user flow working correctly")
            print(f"   ✓ isNewUser: {is_new_user} (correct)")
            print(f"   ✓ isExistingUser: {is_existing_user} (correct)")
            new_user_working = True
        else:
            print("❌ New user flow has incorrect flags")
    
    # CRITICAL TEST 3: Verify differentiation (new user becomes existing)
    print(f"\n{'='*60}")
    print("🎯 CRITICAL TEST 3: LOGIN VS SIGNUP DIFFERENTIATION")
    print("   Same email should switch from new to existing user")
    print(f"{'='*60}")
    
    success3, response3 = tester.run_test(
        "Send OTP for Now-Existing User",
        "POST",
        "/api/auth/send-otp",
        200,
        data={"email": new_user_email},  # Same email as test 2
        is_critical=True
    )
    
    differentiation_working = False
    if success3 and isinstance(response3, dict):
        data = response3.get('data', {})
        is_new_user = data.get('isNewUser', True)
        is_existing_user = data.get('isExistingUser', False)
        
        if not is_new_user and is_existing_user:
            print("✅ Login vs Signup differentiation working!")
            print(f"   ✓ Same email now shows as existing user")
            print(f"   ✓ isNewUser: {is_new_user} (correct)")
            print(f"   ✓ isExistingUser: {is_existing_user} (correct)")
            differentiation_working = True
        else:
            print("❌ Differentiation failed - user should be existing now")
    
    # TEST 4: Verify OTP Login Flow Structure
    print(f"\n{'='*60}")
    print("🔍 TEST 4: VERIFY OTP LOGIN FLOW STRUCTURE")
    print("   Testing isLogin flag handling")
    print(f"{'='*60}")
    
    success4, response4 = tester.run_test(
        "Verify OTP with isLogin flag",
        "POST",
        "/api/auth/verify-otp",
        400,  # Expected to fail with invalid OTP
        data={
            "email": existing_user_email,
            "otp": "123456",  # Invalid OTP
            "isLogin": True
        }
    )
    
    login_structure_working = False
    if not success4 and isinstance(response4, dict):
        error_msg = response4.get('error', '')
        if 'Invalid or expired OTP' in error_msg:
            print("✅ Login OTP verification structure correct")
            print("   ✓ Properly handles isLogin: true flag")
            print("   ✓ Returns expected error for invalid OTP")
            login_structure_working = True
        else:
            print(f"❌ Unexpected error in login verification: {error_msg}")
    
    # TEST 5: Verify OTP Signup Flow Structure
    print(f"\n{'='*60}")
    print("🔍 TEST 5: VERIFY OTP SIGNUP FLOW STRUCTURE")
    print("   Testing role requirement for signup")
    print(f"{'='*60}")
    
    success5, response5 = tester.run_test(
        "Verify OTP with role for signup",
        "POST",
        "/api/auth/verify-otp",
        400,  # Expected to fail with invalid OTP
        data={
            "email": new_user_email,
            "otp": "123456",  # Invalid OTP
            "role": "client",
            "isLogin": False
        }
    )
    
    signup_structure_working = False
    if not success5 and isinstance(response5, dict):
        error_msg = response5.get('error', '')
        if 'Invalid or expired OTP' in error_msg:
            print("✅ Signup OTP verification structure correct")
            print("   ✓ Properly handles role and isLogin: false")
            print("   ✓ Returns expected error for invalid OTP")
            signup_structure_working = True
        else:
            print(f"❌ Unexpected error in signup verification: {error_msg}")
    
    # TEST 6: Input Validation
    print(f"\n{'='*60}")
    print("🔍 TEST 6: INPUT VALIDATION")
    print(f"{'='*60}")
    
    validation_tests = [
        ("Missing Email", {"email": ""}, 400),
        ("Invalid Email", {"email": "invalid"}, 400),
        ("Missing OTP in Verify", {"email": "test@test.com"}, 400),
    ]
    
    validation_passed = 0
    for test_name, test_data, expected_status in validation_tests:
        if "OTP" in test_name:
            endpoint = "/api/auth/verify-otp"
        else:
            endpoint = "/api/auth/send-otp"
            
        success, _ = tester.run_test(test_name, "POST", endpoint, expected_status, data=test_data)
        if success:
            validation_passed += 1
    
    validation_working = validation_passed == len(validation_tests)
    
    # SUMMARY
    print(f"\n{'='*80}")
    print("📊 COMPREHENSIVE LOGIN OTP FLOW TEST RESULTS")
    print(f"{'='*80}")
    print(f"   Total Tests: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    print(f"   Critical Tests: {tester.critical_tests_passed}/{tester.critical_tests_total}")
    
    print(f"\n🎯 CRITICAL FUNCTIONALITY ASSESSMENT:")
    
    if main_fix_working:
        print("   ✅ MAIN BUG FIX: Existing users can get OTP for login")
    else:
        print("   ❌ MAIN BUG FIX: Still blocking existing users")
    
    if new_user_working:
        print("   ✅ NEW USER FLOW: Proper flags for new users")
    else:
        print("   ❌ NEW USER FLOW: Incorrect flags")
    
    if differentiation_working:
        print("   ✅ DIFFERENTIATION: Login vs Signup properly distinguished")
    else:
        print("   ❌ DIFFERENTIATION: Cannot distinguish login vs signup")
    
    if login_structure_working:
        print("   ✅ LOGIN STRUCTURE: isLogin flag handled correctly")
    else:
        print("   ❌ LOGIN STRUCTURE: Issues with login flow")
    
    if signup_structure_working:
        print("   ✅ SIGNUP STRUCTURE: Role requirement working")
    else:
        print("   ❌ SIGNUP STRUCTURE: Issues with signup flow")
    
    if validation_working:
        print("   ✅ INPUT VALIDATION: All validation working")
    else:
        print("   ❌ INPUT VALIDATION: Some validation issues")
    
    # FINAL ASSESSMENT
    critical_functionality_working = (
        main_fix_working and 
        new_user_working and 
        differentiation_working
    )
    
    print(f"\n🎯 FINAL ASSESSMENT:")
    if critical_functionality_working:
        print("   🎉 LOGIN OTP FLOW FIX IS WORKING CORRECTLY!")
        print("   ✅ All critical functionality verified")
        print("   ✅ Existing users can now login with OTP")
        print("   ✅ No more 'User already registered' blocking errors")
        print("   ✅ Proper differentiation between login and signup flows")
        
        if login_structure_working and signup_structure_working:
            print("   ✅ Both login and signup verification flows working")
        
        return 0
    else:
        print("   ❌ LOGIN OTP FLOW FIX HAS CRITICAL ISSUES")
        print("   ⚠️  Some core functionality is not working correctly")
        
        if not main_fix_working:
            print("   🚨 CRITICAL: Main bug fix not working - existing users still blocked")
        if not new_user_working:
            print("   🚨 CRITICAL: New user flow broken")
        if not differentiation_working:
            print("   🚨 CRITICAL: Cannot differentiate login vs signup")
        
        return 1

if __name__ == "__main__":
    sys.exit(main())