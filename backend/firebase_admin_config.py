"""
Firebase Admin SDK Configuration for KUMIA Elite Dashboard
Connects with UserWebApp for real-time data synchronization
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth
from typing import Optional, Dict, Any, List

class FirebaseAdminService:
    def __init__(self):
        self.db = None
        self.app = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK with service account credentials"""
        try:
            # Check if already initialized
            if firebase_admin._apps:
                self.app = firebase_admin.get_app()
                self.db = firestore.client()
                print("✅ Firebase Admin SDK already initialized")
                return
            
            # Service account configuration
            service_account_info = {
                "type": "service_account",
                "project_id": "kumia-il-mandorla-smokehouse",
                "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID', ''),
                "private_key": os.environ.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
                "client_email": "firebase-adminsdk-fbsvc@kumia-il-mandorla-smokehouse.iam.gserviceaccount.com",
                "client_id": os.environ.get('FIREBASE_CLIENT_ID', ''),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40kumia-il-mandorla-smokehouse.iam.gserviceaccount.com"
            }
            
            # Initialize with service account
            cred = credentials.Certificate(service_account_info)
            self.app = firebase_admin.initialize_app(cred, {
                'projectId': 'kumia-il-mandorla-smokehouse',
                'databaseURL': 'https://kumia-il-mandorla-smokehouse-default-rtdb.firebaseio.com'
            })
            
            self.db = firestore.client()
            print("✅ Firebase Admin SDK initialized successfully")
            
        except Exception as e:
            print(f"⚠️ Firebase Admin initialization failed: {e}")
            print("💡 Using fallback mode - some features may be limited")
            self.db = None
            self.app = None
    
    # CUSTOMER ACTIVITY TRACKING METHODS
    def track_customer_activity(self, user_id: str, activity_type: str, activity_data: Dict[str, Any]) -> bool:
        """Track all customer activities for marketing intelligence"""
        if not self.db:
            return False
        
        try:
            activity_record = {
                'user_id': user_id,
                'activity_type': activity_type,  # 'login', 'menu_view', 'order', 'game_play', 'feedback', etc.
                'activity_data': activity_data,
                'timestamp': firestore.SERVER_TIMESTAMP,
                'source': 'userwebapp'
            }
            
            # Store in customer activity collection
            self.db.collection('customer_activities').add(activity_record)
            
            # Update user profile with latest activity
            self.db.collection('users').document(user_id).update({
                'last_activity': firestore.SERVER_TIMESTAMP,
                'last_activity_type': activity_type
            })
            
            print(f"✅ Tracked activity: {activity_type} for user {user_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error tracking activity: {e}")
            return False
    
    # RESERVATION MANAGEMENT
    def create_reservation(self, reservation_data: Dict[str, Any]) -> Optional[str]:
        """Create reservation and sync with UserWebApp"""
        if not self.db:
            return None
        
        try:
            # Add to reservations collection
            doc_ref = self.db.collection('operations').document('reservations').collection('active').add(reservation_data)
            reservation_id = doc_ref[1].id
            
            # Track customer activity
            if reservation_data.get('customer_id'):
                self.track_customer_activity(
                    reservation_data['customer_id'],
                    'reservation_created',
                    {
                        'reservation_id': reservation_id,
                        'table_id': reservation_data.get('table_id'),
                        'date': reservation_data.get('date'),
                        'guests': reservation_data.get('guests')
                    }
                )
            
            print(f"✅ Reservation created: {reservation_id}")
            return reservation_id
            
        except Exception as e:
            print(f"❌ Error creating reservation: {e}")
            return None
    
    # TABLE MANAGEMENT
    def get_table_availability(self, date: str, time: str) -> List[Dict[str, Any]]:
        """Get available tables for specific date/time"""
        if not self.db:
            return []
        
        try:
            # Get all tables
            tables_ref = self.db.collection('operations').document('tables').collection('restaurant_tables')
            tables = tables_ref.get()
            
            # Get reservations for the date
            reservations_ref = self.db.collection('operations').document('reservations').collection('active')
            reservations_query = reservations_ref.where('date', '==', date).where('time', '==', time)
            reserved_tables = [res.to_dict().get('table_id') for res in reservations_query.get()]
            
            # Filter available tables
            available_tables = []
            for table in tables:
                table_data = table.to_dict()
                if table.id not in reserved_tables:
                    table_data['id'] = table.id
                    table_data['status'] = 'available'
                    available_tables.append(table_data)
            
            return available_tables
            
        except Exception as e:
            print(f"❌ Error getting table availability: {e}")
            return []
    
    # MENU SYNCHRONIZATION
    def sync_menu_to_userwebapp(self, menu_data: Dict[str, Any]) -> bool:
        """Sync menu changes from Dashboard to UserWebApp"""
        if not self.db:
            return False
        
        try:
            # Update public menu collection
            self.db.collection('public').document('menu').set({
                'menu_data': menu_data,
                'last_updated': firestore.SERVER_TIMESTAMP,
                'updated_by': 'dashboard_admin'
            })
            
            print("✅ Menu synced to UserWebApp")
            return True
            
        except Exception as e:
            print(f"❌ Error syncing menu: {e}")
            return False
    
    # MARKETING INTELLIGENCE
    def get_customer_insights(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive customer insights for marketing decisions"""
        if not self.db:
            return {}
        
        try:
            # Get user profile
            user_doc = self.db.collection('users').document(user_id).get()
            user_data = user_doc.to_dict() if user_doc.exists else {}
            
            # Get activity history
            activities_ref = self.db.collection('customer_activities')
            activities = activities_ref.where('user_id', '==', user_id).order_by('timestamp', direction=firestore.Query.DESCENDING).limit(50).get()
            
            activity_summary = {}
            for activity in activities:
                act_data = activity.to_dict()
                act_type = act_data.get('activity_type')
                if act_type in activity_summary:
                    activity_summary[act_type] += 1
                else:
                    activity_summary[act_type] = 1
            
            # Compile insights
            insights = {
                'user_profile': user_data,
                'activity_summary': activity_summary,
                'total_activities': len(activities),
                'engagement_score': self._calculate_engagement_score(activity_summary),
                'last_activities': [act.to_dict() for act in activities[:10]]
            }
            
            return insights
            
        except Exception as e:
            print(f"❌ Error getting customer insights: {e}")
            return {}
    
    def _calculate_engagement_score(self, activity_summary: Dict[str, int]) -> float:
        """Calculate customer engagement score for marketing segmentation"""
        weights = {
            'login': 1,
            'menu_view': 2,
            'order': 10,
            'feedback': 8,
            'game_play': 3,
            'social_share': 5,
            'reservation': 12
        }
        
        score = 0
        for activity, count in activity_summary.items():
            weight = weights.get(activity, 1)
            score += count * weight
        
        return min(score / 10, 10.0)  # Normalize to 0-10 scale
    
    # REAL-TIME SYNC UTILITIES
    def setup_realtime_listeners(self):
        """Setup real-time listeners for bidirectional sync"""
        if not self.db:
            return
        
        try:
            # Listen to UserWebApp activities
            self.db.collection('customer_activities').on_snapshot(self._on_activity_change)
            
            # Listen to reservation changes
            self.db.collection('operations').document('reservations').collection('active').on_snapshot(self._on_reservation_change)
            
            print("✅ Real-time listeners configured")
            
        except Exception as e:
            print(f"❌ Error setting up listeners: {e}")
    
    def _on_activity_change(self, docs, changes, read_time):
        """Handle real-time activity changes"""
        for change in changes:
            if change.type.name == 'ADDED':
                activity = change.document.to_dict()
                print(f"📊 New customer activity: {activity.get('activity_type')} by {activity.get('user_id')}")
    
    def _on_reservation_change(self, docs, changes, read_time):
        """Handle real-time reservation changes"""
        for change in changes:
            if change.type.name == 'ADDED':
                reservation = change.document.to_dict()
                print(f"📅 New reservation: {reservation.get('customer_name')} for {reservation.get('date')}")

# Initialize global Firebase service
firebase_service = FirebaseAdminService()

# Export for use in other modules
def get_firebase_service():
    return firebase_service