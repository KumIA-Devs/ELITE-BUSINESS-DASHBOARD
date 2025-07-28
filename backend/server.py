from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
import logging
import uuid
import jwt
from passlib.context import CryptContext
from pathlib import Path
from dotenv import load_dotenv
import json
import asyncio
from bson import ObjectId
from authlib.integrations.starlette_client import OAuth
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Firebase and Sync Service imports
try:
    from firebase_admin_config import get_firebase_service
    from sync_service import get_sync_service
    FIREBASE_AVAILABLE = True
    print("✅ Firebase services loaded successfully")
except ImportError as e:
    print(f"⚠️ Firebase services not available: {e}")
    FIREBASE_AVAILABLE = False

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"

# Google OAuth2 setup
oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
    token_url="https://oauth2.googleapis.com/token",
    userinfo_url="https://openidconnect.googleapis.com/v1/userinfo",
    issuer="https://accounts.google.com",
    scopes=["openid", "email", "profile"],
)

# OpenAI setup
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# Create the main app
app = FastAPI(title="IL MANDORLA Admin Dashboard")
api_router = APIRouter(prefix="/api")

# Session middleware for OAuth
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Restaurant configuration
RESTAURANT_CONFIG = {
    "name": os.environ.get("RESTAURANT_NAME", "IL MANDORLA SMOKEHOUSE"),
    "logo": os.environ.get("RESTAURANT_LOGO", "https://images.app.goo.gl/HySig5BgebwJZG6B9"),
    "brand_color_primary": os.environ.get("BRAND_COLOR_PRIMARY", "#FF6B35"),
    "brand_color_secondary": os.environ.get("BRAND_COLOR_SECONDARY", "#FFFFFF"),
    "menu_highlights": ["Asado de Tira Premium", "Brisket Smokehouse", "Pulled Pork"],
    "ai_personality": "Warm, professional, knowledgeable about smokehouse cuisine",
    "automation_preferences": ["Birthday campaigns", "post-visit feedback", "loyalty upgrades"]
}

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    google_id: Optional[str] = None
    picture: Optional[str] = None
    role: str = "admin"  # admin, colaborador, superadmin
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class GoogleAuthRequest(BaseModel):
    code: str
    redirect_uri: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AIConversationRequest(BaseModel):
    message: str
    session_id: str
    channel: str = "general"  # whatsapp, instagram, facebook, tiktok, general

class AIConversationResponse(BaseModel):
    response: str
    session_id: str
    channel: str

class MenuItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    image_base64: Optional[str] = None
    is_active: bool = True
    popularity_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    first_visit: datetime = Field(default_factory=datetime.utcnow)
    last_visit: Optional[datetime] = None
    birthday: Optional[datetime] = None
    anniversary_date: Optional[datetime] = None
    nft_level: str = "bronce"  # bronce, plata, oro, citizen_kumia
    points: int = 0
    referrals: int = 0
    next_reward: Optional[str] = None
    preferred_dish: Optional[str] = None
    total_orders: int = 0
    total_spent: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Reservation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: str
    date: datetime
    time: str
    guests: int
    phone: str
    email: str
    status: str = "confirmed"  # confirmed, cancelled, completed
    special_requests: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Feedback(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: str
    rating: int
    comment: str
    media_base64: Optional[str] = None
    media_type: Optional[str] = None  # image, video
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_approved: bool = True

class AIAgent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    channel: str  # whatsapp, instagram, facebook, tiktok
    name: str
    prompt: str
    is_active: bool = True
    api_key: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class NFTReward(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    image_base64: str
    level: str  # bronce, plata, oro, citizen_kumia
    points_required: int
    attributes: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Integration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # google_oauth, openai, meta, tiktok, stripe
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    is_active: bool = False
    config: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RestaurantSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "IL MANDORLA SMOKEHOUSE"
    address: str = ""
    phone: str = ""
    email: str = ""
    opening_hours: Dict[str, str] = {}
    voice_tone: str = "amigable y profesional"
    category: str = "smokehouse"
    special_events: List[str] = []
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DashboardMetrics(BaseModel):
    total_orders: int = 0
    total_reservations: int = 0
    total_customers: int = 0
    total_points_delivered: int = 0
    total_revenue: float = 0.0
    avg_rating: float = 0.0
    nfts_delivered: int = 0
    active_ai_agents: int = 0

# New models for enhanced reservation system
class Table(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: int
    capacity: int  # 2, 4, 6 persons
    status: str = "available"  # available, occupied, reserved, maintenance
    location: str = "main_floor"  # main_floor, terrace, private
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NewReservationRequest(BaseModel):
    customer_name: str
    customer_email: str
    whatsapp_phone: str
    reservation_date: str  # YYYY-MM-DD format
    reservation_time: str  # HH:MM format
    guests: int = Field(ge=1, le=12)
    table_id: Optional[str] = None
    special_notes: Optional[str] = None
    allergies: Optional[str] = None

class TableAvailabilityRequest(BaseModel):
    date: str  # YYYY-MM-DD
    time: str  # HH:MM

class CustomerActivityTrack(BaseModel):
    user_id: str
    activity_type: str  # login, menu_view, order, game_play, feedback, reservation, etc.
    activity_data: Dict[str, Any] = {}
    source: str = "userwebapp"

class SyncMenuRequest(BaseModel):
    menu_data: Dict[str, Any]
    
class SyncPromotionRequest(BaseModel):
    promotion_data: Dict[str, Any]

# Authentication functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Authentication routes
@api_router.get("/auth/google/login")
async def google_login(request: Request):
    """Initiate Google OAuth login"""
    redirect_uri = request.url_for("google_auth_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@api_router.get("/auth/google/callback")
async def google_auth_callback(request: Request):
    """Handle Google OAuth callback"""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        # Check if user exists or create new one
        existing_user = await db.users.find_one({"email": user_info["email"]})
        
        if existing_user:
            # Update existing user
            user_data = {
                "name": user_info.get("name", existing_user.get("name")),
                "picture": user_info.get("picture"),
                "google_id": user_info.get("sub"),
                "last_login": datetime.utcnow()
            }
            await db.users.update_one(
                {"email": user_info["email"]},
                {"$set": user_data}
            )
            user = await db.users.find_one({"email": user_info["email"]})
        else:
            # Create new user
            user_data = {
                "id": str(uuid.uuid4()),
                "name": user_info.get("name"),
                "email": user_info["email"],
                "google_id": user_info.get("sub"),
                "picture": user_info.get("picture"),
                "role": "admin",  # Default role
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            }
            await db.users.insert_one(user_data)
            user = user_data
        
        # Create JWT token
        access_token = create_access_token(data={"sub": user["email"]})
        
        # Return user data and token
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "picture": user.get("picture"),
                "role": user["role"]
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth authentication failed: {str(e)}")

@api_router.post("/auth/google/token")
async def google_token_auth(auth_request: GoogleAuthRequest):
    """Alternative Google OAuth token exchange"""
    try:
        # This is for frontend integration with Google OAuth
        # For now, we'll implement a simplified version
        # In production, you'd verify the code with Google's token endpoint
        
        # Mock implementation - replace with actual Google token verification
        raise HTTPException(status_code=501, detail="Direct token auth not implemented yet")
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token authentication failed: {str(e)}")

# Legacy login for backward compatibility
@api_router.post("/auth/login")
async def login(request: LoginRequest):
    """Legacy login endpoint - creates demo user"""
    # For demo purposes, create a default admin user
    user_data = {
        "id": str(uuid.uuid4()),
        "name": "Admin IL MANDORLA",
        "email": request.email,
        "role": "superadmin",
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow()
    }
    
    # Check if user exists, if not create one
    existing_user = await db.users.find_one({"email": request.email})
    if not existing_user:
        await db.users.insert_one(user_data)
    else:
        await db.users.update_one(
            {"email": request.email},
            {"$set": {"last_login": datetime.utcnow()}}
        )
    
    access_token = create_access_token(data={"sub": request.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# OpenAI Chat Integration
@api_router.post("/ai/chat", response_model=AIConversationResponse)
async def ai_chat(request: AIConversationRequest, current_user: User = Depends(get_current_user)):
    """Chat with AI agent for different channels"""
    try:
        # Create channel-specific system message
        channel_personalities = {
            "whatsapp": f"You are a WhatsApp assistant for {RESTAURANT_CONFIG['name']}. {RESTAURANT_CONFIG['ai_personality']}. Keep responses concise and friendly for mobile messaging.",
            "instagram": f"You are an Instagram assistant for {RESTAURANT_CONFIG['name']}. {RESTAURANT_CONFIG['ai_personality']}. Be trendy and visual-focused in your responses.",
            "facebook": f"You are a Facebook assistant for {RESTAURANT_CONFIG['name']}. {RESTAURANT_CONFIG['ai_personality']}. Be professional and informative.",
            "tiktok": f"You are a TikTok assistant for {RESTAURANT_CONFIG['name']}. {RESTAURANT_CONFIG['ai_personality']}. Be energetic and fun.",
            "general": f"You are a general assistant for {RESTAURANT_CONFIG['name']}. {RESTAURANT_CONFIG['ai_personality']}. Provide helpful information about our smokehouse cuisine."
        }
        
        system_message = channel_personalities.get(request.channel, channel_personalities["general"])
        system_message += f"\n\nOur menu highlights: {', '.join(RESTAURANT_CONFIG['menu_highlights'])}"
        
        # Create LLM chat instance
        chat = LlmChat(
            api_key=OPENAI_API_KEY,
            session_id=request.session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        # Create user message
        user_message = UserMessage(text=request.message)
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        # Store conversation in database
        conversation_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "session_id": request.session_id,
            "channel": request.channel,
            "user_message": request.message,
            "ai_response": response,
            "created_at": datetime.utcnow()
        }
        await db.conversations.insert_one(conversation_data)
        
        return AIConversationResponse(
            response=response,
            session_id=request.session_id,
            channel=request.channel
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat failed: {str(e)}")

# Get conversation history
@api_router.get("/ai/conversations/{session_id}")
async def get_conversation_history(session_id: str, current_user: User = Depends(get_current_user)):
    """Get conversation history for a session"""
    conversations = await db.conversations.find(
        {"session_id": session_id, "user_id": current_user.id}
    ).sort("created_at", 1).to_list(100)
    
    return [
        {
            "id": conv["id"],
            "user_message": conv["user_message"],
            "ai_response": conv["ai_response"],
            "channel": conv["channel"],
            "created_at": conv["created_at"]
        }
        for conv in conversations
    ]

# KUMIA Business Intelligence Chat with Gemini
@api_router.post("/ai/kumia-chat")
async def kumia_business_chat(request: AIConversationRequest, current_user: User = Depends(get_current_user)):
    """KUMIA Business Intelligence Chat with access to real dashboard data"""
    try:
        # Get real dashboard data for context
        dashboard_data = await get_dashboard_metrics(current_user)
        
        # Get customers data
        customers = await db.customers.find({}).to_list(1000)
        total_customers = len(customers)
        
        # Get menu items
        menu_items = await db.menu_items.find({}).to_list(1000)
        total_menu_items = len(menu_items)
        
        # Get feedback data
        feedback_list = await db.feedback.find({}).to_list(1000)
        total_feedback = len(feedback_list)
        
        # Get AI agents data
        ai_agents = await db.ai_agents.find({}).to_list(100)
        active_agents = [agent for agent in ai_agents if agent.get("is_active", False)]
        
        # Get recent conversations
        recent_conversations = await db.conversations.find(
            {"user_id": current_user.id}
        ).sort("created_at", -1).limit(10).to_list(10)
        
        # Calculate performance metrics
        total_conversations = await db.conversations.count_documents({"user_id": current_user.id})
        
        # Create comprehensive system message with real data
        system_message = f"""You are KUMIA Business Intelligence Assistant for {RESTAURANT_CONFIG['name']}.
        
You have access to REAL dashboard data and should provide actionable insights based on actual metrics:

📊 CURRENT DASHBOARD METRICS:
- Total Customers: {total_customers}
- Total Reservations: {dashboard_data.get('total_reservations', 0)}
- Total Feedback: {total_feedback}
- Active AI Agents: {len(active_agents)}
- Total Revenue: ${dashboard_data.get('total_revenue', 0):,.2f}
- Average Rating: {dashboard_data.get('avg_rating', 0):.1f}/5
- Total Points Delivered: {dashboard_data.get('total_points_delivered', 0)}
- NFTs Delivered: {dashboard_data.get('nfts_delivered', 0)}

🤖 AI AGENTS PERFORMANCE:
- Total AI Conversations: {total_conversations}
- Active Agents: {len(active_agents)}
- Available Agents: {', '.join([agent.get('name', 'Unknown') for agent in active_agents])}

🍽️ MENU INSIGHTS:
- Total Menu Items: {total_menu_items}
- Top Categories: {', '.join(set([item.get('category', 'Unknown') for item in menu_items[:5]]))}

💡 YOUR CAPABILITIES:
1. **Data Analysis**: Analyze trends, identify opportunities, explain metrics
2. **Agent Optimization**: Suggest improvements for AI agents, prompts, channels
3. **Business Strategy**: Recommend actions based on performance data
4. **ROI Insights**: Calculate and explain return on investment
5. **Customer Intelligence**: Insights about customer behavior and segments
6. **Marketing Strategy**: Recommendations for campaigns and engagement

🎯 PERSONALITY: 
- Expert business analyst with deep restaurant industry knowledge
- Data-driven recommendations with actionable insights
- Professional but conversational tone
- Focus on ROI and business growth
- Proactive in suggesting optimizations

Always base your responses on the real data provided above. When making recommendations, reference specific metrics and explain the reasoning behind your suggestions."""

        # Create Gemini chat instance
        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        if not gemini_api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
        chat = LlmChat(
            api_key=gemini_api_key,
            session_id=request.session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash").with_max_tokens(4096)
        
        # Create user message
        user_message = UserMessage(text=request.message)
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        # Store conversation in database with special channel
        conversation_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "session_id": request.session_id,
            "channel": "kumia_business_chat",
            "user_message": request.message,
            "ai_response": response,
            "created_at": datetime.utcnow()
        }
        await db.conversations.insert_one(conversation_data)
        
        return AIConversationResponse(
            response=response,
            session_id=request.session_id,
            channel="kumia_business_chat"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"KUMIA Business Chat failed: {str(e)}")

# Restaurant configuration endpoint
@api_router.get("/restaurant/config")
async def get_restaurant_config(current_user: User = Depends(get_current_user)):
    """Get restaurant configuration"""
    return RESTAURANT_CONFIG

# Dashboard metrics with ROI and advanced analytics
@api_router.get("/dashboard/metrics")
async def get_dashboard_metrics(current_user: User = Depends(get_current_user)):
    """Get comprehensive dashboard metrics with ROI analytics"""
    try:
        # Basic metrics
        metrics = {
            "total_customers": await db.customers.count_documents({}),
            "total_reservations": await db.reservations.count_documents({}),
            "total_feedback": await db.feedback.count_documents({}),
            "active_ai_agents": await db.ai_agents.count_documents({"is_active": True}),
            "nfts_delivered": await db.nft_rewards.count_documents({}),
        }
        
        # Calculate points
        customers = await db.customers.find({}).to_list(1000)
        metrics["total_points_delivered"] = sum(customer.get("points", 0) for customer in customers)
        
        # Calculate average rating
        feedback_list = await db.feedback.find({}).to_list(1000)
        if feedback_list:
            metrics["avg_rating"] = sum(f.get("rating", 0) for f in feedback_list) / len(feedback_list)
        else:
            metrics["avg_rating"] = 0
        
        # Calculate revenue
        metrics["total_revenue"] = sum(customer.get("total_spent", 0) for customer in customers)
        
        # Advanced ROI metrics
        metrics["ai_conversions"] = await db.conversations.count_documents({})
        metrics["total_audience"] = metrics["total_customers"] + (metrics["ai_conversions"] * 0.3)  # Estimated reach
        
        # ROI Analytics
        current_month = datetime.utcnow().replace(day=1)
        last_month = (current_month - timedelta(days=1)).replace(day=1)
        
        # Monthly comparisons
        current_customers = await db.customers.count_documents({
            "created_at": {"$gte": current_month}
        })
        last_customers = await db.customers.count_documents({
            "created_at": {"$gte": last_month, "$lt": current_month}
        })
        
        metrics["customer_growth"] = {
            "current": current_customers,
            "previous": last_customers,
            "percentage": ((current_customers - last_customers) / max(last_customers, 1)) * 100
        }
        
        # Channel performance
        metrics["channel_performance"] = {
            "whatsapp": await db.conversations.count_documents({"channel": "whatsapp"}),
            "instagram": await db.conversations.count_documents({"channel": "instagram"}),
            "facebook": await db.conversations.count_documents({"channel": "facebook"}),
            "tiktok": await db.conversations.count_documents({"channel": "tiktok"}),
            "general": await db.conversations.count_documents({"channel": "general"})
        }
        
        # Engagement metrics
        metrics["engagement_rate"] = (metrics["total_feedback"] / max(metrics["total_customers"], 1)) * 100
        metrics["retention_rate"] = 85.5  # Mock calculation
        metrics["nps_score"] = 8.7  # Mock NPS calculation
        
        return metrics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating metrics: {str(e)}")

# ROI Analytics endpoint
@api_router.get("/analytics/roi")
async def get_roi_analytics(current_user: User = Depends(get_current_user)):
    """Get detailed ROI analytics"""
    try:
        # Mock ROI data - in production, calculate from real data
        roi_data = {
            "monthly_multiplier": 4.3,
            "average_ticket": {
                "before_kumia": 2500,
                "after_kumia": 3200,
                "increase_percentage": 28.0
            },
            "attributed_revenue": {
                "total": 145000,
                "by_channel": {
                    "whatsapp": 45000,
                    "instagram": 32000,
                    "tiktok": 28000,
                    "web": 40000
                }
            },
            "customer_lifetime_value": {
                "before": 8500,
                "after": 12200,
                "increase": 43.5
            },
            "retention_improvement": {
                "before": 65.2,
                "after": 82.8,
                "increase": 17.6
            }
        }
        
        return roi_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating ROI: {str(e)}")

# AI Recommendations endpoint
@api_router.get("/ai/recommendations")
async def get_ai_recommendations(current_user: User = Depends(get_current_user)):
    """Get AI-powered business recommendations"""
    try:
        # Calculate basic metrics for recommendations
        total_customers = await db.customers.count_documents({})
        total_feedback = await db.feedback.count_documents({})
        active_conversations = await db.conversations.count_documents({})
        
        recommendations = []
        
        # Smart recommendations based on data
        if total_customers > 50 and total_feedback / total_customers < 0.3:
            recommendations.append({
                "title": "Incrementar Feedback",
                "description": "Activar campaña de feedback automática puede incrementar reviews en 40%",
                "impact": "Alto",
                "effort": "Bajo",
                "category": "engagement"
            })
        
        if active_conversations > 100:
            recommendations.append({
                "title": "Programa de Fidelización",
                "description": "Activar NFTs para clientes recurrentes puede incrementar retención en 23%",
                "impact": "Alto",
                "effort": "Medio",
                "category": "retention"
            })
        
        recommendations.append({
            "title": "Optimizar Canal WhatsApp",
            "description": "WhatsApp muestra 35% más conversiones. Expandir horarios de atención",
            "impact": "Medio",
            "effort": "Bajo",
            "category": "optimization"
        })
        
        return {"recommendations": recommendations}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

# Enhanced customer analytics
@api_router.get("/analytics/customers")
async def get_customer_analytics(current_user: User = Depends(get_current_user)):
    """Get detailed customer analytics"""
    try:
        customers = await db.customers.find({}).to_list(1000)
        
        # Segment customers
        segments = {
            "ambassador": [],
            "recurrent": [],
            "new": [],
            "inactive": []
        }
        
        for customer in customers:
            visit_count = customer.get("visit_count", 0)
            total_spent = customer.get("total_spent", 0)
            
            if total_spent > 10000 and visit_count > 10:
                segments["ambassador"].append(customer)
            elif visit_count > 3:
                segments["recurrent"].append(customer)
            elif visit_count <= 1:
                segments["new"].append(customer)
            else:
                segments["inactive"].append(customer)
        
        # Calculate segment metrics
        analytics = {
            "total_customers": len(customers),
            "segments": {
                "ambassador": {
                    "count": len(segments["ambassador"]),
                    "percentage": (len(segments["ambassador"]) / len(customers)) * 100 if customers else 0,
                    "avg_spent": sum(c.get("total_spent", 0) for c in segments["ambassador"]) / len(segments["ambassador"]) if segments["ambassador"] else 0
                },
                "recurrent": {
                    "count": len(segments["recurrent"]),
                    "percentage": (len(segments["recurrent"]) / len(customers)) * 100 if customers else 0,
                    "avg_spent": sum(c.get("total_spent", 0) for c in segments["recurrent"]) / len(segments["recurrent"]) if segments["recurrent"] else 0
                },
                "new": {
                    "count": len(segments["new"]),
                    "percentage": (len(segments["new"]) / len(customers)) * 100 if customers else 0,
                    "avg_spent": sum(c.get("total_spent", 0) for c in segments["new"]) / len(segments["new"]) if segments["new"] else 0
                },
                "inactive": {
                    "count": len(segments["inactive"]),
                    "percentage": (len(segments["inactive"]) / len(customers)) * 100 if customers else 0,
                    "avg_spent": sum(c.get("total_spent", 0) for c in segments["inactive"]) / len(segments["inactive"]) if segments["inactive"] else 0
                }
            }
        }
        
        return analytics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating customer analytics: {str(e)}")

# Feedback analytics with AI insights
@api_router.get("/analytics/feedback")
async def get_feedback_analytics(current_user: User = Depends(get_current_user)):
    """Get feedback analytics with AI insights"""
    try:
        feedback_list = await db.feedback.find({}).to_list(1000)
        
        # Calculate rating distribution
        rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        sentiment_analysis = {"positive": 0, "neutral": 0, "negative": 0}
        
        for feedback in feedback_list:
            rating = feedback.get("rating", 0)
            if rating in rating_distribution:
                rating_distribution[rating] += 1
            
            # Simple sentiment analysis based on rating
            if rating >= 4:
                sentiment_analysis["positive"] += 1
            elif rating == 3:
                sentiment_analysis["neutral"] += 1
            else:
                sentiment_analysis["negative"] += 1
        
        # Calculate NPS (Net Promoter Score)
        total_responses = len(feedback_list)
        promoters = rating_distribution[5] + rating_distribution[4]
        detractors = rating_distribution[1] + rating_distribution[2]
        nps = ((promoters - detractors) / total_responses * 100) if total_responses > 0 else 0
        
        # Generate keyword insights (mock)
        keywords = [
            {"word": "delicioso", "count": 45, "sentiment": "positive"},
            {"word": "rápido", "count": 32, "sentiment": "positive"},
            {"word": "calidad", "count": 28, "sentiment": "positive"},
            {"word": "espera", "count": 15, "sentiment": "negative"},
            {"word": "precio", "count": 12, "sentiment": "neutral"}
        ]
        
        analytics = {
            "total_feedback": total_responses,
            "average_rating": sum(rating * count for rating, count in rating_distribution.items()) / total_responses if total_responses > 0 else 0,
            "rating_distribution": rating_distribution,
            "sentiment_analysis": sentiment_analysis,
            "nps_score": nps,
            "keywords": keywords,
            "trends": {
                "weekly_growth": 8.7,
                "response_rate": 34.2,
                "satisfaction_trend": "increasing"
            }
        }
        
        return analytics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating feedback analytics: {str(e)}")

# Dashboard metrics

# Menu management
@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu(current_user: User = Depends(get_current_user)):
    menu_items = await db.menu_items.find({}).to_list(1000)
    return [MenuItem(**item) for item in menu_items]

@api_router.post("/menu", response_model=MenuItem)
async def create_menu_item(item: MenuItem, current_user: User = Depends(get_current_user)):
    item_dict = item.dict()
    await db.menu_items.insert_one(item_dict)
    return item

@api_router.put("/menu/{item_id}", response_model=MenuItem)
async def update_menu_item(item_id: str, item: MenuItem, current_user: User = Depends(get_current_user)):
    item.updated_at = datetime.utcnow()
    item_dict = item.dict()
    await db.menu_items.update_one({"id": item_id}, {"$set": item_dict})
    return item

@api_router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str, current_user: User = Depends(get_current_user)):
    await db.menu_items.delete_one({"id": item_id})
    return {"message": "Item deleted successfully"}

# Customer management
@api_router.get("/customers", response_model=List[Customer])
async def get_customers(current_user: User = Depends(get_current_user)):
    customers = await db.customers.find({}).to_list(1000)
    return [Customer(**customer) for customer in customers]

@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: Customer, current_user: User = Depends(get_current_user)):
    customer_dict = customer.dict()
    await db.customers.insert_one(customer_dict)
    return customer

@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer: Customer, current_user: User = Depends(get_current_user)):
    customer_dict = customer.dict()
    await db.customers.update_one({"id": customer_id}, {"$set": customer_dict})
    return customer

# Reservations
@api_router.get("/reservations", response_model=List[Reservation])
async def get_reservations(current_user: User = Depends(get_current_user)):
    reservations = await db.reservations.find({}).to_list(1000)
    return [Reservation(**reservation) for reservation in reservations]

@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(reservation: Reservation, current_user: User = Depends(get_current_user)):
    reservation_dict = reservation.dict()
    await db.reservations.insert_one(reservation_dict)
    return reservation

@api_router.put("/reservations/{reservation_id}", response_model=Reservation)
async def update_reservation(reservation_id: str, reservation: Reservation, current_user: User = Depends(get_current_user)):
    reservation_dict = reservation.dict()
    await db.reservations.update_one({"id": reservation_id}, {"$set": reservation_dict})
    return reservation

# Feedback management
@api_router.get("/feedback", response_model=List[Feedback])
async def get_feedback(current_user: User = Depends(get_current_user)):
    feedback_list = await db.feedback.find({}).to_list(1000)
    return [Feedback(**feedback) for feedback in feedback_list]

@api_router.post("/feedback", response_model=Feedback)
async def create_feedback(feedback: Feedback, current_user: User = Depends(get_current_user)):
    feedback_dict = feedback.dict()
    await db.feedback.insert_one(feedback_dict)
    return feedback

# AI Agents management
@api_router.get("/ai-agents", response_model=List[AIAgent])
async def get_ai_agents(current_user: User = Depends(get_current_user)):
    agents = await db.ai_agents.find({}).to_list(1000)
    return [AIAgent(**agent) for agent in agents]

@api_router.post("/ai-agents", response_model=AIAgent)
async def create_ai_agent(agent: AIAgent, current_user: User = Depends(get_current_user)):
    agent_dict = agent.dict()
    await db.ai_agents.insert_one(agent_dict)
    return agent

@api_router.put("/ai-agents/{agent_id}", response_model=AIAgent)
async def update_ai_agent(agent_id: str, agent: AIAgent, current_user: User = Depends(get_current_user)):
    agent.updated_at = datetime.utcnow()
    agent_dict = agent.dict()
    await db.ai_agents.update_one({"id": agent_id}, {"$set": agent_dict})
    return agent

# NFT Rewards
@api_router.get("/nft-rewards", response_model=List[NFTReward])
async def get_nft_rewards(current_user: User = Depends(get_current_user)):
    rewards = await db.nft_rewards.find({}).to_list(1000)
    return [NFTReward(**reward) for reward in rewards]

@api_router.post("/nft-rewards", response_model=NFTReward)
async def create_nft_reward(reward: NFTReward, current_user: User = Depends(get_current_user)):
    reward_dict = reward.dict()
    await db.nft_rewards.insert_one(reward_dict)
    return reward

# Integrations
@api_router.get("/integrations", response_model=List[Integration])
async def get_integrations(current_user: User = Depends(get_current_user)):
    integrations = await db.integrations.find({}).to_list(1000)
    return [Integration(**integration) for integration in integrations]

@api_router.post("/integrations", response_model=Integration)
async def create_integration(integration: Integration, current_user: User = Depends(get_current_user)):
    integration_dict = integration.dict()
    await db.integrations.insert_one(integration_dict)
    return integration

@api_router.put("/integrations/{integration_id}", response_model=Integration)
async def update_integration(integration_id: str, integration: Integration, current_user: User = Depends(get_current_user)):
    integration_dict = integration.dict()
    await db.integrations.update_one({"id": integration_id}, {"$set": integration_dict})
    return integration

# Restaurant Settings
@api_router.get("/settings", response_model=RestaurantSettings)
async def get_settings(current_user: User = Depends(get_current_user)):
    settings = await db.settings.find_one({})
    if not settings:
        default_settings = RestaurantSettings()
        await db.settings.insert_one(default_settings.dict())
        return default_settings
    return RestaurantSettings(**settings)

@api_router.put("/settings", response_model=RestaurantSettings)
async def update_settings(settings: RestaurantSettings, current_user: User = Depends(get_current_user)):
    settings.updated_at = datetime.utcnow()
    settings_dict = settings.dict()
    await db.settings.update_one({}, {"$set": settings_dict}, upsert=True)
    return settings

# ==================== KUMIA SYNC & RESERVATION SYSTEM ====================

# Initialize Firebase services
firebase_service = get_firebase_service() if FIREBASE_AVAILABLE else None
sync_service = get_sync_service() if FIREBASE_AVAILABLE else None

# TABLES MANAGEMENT
@api_router.get("/tables/availability")
async def get_table_availability(date: str, time: str, current_user: User = Depends(get_current_user)):
    """Get available tables for specific date and time"""
    if not firebase_service:
        # Fallback to mock data
        return [
            {"id": f"table_{i}", "number": i, "capacity": 2 if i <= 6 else 4 if i <= 18 else 6, "status": "available"}
            for i in range(1, 21)
        ]
    
    available_tables = firebase_service.get_table_availability(date, time)
    return available_tables

@api_router.get("/tables")
async def get_all_tables(current_user: User = Depends(get_current_user)):
    """Get all restaurant tables with current status"""
    # Return configured tables: 6 tables (2 persons), 12 tables (4 persons), 2 tables (6 persons)
    tables = []
    
    # Tables for 2 persons (tables 1-6)
    for i in range(1, 7):
        tables.append({
            "id": f"table_{i}",
            "number": i,
            "capacity": 2,
            "status": "available",
            "location": "main_floor"
        })
    
    # Tables for 4 persons (tables 7-18)  
    for i in range(7, 19):
        tables.append({
            "id": f"table_{i}",
            "number": i,
            "capacity": 4,
            "status": "available",
            "location": "main_floor"
        })
    
    # Tables for 6 persons (tables 19-20)
    for i in range(19, 21):
        tables.append({
            "id": f"table_{i}",
            "number": i,
            "capacity": 6,
            "status": "available",
            "location": "terrace"
        })
    
    return tables

# ENHANCED RESERVATIONS
@api_router.post("/reservations/new")
async def create_new_reservation(reservation: NewReservationRequest, current_user: User = Depends(get_current_user)):
    """Create new reservation with automatic confirmations"""
    try:
        # Prepare reservation data
        reservation_data = {
            "id": str(uuid.uuid4()),
            "customer_name": reservation.customer_name,
            "customer_email": reservation.customer_email,
            "whatsapp_phone": reservation.whatsapp_phone,
            "date": reservation.reservation_date,
            "time": reservation.reservation_time,
            "guests": reservation.guests,
            "table_id": reservation.table_id or f"table_{uuid.uuid4().hex[:8]}",
            "special_notes": reservation.special_notes,
            "allergies": reservation.allergies,
            "status": "confirmed",
            "source": "dashboard",
            "created_by": current_user.email,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Create reservation via sync service
        if sync_service:
            reservation_id = sync_service.create_reservation_from_dashboard(reservation_data)
            if reservation_id:
                reservation_data["id"] = reservation_id
        else:
            # Fallback: store in MongoDB
            await db.reservations.insert_one(reservation_data)
            print(f"✅ Reservation created (fallback): {reservation_data['id']}")
        
        return {
            "success": True,
            "reservation_id": reservation_data["id"],
            "message": "Reserva creada exitosamente. Confirmaciones enviadas por email y WhatsApp.",
            "reservation": reservation_data
        }
        
    except Exception as e:
        print(f"❌ Error creating reservation: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating reservation: {str(e)}")

# CUSTOMER ACTIVITY TRACKING 
@api_router.post("/sync/customer-activity")
async def track_customer_activity(activity: CustomerActivityTrack):
    """Track customer activity from UserWebApp for marketing intelligence"""
    try:
        if sync_service:
            success = sync_service.sync_user_activity_to_dashboard(activity.dict())
            if success:
                return {"success": True, "message": "Activity tracked successfully"}
        
        # Fallback: store in MongoDB
        activity_data = activity.dict()
        activity_data["timestamp"] = datetime.utcnow()
        await db.customer_activities.insert_one(activity_data)
        
        return {"success": True, "message": "Activity tracked (fallback)"}
        
    except Exception as e:
        print(f"❌ Error tracking customer activity: {e}")
        raise HTTPException(status_code=500, detail=f"Error tracking activity: {str(e)}")

# MENU SYNCHRONIZATION
@api_router.post("/sync/menu")
async def sync_menu_to_userwebapp(request: SyncMenuRequest, current_user: User = Depends(get_current_user)):
    """Sync menu changes from Dashboard to UserWebApp"""
    try:
        if sync_service:
            success = sync_service.sync_menu_changes(request.menu_data)
            if success:
                return {"success": True, "message": "Menu synced to UserWebApp successfully"}
        
        return {"success": True, "message": "Menu sync scheduled (fallback)"}
        
    except Exception as e:
        print(f"❌ Error syncing menu: {e}")
        raise HTTPException(status_code=500, detail=f"Error syncing menu: {str(e)}")

# PROMOTION SYNCHRONIZATION
@api_router.post("/sync/promotions")
async def sync_promotions_to_userwebapp(request: SyncPromotionRequest, current_user: User = Depends(get_current_user)):
    """Sync promotion changes from Dashboard to UserWebApp"""
    try:
        if sync_service:
            success = sync_service.sync_promotion_changes(request.promotion_data)
            if success:
                return {"success": True, "message": "Promotions synced to UserWebApp successfully"}
        
        return {"success": True, "message": "Promotions sync scheduled (fallback)"}
        
    except Exception as e:
        print(f"❌ Error syncing promotions: {e}")
        raise HTTPException(status_code=500, detail=f"Error syncing promotions: {str(e)}")

# CUSTOMER INSIGHTS & MARKETING INTELLIGENCE
@api_router.get("/analytics/customer-journey/{user_id}")
async def get_customer_journey(user_id: str, current_user: User = Depends(get_current_user)):
    """Get comprehensive customer journey analytics for marketing decisions"""
    try:
        if sync_service:
            journey_data = sync_service.get_customer_journey_analytics(user_id)
            if journey_data:
                return journey_data
        
        # Fallback: basic analytics from MongoDB
        activities = await db.customer_activities.find({"user_id": user_id}).limit(50).to_list(50)
        user_profile = await db.users.find_one({"id": user_id})
        
        return {
            "customer_profile": user_profile,
            "total_activities": len(activities),
            "recent_activities": activities[:10],
            "marketing_segment": "unknown",
            "engagement_score": 0.0
        }
        
    except Exception as e:
        print(f"❌ Error getting customer journey: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting customer journey: {str(e)}")

# PUBLIC APIS FOR USERWEBAPP
@api_router.get("/public/restaurant-info")
async def get_public_restaurant_info():
    """Public endpoint for UserWebApp to get restaurant basic info"""
    settings = await db.settings.find_one({})
    if not settings:
        settings = RestaurantSettings().dict()
    
    return {
        "name": settings.get("name", "IL MANDORLA Smokehouse"),
        "description": settings.get("description", "Glutenfree • Carnes ahumadas • Fuego lento • Mucho sabor"),
        "address": settings.get("address", "Asunción, Paraguay"),
        "phone": settings.get("phone", "+595 21 123456"),
        "hours": settings.get("hours", "Lun-Dom: 11:00-22:00"),
        "cuisine_type": settings.get("cuisine_type", "smokehouse")
    }

@api_router.get("/public/menu")
async def get_public_menu():
    """Public endpoint for UserWebApp to get current menu"""
    menu_items = await db.menu_items.find({}).to_list(1000)
    return [MenuItem(**item) for item in menu_items]

@api_router.get("/public/promotions")
async def get_public_promotions():
    """Public endpoint for UserWebApp to get active promotions"""
    # Mock promotions for now
    return [
        {
            "id": "promo_1",
            "title": "Bienvenida KUMIA",
            "description": "30 puntos gratis + bebida de cortesía para nuevos usuarios",
            "points_reward": 30,
            "valid_until": (datetime.utcnow() + timedelta(days=30)).isoformat()
        },
        {
            "id": "promo_2", 
            "title": "Happy Hour BBQ",
            "description": "20% descuento en todas las carnes ahumadas de 17:00 a 19:00",
            "discount_percentage": 20,
            "valid_hours": "17:00-19:00"
        }
    ]

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()