# FlowCraft AI Backend

Privacy-first document processing platform with local AI analysis using Phi-3 via Ollama.

## Features

- **Multi-OCR Engine Support**: Tesseract, EasyOCR, and TrOCR for handwritten text
- **AI-Powered Analysis**: Document classification, key-value extraction, entity recognition
- **Advanced Export System**: JSON, CSV, TXT, PDF with configurable templates
- **Smart Search & Organization**: Full-text search, tagging, categorization, bulk operations
- **Privacy-First**: 100% local processing, no external API calls

## Quick Start

### Prerequisites

- Python 3.8+
- Tesseract OCR
- Ollama with Phi-3 model

### Installation

1. **Clone and setup virtual environment:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
# On Linux/Mac: source venv/bin/activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Install Tesseract OCR:**
   - **Windows**: Download from https://github.com/UB-Mannheim/tesseract/wiki
   - **macOS**: `brew install tesseract`
   - **Linux**: `sudo apt-get install tesseract-ocr`

4. **Install and run Ollama:**
```bash
# Download from https://ollama.ai
ollama pull phi3
ollama serve
```

### Configuration

1. **Create environment file:**
```bash
cp .env.example .env
# Edit .env with your settings
```

2. **Update Tesseract path** in `.env`:
```bash
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe  # Windows
TESSERACT_CMD=/usr/bin/tesseract  # Linux/macOS
```

### Running the Application

1. **Start the backend:**
```bash
python main.py
```

2. **Access the API:**
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login (supports mock: admin@flowcraft.ai/admin123)
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/profile` - Get user profile

### Documents
- `POST /api/v1/documents/upload` - Upload document
- `GET /api/v1/documents/` - List documents
- `GET /api/v1/documents/{id}` - Get document details
- `POST /api/v1/documents/{id}/process` - Process document with OCR/AI
- `DELETE /api/v1/documents/{id}` - Delete document

### AI Models
- `GET /api/v1/models/` - List AI models
- `POST /api/v1/models/` - Create AI model
- `GET /api/v1/models/{id}` - Get model details
- `PUT /api/v1/models/{id}` - Update model
- `DELETE /api/v1/models/{id}` - Delete model

### Export
- `POST /api/v1/export/` - Export single document
- `POST /api/v1/export/batch` - Batch export
- `GET /api/v1/export/configs` - List export configurations
- `POST /api/v1/export/configs` - Create export configuration

### Search & Organization
- `POST /api/v1/search/documents` - Advanced document search
- `GET /api/v1/search/tags` - List tags
- `POST /api/v1/search/tags` - Create tag
- `POST /api/v1/search/bulk` - Bulk operations

## Development

### Project Structure
```
backend/
├── app/
│   ├── api/v1/          # API endpoints
│   ├── core/            # Core configuration
│   ├── models/          # Database models
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   └── routers/         # Router definitions
├── uploads/             # Document storage
├── exports/             # Export files
├── main.py              # Application entry point
└── requirements.txt     # Dependencies
```

### Database Setup

The application uses SQLite by default. Tables are created automatically on first run.

### Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

## Production Deployment

### Environment Variables
- `SECRET_KEY`: Strong secret key for JWT
- `DATABASE_URL`: Database connection string
- `OLLAMA_BASE_URL`: Ollama server URL
- `ENVIRONMENT`: Set to "production"

### Security Considerations
- Change default SECRET_KEY
- Use HTTPS in production
- Implement rate limiting
- Add proper logging and monitoring

## Troubleshooting

### Common Issues

1. **Tesseract not found:**
   - Verify TESSERACT_CMD path in .env
   - Ensure Tesseract is installed and in PATH

2. **Ollama connection failed:**
   - Check if Ollama is running: `ollama serve`
   - Verify OLLAMA_BASE_URL in .env

3. **Import errors:**
   - Ensure all dependencies are installed
   - Check Python path and virtual environment

### Logs

Check the application logs for detailed error information:
```bash
tail -f logs/flowcraft.log
```

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation at `/docs`
3. Check application logs
4. Verify configuration settings

## License

This project is licensed under the MIT License.
