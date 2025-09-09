#!/usr/bin/env python3

"""
Test Database Connection and User Role for anjalirao768@gmail.com
"""

import os
import requests
import json
from datetime import datetime

# Load environment variables
SUPABASE_URL = "https://bufgalmkwblyqkkpcgxh.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmdhbG1rd2JseXFra3BjZ3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYxMjQ1NiwiZXhwIjoyMDcxMTg4NDU2fQ.ogTQDYlyYss7l1pMlsdIoNh4PDwGISNxjb2HZddzPJs"

def test_supabase_connection():
    """Test Supabase connection and check user data"""
    print("🔍 TESTING SUPABASE DATABASE CONNECTION")
    print("="*60)
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Test 1: Check if users table exists and is accessible
    try:
        url = f"{SUPABASE_URL}/rest/v1/users?select=count"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print("✅ Supabase connection successful")
            print(f"   Response: {response.text}")
        else:
            print(f"❌ Supabase connection failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {str(e)}")
        return False
    
    # Test 2: Check specific user anjalirao768@gmail.com
    try:
        email = "anjalirao768@gmail.com"
        url = f"{SUPABASE_URL}/rest/v1/users?email=eq.{email}&select=*"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            users = response.json()
            if users:
                user = users[0]
                print(f"\n✅ User found: {email}")
                print(f"   ID: {user.get('id')}")
                print(f"   Email: {user.get('email')}")
                print(f"   Role: {user.get('role')}")
                print(f"   Email Verified: {user.get('email_verified')}")
                print(f"   Created At: {user.get('created_at')}")
                
                # Check if user has support role
                if user.get('role') == 'support':
                    print("✅ User has 'support' role - should be able to access support dashboard")
                elif user.get('role') == 'admin':
                    print("✅ User has 'admin' role - should be able to access support dashboard")
                else:
                    print(f"❌ User has '{user.get('role')}' role - CANNOT access support dashboard")
                    print("   Support dashboard requires 'support' or 'admin' role")
                
                return user
            else:
                print(f"❌ User not found: {email}")
                return None
        else:
            print(f"❌ Failed to query user: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ User query error: {str(e)}")
        return None

def test_otp_table():
    """Test if OTP table exists"""
    print("\n🔍 TESTING OTP TABLE")
    print("="*60)
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/otp_codes?select=count"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print("✅ OTP table exists and is accessible")
        else:
            print(f"❌ OTP table issue: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ OTP table error: {str(e)}")

def update_user_role_to_support():
    """Update user role to support if needed"""
    print("\n🔧 UPDATING USER ROLE TO SUPPORT")
    print("="*60)
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        email = "anjalirao768@gmail.com"
        url = f"{SUPABASE_URL}/rest/v1/users?email=eq.{email}"
        
        update_data = {
            "role": "support",
            "email_verified": True
        }
        
        response = requests.patch(url, headers=headers, json=update_data)
        
        if response.status_code in [200, 204]:
            print(f"✅ User role updated to 'support' for {email}")
            print("✅ Email verification set to true")
            return True
        else:
            print(f"❌ Failed to update user role: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Role update error: {str(e)}")
        return False

def main():
    """Main execution"""
    print("🎯 SUPPORT DASHBOARD AUTHENTICATION DEBUG")
    print("📧 Target User: anjalirao768@gmail.com")
    print("🗄️ Database: Supabase")
    print("="*80)
    
    # Test database connection and get user data
    user_data = test_supabase_connection()
    
    # Test OTP table
    test_otp_table()
    
    # If user doesn't have support role, update it
    if user_data and user_data.get('role') not in ['support', 'admin']:
        print(f"\n⚠️ User currently has '{user_data.get('role')}' role")
        print("🔧 Updating role to 'support' for dashboard access...")
        
        if update_user_role_to_support():
            print("\n✅ ROLE UPDATE SUCCESSFUL")
            print("🎯 User should now be able to access support dashboard after login")
        else:
            print("\n❌ ROLE UPDATE FAILED")
            print("🔧 Manual intervention required")
    
    elif user_data and user_data.get('role') in ['support', 'admin']:
        print(f"\n✅ USER ALREADY HAS CORRECT ROLE: {user_data.get('role')}")
        print("🎯 User should be able to access support dashboard after proper authentication")
    
    print("\n" + "="*80)
    print("📋 SUMMARY FOR anjalirao768@gmail.com:")
    print("="*80)
    
    if user_data:
        print(f"✅ User exists in database")
        print(f"📧 Email: {user_data.get('email')}")
        print(f"🔑 Role: {user_data.get('role')}")
        print(f"✉️ Email Verified: {user_data.get('email_verified')}")
        
        if user_data.get('role') in ['support', 'admin']:
            print("\n🎯 EXPECTED BEHAVIOR:")
            print("1. User logs in via OTP system")
            print("2. JWT token is created with correct role")
            print("3. /api/user/me returns user data with support/admin role")
            print("4. Support dashboard allows access")
            print("5. User can view and respond to chat conversations")
        else:
            print(f"\n❌ ISSUE: User role '{user_data.get('role')}' insufficient for support dashboard")
    else:
        print("❌ User not found in database")
        print("🔧 User needs to complete signup process first")

if __name__ == "__main__":
    main()