import pytesseract
from PIL import Image
import fitz  # PyMuPDF
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


class OCRService:
    @staticmethod
    def extract_text_from_image(image_path: str) -> Tuple[str, float]:
        """Extract text from image using Tesseract OCR"""
        try:
            image = Image.open(image_path)
            
            # Get OCR data with confidence scores
            ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            
            # Extract text
            text = pytesseract.image_to_string(image)
            
            # Calculate average confidence
            confidences = [int(conf) for conf in ocr_data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return text.strip(), avg_confidence / 100.0  # Convert to 0-1 scale
            
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            return "", 0.0
    
    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> Tuple[str, float]:
        """Extract text from PDF using PyMuPDF"""
        try:
            doc = fitz.open(pdf_path)
            text = ""
            total_confidence = 0
            page_count = 0
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Try to extract text directly first (for text-based PDFs)
                page_text = page.get_text()
                
                if page_text.strip():
                    text += page_text + "\n"
                    total_confidence += 1.0  # Assume high confidence for direct text extraction
                else:
                    # Use OCR for image-based PDFs
                    pix = page.get_pixmap()
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    
                    # Save temporarily and process with OCR
                    import tempfile
                    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                        img.save(temp_file.name)
                        page_text, confidence = OCRService.extract_text_from_image(temp_file.name)
                        text += page_text + "\n"
                        total_confidence += confidence
                
                page_count += 1
            
            doc.close()
            avg_confidence = total_confidence / page_count if page_count > 0 else 0
            
            return text.strip(), avg_confidence
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return "", 0.0
    
    @staticmethod
    def extract_text(file_path: str, mime_type: str) -> Tuple[str, float]:
        """Extract text based on file type"""
        if mime_type.startswith('image/'):
            return OCRService.extract_text_from_image(file_path)
        elif mime_type == 'application/pdf':
            return OCRService.extract_text_from_pdf(file_path)
        else:
            # For text files, just read directly
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                return text, 1.0  # High confidence for direct text files
            except Exception as e:
                logger.error(f"Error reading text file: {str(e)}")
                return "", 0.0
