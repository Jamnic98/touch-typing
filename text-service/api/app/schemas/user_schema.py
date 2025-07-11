from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    user_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr
    hashed_password: str


class UserUpdate(BaseModel):
    user_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None


class UserOut(BaseModel):
    id: UUID
    user_name: str | None
    first_name: str | None
    last_name: str | None
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


class UserRead(BaseModel):
    id: UUID
    user_name: str
    first_name: str
    last_name: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)
