from fastapi import APIRouter, File, UploadFile, HTTPException, status
from models.visiting_card import VisitingCardResponse
from services.preprocessing_service import ImagePreprocessingService
from services.ocr_service import OCRService
from services.extraction_service import FieldExtractionService
from services.merge_service import MergeService
from services.validation_service import ValidationService

router = APIRouter()

ocr_service = OCRService()
extraction_service = FieldExtractionService()

@router.post("/extract-card", response_model=VisitingCardResponse)
async def extract_card(
    front_image: UploadFile = File(...),
    back_image: UploadFile = File(None)
):
    if not front_image or not front_image.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="front_image file is required."
        )

    try:
        # 1. Read Front Image
        front_bytes = await front_image.read()
        front_cv_img = ImagePreprocessingService.load_image_bytes(front_bytes)
        front_preprocessed = ImagePreprocessingService.preprocess_image(front_cv_img)
        
        # Run OCR & Extraction on Front
        front_blocks = ocr_service.run_ocr(front_preprocessed)
        front_extracted = extraction_service.extract_fields(front_blocks)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process front image: {str(e)}"
        )

    # 2. Read Back Image (Optional)
    back_extracted = None
    if back_image and back_image.filename:
        try:
            back_bytes = await back_image.read()
            back_cv_img = ImagePreprocessingService.load_image_bytes(back_bytes)
            back_preprocessed = ImagePreprocessingService.preprocess_image(back_cv_img)
            back_blocks = ocr_service.run_ocr(back_preprocessed)
            back_extracted = extraction_service.extract_fields(back_blocks)
        except Exception as e:
            print(f"Warning: Back image processing encountered an issue: {e}")
            back_extracted = None

    # 3. Merge Front & Back into 1 Record
    merged_data = MergeService.merge_front_and_back(front_extracted, back_extracted)

    # 4. Calculate Confidence & Validation
    confidence, needs_review = ValidationService.calculate_confidence(merged_data)

    # Return structured response matching requirements
    return VisitingCardResponse(
        **merged_data,
        confidence=confidence,
        needsReview=needs_review
    )
