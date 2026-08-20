import re
from typing import List, TypeVar

T = TypeVar("T")

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Strip non-printable ASCII/Unicode control characters
    text = re.sub(r"[\x00-\x1F\x7F]", " ", text)
    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

def deduplicate_list(items: List[str]) -> List[str]:
    seen = set()
    result = []
    for item in items:
        cleaned = clean_text(item)
        if cleaned and cleaned.lower() not in seen:
            seen.add(cleaned.lower())
            result.append(cleaned)
    return result
