#!/usr/bin/env python3
"""
Backend API Testing Script for IL MANDORLA Dashboard
Tests all backend endpoints with focus on new integrations
"""

import requests
import json
import uuid
from datetime import datetime
import sys
import os

# Backend URL from environment
BACKEND_URL = "https://6ee2569f-a1fd-4c29-b24e-3eae49e079f1.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = {}
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results[test_name] = {
            "success": success,
            "details": details,
            "response_data": response_data
        }
    
    def test_legacy_login(self):
        """Test legacy login endpoint"""
        print("🔐 Testing Legacy Authentication...")
        
        try:
            # Test legacy login
            login_data = {
                "email": "admin@ilmandorla.com",
                "password": "admin123"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_test("Legacy Login", True, f"User: {data['user']['name']}, Role: {data['user']['role']}")
                    return True
                else:
                    self.log_test("Legacy Login", False, "Missing access_token or user in response", data)
            else:
                self.log_test("Legacy Login", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Legacy Login", False, f"Exception: {str(e)}")
        
        return False
    
    def test_user_profile(self):
        """Test user profile retrieval"""
        print("👤 Testing User Profile...")
        
        if not self.auth_token:
            self.log_test("User Profile", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "email" in data and "name" in data:
                    self.log_test("User Profile", True, f"Retrieved profile for {data['name']} ({data['email']})")
                    return True
                else:
                    self.log_test("User Profile", False, "Missing required fields in profile", data)
            else:
                self.log_test("User Profile", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("User Profile", False, f"Exception: {str(e)}")
        
        return False
    
    def test_google_oauth_login(self):
        """Test Google OAuth2 login initiation"""
        print("🔍 Testing Google OAuth2 Login...")
        
        try:
            response = self.session.get(f"{self.base_url}/auth/google/login", allow_redirects=False)
            
            if response.status_code in [302, 307]:
                location = response.headers.get('Location', '')
                if 'accounts.google.com' in location and 'oauth2' in location:
                    self.log_test("Google OAuth2 Login", True, "Redirects to Google OAuth2 correctly")
                    return True
                else:
                    self.log_test("Google OAuth2 Login", False, f"Invalid redirect location: {location}")
            else:
                self.log_test("Google OAuth2 Login", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Google OAuth2 Login", False, f"Exception: {str(e)}")
        
        return False
    
    def test_ai_chat(self):
        """Test AI chat integration with different channels"""
        print("🤖 Testing AI Chat Integration...")
        
        if not self.auth_token:
            self.log_test("AI Chat", False, "No auth token available")
            return False
        
        channels = ["whatsapp", "instagram", "facebook", "tiktok", "general"]
        session_id = str(uuid.uuid4())
        
        for channel in channels:
            try:
                chat_data = {
                    "message": f"Hola, ¿qué especialidades tienen en {channel}?",
                    "session_id": session_id,
                    "channel": channel
                }
                
                response = self.session.post(f"{self.base_url}/ai/chat", json=chat_data)
                
                if response.status_code == 200:
                    data = response.json()
                    if "response" in data and "session_id" in data and "channel" in data:
                        self.log_test(f"AI Chat - {channel.title()}", True, f"Response length: {len(data['response'])} chars")
                    else:
                        self.log_test(f"AI Chat - {channel.title()}", False, "Missing required fields", data)
                        return False
                else:
                    self.log_test(f"AI Chat - {channel.title()}", False, f"HTTP {response.status_code}", response.text)
                    return False
                    
            except Exception as e:
                self.log_test(f"AI Chat - {channel.title()}", False, f"Exception: {str(e)}")
                return False
        
        return True
    
    def test_conversation_history(self):
        """Test conversation history retrieval"""
        print("💬 Testing Conversation History...")
        
        if not self.auth_token:
            self.log_test("Conversation History", False, "No auth token available")
            return False
        
        # First create a conversation
        session_id = str(uuid.uuid4())
        chat_data = {
            "message": "¿Cuáles son sus horarios de atención?",
            "session_id": session_id,
            "channel": "general"
        }
        
        try:
            # Send a message first
            chat_response = self.session.post(f"{self.base_url}/ai/chat", json=chat_data)
            
            if chat_response.status_code != 200:
                self.log_test("Conversation History", False, "Failed to create conversation for testing")
                return False
            
            # Now retrieve history
            response = self.session.get(f"{self.base_url}/ai/conversations/{session_id}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    conv = data[0]
                    if "user_message" in conv and "ai_response" in conv and "channel" in conv:
                        self.log_test("Conversation History", True, f"Retrieved {len(data)} conversation(s)")
                        return True
                    else:
                        self.log_test("Conversation History", False, "Missing required fields in conversation", conv)
                else:
                    self.log_test("Conversation History", False, "Empty or invalid conversation history", data)
            else:
                self.log_test("Conversation History", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Conversation History", False, f"Exception: {str(e)}")
        
        return False
    
    def test_restaurant_config(self):
        """Test restaurant configuration endpoint"""
        print("🏪 Testing Restaurant Configuration...")
        
        if not self.auth_token:
            self.log_test("Restaurant Config", False, "No auth token available")
            return False
        
        try:
            response = self.session.get(f"{self.base_url}/restaurant/config")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["name", "logo", "brand_color_primary", "menu_highlights", "ai_personality"]
                
                if all(field in data for field in required_fields):
                    self.log_test("Restaurant Config", True, f"Restaurant: {data['name']}, Menu highlights: {len(data['menu_highlights'])}")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Restaurant Config", False, f"Missing fields: {missing}", data)
            else:
                self.log_test("Restaurant Config", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Restaurant Config", False, f"Exception: {str(e)}")
        
        return False
    
    def test_dashboard_metrics(self):
        """Test dashboard metrics endpoint"""
        print("📊 Testing Dashboard Metrics...")
        
        if not self.auth_token:
            self.log_test("Dashboard Metrics", False, "No auth token available")
            return False
        
        try:
            response = self.session.get(f"{self.base_url}/dashboard/metrics")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_customers", "total_reservations", "total_points_delivered", 
                                 "total_revenue", "avg_rating", "nfts_delivered", "active_ai_agents"]
                
                if all(field in data for field in required_fields):
                    metrics_summary = f"Customers: {data['total_customers']}, Reservations: {data['total_reservations']}, Revenue: ${data['total_revenue']}"
                    self.log_test("Dashboard Metrics", True, metrics_summary)
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Dashboard Metrics", False, f"Missing fields: {missing}", data)
            else:
                self.log_test("Dashboard Metrics", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Dashboard Metrics", False, f"Exception: {str(e)}")
        
        return False
    
    def test_menu_crud(self):
        """Test menu CRUD operations"""
        print("🍽️ Testing Menu CRUD Operations...")
        
        if not self.auth_token:
            self.log_test("Menu CRUD", False, "No auth token available")
            return False
        
        try:
            # Test GET menu
            response = self.session.get(f"{self.base_url}/menu")
            
            if response.status_code == 200:
                menu_items = response.json()
                if isinstance(menu_items, list):
                    self.log_test("Menu GET", True, f"Retrieved {len(menu_items)} menu items")
                    
                    # Test POST new menu item
                    new_item = {
                        "name": "Test Brisket Special",
                        "description": "Premium smoked brisket with house sauce",
                        "price": 25.99,
                        "category": "main",
                        "is_active": True,
                        "popularity_score": 4.5
                    }
                    
                    post_response = self.session.post(f"{self.base_url}/menu", json=new_item)
                    
                    if post_response.status_code == 200:
                        created_item = post_response.json()
                        if "id" in created_item and created_item["name"] == new_item["name"]:
                            self.log_test("Menu POST", True, f"Created item: {created_item['name']}")
                            
                            # Test PUT update
                            created_item["price"] = 27.99
                            put_response = self.session.put(f"{self.base_url}/menu/{created_item['id']}", json=created_item)
                            
                            if put_response.status_code == 200:
                                self.log_test("Menu PUT", True, f"Updated price to ${created_item['price']}")
                                
                                # Test DELETE
                                delete_response = self.session.delete(f"{self.base_url}/menu/{created_item['id']}")
                                
                                if delete_response.status_code == 200:
                                    self.log_test("Menu DELETE", True, "Item deleted successfully")
                                    return True
                                else:
                                    self.log_test("Menu DELETE", False, f"HTTP {delete_response.status_code}")
                            else:
                                self.log_test("Menu PUT", False, f"HTTP {put_response.status_code}")
                        else:
                            self.log_test("Menu POST", False, "Invalid created item response", created_item)
                    else:
                        self.log_test("Menu POST", False, f"HTTP {post_response.status_code}", post_response.text)
                else:
                    self.log_test("Menu GET", False, "Invalid menu items response", menu_items)
            else:
                self.log_test("Menu GET", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Menu CRUD", False, f"Exception: {str(e)}")
        
        return False
    
    def test_customer_management(self):
        """Test customer management endpoints"""
        print("👥 Testing Customer Management...")
        
        if not self.auth_token:
            self.log_test("Customer Management", False, "No auth token available")
            return False
        
        try:
            response = self.session.get(f"{self.base_url}/customers")
            
            if response.status_code == 200:
                customers = response.json()
                if isinstance(customers, list):
                    self.log_test("Customer Management", True, f"Retrieved {len(customers)} customers")
                    return True
                else:
                    self.log_test("Customer Management", False, "Invalid customers response", customers)
            else:
                self.log_test("Customer Management", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Customer Management", False, f"Exception: {str(e)}")
        
        return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting IL MANDORLA Backend API Tests")
        print("=" * 60)
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test authentication first
        auth_success = self.test_legacy_login()
        if auth_success:
            self.test_user_profile()
        
        # Test Google OAuth2 (doesn't require auth)
        self.test_google_oauth_login()
        
        # Test AI integrations (requires auth)
        if auth_success:
            self.test_ai_chat()
            self.test_conversation_history()
            self.test_restaurant_config()
            self.test_dashboard_metrics()
            self.test_menu_crud()
            self.test_customer_management()
        
        # Print summary
        print("=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results.values() if result["success"])
        total = len(self.test_results)
        
        for test_name, result in self.test_results.items():
            status = "✅" if result["success"] else "❌"
            print(f"{status} {test_name}")
        
        print(f"\nResults: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed - check details above")
            return False

def main():
    """Main test execution"""
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()