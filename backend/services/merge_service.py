from typing import Dict, Any, List
from models.visiting_card import SocialLink
from utils.text_cleaner import deduplicate_list

class MergeService:
    @staticmethod
    def merge_front_and_back(front_data: Dict[str, Any], back_data: Dict[str, Any] = None) -> Dict[str, Any]:
        if not back_data:
            return front_data
            
        # Combine phone numbers without duplicates
        merged_phones = deduplicate_list(front_data.get("phoneNumbers", []) + back_data.get("phoneNumbers", []))
        
        # Combine email addresses without duplicates
        merged_emails = deduplicate_list(front_data.get("emailAddresses", []) + back_data.get("emailAddresses", []))
        
        # Combine websites without duplicates
        merged_websites = deduplicate_list(front_data.get("websites", []) + back_data.get("websites", []))
        
        # Combine social links
        seen_urls = set()
        merged_socials: List[SocialLink] = []
        for s in front_data.get("socialLinks", []) + back_data.get("socialLinks", []):
            if s.url not in seen_urls:
                seen_urls.add(s.url)
                merged_socials.append(s)
                
        # Combine services
        merged_services = deduplicate_list(front_data.get("services", []) + back_data.get("services", []))
        
        # Pick best non-empty text fields (prefer Front for Name/Company, merge Address)
        full_name = front_data.get("fullName") or back_data.get("fullName") or ""
        designation = front_data.get("designation") or back_data.get("designation") or ""
        department = front_data.get("department") or back_data.get("department") or ""
        company_name = front_data.get("companyName") or back_data.get("companyName") or ""
        company_type = front_data.get("companyType") or back_data.get("companyType") or ""
        
        gstin = front_data.get("gstin") or back_data.get("gstin") or ""
        city = front_data.get("city") or back_data.get("city") or ""
        state = front_data.get("state") or back_data.get("state") or ""
        country = front_data.get("country") or back_data.get("country") or "India"
        pincode = front_data.get("pincode") or back_data.get("pincode") or ""
        
        address_front = front_data.get("address", "")
        address_back = back_data.get("address", "")
        merged_address = ", ".join(deduplicate_list([address_front, address_back]))
        
        notes = " | ".join(filter(None, [front_data.get("notes"), back_data.get("notes")]))
        
        return {
            "fullName": full_name,
            "designation": designation,
            "department": department,
            "companyName": company_name,
            "companyType": company_type,
            "phoneNumbers": merged_phones,
            "emailAddresses": merged_emails,
            "websites": merged_websites,
            "address": merged_address,
            "city": city,
            "state": state,
            "country": country,
            "pincode": pincode,
            "gstin": gstin,
            "socialLinks": merged_socials,
            "services": merged_services,
            "notes": notes
        }
