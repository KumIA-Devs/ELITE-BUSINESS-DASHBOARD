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
BACKEND_URL = "https://fbb32e47-90a2-4ee3-96c2-f8d1b92449da.preview.emergentagent.com/api"

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
            # Test GET customers
            response = self.session.get(f"{self.base_url}/customers")
            
            if response.status_code == 200:
                customers = response.json()
                if isinstance(customers, list):
                    self.log_test("Customer GET", True, f"Retrieved {len(customers)} customers")
                    
                    # Test POST new customer
                    new_customer = {
                        "name": "María González",
                        "email": "maria.gonzalez@email.com",
                        "phone": "+54911234567",
                        "nft_level": "bronce",
                        "points": 150,
                        "total_spent": 2500.0
                    }
                    
                    post_response = self.session.post(f"{self.base_url}/customers", json=new_customer)
                    
                    if post_response.status_code == 200:
                        created_customer = post_response.json()
                        if "id" in created_customer and created_customer["name"] == new_customer["name"]:
                            self.log_test("Customer POST", True, f"Created customer: {created_customer['name']}")
                            
                            # Test PUT update
                            created_customer["points"] = 200
                            put_response = self.session.put(f"{self.base_url}/customers/{created_customer['id']}", json=created_customer)
                            
                            if put_response.status_code == 200:
                                self.log_test("Customer PUT", True, f"Updated points to {created_customer['points']}")
                                return True
                            else:
                                self.log_test("Customer PUT", False, f"HTTP {put_response.status_code}")
                        else:
                            self.log_test("Customer POST", False, "Invalid created customer response", created_customer)
                    else:
                        self.log_test("Customer POST", False, f"HTTP {post_response.status_code}", post_response.text)
                else:
                    self.log_test("Customer GET", False, "Invalid customers response", customers)
            else:
                self.log_test("Customer GET", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Customer Management", False, f"Exception: {str(e)}")
        
        return False
    
    def test_reservations_crud(self):
        """Test reservations CRUD operations"""
        print("📅 Testing Reservations CRUD...")
        
        if not self.auth_token:
            self.log_test("Reservations CRUD", False, "No auth token available")
            return False
        
        try:
            # Test GET reservations
            response = self.session.get(f"{self.base_url}/reservations")
            
            if response.status_code == 200:
                reservations = response.json()
                if isinstance(reservations, list):
                    self.log_test("Reservations GET", True, f"Retrieved {len(reservations)} reservations")
                    
                    # Test POST new reservation
                    new_reservation = {
                        "customer_id": str(uuid.uuid4()),
                        "customer_name": "Carlos Mendoza",
                        "date": "2024-12-25T20:00:00",
                        "time": "20:00",
                        "guests": 4,
                        "phone": "+54911234567",
                        "email": "carlos.mendoza@email.com",
                        "status": "confirmed",
                        "special_requests": "Mesa cerca de la ventana"
                    }
                    
                    post_response = self.session.post(f"{self.base_url}/reservations", json=new_reservation)
                    
                    if post_response.status_code == 200:
                        created_reservation = post_response.json()
                        if "id" in created_reservation and created_reservation["customer_name"] == new_reservation["customer_name"]:
                            self.log_test("Reservations POST", True, f"Created reservation for: {created_reservation['customer_name']}")
                            
                            # Test PUT update
                            created_reservation["guests"] = 6
                            put_response = self.session.put(f"{self.base_url}/reservations/{created_reservation['id']}", json=created_reservation)
                            
                            if put_response.status_code == 200:
                                self.log_test("Reservations PUT", True, f"Updated guests to {created_reservation['guests']}")
                                return True
                            else:
                                self.log_test("Reservations PUT", False, f"HTTP {put_response.status_code}")
                        else:
                            self.log_test("Reservations POST", False, "Invalid created reservation response", created_reservation)
                    else:
                        self.log_test("Reservations POST", False, f"HTTP {post_response.status_code}", post_response.text)
                else:
                    self.log_test("Reservations GET", False, "Invalid reservations response", reservations)
            else:
                self.log_test("Reservations GET", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Reservations CRUD", False, f"Exception: {str(e)}")
        
        return False
    
    def test_feedback_management(self):
        """Test feedback management endpoints"""
        print("💬 Testing Feedback Management...")
        
        if not self.auth_token:
            self.log_test("Feedback Management", False, "No auth token available")
            return False
        
        try:
            # Test GET feedback
            response = self.session.get(f"{self.base_url}/feedback")
            
            if response.status_code == 200:
                feedback_list = response.json()
                if isinstance(feedback_list, list):
                    self.log_test("Feedback GET", True, f"Retrieved {len(feedback_list)} feedback items")
                    
                    # Test POST new feedback
                    new_feedback = {
                        "customer_id": str(uuid.uuid4()),
                        "customer_name": "Ana Rodríguez",
                        "rating": 5,
                        "comment": "Excelente experiencia! El brisket estaba perfecto y el servicio impecable.",
                        "is_approved": True
                    }
                    
                    post_response = self.session.post(f"{self.base_url}/feedback", json=new_feedback)
                    
                    if post_response.status_code == 200:
                        created_feedback = post_response.json()
                        if "id" in created_feedback and created_feedback["customer_name"] == new_feedback["customer_name"]:
                            self.log_test("Feedback POST", True, f"Created feedback from: {created_feedback['customer_name']} (Rating: {created_feedback['rating']})")
                            return True
                        else:
                            self.log_test("Feedback POST", False, "Invalid created feedback response", created_feedback)
                    else:
                        self.log_test("Feedback POST", False, f"HTTP {post_response.status_code}", post_response.text)
                else:
                    self.log_test("Feedback GET", False, "Invalid feedback response", feedback_list)
            else:
                self.log_test("Feedback GET", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Feedback Management", False, f"Exception: {str(e)}")
        
        return False
    
    def test_ai_agents_crud(self):
        """Test AI agents CRUD operations"""
        print("🤖 Testing AI Agents CRUD...")
        
        if not self.auth_token:
            self.log_test("AI Agents CRUD", False, "No auth token available")
            return False
        
        try:
            # Test GET AI agents
            response = self.session.get(f"{self.base_url}/ai-agents")
            
            if response.status_code == 200:
                agents = response.json()
                if isinstance(agents, list):
                    self.log_test("AI Agents GET", True, f"Retrieved {len(agents)} AI agents")
                    
                    # Test POST new AI agent
                    new_agent = {
                        "channel": "whatsapp",
                        "name": "WhatsApp Assistant",
                        "prompt": "Eres un asistente especializado en WhatsApp para IL MANDORLA. Responde de manera amigable y concisa.",
                        "is_active": True
                    }
                    
                    post_response = self.session.post(f"{self.base_url}/ai-agents", json=new_agent)
                    
                    if post_response.status_code == 200:
                        created_agent = post_response.json()
                        if "id" in created_agent and created_agent["channel"] == new_agent["channel"]:
                            self.log_test("AI Agents POST", True, f"Created AI agent for: {created_agent['channel']}")
                            
                            # Test PUT update
                            created_agent["is_active"] = False
                            put_response = self.session.put(f"{self.base_url}/ai-agents/{created_agent['id']}", json=created_agent)
                            
                            if put_response.status_code == 200:
                                self.log_test("AI Agents PUT", True, f"Updated agent status to inactive")
                                return True
                            else:
                                self.log_test("AI Agents PUT", False, f"HTTP {put_response.status_code}")
                        else:
                            self.log_test("AI Agents POST", False, "Invalid created agent response", created_agent)
                    else:
                        self.log_test("AI Agents POST", False, f"HTTP {post_response.status_code}", post_response.text)
                else:
                    self.log_test("AI Agents GET", False, "Invalid agents response", agents)
            else:
                self.log_test("AI Agents GET", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("AI Agents CRUD", False, f"Exception: {str(e)}")
        
        return False
    
    def test_nft_rewards_crud(self):
        """Test NFT rewards CRUD operations"""
        print("🏆 Testing NFT Rewards CRUD...")
        
        if not self.auth_token:
            self.log_test("NFT Rewards CRUD", False, "No auth token available")
            return False
        
        try:
            # Test GET NFT rewards
            response = self.session.get(f"{self.base_url}/nft-rewards")
            
            if response.status_code == 200:
                rewards = response.json()
                if isinstance(rewards, list):
                    self.log_test("NFT Rewards GET", True, f"Retrieved {len(rewards)} NFT rewards")
                    
                    # Test POST new NFT reward
                    new_reward = {
                        "name": "Bronce Smokehouse",
                        "description": "NFT de nivel bronce para clientes leales",
                        "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                        "level": "bronce",
                        "points_required": 100,
                        "attributes": {
                            "rarity": "common",
                            "benefits": ["5% descuento", "acceso prioritario"]
                        }
                    }
                    
                    post_response = self.session.post(f"{self.base_url}/nft-rewards", json=new_reward)
                    
                    if post_response.status_code == 200:
                        created_reward = post_response.json()
                        if "id" in created_reward and created_reward["name"] == new_reward["name"]:
                            self.log_test("NFT Rewards POST", True, f"Created NFT reward: {created_reward['name']} ({created_reward['level']})")
                            return True
                        else:
                            self.log_test("NFT Rewards POST", False, "Invalid created reward response", created_reward)
                    else:
                        self.log_test("NFT Rewards POST", False, f"HTTP {post_response.status_code}", post_response.text)
                else:
                    self.log_test("NFT Rewards GET", False, "Invalid rewards response", rewards)
            else:
                self.log_test("NFT Rewards GET", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("NFT Rewards CRUD", False, f"Exception: {str(e)}")
        
        return False
    
    def test_integrations_crud(self):
        """Test integrations CRUD operations"""
        print("🔌 Testing Integrations CRUD...")
        
        if not self.auth_token:
            self.log_test("Integrations CRUD", False, "No auth token available")
            return False
        
        try:
            # Test GET integrations
            response = self.session.get(f"{self.base_url}/integrations")
            
            if response.status_code == 200:
                integrations = response.json()
                if isinstance(integrations, list):
                    self.log_test("Integrations GET", True, f"Retrieved {len(integrations)} integrations")
                    
                    # Test POST new integration
                    new_integration = {
                        "name": "Stripe Payment",
                        "type": "stripe",
                        "api_key": "sk_test_123456789",
                        "is_active": True,
                        "config": {
                            "webhook_url": "https://example.com/webhook",
                            "currency": "ARS"
                        }
                    }
                    
                    post_response = self.session.post(f"{self.base_url}/integrations", json=new_integration)
                    
                    if post_response.status_code == 200:
                        created_integration = post_response.json()
                        if "id" in created_integration and created_integration["name"] == new_integration["name"]:
                            self.log_test("Integrations POST", True, f"Created integration: {created_integration['name']} ({created_integration['type']})")
                            
                            # Test PUT update
                            created_integration["is_active"] = False
                            put_response = self.session.put(f"{self.base_url}/integrations/{created_integration['id']}", json=created_integration)
                            
                            if put_response.status_code == 200:
                                self.log_test("Integrations PUT", True, f"Updated integration status to inactive")
                                return True
                            else:
                                self.log_test("Integrations PUT", False, f"HTTP {put_response.status_code}")
                        else:
                            self.log_test("Integrations POST", False, "Invalid created integration response", created_integration)
                    else:
                        self.log_test("Integrations POST", False, f"HTTP {post_response.status_code}", post_response.text)
                else:
                    self.log_test("Integrations GET", False, "Invalid integrations response", integrations)
            else:
                self.log_test("Integrations GET", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Integrations CRUD", False, f"Exception: {str(e)}")
        
        return False
    
    def test_settings_management(self):
        """Test settings management endpoints"""
        print("⚙️ Testing Settings Management...")
        
        if not self.auth_token:
            self.log_test("Settings Management", False, "No auth token available")
            return False
        
        try:
            # Test GET settings
            response = self.session.get(f"{self.base_url}/settings")
            
            if response.status_code == 200:
                settings = response.json()
                if isinstance(settings, dict) and "name" in settings:
                    self.log_test("Settings GET", True, f"Retrieved settings for: {settings['name']}")
                    
                    # Test PUT update settings
                    settings["voice_tone"] = "amigable y profesional con toque argentino"
                    settings["opening_hours"] = {
                        "monday": "12:00-23:00",
                        "tuesday": "12:00-23:00",
                        "wednesday": "12:00-23:00",
                        "thursday": "12:00-23:00",
                        "friday": "12:00-24:00",
                        "saturday": "12:00-24:00",
                        "sunday": "12:00-22:00"
                    }
                    
                    put_response = self.session.put(f"{self.base_url}/settings", json=settings)
                    
                    if put_response.status_code == 200:
                        updated_settings = put_response.json()
                        if updated_settings["voice_tone"] == settings["voice_tone"]:
                            self.log_test("Settings PUT", True, f"Updated voice tone and opening hours")
                            return True
                        else:
                            self.log_test("Settings PUT", False, "Settings not updated correctly", updated_settings)
                    else:
                        self.log_test("Settings PUT", False, f"HTTP {put_response.status_code}", put_response.text)
                else:
                    self.log_test("Settings GET", False, "Invalid settings response", settings)
            else:
                self.log_test("Settings GET", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Settings Management", False, f"Exception: {str(e)}")
        
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
            self.test_reservations_crud()
            self.test_feedback_management()
            self.test_ai_agents_crud()
            self.test_nft_rewards_crud()
            self.test_integrations_crud()
            self.test_settings_management()
        
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