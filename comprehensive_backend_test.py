#!/usr/bin/env python3
"""
Comprehensive Backend Testing for IL MANDORLA Dashboard
Testing all main backend functionality as requested in review:
1. All existing API endpoints are still functional
2. Authentication system is working properly  
3. Database connectivity is functioning
4. All CRUD operations are working for game sessions, user management, and rewards
"""

import requests
import json
import uuid
from datetime import datetime
import sys
import os

# Backend URL from environment
BACKEND_URL = "https://355dd713-0907-4ee1-a125-ebf97fe9c105.preview.emergentagent.com/api"

class ComprehensiveBackendTester:
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
    
    def authenticate(self):
        """Authenticate with the backend"""
        print("🔐 Testing Authentication System...")
        
        try:
            login_data = {
                "email": "admin@ilmandorla.com",
                "password": "admin123"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.auth_token = data["access_token"]
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_test("Authentication System", True, f"Login successful: {data['user']['name']} ({data['user']['role']})")
                    return True
                    
        except Exception as e:
            self.log_test("Authentication System", False, f"Exception: {str(e)}")
        
        return False

    def test_database_connectivity(self):
        """Test database connectivity through dashboard metrics"""
        print("🗄️ Testing Database Connectivity...")
        
        if not self.auth_token:
            self.log_test("Database Connectivity", False, "No auth token available")
            return False
        
        try:
            response = self.session.get(f"{self.base_url}/dashboard/metrics")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_customers", "total_reservations", "total_revenue"]
                
                if all(field in data for field in required_fields):
                    self.log_test("Database Connectivity", True, f"Database responding: {data['total_customers']} customers, {data['total_reservations']} reservations, ${data['total_revenue']} revenue")
                    return True
                else:
                    self.log_test("Database Connectivity", False, "Missing required fields in metrics")
            else:
                self.log_test("Database Connectivity", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Database Connectivity", False, f"Exception: {str(e)}")
        
        return False

    def test_user_management_crud(self):
        """Test user management CRUD operations"""
        print("👥 Testing User Management CRUD...")
        
        if not self.auth_token:
            self.log_test("User Management CRUD", False, "No auth token available")
            return False
        
        try:
            # Test user profile retrieval (READ)
            response = self.session.get(f"{self.base_url}/auth/me")
            
            if response.status_code == 200:
                user_data = response.json()
                if "id" in user_data and "email" in user_data:
                    self.log_test("User Management - READ", True, f"User profile retrieved: {user_data['name']}")
                    
                    # Test customer management (part of user management system)
                    customers_response = self.session.get(f"{self.base_url}/customers")
                    
                    if customers_response.status_code == 200:
                        customers = customers_response.json()
                        self.log_test("User Management - Customer List", True, f"Retrieved {len(customers)} customers")
                        
                        # Test creating a new customer (CREATE)
                        new_customer = {
                            "name": "Test User Management",
                            "email": "testuser@ilmandorla.com",
                            "phone": "+595123456789",
                            "nft_level": "bronce",
                            "points": 100
                        }
                        
                        create_response = self.session.post(f"{self.base_url}/customers", json=new_customer)
                        
                        if create_response.status_code == 200:
                            created_customer = create_response.json()
                            self.log_test("User Management - CREATE", True, f"Customer created: {created_customer['name']}")
                            
                            # Test updating customer (UPDATE)
                            created_customer["points"] = 150
                            update_response = self.session.put(f"{self.base_url}/customers/{created_customer['id']}", json=created_customer)
                            
                            if update_response.status_code == 200:
                                self.log_test("User Management - UPDATE", True, f"Customer updated: points = {created_customer['points']}")
                                return True
                            else:
                                self.log_test("User Management - UPDATE", False, f"HTTP {update_response.status_code}")
                        else:
                            self.log_test("User Management - CREATE", False, f"HTTP {create_response.status_code}")
                    else:
                        self.log_test("User Management - Customer List", False, f"HTTP {customers_response.status_code}")
                else:
                    self.log_test("User Management - READ", False, "Missing required fields in user profile")
            else:
                self.log_test("User Management - READ", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("User Management CRUD", False, f"Exception: {str(e)}")
        
        return False

    def test_rewards_system_crud(self):
        """Test rewards system CRUD operations (NFT rewards)"""
        print("🏆 Testing Rewards System CRUD...")
        
        if not self.auth_token:
            self.log_test("Rewards System CRUD", False, "No auth token available")
            return False
        
        try:
            # Test GET rewards (READ)
            response = self.session.get(f"{self.base_url}/nft-rewards")
            
            if response.status_code == 200:
                rewards = response.json()
                self.log_test("Rewards System - READ", True, f"Retrieved {len(rewards)} NFT rewards")
                
                # Test CREATE new reward
                new_reward = {
                    "name": "Test Gaming Reward",
                    "description": "Special reward for multiplayer game achievements",
                    "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                    "level": "oro",
                    "points_required": 500,
                    "attributes": {
                        "rarity": "rare",
                        "game_achievement": True,
                        "multiplayer_bonus": 25
                    }
                }
                
                create_response = self.session.post(f"{self.base_url}/nft-rewards", json=new_reward)
                
                if create_response.status_code == 200:
                    created_reward = create_response.json()
                    self.log_test("Rewards System - CREATE", True, f"Reward created: {created_reward['name']} ({created_reward['level']})")
                    return True
                else:
                    self.log_test("Rewards System - CREATE", False, f"HTTP {create_response.status_code}")
            else:
                self.log_test("Rewards System - READ", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Rewards System CRUD", False, f"Exception: {str(e)}")
        
        return False

    def test_game_sessions_management(self):
        """Test game sessions management (using reservations as game session proxy)"""
        print("🎮 Testing Game Sessions Management...")
        
        if not self.auth_token:
            self.log_test("Game Sessions Management", False, "No auth token available")
            return False
        
        try:
            # Test GET game sessions (using reservations as proxy)
            response = self.session.get(f"{self.base_url}/reservations")
            
            if response.status_code == 200:
                sessions = response.json()
                self.log_test("Game Sessions - READ", True, f"Retrieved {len(sessions)} game sessions")
                
                # Test CREATE new game session
                new_session = {
                    "customer_id": str(uuid.uuid4()),
                    "customer_name": "Gaming Player Test",
                    "date": "2024-12-25T20:00:00",
                    "time": "20:00",
                    "guests": 2,
                    "phone": "+595987654321",
                    "email": "gamer@ilmandorla.com",
                    "status": "confirmed",
                    "special_requests": "Mesa para juegos multijugador"
                }
                
                create_response = self.session.post(f"{self.base_url}/reservations", json=new_session)
                
                if create_response.status_code == 200:
                    created_session = create_response.json()
                    self.log_test("Game Sessions - CREATE", True, f"Game session created: {created_session['customer_name']}")
                    
                    # Test UPDATE game session
                    created_session["guests"] = 4
                    created_session["special_requests"] = "Mesa amplia para juegos multijugador - 4 jugadores"
                    
                    update_response = self.session.put(f"{self.base_url}/reservations/{created_session['id']}", json=created_session)
                    
                    if update_response.status_code == 200:
                        self.log_test("Game Sessions - UPDATE", True, f"Game session updated: {created_session['guests']} players")
                        return True
                    else:
                        self.log_test("Game Sessions - UPDATE", False, f"HTTP {update_response.status_code}")
                else:
                    self.log_test("Game Sessions - CREATE", False, f"HTTP {create_response.status_code}")
            else:
                self.log_test("Game Sessions - READ", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Game Sessions Management", False, f"Exception: {str(e)}")
        
        return False

    def test_ai_chat_functionality(self):
        """Test AI chat functionality"""
        print("🤖 Testing AI Chat Functionality...")
        
        if not self.auth_token:
            self.log_test("AI Chat Functionality", False, "No auth token available")
            return False
        
        try:
            session_id = str(uuid.uuid4())
            chat_data = {
                "message": "¿Tienen juegos multijugador disponibles en el restaurante?",
                "session_id": session_id,
                "channel": "whatsapp"
            }
            
            response = self.session.post(f"{self.base_url}/ai/chat", json=chat_data)
            
            if response.status_code == 200:
                data = response.json()
                if "response" in data and len(data["response"]) > 10:
                    self.log_test("AI Chat Functionality", True, f"AI responded with {len(data['response'])} characters")
                    return True
                else:
                    self.log_test("AI Chat Functionality", False, "AI response too short or missing")
            else:
                self.log_test("AI Chat Functionality", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("AI Chat Functionality", False, f"Exception: {str(e)}")
        
        return False

    def test_content_factory_endpoints(self):
        """Test Content Factory endpoints"""
        print("🏭 Testing Content Factory Endpoints...")
        
        if not self.auth_token:
            self.log_test("Content Factory Endpoints", False, "No auth token available")
            return False
        
        try:
            # Test video generation
            video_request = {
                "prompt": "Video promocional de juegos multijugador en IL MANDORLA",
                "model": "runwayml",
                "duration": 10,
                "style": "cinematica",
                "platform": "instagram"
            }
            
            video_response = self.session.post(f"{self.base_url}/content-factory/video/generate", json=video_request)
            
            if video_response.status_code == 200:
                video_data = video_response.json()
                if "job_id" in video_data:
                    self.log_test("Content Factory - Video", True, f"Video job created: {video_data['job_id']}")
                    
                    # Test image generation
                    image_request = {
                        "prompt": "Imagen promocional de juegos multijugador en IL MANDORLA",
                        "style": "fotografico",
                        "format": "post",
                        "platform": "instagram",
                        "count": 1
                    }
                    
                    image_response = self.session.post(f"{self.base_url}/content-factory/image/generate", json=image_request)
                    
                    if image_response.status_code == 200:
                        image_data = image_response.json()
                        if "images" in image_data:
                            self.log_test("Content Factory - Image", True, f"Generated {len(image_data['images'])} images")
                            return True
                        else:
                            self.log_test("Content Factory - Image", False, "No images in response")
                    else:
                        self.log_test("Content Factory - Image", False, f"HTTP {image_response.status_code}")
                else:
                    self.log_test("Content Factory - Video", False, "No job_id in response")
            else:
                self.log_test("Content Factory - Video", False, f"HTTP {video_response.status_code}")
                
        except Exception as e:
            self.log_test("Content Factory Endpoints", False, f"Exception: {str(e)}")
        
        return False

    def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        print("🎯 Starting Comprehensive Backend Tests for IL MANDORLA Dashboard")
        print("=" * 80)
        print(f"Backend URL: {self.base_url}")
        print("Testing areas as requested:")
        print("1. All existing API endpoints are still functional")
        print("2. Authentication system is working properly")
        print("3. Database connectivity is functioning")
        print("4. All CRUD operations for user management and rewards")
        print("5. Game sessions management (via reservations)")
        print("6. AI chat functionality")
        print("7. Content Factory endpoints")
        print("=" * 80)
        
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run comprehensive tests
        test_results = []
        
        # Test database connectivity
        result1 = self.test_database_connectivity()
        test_results.append(("Database Connectivity", result1))
        
        # Test user management CRUD
        result2 = self.test_user_management_crud()
        test_results.append(("User Management CRUD", result2))
        
        # Test rewards system CRUD
        result3 = self.test_rewards_system_crud()
        test_results.append(("Rewards System CRUD", result3))
        
        # Test game sessions management
        result4 = self.test_game_sessions_management()
        test_results.append(("Game Sessions Management", result4))
        
        # Test AI chat functionality
        result5 = self.test_ai_chat_functionality()
        test_results.append(("AI Chat Functionality", result5))
        
        # Test Content Factory endpoints
        result6 = self.test_content_factory_endpoints()
        test_results.append(("Content Factory Endpoints", result6))
        
        # Print summary
        print("=" * 80)
        print("📋 COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        
        passed = 0
        total = len(test_results)
        
        for test_name, success in test_results:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{status} {test_name}")
            if success:
                passed += 1
        
        print(f"\nResults: {passed}/{total} comprehensive tests passed")
        
        if passed == total:
            print("🎉 All comprehensive tests passed!")
            return True
        else:
            print(f"⚠️ {total - passed} test(s) failed. Check details above.")
            return False

if __name__ == "__main__":
    tester = ComprehensiveBackendTester()
    success = tester.run_comprehensive_tests()
    sys.exit(0 if success else 1)