#app/crud.py

from bson.objectid import ObjectId
from .dependencies import ticket_collection, ticket_helper, user_collection 
from fastapi.encoders import jsonable_encoder
from typing import List, Dict, Optional 
import logging

logger = logging.getLogger(__name__)

async def retrieve_tickets(search: Optional[str] = None, category: Optional[str] = None) -> List[Dict]:
    """Retrieves tickets from MongoDB with optional server-side search and category filtering."""
    query = {}
    
    if search:
        
        search_criteria = []
        
        
        if ObjectId.is_valid(search):
            search_criteria.append({"_id": ObjectId(search)})
        
        search_criteria.append({"title": {"$regex": search, "$options": "i"}})  #regex perform regular expression matching
        search_criteria.append({"description": {"$regex": search, "$options": "i"}})
        
        
        query["$or"] = search_criteria
            
    if category and category != "All Categories": 
        query["category"] = category
        
    tickets = []
    
    async for ticket in ticket_collection.find(query):
        tickets.append(ticket_helper(ticket)) 
    return tickets


async def add_ticket(ticket_data: dict) -> dict: 
    """Inserts a new ticket document into the MongoDB ticket_collection."""
    logger.info(f"Adding ticket: {ticket_data}")
    result = await ticket_collection.insert_one(jsonable_encoder(ticket_data))
    
    
    new_ticket = await ticket_collection.find_one({"_id": result.inserted_id})
    return ticket_helper(new_ticket) 


async def retrieve_ticket(id: str) -> Optional[Dict]:
    """Retrieves a single ticket document by its ObjectId."""
    
    if not ObjectId.is_valid(id):
        return None 

    ticket = await ticket_collection.find_one({"_id": ObjectId(id)})
    if ticket:
        return ticket_helper(ticket) 
    return None 


async def update_ticket(id: str, data: dict) -> bool:
    
    if len(data) < 1: 
        return False
    
    if not ObjectId.is_valid(id): 
        return False
        
    existing_ticket = await ticket_collection.find_one({"_id": ObjectId(id)})
    if existing_ticket:
        
        updated_result = await ticket_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": jsonable_encoder(data)}
        )
        return updated_result.modified_count > 0 
    return False 


async def delete_ticket(id: str) -> bool:
    """Deletes a ticket document from the MongoDB ticket_collection by its ObjectId."""
    if not ObjectId.is_valid(id):
        return False 
        
    ticket = await ticket_collection.find_one({"_id": ObjectId(id)})
    if ticket:
        deleted_result = await ticket_collection.delete_one({"_id": ObjectId(id)})
        return deleted_result.deleted_count > 0 
    return False 