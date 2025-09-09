#!/usr/bin/env python3

import requests
import json
import sys
import time
from datetime import datetime

class LoginRedirectDebugger:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.debug_info = {}

    def log_test(self, name, success, details=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name}")
        
        if details:
            print(f"   Details: {json.dumps(details, indent=2)}")

    def test_send_otp_existing_user(self, email):
        """Test sending OTP to existing user"""
        print(f"\n🔍 Testing Send OTP for Existing User: {email}")
        
        url = f"{self.base_url}/api/auth/send-otp"
        data = {"email": email}
        
        try:
            response = self.session.post(url, json=data, headers={'Content-Type': 'application/json'})
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                response_data = response.json()
                print(f"   Response: {json.dumps(response_data, indent=2)}")
                
                # Check response structure
                success = response_data.get('success', False)
                is_existing_user = response_data.get('data', {}).get('isExistingUser', False)
                is_new_user = response_data.get('data', {}).get('isNewUser', True)
                
                self.debug_info['send_otp'] = {
                    'success': success,
                    'isExistingUser': is_existing_user,
                    'isNewUser': is_new_user,
                    'response': response_data
                }
                
                if success and is_existing_user and not is_new_user:
                    self.log_test("Send OTP - Existing User Detection", True, {
                        'isExistingUser': is_existing_user,
                        'isNewUser': is_new_user
                    })
                    return True, response_data
                else:
                    self.log_test("Send OTP - Existing User Detection", False, {
                        'expected_isExistingUser': True,
                        'actual_isExistingUser': is_existing_user,
                        'expected_isNewUser': False,
                        'actual_isNewUser': is_new_user
                    })
                    return False, response_data
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                self.log_test("Send OTP - API Call", False, {
                    'status_code': response.status_code,
                    'error': error_data
                })
                return False, {}
                
        except Exception as e:
            self.log_test("Send OTP - API Call", False, {'error': str(e)})
            return False, {}

    def test_verify_otp_login_structure(self, email, test_otp="123456"):
        """Test verify OTP with login structure (will fail OTP but show response structure)"""
        print(f"\n🔍 Testing Verify OTP Login Structure for: {email}")
        print("   Note: Using test OTP to check response structure (will fail OTP validation)")
        
        url = f"{self.base_url}/api/auth/verify-otp"
        data = {
            "email": email,
            "otp": test_otp,
            "isLogin": True
        }
        
        try:
            response = self.session.post(url, json=data, headers={'Content-Type': 'application/json'})
            print(f"   Status: {response.status_code}")
            
            response_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {'text': response.text}
            print(f"   Response: {json.dumps(response_data, indent=2)}")
            
            self.debug_info['verify_otp_structure'] = {
                'status_code': response.status_code,
                'response': response_data
            }
            
            # For login structure test, we expect 400 (invalid OTP) but want to see the structure
            if response.status_code == 400:
                error_msg = response_data.get('error', '')
                remaining_attempts = response_data.get('remainingAttempts')
                
                if 'Invalid or expired OTP' in error_msg and remaining_attempts is not None:
                    self.log_test("Verify OTP - Login Structure", True, {
                        'expected_error': 'Invalid or expired OTP',
                        'remaining_attempts': remaining_attempts,
                        'login_flow_detected': True
                    })
                    return True, response_data
                else:
                    self.log_test("Verify OTP - Login Structure", False, {
                        'unexpected_error': error_msg,
                        'remaining_attempts': remaining_attempts
                    })
                    return False, response_data
            else:
                self.log_test("Verify OTP - Login Structure", False, {
                    'expected_status': 400,
                    'actual_status': response.status_code,
                    'response': response_data
                })
                return False, response_data
                
        except Exception as e:
            self.log_test("Verify OTP - Login Structure", False, {'error': str(e)})
            return False, {}

    def test_user_role_check(self, email):
        """Test what role this user has by checking user/me endpoint"""
        print(f"\n🔍 Testing User Role Check for: {email}")
        print("   Note: This will fail authentication but may show user data structure")
        
        url = f"{self.base_url}/api/user/me"
        
        try:
            response = self.session.get(url, headers={'Content-Type': 'application/json'})
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 401:
                self.log_test("User Role Check - Authentication Required", True, {
                    'status': 'Properly secured - requires authentication'
                })
                return True, {'requires_auth': True}
            else:
                response_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {'text': response.text}
                print(f"   Response: {json.dumps(response_data, indent=2)}")
                
                self.debug_info['user_me'] = {
                    'status_code': response.status_code,
                    'response': response_data
                }
                
                if response.status_code == 200 and 'role' in response_data:
                    user_role = response_data.get('role')
                    self.log_test("User Role Check - Role Detection", True, {
                        'user_role': user_role,
                        'email': response_data.get('email')
                    })
                    return True, response_data
                else:
                    self.log_test("User Role Check - Unexpected Response", False, response_data)
                    return False, response_data
                
        except Exception as e:
            self.log_test("User Role Check - API Call", False, {'error': str(e)})
            return False, {}

    def test_redirect_urls_accessibility(self):
        """Test if redirect URLs are accessible"""
        print(f"\n🔍 Testing Redirect URL Accessibility")
        
        redirect_urls = [
            "/dashboard/client",
            "/dashboard/freelancer", 
            "/dashboard/admin",
            "/dashboard"
        ]
        
        results = {}
        
        for url_path in redirect_urls:
            full_url = f"{self.base_url}{url_path}"
            print(f"   Testing: {url_path}")
            
            try:
                response = self.session.get(full_url)
                print(f"     Status: {response.status_code}")
                
                results[url_path] = {
                    'status_code': response.status_code,
                    'accessible': response.status_code in [200, 302, 401, 403]  # Valid responses
                }
                
                if response.status_code == 404:
                    print(f"     ❌ Page not found - This could be the redirect issue!")
                elif response.status_code in [200, 302]:
                    print(f"     ✅ Page exists")
                elif response.status_code in [401, 403]:
                    print(f"     🔒 Page exists but requires authentication")
                else:
                    print(f"     ⚠️  Unexpected status: {response.status_code}")
                    
            except Exception as e:
                print(f"     ❌ Error: {str(e)}")
                results[url_path] = {'error': str(e), 'accessible': False}
        
        self.debug_info['redirect_urls'] = results
        
        # Check if any URLs return 404
        not_found_urls = [url for url, data in results.items() if data.get('status_code') == 404]
        
        if not_found_urls:
            self.log_test("Redirect URLs - Page Not Found Issue", False, {
                'not_found_urls': not_found_urls,
                'issue': 'These URLs return 404 - likely cause of redirect problem'
            })
            return False, results
        else:
            self.log_test("Redirect URLs - All Accessible", True, {
                'all_urls_exist': True
            })
            return True, results

    def analyze_login_flow(self, email):
        """Analyze the complete login flow to identify issues"""
        print(f"\n🔍 Analyzing Complete Login Flow for: {email}")
        
        # Step 1: Check if user exists and can get OTP
        print("\n--- Step 1: Send OTP ---")
        otp_success, otp_data = self.test_send_otp_existing_user(email)
        
        # Step 2: Check verify OTP structure
        print("\n--- Step 2: Verify OTP Structure ---")
        verify_success, verify_data = self.test_verify_otp_login_structure(email)
        
        # Step 3: Check user role
        print("\n--- Step 3: User Role Check ---")
        role_success, role_data = self.test_user_role_check(email)
        
        # Step 4: Check redirect URLs
        print("\n--- Step 4: Redirect URL Accessibility ---")
        redirect_success, redirect_data = self.test_redirect_urls_accessibility()
        
        return {
            'otp_flow': otp_success,
            'verify_structure': verify_success,
            'role_check': role_success,
            'redirect_urls': redirect_success
        }

    def generate_debug_report(self, email):
        """Generate comprehensive debug report"""
        print(f"\n{'='*60}")
        print("🔍 LOGIN REDIRECT DEBUG REPORT")
        print(f"{'='*60}")
        print(f"Target User: {email}")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        print(f"\n📊 DETAILED FINDINGS:")
        
        # OTP Flow Analysis
        if 'send_otp' in self.debug_info:
            otp_info = self.debug_info['send_otp']
            print(f"\n1. 📧 OTP SENDING:")
            print(f"   ✓ API Success: {otp_info['success']}")
            print(f"   ✓ Existing User: {otp_info['isExistingUser']}")
            print(f"   ✓ New User: {otp_info['isNewUser']}")
            
        # Verify OTP Structure
        if 'verify_otp_structure' in self.debug_info:
            verify_info = self.debug_info['verify_otp_structure']
            print(f"\n2. 🔐 OTP VERIFICATION STRUCTURE:")
            print(f"   ✓ Status Code: {verify_info['status_code']}")
            print(f"   ✓ Response Structure: {json.dumps(verify_info['response'], indent=4)}")
            
        # User Role Info
        if 'user_me' in self.debug_info:
            user_info = self.debug_info['user_me']
            print(f"\n3. 👤 USER ROLE INFO:")
            print(f"   ✓ Status Code: {user_info['status_code']}")
            print(f"   ✓ Response: {json.dumps(user_info['response'], indent=4)}")
            
        # Redirect URLs Analysis
        if 'redirect_urls' in self.debug_info:
            redirect_info = self.debug_info['redirect_urls']
            print(f"\n4. 🔗 REDIRECT URL ANALYSIS:")
            for url, data in redirect_info.items():
                status = data.get('status_code', 'ERROR')
                accessible = data.get('accessible', False)
                print(f"   {url}: Status {status} - {'✅ Accessible' if accessible else '❌ Not Found'}")
                
        print(f"\n🎯 POTENTIAL ISSUES IDENTIFIED:")
        
        issues = []
        
        # Check for 404 redirect URLs
        if 'redirect_urls' in self.debug_info:
            not_found = [url for url, data in self.debug_info['redirect_urls'].items() 
                        if data.get('status_code') == 404]
            if not_found:
                issues.append(f"❌ CRITICAL: Redirect URLs return 404: {not_found}")
                
        # Check OTP flow issues
        if 'send_otp' in self.debug_info:
            otp_info = self.debug_info['send_otp']
            if not otp_info['success']:
                issues.append("❌ OTP sending failed")
            if not otp_info['isExistingUser']:
                issues.append("❌ User not detected as existing user")
                
        if not issues:
            issues.append("✅ No critical issues detected in basic flow")
            
        for issue in issues:
            print(f"   {issue}")
            
        print(f"\n💡 RECOMMENDATIONS:")
        print(f"   1. Check if dashboard routes are properly defined in Next.js")
        print(f"   2. Verify role-based redirect logic in frontend")
        print(f"   3. Test with actual OTP to see complete login flow")
        print(f"   4. Check browser network tab during login for exact error")

def main():
    print("🚀 Starting Login Redirect Debug Testing...")
    print("=" * 60)
    print("Focus: Debugging login redirect issue for anjalirao768@gmail.com")
    print("=" * 60)
    
    debugger = LoginRedirectDebugger()
    target_email = "anjalirao768@gmail.com"
    
    # Run comprehensive analysis
    flow_results = debugger.analyze_login_flow(target_email)
    
    # Generate debug report
    debugger.generate_debug_report(target_email)
    
    # Determine if critical issues found
    critical_issues = []
    if not flow_results['redirect_urls']:
        critical_issues.append("Redirect URL accessibility issues")
    if not flow_results['otp_flow']:
        critical_issues.append("OTP flow issues")
        
    if critical_issues:
        print(f"\n🚨 CRITICAL ISSUES FOUND:")
        for issue in critical_issues:
            print(f"   ❌ {issue}")
        return 1
    else:
        print(f"\n✅ Basic flow structure appears correct")
        print(f"   💡 Issue may be in frontend redirect logic or route configuration")
        return 0

if __name__ == "__main__":
    sys.exit(main())