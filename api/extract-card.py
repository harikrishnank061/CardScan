import json
import re
import base64
import urllib.request
import urllib.parse
from io import BytesIO
from http.server import BaseHTTPRequestHandler

# Regex Patterns for Parsing
DESIGNATION_KEYWORDS = [
    "CEO", "CTO", "CFO", "COO", "FOUNDER", "CO-FOUNDER", "DIRECTOR",
    "MANAGING DIRECTOR", "MANAGER", "ENGINEER", "DEVELOPER", "CONSULTANT",
    "EXECUTIVE", "PROPRIETOR", "PARTNER", "PRESIDENT", "VICE PRESIDENT",
    "GENERAL MANAGER", "SALES MANAGER", "MARKETING MANAGER", "VP", "AVP",
    "HEAD", "LEAD", "ARCHITECT", "CHIEF", "CHAIRMAN"
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

PINCODE_REGEX = re.compile(r"\b[1-9][0-9]{5}\b")
PHONE_REGEX = re.compile(r"(?:\+91[\s-]?)?[6-9]\d{9}\b")
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
URL_REGEX = re.compile(r"(?:https?://)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?")
GSTIN_REGEX = re.compile(r"\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b")

def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()

def parse_card_lines(lines):
    full_text = "\n".join(lines)
    
    # 1. Extract Emails
    emails = list(set(EMAIL_REGEX.findall(full_text)))
    
    # 2. Extract Phones
    phones = list(set(PHONE_REGEX.findall(full_text)))
    
    # 3. Extract Websites
    raw_urls = URL_REGEX.findall(full_text)
    websites = [u for u in raw_urls if not any(e in u for e in emails)]
    
    # 4. Extract GSTIN
    gstin_match = GSTIN_REGEX.search(full_text)
    gstin = gstin_match.group(0) if gstin_match else ""
    
    # 5. Extract Designation
    designation = ""
    for line in lines:
        upper_line = line.upper()
        for kw in DESIGNATION_KEYWORDS:
            if kw in upper_line:
                designation = clean_text(line)
                break
        if designation:
            break
            
    # 6. Extract Company Name
    company_name = ""
    company_type = ""
    for line in lines:
        upper_line = line.upper()
        for sf in COMPANY_SUFFIXES:
            if sf in upper_line:
                company_name = clean_text(line)
                company_type = sf.title()
                break
        if company_name:
            break

    # 7. Extract Name
    full_name = ""
    for line in lines:
        txt = clean_text(line)
        upper = txt.upper()
        if "@" in txt or "WWW." in upper or "HTTP" in upper or (gstin and gstin in txt):
            continue
        if any(kw in upper for kw in DESIGNATION_KEYWORDS):
            continue
        if any(sf in upper for sf in COMPANY_SUFFIXES):
            continue
        if PINCODE_REGEX.search(txt) or any(c in upper for c in INDIAN_CITIES):
            continue
        words = txt.split()
        if 1 <= len(words) <= 4 and all(re.match(r"^[A-Za-z.'\s-]+$", w) for w in words):
            full_name = txt
            break

    # 8. Address
    address_parts = []
    for line in lines:
        upper = line.upper()
        if PINCODE_REGEX.search(line) or any(c in upper for c in INDIAN_CITIES):
            address_parts.append(clean_text(line))
    address = ", ".join(address_parts)

    return {
        "full_name": full_name,
        "company_name": company_name,
        "company_type": company_type,
        "designation": designation,
        "phone_numbers": phones,
        "email_addresses": emails,
        "websites": websites,
        "social_links": [],
        "gstin": gstin,
        "address": address,
        "raw_text": full_text
    }

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, bypass-tunnel-reminder')
        self.end_headers()

    def do_POST(self):
        try:
            content_type = self.headers.get('Content-Type', '')
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)

            b64_str = ""
            if content_type.startswith('application/json'):
                data = json.loads(body.decode('utf-8'))
                raw_b64 = data.get('front_image', '') or data.get('image', '')
                if raw_b64.startswith('data:'):
                    b64_str = raw_b64
                else:
                    b64_str = f"data:image/jpeg;base64,{raw_b64}"
            else:
                img_bytes = b""
                if b"\r\n\r\n" in body:
                    parts = body.split(b"\r\n\r\n")
                    for p in parts[1:]:
                        if b"--" in p:
                            sub_content = p.split(b"\r\n--")[0]
                            if len(sub_content) > 100:
                                img_bytes = sub_content
                                break
                        elif len(p) > 100:
                            img_bytes = p
                            break
                if not img_bytes:
                    img_bytes = body

                encoded = base64.b64encode(img_bytes).decode('utf-8')
                b64_str = f"data:image/jpeg;base64,{encoded}"

            payload = urllib.parse.urlencode({
                'apikey': 'helloworld',
                'base64Image': b64_str,
                'language': 'eng',
                'isOverlayRequired': 'false',
                'detectOrientation': 'true',
                'scale': 'true'
            }).encode('utf-8')

            req = urllib.request.Request("https://api.ocr.space/parse/image", data=payload)
            req.add_header('Content-Type', 'application/x-www-form-urlencoded')

            parsed_text = ""
            try:
                with urllib.request.urlopen(req, timeout=12) as resp:
                    result_data = json.loads(resp.read().decode('utf-8'))
                    if "ParsedResults" in result_data and len(result_data["ParsedResults"]) > 0:
                        parsed_text = result_data["ParsedResults"][0].get("ParsedText", "")
            except Exception:
                parsed_text = ""

            lines = [l.strip() for l in parsed_text.splitlines() if l.strip()]
            extracted = parse_card_lines(lines)

            response_bytes = json.dumps(extracted).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(response_bytes)))
            self.end_headers()
            self.wfile.write(response_bytes)

        except Exception as e:
            err_res = json.dumps({"error": str(e)}).encode('utf-8')
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(err_res)

