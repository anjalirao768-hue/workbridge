#!/usr/bin/env python3

import requests
import json

def test_api_endpoint():
    """Test a simple API endpoint to debug the issue"""
    
    # Test the basic health of the server
    print("Testing server health...")
    try:
        response = requests.get("http://localhost:3000")
        print(f"Root endpoint status: {response.status_code}")
    except Exception as e:
        print(f"Error accessing root: {e}")
    
    # Test a simple API endpoint
    print("\nTesting API endpoint...")
    try:
        response = requests.post(
            "http://localhost:3000/api/auth/send-otp",
            json={"email": "test@example.com"},
            headers={"Content-Type": "application/json"}
        )
        print(f"API endpoint status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 500:
            print("Server is returning 500 errors - checking for compilation issues")
            
    except Exception as e:
        print(f"Error accessing API: {e}")

if __name__ == "__main__":
    test_api_endpoint()