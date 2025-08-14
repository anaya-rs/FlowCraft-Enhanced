import requests
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger("ai_service")

class AIService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = 30
        
    def _make_ollama_request(self, prompt: str, system_prompt: str = None) -> Optional[str]:
        """Make request to Ollama API with improved error handling"""
        try:
            url = f"{self.base_url}/api/generate"
            
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "top_k": 40
                }
            }
            
            if system_prompt:
                payload["system"] = system_prompt
            
            # Reduced timeout for faster failure
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            return result.get("response", "").strip()
            
        except requests.exceptions.ConnectionError as e:
            logger.warning(f"Ollama service not running at {self.base_url}: {e}")
            return None
        except requests.exceptions.Timeout as e:
            logger.warning(f"Ollama request timed out: {e}")
            return None
        except requests.exceptions.RequestException as e:
            logger.warning(f"Ollama API request failed: {e}")
            return None
        except Exception as e:
            logger.warning(f"AI service error: {e}")
            return None
    
    def analyze_document(self, text: str, document_type: str = None) -> Dict[str, Any]:
        """Comprehensive document analysis using Phi-3"""
        try:
            # Simple prompt to get document analysis
            system_prompt = "You are an expert document analyst. Analyze the document and provide insights."
            
            prompt = f"""
            Analyze this document and provide detailed insights about:
            - What the document is about
            - Key information found
            - Important details
            - Any notable findings
            
            Document text:
            {text[:3000]}
            
            Provide a comprehensive analysis in clear, readable text.
            """
            
            print(f"AI Service: Sending prompt to Phi-3...")
            response = self._make_ollama_request(prompt, system_prompt)
            print(f"AI Service: Received response from Phi-3: {response[:200] if response else 'None'}...")
            
            if response:
                # Return whatever Phi-3 generated, structured for the frontend
                analysis = {
                    "summary": response,
                    "document_type": "document",
                    "confidence": 0.9,
                    "key_information": {
                        "content": response[:500] + "..." if len(response) > 500 else response
                    },
                    "extracted_fields": {
                        "analysis": response
                    },
                    "entities": [],
                    "action_items": [],
                    "key_topics": [],
                    "ai_model": self.model,
                    "analysis_timestamp": datetime.utcnow().isoformat()
                }
                
                print(f"AI Service: Returning analysis with Phi-3 response")
                return analysis
            else:
                print("AI Service: No response from Ollama, using fallback analysis")
                return self._fallback_analysis(text)
                
        except Exception as e:
            print(f"AI Service: Document analysis failed: {e}")
            return self._fallback_analysis(text)
    
    def extract_key_values(self, text: str, field_schema: Dict[str, str] = None) -> Dict[str, Any]:
        """Extract key-value pairs using AI"""
        try:
            if not field_schema:
                field_schema = {
                    "invoice_number": "Invoice or bill number",
                    "date": "Document date",
                    "amount": "Total amount or cost",
                    "vendor": "Vendor or company name",
                    "customer": "Customer name",
                    "due_date": "Payment due date",
                    "po_number": "Purchase order number",
                    "reference": "Reference number or ID"
                }
            
            system_prompt = "You are an expert at extracting structured data from documents. Return only the requested fields in JSON format."
            
            prompt = f"""
            Extract the following fields from this document text:
            
            Fields to extract:
            {json.dumps(field_schema, indent=2)}
            
            Document text:
            {text[:1500]}
            
            Return the extracted fields in this JSON format:
            {{
                "extracted_fields": {{
                    "field_name": {{
                        "value": "extracted value",
                        "confidence": 0.95,
                        "source": "ai_extraction"
                    }}
                }},
                "extraction_confidence": 0.9,
                "missing_fields": ["list of fields that couldn't be extracted"]
            }}
            """
            
            response = self._make_ollama_request(prompt, system_prompt)
            
            if response:
                try:
                    result = json.loads(response)
                    result["ai_model"] = self.model
                    result["extraction_timestamp"] = datetime.utcnow().isoformat()
                    return result
                except json.JSONDecodeError:
                    return {
                        "extracted_fields": {},
                        "extraction_confidence": 0.5,
                        "raw_response": response,
                        "parsing_error": "Response was not valid JSON"
                    }
            else:
                return self._fallback_key_value_extraction(text, field_schema)
                
        except Exception as e:
            logger.error(f"Key-value extraction failed: {e}")
            return self._fallback_key_value_extraction(text, field_schema)
    
    def generate_summary(self, text: str, summary_type: str = "executive") -> Dict[str, Any]:
        """Generate intelligent document summary"""
        try:
            summary_prompts = {
                "executive": "Provide a high-level executive summary in 2-3 sentences",
                "detailed": "Provide a detailed summary covering all major points",
                "actionable": "Focus on action items and next steps",
                "technical": "Provide a technical summary for technical audience"
            }
            
            prompt_type = summary_prompts.get(summary_type, summary_prompts["executive"])
            
            system_prompt = "You are an expert at creating clear, concise document summaries."
            
            prompt = f"""
            Create a {summary_type} summary of this document:
            
            {prompt_type}
            
            Document text:
            {text[:2000]}
            
            Return the summary in this format:
            {{
                "summary": "Your summary text here",
                "summary_type": "{summary_type}",
                "key_points": ["point 1", "point 2", "point 3"],
                "word_count": 150,
                "confidence": 0.95
            }}
            """
            
            response = self._make_ollama_request(prompt, system_prompt)
            
            if response:
                try:
                    result = json.loads(response)
                    result["ai_model"] = self.model
                    result["generation_timestamp"] = datetime.utcnow().isoformat()
                    return result
                except json.JSONDecodeError:
                    return {
                        "summary": response,
                        "summary_type": summary_type,
                        "ai_model": self.model,
                        "generation_timestamp": datetime.utcnow().isoformat()
                    }
            else:
                return self._fallback_summary(text, summary_type)
                
        except Exception as e:
            logger.error(f"Summary generation failed: {e}")
            return self._fallback_summary(text, summary_type)
    
    def classify_document(self, text: str) -> Dict[str, Any]:
        """Classify document type using AI"""
        try:
            system_prompt = "You are an expert at classifying document types. Return only the classification in JSON format."
            
            prompt = f"""
            Classify this document into one of these categories:
            - invoice
            - contract
            - report
            - letter
            - form
            - receipt
            - proposal
            - manual
            - other
            
            Document text:
            {text[:1000]}
            
            Return the classification in this JSON format:
            {{
                "document_type": "classified_type",
                "confidence": 0.95,
                "reasoning": "Brief explanation of classification",
                "subtype": "More specific subtype if applicable"
            }}
            """
            
            response = self._make_ollama_request(prompt, system_prompt)
            
            if response:
                try:
                    result = json.loads(response)
                    result["ai_model"] = self.model
                    result["classification_timestamp"] = datetime.utcnow().isoformat()
                    return result
                except json.JSONDecodeError:
                    return {
                        "document_type": "unknown",
                        "confidence": 0.5,
                        "raw_response": response
                    }
            else:
                return self._fallback_classification(text)
                
        except Exception as e:
            logger.error(f"Document classification failed: {e}")
            return self._fallback_classification(text)
    
    def _fallback_analysis(self, text: str) -> Dict[str, Any]:
        """Fallback analysis when AI is unavailable"""
        words = text.split()
        word_count = len(words)
        
        # Simple rule-based analysis
        text_lower = text.lower()
        
        # Determine document type
        doc_type = "unknown"
        if any(word in text_lower for word in ["invoice", "bill", "amount due"]):
            doc_type = "invoice"
        elif any(word in text_lower for word in ["contract", "agreement", "terms"]):
            doc_type = "contract"
        elif any(word in text_lower for word in ["report", "analysis", "findings"]):
            doc_type = "report"
        
        # Extract basic information
        summary = f"Document contains {word_count} words. Document type appears to be {doc_type}."
        
        return {
            "summary": summary,
            "document_type": doc_type,
            "confidence": 0.6,
            "ai_model": "fallback",
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "word_count": word_count
        }
    
    def _fallback_key_value_extraction(self, text: str, field_schema: Dict[str, str]) -> Dict[str, Any]:
        """Fallback key-value extraction"""
        # Simple regex-based extraction as fallback
        extracted = {}
        
        # Extract amounts
        import re
        amount_matches = re.findall(r'\$([\d,]+\.?\d*)', text)
        if amount_matches:
            extracted["amount"] = {
                "value": amount_matches[0],
                "confidence": 0.7,
                "source": "regex_fallback"
            }
        
        # Extract dates
        date_matches = re.findall(r'(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})', text)
        if date_matches:
            extracted["date"] = {
                "value": date_matches[0],
                "confidence": 0.7,
                "source": "regex_fallback"
            }
        
        return {
            "extracted_fields": extracted,
            "extraction_confidence": 0.6,
            "missing_fields": [k for k in field_schema.keys() if k not in extracted],
            "ai_model": "fallback"
        }
    
    def _fallback_summary(self, text: str, summary_type: str) -> str:
        """Fallback summary generation"""
        words = text.split()
        word_count = len(words)
        
        if word_count < 100:
            return f"Short document with {word_count} words. Content appears to be concise and focused."
        elif word_count < 500:
            return f"Medium-length document with {word_count} words. Contains moderate detail and information."
        else:
            return f"Comprehensive document with {word_count} words. Provides extensive detail and thorough coverage of the subject matter."
    
    def _fallback_classification(self, text: str) -> Dict[str, Any]:
        """Fallback document classification"""
        text_lower = text.lower()
        
        # Simple keyword-based classification
        if any(word in text_lower for word in ["invoice", "bill", "amount due"]):
            doc_type = "invoice"
        elif any(word in text_lower for word in ["contract", "agreement", "terms"]):
            doc_type = "contract"
        elif any(word in text_lower for word in ["report", "analysis", "findings"]):
            doc_type = "report"
        elif any(word in text_lower for word in ["dear", "sincerely", "regards"]):
            doc_type = "letter"
        else:
            doc_type = "generic"
        
        return {
            "document_type": doc_type,
            "confidence": 0.6,
            "ai_model": "fallback"
        }
    
    def health_check(self) -> Dict[str, Any]:
        """Check AI service health"""
        try:
            url = f"{self.base_url}/api/tags"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                models = response.json().get("models", [])
                phi3_available = any(model.get("name") == self.model for model in models)
                
                return {
                    "status": "healthy" if phi3_available else "degraded",
                    "ollama_url": self.base_url,
                    "phi3_model": self.model,
                    "phi3_available": phi3_available,
                    "available_models": [m.get("name") for m in models],
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "status": "unhealthy",
                    "ollama_url": self.base_url,
                    "error": f"HTTP {response.status_code}",
                    "timestamp": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            return {
                "status": "unhealthy",
                "ollama_url": self.base_url,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
