#!/usr/bin/env python3
"""
Debug AI Chat Issue
"""

import requests
import json
import uuid

BACKEND_URL = "https://23d55b19-41ca-4cac-a2e8-c52e8fb42684.preview.emergentagent.com/api"

def test_ai_chat_debug():
    session = requests.Session()
    
    # Login first
    login_data = {
        "email": "admin@ilmandorla.com",
        "password": "admin123"
    }
    
    login_response = session.post(f"{BACKEND_URL}/auth/login", json=login_data)
    if login_response.status_code == 200:
        data = login_response.json()
        auth_token = data["access_token"]
        session.headers.update({"Authorization": f"Bearer {auth_token}"})
        print("✅ Authentication successful")
        
        # Test AI chat
        session_id = str(uuid.uuid4())
        chat_data = {
            "message": "Hello, what are your specialties?",
            "session_id": session_id,
            "channel": "general"
        }
        
        try:
            response = session.post(f"{BACKEND_URL}/ai/chat", json=chat_data, timeout=30)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ AI Chat successful: {len(data.get('response', ''))} chars")
            else:
                print(f"❌ AI Chat failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
    else:
        print("❌ Authentication failed")

if __name__ == "__main__":
    test_ai_chat_debug()