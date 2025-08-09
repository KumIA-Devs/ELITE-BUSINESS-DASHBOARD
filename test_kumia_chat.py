#!/usr/bin/env python3
"""
Test KUMIA Gemini Chat
"""

import requests
import json
import uuid

BACKEND_URL = "https://23d55b19-41ca-4cac-a2e8-c52e8fb42684.preview.emergentagent.com/api"

def test_kumia_chat():
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
        
        # Test KUMIA Gemini chat
        session_id = str(uuid.uuid4())
        chat_data = {
            "message": "¿Cuáles son las métricas principales del restaurante?",
            "session_id": session_id,
            "channel": "kumia_business_chat"
        }
        
        try:
            response = session.post(f"{BACKEND_URL}/ai/kumia-chat", json=chat_data, timeout=30)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ KUMIA Chat successful: {len(data.get('response', ''))} chars")
                return True
            else:
                print(f"❌ KUMIA Chat failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return False
    else:
        print("❌ Authentication failed")
        return False

if __name__ == "__main__":
    success = test_kumia_chat()
    print(f"Result: {'PASS' if success else 'FAIL'}")