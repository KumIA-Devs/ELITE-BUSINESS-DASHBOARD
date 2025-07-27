"""
Sync Service for KUMIA Elite Dashboard
Handles real-time synchronization between Dashboard and UserWebApp
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
from firebase_admin_config import get_firebase_service

class KumiaSyncService:
    def __init__(self):
        self.firebase = get_firebase_service()
        
    # USERWEBAPP → DASHBOARD SYNC
    def sync_user_activity_to_dashboard(self, activity_data: Dict[str, Any]) -> bool:
        """Sync user activity from UserWebApp to Dashboard analytics"""
        try:
            # Track in Firebase for real-time dashboard updates
            success = self.firebase.track_customer_activity(
                activity_data.get('user_id'),
                activity_data.get('activity_type'),
                activity_data.get('data', {})
            )
            
            # Update dashboard analytics cache
            self._update_dashboard_analytics(activity_data)
            
            return success
            
        except Exception as e:
            print(f"❌ Error syncing user activity: {e}")
            return False
    
    def _update_dashboard_analytics(self, activity_data: Dict[str, Any]):
        """Update dashboard analytics with new user activity"""
        try:
            activity_type = activity_data.get('activity_type')
            user_id = activity_data.get('user_id')
            
            # Real-time metrics updates
            analytics_updates = {
                'last_update': datetime.now().isoformat(),
                'activity_type': activity_type,
                'user_id': user_id
            }
            
            # Marketing intelligence updates
            if activity_type == 'order':
                analytics_updates['revenue_impact'] = activity_data['data'].get('total', 0)
            elif activity_type == 'feedback':
                analytics_updates['satisfaction_impact'] = activity_data['data'].get('rating', 0)
            elif activity_type == 'game_play':
                analytics_updates['engagement_impact'] = activity_data['data'].get('score', 0)
            
            # Store for dashboard consumption
            if self.firebase.db:
                self.firebase.db.collection('dashboard_analytics').document('realtime').set(
                    analytics_updates, merge=True
                )
                
        except Exception as e:
            print(f"❌ Error updating dashboard analytics: {e}")
    
    # DASHBOARD → USERWEBAPP SYNC
    def sync_menu_changes(self, menu_data: Dict[str, Any]) -> bool:
        """Sync menu changes from Dashboard to UserWebApp"""
        try:
            return self.firebase.sync_menu_to_userwebapp(menu_data)
        except Exception as e:
            print(f"❌ Error syncing menu changes: {e}")
            return False
    
    def sync_promotion_changes(self, promotion_data: Dict[str, Any]) -> bool:
        """Sync promotion changes from Dashboard to UserWebApp"""
        try:
            if not self.firebase.db:
                return False
            
            # Update public promotions
            self.firebase.db.collection('public').document('promotions').set({
                'promotions': promotion_data,
                'last_updated': datetime.now().isoformat(),
                'updated_by': 'dashboard_admin'
            })
            
            print("✅ Promotions synced to UserWebApp")
            return True
            
        except Exception as e:
            print(f"❌ Error syncing promotions: {e}")
            return False
    
    # RESERVATION SYSTEM SYNC
    def create_reservation_from_dashboard(self, reservation_data: Dict[str, Any]) -> Optional[str]:
        """Create reservation from Dashboard and sync to UserWebApp"""
        try:
            # Create reservation
            reservation_id = self.firebase.create_reservation(reservation_data)
            
            if reservation_id:
                # Trigger confirmations
                self._trigger_reservation_confirmations(reservation_data, reservation_id)
                
                # Sync table availability
                self._sync_table_availability()
                
            return reservation_id
            
        except Exception as e:
            print(f"❌ Error creating reservation: {e}")
            return None
    
    def _trigger_reservation_confirmations(self, reservation_data: Dict[str, Any], reservation_id: str):
        """Trigger email and WhatsApp confirmations"""
        try:
            # Email confirmation (mock for now)
            self._send_email_confirmation(reservation_data, reservation_id)
            
            # WhatsApp confirmation (mock for now)
            self._send_whatsapp_confirmation(reservation_data, reservation_id)
            
            # AI conversation starter (mock for now)
            self._trigger_ai_conversation(reservation_data, reservation_id)
            
        except Exception as e:
            print(f"❌ Error triggering confirmations: {e}")
    
    def _send_email_confirmation(self, reservation_data: Dict[str, Any], reservation_id: str):
        """Send email confirmation (mock implementation)"""
        customer_email = reservation_data.get('customer_email')
        customer_name = reservation_data.get('customer_name')
        date = reservation_data.get('date')
        time = reservation_data.get('time')
        guests = reservation_data.get('guests')
        
        print(f"""
📧 EMAIL CONFIRMACIÓN ENVIADO:
Para: {customer_email}
Asunto: Confirmación de Reserva - IL MANDORLA Smokehouse

Hola {customer_name},

¡Tu reserva ha sido confirmada!

📅 Fecha: {date}
🕐 Hora: {time}
👥 Personas: {guests}
📍 Mesa: {reservation_data.get('table_id')}
🏪 Restaurante: IL MANDORLA Smokehouse

ID de Reserva: {reservation_id}

¡Te esperamos para vivir la experiencia KUMIA!

Saludos,
Equipo IL MANDORLA
        """)
    
    def _send_whatsapp_confirmation(self, reservation_data: Dict[str, Any], reservation_id: str):
        """Send WhatsApp confirmation (mock implementation)"""
        whatsapp_phone = reservation_data.get('whatsapp_phone')
        customer_name = reservation_data.get('customer_name')
        
        print(f"""
📱 WHATSAPP ENVIADO A: {whatsapp_phone}

Hola {customer_name}! 👋

✅ Tu reserva en IL MANDORLA está CONFIRMADA

📅 {reservation_data.get('date')} a las {reservation_data.get('time')}
👥 Para {reservation_data.get('guests')} personas
🏪 Mesa {reservation_data.get('table_id')}

ID: {reservation_id}

🔥 ¡Prepárate para la experiencia ahumada más deliciosa!

¿Tienes alguna alergia o preferencia especial? Responde a este mensaje.

¡Nos vemos pronto! 🍖
""")
    
    def _trigger_ai_conversation(self, reservation_data: Dict[str, Any], reservation_id: str):
        """Trigger AI conversation (mock implementation)"""
        customer_name = reservation_data.get('customer_name')
        userwebapp_link = "https://github.com/AIRE-GPT/Kumia_ELITE_USERAPP.git"  # Placeholder
        
        print(f"""
🤖 AI CONVERSACIÓN INICIADA:

Para: {customer_name}

"¡Hola {customer_name}! Soy KUMIA, tu asistente personal de IL MANDORLA 🍖

Vi que hiciste una reserva para {reservation_data.get('date')}. ¡Qué emocionante!

Mientras esperas tu visita, ¿te gustaría:
• Ver nuestro menú completo 📱
• Ganar puntos KUMIA jugando 🎮  
• Conectar con otros fanáticos del BBQ 👥

👆 Accede a tu experiencia KUMIA completa aquí:
{userwebapp_link}

¿Hay algo especial que te gustaría probar en tu visita?"

ESTADO: Conversación IA iniciada - Cliente puede responder
""")
    
    def _sync_table_availability(self):
        """Sync table availability to UserWebApp"""
        try:
            if not self.firebase.db:
                return
            
            # Get current table states
            tables_ref = self.firebase.db.collection('operations').document('tables').collection('restaurant_tables')
            tables = [{'id': doc.id, **doc.to_dict()} for doc in tables_ref.get()]
            
            # Update public availability
            self.firebase.db.collection('public').document('table_availability').set({
                'tables': tables,
                'last_updated': datetime.now().isoformat()
            })
            
            print("✅ Table availability synced")
            
        except Exception as e:
            print(f"❌ Error syncing table availability: {e}")
    
    # MARKETING INTELLIGENCE METHODS
    def get_customer_journey_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive customer journey analytics"""
        try:
            insights = self.firebase.get_customer_insights(user_id)
            
            # Enhanced marketing analytics
            marketing_data = {
                'customer_profile': insights.get('user_profile', {}),
                'engagement_metrics': {
                    'total_sessions': insights.get('activity_summary', {}).get('login', 0),
                    'menu_interactions': insights.get('activity_summary', {}).get('menu_view', 0),
                    'orders_placed': insights.get('activity_summary', {}).get('order', 0),
                    'feedback_given': insights.get('activity_summary', {}).get('feedback', 0),
                    'games_played': insights.get('activity_summary', {}).get('game_play', 0),
                    'social_shares': insights.get('activity_summary', {}).get('social_share', 0),
                    'engagement_score': insights.get('engagement_score', 0)
                },
                'behavior_patterns': self._analyze_behavior_patterns(insights.get('last_activities', [])),
                'marketing_segment': self._determine_marketing_segment(insights),
                'recommended_actions': self._get_marketing_recommendations(insights)
            }
            
            return marketing_data
            
        except Exception as e:
            print(f"❌ Error getting customer journey analytics: {e}")
            return {}
    
    def _analyze_behavior_patterns(self, activities: List[Dict]) -> Dict[str, Any]:
        """Analyze customer behavior patterns for marketing insights"""
        patterns = {
            'preferred_times': {},
            'favorite_sections': {},
            'engagement_trend': 'stable'
        }
        
        try:
            for activity in activities:
                # Analyze timing patterns
                timestamp = activity.get('timestamp')
                if timestamp:
                    hour = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).hour
                    time_slot = 'morning' if hour < 12 else 'afternoon' if hour < 18 else 'evening'
                    patterns['preferred_times'][time_slot] = patterns['preferred_times'].get(time_slot, 0) + 1
                
                # Analyze section preferences
                activity_type = activity.get('activity_type')
                if activity_type:
                    patterns['favorite_sections'][activity_type] = patterns['favorite_sections'].get(activity_type, 0) + 1
            
        except Exception as e:
            print(f"❌ Error analyzing behavior patterns: {e}")
        
        return patterns
    
    def _determine_marketing_segment(self, insights: Dict[str, Any]) -> str:
        """Determine customer marketing segment"""
        engagement_score = insights.get('engagement_score', 0)
        activity_summary = insights.get('activity_summary', {})
        
        orders = activity_summary.get('order', 0)
        feedback = activity_summary.get('feedback', 0)
        games = activity_summary.get('game_play', 0)
        
        if engagement_score >= 8 and orders >= 3:
            return 'champion'  # High value, high engagement
        elif engagement_score >= 6 and feedback >= 2:
            return 'advocate'   # High engagement, vocal
        elif orders >= 2:
            return 'loyal'      # Regular customer
        elif games >= 5:
            return 'entertained' # Enjoys gamification
        elif engagement_score >= 4:
            return 'interested'  # Moderate engagement
        else:
            return 'newcomer'    # New or inactive
    
    def _get_marketing_recommendations(self, insights: Dict[str, Any]) -> List[str]:
        """Get marketing action recommendations"""
        segment = self._determine_marketing_segment(insights)
        activity_summary = insights.get('activity_summary', {})
        
        recommendations = []
        
        if segment == 'champion':
            recommendations.extend([
                'Invite to VIP events',
                'Request testimonial/review',
                'Offer referral incentives'
            ])
        elif segment == 'advocate':
            recommendations.extend([
                'Engage in social media',
                'Request Google review',
                'Invite to beta testing'
            ])
        elif segment == 'loyal':
            recommendations.extend([
                'Offer loyalty rewards',
                'Send personalized promotions',
                'Invite to exclusive events'
            ])
        elif segment == 'entertained':
            recommendations.extend([
                'Promote new games',
                'Gamify ordering experience',
                'Offer game-based rewards'
            ])
        elif segment == 'interested':
            recommendations.extend([
                'Send educational content',
                'Offer first-time discount',
                'Showcase menu highlights'
            ])
        else:  # newcomer
            recommendations.extend([
                'Send welcome series',
                'Offer onboarding incentive',
                'Showcase core experience'
            ])
        
        return recommendations

# Initialize global sync service
sync_service = KumiaSyncService()

# Export for use in other modules
def get_sync_service():
    return sync_service