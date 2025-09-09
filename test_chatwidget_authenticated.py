#!/usr/bin/env python3

import asyncio
import json
import jwt
import os
from datetime import datetime, timedelta

# Load environment variables
JWT_SECRET = "9e9f9ff5b5cdbeb54e11ceb801b93da182bcc7063f7bea05c6c5fc23966ff5ac4d7c53f559e91340fad57a99409ef3bb21fd6b46f65b16302781e8f60c7c6d54"

def create_test_jwt_token():
    """Create a valid JWT token for testing"""
    
    # Create payload for test user
    payload = {
        "userId": "a2db711d-41b9-4104-9b29-8ffa268d7a49",  # anjalirao768@gmail.com user ID
        "email": "anjalirao768@gmail.com",
        "role": "client",
        "iat": int(datetime.utcnow().timestamp()),
        "exp": int((datetime.utcnow() + timedelta(days=7)).timestamp())
    }
    
    # Create JWT token
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    
    print(f"Generated JWT token for testing:")
    print(f"User ID: {payload['userId']}")
    print(f"Email: {payload['email']}")
    print(f"Role: {payload['role']}")
    print(f"Token: {token}")
    print(f"Token length: {len(token)}")
    
    return token

if __name__ == "__main__":
    token = create_test_jwt_token()