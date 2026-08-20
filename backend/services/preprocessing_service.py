import cv2
import numpy as np
from PIL import Image
import io

class ImagePreprocessingService:
    @staticmethod
    def load_image_bytes(image_bytes: bytes) -> np.ndarray:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            # Fallback PIL load
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        return img

    @staticmethod
    def preprocess_image(img: np.ndarray) -> np.ndarray:
        if img is None or img.size == 0:
            raise ValueError("Invalid or empty image provided")

        h, w = img.shape[:2]

        # 1. Resize if image resolution is too low (< 600px width)
        if w < 600 or h < 600:
            scale = 800.0 / max(w, h)
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

        # 2. Convert to Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 3. Contrast enhancement using CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # 4. Mild Denoising
        denoised = cv2.fastNlMeansDenoising(enhanced, h=5)

        return cv2.cvtColor(denoised, cv2.COLOR_GRAY2BGR)
