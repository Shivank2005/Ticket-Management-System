
# backend/app/main.py

from contextlib import asynccontextmanager 
from fastapi import FastAPI, Body, HTTPException, Form, File, UploadFile, Depends, status 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional
import shutil
import os
from fastapi.responses import Response 
import json 
import redis.asyncio as redis 
from fastapi.security import OAuth2PasswordRequestForm # to parse form-encoded username/password

from .dependencies import (
    
    connect_redis, disconnect_redis, get_redis_client, 
    
    user_collection, verify_password, get_password_hash, create_access_token, 
    
    get_current_user 
) 

from . import crud
from .models import TicketSchema, UpdateTicketSchema, TicketInDB, UserRegister, UserOut, UserInDB
import pika
import secrets # for generating secure tokens



#async context manager for lifespan events(startup/shutdown)
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_redis() 
    yield # The application runs during this context
    await disconnect_redis() 

# Initialize FastAPI application
app = FastAPI(title="Support Ticket API", lifespan=lifespan) 


# CORS Configuration 

origins = [
    "http://localhost:5173", 
    "http://localhost:3000", 
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # 
    allow_headers=["*"], # Allow all headers like jwt 
)


# File Upload Configuration
UPLOAD_DIR = "uploads" 
os.makedirs(UPLOAD_DIR, exist_ok=True) 

# Mount this directory to serve files 
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Redis Cache Invalidation Helper Functions
# These functions remove stale data from Redis cache when database data is modified.
async def invalidate_all_tickets_cache(redis_client_instance: Optional[redis.Redis], 
                                       search: Optional[str] = None, 
                                       category: Optional[str] = None): 
    if redis_client_instance:
    
        cache_key = f"all_tickets_s:{search or 'none'}_c:{category or 'none'}"
        await redis_client_instance.delete(cache_key) 
        print(f"Redis Cache: Invalidated list cache for search='{search}', category='{category}'.")

async def invalidate_single_ticket_cache(ticket_id: str, redis_client_instance: Optional[redis.Redis]): 
    if redis_client_instance:
        await redis_client_instance.delete(f"ticket:{ticket_id}") 
        print(f"Redis Cache: Invalidated single ticket cache for 'ticket:{ticket_id}'.")


# Authentication and User Endpoints 

@app.post("/api/register", response_model=UserOut, status_code=status.HTTP_201_CREATED, tags=["Auth"])
async def register_user(user_data: UserRegister):
    
    
    existing_user_by_username = await user_collection.find_one({"username": user_data.username})
    if existing_user_by_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    
    # Check for duplicate email
    existing_user_by_email = await user_collection.find_one({"email": user_data.email})
    if existing_user_by_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    
    hashed_password = get_password_hash(user_data.password)
    
    # Create UserInDB model instance 
    user_in_db = UserInDB(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    
    new_user = await user_collection.insert_one(user_in_db.model_dump(by_alias=True, exclude_unset=True)) 
    
    # Retrieve the saved user document to return it, ensuring proper ID mapping
    created_user_doc = await user_collection.find_one({"_id": new_user.inserted_id})
    return UserOut.model_validate(created_user_doc) 


@app.post("/api/login", tags=["Auth"])
async def login_for_access_token(
    # OAuth2PasswordRequestForm to parse form-encoded username/password
    form_data: OAuth2PasswordRequestForm = Depends() 
):
    """
    Authenticates a user with username/email and password.
    Returns a JWT access token upon successful authentication.
    """
    
    user_from_db_doc = await user_collection.find_one({
        "$or": [{"username": form_data.username}, {"email": form_data.username}]
    })

    
    if not user_from_db_doc or not verify_password(form_data.password, user_from_db_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"}, 
        )
    
    # Create JWT access token with the user's username as the  (subject) claim
    access_token = create_access_token(data={"sub": user_from_db_doc["username"]})
    
    
    return {"access_token": access_token, "token_type": "bearer"}


#  Protected API Endpoints for Tickets 

@app.post("/api/tickets/", response_model=TicketInDB, status_code=status.HTTP_201_CREATED, tags=["Tickets"]) 
async def create_ticket(
    current_user: UserInDB = Depends(get_current_user), # Authorization: Requires valid JWT
    redis_instance: Optional[redis.Redis] = Depends(get_redis_client), # Inject Redis client for cache invalidation
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    print(f"Creating ticket for user: {current_user.username}") # Log for tracking/debugging
    image_url = None
    if image:
        file_path = os.path.join(UPLOAD_DIR, image.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/{UPLOAD_DIR}/{image.filename}"

    ticket_data = TicketSchema( 
        title=title,
        description=description,
        category=category,
        image_url=image_url
    )
    new_ticket_db_dict = await crud.add_ticket(ticket_data) # Store in MongoDB
    
    # Invalidate relevant caches as the list of tickets has changed
    # Need to invalidate potentially many filtered/searched versions of 'all_tickets' list
    await invalidate_all_tickets_cache(redis_instance, search=None, category=None) # Generic all tickets cache
    # Invalidate also a more specific one, if we know typical search terms/categories or use wildcard keys
    # For robust invalidation, in production, you might loop through common keys or use patterns
    await invalidate_single_ticket_cache(new_ticket_db_dict['id'], redis_instance) # Specific ticket cache

    new_ticket_response = TicketInDB.model_validate(new_ticket_db_dict) # Prepare response
    return new_ticket_response

# --- NEW: PASSWORD RESET ENDPOINTS ---

@app.post("/api/forgot-password", status_code=status.HTTP_200_OK, tags=["Auth"])
async def forgot_password(
    body: dict = Body(...),
    redis_instance: Optional[redis.Redis] = Depends(get_redis_client)
):
    email = body.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is required")

    user = await user_collection.find_one({"email": email})
    if not user:
        # Security: Don't reveal if email exists. Return OK to prevent user enumeration.
        print(f"Password reset requested for non-existent email: {email}")
        return {"message": "If an account with this email exists, a password reset link has been sent."}

    # 1. Generate a secure, URL-safe token
    reset_token = secrets.token_urlsafe(32)
    
    # 2. Store the token in Redis with a 15-minute expiration
    if redis_instance:
        await redis_instance.set(f"reset:{reset_token}", user["email"], ex=900) # 15 minutes = 900 seconds
        print(f"Stored reset token for {email} in Redis.")
    else:
        # Fallback if Redis is down (not ideal for production)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Password reset service is temporarily unavailable.")

    # 3. Publish a message to RabbitMQ
    try:
        rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/%2F")
        connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
        channel = connection.channel()
        channel.queue_declare(queue='password_reset_queue', durable=True)
        
        message = json.dumps({"email": user["email"], "token": reset_token})
        
        channel.basic_publish(
            exchange='',
            routing_key='password_reset_queue',
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE # Make message persistent
            ))
        connection.close()
        print(f"Published password reset message for {email} to RabbitMQ.")
    except Exception as e:
        print(f"Could not publish message to RabbitMQ: {e}")
        # Even if publishing fails, we don't want to alert the user.
        # This should be logged and monitored.
        
    return {"message": "If an account with this email exists, a password reset link has been sent."}


@app.post("/api/reset-password", status_code=status.HTTP_200_OK, tags=["Auth"])
async def reset_password(
    body: dict = Body(...),
    redis_instance: Optional[redis.Redis] = Depends(get_redis_client)
):
    token = body.get("token")
    new_password = body.get("new_password")

    if not token or not new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token and new password are required")

    if not redis_instance:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Service is temporarily unavailable.")
        
    # 1. Verify the token exists in Redis
    email = await redis_instance.get(f"reset:{token}")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    # 2. Hash the new password and update the user in MongoDB
    hashed_password = get_password_hash(new_password)
    result = await user_collection.update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # 3. Invalidate the token by deleting it from Redis
    await redis_instance.delete(f"reset:{token}")
    print(f"Password has been reset for {email}. Token invalidated.")

    return {"message": "Your password has been reset successfully."}


@app.get("/api/tickets/", response_model=list[TicketInDB], tags=["Tickets"])
async def get_all_tickets(
    current_user: UserInDB = Depends(get_current_user), # Authorization: User must be authenticated
    search: Optional[str] = None, # Server-side search query parameter
    category: Optional[str] = None, # Server-side category filter parameter
    redis_instance: Optional[redis.Redis] = Depends(get_redis_client) # Inject Redis client for caching
):
    print(f"Retrieving tickets for user: {current_user.username} (Search: '{search}', Category: '{category}')")
    
    # Create a dynamic cache key based on search and category filters
    cache_key = f"all_tickets_s:{search or 'none'}_c:{category or 'none'}" 
    
    if redis_instance: # Proceed with caching only if Redis client is available
        cached_tickets_json = await redis_instance.get(cache_key)
        if cached_tickets_json:
            print(f"Cache Hit: {cache_key}")
            try:
                ticket_data_list = json.loads(cached_tickets_json)
                return [TicketInDB.model_validate(data) for data in ticket_data_list] # Return from cache
            except (json.JSONDecodeError, ValueError, KeyError, TypeError) as e:
                print(f"Error parsing cached data for {cache_key}: {e}. Falling back to DB.")
    
    # If Cache Miss or Redis unavailable, fetch data from MongoDB with applied filters
    print(f"Cache Miss: {cache_key}. Fetching from DB.")
    tickets_from_db = await crud.retrieve_tickets(search=search, category=category) # Fetch from DB with filters
    
    if redis_instance:
        # Cache the fetched results as a JSON string with an expiration time
        await redis_instance.set(cache_key, json.dumps(tickets_from_db), ex=60) # `ex` for expiration in seconds (correct for redis.asyncio)
    
    # Convert list of dicts from DB to list of Pydantic models for the response
    converted_tickets = [TicketInDB.model_validate(ticket_data) for ticket_data in tickets_from_db]
    return converted_tickets 


@app.get("/api/tickets/{id}", response_model=TicketInDB, tags=["Tickets"]) 
async def get_ticket_by_id(
    id: str, 
    current_user: UserInDB = Depends(get_current_user), # Authorization
    redis_instance: Optional[redis.Redis] = Depends(get_redis_client) # For caching
):
    print(f"Retrieving ticket {id} for user: {current_user.username}")
    cache_key = f"ticket:{id}" # Unique cache key for each ticket ID

    if redis_instance:
        cached_ticket_json = await redis_instance.get(cache_key)
        if cached_ticket_json:
            print(f"Cache Hit: {cache_key}")
            try:
                ticket_data = json.loads(cached_ticket_json)
                return TicketInDB.model_validate(ticket_data)
            except (json.JSONDecodeError, ValueError, KeyError, TypeError) as e:
                print(f"Error parsing cached data for {cache_key}: {e}. Falling back to DB.")

    print(f"Cache Miss: {cache_key}. Fetching from DB.")
    ticket_dict = await crud.retrieve_ticket(id) # Fetch from DB
    
    if not ticket_dict: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket with ID {id} not found") 

    if redis_instance:
        # Cache the fetched dictionary for a specific duration
        await redis_instance.set(cache_key, json.dumps(ticket_dict), ex=30) 

    return ticket_dict 


@app.put("/api/tickets/{id}", response_model=TicketInDB, tags=["Tickets"]) 
async def update_ticket_data(
    id: str, 
    req: UpdateTicketSchema = Body(...),
    current_user: UserInDB = Depends(get_current_user), # Authorization
    redis_instance: Optional[redis.Redis] = Depends(get_redis_client) # For cache invalidation/re-cache
):
    print(f"Updating ticket {id} for user: {current_user.username}")
    req_dict = req.model_dump(exclude_unset=True) 
    if not req_dict:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request body cannot be empty") 
        
    updated = await crud.update_ticket(id, req_dict) # Update in MongoDB
    if updated:
        # Invalidate affected cache keys after update
        # You might need more granular invalidation here depending on specific client-side filter combinations
        await invalidate_all_tickets_cache(redis_instance, search=None, category=None) # Invalidate general list
        await invalidate_all_tickets_cache(redis_instance, search=id, category=None) # Invalidate search-by-ID specific if using generic
        await invalidate_all_tickets_cache(redis_instance, search=None, category=req.category) # Invalidate by category if category was updated
        await invalidate_single_ticket_cache(id, redis_instance) # Invalidate specific ticket

        updated_ticket_dict = await crud.retrieve_ticket(id) # Retrieve fresh data from DB
        if updated_ticket_dict:
            # Re-cache the fresh data for immediate reads
            if redis_instance:
                await redis_instance.set(f"ticket:{id}", json.dumps(updated_ticket_dict), ex=30)
            return updated_ticket_dict 
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket with ID {id} not found or no new data provided")


@app.delete("/api/tickets/{id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Tickets"])
async def delete_ticket_by_id(
    id: str, 
    current_user: UserInDB = Depends(get_current_user), # Authorization
    redis_instance: Optional[redis.Redis] = Depends(get_redis_client) # For cache invalidation
):
    print(f"Deleting ticket {id} for user: {current_user.username}")
    deleted = await crud.delete_ticket(id) # Delete from MongoDB
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket with ID {id} not found") 
    
    # Invalidate affected cache keys after deletion
    # Similar to PUT, need to ensure general and specific caches are cleared.
    await invalidate_all_tickets_cache(redis_instance, search=None, category=None) # General list
    await invalidate_all_tickets_cache(redis_instance, search=id, category=None) # ID-specific filter list
    await invalidate_single_ticket_cache(id, redis_instance) # Specific ticket entry

    return Response(status_code=status.HTTP_204_NO_CONTENT) 