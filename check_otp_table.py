#!/usr/bin/env python3

import requests
import json

def test_database_connection():
    """Test if we can connect to the database and check otp_codes table"""
    
    # Test a simple API call that doesn't require OTP
    try:
        url = "http://localhost:3000/api/user/me"
        response = requests.get(url)
        print(f"API Response Status: {response.status_code}")
        print(f"API Response: {response.text}")
        
        if response.status_code == 401:
            print("✅ API is responding correctly (401 for unauthenticated request)")
        else:
            print("⚠️ Unexpected API response")
            
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return False
    
    # Test OTP API with detailed error logging
    try:
        url = "http://localhost:3000/api/auth/send-otp"
        data = {"email": "test@example.com"}
        
        print(f"\nTesting OTP API...")
        print(f"URL: {url}")
        print(f"Data: {data}")
        
        response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
        
        print(f"OTP API Status: {response.status_code}")
        print(f"OTP API Response: {response.text}")
        
        if response.status_code == 500:
            response_data = response.json()
            error = response_data.get('error', '')
            
            if 'Failed to create user record' in error:
                print("❌ Database user creation failed - likely schema issue")
            elif 'Internal server error' in error:
                print("❌ Internal server error - need to check server logs")
            else:
                print(f"❌ Unknown error: {error}")
        
        return response.status_code != 500
        
    except Exception as e:
        print(f"❌ OTP API test failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Database Connection and OTP Table...")
    print("=" * 50)
    
    success = test_database_connection()
    
    if success:
        print("\n✅ Database connection test passed")
    else:
        print("\n❌ Database connection test failed")
        print("\nPossible issues:")
        print("1. Supabase migrations not run")
        print("2. Environment variables not set correctly")
        print("3. otp_codes table doesn't exist")
        print("4. Database connection issues")