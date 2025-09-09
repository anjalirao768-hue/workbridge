#!/usr/bin/env python3

"""
JWT Authentication Debug Test

This test debugs JWT token creation and validation issues.
"""

import requests
import json
import time
import jwt as pyjwt

# Configuration
FRONTEND_URL = "http://localhost:3000"
API_BASE_URL = f"{FRONTEND_URL}/api"
JWT_SECRET = "9e9f9ff5b5cdbeb54e11ceb801b93da182bcc7063f7bea05c6c5fc23966ff5ac4d7c53f559e91340fad57a99409ef3bb21fd6b46f65b16302781e8f60c7c6d54"

def test_jwt_token_formats():
    """Test different JWT token formats"""
    print("🔍 TESTING JWT TOKEN FORMATS")
    print("="*60)
    
    user_data = {
        "userId": "a2db711d-41b9-4104-9b29-8ffa268d7a49",
        "email": "anjalirao768@gmail.com",
        "role": "support"
    }
    
    # Test 1: Standard JWT with exp
    try:
        payload1 = {
            **user_data,
            "iat": int(time.time()),
            "exp": int(time.time()) + (7 * 24 * 60 * 60)
        }
        token1 = pyjwt.encode(payload1, JWT_SECRET, algorithm="HS256")
        print(f"✅ Standard JWT created: {token1[:50]}...")
        
        # Verify token
        decoded = pyjwt.decode(token1, JWT_SECRET, algorithms=["HS256"])
        print(f"✅ Token verification successful: {decoded['email']}")
        
        # Test with API
        session = requests.Session()
        session.cookies.set('auth-token', token1, domain='localhost')
        
        response = session.get(f"{API_BASE_URL}/user/me")
        print(f"📡 API Response: {response.status_code} - {response.text[:100]}")
        
        if response.status_code == 200:
            print("✅ JWT authentication working!")
            return token1
        else:
            print("❌ JWT authentication failed")
            
    except Exception as e:
        print(f"❌ JWT creation/test failed: {str(e)}")
    
    # Test 2: Try with different cookie settings
    try:
        print("\n🔍 Testing different cookie settings...")
        session2 = requests.Session()
        
        # Try setting cookie with different parameters
        session2.cookies.set('auth-token', token1)
        response2 = session2.get(f"{API_BASE_URL}/user/me")
        print(f"📡 Cookie test 1: {response2.status_code}")
        
        # Try with headers instead of cookies
        headers = {'Authorization': f'Bearer {token1}'}
        response3 = requests.get(f"{API_BASE_URL}/user/me", headers=headers)
        print(f"📡 Header test: {response3.status_code}")
        
        # Try with custom header
        headers2 = {'auth-token': token1}
        response4 = requests.get(f"{API_BASE_URL}/user/me", headers=headers2)
        print(f"📡 Custom header test: {response4.status_code}")
        
    except Exception as e:
        print(f"❌ Cookie/header tests failed: {str(e)}")
    
    return None

def test_otp_verification_flow():
    """Test the actual OTP verification flow to get a real token"""
    print("\n🔍 TESTING REAL OTP VERIFICATION FLOW")
    print("="*60)
    
    try:
        # Step 1: Send OTP
        session = requests.Session()
        payload = {"email": "anjalirao768@gmail.com"}
        
        response = session.post(
            f"{API_BASE_URL}/auth/send-otp",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ OTP sent successfully")
            
            # Step 2: Try OTP verification with a test OTP (this will fail but shows the flow)
            verify_payload = {
                "email": "anjalirao768@gmail.com",
                "otp": "123456",  # Invalid OTP for testing
                "isLogin": True
            }
            
            verify_response = session.post(
                f"{API_BASE_URL}/auth/verify-otp",
                json=verify_payload,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"📡 OTP Verification Response: {verify_response.status_code}")
            print(f"📄 Response body: {verify_response.text[:200]}")
            
            if verify_response.status_code == 400:
                data = verify_response.json()
                if "Invalid or expired OTP" in data.get("error", ""):
                    print("✅ OTP verification flow structure is working")
                    print("💡 Real OTP would be needed for actual authentication")
                    return True
            
        else:
            print(f"❌ OTP sending failed: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ OTP flow test failed: {str(e)}")
    
    return False

def test_manual_cookie_setting():
    """Test manual cookie setting with different approaches"""
    print("\n🔍 TESTING MANUAL COOKIE SETTING")
    print("="*60)
    
    # Create a valid JWT token
    payload = {
        "userId": "a2db711d-41b9-4104-9b29-8ffa268d7a49",
        "email": "anjalirao768@gmail.com",
        "role": "support",
        "iat": int(time.time()),
        "exp": int(time.time()) + (7 * 24 * 60 * 60)
    }
    
    token = pyjwt.encode(payload, JWT_SECRET, algorithm="HS256")
    print(f"🔑 Created token: {token[:50]}...")
    
    # Test different ways to send the token
    test_methods = [
        ("Cookie: auth-token", lambda s: s.cookies.set('auth-token', token)),
        ("Cookie: auth-token (with domain)", lambda s: s.cookies.set('auth-token', token, domain='localhost')),
        ("Header: Authorization Bearer", lambda s: s.headers.update({'Authorization': f'Bearer {token}'})),
        ("Header: Cookie", lambda s: s.headers.update({'Cookie': f'auth-token={token}'})),
    ]
    
    for method_name, method_func in test_methods:
        try:
            session = requests.Session()
            method_func(session)
            
            response = session.get(f"{API_BASE_URL}/user/me")
            print(f"📡 {method_name}: {response.status_code} - {response.text[:50]}")
            
            if response.status_code == 200:
                print(f"✅ {method_name} WORKS!")
                return True
                
        except Exception as e:
            print(f"❌ {method_name} failed: {str(e)}")
    
    return False

def main():
    """Main execution"""
    print("🎯 JWT AUTHENTICATION DEBUG")
    print("📧 Target User: anjalirao768@gmail.com")
    print("🔑 JWT Secret: [CONFIGURED]")
    print("="*80)
    
    # Test JWT token creation and formats
    token = test_jwt_token_formats()
    
    # Test real OTP flow
    otp_working = test_otp_verification_flow()
    
    # Test manual cookie setting
    cookie_working = test_manual_cookie_setting()
    
    print("\n" + "="*80)
    print("🎯 JWT DEBUG SUMMARY")
    print("="*80)
    
    if token:
        print("✅ JWT token creation and verification working")
    else:
        print("❌ JWT token issues detected")
    
    if otp_working:
        print("✅ OTP verification flow structure working")
    else:
        print("❌ OTP verification flow issues")
    
    if cookie_working:
        print("✅ Cookie/header authentication working")
    else:
        print("❌ Cookie/header authentication issues")
    
    print("\n📋 DIAGNOSIS:")
    if not token and not cookie_working:
        print("🔧 JWT authentication system needs debugging")
        print("   - Check JWT secret configuration")
        print("   - Check cookie parsing in middleware")
        print("   - Check authentication middleware implementation")
    elif otp_working:
        print("✅ Authentication system is working correctly")
        print("💡 User needs to complete actual OTP verification to get authenticated")
        print("📧 Real OTP email would contain the verification code")
    
    print("\n📋 NEXT STEPS FOR anjalirao768@gmail.com:")
    print("1. Go to /login page")
    print("2. Enter email: anjalirao768@gmail.com") 
    print("3. Check email for OTP code")
    print("4. Enter the OTP code from email")
    print("5. Should get authenticated with 'support' role")
    print("6. Navigate to /support page")
    print("7. Should have full access to support dashboard")

if __name__ == "__main__":
    main()