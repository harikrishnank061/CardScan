from typing import List, Optional, Literal
from pydantic import BaseModel, Field

ConfidenceLevel = Literal["high", "medium", "low"]

class SocialLink(BaseModel):
    platform: str
    url: str

class ConfidenceDict(BaseModel):
    fullName: ConfidenceLevel = "high"
    companyName: ConfidenceLevel = "high"
    phoneNumbers: ConfidenceLevel = "high"
    emailAddresses: ConfidenceLevel = "high"
    address: ConfidenceLevel = "medium"

class VisitingCardResponse(BaseModel):
    fullName: Optional[str] = ""
    designation: Optional[str] = ""
    department: Optional[str] = ""
    companyName: Optional[str] = ""
    companyType: Optional[str] = ""
    
    phoneNumbers: List[str] = Field(default_factory=list)
    emailAddresses: List[str] = Field(default_factory=list)
    websites: List[str] = Field(default_factory=list)
    
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    country: Optional[str] = "India"
    pincode: Optional[str] = ""
    gstin: Optional[str] = ""
    
    socialLinks: List[SocialLink] = Field(default_factory=list)
    services: List[str] = Field(default_factory=list)
    notes: Optional[str] = ""
    
    confidence: ConfidenceDict = Field(default_factory=ConfidenceDict)
    needsReview: bool = False
