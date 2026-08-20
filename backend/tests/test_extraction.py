import pytest
from services.ocr_service import OCRBlock
from services.extraction_service import FieldExtractionService
from services.merge_service import MergeService
from services.validation_service import ValidationService
from utils.phone_parser import extract_phone_numbers
from utils.email_parser import extract_email_addresses
from utils.url_parser import extract_websites_and_socials
from utils.gstin_parser import extract_gstin

@pytest.fixture
def extractor():
    return FieldExtractionService()

def test_1_one_phone_one_email(extractor):
    blocks = [
        OCRBlock("Rajesh Kumar", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("Senior Product Manager", 0.98, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("Apex Innovations Pvt Ltd", 0.97, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("+91 98765 43210", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("rajesh.k@apexinnovations.in", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
    ]
    res = extractor.extract_fields(blocks)
    assert res["fullName"] == "Rajesh Kumar"
    assert res["designation"] == "Senior Product Manager"
    assert res["companyName"] == "Apex Innovations Pvt Ltd"
    assert res["phoneNumbers"] == ["+91 98765 43210"]
    assert res["emailAddresses"] == ["rajesh.k@apexinnovations.in"]

def test_2_multiple_phone_numbers(extractor):
    blocks = [
        OCRBlock("Priya Sharma", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("Ph: +91 98111 22334, +91 98222 33445, 044 28341100", 0.98, [[0,0],[1,0],[1,1],[0,1]]),
    ]
    res = extractor.extract_fields(blocks)
    assert len(res["phoneNumbers"]) == 3
    assert "+91 98111 22334" in res["phoneNumbers"]

def test_3_multiple_email_addresses(extractor):
    blocks = [
        OCRBlock("priya@vanguardglobal.com", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("sales@vanguardglobal.com", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("support @ vanguardglobal .com", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
    ]
    res = extractor.extract_fields(blocks)
    assert len(res["emailAddresses"]) == 3
    assert "support@vanguardglobal.com" in res["emailAddresses"]

def test_4_front_plus_back_combined(extractor):
    front_blocks = [
        OCRBlock("Raj Kumar", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("Managing Director", 0.98, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("ABC Technologies", 0.98, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("+91 98765 43210", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
    ]
    back_blocks = [
        OCRBlock("sales@abctech.com", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("https://www.abctech.com", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("Anna Salai, Chennai, Tamil Nadu - 600001", 0.95, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("GSTIN: 33ABCDE1234F1Z5", 0.97, [[0,0],[1,0],[1,1],[0,1]]),
    ]
    front_data = extractor.extract_fields(front_blocks)
    back_data = extractor.extract_fields(back_blocks)
    
    merged = MergeService.merge_front_and_back(front_data, back_data)
    assert merged["fullName"] == "Raj Kumar"
    assert merged["companyName"] == "ABC Technologies"
    assert merged["gstin"] == "33ABCDE1234F1Z5"
    assert "sales@abctech.com" in merged["emailAddresses"]
    assert "https://www.abctech.com" in merged["websites"]

def test_5_missing_fields(extractor):
    blocks = [
        OCRBlock("Amit Patel", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("+91 97234 56789", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
    ]
    res = extractor.extract_fields(blocks)
    assert res["fullName"] == "Amit Patel"
    assert res["emailAddresses"] == []
    
    conf, needs_review = ValidationService.calculate_confidence(res)
    assert needs_review is True

def test_6_gstin_detection():
    text = ["Kaveri Dynamics Pvt Ltd", "GSTIN: 29ABCDE1234F1Z9", "Bengaluru"]
    gstin = extract_gstin(text)
    assert gstin == "29ABCDE1234F1Z9"

def test_7_website_detection():
    text = ["Visit us at www.apexinnovations.in or store.apexinnovations.in"]
    webs, socials = extract_websites_and_socials(text)
    assert "https://www.apexinnovations.in" in webs

def test_8_indian_address(extractor):
    blocks = [
        OCRBlock("Suite 402, Prestige Meridian, M.G. Road", 0.95, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("Bengaluru, Karnataka - 560001", 0.96, [[0,0],[1,0],[1,1],[0,1]]),
    ]
    res = extractor.extract_fields(blocks)
    assert res["city"] == "Bengaluru"
    assert res["state"] == "Karnataka"
    assert res["pincode"] == "560001"

def test_9_duplicate_removal():
    raw_phones = ["+91 98765 43210", "+91 98765 43210", "9876543210"]
    raw_emails = ["raj@abc.com", "raj@abc.com", "RAJ@ABC.COM"]
    phones = extract_phone_numbers(raw_phones)
    emails = extract_email_addresses(raw_emails)
    assert len(emails) == 1
    assert len(phones) <= 2

def test_10_poor_quality_image(extractor):
    blocks = [
        OCRBlock("Vikramaditya", 0.60, [[0,0],[1,0],[1,1],[0,1]]),
    ]
    res = extractor.extract_fields(blocks)
    conf, needs_review = ValidationService.calculate_confidence(res)
    assert needs_review is True

def test_11_international_phone_number():
    text = ["Contact: +1 (415) 555-0199 or +44 20 7946 0912"]
    phones = extract_phone_numbers(text)
    assert len(phones) >= 1

def test_12_company_only_card(extractor):
    blocks = [
        OCRBlock("Southern Star Enterprises", 0.98, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("Industrial Equipment & Spare Parts", 0.95, [[0,0],[1,0],[1,1],[0,1]]),
        OCRBlock("info@southernstar.co.in", 0.99, [[0,0],[1,0],[1,1],[0,1]]),
    ]
    res = extractor.extract_fields(blocks)
    assert res["companyName"] == "Southern Star Enterprises"
    assert res["emailAddresses"] == ["info@southernstar.co.in"]
