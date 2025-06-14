from typing import Optional

import strawberry
from pydantic import BaseModel, EmailStr, ConfigDict


@strawberry.type
class UserType:
    id: int
    user_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str


class UserCreate(BaseModel):
    user_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr


class UserUpdate(BaseModel):
    user_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None


class UserOut(BaseModel):
    id: int
    user_name: str | None
    first_name: str | None
    last_name: str | None
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


class UserRead(BaseModel):
    id: int
    user_name: str
    first_name: str
    last_name: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)
