#!/usr/bin/env python3

import requests
import json
import os

def test_supabase_connection():
    """Test Supabase connection using environment variables"""
    
    # Load environment variables from .env.local
    env_vars = {}
    try:
        with open('/app/.env.local', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    except Exception as e:
        print(f"Error reading .env.local: {e}")
        return False
    
    supabase_url = env_vars.get('NEXT_PUBLIC_SUPABASE_URL')
    service_key = env_vars.get('SUPABASE_SERVICE_ROLE_KEY')
    
    print(f"Supabase URL: {supabase_url}")
    print(f"Service Key: {service_key[:20]}..." if service_key else "None")
    
    if not supabase_url or not service_key:
        print("❌ Missing Supabase environment variables")
        return False
    
    # Test connection
    headers = {
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'apikey': service_key
    }
    
    # Check if otp_codes table exists
    try:
        print("\nTesting otp_codes table...")
        response = requests.get(
            f"{supabase_url}/rest/v1/otp_codes?select=*&limit=1",
            headers=headers
        )
        print(f"otp_codes table status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ otp_codes table exists and accessible")
            return True
        elif response.status_code == 404:
            print("❌ otp_codes table does not exist")
            return False
        else:
            print(f"❌ Error accessing otp_codes table: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing otp_codes table: {e}")
        return False

def test_users_table():
    """Test users table structure"""
    
    # Load environment variables
    env_vars = {}
    try:
        with open('/app/.env.local', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    except Exception as e:
        print(f"Error reading .env.local: {e}")
        return False
    
    supabase_url = env_vars.get('NEXT_PUBLIC_SUPABASE_URL')
    service_key = env_vars.get('SUPABASE_SERVICE_ROLE_KEY')
    
    headers = {
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'apikey': service_key
    }
    
    try:
        print("\nTesting users table...")
        response = requests.get(
            f"{supabase_url}/rest/v1/users?select=id,email,email_verified&limit=1",
            headers=headers
        )
        print(f"users table status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ users table exists with email_verified column")
            return True
        else:
            print(f"❌ Error accessing users table: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing users table: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Supabase Connection Directly...")
    print("=" * 50)
    
    supabase_ok = test_supabase_connection()
    users_ok = test_users_table()
    
    if supabase_ok and users_ok:
        print("\n✅ Supabase connection and schema are working")
    else:
        print("\n❌ Supabase connection or schema issues detected")