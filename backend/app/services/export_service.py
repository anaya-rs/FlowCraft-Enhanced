import json
import csv
import os
import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from pathlib import Path
import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import pandas as pd

logger = logging.getLogger("export_service")

class ExportService:
    def __init__(self):
        self.export_dir = Path("exports")
        self.export_dir.mkdir(exist_ok=True)
        
        # Default export templates
        self.templates = {
            "invoice": {
                "fields": ["invoice_number", "date", "amount", "vendor", "customer", "due_date"],
                "title": "Invoice Data Export",
                "description": "Structured invoice information extracted from documents"
            },
            "contract": {
                "fields": ["contract_number", "parties", "start_date", "end_date", "value", "terms"],
                "title": "Contract Data Export",
                "description": "Contract information and key terms extracted from documents"
            },
            "receipt": {
                "fields": ["receipt_number", "date", "amount", "vendor", "items", "payment_method"],
                "title": "Receipt Data Export",
                "description": "Receipt and transaction data extracted from documents"
            },
            "generic": {
                "fields": ["document_type", "date", "key_entities", "summary", "confidence"],
                "title": "Document Analysis Export",
                "description": "General document analysis and extracted information"
            }
        }
    
    def export_to_json(self, data: Dict[str, Any], filename: str = None) -> str:
        """Export data to JSON format"""
        try:
            if not filename:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"export_{timestamp}.json"
            
            filepath = self.export_dir / filename
            
            # Add export metadata
            export_data = {
                "export_info": {
                    "exported_at": datetime.utcnow().isoformat(),
                    "format": "json",
                    "version": "1.0"
                },
                "data": data
            }
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False, default=str)
            
            logger.info(f"JSON export completed: {filepath}")
            return str(filepath)
            
        except Exception as e:
            logger.error(f"JSON export failed: {e}")
            raise
    
    def export_to_csv(self, data: List[Dict[str, Any]], filename: str = None, template: str = "generic") -> str:
        """Export data to CSV format"""
        try:
            if not filename:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"export_{template}_{timestamp}.csv"
            
            filepath = self.export_dir / filename
            
            if not data:
                logger.warning("No data to export")
                return ""
            
            # Get field template
            template_config = self.templates.get(template, self.templates["generic"])
            fields = template_config["fields"]
            
            # Flatten nested data for CSV
            flattened_data = []
            for item in data:
                flat_item = {}
                for field in fields:
                    if field in item:
                        value = item[field]
                        if isinstance(value, dict):
                            # Handle nested objects
                            flat_item[field] = json.dumps(value, ensure_ascii=False)
                        elif isinstance(value, list):
                            # Handle lists
                            flat_item[field] = "; ".join(str(v) for v in value)
                        else:
                            flat_item[field] = str(value) if value is not None else ""
                    else:
                        flat_item[field] = ""
                flattened_data.append(flat_item)
            
            # Write CSV
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                if flattened_data:
                    writer = csv.DictWriter(f, fieldnames=fields)
                    writer.writeheader()
                    writer.writerows(flattened_data)
            
            logger.info(f"CSV export completed: {filepath}")
            return str(filepath)
            
        except Exception as e:
            logger.error(f"CSV export failed: {e}")
            raise
    
    def export_to_pdf(self, data: Dict[str, Any], filename: str = None, template: str = "generic") -> str:
        """Export data to PDF format with professional formatting"""
        try:
            if not filename:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"export_{template}_{timestamp}.pdf"
            
            filepath = self.export_dir / filename
            
            # Create PDF document
            doc = SimpleDocTemplate(str(filepath), pagesize=A4)
            story = []
            
            # Get styles
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                spaceAfter=30,
                alignment=TA_CENTER,
                textColor=colors.darkblue
            )
            
            subtitle_style = ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Heading2'],
                fontSize=14,
                spaceAfter=20,
                alignment=TA_CENTER,
                textColor=colors.grey
            )
            
            # Add title and metadata
            template_config = self.templates.get(template, self.templates["generic"])
            story.append(Paragraph(template_config["title"], title_style))
            story.append(Paragraph(template_config["description"], subtitle_style))
            story.append(Spacer(1, 20))
            
            # Add export info
            export_info = [
                ["Export Date", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
                ["Template", template],
                ["Format", "PDF"]
            ]
            
            export_table = Table(export_info, colWidths=[2*inch, 4*inch])
            export_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(export_table)
            story.append(Spacer(1, 20))
            
            # Add data sections
            if "summary" in data:
                story.append(Paragraph("Document Summary", styles['Heading2']))
                story.append(Paragraph(data["summary"], styles['Normal']))
                story.append(Spacer(1, 15))
            
            if "key_value_pairs" in data and data["key_value_pairs"]:
                story.append(Paragraph("Extracted Key-Value Pairs", styles['Heading2']))
                
                kv_data = [["Field", "Value", "Confidence"]]
                for field, field_data in data["key_value_pairs"].items():
                    if isinstance(field_data, dict):
                        value = field_data.get("value", "")
                        confidence = field_data.get("confidence", 0)
                        kv_data.append([field, str(value), f"{confidence:.2f}"])
                    else:
                        kv_data.append([field, str(field_data), "N/A"])
                
                kv_table = Table(kv_data, colWidths=[2*inch, 3*inch, 1*inch])
                kv_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                
                story.append(kv_table)
                story.append(Spacer(1, 15))
            
            if "entities" in data and data["entities"]:
                story.append(Paragraph("Recognized Entities", styles['Heading2']))
                
                entity_data = [["Type", "Value", "Confidence"]]
                for entity in data["entities"]:
                    entity_data.append([
                        entity.get("type", ""),
                        entity.get("value", ""),
                        f"{entity.get('confidence', 0):.2f}"
                    ])
                
                entity_table = Table(entity_data, colWidths=[1.5*inch, 3*inch, 1.5*inch])
                entity_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                
                story.append(entity_table)
                story.append(Spacer(1, 15))
            
            # Build PDF
            doc.build(story)
            
            logger.info(f"PDF export completed: {filepath}")
            return str(filepath)
            
        except Exception as e:
            logger.error(f"PDF export failed: {e}")
            raise
    
    def export_to_excel(self, data: List[Dict[str, Any]], filename: str = None, template: str = "generic") -> str:
        """Export data to Excel format with multiple sheets"""
        try:
            if not filename:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"export_{template}_{timestamp}.xlsx"
            
            filepath = self.export_dir / filename
            
            # Create Excel writer
            with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
                # Main data sheet
                if data:
                    df_main = pd.DataFrame(data)
                    df_main.to_excel(writer, sheet_name='Extracted_Data', index=False)
                
                # Summary sheet
                summary_data = {
                    "Export Information": [
                        "Export Date",
                        "Template Used",
                        "Total Records",
                        "Format"
                    ],
                    "Value": [
                        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        template,
                        len(data) if data else 0,
                        "Excel"
                    ]
                }
                
                df_summary = pd.DataFrame(summary_data)
                df_summary.to_excel(writer, sheet_name='Export_Summary', index=False)
                
                # Template configuration sheet
                template_config = self.templates.get(template, self.templates["generic"])
                template_data = {
                    "Field": list(template_config.keys()),
                    "Value": list(template_config.values())
                }
                
                df_template = pd.DataFrame(template_data)
                df_template.to_excel(writer, sheet_name='Template_Config', index=False)
            
            logger.info(f"Excel export completed: {filepath}")
            return str(filepath)
            
        except Exception as e:
            logger.error(f"Excel export failed: {e}")
            raise
    
    def export_document_analysis(self, document_data: Dict[str, Any], format: str = "json", template: str = "generic") -> str:
        """Export complete document analysis in specified format"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            base_filename = f"document_analysis_{template}_{timestamp}"
            
            if format.lower() == "json":
                return self.export_to_json(document_data, f"{base_filename}.json")
            elif format.lower() == "csv":
                # Convert to list format for CSV
                data_list = [document_data] if isinstance(document_data, dict) else document_data
                return self.export_to_csv(data_list, f"{base_filename}.csv", template)
            elif format.lower() == "pdf":
                return self.export_to_pdf(document_data, f"{base_filename}.pdf", template)
            elif format.lower() == "excel":
                data_list = [document_data] if isinstance(document_data, dict) else document_data
                return self.export_to_excel(data_list, f"{base_filename}.xlsx", template)
            else:
                raise ValueError(f"Unsupported export format: {format}")
                
        except Exception as e:
            logger.error(f"Document analysis export failed: {e}")
            raise
    
    def create_custom_template(self, name: str, fields: List[str], title: str, description: str) -> bool:
        """Create a custom export template"""
        try:
            self.templates[name] = {
                "fields": fields,
                "title": title,
                "description": description
            }
            
            logger.info(f"Custom template '{name}' created successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create custom template: {e}")
            return False
    
    def get_available_templates(self) -> Dict[str, Dict[str, Any]]:
        """Get all available export templates"""
        return self.templates.copy()
    
    def get_export_formats(self) -> List[Dict[str, str]]:
        """Get available export formats"""
        return [
            {"format": "json", "description": "JSON format with metadata", "extension": ".json"},
            {"format": "csv", "description": "CSV format for spreadsheet applications", "extension": ".csv"},
            {"format": "pdf", "description": "PDF format with professional formatting", "extension": ".pdf"},
            {"format": "excel", "description": "Excel format with multiple sheets", "extension": ".xlsx"}
        ]
    
    def cleanup_old_exports(self, max_age_days: int = 30) -> int:
        """Clean up old export files"""
        try:
            cutoff_time = datetime.now().timestamp() - (max_age_days * 24 * 60 * 60)
            deleted_count = 0
            
            for file_path in self.export_dir.glob("*"):
                if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                    file_path.unlink()
                    deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} old export files")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Export cleanup failed: {e}")
            return 0
