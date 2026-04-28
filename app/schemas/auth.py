from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field

class Token(BaseModel):
    access_token: str = Field(..., description="JWT Access Token used for authenticated requests")
    refresh_token: str = Field(..., description="Opaque refresh token stored in HttpOnly cookie and also returned here")
    token_type: str = Field("bearer", description="Type of the token, usually 'bearer'")

class TokenPayload(BaseModel):
    sub: Optional[str] = Field(None, description="User ID (Subject)")
    type: Optional[str] = Field(None, description="Token type ('access' or 'refresh')")
    jti: Optional[str] = Field(None, description="Unique identifier for the token (used for blacklisting)")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "afiliado@mindware.ao"}, description="Account email address")
    password: str = Field(..., json_schema_extra={"example": "********"}, description="Account password")

class UserRegister(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "novo.afiliado@mindware.ao"})
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    nome_completo: str = Field(..., json_schema_extra={"example": "João da Silva"}, description="Full legal name of the affiliate")
    telefone: str = Field(..., json_schema_extra={"example": "+244 923 000 000"}, description="Contact phone number")
    conta_bancaria: str = Field(..., description="IBAN or account number for payments")
    banco: str = Field(..., json_schema_extra={"example": "BFA"}, description="Bank name")

class Msg(BaseModel):
    msg: str = Field(..., description="Operation result message")
