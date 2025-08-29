#!/usr/bin/env python3

import requests
import json

def test_auth_flow():
    session = requests.Session()
    base_url = "http://localhost:3000"
    
    # 1. Signup
    print("1. Testing signup...")
    signup_data = {
        "email": "debug_test@test.com",
        "password": "password123",
        "role": "client",
        "skills": ["Test"],
        "cover_letter": "Test",
        "experiences": "Test",
        "age": 30
    }
    
    response = session.post(f"{base_url}/api/signup", json=signup_data)
    print(f"Signup status: {response.status_code}")
    print(f"Signup response: {response.json()}")
    print(f"Cookies after signup: {session.cookies}")
    
    # 2. Update role
    print("\n2. Testing role update...")
    role_data = {"role": "client", "skills": ["Project Management"]}
    response = session.post(f"{base_url}/api/user/update-role", json=role_data)
    print(f"Role update status: {response.status_code}")
    print(f"Role update response: {response.json()}")
    
    # 3. Test /api/user/me
    print("\n3. Testing /api/user/me...")
    response = session.get(f"{base_url}/api/user/me")
    print(f"User me status: {response.status_code}")
    print(f"User me response: {response.json()}")
    
    # 4. Test /api/projects
    print("\n4. Testing /api/projects...")
    response = session.get(f"{base_url}/api/projects")
    print(f"Projects status: {response.status_code}")
    try:
        print(f"Projects response: {response.json()}")
    except:
        print(f"Projects response (text): {response.text}")

if __name__ == "__main__":
    test_auth_flow()