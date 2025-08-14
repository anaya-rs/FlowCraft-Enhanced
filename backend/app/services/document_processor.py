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
from app.services.ai_service import AIService

pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH

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
        # Initialize AI service
        self.ai_service = AIService()
        
        # Initialize EasyOCR reader only if available
        self.easyocr_reader = None
        if _EASYOCR_AVAILABLE:
            try:
                # Ensure languages is a list
                languages = settings.EASYOCR_LANGUAGES
                if isinstance(languages, str):
                    languages = [languages]
                
                self.easyocr_reader = easyocr.Reader(  # type: ignore[attr-defined]
                    languages,
                    gpu=False
                )
                logger.info("EasyOCR initialized successfully")
            except Exception as e:
                logger.warning(f"EasyOCR initialization failed, continuing without it: {e}")
                self.easyocr_reader = None
        else:
            logger.info("EasyOCR not available, using Tesseract only")
        
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
        logger.info(f"Checking if file is supported: {file_path}")
        ext = os.path.splitext(file_path)[1].lower()
        logger.info(f"File extension: '{ext}'")
        
        # Use the computed property from settings
        supported_formats = settings.SUPPORTED_FORMATS_LIST
        logger.info(f"Supported formats from config: {supported_formats}")
        
        # Remove leading dots from supported formats for comparison
        supported_formats = [fmt.lstrip('.') for fmt in supported_formats]
        logger.info(f"Supported formats after cleanup: {supported_formats}")
        
        # Clean up the extension for comparison
        clean_ext = ext.lstrip('.')
        logger.info(f"Clean extension: '{clean_ext}'")
        
        is_supported = clean_ext in supported_formats
        logger.info(f"File {file_path} has extension '{clean_ext}', supported: {is_supported}")
        return is_supported

    def _load_image(self, file_path: str) -> Image.Image:
        """Load image with error handling"""
        try:
            return Image.open(file_path)
        except Exception as e:
            logger.error(f"Failed to load image: {file_path}: {e}")
            raise

    def _ocr_tesseract(self, image: Image.Image) -> Tuple[str, float]:
        """OCR using Tesseract with optimized configuration"""
        try:
            # Use optimized Tesseract configuration
            custom_config = r'--oem 3 --psm 6'
            text = pytesseract.image_to_string(image, config=custom_config)
            conf = self._tesseract_confidence(image)
            logger.info(f"Tesseract OCR extracted {len(text)} characters with confidence {conf:.2f}")
            return text, conf
        except pytesseract.TesseractNotFoundError as e:
            logger.error(f"Tesseract not found. Please install Tesseract OCR: {e}")
            return "[Tesseract OCR not installed - please install Tesseract to extract text from images]", 0.0
        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            return f"[OCR Error: {str(e)}]", 0.0

    def _tesseract_confidence(self, image: Image.Image) -> float:
        """Calculate Tesseract confidence score"""
        try:
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            confs = [float(c) for c in data['conf'] if c != '-1']
            return sum(confs) / len(confs) if confs else 0.0
        except Exception as e:
            logger.warning(f"Tesseract confidence scoring failed: {e}")
            return 0.0

    def _preprocess_image_for_ocr(self, image: Image.Image) -> Image.Image:
        """Apply image preprocessing to improve OCR accuracy"""
        try:
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if image is too small
            min_width = 1200
            if image.width < min_width:
                scale_factor = min_width / image.width
                new_width = int(image.width * scale_factor)
                new_height = int(image.height * scale_factor)
                image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            return image
        except Exception as e:
            logger.warning(f"Image preprocessing failed: {e}")
            return image

    def _ocr_easyocr(self, file_path: str) -> Tuple[str, float]:
        """OCR using EasyOCR with confidence scoring"""
        if self.easyocr_reader is None:
            logger.warning("EasyOCR reader not available")
            return "", 0.0
        
        try:
            # Read text with detailed results
            result = self.easyocr_reader.readtext(file_path, detail=1, paragraph=True)
            
            if not result:
                logger.warning("EasyOCR returned no text")
                return "", 0.0
            
            # Extract text and confidence scores
            text_parts = []
            confidences = []
            
            for r in result:
                if len(r) >= 3:  # Ensure we have text and confidence
                    text_parts.append(str(r[1]))
                    confidences.append(float(r[2]))
            
            if not text_parts:
                logger.warning("EasyOCR returned no valid text")
                return "", 0.0
            
            # Combine text and calculate average confidence
            text = "\n".join(text_parts)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            logger.info(f"EasyOCR extracted {len(text)} characters with confidence {avg_confidence:.2f}")
            return text, avg_confidence
            
        except Exception as e:
            logger.error(f"EasyOCR processing failed: {e}")
            return "", 0.0

    def ocr_text(self, file_path: str, mode: str = "auto") -> str:
        """Simple OCR text extraction"""
        result = self.ocr(file_path, mode)
        return result.get("text", "")

    def ocr(self, file_path: str, mode: str = "auto") -> Dict[str, Any]:
        """Perform OCR with automatic engine selection"""
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
            page_count = len(doc)
            engine = "tesseract"
            
            logger.info(f"Processing PDF with {page_count} pages")
            
            # Limit pages for performance (first 10 pages max)
            max_pages = min(page_count, 10)
            if page_count > 10:
                logger.info(f"PDF has {page_count} pages, processing first {max_pages} pages only")
            
            # Process each page
            for page_num in range(max_pages):
                page = doc[page_num]
                logger.info(f"Processing page {page_num + 1}")
                
                try:
                    # First try to extract text directly (for text-based PDFs)
                    direct_text = page.get_text()
                    if direct_text.strip() and len(direct_text.strip()) > 50:
                        # Good text-based PDF
                        text += f"\n--- Page {page_num + 1} ---\n{direct_text}"
                        confs.append(1.0)  # High confidence for direct text
                        engine = "direct_extraction"
                        logger.info(f"Page {page_num + 1}: Direct text extraction successful")
                        continue
                except Exception as e:
                    logger.warning(f"Page {page_num + 1}: Direct text extraction failed: {e}")
                
                # Fall back to OCR for image-based PDFs
                try:
                    # Use moderate resolution for performance
                    mat = fitz.Matrix(1.5, 1.5)  # 1.5x zoom for balance of quality/speed
                    pix = page.get_pixmap(matrix=mat, alpha=False)
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    
                    # Apply image preprocessing
                    img = self._preprocess_image_for_ocr(img)
                    
                    # Try OCR
                    page_text, page_conf = self._ocr_tesseract(img)
                    
                    if page_text and not page_text.startswith("["):  # Valid OCR result
                        text += f"\n--- Page {page_num + 1} ---\n{page_text}"
                        confs.append(page_conf)
                        engine = "tesseract"
                        logger.info(f"Page {page_num + 1}: OCR successful, confidence: {page_conf:.2f}")
                    else:
                        # OCR failed, add placeholder
                        text += f"\n--- Page {page_num + 1} ---\n[Page could not be processed]"
                        confs.append(0.0)
                        logger.warning(f"Page {page_num + 1}: OCR failed or returned error")
                        
                except Exception as e:
                    logger.error(f"Page {page_num + 1}: Complete processing failed: {e}")
                    text += f"\n--- Page {page_num + 1} ---\n[Error processing page: {str(e)}]"
                    confs.append(0.0)
            
            doc.close()
            
            # Calculate overall confidence
            conf = sum(confs) / len(confs) if confs else 0.0
            
            logger.info(f"PDF OCR completed. Overall confidence: {conf:.2f}, Engine: {engine}")
            
            # Ensure we have some text
            if not text.strip():
                text = "[No text could be extracted from this PDF]"
                conf = 0.0
            
            return {
                "text": text,
                "confidence": conf,
                "engine": engine,
                "file_path": file_path,
                "pages": max_pages,
                "total_pages": page_count
            }
        except Exception as e:
            logger.error(f"PDF OCR failed: {e}")
            # Return fallback result instead of raising
            return {
                "text": f"[PDF processing failed: {str(e)}]",
                "confidence": 0.0,
                "engine": "error",
                "file_path": file_path,
                "pages": 0,
                "error": str(e)
            }

    def _ocr_with_fallback(self, image: Image.Image, file_path: str) -> Tuple[str, float, str]:
        """OCR with automatic fallback between engines"""
        engine = "tesseract"
        text, conf = "", 0.0
        
        # Try EasyOCR first if available
        if self.easyocr_reader is not None:
            try:
                text, conf = self._ocr_easyocr(file_path)
                if conf > 0.5:  # Acceptable confidence threshold
                    engine = "easyocr"
                    logger.info(f"EasyOCR successful with confidence {conf:.2f}")
                    return text, conf, engine
            except Exception as e:
                logger.warning(f"EasyOCR failed, falling back to Tesseract: {e}")
        
        # Fallback to Tesseract
        try:
            text, conf = self._ocr_tesseract(image)
            engine = "tesseract"
            logger.info(f"Tesseract OCR with confidence {conf:.2f}")
        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            text, conf = f"OCR failed: {str(e)}", 0.0
        
        return text, conf, engine

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
        """Extract key-value pairs from text using pattern matching"""
        extracted = {}
        
        for field_name, patterns in self.field_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    # Take the first match
                    value = matches[0]
                    confidence = self._calculate_field_confidence(field_name, text, pattern, value)
                    extracted[field_name] = {
                        "value": value,
                        "confidence": confidence,
                        "source": "regex"
                    }
                    break  # Found a match for this field, move to next
        
        return extracted

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract named entities from text"""
        return self.recognize_entities(text)

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
        
        return entities

    def ai_analyze(self, text: str, model: str = "phi3") -> Dict[str, Any]:
        """AI-powered document analysis using Phi-3 via Ollama (with fallback)"""
        try:
            # Always do local processing first (reliable fallback)
            classification, class_confidence = self.classify_document(text)
            key_values = self.extract_key_value_pairs(text)
            entities = self.recognize_entities(text)
            
            # Try AI service (may fail if Ollama not running)
            analysis = None
            try:
                analysis = self.ai_service.analyze_document(text)
                logger.info("AI service analysis successful")
            except Exception as ai_error:
                logger.warning(f"AI service unavailable, using local analysis only: {ai_error}")
            
            # Merge AI and local results if AI worked
            if analysis and "document_type" in analysis:
                classification = analysis["document_type"]
                class_confidence = analysis.get("confidence", class_confidence)
            
            # Calculate overall confidence
            confidences = [
                class_confidence,
                *[kv.get('confidence', 0.5) for kv in key_values.values()],
                *[e.get('confidence', 0.5) for e in entities]
            ]
            overall_confidence = sum(confidences) / len(confidences) if confidences else 0.5
            
            # Generate summary
            summary = "Document processed successfully"
            if analysis and analysis.get("summary"):
                summary = analysis["summary"]
            else:
                # Enhanced intelligent summary generation based on document type
                word_count = len(text.split())
                char_count = len(text)
                
                # Extract key insights based on document type
                key_insights = []
                
                # Document-specific analysis
                if classification.lower() in ['contract', 'agreement', 'lease']:
                    # Extract parties, amounts, dates, key terms
                    parties = self._extract_parties(text)
                    amounts = self._extract_amounts(text)
                    dates = self._extract_dates(text)
                    key_terms = self._extract_contract_terms(text)
                    
                    if parties:
                        key_insights.append(f"Parties: {', '.join(parties[:3])}")
                    if amounts:
                        key_insights.append(f"Key amounts: {', '.join(amounts[:3])}")
                    if dates:
                        key_insights.append(f"Important dates: {', '.join(dates[:3])}")
                    if key_terms:
                        key_insights.append(f"Key terms: {', '.join(key_terms[:3])}")
                        
                elif classification.lower() in ['invoice', 'bill', 'receipt']:
                    # Extract vendor, amounts, due dates, line items
                    vendor = self._extract_vendor(text)
                    amounts = self._extract_amounts(text)
                    due_dates = self._extract_due_dates(text)
                    line_items = self._extract_line_items(text)
                    
                    if vendor:
                        key_insights.append(f"Vendor: {vendor}")
                    if amounts:
                        key_insights.append(f"Total amount: {amounts[0] if amounts else 'Not specified'}")
                    if due_dates:
                        key_insights.append(f"Due date: {due_dates[0] if due_dates else 'Not specified'}")
                    if line_items:
                        key_insights.append(f"Items: {len(line_items)} line items")
                        
                elif classification.lower() in ['report', 'analysis', 'study']:
                    # Extract authors, findings, conclusions, dates
                    authors = self._extract_authors(text)
                    findings = self._extract_findings(text)
                    conclusions = self._extract_conclusions(text)
                    dates = self._extract_dates(text)
                    
                    if authors:
                        key_insights.append(f"Authors: {', '.join(authors[:2])}")
                    if findings:
                        key_insights.append(f"Key findings: {len(findings)} identified")
                    if conclusions:
                        key_insights.append(f"Conclusions: {len(conclusions)} main points")
                    if dates:
                        key_insights.append(f"Report date: {dates[0] if dates else 'Not specified'}")
                        
                elif classification.lower() in ['resume', 'cv', 'profile']:
                    # Extract name, skills, experience, education
                    name = self._extract_name(text)
                    skills = self._extract_skills(text)
                    experience = self._extract_experience(text)
                    education = self._extract_education(text)
                    
                    if name:
                        key_insights.append(f"Name: {name}")
                    if skills:
                        key_insights.append(f"Skills: {len(skills)} identified")
                    if experience:
                        key_insights.append(f"Experience: {len(experience)} positions")
                    if education:
                        key_insights.append(f"Education: {len(education)} institutions")
                
                # General insights for all documents
                if key_values:
                    key_insights.append(f"Key fields: {', '.join(list(key_values.keys())[:3])}")
                
                if entities:
                    entity_types = {}
                    for entity in entities:
                        entity_type = entity.get('type', 'unknown')
                        if entity_type not in entity_types:
                            entity_types[entity_type] = []
                        entity_types[entity_type].append(entity.get('value', ''))
                    
                    entity_summary = []
                    for entity_type, values in entity_types.items():
                        if values:
                            entity_summary.append(f"{entity_type.title()}: {', '.join(values[:2])}")
                    
                    if entity_summary:
                        key_insights.append(f"Entities: {'; '.join(entity_summary)}")
                
                # Document complexity assessment
                complexity = "simple"
                if word_count > 1000:
                    complexity = "complex"
                elif word_count > 500:
                    complexity = "moderate"
                
                # Generate intelligent summary
                summary_parts = [
                    f"📄 {word_count} words ({char_count} characters)",
                    f"📋 Type: {classification.title()} (confidence: {class_confidence:.1%})",
                    f"📊 Complexity: {complexity}"
                ]
                
                if key_insights:
                    summary_parts.extend(key_insights)
                
                summary = " | ".join(summary_parts)
            
            return {
                "summary": summary,
                "classification": classification,
                "classification_confidence": class_confidence,
                "key_value_pairs": key_values,
                "entities": entities,
                "overall_confidence": overall_confidence,
                "model_used": "local_fallback" if not analysis else model,
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "ai_analysis": analysis,
                "ai_service_available": analysis is not None
            }
        except Exception as e:
            logger.error(f"Complete analysis failed: {e}")
            # Return minimal fallback result
            return {
                "summary": f"Basic analysis completed. Error: {str(e)}",
                "classification": "generic",
                "classification_confidence": 0.3,
                "key_value_pairs": {},
                "entities": [],
                "overall_confidence": 0.3,
                "model_used": "error_fallback",
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
                "ai_service_available": False
            }

    async def ocr_async(self, file_path: str, mode: str = "auto") -> Dict[str, Any]:
        """Async OCR processing"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, self.ocr, file_path, mode)

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
            "ocr_engines": ["tesseract", "easyocr"],
            "ai_model": settings.OLLAMA_MODEL,
            "max_file_size": settings.MAX_FILE_SIZE
        }

    def _extract_parties(self, text: str) -> List[str]:
        """Extract party names from contracts and agreements"""
        # Look for common party indicators
        party_patterns = [
            r'between\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'(\w+(?:\s+&\s+\w+)*\s+(?:LLC|Inc|Corp|Ltd|Company|Corporation))',
            r'(\w+(?:\s+\w+)*\s+(?:Associates|Partners|Group))',
        ]
        
        parties = []
        for pattern in party_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            parties.extend(matches)
        
        return list(set(parties))[:5]  # Return unique parties, max 5

    def _extract_amounts(self, text: str) -> List[str]:
        """Extract monetary amounts from text"""
        amount_patterns = [
            r'\$([\d,]+\.?\d*)',
            r'(\d+\.?\d*)\s*(dollars?|USD|EUR|GBP)',
            r'(\d+\.?\d*)\s*(?:million|billion|thousand)',
        ]
        
        amounts = []
        for pattern in amount_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            amounts.extend(matches)
        
        return list(set(amounts))[:5]

    def _extract_dates(self, text: str) -> List[str]:
        """Extract dates from text"""
        date_patterns = [
            r'(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
            r'(\d{4}-\d{2}-\d{2})',
            r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}',
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates.extend(matches)
        
        return list(set(dates))[:5]

    def _extract_contract_terms(self, text: str) -> List[str]:
        """Extract key contract terms"""
        term_patterns = [
            r'(confidentiality|non-disclosure|termination|renewal|breach|liability|indemnification)',
            r'(payment terms|delivery|warranty|insurance|force majeure)',
        ]
        
        terms = []
        for pattern in term_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            terms.extend(matches)
        
        return list(set(terms))[:5]

    def _extract_vendor(self, text: str) -> str:
        """Extract vendor name from invoices and receipts"""
        vendor_patterns = [
            r'from:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'vendor:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'bill\s+to:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        ]
        
        for pattern in vendor_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return ""

    def _extract_due_dates(self, text: str) -> List[str]:
        """Extract due dates from invoices"""
        due_patterns = [
            r'due\s+date[:\s]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
            r'payment\s+due[:\s]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
            r'pay\s+by[:\s]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
        ]
        
        dates = []
        for pattern in due_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates.extend(matches)
        
        return list(set(dates))

    def _extract_line_items(self, text: str) -> List[str]:
        """Extract line items from invoices"""
        # Simple line item detection
        lines = text.split('\n')
        items = []
        for line in lines:
            if re.search(r'\$\d+\.?\d*', line) and len(line.strip()) > 10:
                items.append(line.strip()[:50] + "..." if len(line.strip()) > 50 else line.strip())
        
        return items[:5]

    def _extract_authors(self, text: str) -> List[str]:
        """Extract author names from reports"""
        author_patterns = [
            r'by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'author[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'prepared\s+by[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        ]
        
        authors = []
        for pattern in author_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            authors.extend(matches)
        
        return list(set(authors))[:3]

    def _extract_findings(self, text: str) -> List[str]:
        """Extract key findings from reports"""
        finding_patterns = [
            r'finding[s]?[:\s]*([^.]+)',
            r'result[s]?[:\s]*([^.]+)',
            r'conclusion[s]?[:\s]*([^.]+)',
        ]
        
        findings = []
        for pattern in finding_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            findings.extend(matches)
        
        return list(set(findings))[:3]

    def _extract_conclusions(self, text: str) -> List[str]:
        """Extract conclusions from reports"""
        conclusion_patterns = [
            r'conclusion[s]?[:\s]*([^.]+)',
            r'summary[:\s]*([^.]+)',
            r'recommendation[s]?[:\s]*([^.]+)',
        ]
        
        conclusions = []
        for pattern in conclusion_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            conclusions.extend(matches)
        
        return list(set(conclusions))[:3]

    def _extract_name(self, text: str) -> str:
        """Extract name from resume/CV"""
        name_patterns = [
            r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'name[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return ""

    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume/CV"""
        skill_patterns = [
            r'skill[s]?[:\s]*([^.]+)',
            r'expertise[:\s]*([^.]+)',
            r'proficient\s+in[:\s]*([^.]+)',
        ]
        
        skills = []
        for pattern in skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            skills.extend(matches)
        
        return list(set(skills))[:5]

    def _extract_experience(self, text: str) -> List[str]:
        """Extract work experience from resume/CV"""
        experience_patterns = [
            r'experience[:\s]*([^.]+)',
            r'work\s+history[:\s]*([^.]+)',
            r'employment[:\s]*([^.]+)',
        ]
        
        experience = []
        for pattern in experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            experience.extend(matches)
        
        return list(set(experience))[:3]

    def _extract_education(self, text: str) -> List[str]:
        """Extract education from resume/CV"""
        education_patterns = [
            r'education[:\s]*([^.]+)',
            r'degree[:\s]*([^.]+)',
            r'university[:\s]*([^.]+)',
        ]
        
        education = []
        for pattern in education_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            education.extend(matches)
        
        return list(set(education))[:3]
