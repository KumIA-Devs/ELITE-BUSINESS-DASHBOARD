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
    authorization_url="https://accounts.google.com/o/oauth2/v2/auth",
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

# Restaurant configuration endpoint
@api_router.get("/restaurant/config")
async def get_restaurant_config(current_user: User = Depends(get_current_user)):
    """Get restaurant configuration"""
    return RESTAURANT_CONFIG

# Dashboard metrics
@api_router.get("/dashboard/metrics")
async def get_dashboard_metrics(current_user: User = Depends(get_current_user)):
    metrics = DashboardMetrics()
    
    # Get real-time metrics
    metrics.total_customers = await db.customers.count_documents({})
    metrics.total_reservations = await db.reservations.count_documents({})
    metrics.total_orders = await db.orders.count_documents({}) if await db.orders.count_documents({}) else 0
    metrics.active_ai_agents = await db.ai_agents.count_documents({"is_active": True})
    metrics.nfts_delivered = await db.nft_rewards.count_documents({})
    
    # Calculate total points delivered
    customers = await db.customers.find({}).to_list(1000)
    metrics.total_points_delivered = sum(customer.get("points", 0) for customer in customers)
    
    # Calculate average rating
    feedback_list = await db.feedback.find({}).to_list(1000)
    if feedback_list:
        metrics.avg_rating = sum(f.get("rating", 0) for f in feedback_list) / len(feedback_list)
    
    # Calculate total revenue (mock data for now)
    metrics.total_revenue = sum(customer.get("total_spent", 0) for customer in customers)
    
    return metrics

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

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()