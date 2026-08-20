from typing import Dict, Any, Tuple
from models.visiting_card import ConfidenceDict, ConfidenceLevel

class ValidationService:
    @staticmethod
    def calculate_confidence(data: Dict[str, Any]) -> Tuple[ConfidenceDict, bool]:
        full_name = data.get("fullName", "")
        company = data.get("companyName", "")
        phones = data.get("phoneNumbers", [])
        emails = data.get("emailAddresses", [])
        address = data.get("address", "")
        
        name_conf: ConfidenceLevel = "high" if len(full_name.split()) >= 2 else ("medium" if full_name else "low")
        company_conf: ConfidenceLevel = "high" if len(company) > 3 else ("medium" if company else "low")
        phone_conf: ConfidenceLevel = "high" if len(phones) >= 1 else "low"
        email_conf: ConfidenceLevel = "high" if len(emails) >= 1 else "medium"
        address_conf: ConfidenceLevel = "high" if len(address) > 15 else ("medium" if address else "low")
        
        confidence = ConfidenceDict(
            fullName=name_conf,
            companyName=company_conf,
            phoneNumbers=phone_conf,
            emailAddresses=email_conf,
            address=address_conf,
        )
        
        # If crucial fields like Name, Company, or Phone are missing or low confidence, mark needsReview
        needs_review = (
            name_conf == "low" or
            company_conf == "low" or
            phone_conf == "low" or
            not full_name
        )
        
        return confidence, needs_review
