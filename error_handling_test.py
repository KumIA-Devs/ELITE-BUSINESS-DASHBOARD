#!/usr/bin/env python3
"""
Error Handling Tests for IL MANDORLA Backend
Tests authentication and error scenarios
"""

import requests
import json
import sys

BACKEND_URL = "https://fbb32e47-90a2-4ee3-96c2-f8d1b92449da.preview.emergentagent.com/api"

class ErrorHandlingTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
    
    def test_unauthorized_access(self):
        """Test endpoints without authentication"""
        print("🔒 Testing Unauthorized Access...")
        
        protected_endpoints = [
            "/auth/me",
            "/dashboard/metrics",
            "/menu",
            "/customers",
            "/ai/chat",
            "/restaurant/config"
        ]
        
        for endpoint in protected_endpoints:
            response = self.session.get(f"{self.base_url}{endpoint}")
            if response.status_code == 401:
                print(f"✅ {endpoint} properly protected")
            else:
                print(f"❌ {endpoint} not properly protected (status: {response.status_code})")
                return False
        
        return True
    
    def test_invalid_token(self):
        """Test with invalid JWT token"""
        print("🔑 Testing Invalid Token...")
        
        # Set invalid token
        self.session.headers.update({"Authorization": "Bearer invalid_token_here"})
        
        response = self.session.get(f"{self.base_url}/auth/me")
        if response.status_code == 401:
            print("✅ Invalid token properly rejected")
            return True
        else:
            print(f"❌ Invalid token not rejected (status: {response.status_code})")
            return False
    
    def test_ai_chat_without_openai_key(self):
        """Test AI chat functionality"""
        print("🤖 Testing AI Chat Error Handling...")
        
        # First authenticate
        login_data = {"email": "admin@ilmandorla.com", "password": "admin123"}
        auth_response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
        
        if auth_response.status_code == 200:
            token = auth_response.json()["access_token"]
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            
            # Test AI chat with invalid data
            invalid_chat_data = {
                "message": "",  # Empty message
                "session_id": "test_session",
                "channel": "invalid_channel"
            }
            
            response = self.session.post(f"{self.base_url}/ai/chat", json=invalid_chat_data)
            # Should handle gracefully even with invalid channel
            if response.status_code in [200, 400, 422]:
                print("✅ AI chat handles invalid input appropriately")
                return True
            else:
                print(f"❌ AI chat error handling failed (status: {response.status_code})")
                return False
        
        return False
    
    def test_nonexistent_resources(self):
        """Test accessing non-existent resources"""
        print("🔍 Testing Non-existent Resources...")
        
        # Authenticate first
        login_data = {"email": "admin@ilmandorla.com", "password": "admin123"}
        auth_response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
        
        if auth_response.status_code == 200:
            token = auth_response.json()["access_token"]
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            
            # Test non-existent conversation
            response = self.session.get(f"{self.base_url}/ai/conversations/nonexistent_session")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) == 0:
                    print("✅ Non-existent conversation returns empty list")
                    return True
            
            print(f"❌ Non-existent resource handling failed (status: {response.status_code})")
        
        return False
    
    def run_error_tests(self):
        """Run all error handling tests"""
        print("🚀 Running Error Handling Tests")
        print("=" * 40)
        
        tests = [
            self.test_unauthorized_access,
            self.test_invalid_token,
            self.test_ai_chat_without_openai_key,
            self.test_nonexistent_resources
        ]
        
        passed = 0
        for test in tests:
            if test():
                passed += 1
            print()
        
        print("=" * 40)
        print(f"Error Handling Tests: {passed}/{len(tests)} passed")
        return passed == len(tests)

def main():
    tester = ErrorHandlingTester()
    success = tester.run_error_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()