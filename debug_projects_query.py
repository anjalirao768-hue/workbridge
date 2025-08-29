#!/usr/bin/env python3

import requests
import json

def test_projects_query():
    session = requests.Session()
    base_url = "http://localhost:3000"
    
    # 1. Login as existing user
    print("1. Logging in as existing client...")
    login_data = {
        "email": "client1@example.com",
        "password": "password123"
    }
    
    response = session.post(f"{base_url}/api/login", json=login_data)
    print(f"Login status: {response.status_code}")
    if response.status_code == 200:
        print(f"Login response: {response.json()}")
    else:
        print(f"Login failed: {response.text}")
        return
    
    # 2. Test /api/user/me
    print("\n2. Testing /api/user/me...")
    response = session.get(f"{base_url}/api/user/me")
    print(f"User me status: {response.status_code}")
    if response.status_code == 200:
        user_data = response.json()
        print(f"User data: {user_data}")
        print(f"User role: {user_data.get('role')}")
    else:
        print(f"User me failed: {response.text}")
        return
    
    # 3. Test /api/projects
    print("\n3. Testing /api/projects...")
    response = session.get(f"{base_url}/api/projects")
    print(f"Projects status: {response.status_code}")
    try:
        projects_data = response.json()
        print(f"Projects response: {json.dumps(projects_data, indent=2)}")
    except:
        print(f"Projects response (text): {response.text}")

if __name__ == "__main__":
    test_projects_query()