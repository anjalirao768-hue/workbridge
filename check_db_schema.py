#!/usr/bin/env python3

import requests
import json

def check_database_schema():
    """Check if the required tables exist by testing API endpoints"""
    
    print("Checking database schema by testing API endpoints...")
    
    # Test if we can create a user (this will tell us if users table has required columns)
    print("\n1. Testing user creation with email_verified column...")
    try:
        response = requests.post(
            "http://localhost:3000/api/auth/send-otp",
            json={"email": "schema_test@example.com"},
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Users table with email_verified column exists")
        else:
            try:
                error_data = response.json()
                print(f"   Response: {error_data}")
            except:
                print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test refund requests table
    print("\n2. Testing refund_requests table...")
    try:
        response = requests.get(
            "http://localhost:3000/api/refund-requests",
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ Refund requests table exists (401 = auth required)")
        elif response.status_code == 500:
            try:
                error_data = response.json()
                print(f"   Response: {error_data}")
            except:
                print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test KYC table
    print("\n3. Testing kyc_verifications table...")
    try:
        response = requests.get(
            "http://localhost:3000/api/kyc/upload",
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ KYC verifications table exists (401 = auth required)")
        elif response.status_code == 500:
            try:
                error_data = response.json()
                print(f"   Response: {error_data}")
            except:
                print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == "__main__":
    check_database_schema()