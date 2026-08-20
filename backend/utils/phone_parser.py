import re
from typing import List
from utils.text_cleaner import deduplicate_list

PHONE_REGEX = re.compile(
    r"(?:\+?\d{1,3}[-.\s]?)?"                      # Country code e.g. +91 or +1
    r"(?:\(?\d{2,5}\)?[-.\s]?)?"                   # Area code e.g. (044) or (080)
    r"\d{3,5}[-.\s]?\d{3,5}"                       # Number digits e.g. 98765 43210 or 2834-1100
)

# Indian mobile regex (10-digit starting 6-9)
INDIAN_MOBILE_REGEX = re.compile(
    r"(?:\+91[\s-]*)?(?:0[\s-]*)?[6-9]\d{4}[\s-]*\d{5}"
)

def extract_phone_numbers(text_lines: List[str]) -> List[str]:
    phones: List[str] = []

    for line in text_lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        upper_line = line_clean.upper()
        if "GSTIN" in upper_line or "PINCODE" in upper_line:
            continue

        # Match phone regex patterns
        matches = PHONE_REGEX.findall(line_clean)
        for match in matches:
            digits_only = re.sub(r"\D", "", match)
            if 8 <= len(digits_only) <= 13:
                if len(digits_only) == 6 or len(digits_only) == 15:
                    continue  # Skip 6-digit PIN or 15-char GSTIN
                formatted = match.strip(" |,-:•")
                if formatted and not any(digits_only == re.sub(r"\D", "", p) for p in phones):
                    phones.append(formatted)

    return deduplicate_list(phones)
