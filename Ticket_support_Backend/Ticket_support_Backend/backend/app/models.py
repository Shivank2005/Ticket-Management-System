import os

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# backend/app/models.py

from pydantic import BaseModel, Field, BeforeValidator, ConfigDict, EmailStr
from typing import Optional, Annotated
from datetime import datetime
from bson import ObjectId

# Custom type for ObjectId to Pydantic string conversion
PyObjectId = Annotated[str, BeforeValidator(str)]

class TicketSchema(BaseModel):
    title: str = Field(..., min_length=3, max_length=50, description="The title of the ticket")
    description: str = Field(..., min_length=3, max_length=500, description="The detailed description of the issue or feedback")
    category: str = Field(..., description="The category of the ticket, e.g., 'Bug', 'Feedback'")
    status: str = Field(default="Open", description="The current status of the ticket")
    created: datetime = Field(default_factory=datetime.utcnow, description="The UTC timestamp when the ticket was created")
    image_url: Optional[str] = Field(default=None, description="The URL of the uploaded image, if any")

    model_config = ConfigDict(
        json_schema_extra = {
            "example": {
                "title": "Login Button Not Working",
                "description": "Users are reporting that clicking the login button does nothing. No errors in the console.",
                "category": "Bug",
            }
        }
    )

class TicketInDB(TicketSchema):
    id: PyObjectId = Field(default_factory=ObjectId)
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class UpdateTicketSchema(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=50, description="The new title of the ticket")
    description: Optional[str] = Field(None, min_length=3, max_length=500, description="The new description")
    category: Optional[str] = Field(None, description="The new category")
    status: Optional[str] = Field(None, description="The new status, e.g., 'In Progress' or 'Closed'")
    image_url: Optional[str] = Field(None, description="The new image URL (cannot be uploaded via PUT currently)")
    model_config = ConfigDict(
        json_schema_extra = {
            "example": {
                "title": "Updated: Login Button Not Working",
                "status": "In Progress"
            }
        }
    )

class UserInDB(BaseModel):
    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    hashed_password: str
    model_config = ConfigDict(
        json_schema_extra={"example": {"username": "testuser", "email": "test@example.com", "hashed_password": "somehashedpassword"}},
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    model_config = ConfigDict(
        json_schema_extra={"example": {"username": "newuser", "email": "new@example.com", "password": "securepassword123"}}
    )

class UserOut(BaseModel):
    id: PyObjectId = Field(alias="_id", description="User ID")
    username: str
    email: EmailStr
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={"example": {"id": "1a2b3c4d5e6f7a8b9c0d1e2f", "username": "newuser", "email": "new@example.com"}}
    )