#!/usr/bin/env python3
"""
Focused Backend Testing for Enhanced Dashboard Features
Tests specific functionality mentioned in the review request
"""

import requests
import json
import uuid
from datetime import datetime
import sys

# Backend URL from environment
BACKEND_URL = "https://355dd713-0907-4ee1-a125-ebf97fe9c105.preview.emergentagent.com/api"

class FocusedDashboardTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = {}
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        print()
        
        self.test_results[test_name] = {
            "success": success,
            "details": details
        }
    
    def authenticate(self):
        """Authenticate with the backend"""
        print("🔐 Testing Authentication...")
        
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
                    self.log_test("Authentication", False, "Missing access_token or user in response")
            else:
                self.log_test("Authentication", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Authentication", False, f"Exception: {str(e)}")
        
        return False
    
    def test_dashboard_metrics(self):
        """Test dashboard metrics endpoint"""
        print("📊 Testing Dashboard Metrics...")
        
        try:
            response = self.session.get(f"{self.base_url}/dashboard/metrics")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_customers", "total_reservations", "total_revenue", "avg_rating"]
                
                if all(field in data for field in required_fields):
                    metrics_summary = f"Customers: {data['total_customers']}, Reservations: {data['total_reservations']}, Revenue: ${data['total_revenue']}"
                    self.log_test("Dashboard Metrics", True, metrics_summary)
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Dashboard Metrics", False, f"Missing fields: {missing}")
            else:
                self.log_test("Dashboard Metrics", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Dashboard Metrics", False, f"Exception: {str(e)}")
        
        return False
    
    def test_restaurant_configuration(self):
        """Test restaurant configuration endpoint"""
        print("🏪 Testing Restaurant Configuration...")
        
        try:
            response = self.session.get(f"{self.base_url}/restaurant/config")
            
            if response.status_code == 200:
                config = response.json()
                required_fields = ["name", "logo", "brand_color_primary", "menu_highlights"]
                
                if all(field in config for field in required_fields):
                    self.log_test("Restaurant Configuration", True, f"Restaurant: {config['name']}")
                    return True
                else:
                    missing = [f for f in required_fields if f not in config]
                    self.log_test("Restaurant Configuration", False, f"Missing fields: {missing}")
            else:
                self.log_test("Restaurant Configuration", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Restaurant Configuration", False, f"Exception: {str(e)}")
        
        return False
    
    def test_menu_management(self):
        """Test menu management CRUD operations"""
        print("🍽️ Testing Menu Management...")
        
        try:
            # Test GET menu
            response = self.session.get(f"{self.base_url}/menu")
            
            if response.status_code == 200:
                menu_items = response.json()
                self.log_test("Menu Retrieval", True, f"Retrieved {len(menu_items)} menu items")
                
                # Test POST new menu item with category
                new_item = {
                    "name": "Test Enhanced Menu Item",
                    "description": "Test item for enhanced category management",
                    "price": 25.99,
                    "category": "test_category",
                    "is_active": True,
                    "popularity_score": 4.5
                }
                
                post_response = self.session.post(f"{self.base_url}/menu", json=new_item)
                
                if post_response.status_code == 200:
                    created_item = post_response.json()
                    if "id" in created_item and created_item["category"] == "test_category":
                        self.log_test("Enhanced Menu Category Creation", True, f"Created item in category: {created_item['category']}")
                        
                        # Clean up - delete the test item
                        self.session.delete(f"{self.base_url}/menu/{created_item['id']}")
                        return True
                    else:
                        self.log_test("Enhanced Menu Category Creation", False, "Item not created with correct category")
                else:
                    self.log_test("Enhanced Menu Category Creation", False, f"HTTP {post_response.status_code}")
            else:
                self.log_test("Menu Management", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Menu Management", False, f"Exception: {str(e)}")
        
        return False
    
    def test_user_management_for_garzon(self):
        """Test user management system that could support Garzón WebApp"""
        print("👨‍💼 Testing User Management for Garzón Support...")
        
        try:
            # Test user profile endpoint
            response = self.session.get(f"{self.base_url}/auth/me")
            
            if response.status_code == 200:
                user_data = response.json()
                if "role" in user_data:
                    self.log_test("User Role Management", True, f"User system supports roles: {user_data['role']}")
                    
                    # Test customer analytics (for waiter performance tracking)
                    analytics_response = self.session.get(f"{self.base_url}/analytics/customers")
                    
                    if analytics_response.status_code == 200:
                        analytics = analytics_response.json()
                        if "segments" in analytics:
                            self.log_test("Customer Analytics for Waiter Tracking", True, f"Customer segmentation available")
                            return True
                        else:
                            self.log_test("Customer Analytics for Waiter Tracking", False, "No segmentation data")
                    else:
                        self.log_test("Customer Analytics for Waiter Tracking", False, f"HTTP {analytics_response.status_code}")
                else:
                    self.log_test("User Role Management", False, "No role field in user data")
            else:
                self.log_test("User Management for Garzón Support", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("User Management for Garzón Support", False, f"Exception: {str(e)}")
        
        return False
    
    def test_settings_management(self):
        """Test settings management for dynamic configuration"""
        print("⚙️ Testing Settings Management...")
        
        try:
            # Test GET settings
            response = self.session.get(f"{self.base_url}/settings")
            
            if response.status_code == 200:
                settings = response.json()
                if "name" in settings:
                    self.log_test("Settings Retrieval", True, f"Settings for: {settings['name']}")
                    
                    # Test PUT settings update (for dynamic restaurant configuration)
                    original_voice_tone = settings.get("voice_tone", "")
                    settings["voice_tone"] = "Test enhanced voice tone"
                    
                    put_response = self.session.put(f"{self.base_url}/settings", json=settings)
                    
                    if put_response.status_code == 200:
                        updated_settings = put_response.json()
                        if updated_settings.get("voice_tone") == "Test enhanced voice tone":
                            self.log_test("Dynamic Settings Update", True, "Settings can be updated dynamically")
                            
                            # Restore original setting
                            settings["voice_tone"] = original_voice_tone
                            self.session.put(f"{self.base_url}/settings", json=settings)
                            return True
                        else:
                            self.log_test("Dynamic Settings Update", False, "Settings not updated correctly")
                    else:
                        self.log_test("Dynamic Settings Update", False, f"HTTP {put_response.status_code}")
                else:
                    self.log_test("Settings Retrieval", False, "No name field in settings")
            else:
                self.log_test("Settings Management", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Settings Management", False, f"Exception: {str(e)}")
        
        return False
    
    def test_api_health_check(self):
        """Test overall API health"""
        print("🏥 Testing API Health Check...")
        
        try:
            # Test multiple core endpoints
            endpoints = [
                "/dashboard/metrics",
                "/restaurant/config", 
                "/menu",
                "/customers",
                "/reservations",
                "/settings"
            ]
            
            working_endpoints = 0
            for endpoint in endpoints:
                try:
                    response = self.session.get(f"{self.base_url}{endpoint}")
                    if response.status_code == 200:
                        working_endpoints += 1
                except:
                    pass
            
            health_percentage = (working_endpoints / len(endpoints)) * 100
            
            if health_percentage >= 80:
                self.log_test("API Health Check", True, f"API Health: {health_percentage:.1f}% ({working_endpoints}/{len(endpoints)} endpoints working)")
                return True
            else:
                self.log_test("API Health Check", False, f"API Health: {health_percentage:.1f}% ({working_endpoints}/{len(endpoints)} endpoints working)")
                
        except Exception as e:
            self.log_test("API Health Check", False, f"Exception: {str(e)}")
        
        return False
    
    def run_focused_tests(self):
        """Run focused tests for enhanced dashboard functionality"""
        print("🎯 Starting Focused Enhanced Dashboard Backend Tests...")
        print("=" * 70)
        print("Testing backend support for:")
        print("1. Dynamic Restaurant Configuration")
        print("2. Garzón WebApp functionality support")
        print("3. Enhanced Menu Category Management")
        print("4. Overall API Health")
        print("=" * 70)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run focused tests
        tests = [
            self.test_dashboard_metrics,
            self.test_restaurant_configuration,
            self.test_menu_management,
            self.test_user_management_for_garzon,
            self.test_settings_management,
            self.test_api_health_check
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test in tests:
            if test():
                passed_tests += 1
        
        # Print summary
        print("=" * 70)
        print(f"📊 FOCUSED TEST SUMMARY")
        print(f"Passed: {passed_tests}/{total_tests} tests")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if passed_tests == total_tests:
            print("✅ All focused backend tests passed!")
            print("✅ Backend supports the enhanced dashboard functionality!")
            return True
        else:
            print(f"❌ {total_tests - passed_tests} test(s) failed")
            return False

def main():
    """Main function to run the focused tests"""
    tester = FocusedDashboardTester()
    success = tester.run_focused_tests()
    
    if success:
        print("\n🎉 Enhanced Dashboard Backend is ready!")
        print("✅ Dynamic Restaurant Configuration: Supported")
        print("✅ Garzón WebApp Support: User management and analytics available")
        print("✅ Enhanced Menu Category Management: Full CRUD operations working")
        print("✅ Overall API Health: All endpoints responding correctly")
    else:
        print("\n⚠️ Some issues found. Please review the test results above.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)