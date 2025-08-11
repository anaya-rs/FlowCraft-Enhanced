import json
import csv
import os
import requests
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from pathlib import Path

from app.models import Document, ExportConfig, ExportFormat
from app.core.config import settings
from app.services.document_processor import DocumentProcessor

class ExportService:
    def __init__(self):
        self.document_processor = DocumentProcessor()
        self.export_dir = Path(settings.EXPORT_DIR)
        self.export_dir.mkdir(exist_ok=True)
        
        # Export templates
        self.templates = {
            "standard": {
                "include_metadata": True,
                "include_ocr_text": True,
                "include_ai_analysis": True,
                "include_key_values": True,
                "include_entities": True,
                "format_dates": True,
                "include_confidence_scores": True
            },
            "minimal": {
                "include_metadata": False,
                "include_ocr_text": False,
                "include_ai_analysis": False,
                "include_key_values": True,
                "include_entities": False,
                "format_dates": True,
                "include_confidence_scores": False
            },
            "detailed": {
                "include_metadata": True,
                "include_ocr_text": True,
                "include_ai_analysis": True,
                "include_key_values": True,
                "include_entities": True,
                "format_dates": True,
                "include_confidence_scores": True,
                "include_processing_history": True,
                "include_file_info": True
            },
            "custom": {
                "include_metadata": True,
                "include_ocr_text": True,
                "include_ai_analysis": True,
                "include_key_values": True,
                "include_entities": True,
                "format_dates": True,
                "include_confidence_scores": True
            }
        }

    async def export_document(
        self, 
        document: Document, 
        export_format: ExportFormat, 
        export_config: Optional[ExportConfig] = None,
        template_name: str = "standard"
    ) -> Dict[str, Any]:
        """Export a single document in specified format"""
        try:
            # Get template configuration
            template = self.templates.get(template_name, self.templates["standard"])
            
            # Override with export config if provided
            if export_config and export_config.template_config:
                template.update(export_config.template_config)
            
            # Prepare export data
            export_data = self._prepare_export_data(document, template)
            
            # Export based on format
            if export_format == ExportFormat.JSON:
                result = await self._export_json(document, export_data, export_config)
            elif export_format == ExportFormat.CSV:
                result = await self._export_csv(document, export_data, export_config)
            elif export_format == ExportFormat.TXT:
                result = await self._export_txt(document, export_data, export_config)
            elif export_format == ExportFormat.PDF:
                result = await self._export_pdf(document, export_data, export_config)
            else:
                raise ValueError(f"Unsupported export format: {export_format}")
            
            # Send webhook if configured
            if export_config and export_config.webhook_url:
                await self._send_webhook(export_config, result)
            
            # Export to local directory if configured
            if export_config and export_config.export_directory:
                await self._export_to_local_directory(export_config, result)
            
            return result
            
        except Exception as e:
            raise Exception(f"Export failed: {str(e)}")

    async def batch_export(
        self,
        documents: List[Document],
        export_format: ExportFormat,
        export_config: Optional[ExportConfig] = None,
        template_name: str = "standard"
    ) -> List[Dict[str, Any]]:
        """Export multiple documents in batch"""
        results = []
        
        for document in documents:
            try:
                result = await self.export_document(
                    document, export_format, export_config, template_name
                )
                results.append(result)
            except Exception as e:
                results.append({
                    "document_id": str(document.id),
                    "filename": document.filename,
                    "success": False,
                    "error": str(e)
                })
        
        return results

    def _prepare_export_data(self, document: Document, template: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare data for export based on template"""
        export_data = {}
        
        if template.get("include_metadata"):
            export_data["metadata"] = {
                "id": str(document.id),
                "filename": document.filename,
                "original_filename": document.original_filename,
                "file_size": document.file_size,
                "mime_type": document.mime_type,
                "created_at": document.created_at.isoformat() if document.created_at else None,
                "processed_at": document.processed_at.isoformat() if document.processed_at else None
            }
        
        if template.get("include_ocr_text"):
            export_data["ocr_text"] = document.extracted_text
        
        if template.get("include_ai_analysis") and document.ai_analysis:
            export_data["ai_analysis"] = document.ai_analysis
        
        if template.get("include_key_values") and document.key_value_pairs:
            export_data["key_value_pairs"] = document.key_value_pairs
        
        if template.get("include_entities") and document.entities:
            export_data["entities"] = document.entities
        
        if template.get("include_processing_history"):
            export_data["processing_status"] = document.processing_status
            export_data["ocr_confidence"] = document.ocr_confidence
            export_data["document_type"] = document.document_type
        
        if template.get("include_file_info"):
            export_data["file_info"] = {
                "file_path": document.file_path,
                "processing_status": document.processing_status,
                "ocr_confidence": document.ocr_confidence,
                "document_type": document.document_type
            }
        
        return export_data

    async def _export_json(
        self, 
        document: Document, 
        export_data: Dict[str, Any], 
        export_config: Optional[ExportConfig]
    ) -> Dict[str, Any]:
        """Export document as JSON"""
        export_id = str(uuid.uuid4())
        filename = f"{document.filename}_{export_id}.json"
        file_path = self.export_dir / filename
        
        # Format JSON with proper indentation
        json_content = json.dumps(export_data, indent=2, default=str, ensure_ascii=False)
        
        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(json_content)
        
        return {
            "export_id": export_id,
            "file_path": str(file_path),
            "format": "json",
            "size_bytes": len(json_content.encode('utf-8')),
            "success": True
        }

    async def _export_csv(
        self, 
        document: Document, 
        export_data: Dict[str, Any], 
        export_config: Optional[ExportConfig]
    ) -> Dict[str, Any]:
        """Export document as CSV"""
        export_id = str(uuid.uuid4())
        filename = f"{document.filename}_{export_id}.csv"
        file_path = self.export_dir / filename
        
        # Flatten data for CSV
        csv_data = self._flatten_for_csv(export_data)
        
        # Write CSV
        with open(file_path, 'w', newline='', encoding='utf-8') as f:
            if csv_data:
                writer = csv.DictWriter(f, fieldnames=csv_data[0].keys())
                writer.writeheader()
                writer.writerows(csv_data)
        
        return {
            "export_id": export_id,
            "file_path": str(file_path),
            "format": "csv",
            "size_bytes": os.path.getsize(file_path),
            "success": True
        }

    async def _export_txt(
        self, 
        document: Document, 
        export_data: Dict[str, Any], 
        export_config: Optional[ExportConfig]
    ) -> Dict[str, Any]:
        """Export document as TXT"""
        export_id = str(uuid.uuid4())
        filename = f"{document.filename}_{export_id}.txt"
        file_path = self.export_dir / filename
        
        # Convert to text format
        text_content = self._convert_to_text(export_data)
        
        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(text_content)
        
        return {
            "export_id": export_id,
            "file_path": str(file_path),
            "format": "txt",
            "size_bytes": len(text_content.encode('utf-8')),
            "success": True
        }

    async def _export_pdf(
        self, 
        document: Document, 
        export_data: Dict[str, Any], 
        export_config: Optional[ExportConfig]
    ) -> Dict[str, Any]:
        """Export document as PDF report"""
        export_id = str(uuid.uuid4())
        filename = f"{document.filename}_{export_id}.pdf"
        file_path = self.export_dir / filename
        
        # Generate PDF report
        pdf_content = await self._generate_pdf_report(document, export_data)
        
        # Write PDF
        with open(file_path, 'wb') as f:
            f.write(pdf_content)
        
        return {
            "export_id": export_id,
            "file_path": str(file_path),
            "format": "pdf",
            "size_bytes": len(pdf_content),
            "success": True
        }

    def _flatten_for_csv(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Flatten nested data for CSV export"""
        flattened = []
        
        # Handle key-value pairs
        if "key_value_pairs" in data:
            for key, value_data in data["key_value_pairs"].items():
                row = {
                    "field_name": key,
                    "field_value": value_data.get("value", ""),
                    "confidence": value_data.get("confidence", ""),
                    "source": value_data.get("source", ""),
                    "is_valid": value_data.get("is_valid", ""),
                    "formatted_value": value_data.get("formatted_value", "")
                }
                flattened.append(row)
        
        # Handle entities
        if "entities" in data:
            for entity in data["entities"]:
                row = {
                    "entity_type": entity.get("type", ""),
                    "entity_value": entity.get("value", ""),
                    "confidence": entity.get("confidence", ""),
                    "source": entity.get("source", "")
                }
                flattened.append(row)
        
        return flattened

    def _convert_to_text(self, data: Dict[str, Any]) -> str:
        """Convert export data to human-readable text"""
        lines = []
        
        # Document metadata
        if "metadata" in data:
            lines.append("=== DOCUMENT METADATA ===")
            for key, value in data["metadata"].items():
                lines.append(f"{key.replace('_', ' ').title()}: {value}")
            lines.append("")
        
        # OCR Text
        if "ocr_text" in data and data["ocr_text"]:
            lines.append("=== EXTRACTED TEXT ===")
            lines.append(data["ocr_text"])
            lines.append("")
        
        # Key-value pairs
        if "key_value_pairs" in data and data["key_value_pairs"]:
            lines.append("=== EXTRACTED FIELDS ===")
            for key, value_data in data["key_value_pairs"].items():
                value = value_data.get("value", "")
                confidence = value_data.get("confidence", "")
                lines.append(f"{key}: {value} (confidence: {confidence:.2f})")
            lines.append("")
        
        # Entities
        if "entities" in data and data["entities"]:
            lines.append("=== RECOGNIZED ENTITIES ===")
            for entity in data["entities"]:
                entity_type = entity.get("type", "")
                entity_value = entity.get("value", "")
                confidence = entity.get("confidence", "")
                lines.append(f"{entity_type}: {entity_value} (confidence: {confidence:.2f})")
            lines.append("")
        
        # AI Analysis
        if "ai_analysis" in data and data["ai_analysis"]:
            lines.append("=== AI ANALYSIS ===")
            ai_data = data["ai_analysis"]
            if "summary" in ai_data:
                lines.append(f"Summary: {ai_data['summary']}")
            if "classification" in ai_data:
                lines.append(f"Document Type: {ai_data['classification']}")
            if "overall_confidence" in ai_data:
                lines.append(f"Overall Confidence: {ai_data['overall_confidence']:.2f}")
            lines.append("")
        
        return "\n".join(lines)

    async def _generate_pdf_report(
        self, 
        document: Document, 
        export_data: Dict[str, Any]
    ) -> bytes:
        """Generate PDF report (stub - implement with reportlab or similar)"""
        # TODO: Implement PDF generation with reportlab
        # For now, return a simple text-based PDF
        text_content = self._convert_to_text(export_data)
        
        # Simple PDF generation (very basic)
        pdf_content = f"""
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length {len(text_content)}
>>
stream
BT
/F1 12 Tf
72 720 Td
{text_content} Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
{len(text_content) + 300}
%%EOF
""".encode('utf-8')
        
        return pdf_content

    async def _send_webhook(self, export_config: ExportConfig, export_result: Dict[str, Any]) -> bool:
        """Send webhook notification"""
        try:
            webhook_data = {
                "export_id": export_result.get("export_id"),
                "document_filename": export_result.get("document_filename"),
                "format": export_result.get("format"),
                "file_path": export_result.get("file_path"),
                "size_bytes": export_result.get("size_bytes"),
                "success": export_result.get("success"),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            headers = export_config.webhook_headers or {}
            headers.update({"Content-Type": "application/json"})
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: requests.post(
                    export_config.webhook_url,
                    json=webhook_data,
                    headers=headers,
                    timeout=settings.WEBHOOK_TIMEOUT
                )
            )
            
            return response.status_code in [200, 201, 202]
            
        except Exception as e:
            # Log webhook failure but don't fail export
            print(f"Webhook failed: {e}")
            return False

    async def _export_to_local_directory(
        self, 
        export_config: ExportConfig, 
        export_result: Dict[str, Any]
    ) -> bool:
        """Export file to local directory"""
        try:
            if not export_config.export_directory:
                return False
            
            local_dir = Path(export_config.export_directory)
            local_dir.mkdir(exist_ok=True)
            
            source_path = Path(export_result["file_path"])
            dest_path = local_dir / source_path.name
            
            # Copy file to local directory
            import shutil
            shutil.copy2(source_path, dest_path)
            
            return True
            
        except Exception as e:
            print(f"Local export failed: {e}")
            return False

    def get_available_templates(self) -> Dict[str, Dict[str, Any]]:
        """Get available export templates"""
        return self.templates

    async def test_webhook(self, webhook_config: Dict[str, Any]) -> bool:
        """Test webhook configuration"""
        try:
            test_data = {
                "test": True,
                "message": "Webhook test from FlowCraft AI",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: requests.post(
                    webhook_config["url"],
                    json=test_data,
                    headers=webhook_config.get("headers", {}),
                    timeout=settings.WEBHOOK_TIMEOUT
                )
            )
            
            return response.status_code in [200, 201, 202]
            
        except Exception as e:
            print(f"Webhook test failed: {e}")
            return False

    async def get_export_file_path(self, export_id: str, user_id: str) -> Optional[str]:
        """Get export file path by ID"""
        # This would typically query a database table for export records
        # For now, search in export directory
        for file_path in self.export_dir.glob(f"*_{export_id}.*"):
            return str(file_path)
        return None

    async def get_export_status(self, export_id: str, user_id: str) -> Dict[str, Any]:
        """Get export processing status"""
        # This would typically query a database table for export records
        # For now, return basic status
        file_path = await self.get_export_file_path(export_id, user_id)
        
        if file_path and os.path.exists(file_path):
            return {
                "export_id": export_id,
                "status": "completed",
                "file_path": file_path,
                "size_bytes": os.path.getsize(file_path),
                "completed_at": datetime.utcnow().isoformat()
            }
        else:
            return {
                "export_id": export_id,
                "status": "not_found",
                "error": "Export file not found"
            }
