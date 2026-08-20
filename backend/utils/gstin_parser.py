import re

GSTIN_REGEX = re.compile(
    r"\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b"
)

def extract_gstin(text_lines: list) -> str:
    for line in text_lines:
        clean_line = line.upper().replace(" ", "").replace("GSTIN:", "").replace("GSTIN", "").replace("GST:", "")
        match = GSTIN_REGEX.search(clean_line)
        if match:
            return match.group(0)
            
    # Secondary check on full concatenated string
    full_text = "".join(text_lines).upper().replace(" ", "")
    match = GSTIN_REGEX.search(full_text)
    if match:
        return match.group(0)
        
    return ""
