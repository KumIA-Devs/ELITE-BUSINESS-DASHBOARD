import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import uuid
import random

async def seed_database():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'restaurant_db')]
    
    # Clear existing data
    await db.menu_items.delete_many({})
    await db.customers.delete_many({})
    await db.reservations.delete_many({})
    await db.feedback.delete_many({})
    await db.ai_agents.delete_many({})
    await db.nft_rewards.delete_many({})
    await db.integrations.delete_many({})
    await db.settings.delete_many({})
    
    # Seed Menu Items
    menu_items = [
        {
            "id": str(uuid.uuid4()),
            "name": "Asado de Tira Premium",
            "description": "Costillas de res ahumadas lentamente por 12 horas con especias secretas",
            "price": 28.99,
            "category": "Carnes",
            "is_active": True,
            "popularity_score": 95.5,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Brisket Smokehouse",
            "description": "Pecho de res ahumado con salsa BBQ artesanal",
            "price": 32.50,
            "category": "Carnes",
            "is_active": True,
            "popularity_score": 88.2,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pulled Pork Sandwich",
            "description": "Cerdo desmenuzado con coleslaw y papas fritas",
            "price": 16.75,
            "category": "Sandwiches",
            "is_active": True,
            "popularity_score": 92.1,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Alitas Ahumadas",
            "description": "Alitas de pollo ahumadas con salsa búfalo casera",
            "price": 14.99,
            "category": "Entradas",
            "is_active": True,
            "popularity_score": 87.3,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Costillas Baby Back",
            "description": "Costillas de cerdo tiernas con glaseado de miel",
            "price": 26.00,
            "category": "Carnes",
            "is_active": True,
            "popularity_score": 91.8,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.menu_items.insert_many(menu_items)
    
    # Seed Customers
    customers = []
    names = [
        "Carlos Mendoza", "María González", "Luis Rodríguez", "Ana Martínez", 
        "Pedro Sánchez", "Sofia López", "Diego Herrera", "Carmen Ruiz",
        "Roberto Silva", "Laura Jiménez", "Fernando Torres", "Patricia Morales"
    ]
    
    for i, name in enumerate(names):
        customer = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": f"{name.lower().replace(' ', '.').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u').replace('ñ', 'n')}@gmail.com",
            "phone": f"+1234567{800 + i}",
            "first_visit": datetime.utcnow() - timedelta(days=random.randint(30, 365)),
            "last_visit": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            "birthday": datetime(1980 + random.randint(0, 30), random.randint(1, 12), random.randint(1, 28)),
            "anniversary_date": datetime.utcnow() - timedelta(days=random.randint(30, 365)),
            "nft_level": random.choice(["bronce", "plata", "oro", "citizen_kumia"]),
            "points": random.randint(10, 500),
            "referrals": random.randint(0, 10),
            "next_reward": random.choice(["plata", "oro", "citizen_kumia"]),
            "preferred_dish": random.choice(["Asado de Tira Premium", "Brisket Smokehouse", "Pulled Pork Sandwich"]),
            "total_orders": random.randint(3, 25),
            "total_spent": random.uniform(50, 800),
            "created_at": datetime.utcnow() - timedelta(days=random.randint(30, 365))
        }
        customers.append(customer)
    
    await db.customers.insert_many(customers)
    
    # Seed Reservations
    reservations = []
    for i in range(8):
        reservation = {
            "id": str(uuid.uuid4()),
            "customer_id": customers[i]["id"],
            "customer_name": customers[i]["name"],
            "date": datetime.utcnow() + timedelta(days=random.randint(1, 30)),
            "time": f"{random.randint(18, 21)}:{random.choice(['00', '30'])}",
            "guests": random.randint(2, 8),
            "phone": customers[i]["phone"],
            "email": customers[i]["email"],
            "status": random.choice(["confirmed", "cancelled", "completed"]),
            "special_requests": random.choice([None, "Mesa cerca de la ventana", "Celebración de cumpleaños", "Vegetariano en el grupo"]),
            "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 7))
        }
        reservations.append(reservation)
    
    await db.reservations.insert_many(reservations)
    
    # Seed Feedback
    feedback_comments = [
        "Excelente comida y servicio. El asado estaba perfecto!",
        "Muy buen ambiente y la carne ahumada es espectacular",
        "El brisket es el mejor que he probado en la ciudad",
        "Servicio rápido y amable. Volveremos pronto",
        "Las costillas estaban deliciosas, muy recomendado",
        "Ambiente acogedor y comida de calidad premium",
        "El pulled pork sandwich superó mis expectativas"
    ]
    
    feedback_items = []
    for i in range(7):
        feedback_item = {
            "id": str(uuid.uuid4()),
            "customer_id": customers[i]["id"],
            "customer_name": customers[i]["name"],
            "rating": random.randint(4, 5),
            "comment": feedback_comments[i],
            "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            "is_approved": True
        }
        feedback_items.append(feedback_item)
    
    await db.feedback.insert_many(feedback_items)
    
    # Seed AI Agents
    ai_agents = [
        {
            "id": str(uuid.uuid4()),
            "channel": "whatsapp",
            "name": "WhatsApp Assistant",
            "prompt": "Eres un asistente amigable del restaurante IL MANDORLA. Ayudas a los clientes con reservas, menú y recomendaciones. Siempre mantén un tono cálido y profesional.",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "channel": "instagram",
            "name": "Instagram Bot",
            "prompt": "Eres el community manager de IL MANDORLA en Instagram. Respondes comentarios y DMs de manera creativa y atractiva, promocionando nuestros platos ahumados.",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "channel": "facebook",
            "name": "Facebook Assistant",
            "prompt": "Asistes a los clientes de IL MANDORLA en Facebook. Proporcionas información sobre horarios, ubicación y menú. Siempre invitas a visitar el restaurante.",
            "is_active": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.ai_agents.insert_many(ai_agents)
    
    # Seed NFT Rewards
    nft_rewards = [
        {
            "id": str(uuid.uuid4()),
            "name": "Citizen Bronce",
            "description": "Primera insignia para nuevos clientes de IL MANDORLA",
            "level": "bronce",
            "points_required": 50,
            "attributes": {"color": "bronze", "rarity": "common"},
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Citizen Plata",
            "description": "Insignia para clientes regulares con buen historial",
            "level": "plata",
            "points_required": 150,
            "attributes": {"color": "silver", "rarity": "uncommon"},
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Citizen Oro",
            "description": "Insignia premium para clientes VIP",
            "level": "oro",
            "points_required": 300,
            "attributes": {"color": "gold", "rarity": "rare"},
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Citizen KUMIA",
            "description": "Máxima insignia para clientes elite del ecosistema",
            "level": "citizen_kumia",
            "points_required": 500,
            "attributes": {"color": "platinum", "rarity": "legendary"},
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.nft_rewards.insert_many(nft_rewards)
    
    # Seed Restaurant Settings
    settings = {
        "id": str(uuid.uuid4()),
        "name": "IL MANDORLA SMOKEHOUSE",
        "address": "Av. Corrientes 1234, Buenos Aires, Argentina",
        "phone": "+54 11 1234-5678",
        "email": "info@ilmandorla.com",
        "opening_hours": {
            "monday": "12:00 - 23:00",
            "tuesday": "12:00 - 23:00",
            "wednesday": "12:00 - 23:00",
            "thursday": "12:00 - 23:00",
            "friday": "12:00 - 24:00",
            "saturday": "12:00 - 24:00",
            "sunday": "12:00 - 22:00"
        },
        "voice_tone": "amigable, cálido y profesional",
        "category": "smokehouse premium",
        "special_events": ["Noche de Jazz - Viernes", "Asado Familiar - Domingos"],
        "updated_at": datetime.utcnow()
    }
    
    await db.settings.insert_one(settings)
    
    print("✅ Database seeded successfully!")
    print(f"✅ Added {len(menu_items)} menu items")
    print(f"✅ Added {len(customers)} customers")
    print(f"✅ Added {len(reservations)} reservations")
    print(f"✅ Added {len(feedback_items)} feedback items")
    print(f"✅ Added {len(ai_agents)} AI agents")
    print(f"✅ Added {len(nft_rewards)} NFT rewards")
    print(f"✅ Added restaurant settings")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())