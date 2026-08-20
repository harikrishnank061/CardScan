import re
from typing import List, Tuple
from models.visiting_card import SocialLink
from utils.text_cleaner import deduplicate_list

URL_REGEX = re.compile(
    r"(?:https?://)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[a-zA-Z0-9#_.-]*)?",
    re.IGNORECASE
)

SOCIAL_PLATFORMS = {
    "linkedin": "LinkedIn",
    "instagram": "Instagram",
    "facebook": "Facebook",
    "twitter": "Twitter",
    "x.com": "Twitter",
    "youtube": "YouTube"
}

def extract_websites_and_socials(text_lines: List[str]) -> Tuple[List[str], List[SocialLink]]:
    websites = []
    social_links = []
    
    for line in text_lines:
        # Ignore lines that are emails
        if "@" in line:
            continue
            
        matches = URL_REGEX.findall(line)
        for match in matches:
            url_lower = match.lower().strip()
            
            # Check if it's a social media link
            is_social = False
            for key, platform_name in SOCIAL_PLATFORMS.items():
                if key in url_lower:
                    is_social = True
                    full_url = url_lower if url_lower.startswith("http") else f"https://{url_lower}"
                    social_links.append(SocialLink(platform=platform_name, url=full_url))
                    break
                    
            if not is_social:
                # Add protocol if missing
                full_web = url_lower if url_lower.startswith("http") else f"https://{url_lower}"
                websites.append(full_web)
                
    # Deduplicate social links by platform/url
    unique_socials = []
    seen_socials = set()
    for s in social_links:
        if s.url not in seen_socials:
            seen_socials.add(s.url)
            unique_socials.append(s)
            
    return deduplicate_list(websites), unique_socials
