#!/usr/bin/env python3
"""
Focused Backend Testing for Current Focus Tasks
Testing specific areas mentioned in test_result.md current_focus:
1. Enhanced Image Generation with New Content Types
2. Segmentation Campaign Functionality
"""

import requests
import json
import uuid
from datetime import datetime
import sys
import os

# Backend URL from environment
BACKEND_URL = "https://ec30878d-3ce7-4b6c-abf8-9b2306ddcd6a.preview.emergentagent.com/api"

class FocusedBackendTester:
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
        print("🔐 Authenticating...")
        
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
                    print(f"✅ Authentication successful: {data['user']['name']}")
                    return True
                    
        except Exception as e:
            print(f"❌ Authentication failed: {str(e)}")
        
        return False

    def test_enhanced_image_generation_content_types(self):
        """Test Enhanced Image Generation with New Content Types - Focus Task 1"""
        print("🎨 Testing Enhanced Image Generation with New Content Types...")
        
        if not self.auth_token:
            self.log_test("Enhanced Image Generation", False, "No auth token available")
            return False
        
        try:
            # Test carousel format (3 images)
            carousel_request = {
                "prompt": "IL MANDORLA smokehouse carousel: 1) Exterior shot with logo, 2) Premium brisket close-up, 3) Happy customers dining",
                "style": "fotografico_premium",
                "format": "carousel",
                "platform": "instagram",
                "count": 3,
                "resolution": "1080x1080",
                "brand_integration": "high",
                "color_palette": "warm_smokehouse",
                "logo_inclusion": True
            }
            
            response = self.session.post(f"{self.base_url}/content-factory/image/generate", json=carousel_request, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "completed" and len(data.get("images", [])) == 3:
                    # Test cost calculation for premium carousel
                    expected_cost = 3 * 2 * 1.5  # 3 images × 2 base × 1.5 premium multiplier = 9.0
                    actual_cost = data.get("cost", 0)
                    
                    if actual_cost == expected_cost:
                        self.log_test("Enhanced Image Generation - Carousel", True, f"Generated 3 carousel images, Cost: {actual_cost} credits (correct premium pricing)")
                        
                        # Test story format
                        story_request = {
                            "prompt": "IL MANDORLA Instagram story: Behind the scenes smokehouse preparation with chef",
                            "style": "fotografico",
                            "format": "story",
                            "platform": "instagram",
                            "count": 1,
                            "resolution": "1080x1920",
                            "brand_integration": "medium"
                        }
                        
                        story_response = self.session.post(f"{self.base_url}/content-factory/image/generate", json=story_request, timeout=30)
                        
                        if story_response.status_code == 200:
                            story_data = story_response.json()
                            if story_data.get("status") == "completed":
                                self.log_test("Enhanced Image Generation - Story", True, f"Generated story format image successfully")
                                return True
                            else:
                                self.log_test("Enhanced Image Generation - Story", False, f"Story generation failed: {story_data.get('status')}")
                        else:
                            self.log_test("Enhanced Image Generation - Story", False, f"HTTP {story_response.status_code}")
                    else:
                        self.log_test("Enhanced Image Generation - Pricing", False, f"Incorrect premium cost: expected {expected_cost}, got {actual_cost}")
                        return False
                else:
                    self.log_test("Enhanced Image Generation - Carousel", False, f"Carousel generation failed: status={data.get('status')}, images={len(data.get('images', []))}")
            else:
                self.log_test("Enhanced Image Generation", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Enhanced Image Generation", False, f"Exception: {str(e)}")
        
        return False

    def test_segmentation_campaign_functionality(self):
        """Test Segmentation Campaign Functionality - Focus Task 2"""
        print("🎯 Testing Segmentation Campaign Functionality...")
        
        if not self.auth_token:
            self.log_test("Segmentation Campaign", False, "No auth token available")
            return False
        
        try:
            # First test customer segmentation data retrieval
            analytics_response = self.session.get(f"{self.base_url}/analytics/customers")
            
            if analytics_response.status_code == 200:
                analytics_data = analytics_response.json()
                if "segments" in analytics_data:
                    segments = analytics_data["segments"]
                    available_segments = list(segments.keys())
                    self.log_test("Customer Segmentation Data", True, f"Available segments: {available_segments}")
                    
                    # Test segmented campaign creation endpoint
                    segmented_campaign_request = {
                        "title": "Campaña VIP Embajadores",
                        "description": "Campaña exclusiva para clientes embajadores con ofertas premium",
                        "target_level": "ambassador",
                        "channels": ["whatsapp", "instagram"]
                    }
                    
                    segmented_response = self.session.post(f"{self.base_url}/marketing/campaigns/segmented", json=segmented_campaign_request)
                    
                    if segmented_response.status_code == 200:
                        segmented_data = segmented_response.json()
                        if "campaign_id" in segmented_data:
                            self.log_test("Segmented Campaign Creation", True, f"Segmented campaign created: {segmented_data['campaign_id']}")
                            
                            # Test another segment
                            recurrent_campaign_request = {
                                "title": "Campaña Clientes Recurrentes",
                                "description": "Campaña para fidelizar clientes recurrentes",
                                "segment": "recurrent",
                                "channels": ["whatsapp"],
                                "content_type": "standard",
                                "personalization_level": "medium"
                            }
                            
                            recurrent_response = self.session.post(f"{self.base_url}/marketing/campaigns/segmented", json=recurrent_campaign_request)
                            
                            if recurrent_response.status_code == 200:
                                recurrent_data = recurrent_response.json()
                                if "campaign_id" in recurrent_data:
                                    self.log_test("Segmented Campaign - Recurrent", True, f"Recurrent segment campaign created: {recurrent_data['campaign_id']}")
                                    return True
                                else:
                                    self.log_test("Segmented Campaign - Recurrent", False, "Missing campaign_id in response", recurrent_data)
                            else:
                                self.log_test("Segmented Campaign - Recurrent", False, f"HTTP {recurrent_response.status_code}", recurrent_response.text)
                        else:
                            self.log_test("Segmented Campaign Creation", False, "Missing campaign_id in response", segmented_data)
                    else:
                        self.log_test("Segmented Campaign Creation", False, f"HTTP {segmented_response.status_code}", segmented_response.text)
                else:
                    self.log_test("Customer Segmentation Data", False, "Missing segments in analytics data", analytics_data)
            else:
                self.log_test("Customer Segmentation Data", False, f"HTTP {analytics_response.status_code}", analytics_response.text)
                
        except Exception as e:
            self.log_test("Segmentation Campaign", False, f"Exception: {str(e)}")
        
        return False

    def test_additional_content_factory_features(self):
        """Test additional Content Factory features for completeness"""
        print("🏭 Testing Additional Content Factory Features...")
        
        if not self.auth_token:
            self.log_test("Additional Content Factory", False, "No auth token available")
            return False
        
        try:
            # Test enhanced video generation with new parameters
            enhanced_video_request = {
                "prompt": "Video promocional IL MANDORLA: Proceso de ahumado lento del brisket con música de fondo y subtítulos en español",
                "model": "runwayml",
                "duration": 15,
                "style": "cinematica",
                "platform": "instagram",
                "branding_level": "alto",
                "aspect_ratio": "9:16",
                "captions": True,
                "music_style": "ambient",
                "call_to_action": "Reserva tu mesa hoy"
            }
            
            response = self.session.post(f"{self.base_url}/content-factory/video/generate", json=enhanced_video_request, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "job_id" in data and "estimated_cost" in data:
                    expected_cost = 5 * 15  # 5 credits per second × 15 seconds = 75
                    actual_cost = data["estimated_cost"]
                    
                    if actual_cost == expected_cost:
                        self.log_test("Enhanced Video Generation", True, f"Enhanced video job created: {data['job_id']}, Cost: {actual_cost} credits")
                        
                        # Test Instagram campaign creation
                        instagram_campaign_request = {
                            "title": "Campaña Instagram IL MANDORLA",
                            "description": "Campaña enfocada en Instagram con contenido visual premium",
                            "target_level": "oro",
                            "channels": ["instagram"],
                            "platform_specific": {
                                "instagram": {
                                    "content_types": ["posts", "stories", "reels"],
                                    "hashtags": ["#ILMandorla", "#Smokehouse", "#Brisket", "#Paraguay"],
                                    "story_highlights": True,
                                    "shopping_tags": True
                                }
                            },
                            "budget": 5000,
                            "reach_target": 10000
                        }
                        
                        campaign_response = self.session.post(f"{self.base_url}/marketing/campaigns", json=instagram_campaign_request)
                        
                        if campaign_response.status_code == 200:
                            campaign_data = campaign_response.json()
                            if "campaign_id" in campaign_data:
                                self.log_test("Instagram Campaign Creation", True, f"Instagram campaign created: {campaign_data['campaign_id']}")
                                return True
                            else:
                                self.log_test("Instagram Campaign Creation", False, "Missing campaign_id", campaign_data)
                        else:
                            self.log_test("Instagram Campaign Creation", False, f"HTTP {campaign_response.status_code}")
                    else:
                        self.log_test("Enhanced Video Generation", False, f"Incorrect cost: expected {expected_cost}, got {actual_cost}")
                else:
                    self.log_test("Enhanced Video Generation", False, "Missing required fields", data)
            else:
                self.log_test("Enhanced Video Generation", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Additional Content Factory", False, f"Exception: {str(e)}")
        
        return False

    def run_focused_tests(self):
        """Run all focused tests"""
        print("🎯 Starting Focused Backend Tests for Current Focus Tasks")
        print("=" * 70)
        print(f"Backend URL: {self.base_url}")
        print("Testing current_focus tasks:")
        print("1. Enhanced Image Generation with New Content Types")
        print("2. Segmentation Campaign Functionality")
        print("=" * 70)
        
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run focused tests
        test_results = []
        
        # Test 1: Enhanced Image Generation with New Content Types
        result1 = self.test_enhanced_image_generation_content_types()
        test_results.append(("Enhanced Image Generation with New Content Types", result1))
        
        # Test 2: Segmentation Campaign Functionality
        result2 = self.test_segmentation_campaign_functionality()
        test_results.append(("Segmentation Campaign Functionality", result2))
        
        # Test 3: Additional Content Factory Features
        result3 = self.test_additional_content_factory_features()
        test_results.append(("Additional Content Factory Features", result3))
        
        # Print summary
        print("=" * 70)
        print("📋 FOCUSED TEST SUMMARY")
        print("=" * 70)
        
        passed = 0
        total = len(test_results)
        
        for test_name, success in test_results:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{status} {test_name}")
            if success:
                passed += 1
        
        print(f"\nResults: {passed}/{total} focused tests passed")
        
        if passed == total:
            print("🎉 All focused tests passed!")
            return True
        else:
            print(f"⚠️ {total - passed} test(s) failed. Check details above.")
            return False

if __name__ == "__main__":
    tester = FocusedBackendTester()
    success = tester.run_focused_tests()
    sys.exit(0 if success else 1)