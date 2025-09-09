#!/usr/bin/env python3

import os
import sys
from supabase import create_client, Client
import json

def check_user_role():
    """Check the current role of anjalirao768@gmail.com in the database"""
    
    # Get Supabase credentials from environment
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials in environment")
        return False
    
    print("🔍 Checking user role in Supabase database...")
    print(f"   Target email: anjalirao768@gmail.com")
    print(f"   Supabase URL: {supabase_url}")
    
    try:
        # Create Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Query user data
        response = supabase.table('users').select('*').eq('email', 'anjalirao768@gmail.com').execute()
        
        if response.data:
            user = response.data[0]
            print(f"\n✅ User found in database:")
            print(f"   ID: {user.get('id')}")
            print(f"   Email: {user.get('email')}")
            print(f"   Role: {user.get('role')}")
            print(f"   Email Verified: {user.get('email_verified')}")
            print(f"   Created At: {user.get('created_at')}")
            print(f"   Updated At: {user.get('updated_at')}")
            
            current_role = user.get('role')
            
            if current_role == 'support':
                print(f"\n✅ User has 'support' role - should have access to support dashboard")
                return True, user
            elif current_role == 'admin':
                print(f"\n✅ User has 'admin' role - should have access to support dashboard")
                return True, user
            else:
                print(f"\n❌ User has '{current_role}' role - needs 'support' or 'admin' role")
                print(f"   Run this SQL in Supabase to fix:")
                print(f"   UPDATE users SET role = 'support' WHERE email = 'anjalirao768@gmail.com';")
                return False, user
        else:
            print(f"\n❌ User not found in database")
            print(f"   Email: anjalirao768@gmail.com")
            return False, None
            
    except Exception as e:
        print(f"\n❌ Database query failed: {str(e)}")
        return False, None

def update_user_role_to_support():
    """Update user role to support"""
    
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        return False
    
    print("🔧 Updating user role to 'support'...")
    
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Update user role
        response = supabase.table('users').update({
            'role': 'support',
            'email_verified': True
        }).eq('email', 'anjalirao768@gmail.com').execute()
        
        if response.data:
            user = response.data[0]
            print(f"✅ User role updated successfully:")
            print(f"   Email: {user.get('email')}")
            print(f"   New Role: {user.get('role')}")
            print(f"   Email Verified: {user.get('email_verified')}")
            return True, user
        else:
            print(f"❌ Failed to update user role")
            return False, None
            
    except Exception as e:
        print(f"❌ Update failed: {str(e)}")
        return False, None

def main():
    print("🚀 User Database Role Checker")
    print("=" * 50)
    
    # Load environment variables
    try:
        with open('/app/.env.local', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
    except FileNotFoundError:
        print("⚠️  .env.local file not found, using system environment")
    
    # Check current role
    success, user_data = check_user_role()
    
    if not success and user_data is not None:
        # User exists but wrong role - offer to fix
        print(f"\n🔧 Would you like to update the role to 'support'? (y/n)")
        # For automated testing, we'll auto-update
        print("   Auto-updating role for testing...")
        
        update_success, updated_user = update_user_role_to_support()
        
        if update_success:
            print(f"\n✅ Role update completed!")
            print(f"   anjalirao768@gmail.com now has 'support' role")
            print(f"   User should now be able to access support dashboard")
        else:
            print(f"\n❌ Role update failed")
    
    elif success:
        print(f"\n✅ User role is correct for support dashboard access")
    
    else:
        print(f"\n❌ User not found or other database issue")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())