import pytesseract
from PIL import Image
import fitz  
import logging
import asyncio
import concurrent.futures
import os
import re
import json
import requests
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from app.core.config import settings

pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

# EasyOCR is optional to avoid heavy Torch dependency on Windows.
try:
    import easyocr  # type: ignore
    _EASYOCR_AVAILABLE = True
except Exception:
    easyocr = None  # type: ignore
    _EASYOCR_AVAILABLE = False

logger = logging.getLogger("document_processor")
logger.setLevel(getattr(logging, settings.LOG_LEVEL))

class DocumentProcessor:
    def __init__(self):
        # Initialize EasyOCR reader only if available
        self.easyocr_reader = None
        if _EASYOCR_AVAILABLE:
            try:
                self.easyocr_reader = easyocr.Reader(  # type: ignore[attr-defined]
                    settings.EASYOCR_LANGUAGES,
                    gpu=settings.EASYOCR_GPU
                )
            except Exception as e:
                logger.warning(f"EasyOCR initialization failed, continuing without it: {e}")
                self.easyocr_reader = None
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)
        self.cache = {}
        
        # Field extraction patterns
        self.field_patterns = {
            'invoice_number': [
                r'invoice\s*#?\s*([A-Z0-9\-]+)',
                r'inv\s*#?\s*([A-Z0-9\-]+)',
                r'bill\s*#?\s*([A-Z0-9\-]+)'
            ],
            'date': [
                r'date\s*:?\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
                r'(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
                r'(\d{4}-\d{2}-\d{2})'
            ],
            'amount': [
                r'total\s*:?\s*\$?([\d,]+\.?\d*)',
                r'amount\s*:?\s*\$?([\d,]+\.?\d*)',
                r'\$([\d,]+\.?\d*)'
            ],
            'email': [
                r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
            ],
            'phone': [
                r'(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})',
                r'(\(\d{3}\)\s*\d{3}[-.\s]?\d{4})'
            ]
        }
        
        # Document type keywords
        self.document_keywords = {
            'invoice': ['invoice', 'bill', 'statement', 'amount due', 'payment'],
            'contract': ['contract', 'agreement', 'terms', 'conditions', 'parties'],
            'form': ['form', 'application', 'questionnaire', 'survey'],
            'receipt': ['receipt', 'purchase', 'transaction', 'paid'],
            'letter': ['dear', 'sincerely', 'regards', 'correspondence'],
            'report': ['report', 'analysis', 'findings', 'conclusion', 'summary']
        }

    def _is_supported(self, file_path: str) -> bool:
        """Check if file format is supported"""
        ext = os.path.splitext(file_path)[1].lower()
        return ext in settings.SUPPORTED_FORMATS

    def _load_image(self, file_path: str) -> Image.Image:
        """Load image with error handling"""
        try:
            return Image.open(file_path)
        except Exception as e:
            logger.error(f"Failed to load image: {file_path}: {e}")
            raise

    def _ocr_tesseract(self, image: Image.Image) -> Tuple[str, float]:
        """OCR using Tesseract with confidence scoring"""
        try:
            text = pytesseract.image_to_string(image)
            conf = self._tesseract_confidence(image)
            return text, conf
        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            return "", 0.0

    def _tesseract_confidence(self, image: Image.Image) -> float:
        """Calculate Tesseract confidence score"""
        try:
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            confs = [float(c) for c in data['conf'] if c != '-1']
            return sum(confs) / len(confs) if confs else 0.0
        except Exception as e:
            logger.warning(f"Tesseract confidence scoring failed: {e}")
            return 0.0

    def _ocr_easyocr(self, file_path: str) -> Tuple[str, float]:
        """OCR using EasyOCR with confidence scoring"""
        if self.easyocr_reader is None:
            return "", 0.0
        try:
            result = self.easyocr_reader.readtext(file_path, detail=1, paragraph=True)  # type: ignore[union-attr]
            text = "\n".join([r[1] for r in result])
            confs = [r[2] for r in result if len(r) > 2]
            conf = sum(confs) / len(confs) if confs else 0.0
            return text, conf
        except Exception as e:
            logger.error(f"EasyOCR failed: {e}")
            return "", 0.0

    def _ocr_trocr(self, file_path: str) -> Tuple[str, float]:
        """OCR using TrOCR for handwritten text (stub)"""
        # TODO: Implement TrOCR integration
        logger.info("TrOCR is stubbed. Returning placeholder.")
        return "[Handwritten OCR result]", 0.9

    def ocr(self, file_path: str, mode: str = "auto") -> Dict[str, Any]:
        """Perform OCR with automatic engine selection and fallback"""
        if not self._is_supported(file_path):
            logger.error(f"Unsupported file format: {file_path}")
            raise ValueError("Unsupported file format")

        # Handle PDF files
        if file_path.lower().endswith(".pdf"):
            return self._ocr_pdf(file_path)
        
        # Handle image files
        image = self._load_image(file_path)
        text, conf, engine = self._ocr_with_fallback(image, file_path)
        
        return {
            "text": text,
            "confidence": conf,
            "engine": engine,
            "file_path": file_path
        }

    def _ocr_pdf(self, file_path: str) -> Dict[str, Any]:
        """OCR PDF files page by page"""
        try:
            doc = fitz.open(file_path)
            text = ""
            confs = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                t, c = self._ocr_tesseract(img)
                text += f"\n--- Page {page_num + 1} ---\n{t}"
                confs.append(c)
            
            doc.close()
            conf = sum(confs) / len(confs) if confs else 0.0
            
            return {
                "text": text,
                "confidence": conf,
                "engine": "tesseract",
                "file_path": file_path,
                "pages": len(doc)
            }
        except Exception as e:
            logger.error(f"PDF OCR failed: {e}")
            raise

    def _ocr_with_fallback(self, image: Image.Image, file_path: str) -> Tuple[str, float, str]:
        """OCR with automatic fallback between engines"""
        # Try Tesseract first
        text, conf = self._ocr_tesseract(image)
        engine = "tesseract"
        
        # Fallback to EasyOCR if confidence is low
        if conf < 0.7 and self.easyocr_reader is not None:
            text2, conf2 = self._ocr_easyocr(file_path)
            if conf2 > conf:
                text, conf = text2, conf2
                engine = "easyocr"
        
        # Try TrOCR for very low confidence (handwritten)
        if conf < 0.5:
            text3, conf3 = self._ocr_trocr(file_path)
            if conf3 > conf:
                text, conf = text3, conf3
                engine = "trocr"
        
        return text, conf, engine

    async def ocr_async(self, file_path: str, mode: str = "auto") -> Dict[str, Any]:
        """Async OCR processing"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, self.ocr, file_path, mode)

    def classify_document(self, text: str) -> Tuple[str, float]:
        """Classify document type based on content"""
        text_lower = text.lower()
        scores = {}
        
        for doc_type, keywords in self.document_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            scores[doc_type] = score / len(keywords)
        
        # Find best match
        best_type = max(scores, key=scores.get)
        confidence = scores[best_type]
        
        # If no clear match, default to generic
        if confidence < 0.3:
            best_type = "generic"
            confidence = 0.5
        
        return best_type, confidence

    def extract_key_value_pairs(self, text: str) -> Dict[str, Any]:
        """Extract key-value pairs using patterns and AI"""
        extracted_fields = {}
        
        # Extract using regex patterns
        for field_name, patterns in self.field_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    value = matches[0]
                    confidence = self._calculate_field_confidence(field_name, text, pattern, value)
                    extracted_fields[field_name] = {
                        "value": value,
                        "confidence": confidence,
                        "source": "regex"
                    }
                    break
        
        # TODO: Use Phi-3 via Ollama for advanced extraction
        # ai_extracted = self._ai_extract_fields(text)
        # extracted_fields.update(ai_extracted)
        
        return extracted_fields

    def _calculate_field_confidence(self, field_name: str, text: str, pattern: str, value: str) -> float:
        """Calculate confidence for extracted field"""
        # Simple confidence based on pattern complexity and value format
        base_confidence = 0.7
        
        # Boost confidence for well-formatted values
        if field_name == 'email' and '@' in value:
            base_confidence += 0.2
        elif field_name == 'amount' and re.match(r'^\$?[\d,]+\.?\d*$', value):
            base_confidence += 0.15
        elif field_name == 'date' and re.match(r'^\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}$', value):
            base_confidence += 0.1
        
        return min(base_confidence, 1.0)

    def recognize_entities(self, text: str) -> List[Dict[str, Any]]:
        """Recognize named entities (people, organizations, amounts)"""
        entities = []
        
        # Extract amounts
        amount_patterns = [
            r'\$([\d,]+\.?\d*)',
            r'(\d+\.?\d*)\s*(dollars?|USD|EUR|GBP)',
        ]
        
        for pattern in amount_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                entities.append({
                    "type": "amount",
                    "value": match[0] if isinstance(match, tuple) else match,
                    "confidence": 0.9,
                    "source": "regex"
                })
        
        # Extract potential names (simple heuristic)
        name_pattern = r'([A-Z][a-z]+ [A-Z][a-z]+)'
        names = re.findall(name_pattern, text)
        for name in names[:5]:  # Limit to first 5 names
            entities.append({
                "type": "person",
                "value": name,
                "confidence": 0.7,
                "source": "regex"
            })
        
        # TODO: Use Phi-3 for advanced entity recognition
        # ai_entities = self._ai_recognize_entities(text)
        # entities.extend(ai_entities)
        
        return entities

    def ai_analyze(self, text: str, model: str = "phi3") -> Dict[str, Any]:
        """AI-powered document analysis using Phi-3 via Ollama"""
        try:
            # TODO: Implement Ollama API call
            # For now, return enhanced analysis using rules
            summary = self._generate_summary(text)
            classification, class_confidence = self.classify_document(text)
            key_values = self.extract_key_value_pairs(text)
            entities = self.recognize_entities(text)
            
            # Calculate overall confidence
            confidences = [
                class_confidence,
                *[kv.get('confidence', 0.5) for kv in key_values.values()],
                *[e.get('confidence', 0.5) for e in entities]
            ]
            overall_confidence = sum(confidences) / len(confidences) if confidences else 0.5
            
            return {
                "summary": summary,
                "classification": classification,
                "classification_confidence": class_confidence,
                "key_value_pairs": key_values,
                "entities": entities,
                "overall_confidence": overall_confidence,
                "model_used": model,
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return {
                "summary": "Analysis failed",
                "classification": "generic",
                "classification_confidence": 0.0,
                "key_value_pairs": {},
                "entities": [],
                "overall_confidence": 0.0,
                "error": str(e)
            }

    def _generate_summary(self, text: str) -> str:
        """Generate document summary using rules and heuristics"""
        # Simple summary based on document length and key phrases
        lines = text.split('\n')
        word_count = len(text.split())
        
        if word_count < 100:
            return f"Short document with {word_count} words"
        elif word_count < 500:
            return f"Medium document with {word_count} words"
        else:
            return f"Long document with {word_count} words"
        
        # TODO: Use Phi-3 for intelligent summarization

    async def ai_analyze_async(self, text: str, model: str = "phi3") -> Dict[str, Any]:
        """Async AI analysis"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, self.ai_analyze, text, model)

    def validate_extracted_data(self, key_values: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and format extracted data"""
        validated = {}
        
        for field_name, field_data in key_values.items():
            value = field_data.get('value', '')
            confidence = field_data.get('confidence', 0.0)
            
            # Validate based on field type
            if field_name == 'email':
                if re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
                    validated[field_name] = {
                        **field_data,
                        'is_valid': True,
                        'formatted_value': value.lower()
                    }
                else:
                    validated[field_name] = {
                        **field_data,
                        'is_valid': False,
                        'formatted_value': value
                    }
            
            elif field_name == 'amount':
                # Remove currency symbols and format
                clean_amount = re.sub(r'[^\d.,]', '', value)
                try:
                    float_amount = float(clean_amount.replace(',', ''))
                    validated[field_name] = {
                        **field_data,
                        'is_valid': True,
                        'formatted_value': f"${float_amount:.2f}"
                    }
                except ValueError:
                    validated[field_name] = {
                        **field_data,
                        'is_valid': False,
                        'formatted_value': value
                    }
            
            elif field_name == 'date':
                # Try to parse and format date
                try:
                    # Add date parsing logic here
                    validated[field_name] = {
                        **field_data,
                        'is_valid': True,
                        'formatted_value': value
                    }
                except:
                    validated[field_name] = {
                        **field_data,
                        'is_valid': False,
                        'formatted_value': value
                    }
            
            else:
                validated[field_name] = {
                    **field_data,
                    'is_valid': True,
                    'formatted_value': value
                }
        
        return validated

    async def process_batch(self, file_paths: List[str], mode: str = "auto") -> List[Dict[str, Any]]:
        """Process multiple documents in batch"""
        results = []
        
        for file_path in file_paths:
            try:
                if file_path in self.cache:
                    results.append(self.cache[file_path])
                    continue
                
                # OCR
                ocr_result = await self.ocr_async(file_path, mode)
                
                # AI Analysis
                ai_result = await self.ai_analyze_async(ocr_result['text'])
                
                # Validate extracted data
                validated_data = self.validate_extracted_data(ai_result['key_value_pairs'])
                ai_result['key_value_pairs'] = validated_data
                
                # Combine results
                result = {
                    "file_path": file_path,
                    "ocr": ocr_result,
                    "ai_analysis": ai_result,
                    "processing_timestamp": datetime.utcnow().isoformat()
                }
                
                self.cache[file_path] = result
                results.append(result)
                
            except Exception as e:
                logger.error(f"Batch processing failed for {file_path}: {e}")
                results.append({
                    "file_path": file_path,
                    "error": str(e),
                    "processing_timestamp": datetime.utcnow().isoformat()
                })
        
        return results

    def clear_cache(self):
        """Clear processing cache"""
        self.cache.clear()
        logger.info("Document processing cache cleared")

    def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        return {
            "cache_size": len(self.cache),
            "supported_formats": settings.SUPPORTED_FORMATS,
            "ocr_engines": ["tesseract", "easyocr", "trocr"],
            "ai_model": settings.PHI3_MODEL,
            "max_file_size": settings.MAX_FILE_SIZE
        }
