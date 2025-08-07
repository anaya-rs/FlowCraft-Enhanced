import openai
from typing import Dict, Any, Optional
from app.core.config import settings
from app.models.ai_model import AIModel, ResponseFormat
import json
import logging

logger = logging.getLogger(__name__)

openai.api_key = settings.OPENAI_API_KEY


class AIService:
    @staticmethod
    def process_document(ai_model: AIModel, document_text: str, additional_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process document text using the specified AI model"""
        try:
            # Prepare the prompt
            prompt = ai_model.prompt_template
            
            # Replace placeholders in the prompt
            prompt = prompt.replace("{document_text}", document_text)
            
            if additional_context:
                for key, value in additional_context.items():
                    prompt = prompt.replace(f"{{{key}}}", str(value))
            
            # Prepare messages for ChatGPT
            messages = [
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant specialized in document processing and analysis."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
            
            # Make API call
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=ai_model.temperature,
                max_tokens=ai_model.max_tokens
            )
            
            # Extract response
            ai_response = response.choices[0].message.content
            
            # Format response based on model configuration
            if ai_model.response_format == ResponseFormat.JSON:
                try:
                    parsed_response = json.loads(ai_response)
                    return {
                        "success": True,
                        "response": parsed_response,
                        "raw_response": ai_response,
                        "tokens_used": response.usage.total_tokens
                    }
                except json.JSONDecodeError:
                    # If JSON parsing fails, return as text
                    return {
                        "success": True,
                        "response": ai_response,
                        "raw_response": ai_response,
                        "tokens_used": response.usage.total_tokens,
                        "warning": "Response was not valid JSON, returned as text"
                    }
            else:
                return {
                    "success": True,
                    "response": ai_response,
                    "raw_response": ai_response,
                    "tokens_used": response.usage.total_tokens
                }
                
        except Exception as e:
            logger.error(f"Error processing document with AI: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "response": None
            }
    
    @staticmethod
    def get_model_templates() -> Dict[str, Dict[str, Any]]:
        """Return predefined model templates"""
        return {
            "document_summarizer": {
                "name": "Document Summarizer",
                "description": "Summarizes long documents into key points",
                "model_type": "summarizer",
                "prompt_template": """Please provide a concise summary of the following document:

{document_text}

Summary should include:
1. Main topic and purpose
2. Key findings or points
3. Important conclusions or recommendations

Format the response as a structured summary.""",
                "temperature": 0.3,
                "max_tokens": 500,
                "response_format": "text"
            },
            "data_extractor": {
                "name": "Data Extractor",
                "description": "Extracts structured data from documents",
                "model_type": "extractor",
                "prompt_template": """Extract key information from the following document and return it as JSON:

{document_text}

Extract:
- Names and contact information
- Dates and deadlines
- Monetary amounts
- Key metrics or statistics
- Important entities (companies, locations, etc.)

Return the extracted data in JSON format.""",
                "temperature": 0.1,
                "max_tokens": 800,
                "response_format": "json"
            },
            "qa_assistant": {
                "name": "Q&A Assistant",
                "description": "Answers questions about document content",
                "model_type": "qa",
                "prompt_template": """Based on the following document, please answer any questions about its content:

Document:
{document_text}

Question: {question}

Provide a detailed answer based only on the information in the document. If the information is not available in the document, please state that clearly.""",
                "temperature": 0.2,
                "max_tokens": 600,
                "response_format": "text"
            }
        }
