from typing import List, Dict, Any
import numpy as np

class OCRBlock:
    def __init__(self, text: str, confidence: float, bbox: List[List[float]]):
        self.text = text.strip()
        self.confidence = confidence
        self.bbox = bbox  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
        
        # Calculate bounding box metrics for spatial layout analysis
        xs = [pt[0] for pt in bbox]
        ys = [pt[1] for pt in bbox]
        self.x_min = min(xs)
        self.x_max = max(xs)
        self.y_min = min(ys)
        self.y_max = max(ys)
        self.width = self.x_max - self.x_min
        self.height = self.y_max - self.y_min
        self.center_y = (self.y_min + self.y_max) / 2.0
        self.center_x = (self.x_min + self.x_max) / 2.0

class OCRService:
    def __init__(self):
        self.engine_type = None
        self.ocr_engine = None
        self._init_ocr_engine()

    def _init_ocr_engine(self):
        # 1. Try RapidOCR (Fast, zero C++ DLL dependencies, ONNX PaddleOCR port)
        try:
            from rapidocr_onnxruntime import RapidOCR
            self.ocr_engine = RapidOCR()
            self.engine_type = "rapidocr"
            print("OCR Engine Initialized: RapidOCR (ONNX)")
            return
        except Exception as e:
            print(f"RapidOCR not available: {e}")

        # 2. Try PaddleOCR
        try:
            from paddleocr import PaddleOCR
            self.ocr_engine = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
            self.engine_type = "paddleocr"
            print("OCR Engine Initialized: PaddleOCR")
            return
        except Exception as e:
            print(f"PaddleOCR not available: {e}")

        # 3. Try EasyOCR
        try:
            import easyocr
            self.ocr_engine = easyocr.Reader(['en'], gpu=False)
            self.engine_type = "easyocr"
            print("OCR Engine Initialized: EasyOCR")
            return
        except Exception as e:
            print(f"EasyOCR not available: {e}")

        # 4. Try PyTesseract
        try:
            import pytesseract
            self.ocr_engine = pytesseract
            self.engine_type = "pytesseract"
            print("OCR Engine Initialized: PyTesseract")
            return
        except Exception as e:
            print(f"PyTesseract not available: {e}")

        print("Warning: No OCR engine initialized.")

    def run_ocr(self, img: np.ndarray) -> List[OCRBlock]:
        if not self.ocr_engine:
            self._init_ocr_engine()

        if self.engine_type == "rapidocr":
            return self._run_rapidocr(img)
        elif self.engine_type == "paddleocr":
            return self._run_paddle(img)
        elif self.engine_type == "easyocr":
            return self._run_easyocr(img)
        elif self.engine_type == "pytesseract":
            return self._run_pytesseract(img)

        return []

    def _run_rapidocr(self, img: np.ndarray) -> List[OCRBlock]:
        try:
            results, _ = self.ocr_engine(img)
            blocks = []
            if results:
                for item in results:
                    bbox, text, conf = item
                    if text and text.strip():
                        pts = [[float(pt[0]), float(pt[1])] for pt in bbox]
                        blocks.append(OCRBlock(text=text, confidence=float(conf), bbox=pts))
            return blocks
        except Exception as err:
            print(f"RapidOCR execution error: {err}")
            return []

    def _run_paddle(self, img: np.ndarray) -> List[OCRBlock]:
        try:
            results = self.ocr_engine.ocr(img, cls=True)
            blocks = []
            if results and results[0]:
                for line in results[0]:
                    bbox = line[0]
                    text, conf = line[1]
                    if text and text.strip():
                        blocks.append(OCRBlock(text=text, confidence=float(conf), bbox=bbox))
            return blocks
        except Exception as err:
            print(f"PaddleOCR execution error: {err}")
            return []

    def _run_easyocr(self, img: np.ndarray) -> List[OCRBlock]:
        try:
            results = self.ocr_engine.readtext(img)
            blocks = []
            for item in results:
                bbox_pts, text, conf = item
                if text and text.strip():
                    pts = [[float(pt[0]), float(pt[1])] for pt in bbox_pts]
                    blocks.append(OCRBlock(text=text, confidence=float(conf), bbox=pts))
            return blocks
        except Exception as err:
            print(f"EasyOCR execution error: {err}")
            return []

    def _run_pytesseract(self, img: np.ndarray) -> List[OCRBlock]:
        try:
            import pytesseract
            data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
            blocks = []
            n_boxes = len(data['text'])
            for i in range(n_boxes):
                text = data['text'][i]
                conf = float(data['conf'][i])
                if text and text.strip() and conf > 0:
                    x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
                    bbox = [[float(x), float(y)], [float(x + w), float(y)], [float(x + w), float(y + h)], [float(x), float(y + h)]]
                    blocks.append(OCRBlock(text=text, confidence=conf / 100.0, bbox=bbox))
            return blocks
        except Exception as err:
            print(f"PyTesseract execution error: {err}")
            return []
