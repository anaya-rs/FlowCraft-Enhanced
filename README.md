# FlowCraft AI

Document processing platform with AI-powered analysis and OCR capabilities.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.9+ + SQLAlchemy
- **Database**: SQLite/PostgreSQL
- **AI**: Local models via Ollama
- **OCR**: Tesseract + PyMuPDF

## Requirements

- Python 3.9+
- Node.js 18+
- 8GB RAM (16GB for AI processing)
- Tesseract OCR
- Ollama

## Quick Start

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

## Access

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Environment

```bash
# backend/.env
DATABASE_URL=sqlite:///./flowcraft.db
SECRET_KEY=your-secret-key
DEBUG=true
OLLAMA_MODEL=llama3.1:8b
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

## License

MIT

