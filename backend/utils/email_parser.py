import re
from typing import List
from utils.text_cleaner import deduplicate_list

EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9._%+-]+(?:\s*@\s*|\s*\[at\]\s*)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE
)

def extract_email_addresses(text_lines: List[str]) -> List[str]:
    emails = []
    
    for line in text_lines:
        # Pre-clean OCR space glitches around @ or dots inside potential email tokens
        line_fixed = re.sub(r"(\w+)\s*@\s*(\w+)", r"\1@\2", line)
        line_fixed = re.sub(r"(\w+)\s*\[at\]\s*(\w+)", r"\1@\2", line_fixed, flags=re.IGNORECASE)
        line_fixed = re.sub(r"(\w+)\s*\.\s*(com|in|co|net|org|io|tech|ai|edu|gov)", r"\1.\2", line_fixed, flags=re.IGNORECASE)
        
        matches = EMAIL_REGEX.findall(line_fixed)
        for match in matches:
            clean_email = match.replace(" ", "").replace("[at]", "@").replace("[AT]", "@").lower()
            emails.append(clean_email)
            
    return deduplicate_list(emails)
