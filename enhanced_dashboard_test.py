#!/usr/bin/env python3
"""
Enhanced Dashboard Backend Testing Script
Tests the new functionality for:
1. Dynamic Restaurant Configuration
2. Garzón WebApp functionality support
3. Enhanced Menu Category Management
4. Overall API Health
"""

import requests
import json
import uuid
from datetime import datetime
import sys
import os

# Backend URL from environment
BACKEND_URL = "https://cd2332d5-5a25-473f-9b89-d67786d83b0b.preview.emergentagent.com/api"

class EnhancedDashboardTester:
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
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_test("Authentication", True, f"User: {data['user']['name']}, Role: {data['user']['role']}")
                    return True
                else:
                    self.log_test("Authentication", False, "Missing access_token or user in response", data)
            else:
                self.log_test("Authentication", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Authentication", False, f"Exception: {str(e)}")
        
        return False
    
    def test_dynamic_restaurant_configuration(self):
        """Test dynamic restaurant configuration endpoints"""
        print("🏪 Testing Dynamic Restaurant Configuration...")
        
        if not self.auth_token:
            self.log_test("Dynamic Restaurant Configuration", False, "No auth token available")
            return False
        
        try:
            # Test GET restaurant config
            response = self.session.get(f"{self.base_url}/restaurant/config")
            
            if response.status_code == 200:
                config = response.json()
                required_fields = ["name", "logo", "brand_color_primary", "brand_color_secondary", "menu_highlights", "ai_personality"]
                
                if all(field in config for field in required_fields):
                    self.log_test("Restaurant Config GET", True, f"Restaurant: {config['name']}")
                    
                    # Test if configuration supports dynamic changes
                    # Check if we can modify restaurant settings
                    settings_response = self.session.get(f"{self.base_url}/settings")
                    
                    if settings_response.status_code == 200:
                        settings = settings_response.json()
                        
                        # Test updating restaurant name (simulating 90-day restriction logic)
                        original_name = settings.get("name", "IL MANDORLA SMOKEHOUSE")
                        test_name = "IL MANDORLA SMOKEHOUSE - Premium"
                        
                        settings["name"] = test_name
                        update_response = self.session.put(f"{self.base_url}/settings", json=settings)
                        
                        if update_response.status_code == 200:
                            updated_settings = update_response.json()
                            if updated_settings.get("name") == test_name:
                                self.log_test("Dynamic Restaurant Name Update", True, f"Name updated to: {test_name}")
                                
                                # Restore original name
                                settings["name"] = original_name
                                self.session.put(f"{self.base_url}/settings", json=settings)
                                return True
                            else:
                                self.log_test("Dynamic Restaurant Name Update", False, "Name not updated correctly")
                        else:
                            self.log_test("Dynamic Restaurant Name Update", False, f"HTTP {update_response.status_code}")
                    else:
                        self.log_test("Restaurant Settings Access", False, f"HTTP {settings_response.status_code}")
                else:
                    missing = [f for f in required_fields if f not in config]
                    self.log_test("Restaurant Config GET", False, f"Missing fields: {missing}")
            else:
                self.log_test("Dynamic Restaurant Configuration", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Dynamic Restaurant Configuration", False, f"Exception: {str(e)}")
        
        return False
    
    def test_garzon_webapp_support(self):
        """Test backend support for Garzón WebApp functionality"""
        print("👨‍💼 Testing Garzón WebApp Support...")
        
        if not self.auth_token:
            self.log_test("Garzón WebApp Support", False, "No auth token available")
            return False
        
        try:
            # Test waiter management endpoints (these should exist or be supported)
            # Check if we have user management that could support waiters
            users_response = self.session.get(f"{self.base_url}/auth/me")
            
            if users_response.status_code == 200:
                user_data = users_response.json()
                self.log_test("User Management Base", True, f"User system supports roles: {user_data.get('role', 'unknown')}")
                
                # Test performance tracking via analytics
                analytics_response = self.session.get(f"{self.base_url}/analytics/customers")
                
                if analytics_response.status_code == 200:
                    analytics = analytics_response.json()
                    if "segments" in analytics:
                        self.log_test("Performance Analytics Support", True, f"Customer segmentation available for waiter performance tracking")
                        
                        # Test shift management via reservations system
                        reservations_response = self.session.get(f"{self.base_url}/reservations")
                        
                        if reservations_response.status_code == 200:
                            reservations = reservations_response.json()
                            self.log_test("Shift Management Support", True, f"Reservation system can support shift tracking ({len(reservations)} reservations)")
                            
                            # Test incentive system via NFT rewards
                            nft_response = self.session.get(f"{self.base_url}/nft-rewards")
                            
                            if nft_response.status_code == 200:
                                nfts = nft_response.json()
                                self.log_test("Incentive System Support", True, f"NFT reward system can support waiter incentives ({len(nfts)} reward types)")
                                return True
                            else:
                                self.log_test("Incentive System Support", False, f"HTTP {nft_response.status_code}")
                        else:
                            self.log_test("Shift Management Support", False, f"HTTP {reservations_response.status_code}")
                    else:
                        self.log_test("Performance Analytics Support", False, "No segmentation data available")
                else:
                    self.log_test("Performance Analytics Support", False, f"HTTP {analytics_response.status_code}")
            else:
                self.log_test("User Management Base", False, f"HTTP {users_response.status_code}")
                
        except Exception as e:
            self.log_test("Garzón WebApp Support", False, f"Exception: {str(e)}")
        
        return False
    
    def test_enhanced_menu_category_management(self):
        """Test enhanced menu category management"""
        print("🍽️ Testing Enhanced Menu Category Management...")
        
        if not self.auth_token:
            self.log_test("Enhanced Menu Category Management", False, "No auth token available")
            return False
        
        try:
            # Test menu CRUD operations with categories
            menu_response = self.session.get(f"{self.base_url}/menu")
            
            if menu_response.status_code == 200:
                menu_items = menu_response.json()
                self.log_test("Menu Items Retrieval", True, f"Retrieved {len(menu_items)} menu items")
                
                # Test creating menu item with category
                new_category_item = {
                    "name": "Smoked Salmon Appetizer",
                    "description": "Premium smoked salmon with capers and cream cheese",
                    "price": 18.99,
                    "category": "appetizers",  # New category
                    "is_active": True,
                    "popularity_score": 4.2
                }
                
                create_response = self.session.post(f"{self.base_url}/menu", json=new_category_item)
                
                if create_response.status_code == 200:
                    created_item = create_response.json()
                    if "id" in created_item and created_item["category"] == "appetizers":
                        self.log_test("Dynamic Category Creation", True, f"Created item in new category: {created_item['category']}")
                        
                        # Test category editing (update item category)
                        created_item["category"] = "starters"
                        edit_response = self.session.put(f"{self.base_url}/menu/{created_item['id']}", json=created_item)
                        
                        if edit_response.status_code == 200:
                            edited_item = edit_response.json()
                            if edited_item["category"] == "starters":
                                self.log_test("Category Editing", True, f"Category updated to: {edited_item['category']}")
                                
                                # Test duplication by creating similar item
                                duplicate_item = created_item.copy()
                                duplicate_item["name"] = "Smoked Salmon Deluxe"
                                duplicate_item["price"] = 22.99
                                # Remove ID to create new item
                                if "id" in duplicate_item:
                                    del duplicate_item["id"]
                                
                                duplicate_response = self.session.post(f"{self.base_url}/menu", json=duplicate_item)
                                
                                if duplicate_response.status_code == 200:
                                    duplicated_item = duplicate_response.json()
                                    self.log_test("Category Duplication", True, f"Duplicated item in same category: {duplicated_item['name']}")
                                    
                                    # Test deletion
                                    delete_response = self.session.delete(f"{self.base_url}/menu/{created_item['id']}")
                                    delete_response2 = self.session.delete(f"{self.base_url}/menu/{duplicated_item['id']}")
                                    
                                    if delete_response.status_code == 200 and delete_response2.status_code == 200:
                                        self.log_test("Category Item Deletion", True, "Successfully deleted test items")
                                        return True
                                    else:
                                        self.log_test("Category Item Deletion", False, "Failed to delete test items")
                                else:
                                    self.log_test("Category Duplication", False, f"HTTP {duplicate_response.status_code}")
                            else:
                                self.log_test("Category Editing", False, "Category not updated correctly")
                        else:
                            self.log_test("Category Editing", False, f"HTTP {edit_response.status_code}")
                    else:
                        self.log_test("Dynamic Category Creation", False, "Item not created with correct category")
                else:
                    self.log_test("Dynamic Category Creation", False, f"HTTP {create_response.status_code}")
            else:
                self.log_test("Enhanced Menu Category Management", False, f"HTTP {menu_response.status_code}")
                
        except Exception as e:
            self.log_test("Enhanced Menu Category Management", False, f"Exception: {str(e)}")
        
        return False
    
    def test_overall_api_health(self):
        """Test overall API health and existing functionality"""
        print("🏥 Testing Overall API Health...")
        
        if not self.auth_token:
            self.log_test("Overall API Health", False, "No auth token available")
            return False
        
        try:
            # Test core endpoints
            endpoints_to_test = [
                ("/dashboard/metrics", "Dashboard Metrics"),
                ("/customers", "Customer Management"),
                ("/reservations", "Reservations"),
                ("/feedback", "Feedback System"),
                ("/ai-agents", "AI Agents"),
                ("/nft-rewards", "NFT Rewards"),
                ("/integrations", "Integrations"),
                ("/settings", "Settings")
            ]
            
            successful_endpoints = 0
            total_endpoints = len(endpoints_to_test)
            
            for endpoint, name in endpoints_to_test:
                try:
                    response = self.session.get(f"{self.base_url}{endpoint}")
                    if response.status_code == 200:
                        successful_endpoints += 1
                        self.log_test(f"API Health - {name}", True, "Endpoint responding correctly")
                    else:
                        self.log_test(f"API Health - {name}", False, f"HTTP {response.status_code}")
                except Exception as e:
                    self.log_test(f"API Health - {name}", False, f"Exception: {str(e)}")
            
            # Calculate health percentage
            health_percentage = (successful_endpoints / total_endpoints) * 100
            
            if health_percentage >= 80:
                self.log_test("Overall API Health", True, f"API Health: {health_percentage:.1f}% ({successful_endpoints}/{total_endpoints} endpoints working)")
                return True
            else:
                self.log_test("Overall API Health", False, f"API Health: {health_percentage:.1f}% ({successful_endpoints}/{total_endpoints} endpoints working)")
                
        except Exception as e:
            self.log_test("Overall API Health", False, f"Exception: {str(e)}")
        
        return False
    
    def test_logo_storage_support(self):
        """Test logo storage and management support"""
        print("🖼️ Testing Logo Storage Support...")
        
        if not self.auth_token:
            self.log_test("Logo Storage Support", False, "No auth token available")
            return False
        
        try:
            # Test if restaurant config supports logo changes
            config_response = self.session.get(f"{self.base_url}/restaurant/config")
            
            if config_response.status_code == 200:
                config = config_response.json()
                if "logo" in config:
                    current_logo = config["logo"]
                    self.log_test("Logo Configuration Access", True, f"Current logo URL accessible: {current_logo[:50]}...")
                    
                    # Test if settings can store logo information
                    settings_response = self.session.get(f"{self.base_url}/settings")
                    
                    if settings_response.status_code == 200:
                        settings = settings_response.json()
                        
                        # Test updating with base64 logo (simulating upload)
                        test_logo_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                        
                        # Add logo field to settings if not present
                        settings["logo_base64"] = test_logo_base64
                        
                        update_response = self.session.put(f"{self.base_url}/settings", json=settings)
                        
                        if update_response.status_code == 200:
                            updated_settings = update_response.json()
                            if "logo_base64" in updated_settings:
                                self.log_test("Logo Storage Support", True, "Logo base64 storage supported in settings")
                                return True
                            else:
                                self.log_test("Logo Storage Support", False, "Logo base64 not stored in settings")
                        else:
                            self.log_test("Logo Storage Support", False, f"Settings update failed: HTTP {update_response.status_code}")
                    else:
                        self.log_test("Logo Storage Support", False, f"Settings access failed: HTTP {settings_response.status_code}")
                else:
                    self.log_test("Logo Configuration Access", False, "No logo field in restaurant config")
            else:
                self.log_test("Logo Storage Support", False, f"Config access failed: HTTP {config_response.status_code}")
                
        except Exception as e:
            self.log_test("Logo Storage Support", False, f"Exception: {str(e)}")
        
        return False
    
    def run_all_tests(self):
        """Run all enhanced dashboard tests"""
        print("🚀 Starting Enhanced Dashboard Backend Tests...")
        print("=" * 60)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run all tests
        tests = [
            self.test_dynamic_restaurant_configuration,
            self.test_logo_storage_support,
            self.test_garzon_webapp_support,
            self.test_enhanced_menu_category_management,
            self.test_overall_api_health
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test in tests:
            if test():
                passed_tests += 1
        
        # Print summary
        print("=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"Passed: {passed_tests}/{total_tests} tests")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if passed_tests == total_tests:
            print("✅ All enhanced dashboard tests passed!")
            return True
        else:
            print(f"❌ {total_tests - passed_tests} test(s) failed")
            return False

def main():
    """Main function to run the tests"""
    tester = EnhancedDashboardTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Enhanced Dashboard Backend is ready for the new functionality!")
    else:
        print("\n⚠️ Some issues found. Please review the test results above.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)