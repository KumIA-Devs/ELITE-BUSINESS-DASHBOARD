# 🤖 KumIA AI Agents - Complete Implementation Guide
## Google Vertex AI & Gemini Pro Integration

> **Technical Implementation Guide for all 6 AI Agents with Google-First Architecture**

---

## 🎯 AI Agents Architecture Overview

### Agent Orchestration System
```
┌─────────────────────────────────────────────────────────────┐
│                AI Agents Orchestrator                       │
│                (Google Cloud Functions)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ CustomerIA  │  │MarketingIA  │  │IntelligencIA│         │
│  │             │  │             │  │             │         │
│  │ Gemini Pro  │  │ BigQuery ML │  │ Search API  │         │
│  │ + Firestore │  │ + Ads API   │  │ + NLP API   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │OperacionesIA│  │ FinanzasIA  │  │ ContenidoIA │         │
│  │             │  │             │  │             │         │
│  │ ML Engine   │  │ Data Studio │  │ Vision API  │         │
│  │ + Sheets    │  │ + BigQuery  │  │ + Drive API │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│              Shared Services Layer                          │
│  • Authentication (Google Identity)                        │
│  • Logging (Cloud Logging)                                 │
│  • Monitoring (Cloud Monitoring)                           │
│  • Storage (Firestore + Cloud Storage)                     │
│  • ML Models (Vertex AI Model Registry)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Core Infrastructure Setup

### 1. Google Cloud Project Configuration

#### Project Setup Script
```bash
#!/bin/bash
# setup_kumia_project.sh

PROJECT_ID="kumia-dashboard"
BILLING_ACCOUNT_ID="your-billing-account-id"
REGION="us-central1"

# Create project and link billing
gcloud projects create $PROJECT_ID
gcloud beta billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT_ID
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable language.googleapis.com
gcloud services enable translate.googleapis.com
gcloud services enable customsearch.googleapis.com
gcloud services enable sheets.googleapis.com
gcloud services enable drive.googleapis.com
gcloud services enable analytics.googleapis.com
gcloud services enable googleads.googleapis.com
gcloud services enable mybusiness.googleapis.com

# Create service account
gcloud iam service-accounts create kumia-ai-agents \
    --display-name="KumIA AI Agents Service Account"

# Assign necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:kumia-ai-agents@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:kumia-ai-agents@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:kumia-ai-agents@$PROJECT_ID.iam.gserviceacument.com" \
    --role="roles/datastore.user"

# Create service account key
gcloud iam service-accounts keys create kumia-service-account.json \
    --iam-account=kumia-ai-agents@$PROJECT_ID.iam.gserviceaccount.com

echo "✅ Google Cloud setup completed!"
```

### 2. Vertex AI Configuration

#### Vertex AI Setup
```python
# vertex_ai_setup.py
import vertexai
from google.cloud import aiplatform
from google.oauth2 import service_account

def setup_vertex_ai():
    """Initialize Vertex AI with proper configuration"""
    
    PROJECT_ID = "kumia-dashboard"
    LOCATION = "us-central1"
    
    # Initialize Vertex AI
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    
    # Initialize AI Platform
    aiplatform.init(
        project=PROJECT_ID,
        location=LOCATION,
        staging_bucket=f"gs://kumia-ml-staging-{PROJECT_ID}"
    )
    
    print("✅ Vertex AI initialized successfully")
    
    return PROJECT_ID, LOCATION

# Create ML staging bucket
def create_ml_bucket():
    from google.cloud import storage
    
    client = storage.Client()
    bucket_name = f"kumia-ml-staging-{PROJECT_ID}"
    
    bucket = client.create_bucket(bucket_name, location="US")
    print(f"✅ Created ML staging bucket: {bucket_name}")
    
    return bucket_name

if __name__ == "__main__":
    setup_vertex_ai()
    create_ml_bucket()
```

---

## 🤖 Agent 1: Customer Service Agent ("GarzónIA Virtual")

### Complete Implementation

```python
# customer_service_agent.py
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from google.cloud import firestore
from google.cloud import translate_v2 as translate
from google.cloud import texttospeech
from google.cloud import speech
import vertexai
from vertexai.generative_models import GenerativeModel, Part
import logging

class CustomerServiceAgent:
    """
    Advanced Customer Service AI Agent
    Powered by Google Gemini Pro + Firestore + Translation API
    """
    
    def __init__(self, project_id: str, location: str = "us-central1"):
        self.project_id = project_id
        self.location = location
        
        # Initialize Google Services
        vertexai.init(project=project_id, location=location)
        self.gemini_model = GenerativeModel("gemini-1.5-pro")
        self.firestore_client = firestore.Client(project=project_id)
        self.translate_client = translate.Client()
        self.tts_client = texttospeech.TextToSpeechClient()
        self.speech_client = speech.SpeechClient()
        
        # Agent configuration
        self.agent_config = {
            "name": "GarzónIA Virtual",
            "personality": "Profesional, amable, eficiente",
            "language": "es",
            "response_style": "conversacional",
            "max_context_length": 4000
        }
        
        # Initialize conversation context storage
        self.conversation_contexts = {}
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    async def process_customer_message(
        self, 
        customer_id: str, 
        message: str, 
        channel: str = "web",
        include_voice: bool = False
    ) -> Dict[str, Any]:
        """
        Process incoming customer message and generate appropriate response
        
        Args:
            customer_id: Unique customer identifier
            message: Customer's message text
            channel: Communication channel (web, whatsapp, phone)
            include_voice: Whether to generate voice response
            
        Returns:
            Dict containing response text, actions, and metadata
        """
        
        try:
            # 1. Load customer context
            customer_context = await self._get_customer_context(customer_id)
            
            # 2. Detect intent and extract entities
            intent_analysis = await self._analyze_intent(message, customer_context)
            
            # 3. Generate contextual response
            response_data = await self._generate_response(
                message, 
                customer_context, 
                intent_analysis,
                channel
            )
            
            # 4. Execute any required actions
            actions_result = await self._execute_actions(
                customer_id, 
                intent_analysis.get("actions", [])
            )
            
            # 5. Generate voice response if requested
            if include_voice:
                voice_url = await self._generate_voice_response(response_data["text"])
                response_data["voice_url"] = voice_url
            
            # 6. Log interaction for learning
            await self._log_interaction(
                customer_id, 
                message, 
                response_data, 
                intent_analysis,
                channel
            )
            
            # 7. Update customer context
            await self._update_customer_context(customer_id, {
                "last_interaction": datetime.now(),
                "interaction_count": customer_context.get("interaction_count", 0) + 1,
                "satisfaction_feedback": None  # Will be updated when customer provides feedback
            })
            
            return {
                "success": True,
                "response": response_data,
                "actions_executed": actions_result,
                "intent": intent_analysis,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error processing customer message: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "fallback_response": {
                    "text": "Disculpa, estoy experimentando dificultades técnicas. Un miembro de nuestro equipo te contactará pronto.",
                    "actions": ["escalate_to_human"]
                }
            }
    
    async def _get_customer_context(self, customer_id: str) -> Dict[str, Any]:
        """Retrieve comprehensive customer context from Firestore"""
        
        customer_ref = self.firestore_client.collection("customers").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            # Create new customer profile
            customer_context = {
                "customer_id": customer_id,
                "created_at": datetime.now(),
                "interaction_count": 0,
                "preferences": {},
                "order_history": [],
                "satisfaction_score": 5.0
            }
            customer_ref.set(customer_context)
        else:
            customer_context = customer_doc.to_dict()
        
        # Get recent orders
        orders_ref = customer_ref.collection("orders").order_by(
            "created_at", direction=firestore.Query.DESCENDING
        ).limit(5)
        recent_orders = [order.to_dict() for order in orders_ref.stream()]
        customer_context["recent_orders"] = recent_orders
        
        # Get conversation history
        conversations_ref = customer_ref.collection("conversations").order_by(
            "timestamp", direction=firestore.Query.DESCENDING
        ).limit(10)
        conversation_history = [conv.to_dict() for conv in conversations_ref.stream()]
        customer_context["conversation_history"] = conversation_history
        
        return customer_context
    
    async def _analyze_intent(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze customer message intent using Gemini Pro"""
        
        intent_prompt = f"""
        Analiza el siguiente mensaje de un cliente de restaurante y determina:
        1. Intención principal (orden, consulta, queja, reserva, cancelación, etc.)
        2. Entidades mencionadas (platos, fechas, números, etc.)
        3. Urgencia (alta, media, baja)
        4. Sentimiento (positivo, neutral, negativo)
        5. Acciones requeridas
        
        Contexto del cliente:
        - Historial de órdenes: {context.get('recent_orders', [])}
        - Interacciones previas: {len(context.get('conversation_history', []))}
        - Puntuación de satisfacción: {context.get('satisfaction_score', 5.0)}
        
        Mensaje del cliente: "{message}"
        
        Responde en formato JSON:
        {{
            "intent": "tipo_de_intencion",
            "entities": {{"entidad": "valor"}},
            "urgency": "alta/media/baja",
            "sentiment": "positivo/neutral/negativo",
            "confidence": 0.95,
            "actions": ["accion1", "accion2"],
            "category": "categoria_principal"
        }}
        """
        
        response = self.gemini_model.generate_content(intent_prompt)
        
        try:
            intent_data = json.loads(response.text.strip())
            return intent_data
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "intent": "consulta_general",
                "entities": {},
                "urgency": "media",
                "sentiment": "neutral",
                "confidence": 0.5,
                "actions": ["provide_general_info"],
                "category": "general"
            }
    
    async def _generate_response(
        self, 
        message: str, 
        context: Dict[str, Any], 
        intent: Dict[str, Any],
        channel: str
    ) -> Dict[str, Any]:
        """Generate contextual response using Gemini Pro"""
        
        # Get restaurant information
        restaurant_info = await self._get_restaurant_info()
        
        # Build comprehensive prompt
        response_prompt = f"""
        Eres GarzónIA, el asistente virtual inteligente de IL MANDORLA restaurant.
        
        PERSONALIDAD:
        - Profesional pero cálido y amigable
        - Conocedor experto del menú y servicios
        - Proactivo en ofrecer recomendaciones
        - Solucionador de problemas eficiente
        
        INFORMACIÓN DEL RESTAURANTE:
        {json.dumps(restaurant_info, indent=2)}
        
        CONTEXTO DEL CLIENTE:
        - ID: {context.get('customer_id', 'unknown')}
        - Interacciones previas: {context.get('interaction_count', 0)}
        - Órdenes recientes: {context.get('recent_orders', [])}
        - Preferencias: {context.get('preferences', {})}
        - Satisfacción: {context.get('satisfaction_score', 5.0)}/5.0
        
        ANÁLISIS DEL MENSAJE:
        - Intención: {intent.get('intent', 'unknown')}
        - Sentimiento: {intent.get('sentiment', 'neutral')}
        - Urgencia: {intent.get('urgency', 'media')}
        - Entidades: {intent.get('entities', {})}
        
        MENSAJE DEL CLIENTE: "{message}"
        
        CANAL DE COMUNICACIÓN: {channel}
        
        INSTRUCCIONES:
        1. Responde en español de manera natural y conversacional
        2. Adapta la respuesta al canal de comunicación
        3. Incluye recomendaciones personalizadas basadas en el historial
        4. Si es una orden, confirma detalles y sugiere complementos
        5. Si es una queja, muestra empatía y ofrece soluciones
        6. Mantén la respuesta concisa pero completa
        7. Incluye call-to-action cuando sea apropiado
        
        Genera una respuesta que incluya:
        - Texto principal de respuesta
        - Recomendaciones específicas (si aplica)
        - Próximos pasos sugeridos
        - Información adicional relevante
        
        Formato de respuesta JSON:
        {{
            "text": "respuesta_principal",
            "recommendations": ["rec1", "rec2"],
            "next_steps": ["paso1", "paso2"],
            "additional_info": "información_extra",
            "call_to_action": "acción_sugerida",
            "estimated_response_time": "tiempo_estimado"
        }}
        """
        
        response = self.gemini_model.generate_content(response_prompt)
        
        try:
            response_data = json.loads(response.text.strip())
            
            # Add channel-specific formatting
            if channel == "whatsapp":
                response_data["text"] = self._format_for_whatsapp(response_data["text"])
            elif channel == "phone":
                response_data["text"] = self._format_for_voice(response_data["text"])
            
            return response_data
            
        except json.JSONDecodeError:
            # Fallback response
            return {
                "text": "Gracias por contactarnos. Hemos recibido tu mensaje y te ayudaremos en breve.",
                "recommendations": [],
                "next_steps": ["Esperar respuesta del equipo"],
                "additional_info": "",
                "call_to_action": "¿Hay algo más en lo que pueda ayudarte?",
                "estimated_response_time": "5 minutos"
            }
    
    async def _execute_actions(self, customer_id: str, actions: List[str]) -> Dict[str, Any]:
        """Execute required actions based on intent analysis"""
        
        results = {}
        
        for action in actions:
            try:
                if action == "create_order":
                    result = await self._create_order(customer_id)
                elif action == "update_order":
                    result = await self._update_order(customer_id)
                elif action == "cancel_order":
                    result = await self._cancel_order(customer_id)
                elif action == "make_reservation":
                    result = await self._make_reservation(customer_id)
                elif action == "send_menu":
                    result = await self._send_menu(customer_id)
                elif action == "escalate_to_human":
                    result = await self._escalate_to_human(customer_id)
                elif action == "apply_discount":
                    result = await self._apply_discount(customer_id)
                elif action == "track_order":
                    result = await self._track_order(customer_id)
                else:
                    result = {"status": "unknown_action", "message": f"Action {action} not implemented"}
                
                results[action] = result
                
            except Exception as e:
                results[action] = {"status": "error", "message": str(e)}
        
        return results
    
    async def _generate_voice_response(self, text: str) -> str:
        """Generate voice response using Google Text-to-Speech"""
        
        # Configure voice settings
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code="es-ES",
            name="es-ES-Standard-A",  # Female Spanish voice
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=1.0,
            pitch=0.0
        )
        
        # Generate speech
        response = self.tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # Save to Cloud Storage
        from google.cloud import storage
        storage_client = storage.Client()
        bucket = storage_client.bucket(f"kumia-voice-responses-{self.project_id}")
        
        file_name = f"response_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"
        blob = bucket.blob(file_name)
        blob.upload_from_string(response.audio_content, content_type="audio/mpeg")
        
        # Make publicly accessible
        blob.make_public()
        
        return blob.public_url
    
    async def _log_interaction(
        self, 
        customer_id: str, 
        message: str, 
        response: Dict[str, Any],
        intent: Dict[str, Any],
        channel: str
    ):
        """Log interaction for analytics and learning"""
        
        interaction_data = {
            "customer_id": customer_id,
            "timestamp": datetime.now(),
            "channel": channel,
            "customer_message": message,
            "agent_response": response,
            "intent_analysis": intent,
            "response_time_ms": 0,  # Will be calculated
            "satisfaction_score": None,  # Will be updated when feedback is received
            "resolution_status": "pending"
        }
        
        # Store in Firestore
        self.firestore_client.collection("ai_interactions").add(interaction_data)
        
        # Also store in customer's conversation history
        customer_ref = self.firestore_client.collection("customers").document(customer_id)
        customer_ref.collection("conversations").add(interaction_data)
    
    async def _get_restaurant_info(self) -> Dict[str, Any]:
        """Get current restaurant information"""
        
        restaurant_ref = self.firestore_client.collection("restaurants").document("il_mandorla")
        restaurant_doc = restaurant_ref.get()
        
        if restaurant_doc.exists:
            return restaurant_doc.to_dict()
        else:
            # Return default info
            return {
                "name": "IL MANDORLA",
                "type": "Restaurante Italiano",
                "hours": "12:00 - 23:00",
                "phone": "+1234567890",
                "address": "Calle Principal 123",
                "specialties": ["Pasta", "Pizza", "Risotto"],
                "current_promotions": []
            }
    
    def _format_for_whatsapp(self, text: str) -> str:
        """Format response for WhatsApp with emojis and structure"""
        # Add WhatsApp-friendly formatting
        formatted = text.replace(".", ".\n")
        formatted = "🍽️ " + formatted
        return formatted
    
    def _format_for_voice(self, text: str) -> str:
        """Format response for voice with proper pauses and pronunciation"""
        # Add SSML tags for better voice synthesis
        formatted = f"<speak>{text}</speak>"
        formatted = formatted.replace("IL MANDORLA", "Il Man-dor-la")
        return formatted
    
    # Action methods (simplified implementations)
    async def _create_order(self, customer_id: str) -> Dict[str, Any]:
        return {"status": "order_created", "order_id": f"ORD_{datetime.now().strftime('%Y%m%d_%H%M%S')}"}
    
    async def _make_reservation(self, customer_id: str) -> Dict[str, Any]:
        return {"status": "reservation_pending", "confirmation_code": f"RES_{datetime.now().strftime('%Y%m%d_%H%M%S')}"}
    
    async def _escalate_to_human(self, customer_id: str) -> Dict[str, Any]:
        # Notify human agents
        return {"status": "escalated", "ticket_id": f"TIK_{datetime.now().strftime('%Y%m%d_%H%M%S')}"}

# Usage Example
async def main():
    agent = CustomerServiceAgent(project_id="kumia-dashboard")
    
    # Process a customer message
    result = await agent.process_customer_message(
        customer_id="cust_12345",
        message="Hola, quiero hacer una reserva para 4 personas esta noche",
        channel="whatsapp",
        include_voice=True
    )
    
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(main())
```

### Deployment Configuration

```yaml
# customer_service_agent_deployment.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: customer-service-agent
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu: "2"
        run.googleapis.com/memory: "4Gi"
        run.googleapis.com/execution-environment: gen2
    spec:
      containerConcurrency: 50
      timeoutSeconds: 300
      containers:
      - image: gcr.io/kumia-dashboard/customer-service-agent:latest
        env:
        - name: GOOGLE_CLOUD_PROJECT
          value: "kumia-dashboard"
        - name: FIRESTORE_EMULATOR_HOST
          value: ""
        resources:
          limits:
            cpu: "2"
            memory: "4Gi"
```

---

## 🤖 Agent 2: KumIA Business IA

### Complete Implementation

```python
# kumia_business_agent.py
import asyncio
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from google.cloud import firestore
from google.cloud import translate_v2 as translate
import vertexai
from vertexai.generative_models import GenerativeModel
import logging

class KumIABusinessAgent:
    """
    KumIA Business IA - Complete business information chat agent
    Powered by Google Gemini Pro + Firestore + Translation API
    """
    
    def __init__(self, project_id: str, location: str = "us-central1"):
        self.project_id = project_id
        self.location = location
        
        # Initialize Google Services
        vertexai.init(project=project_id, location=location)
        self.gemini_model = GenerativeModel("gemini-1.5-pro")
        self.firestore_client = firestore.Client(project=project_id)
        self.translate_client = translate.Client()
        
        # Agent configuration
        self.agent_config = {
            "name": "KumIA Business IA",
            "personality": "Experto en negocios, analítico, estratégico",
            "specialization": "Información empresarial completa",
            "language": "es",
            "context_window": 8000
        }
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    async def process_business_query(
        self, 
        user_id: str, 
        query: str,
        business_context: str = "restaurant"
    ) -> Dict[str, Any]:
        """
        Process business-related queries with comprehensive company information
        """
        
        try:
            # 1. Load complete business information
            business_data = await self._get_complete_business_data()
            
            # 2. Analyze query intent
            query_analysis = await self._analyze_business_query(query)
            
            # 3. Generate comprehensive business response
            response_data = await self._generate_business_response(
                query, 
                business_data, 
                query_analysis,
                business_context
            )
            
            # 4. Log interaction for business intelligence
            await self._log_business_interaction(
                user_id, 
                query, 
                response_data, 
                query_analysis
            )
            
            return {
                "success": True,
                "response": response_data,
                "query_type": query_analysis.get("category", "general"),
                "confidence": query_analysis.get("confidence", 0.8),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error processing business query: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "fallback_response": {
                    "text": "Disculpa, estoy procesando tu consulta empresarial. Permíteme un momento para darte la información más completa.",
                    "suggestions": ["Información financiera", "Análisis de mercado", "Estrategias de crecimiento"]
                }
            }
    
    async def _get_complete_business_data(self) -> Dict[str, Any]:
        """Retrieve comprehensive business information from Firestore"""
        
        business_ref = self.firestore_client.collection("business_intelligence").document("il_mandorla")
        business_doc = business_ref.get()
        
        if business_doc.exists:
            business_data = business_doc.to_dict()
        else:
            # Create comprehensive business profile
            business_data = {
                "company_info": {
                    "name": "IL MANDORLA",
                    "type": "Restaurante Italiano Premium",
                    "founded": "2019",
                    "mission": "Ofrecer la auténtica experiencia culinaria italiana",
                    "vision": "Ser el restaurante italiano de referencia en la región",
                    "values": ["Calidad", "Autenticidad", "Servicio Excepcional", "Tradición"]
                },
                "financial_data": {
                    "monthly_revenue": 125000,
                    "growth_rate": 0.15,
                    "profit_margin": 0.18,
                    "customer_acquisition_cost": 25,
                    "customer_lifetime_value": 450
                },
                "operational_metrics": {
                    "daily_customers": 150,
                    "table_turnover": 2.5,
                    "staff_count": 15,
                    "menu_items": 45,
                    "average_service_time": 45
                },
                "market_position": {
                    "market_share": 0.12,
                    "competitors": 8,
                    "unique_selling_points": ["Auténtica receta italiana", "Ambiente familiar", "Ingredientes importados"],
                    "competitive_advantages": ["Experiencia familiar", "Calidad premium", "Servicio personalizado"]
                },
                "digital_presence": {
                    "website_visits": 5000,
                    "social_media_followers": 12000,
                    "online_reviews_rating": 4.7,
                    "digital_marketing_roi": 3.2
                }
            }
            business_ref.set(business_data)
        
        return business_data
    
    async def _analyze_business_query(self, query: str) -> Dict[str, Any]:
        """Analyze business query using Gemini Pro"""
        
        analysis_prompt = f"""
        Analiza la siguiente consulta empresarial y determina:
        1. Categoría (financiera, operacional, marketing, estratégica, competitiva, general)
        2. Tipo de información solicitada
        3. Nivel de detalle requerido (básico, intermedio, avanzado)
        4. Urgencia (alta, media, baja)
        5. Stakeholder objetivo (dueño, gerente, inversionista, empleado)
        
        Consulta: "{query}"
        
        Responde en formato JSON:
        {{
            "category": "categoria_principal",
            "information_type": "tipo_especifico",
            "detail_level": "nivel_detalle",
            "urgency": "nivel_urgencia",
            "target_stakeholder": "stakeholder_objetivo",
            "confidence": 0.95,
            "keywords": ["keyword1", "keyword2"],
            "requires_real_time_data": true/false
        }}
        """
        
        response = self.gemini_model.generate_content(analysis_prompt)
        
        try:
            analysis_data = json.loads(response.text.strip())
            return analysis_data
        except json.JSONDecodeError:
            return {
                "category": "general",
                "information_type": "consulta_general",
                "detail_level": "intermedio",
                "urgency": "media",
                "target_stakeholder": "gerente",
                "confidence": 0.6,
                "keywords": [],
                "requires_real_time_data": False
            }
    
    async def _generate_business_response(
        self, 
        query: str, 
        business_data: Dict[str, Any], 
        analysis: Dict[str, Any],
        context: str
    ) -> Dict[str, Any]:
        """Generate comprehensive business response using Gemini Pro"""
        
        response_prompt = f"""
        Eres KumIA Business IA, el asistente de inteligencia empresarial experto para IL MANDORLA.
        
        ESPECIALIZACIÓN:
        - Análisis financiero y de rendimiento
        - Estrategias de crecimiento empresarial  
        - Inteligencia de mercado y competitiva
        - Optimización operacional
        - Insights de datos empresariales
        
        INFORMACIÓN EMPRESARIAL COMPLETA:
        {json.dumps(business_data, indent=2)}
        
        ANÁLISIS DE LA CONSULTA:
        - Categoría: {analysis.get('category', 'general')}
        - Tipo de información: {analysis.get('information_type', 'general')}
        - Nivel de detalle: {analysis.get('detail_level', 'intermedio')}
        - Stakeholder objetivo: {analysis.get('target_stakeholder', 'gerente')}
        
        CONSULTA DEL USUARIO: "{query}"
        
        INSTRUCCIONES:
        1. Proporciona respuesta completa y precisa basada en los datos empresariales
        2. Incluye métricas específicas y números cuando sea relevante
        3. Ofrece insights estratégicos y recomendaciones
        4. Adapta el nivel de detalle al stakeholder objetivo
        5. Incluye comparativas y benchmarks cuando sea apropiado
        6. Sugiere acciones concretas y próximos pasos
        
        Formato de respuesta JSON:
        {{
            "text": "respuesta_principal_detallada",
            "key_metrics": {{"metrica1": "valor1", "metrica2": "valor2"}},
            "insights": ["insight1", "insight2", "insight3"],
            "recommendations": ["recomendacion1", "recomendacion2"],
            "next_steps": ["paso1", "paso2"],
            "supporting_data": {{"dato1": "valor1", "dato2": "valor2"}},
            "risk_factors": ["riesgo1", "riesgo2"],
            "opportunities": ["oportunidad1", "oportunidad2"]
        }}
        """
        
        response = self.gemini_model.generate_content(response_prompt)
        
        try:
            response_data = json.loads(response.text.strip())
            return response_data
        except json.JSONDecodeError:
            return {
                "text": "Basándome en la información empresarial disponible, puedo ayudarte con análisis detallados de nuestro rendimiento. ¿Te gustaría información específica sobre finanzas, operaciones, marketing o estrategia?",
                "key_metrics": {"revenue_monthly": "125.000 USD", "growth_rate": "15%"},
                "insights": ["Crecimiento sostenido", "Alta satisfacción del cliente", "Oportunidades digitales"],
                "recommendations": ["Expandir marketing digital", "Optimizar operaciones"],
                "next_steps": ["Análisis detallado de métricas", "Revisión estratégica"],
                "supporting_data": {},
                "risk_factors": [],
                "opportunities": []
            }
    
    async def _log_business_interaction(
        self, 
        user_id: str, 
        query: str, 
        response: Dict[str, Any],
        analysis: Dict[str, Any]
    ):
        """Log business intelligence interaction"""
        
        interaction_data = {
            "user_id": user_id,
            "agent_type": "kumia_business_ia",
            "timestamp": datetime.now(),
            "query": query,
            "query_category": analysis.get("category", "general"),
            "response": response,
            "stakeholder_type": analysis.get("target_stakeholder", "unknown"),
            "confidence_score": analysis.get("confidence", 0.8)
        }
        
        # Store in Firestore
        self.firestore_client.collection("business_intelligence_interactions").add(interaction_data)
```

---

## 🌟 Agent 3: Google Reviews Manager

### Complete Implementation

```python
# google_reviews_manager.py
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from google.cloud import firestore
from google.cloud import language_v1
from googleapiclient.discovery import build
import vertexai
from vertexai.generative_models import GenerativeModel
import logging

class GoogleReviewsManager:
    """
    Google Reviews Manager - Automated review monitoring and response
    Powered by Google My Business API + Natural Language API + Gemini Pro
    """
    
    def __init__(self, project_id: str, location_id: str, account_id: str):
        self.project_id = project_id
        self.location_id = location_id
        self.account_id = account_id
        
        # Initialize Google Services
        vertexai.init(project=project_id, location="us-central1")
        self.gemini_model = GenerativeModel("gemini-1.5-pro")
        self.firestore_client = firestore.Client(project=project_id)
        self.language_client = language_v1.LanguageServiceClient()
        
        # Initialize Google My Business API
        self.gmb_service = build('mybusiness', 'v4', cache_discovery=False)
        
        self.logger = logging.getLogger(__name__)
    
    async def monitor_and_respond_reviews(self) -> Dict[str, Any]:
        """Monitor new reviews and generate appropriate responses"""
        
        try:
            # 1. Fetch recent reviews
            recent_reviews = await self._fetch_recent_reviews()
            
            # 2. Analyze sentiment and categorize
            analyzed_reviews = []
            for review in recent_reviews:
                analysis = await self._analyze_review_sentiment(review)
                review['analysis'] = analysis
                analyzed_reviews.append(review)
            
            # 3. Generate responses for reviews that need them
            response_results = []
            for review in analyzed_reviews:
                if await self._should_respond_to_review(review):
                    response = await self._generate_review_response(review)
                    if response['should_post']:
                        post_result = await self._post_review_response(review['review_id'], response['text'])
                        response_results.append({
                            'review_id': review['review_id'],
                            'response_posted': post_result['success'],
                            'response_text': response['text']
                        })
            
            # 4. Update review analytics
            await self._update_review_analytics(analyzed_reviews)
            
            return {
                "success": True,
                "reviews_processed": len(analyzed_reviews),
                "responses_generated": len(response_results),
                "response_results": response_results,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error in review monitoring: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "reviews_processed": 0
            }
    
    async def _fetch_recent_reviews(self) -> List[Dict[str, Any]]:
        """Fetch recent reviews from Google My Business"""
        
        try:
            # Call Google My Business API
            location_name = f"accounts/{self.account_id}/locations/{self.location_id}"
            
            reviews_response = self.gmb_service.accounts().locations().reviews().list(
                parent=location_name,
                pageSize=50,
                orderBy="updateTime desc"
            ).execute()
            
            reviews = []
            for review_data in reviews_response.get('reviews', []):
                reviews.append({
                    'review_id': review_data.get('reviewId'),
                    'reviewer_name': review_data.get('reviewer', {}).get('displayName', 'Anónimo'),
                    'rating': review_data.get('starRating'),
                    'comment': review_data.get('comment', ''),
                    'create_time': review_data.get('createTime'),
                    'update_time': review_data.get('updateTime'),
                    'reviewer_profile_photo': review_data.get('reviewer', {}).get('profilePhotoUrl', ''),
                    'review_reply': review_data.get('reviewReply')
                })
            
            return reviews
            
        except Exception as e:
            self.logger.error(f"Error fetching reviews: {str(e)}")
            return []
    
    async def _analyze_review_sentiment(self, review: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze review sentiment using Natural Language API"""
        
        if not review.get('comment'):
            return {
                "sentiment": "neutral",
                "sentiment_score": 0.0,
                "magnitude": 0.0,
                "categories": [],
                "key_topics": []
            }
        
        try:
            # Sentiment analysis
            document = language_v1.Document(
                content=review['comment'],
                type_=language_v1.Document.Type.PLAIN_TEXT,
                language="es"
            )
            
            sentiment_response = self.language_client.analyze_sentiment(
                request={"document": document}
            )
            
            # Entity extraction
            entities_response = self.language_client.analyze_entities(
                request={"document": document}
            )
            
            # Text classification
            try:
                classification_response = self.language_client.classify_text(
                    request={"document": document}
                )
                categories = [cat.name for cat in classification_response.categories]
            except:
                categories = []
            
            sentiment = sentiment_response.document_sentiment
            
            return {
                "sentiment": self._classify_sentiment(sentiment.score),
                "sentiment_score": sentiment.score,
                "magnitude": sentiment.magnitude,
                "categories": categories,
                "key_topics": [entity.name for entity in entities_response.entities[:5]],
                "entities": [
                    {
                        "name": entity.name,
                        "type": entity.type_.name,
                        "salience": entity.salience
                    }
                    for entity in entities_response.entities
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing sentiment: {str(e)}")
            return {
                "sentiment": "neutral",
                "sentiment_score": 0.0,
                "magnitude": 0.0,
                "categories": [],
                "key_topics": []
            }
    
    async def _should_respond_to_review(self, review: Dict[str, Any]) -> bool:
        """Determine if review should receive a response"""
        
        # Always respond to negative reviews (rating <= 3)
        if review['rating'] <= 3:
            return True
        
        # Respond to positive reviews with detailed comments
        if review['rating'] >= 4 and len(review.get('comment', '')) > 50:
            return True
        
        # Don't respond if already has a reply
        if review.get('review_reply'):
            return False
        
        # Respond to reviews mentioning specific topics
        key_topics = review.get('analysis', {}).get('key_topics', [])
        respond_topics = ['servicio', 'comida', 'ambiente', 'precio', 'staff', 'recomendación']
        
        if any(topic.lower() in ' '.join(key_topics).lower() for topic in respond_topics):
            return True
        
        return False
    
    async def _generate_review_response(self, review: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized response using Gemini Pro"""
        
        response_prompt = f"""
        Eres el Community Manager de IL MANDORLA, un restaurante italiano premium.
        
        INFORMACIÓN DE LA RESEÑA:
        - Calificación: {review['rating']}/5 estrellas
        - Comentario: "{review.get('comment', 'Sin comentario')}"
        - Nombre del reviewer: {review.get('reviewer_name', 'Cliente')}
        - Sentimiento: {review.get('analysis', {}).get('sentiment', 'neutral')}
        - Temas clave: {review.get('analysis', {}).get('key_topics', [])}
        
        DIRECTRICES PARA LA RESPUESTA:
        1. Personalizada y auténtica (máximo 150 palabras)
        2. Agradece siempre la opinión
        3. Si es negativa: muestra empatía, ofrece solución, invita a contacto directo
        4. Si es positiva: agradece específicamente, refuerza puntos mencionados
        5. Usa tono profesional pero cálido
        6. Menciona aspectos específicos del comentario
        7. Invita a regresar
        8. Incluye firma "Equipo IL MANDORLA"
        
        EJEMPLOS DE TONO:
        - Negativa: "Lamentamos que tu experiencia no haya sido la esperada..."
        - Positiva: "¡Qué alegría saber que disfrutaste de nuestra pasta carbonara!"
        
        Genera la respuesta en formato JSON:
        {{
            "text": "respuesta_completa",
            "tone": "positivo/negativo/neutral",
            "should_post": true/false,
            "urgency": "alta/media/baja",
            "requires_followup": true/false
        }}
        """
        
        response = self.gemini_model.generate_content(response_prompt)
        
        try:
            response_data = json.loads(response.text.strip())
            return response_data
        except json.JSONDecodeError:
            # Fallback response
            if review['rating'] <= 3:
                return {
                    "text": f"Estimado/a {review.get('reviewer_name', 'Cliente')}, agradecemos tu comentario y lamentamos que tu experiencia no haya sido la esperada. Nos encantaría poder mejorar, por favor contáctanos directamente para resolver cualquier inconveniente. ¡Esperamos tenerte de vuelta pronto! - Equipo IL MANDORLA",
                    "tone": "negativo",
                    "should_post": True,
                    "urgency": "alta",
                    "requires_followup": True
                }
            else:
                return {
                    "text": f"¡Gracias {review.get('reviewer_name', 'Cliente')} por tu maravillosa reseña! Nos alegra saber que disfrutaste de tu experiencia en IL MANDORLA. ¡Te esperamos pronto para seguir compartiendo nuestra pasión por la auténtica cocina italiana! - Equipo IL MANDORLA",
                    "tone": "positivo",
                    "should_post": True,
                    "urgency": "media",
                    "requires_followup": False
                }
    
    async def _post_review_response(self, review_id: str, response_text: str) -> Dict[str, Any]:
        """Post response to Google My Business review"""
        
        try:
            location_name = f"accounts/{self.account_id}/locations/{self.location_id}"
            review_name = f"{location_name}/reviews/{review_id}"
            
            reply_body = {
                'comment': response_text
            }
            
            result = self.gmb_service.accounts().locations().reviews().reply(
                name=review_name,
                body=reply_body
            ).execute()
            
            return {
                "success": True,
                "response_id": result.get('name', ''),
                "posted_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error posting review response: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _update_review_analytics(self, reviews: List[Dict[str, Any]]):
        """Update review analytics in Firestore"""
        
        analytics_data = {
            "total_reviews": len(reviews),
            "average_rating": sum(r['rating'] for r in reviews) / len(reviews) if reviews else 0,
            "sentiment_breakdown": {
                "positive": len([r for r in reviews if r.get('analysis', {}).get('sentiment') == 'positive']),
                "neutral": len([r for r in reviews if r.get('analysis', {}).get('sentiment') == 'neutral']),
                "negative": len([r for r in reviews if r.get('analysis', {}).get('sentiment') == 'negative'])
            },
            "response_rate": len([r for r in reviews if r.get('review_reply')]) / len(reviews) if reviews else 0,
            "top_mentioned_topics": self._get_top_topics(reviews),
            "last_updated": datetime.now()
        }
        
        # Store analytics
        self.firestore_client.collection("review_analytics").document("current").set(
            analytics_data, merge=True
        )
    
    def _classify_sentiment(self, score: float) -> str:
        """Classify sentiment score"""
        if score >= 0.3:
            return "positive"
        elif score <= -0.3:
            return "negative"
        else:
            return "neutral"
    
    def _get_top_topics(self, reviews: List[Dict[str, Any]]) -> List[str]:
        """Get most mentioned topics across reviews"""
        all_topics = []
        for review in reviews:
            topics = review.get('analysis', {}).get('key_topics', [])
            all_topics.extend(topics)
        
        # Count and return top 5
        from collections import Counter
        topic_counts = Counter(all_topics)
        return [topic for topic, count in topic_counts.most_common(5)]

# Usage example
async def main():
    reviews_manager = GoogleReviewsManager(
        project_id="kumia-dashboard",
        location_id="your-location-id",
        account_id="your-account-id"
    )
    
    result = await reviews_manager.monitor_and_respond_reviews()
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 💬 Agent 4: WhatsApp Concierge IA

### Complete Implementation

```python
# whatsapp_concierge_agent.py
import asyncio
import json
import base64
from datetime import datetime
from typing import Dict, List, Any, Optional
from google.cloud import firestore
from google.cloud import translate_v2 as translate
from google.cloud import texttospeech
import vertexai
from vertexai.generative_models import GenerativeModel
import requests
import logging

class WhatsAppConciergeAgent:
    """
    WhatsApp Concierge IA - Premium customer service via WhatsApp
    Powered by WhatsApp Business API + Gemini Pro + Google Services
    """
    
    def __init__(self, project_id: str, whatsapp_token: str, phone_number_id: str):
        self.project_id = project_id
        self.whatsapp_token = whatsapp_token
        self.phone_number_id = phone_number_id
        self.whatsapp_api_url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
        
        # Initialize Google Services
        vertexai.init(project=project_id, location="us-central1")
        self.gemini_model = GenerativeModel("gemini-1.5-pro")
        self.firestore_client = firestore.Client(project=project_id)
        self.translate_client = translate.Client()
        self.tts_client = texttospeech.TextToSpeechClient()
        
        self.logger = logging.getLogger(__name__)
    
    async def process_whatsapp_message(
        self, 
        customer_phone: str, 
        message: str,
        message_type: str = "text",
        media_url: str = None
    ) -> Dict[str, Any]:
        """Process incoming WhatsApp message"""
        
        try:
            # 1. Load customer context
            customer_context = await self._get_whatsapp_customer_context(customer_phone)
            
            # 2. Detect language and translate if needed
            language_info = await self._detect_and_handle_language(message)
            
            # 3. Process message based on type
            if message_type == "text":
                response_data = await self._process_text_message(
                    message, customer_context, language_info
                )
            elif message_type == "image":
                response_data = await self._process_image_message(
                    media_url, message, customer_context
                )
            elif message_type == "audio":
                response_data = await self._process_audio_message(
                    media_url, customer_context
                )
            else:
                response_data = await self._process_general_message(
                    message, customer_context
                )
            
            # 4. Send response via WhatsApp
            send_result = await self._send_whatsapp_response(
                customer_phone, response_data
            )
            
            # 5. Log conversation
            await self._log_whatsapp_conversation(
                customer_phone, message, response_data, message_type
            )
            
            return {
                "success": True,
                "response_sent": send_result['success'],
                "message_id": send_result.get('message_id'),
                "response_data": response_data,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error processing WhatsApp message: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _get_whatsapp_customer_context(self, phone: str) -> Dict[str, Any]:
        """Get customer context from Firestore"""
        
        customer_ref = self.firestore_client.collection("whatsapp_customers").document(phone)
        customer_doc = customer_ref.get()
        
        if customer_doc.exists:
            context = customer_doc.to_dict()
        else:
            # Create new customer profile
            context = {
                "phone": phone,
                "first_contact": datetime.now(),
                "conversation_count": 0,
                "preferences": {},
                "order_history": [],
                "language": "es",
                "vip_status": False,
                "satisfaction_score": 5.0
            }
            customer_ref.set(context)
        
        # Get recent conversation history
        conversations = customer_ref.collection("conversations").order_by(
            "timestamp", direction=firestore.Query.DESCENDING
        ).limit(10).stream()
        
        context["recent_conversations"] = [conv.to_dict() for conv in conversations]
        
        return context
    
    async def _detect_and_handle_language(self, message: str) -> Dict[str, Any]:
        """Detect message language and translate if needed"""
        
        try:
            detection_result = self.translate_client.detect_language(message)
            detected_language = detection_result['language']
            confidence = detection_result['confidence']
            
            # Translate to Spanish if not Spanish and confidence is high
            if detected_language != 'es' and confidence > 0.8:
                translation_result = self.translate_client.translate(
                    message,
                    target_language='es',
                    source_language=detected_language
                )
                translated_text = translation_result['translatedText']
            else:
                translated_text = message
            
            return {
                "original_language": detected_language,
                "confidence": confidence,
                "translated_text": translated_text,
                "needs_translation_back": detected_language != 'es' and confidence > 0.8
            }
            
        except Exception as e:
            self.logger.error(f"Error in language detection: {str(e)}")
            return {
                "original_language": "es",
                "confidence": 1.0,
                "translated_text": message,
                "needs_translation_back": False
            }
    
    async def _process_text_message(
        self, 
        message: str, 
        context: Dict[str, Any],
        language_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process text message using Gemini Pro"""
        
        concierge_prompt = f"""
        Eres el Concierge Virtual de IL MANDORLA, un restaurante italiano premium.
        
        PERSONALIDAD DEL CONCIERGE:
        - Elegante, profesional y extremadamente atento
        - Conocedor experto de cocina italiana
        - Servicio personalizado de lujo
        - Proactivo en anticipar necesidades
        - Cálido pero sofisticado
        
        CONTEXTO DEL CLIENTE:
        - Teléfono: {context.get('phone', 'unknown')}
        - Conversaciones previas: {context.get('conversation_count', 0)}
        - Estatus VIP: {context.get('vip_status', False)}
        - Preferencias: {context.get('preferences', {})}
        - Órdenes previas: {context.get('order_history', [])}
        - Idioma detectado: {language_info.get('original_language', 'es')}
        
        MENSAJE DEL CLIENTE: "{language_info.get('translated_text', message)}"
        
        SERVICIOS QUE PUEDES OFRECER:
        1. Reservas personalizadas con preferencias específicas
        2. Recomendaciones gastronómicas expertas
        3. Información detallada de platos e ingredientes
        4. Servicios especiales (cumpleaños, aniversarios, eventos)
        5. Pedidos a domicilio con seguimiento
        6. Atención VIP y servicios premium
        7. Información sobre eventos y promociones
        8. Maridajes de vinos y bebidas
        
        INSTRUCCIONES:
        1. Responde en español de manera elegante y personalizada
        2. Usa emojis apropiados pero con elegancia
        3. Ofrece opciones específicas y detalladas
        4. Anticipa necesidades adicionales
        5. Menciona beneficios VIP si aplica
        6. Incluye call-to-action claro
        7. Máximo 160 caracteres por mensaje (límite WhatsApp)
        8. Si necesitas información adicional, pregunta específicamente
        
        Responde en formato JSON:
        {{
            "messages": [
                {{"text": "mensaje1", "type": "text"}},
                {{"text": "mensaje2", "type": "text"}}
            ],
            "quick_replies": ["opción1", "opción2", "opción3"],
            "requires_action": "reservation/order/info/none",
            "vip_service": true/false,
            "follow_up_needed": true/false
        }}
        """
        
        response = self.gemini_model.generate_content(concierge_prompt)
        
        try:
            response_data = json.loads(response.text.strip())
            
            # Translate back if needed
            if language_info.get('needs_translation_back'):
                original_lang = language_info.get('original_language')
                for message_obj in response_data.get('messages', []):
                    if message_obj.get('type') == 'text':
                        translated = self.translate_client.translate(
                            message_obj['text'],
                            target_language=original_lang,
                            source_language='es'
                        )
                        message_obj['text'] = translated['translatedText']
            
            return response_data
            
        except json.JSONDecodeError:
            return {
                "messages": [
                    {"text": "¡Bienvenido a IL MANDORLA! 🍝 Soy tu Concierge Virtual. ¿En qué puedo ayudarte hoy?", "type": "text"}
                ],
                "quick_replies": ["Hacer reserva", "Ver menú", "Información"],
                "requires_action": "none",
                "vip_service": False,
                "follow_up_needed": False
            }
    
    async def _send_whatsapp_response(
        self, 
        phone: str, 
        response_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Send response via WhatsApp Business API"""
        
        headers = {
            "Authorization": f"Bearer {self.whatsapp_token}",
            "Content-Type": "application/json"
        }
        
        sent_messages = []
        
        try:
            # Send main messages
            for message_obj in response_data.get('messages', []):
                if message_obj.get('type') == 'text':
                    payload = {
                        "messaging_product": "whatsapp",
                        "to": phone,
                        "type": "text",
                        "text": {"body": message_obj['text']}
                    }
                    
                    response = requests.post(
                        self.whatsapp_api_url,
                        headers=headers,
                        json=payload
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        sent_messages.append({
                            "message_id": result.get('messages', [{}])[0].get('id'),
                            "status": "sent"
                        })
                    else:
                        sent_messages.append({
                            "error": response.text,
                            "status": "failed"
                        })
            
            # Send quick replies if available
            if response_data.get('quick_replies'):
                quick_reply_payload = {
                    "messaging_product": "whatsapp",
                    "to": phone,
                    "type": "interactive",
                    "interactive": {
                        "type": "button",
                        "body": {"text": "¿Qué te gustaría hacer?"},
                        "action": {
                            "buttons": [
                                {
                                    "type": "reply",
                                    "reply": {
                                        "id": f"option_{i}",
                                        "title": option[:20]  # WhatsApp limit
                                    }
                                }
                                for i, option in enumerate(response_data['quick_replies'][:3])  # Max 3 buttons
                            ]
                        }
                    }
                }
                
                response = requests.post(
                    self.whatsapp_api_url,
                    headers=headers,
                    json=quick_reply_payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    sent_messages.append({
                        "message_id": result.get('messages', [{}])[0].get('id'),
                        "type": "quick_replies",
                        "status": "sent"
                    })
            
            return {
                "success": True,
                "messages_sent": len(sent_messages),
                "message_details": sent_messages
            }
            
        except Exception as e:
            self.logger.error(f"Error sending WhatsApp message: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _log_whatsapp_conversation(
        self, 
        phone: str, 
        message: str, 
        response: Dict[str, Any],
        message_type: str
    ):
        """Log WhatsApp conversation in Firestore"""
        
        conversation_data = {
            "phone": phone,
            "timestamp": datetime.now(),
            "customer_message": message,
            "message_type": message_type,
            "agent_response": response,
            "session_id": f"whatsapp_{datetime.now().strftime('%Y%m%d')}_{phone}",
            "satisfaction_score": None  # Will be updated if customer provides feedback
        }
        
        # Store conversation
        customer_ref = self.firestore_client.collection("whatsapp_customers").document(phone)
        customer_ref.collection("conversations").add(conversation_data)
        
        # Update customer conversation count
        customer_ref.update({
            "conversation_count": firestore.Increment(1),
            "last_contact": datetime.now()
        })

# Usage example
async def main():
    concierge = WhatsAppConciergeAgent(
        project_id="kumia-dashboard",
        whatsapp_token="your-whatsapp-token",
        phone_number_id="your-phone-number-id"
    )
    
    result = await concierge.process_whatsapp_message(
        customer_phone="+1234567890",
        message="Hola, quiero hacer una reserva para esta noche",
        message_type="text"
    )
    
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 📱 Agent 5: Instagram Community Manager IA

### Complete Implementation

```python
# instagram_community_manager.py
import asyncio
import json
import base64
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from google.cloud import firestore
from google.cloud import vision
from google.cloud import language_v1
import vertexai
from vertexai.generative_models import GenerativeModel
import requests
import logging

class InstagramCommunityManager:
    """
    Instagram Community Manager IA - Automated Instagram management
    Powered by Instagram Basic Display API + Vision API + Gemini Pro
    """
    
    def __init__(self, project_id: str, instagram_access_token: str, instagram_account_id: str):
        self.project_id = project_id
        self.instagram_access_token = instagram_access_token
        self.instagram_account_id = instagram_account_id
        self.instagram_api_url = "https://graph.instagram.com"
        
        # Initialize Google Services
        vertexai.init(project=project_id, location="us-central1")
        self.gemini_model = GenerativeModel("gemini-1.5-pro")
        self.vision_client = vision.ImageAnnotatorClient()
        self.language_client = language_v1.LanguageServiceClient()
        self.firestore_client = firestore.Client(project=project_id)
        
        self.logger = logging.getLogger(__name__)
    
    async def manage_instagram_activities(self) -> Dict[str, Any]:
        """Main function to manage all Instagram activities"""
        
        try:
            results = {}
            
            # 1. Monitor and respond to comments
            comments_result = await self._monitor_and_respond_comments()
            results['comments_management'] = comments_result
            
            # 2. Monitor and respond to DMs
            dms_result = await self._monitor_and_respond_dms()
            results['dms_management'] = dms_result
            
            # 3. Analyze posts performance
            posts_analysis = await self._analyze_posts_performance()
            results['posts_analysis'] = posts_analysis
            
            # 4. Generate content suggestions
            content_suggestions = await self._generate_content_suggestions()
            results['content_suggestions'] = content_suggestions
            
            # 5. Monitor hashtag performance
            hashtag_analysis = await self._analyze_hashtag_performance()
            results['hashtag_analysis'] = hashtag_analysis
            
            # 6. Competitor analysis
            competitor_analysis = await self._analyze_competitors()
            results['competitor_analysis'] = competitor_analysis
            
            return {
                "success": True,
                "results": results,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error in Instagram management: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _monitor_and_respond_comments(self) -> Dict[str, Any]:
        """Monitor and respond to Instagram comments"""
        
        try:
            # Get recent posts
            posts_response = requests.get(
                f"{self.instagram_api_url}/me/media",
                params={
                    "fields": "id,caption,media_type,media_url,timestamp,comments_count,like_count",
                    "access_token": self.instagram_access_token,
                    "limit": 10
                }
            )
            
            if posts_response.status_code != 200:
                return {"success": False, "error": "Failed to fetch posts"}
            
            posts = posts_response.json().get("data", [])
            comment_responses = []
            
            for post in posts:
                # Get comments for each post
                comments_response = requests.get(
                    f"{self.instagram_api_url}/{post['id']}/comments",
                    params={
                        "fields": "id,text,username,timestamp",
                        "access_token": self.instagram_access_token,
                        "limit": 50
                    }
                )
                
                if comments_response.status_code == 200:
                    comments = comments_response.json().get("data", [])
                    
                    for comment in comments:
                        # Check if we should respond
                        should_respond = await self._should_respond_to_comment(comment)
                        
                        if should_respond:
                            response_text = await self._generate_comment_response(comment, post)
                            
                            if response_text:
                                # Post reply (requires Instagram Business Account)
                                reply_result = await self._post_comment_reply(
                                    comment['id'], 
                                    response_text
                                )
                                
                                comment_responses.append({
                                    "comment_id": comment['id'],
                                    "original_comment": comment['text'],
                                    "response": response_text,
                                    "posted": reply_result.get('success', False)
                                })
            
            return {
                "success": True,
                "posts_monitored": len(posts),
                "responses_generated": len(comment_responses),
                "responses": comment_responses
            }
            
        except Exception as e:
            self.logger.error(f"Error monitoring comments: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _should_respond_to_comment(self, comment: Dict[str, Any]) -> bool:
        """Determine if comment should receive a response"""
        
        comment_text = comment.get('text', '').lower()
        
        # Respond to questions
        question_indicators = ['?', 'cómo', 'cuándo', 'dónde', 'qué', 'precio', 'horario', 'reserva']
        if any(indicator in comment_text for indicator in question_indicators):
            return True
        
        # Respond to compliments
        positive_words = ['delicioso', 'excelente', 'increíble', 'perfecto', 'maravilloso', 'gracias']
        if any(word in comment_text for word in positive_words):
            return True
        
        # Respond to complaints
        negative_words = ['malo', 'terrible', 'lento', 'frío', 'caro', 'queja']
        if any(word in comment_text for word in negative_words):
            return True
        
        # Respond to mentions of the restaurant
        restaurant_mentions = ['il mandorla', 'mandorla', 'restaurante']
        if any(mention in comment_text for mention in restaurant_mentions):
            return True
        
        return False
    
    async def _generate_comment_response(self, comment: Dict[str, Any], post: Dict[str, Any]) -> str:
        """Generate appropriate response to Instagram comment"""
        
        # Analyze comment sentiment
        sentiment_analysis = await self._analyze_comment_sentiment(comment['text'])
        
        response_prompt = f"""
        Eres el Community Manager de IL MANDORLA en Instagram, un restaurante italiano premium.
        
        CONTEXTO DEL POST:
        - Caption: "{post.get('caption', '')[:200]}..."
        - Likes: {post.get('like_count', 0)}
        - Comentarios: {post.get('comments_count', 0)}
        
        COMENTARIO DEL USUARIO:
        - Usuario: @{comment.get('username', 'usuario')}
        - Comentario: "{comment.get('text', '')}"
        - Sentimiento: {sentiment_analysis.get('sentiment', 'neutral')}
        
        DIRECTRICES PARA LA RESPUESTA:
        1. Máximo 125 caracteres (límite Instagram)
        2. Incluye emoji apropiado
        3. Menciona al usuario con @
        4. Si es positivo: agradece y refuerza
        5. Si es negativo: muestra empatía y ofrece solución
        6. Si es pregunta: responde específicamente
        7. Invita a DM para información detallada si es necesario
        8. Mantén tono de marca: elegante, italiano, acogedor
        
        EJEMPLOS DE TONO:
        - Positivo: "@usuario ¡Grazie mille! 🍝 Nos alegra que hayas disfrutado nuestra carbonara"
        - Negativo: "@usuario Ci dispiace mucho. Te enviamos DM para solucionarlo 💛"
        - Pregunta: "@usuario ¡Certo! Abrimos a las 12:00. Te esperamos pronto 🇮🇹"
        
        Genera solo la respuesta, sin explicaciones adicionales.
        """
        
        response = self.gemini_model.generate_content(response_prompt)
        return response.text.strip().replace('"', '')
    
    async def _analyze_comment_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze comment sentiment"""
        
        try:
            document = language_v1.Document(
                content=text,
                type_=language_v1.Document.Type.PLAIN_TEXT,
                language="es"
            )
            
            sentiment_response = self.language_client.analyze_sentiment(
                request={"document": document}
            )
            
            sentiment = sentiment_response.document_sentiment
            
            return {
                "sentiment": self._classify_sentiment(sentiment.score),
                "score": sentiment.score,
                "magnitude": sentiment.magnitude
            }
            
        except Exception as e:
            return {"sentiment": "neutral", "score": 0.0, "magnitude": 0.0}
    
    async def _generate_content_suggestions(self) -> Dict[str, Any]:
        """Generate content suggestions based on performance data"""
        
        # Get recent posts performance
        performance_data = await self._get_posts_performance_data()
        
        suggestions_prompt = f"""
        Eres un experto en marketing digital para IL MANDORLA, restaurante italiano premium.
        
        DATOS DE RENDIMIENTO RECIENTES:
        {json.dumps(performance_data, indent=2)}
        
        GENERA SUGERENCIAS DE CONTENIDO PARA INSTAGRAM:
        
        1. POSTS DE FEED (5 ideas):
        - Tipo de contenido (foto/video/carrusel)
        - Tema/concepto específico
        - Caption sugerido (primera línea)
        - Hashtags recomendados
        - Mejor horario para publicar
        
        2. STORIES (3 ideas):
        - Concepto
        - Elementos interactivos (encuestas, preguntas, etc.)
        - Duración recomendada
        
        3. REELS (2 ideas):
        - Concepto de video
        - Música/audio sugerido
        - Duración óptima
        - Trends a aprovechar
        
        CONSIDERA:
        - Temporada actual
        - Días especiales del mes
        - Tendencias gastronómicas
        - Engagement anterior
        - Horarios de mayor actividad de la audiencia
        
        Responde en formato JSON estructurado.
        """
        
        response = self.gemini_model.generate_content(suggestions_prompt)
        
        try:
            suggestions = json.loads(response.text.strip())
            
            # Store suggestions in Firestore
            self.firestore_client.collection("instagram_content_suggestions").add({
                "suggestions": suggestions,
                "generated_at": datetime.now(),
                "based_on_performance": performance_data
            })
            
            return {
                "success": True,
                "suggestions": suggestions
            }
            
        except json.JSONDecodeError:
            return {
                "success": False,
                "error": "Failed to parse content suggestions"
            }
    
    async def _analyze_hashtag_performance(self) -> Dict[str, Any]:
        """Analyze hashtag performance and suggest optimizations"""
        
        try:
            # Get recent posts with hashtags
            posts_with_hashtags = await self._get_posts_with_hashtags()
            
            hashtag_analysis = {}
            
            for post in posts_with_hashtags:
                caption = post.get('caption', '')
                hashtags = self._extract_hashtags(caption)
                
                for hashtag in hashtags:
                    if hashtag not in hashtag_analysis:
                        hashtag_analysis[hashtag] = {
                            "usage_count": 0,
                            "total_likes": 0,
                            "total_comments": 0,
                            "posts": []
                        }
                    
                    hashtag_analysis[hashtag]["usage_count"] += 1
                    hashtag_analysis[hashtag]["total_likes"] += post.get('like_count', 0)
                    hashtag_analysis[hashtag]["total_comments"] += post.get('comments_count', 0)
                    hashtag_analysis[hashtag]["posts"].append(post['id'])
            
            # Calculate performance metrics
            for hashtag, data in hashtag_analysis.items():
                if data["usage_count"] > 0:
                    data["avg_likes"] = data["total_likes"] / data["usage_count"]
                    data["avg_comments"] = data["total_comments"] / data["usage_count"]
                    data["engagement_score"] = (data["avg_likes"] + data["avg_comments"] * 5) / data["usage_count"]
            
            # Sort by performance
            sorted_hashtags = sorted(
                hashtag_analysis.items(),
                key=lambda x: x[1].get("engagement_score", 0),
                reverse=True
            )
            
            return {
                "success": True,
                "top_performing_hashtags": dict(sorted_hashtags[:10]),
                "total_hashtags_analyzed": len(hashtag_analysis),
                "recommendations": await self._generate_hashtag_recommendations(hashtag_analysis)
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing hashtags: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _extract_hashtags(self, text: str) -> List[str]:
        """Extract hashtags from text"""
        import re
        return re.findall(r'#\w+', text.lower())
    
    def _classify_sentiment(self, score: float) -> str:
        if score >= 0.3:
            return "positive"
        elif score <= -0.3:
            return "negative"
        else:
            return "neutral"

# Usage example
async def main():
    instagram_manager = InstagramCommunityManager(
        project_id="kumia-dashboard",
        instagram_access_token="your-instagram-token",
        instagram_account_id="your-account-id"
    )
    
    result = await instagram_manager.manage_instagram_activities()
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(main())
```

---

---

## 📘 Agent 6: Facebook Community Manager IA

### Complete Implementation

```python
# facebook_community_manager.py
import asyncio
import json
import base64
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from google.cloud import firestore
from google.cloud import vision
from google.cloud import language_v1
import vertexai
from vertexai.generative_models import GenerativeModel
import requests
import logging

class FacebookCommunityManager:
    """
    Facebook Community Manager IA - Automated Facebook management
    Powered by Facebook Graph API + Vision API + Gemini Pro
    """
    
    def __init__(self, project_id: str, facebook_access_token: str, page_id: str):
        self.project_id = project_id
        self.facebook_access_token = facebook_access_token
        self.page_id = page_id
        self.facebook_api_url = "https://graph.facebook.com/v18.0"
        
        # Initialize Google Services
        vertexai.init(project=project_id, location="us-central1")
        self.gemini_model = GenerativeModel("gemini-1.5-pro")
        self.vision_client = vision.ImageAnnotatorClient()
        self.language_client = language_v1.LanguageServiceClient()
        self.firestore_client = firestore.Client(project=project_id)
        
        self.logger = logging.getLogger(__name__)
    
    async def manage_facebook_activities(self) -> Dict[str, Any]:
        """Main function to manage all Facebook activities"""
        
        try:
            results = {}
            
            # 1. Monitor and respond to comments
            comments_result = await self._monitor_and_respond_comments()
            results['comments_management'] = comments_result
            
            # 2. Monitor and respond to messages
            messages_result = await self._monitor_and_respond_messages()
            results['messages_management'] = messages_result
            
            # 3. Analyze page insights
            insights_analysis = await self._analyze_page_insights()
            results['insights_analysis'] = insights_analysis
            
            # 4. Generate content suggestions
            content_suggestions = await self._generate_facebook_content()
            results['content_suggestions'] = content_suggestions
            
            # 5. Monitor competitor pages
            competitor_analysis = await self._analyze_competitor_pages()
            results['competitor_analysis'] = competitor_analysis
            
            # 6. Event management
            events_result = await self._manage_facebook_events()
            results['events_management'] = events_result
            
            return {
                "success": True,
                "results": results,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error in Facebook management: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _monitor_and_respond_comments(self) -> Dict[str, Any]:
        """Monitor and respond to Facebook comments"""
        
        try:
            # Get recent posts with comments
            posts_response = requests.get(
                f"{self.facebook_api_url}/{self.page_id}/posts",
                params={
                    "fields": "id,message,created_time,comments{message,from,created_time,id},reactions.summary(true),shares",
                    "access_token": self.facebook_access_token,
                    "limit": 10
                }
            )
            
            if posts_response.status_code != 200:
                return {"success": False, "error": "Failed to fetch posts"}
            
            posts = posts_response.json().get("data", [])
            comment_responses = []
            
            for post in posts:
                comments = post.get('comments', {}).get('data', [])
                
                for comment in comments:
                    # Check if comment needs response
                    if await self._should_respond_to_comment(comment):
                        response = await self._generate_comment_response(comment, post)
                        
                        if response.get('should_respond'):
                            # Post response
                            post_result = await self._post_comment_response(comment['id'], response['text'])
                            comment_responses.append({
                                'comment_id': comment['id'],
                                'response_posted': post_result['success'],
                                'response': response['text']
                            })
            
            return {
                "success": True,
                "comments_processed": len([c for post in posts for c in post.get('comments', {}).get('data', [])]),
                "responses_posted": len(comment_responses),
                "responses": comment_responses
            }
            
        except Exception as e:
            self.logger.error(f"Error monitoring Facebook comments: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _generate_comment_response(self, comment: Dict[str, Any], post: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized comment response using Gemini Pro"""
        
        response_prompt = f"""
        Eres el Community Manager de IL MANDORLA en Facebook, un restaurante italiano premium.
        
        INFORMACIÓN DEL COMENTARIO:
        - Usuario: {comment.get('from', {}).get('name', 'Usuario')}
        - Comentario: "{comment.get('message', '')}"
        - Post original: "{post.get('message', '')[:200]}..."
        
        PERSONALIDAD EN FACEBOOK:
        - Profesional pero cercano y familiar
        - Representa la tradición italiana con calidez
        - Usa emojis apropiados para Facebook
        - Fomenta la comunidad y conversación
        - Invita a la acción (visitar, ordenar, compartir)
        
        DIRECTRICES:
        1. Responde de manera personalizada (máximo 100 palabras)
        2. Agradece la participación
        3. Si es pregunta: responde específicamente
        4. Si es positivo: refuerza y agradece
        5. Si es negativo: muestra empatía y ofrece solución
        6. Incluye call-to-action relevante
        7. Usa hashtags relevantes al final
        
        Responde en formato JSON:
        {{
            "text": "respuesta_completa_con_emojis",
            "should_respond": true/false,
            "tone": "positivo/negativo/neutral",
            "includes_cta": true/false,
            "hashtags": ["hashtag1", "hashtag2"]
        }}
        """
        
        response = self.gemini_model.generate_content(response_prompt)
        
        try:
            return json.loads(response.text.strip())
        except json.JSONDecodeError:
            return {
                "text": f"¡Gracias por tu comentario! 🍝 Nos alegra tenerte en nuestra comunidad de IL MANDORLA. #ILMandorla #ComidaItaliana",
                "should_respond": True,
                "tone": "positivo",
                "includes_cta": True,
                "hashtags": ["#ILMandorla", "#ComidaItaliana"]
            }
    
    async def _analyze_page_insights(self) -> Dict[str, Any]:
        """Analyze Facebook page insights using Graph API"""
        
        try:
            insights_response = requests.get(
                f"{self.facebook_api_url}/{self.page_id}/insights",
                params={
                    "metric": "page_impressions,page_reach,page_engaged_users,page_fans,page_post_engagements",
                    "period": "week",
                    "access_token": self.facebook_access_token
                }
            )
            
            if insights_response.status_code != 200:
                return {"success": False, "error": "Failed to fetch insights"}
            
            insights_data = insights_response.json().get("data", [])
            
            # Process insights with AI analysis
            analysis_prompt = f"""
            Analiza los siguientes insights de Facebook para IL MANDORLA y proporciona recomendaciones estratégicas:
            
            DATOS DE INSIGHTS:
            {json.dumps(insights_data, indent=2)}
            
            Proporciona análisis en formato JSON:
            {{
                "performance_summary": "resumen_general",
                "key_metrics": {{"impresiones": 0, "alcance": 0, "engagement": 0}},
                "trends": ["tendencia1", "tendencia2"],
                "recommendations": ["recomendacion1", "recomendacion2"],
                "content_optimization": ["optimizacion1", "optimizacion2"],
                "best_posting_times": ["hora1", "hora2"]
            }}
            """
            
            analysis_response = self.gemini_model.generate_content(analysis_prompt)
            analysis = json.loads(analysis_response.text.strip())
            
            return {
                "success": True,
                "raw_insights": insights_data,
                "ai_analysis": analysis,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing page insights: {str(e)}")
            return {"success": False, "error": str(e)}

# Usage example
async def main():
    facebook_manager = FacebookCommunityManager(
        project_id="kumia-dashboard",
        facebook_access_token="your-facebook-token",
        page_id="your-page-id"
    )
    
    result = await facebook_manager.manage_facebook_activities()
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 🎯 Agent 7: KumIA Loyalty IA

### Complete Implementation

```python
# kumia_loyalty_agent.py
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from google.cloud import firestore
from google.cloud import bigquery
import vertexai
from vertexai.generative_models import GenerativeModel
import logging

class KumIALoyaltyAgent:
    """
    KumIA Loyalty IA - Intelligent loyalty program management
    Powered by Gemini Pro + BigQuery + Firestore
    """
    
    def __init__(self, project_id: str, dataset_id: str = "kumia_loyalty"):
        self.project_id = project_id
        self.dataset_id = dataset_id
        
        # Initialize Google Services
        vertexai.init(project=project_id, location="us-central1")
        self.gemini_model = GenerativeModel("gemini-1.5-pro")
        self.firestore_client = firestore.Client(project=project_id)
        self.bigquery_client = bigquery.Client(project=project_id)
        
        self.logger = logging.getLogger(__name__)
    
    async def manage_loyalty_program(self, customer_id: str, action: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Main loyalty program management function"""
        
        try:
            if action == "earn_points":
                result = await self._process_points_earning(customer_id, data)
            elif action == "redeem_rewards":
                result = await self._process_reward_redemption(customer_id, data)
            elif action == "check_status":
                result = await self._check_loyalty_status(customer_id)
            elif action == "personalized_offers":
                result = await self._generate_personalized_offers(customer_id)
            elif action == "tier_evaluation":
                result = await self._evaluate_tier_upgrade(customer_id)
            elif action == "referral_program":
                result = await self._manage_referral_program(customer_id, data)
            else:
                result = {"success": False, "error": f"Unknown action: {action}"}
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error in loyalty program management: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _process_points_earning(self, customer_id: str, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process points earning based on transaction"""
        
        try:
            # Get customer loyalty profile
            loyalty_profile = await self._get_loyalty_profile(customer_id)
            
            # Calculate points based on transaction
            points_calculation = await self._calculate_points(transaction_data, loyalty_profile)
            
            # Apply tier multipliers and bonuses
            final_points = await self._apply_tier_bonuses(customer_id, points_calculation)
            
            # Update customer points
            updated_profile = await self._update_customer_points(
                customer_id, 
                final_points['points_earned'],
                transaction_data
            )
            
            # Check for tier upgrades
            tier_check = await self._check_tier_upgrade(customer_id, updated_profile)
            
            # Generate achievement notifications
            achievements = await self._check_achievements(customer_id, updated_profile)
            
            return {
                "success": True,
                "points_earned": final_points['points_earned'],
                "total_points": updated_profile['total_points'],
                "tier": updated_profile['tier'],
                "tier_upgrade": tier_check,
                "achievements": achievements,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error processing points: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _calculate_points(self, transaction_data: Dict[str, Any], loyalty_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate points using AI-powered rules engine"""
        
        calculation_prompt = f"""
        Calcula los puntos de lealtad para IL MANDORLA basado en la transacción y perfil del cliente.
        
        DATOS DE LA TRANSACCIÓN:
        - Monto total: ${transaction_data.get('amount', 0)}
        - Tipo de orden: {transaction_data.get('order_type', 'dine_in')}
        - Items: {transaction_data.get('items', [])}
        - Fecha/hora: {transaction_data.get('timestamp', datetime.now().isoformat())}
        - Canal: {transaction_data.get('channel', 'restaurant')}
        
        PERFIL DE LEALTAD:
        - Tier actual: {loyalty_profile.get('tier', 'Bronze')}
        - Puntos actuales: {loyalty_profile.get('total_points', 0)}
        - Multiplicador base: {loyalty_profile.get('point_multiplier', 1.0)}
        - Bonos activos: {loyalty_profile.get('active_bonuses', [])}
        
        REGLAS BASE:
        - 1 punto por cada $1 gastado
        - Bonus del 50% en orders delivery
        - Doble puntos en items premium (pasta trufa, risotto, vinos)
        - Bonus de 25% para tier Gold, 50% para tier Platinum
        - Puntos bonus por horarios específicos (almuerzo: 1.2x, cena: 1.1x)
        
        Responde en formato JSON:
        {{
            "base_points": 0,
            "order_type_bonus": 0,
            "premium_items_bonus": 0,
            "time_bonus": 0,
            "tier_bonus": 0,
            "total_points": 0,
            "calculation_details": "explicacion_detallada"
        }}
        """
        
        response = self.gemini_model.generate_content(calculation_prompt)
        
        try:
            return json.loads(response.text.strip())
        except json.JSONDecodeError:
            # Fallback calculation
            base_points = int(transaction_data.get('amount', 0))
            return {
                "base_points": base_points,
                "order_type_bonus": 0,
                "premium_items_bonus": 0,
                "time_bonus": 0,
                "tier_bonus": 0,
                "total_points": base_points,
                "calculation_details": "Cálculo básico de 1 punto por $1"
            }
    
    async def _generate_personalized_offers(self, customer_id: str) -> Dict[str, Any]:
        """Generate personalized offers using AI analysis"""
        
        try:
            # Get customer data
            loyalty_profile = await self._get_loyalty_profile(customer_id)
            purchase_history = await self._get_purchase_history(customer_id)
            behavioral_data = await self._get_behavioral_data(customer_id)
            
            offers_prompt = f"""
            Genera ofertas personalizadas para el cliente de IL MANDORLA basado en su perfil y comportamiento.
            
            PERFIL DEL CLIENTE:
            - Tier: {loyalty_profile.get('tier', 'Bronze')}
            - Puntos disponibles: {loyalty_profile.get('available_points', 0)}
            - Visitas totales: {loyalty_profile.get('total_visits', 0)}
            - Gasto promedio: ${loyalty_profile.get('average_spend', 0)}
            
            HISTORIAL DE COMPRAS (últimos 30 días):
            {json.dumps(purchase_history[:10], indent=2)}
            
            DATOS COMPORTAMENTALES:
            - Días preferidos: {behavioral_data.get('preferred_days', [])}
            - Horarios preferidos: {behavioral_data.get('preferred_times', [])}
            - Platos favoritos: {behavioral_data.get('favorite_dishes', [])}
            - Frecuencia: {behavioral_data.get('visit_frequency', 'monthly')}
            
            OFERTAS DISPONIBLES EN SISTEMA:
            - Descuento 15% en pasta (válido Bronze+)
            - 2x1 en vinos seleccionados (válido Gold+)
            - Postre gratis en cumpleaños (válido todos)
            - Entrega gratis en orders >$50 (válido Silver+)
            - Mesa premium sin costo (válido Platinum)
            
            Genera 3-5 ofertas personalizadas en formato JSON:
            {{
                "offers": [
                    {{
                        "id": "offer_id",
                        "title": "titulo_atractivo",
                        "description": "descripcion_detallada",
                        "discount_type": "percentage/fixed/bonus",
                        "discount_value": 0,
                        "min_spend": 0,
                        "valid_until": "2024-12-31",
                        "points_cost": 0,
                        "personalization_reason": "por_que_relevante",
                        "urgency_level": "high/medium/low"
                    }}
                ],
                "recommendations": ["recomendacion1", "recomendacion2"],
                "next_tier_progress": "progreso_hacia_siguiente_tier"
            }}
            """
            
            response = self.gemini_model.generate_content(offers_prompt)
            offers_data = json.loads(response.text.strip())
            
            # Store personalized offers in Firestore
            await self._store_personalized_offers(customer_id, offers_data['offers'])
            
            return {
                "success": True,
                "offers": offers_data['offers'],
                "recommendations": offers_data.get('recommendations', []),
                "next_tier_progress": offers_data.get('next_tier_progress', ''),
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error generating personalized offers: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _get_loyalty_profile(self, customer_id: str) -> Dict[str, Any]:
        """Get customer loyalty profile from Firestore"""
        
        loyalty_ref = self.firestore_client.collection("loyalty_profiles").document(customer_id)
        loyalty_doc = loyalty_ref.get()
        
        if loyalty_doc.exists:
            return loyalty_doc.to_dict()
        else:
            # Create new loyalty profile
            profile = {
                "customer_id": customer_id,
                "tier": "Bronze",
                "total_points": 0,
                "available_points": 0,
                "total_visits": 0,
                "total_spent": 0,
                "average_spend": 0,
                "joined_date": datetime.now(),
                "last_activity": datetime.now(),
                "point_multiplier": 1.0,
                "active_bonuses": []
            }
            loyalty_ref.set(profile)
            return profile

# Usage example
async def main():
    loyalty_agent = KumIALoyaltyAgent(project_id="kumia-dashboard")
    
    # Process points earning
    result = await loyalty_agent.manage_loyalty_program(
        customer_id="cust_12345",
        action="earn_points",
        data={
            "amount": 85.50,
            "order_type": "dine_in",
            "items": ["pasta_carbonara", "tiramisu", "vino_chianti"],
            "timestamp": datetime.now().isoformat(),
            "channel": "restaurant"
        }
    )
    
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 🚨 Agent 8: Crisis Management IA

### Complete Implementation

```python
# crisis_management_agent.py
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from google.cloud import firestore
from google.cloud import monitoring_v3
from google.cloud import language_v1
import vertexai
from vertexai.generative_models import GenerativeModel
import requests
import logging

class CrisisManagementAgent:
    """
    Crisis Management IA - Real-time crisis detection and response
    Powered by Gemini Pro + Cloud Monitoring + Natural Language API
    """
    
    def __init__(self, project_id: str):
        self.project_id = project_id
        
        # Initialize Google Services
        vertexai.init(project=project_id, location="us-central1")
        self.gemini_model = GenerativeModel("gemini-1.5-pro")
        self.firestore_client = firestore.Client(project=project_id)
        self.monitoring_client = monitoring_v3.MetricServiceClient()
        self.language_client = language_v1.LanguageServiceClient()
        
        # Crisis detection thresholds
        self.crisis_thresholds = {
            "negative_sentiment_spike": 0.7,
            "review_rating_drop": 3.0,
            "complaint_frequency": 5,  # per hour
            "social_mention_volume": 50,  # per hour
            "service_downtime": 300,  # seconds
            "order_cancellation_rate": 0.3
        }
        
        self.logger = logging.getLogger(__name__)
    
    async def monitor_crisis_indicators(self) -> Dict[str, Any]:
        """Main crisis monitoring function"""
        
        try:
            crisis_indicators = {}
            
            # 1. Monitor social media sentiment
            social_sentiment = await self._monitor_social_sentiment()
            crisis_indicators['social_sentiment'] = social_sentiment
            
            # 2. Monitor review platforms
            review_monitoring = await self._monitor_review_platforms()
            crisis_indicators['review_monitoring'] = review_monitoring
            
            # 3. Monitor operational metrics
            operational_metrics = await self._monitor_operational_metrics()
            crisis_indicators['operational_metrics'] = operational_metrics
            
            # 4. Monitor customer complaints
            complaint_analysis = await self._monitor_customer_complaints()
            crisis_indicators['complaint_analysis'] = complaint_analysis
            
            # 5. Analyze overall crisis risk
            crisis_assessment = await self._assess_crisis_risk(crisis_indicators)
            
            # 6. Execute crisis response if needed
            response_actions = {}
            if crisis_assessment.get('crisis_level') in ['high', 'critical']:
                response_actions = await self._execute_crisis_response(crisis_assessment)
            
            return {
                "success": True,
                "crisis_indicators": crisis_indicators,
                "crisis_assessment": crisis_assessment,
                "response_actions": response_actions,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error in crisis monitoring: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _monitor_social_sentiment(self) -> Dict[str, Any]:
        """Monitor social media sentiment across platforms"""
        
        try:
            # Get recent social mentions
            social_mentions = await self._get_recent_social_mentions()
            
            sentiment_analysis = []
            negative_count = 0
            total_mentions = len(social_mentions)
            
            for mention in social_mentions:
                # Analyze sentiment
                document = language_v1.Document(
                    content=mention.get('text', ''),
                    type_=language_v1.Document.Type.PLAIN_TEXT,
                    language="es"
                )
                
                sentiment_response = self.language_client.analyze_sentiment(
                    request={"document": document}
                )
                
                sentiment_score = sentiment_response.document_sentiment.score
                
                analysis = {
                    "platform": mention.get('platform'),
                    "text": mention.get('text'),
                    "sentiment_score": sentiment_score,
                    "sentiment": self._classify_sentiment(sentiment_score),
                    "timestamp": mention.get('timestamp'),
                    "author": mention.get('author'),
                    "reach": mention.get('reach', 0)
                }
                
                sentiment_analysis.append(analysis)
                
                if sentiment_score < -0.3:
                    negative_count += 1
            
            negative_ratio = negative_count / total_mentions if total_mentions > 0 else 0
            
            # AI-powered crisis assessment
            crisis_assessment = await self._assess_social_crisis(sentiment_analysis, negative_ratio)
            
            return {
                "total_mentions": total_mentions,
                "negative_mentions": negative_count,
                "negative_ratio": negative_ratio,
                "sentiment_analysis": sentiment_analysis,
                "crisis_assessment": crisis_assessment,
                "alert_level": "high" if negative_ratio > self.crisis_thresholds["negative_sentiment_spike"] else "normal"
            }
            
        except Exception as e:
            self.logger.error(f"Error monitoring social sentiment: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _assess_social_crisis(self, sentiment_analysis: List[Dict], negative_ratio: float) -> Dict[str, Any]:
        """AI assessment of social media crisis potential"""
        
        assessment_prompt = f"""
        Analiza la situación de crisis potencial en redes sociales para IL MANDORLA.
        
        DATOS DE SENTIMIENTO:
        - Total de menciones: {len(sentiment_analysis)}
        - Ratio negativo: {negative_ratio:.2f}
        - Análisis detallado: {json.dumps(sentiment_analysis[:10], indent=2)}
        
        UMBRALES DE CRISIS:
        - Ratio crítico: {self.crisis_thresholds["negative_sentiment_spike"]}
        - Volumen alto: {self.crisis_thresholds["social_mention_volume"]}
        
        EVALÚA:
        1. Nivel de crisis (bajo, medio, alto, crítico)
        2. Temas principales de las quejas
        3. Plataformas más afectadas
        4. Usuarios influyentes involucrados
        5. Velocidad de propagación
        6. Acciones inmediatas recomendadas
        
        Responde en formato JSON:
        {{
            "crisis_level": "bajo/medio/alto/critico",
            "main_issues": ["tema1", "tema2"],
            "affected_platforms": ["platform1", "platform2"],
            "influential_users": ["user1", "user2"],
            "spread_velocity": "lenta/media/rapida",
            "immediate_actions": ["accion1", "accion2"],
            "escalation_risk": 0.0-1.0,
            "estimated_reach": 0,
            "response_urgency": "baja/media/alta/critica"
        }}
        """
        
        response = self.gemini_model.generate_content(assessment_prompt)
        
        try:
            return json.loads(response.text.strip())
        except json.JSONDecodeError:
            return {
                "crisis_level": "medio" if negative_ratio > 0.5 else "bajo",
                "main_issues": ["servicio", "calidad"],
                "affected_platforms": ["general"],
                "influential_users": [],
                "spread_velocity": "media",
                "immediate_actions": ["monitorear", "responder"],
                "escalation_risk": negative_ratio,
                "estimated_reach": len(sentiment_analysis) * 10,
                "response_urgency": "alta" if negative_ratio > 0.6 else "media"
            }
    
    async def _execute_crisis_response(self, crisis_assessment: Dict[str, Any]) -> Dict[str, Any]:
        """Execute automated crisis response actions"""
        
        try:
            response_actions = []
            
            # Generate crisis communication strategy
            communication_strategy = await self._generate_crisis_communication(crisis_assessment)
            response_actions.append({
                "action": "crisis_communication_generated",
                "result": communication_strategy
            })
            
            # Alert management team
            management_alert = await self._alert_management_team(crisis_assessment)
            response_actions.append({
                "action": "management_alerted",
                "result": management_alert
            })
            
            # Prepare social media responses
            social_responses = await self._prepare_social_responses(crisis_assessment)
            response_actions.append({
                "action": "social_responses_prepared",
                "result": social_responses
            })
            
            # Monitor competitor activity
            competitor_monitoring = await self._monitor_competitor_during_crisis()
            response_actions.append({
                "action": "competitor_monitoring_activated",
                "result": competitor_monitoring
            })
            
            return {
                "success": True,
                "response_actions": response_actions,
                "response_time": datetime.now().isoformat(),
                "escalation_level": crisis_assessment.get('crisis_level', 'unknown')
            }
            
        except Exception as e:
            self.logger.error(f"Error executing crisis response: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _generate_crisis_communication(self, crisis_assessment: Dict[str, Any]) -> Dict[str, Any]:
        """Generate crisis communication messages using AI"""
        
        communication_prompt = f"""
        Genera una estrategia de comunicación de crisis para IL MANDORLA basada en el análisis.
        
        SITUACIÓN DE CRISIS:
        - Nivel: {crisis_assessment.get('crisis_level', 'unknown')}
        - Temas principales: {crisis_assessment.get('main_issues', [])}
        - Plataformas afectadas: {crisis_assessment.get('affected_platforms', [])}
        - Urgencia: {crisis_assessment.get('response_urgency', 'media')}
        
        GENERA:
        1. Declaración oficial (200 palabras max)
        2. Respuestas para redes sociales (por plataforma)
        3. Comunicado interno para empleados
        4. Script para atención al cliente
        5. Plan de seguimiento
        
        Responde en formato JSON:
        {{
            "official_statement": "declaracion_oficial_completa",
            "social_media_responses": {{
                "facebook": "respuesta_para_facebook",
                "instagram": "respuesta_para_instagram",
                "twitter": "respuesta_para_twitter"
            }},
            "internal_communication": "mensaje_para_empleados",
            "customer_service_script": "script_atencion_cliente",
            "follow_up_plan": ["accion1", "accion2", "accion3"],
            "key_messages": ["mensaje1", "mensaje2"],
            "tone": "empático/profesional/transparente"
        }}
        """
        
        response = self.gemini_model.generate_content(communication_prompt)
        
        try:
            return json.loads(response.text.strip())
        except json.JSONDecodeError:
            return {
                "official_statement": "En IL MANDORLA valoramos profundamente a nuestros clientes y tomamos en serio todas sus preocupaciones. Estamos investigando activamente la situación y trabajando para resolver cualquier inconveniente. Agradecemos su paciencia mientras implementamos mejoras.",
                "social_media_responses": {
                    "facebook": "Agradecemos sus comentarios y estamos trabajando para mejorar. Contáctanos directamente para resolver cualquier situación.",
                    "instagram": "💙 Gracias por su feedback. Estamos comprometidos con la excelencia y trabajando en mejoras.",
                    "twitter": "Valoramos su opinión. Nuestro equipo está trabajando activamente para resolver la situación."
                },
                "internal_communication": "Equipo: Estamos manejando una situación que requiere atención especial. Manténganse alerta y sigan los protocolos de servicio al cliente.",
                "customer_service_script": "Entendemos su preocupación y queremos resolver esto. Permítanos tomar sus datos para darle seguimiento personal.",
                "follow_up_plan": ["Monitorear menciones", "Responder consultas", "Reportar progreso"],
                "key_messages": ["Transparencia", "Compromiso con calidad", "Resolución activa"],
                "tone": "empático"
            }

# Usage example
async def main():
    crisis_agent = CrisisManagementAgent(project_id="kumia-dashboard")
    
    result = await crisis_agent.monitor_crisis_indicators()
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(main())
```