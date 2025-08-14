# FlowCraft AI

Enterprise-grade document processing platform with AI-powered intelligence and advanced OCR capabilities.

## Description

FlowCraft AI implements a monolithic architecture with clear separation between frontend and backend services. The platform utilizes local AI models for document processing, ensuring data privacy and compliance with enterprise security requirements.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Router DOM for routing
- Axios for HTTP operations

### Backend
- FastAPI with Python 3.9+
- SQLAlchemy ORM
- SQLite/PostgreSQL database
- Uvicorn ASGI server
- Alembic for migrations

### AI & Processing
- Ollama for local AI models
- Llama3.1:8b for document analysis
- Tesseract OCR for text extraction
- PyMuPDF for PDF processing

## Requirements

- Python 3.9+
- Node.js 18+
- 8GB RAM minimum (16GB recommended for AI)
- 10GB storage space
- Tesseract OCR installed
- Ollama installed

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd flowcraft-ai
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp env.example .env
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Architecture

### Backend Structure
```
backend/
├── app/
│   ├── api/          # API endpoints
│   ├── core/         # Configuration and auth
│   ├── models/       # Database models
│   ├── routers/      # Route handlers
│   ├── schemas/      # Pydantic schemas
│   └── services/     # Business logic
├── alembic/          # Database migrations
└── main.py           # Application entry point
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utility functions
└── public/           # Static assets
```

### Database Schema
- **users**: User authentication and profiles
- **documents**: Document metadata and results
- **document_shares**: Sharing and access control
- **custom_models**: AI model configurations
- **processing_jobs**: Background job tracking

## Environment Variables

Create `.env` file in backend directory:
```bash
DATABASE_URL=sqlite:///./flowcraft.db
SECRET_KEY=your-secret-key
DEBUG=true
OLLAMA_MODEL=llama3.1:8b
TESSERACT_PATH=/usr/bin/tesseract
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

## License

MIT License

