import re
from typing import List, Dict, Any, Tuple
from services.ocr_service import OCRBlock
from utils.phone_parser import extract_phone_numbers
from utils.email_parser import extract_email_addresses
from utils.url_parser import extract_websites_and_socials
from utils.gstin_parser import extract_gstin
from utils.text_cleaner import clean_text, deduplicate_list

DESIGNATION_KEYWORDS = [
    "CEO", "CTO", "CFO", "COO", "FOUNDER", "CO-FOUNDER", "DIRECTOR",
    "MANAGING DIRECTOR", "MANAGER", "ENGINEER", "DEVELOPER", "CONSULTANT",
    "EXECUTIVE", "PROPRIETOR", "PARTNER", "PRESIDENT", "VICE PRESIDENT",
    "GENERAL MANAGER", "SALES MANAGER", "MARKETING MANAGER", "VP", "AVP",
    "HEAD", "LEAD", "ARCHITECT", "CHIEF", "PARTNER", "CHAIRMAN"
]

COMPANY_SUFFIXES = [
    "PVT LTD", "PRIVATE LIMITED", "LTD", "LIMITED", "LLP", "INDUSTRIES",
    "TECHNOLOGIES", "SOLUTIONS", "ENTERPRISES", "CORPORATION", "COMPANY",
    "CO.", "GROUP", "ASSOCIATES", "SERVICES", "LABS", "INFRASTRUCTURE",
    "SYSTEMS", "GLOBAL", "LOGISTICS", "TEXTILES", "FINANCE", "HOLDINGS"
]

INDIAN_CITIES = [
    "CHENNAI", "BENGALURU", "BANGALORE", "HYDERABAD", "MUMBAI", "DELHI",
    "NEW DELHI", "PUNE", "AHMEDABAD", "KOLKATA", "COIMBATORE", "MADURAI",
    "NOIDA", "GURUGRAM", "GURGAON", "KOCHI", "TRIVANDRUM", "SURAT", "JAIPUR"
]

INDIAN_STATES = [
    "TAMIL NADU", "KARNATAKA", "TELANGANA", "MAHARASHTRA", "GUJARAT",
    "KERALA", "DELHI", "ANDHRA PRADESH", "KARNATAKA", "WEST BENGAL", "HARYANA"
]

PINCODE_REGEX = re.compile(r"\b[1-9][0-9]{5}\b")

class FieldExtractionService:
    def extract_fields(self, blocks: List[OCRBlock]) -> Dict[str, Any]:
        lines = [b.text for b in blocks if b.text]
        
        # 1. Extract Phone Numbers & Email Addresses
        phones = extract_phone_numbers(lines)
        emails = extract_email_addresses(lines)
        websites, social_links = extract_websites_and_socials(lines)
        gstin = extract_gstin(lines)
        
        # 2. Identify Designation
        designation = ""
        designation_block_idx = -1
        for idx, block in enumerate(blocks):
            txt_upper = block.text.upper()
            for kw in DESIGNATION_KEYWORDS:
                if kw in txt_upper:
                    designation = clean_text(block.text)
                    designation_block_idx = idx
                    break
            if designation:
                break
                
        # 3. Identify Person Name using Spatial Proximity & Font Height
        full_name = ""
        candidate_names = []
        for idx, block in enumerate(blocks):
            txt = clean_text(block.text)
            txt_upper = txt.upper()
            
            # Skip if text is email, phone, website, gstin, or address
            if "@" in txt or "WWW." in txt_upper or "HTTP" in txt_upper or gstin and gstin in txt:
                continue
            if any(kw in txt_upper for kw in DESIGNATION_KEYWORDS):
                continue
            if any(sf in txt_upper for sf in COMPANY_SUFFIXES):
                continue
            if PINCODE_REGEX.search(txt) or any(c in txt_upper for c in INDIAN_CITIES):
                continue

            # Heuristic: Valid Name contains 2-4 words, alphabetic
            words = txt.split()
            if 1 <= len(words) <= 4 and all(re.match(r"^[A-Za-z.'\s-]+$", w) for w in words):
                # Calculate distance score relative to designation
                dist = abs(idx - designation_block_idx) if designation_block_idx >= 0 else idx
                candidate_names.append((dist, -block.height, txt))
                
        if candidate_names:
            candidate_names.sort(key=lambda x: (x[0], x[1]))
            full_name = candidate_names[0][2]

        # 4. Identify Company Name & Company Type
        company_name = ""
        company_type = ""
        for block in blocks:
            txt_upper = block.text.upper()
            for sf in COMPANY_SUFFIXES:
                if sf in txt_upper:
                    company_name = clean_text(block.text)
                    company_type = sf.title()
                    break
            if company_name:
                break
                
        if not company_name and len(blocks) > 0:
            # Fallback company search if not matched with suffix
            for block in blocks:
                txt = clean_text(block.text)
                txt_upper = txt.upper()
                digits_count = sum(c.isdigit() for c in txt)
                if (
                    txt != full_name
                    and txt != designation
                    and len(txt) > 3
                    and digits_count < (len(txt) * 0.4)
                    and "@" not in txt
                    and "HTTP" not in txt_upper
                    and "PHONE" not in txt_upper
                ):
                    company_name = txt
                    break

        # 5. Identify Address, City, State, Pincode
        address_parts = []
        pincode = ""
        city = ""
        state = ""
        
        for line in lines:
            txt_upper = line.upper()
            pin_match = PINCODE_REGEX.search(line)
            if pin_match:
                pincode = pin_match.group(0)
                
            for c in INDIAN_CITIES:
                if c in txt_upper:
                    city = c.title()
                    break
                    
            for s in INDIAN_STATES:
                if s in txt_upper:
                    state = s.title()
                    break
                    
            # Check for address line indicators
            if any(k in txt_upper for k in ["ROAD", "STREET", "NAGAR", "SALAI", "FLOOR", "BUILDING", "PLOT", "SUITE", "ESTATE", "CHENVAI", "BENGALURU"]):
                address_parts.append(clean_text(line))
                
        combined_address = ", ".join(deduplicate_list(address_parts))
        if not combined_address and (city or state or pincode):
            combined_address = f"{city}, {state} {pincode}".strip(", ")

        return {
            "fullName": full_name,
            "designation": designation,
            "department": "",
            "companyName": company_name,
            "companyType": company_type,
            "phoneNumbers": phones,
            "emailAddresses": emails,
            "websites": websites,
            "address": combined_address,
            "city": city,
            "state": state,
            "country": "India" if (city or state or pincode or gstin) else "",
            "pincode": pincode,
            "gstin": gstin,
            "socialLinks": social_links,
            "services": [],
            "notes": ""
        }
