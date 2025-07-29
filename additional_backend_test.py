#!/usr/bin/env python3
"""
Additional Backend API Tests for IL MANDORLA Dashboard
Tests remaining endpoints not covered in main test
"""

import requests
import json
import uuid
from datetime import datetime
import sys

# Backend URL from environment
BACKEND_URL = "https://f9ee05df-db02-4bc7-afe9-07c7cf0248cc.preview.emergentagent.com/api"

class AdditionalTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        
    def authenticate(self):
        """Get auth token"""
        login_data = {
            "email": "admin@ilmandorla.com",
            "password": "admin123"
        }
        
        response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            self.auth_token = data["access_token"]
            self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
            return True
        return False
    
    def test_reservations_crud(self):
        """Test reservations CRUD"""
        print("📅 Testing Reservations CRUD...")
        
        # Create reservation
        reservation_data = {
            "customer_id": str(uuid.uuid4()),
            "customer_name": "María González",
            "date": "2024-12-25T19:00:00",
            "time": "19:00",
            "guests": 4,
            "phone": "+54911234567",
            "email": "maria@example.com",
            "status": "confirmed",
            "special_requests": "Mesa cerca de la ventana"
        }
        
        response = self.session.post(f"{self.base_url}/reservations", json=reservation_data)
        if response.status_code == 200:
            print("✅ Reservation created successfully")
            return True
        else:
            print(f"❌ Failed to create reservation: {response.status_code}")
            return False
    
    def test_feedback_system(self):
        """Test feedback system"""
        print("💭 Testing Feedback System...")
        
        feedback_data = {
            "customer_id": str(uuid.uuid4()),
            "customer_name": "Carlos Rodríguez",
            "rating": 5,
            "comment": "Excelente brisket, la mejor parrilla de Buenos Aires!",
            "is_approved": True
        }
        
        response = self.session.post(f"{self.base_url}/feedback", json=feedback_data)
        if response.status_code == 200:
            print("✅ Feedback created successfully")
            return True
        else:
            print(f"❌ Failed to create feedback: {response.status_code}")
            return False
    
    def test_ai_agents_crud(self):
        """Test AI agents CRUD"""
        print("🤖 Testing AI Agents CRUD...")
        
        agent_data = {
            "channel": "whatsapp",
            "name": "WhatsApp Assistant",
            "prompt": "Eres un asistente especializado en WhatsApp para IL MANDORLA",
            "is_active": True
        }
        
        response = self.session.post(f"{self.base_url}/ai-agents", json=agent_data)
        if response.status_code == 200:
            print("✅ AI Agent created successfully")
            return True
        else:
            print(f"❌ Failed to create AI agent: {response.status_code}")
            return False
    
    def test_nft_rewards(self):
        """Test NFT rewards system"""
        print("🏆 Testing NFT Rewards...")
        
        nft_data = {
            "name": "Bronce Smokehouse",
            "description": "NFT de nivel bronce para clientes frecuentes",
            "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "level": "bronce",
            "points_required": 100,
            "attributes": {
                "discount": "10%",
                "priority_booking": True
            }
        }
        
        response = self.session.post(f"{self.base_url}/nft-rewards", json=nft_data)
        if response.status_code == 200:
            print("✅ NFT Reward created successfully")
            return True
        else:
            print(f"❌ Failed to create NFT reward: {response.status_code}")
            return False
    
    def test_integrations(self):
        """Test integrations management"""
        print("🔌 Testing Integrations...")
        
        integration_data = {
            "name": "OpenAI Integration",
            "type": "openai",
            "is_active": True,
            "config": {
                "model": "gpt-4o",
                "temperature": 0.7
            }
        }
        
        response = self.session.post(f"{self.base_url}/integrations", json=integration_data)
        if response.status_code == 200:
            print("✅ Integration created successfully")
            return True
        else:
            print(f"❌ Failed to create integration: {response.status_code}")
            return False
    
    def test_restaurant_settings(self):
        """Test restaurant settings"""
        print("⚙️ Testing Restaurant Settings...")
        
        # Get current settings
        response = self.session.get(f"{self.base_url}/settings")
        if response.status_code == 200:
            settings = response.json()
            print("✅ Settings retrieved successfully")
            
            # Update settings
            settings["phone"] = "+54911234567"
            settings["email"] = "info@ilmandorla.com"
            
            update_response = self.session.put(f"{self.base_url}/settings", json=settings)
            if update_response.status_code == 200:
                print("✅ Settings updated successfully")
                return True
            else:
                print(f"❌ Failed to update settings: {update_response.status_code}")
        else:
            print(f"❌ Failed to get settings: {response.status_code}")
        
        return False
    
    def run_additional_tests(self):
        """Run additional tests"""
        print("🚀 Running Additional Backend Tests")
        print("=" * 50)
        
        if not self.authenticate():
            print("❌ Authentication failed")
            return False
        
        tests = [
            self.test_reservations_crud,
            self.test_feedback_system,
            self.test_ai_agents_crud,
            self.test_nft_rewards,
            self.test_integrations,
            self.test_restaurant_settings
        ]
        
        passed = 0
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 50)
        print(f"Additional Tests: {passed}/{len(tests)} passed")
        return passed == len(tests)

def main():
    tester = AdditionalTester()
    success = tester.run_additional_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()