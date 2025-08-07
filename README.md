
# FlowCraft AI - Document Processing Platform

FlowCraft AI is an intelligent document processing platform that combines OCR (Optical Character Recognition) technology with AI-powered analysis to extract, process, and summarize text from various document formats including PDFs and images.

## Overview

This application provides a complete workflow for document management and analysis:
- Upload documents (PDF, PNG, JPG, JPEG)
- Extract text using advanced OCR technology
- Generate AI-powered summaries and insights
- Create custom processing models
- Manage document libraries with confidence scoring
- Download processed results

## Architecture

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI with Python, SQLite database
- **OCR Engine**: Tesseract OCR with PyMuPDF for PDF processing
- **Authentication**: Mock JWT implementation for development
- **File Storage**: Local file system with organized uploads directory

## System Requirements

### Prerequisites
- Python 3.8 or higher
- Node.js 16.0 or higher
- npm or yarn package manager
- Git for version control

### External Dependencies
- Tesseract OCR engine (required for text extraction)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation Guide

### 1. Clone Repository
```bash
git clone https://github.com/anaya-rs/FlowCraft.git
cd FlowCraft
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment:
```bash
cd backend
python -m venv venv
```

Activate the virtual environment:
```bash
# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

Install Python dependencies:
```bash
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn sqlalchemy pydantic passlib python-jose python-multipart pillow pytesseract PyMuPDF aiofiles bcrypt email-validator
```

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend
npm install
```

### 4. Install Tesseract OCR
Download and install Tesseract OCR from the official repository:
- **Windows**: https://github.com/UB-Mannheim/tesseract/wiki
- **macOS**: `brew install tesseract`
- **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr`

Default installation path (Windows): `C:\Program Files\Tesseract-OCR\`

## Configuration

### Backend Configuration
The backend automatically creates:
- SQLite database (`flowcraft.db`)
- Uploads directory for file storage
- Required database tables on first run

### Environment Variables (Optional)
You can customize the following in `main.py`:
- `DATABASE_URL`: SQLite database path
- `SECRET_KEY`: JWT secret for authentication
- `UPLOAD_DIR`: Directory for uploaded files

### Tesseract Path (If needed)
If Tesseract is not in your system PATH, add this to `main.py`:
```python
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

## Running the Application

### Start Backend Server
From the backend directory:
```bash
python main.py
```
Server will start at: `http://localhost:8000`

API documentation available at: `http://localhost:8000/docs`

### Start Frontend Development Server
From the frontend directory:
```bash
npm run dev
```
Application will be available at: `http://localhost:8080`

## Application Usage

### Authentication
- Default login credentials: `admin@flowcraft.ai` / `admin123`
- Uses mock authentication for development purposes
- No registration required for testing

### Document Processing Workflow
1. **Upload Documents**: Navigate to Documents page and upload files
2. **OCR Processing**: Text is automatically extracted using Tesseract
3. **View Results**: Click the eye icon to view extracted text and metadata
4. **AI Analysis**: Automatic summary generation with confidence scoring
5. **Export Options**: Download extracted text as TXT files

### Model Creation
1. **Navigate to Models**: Access the Models page from navigation
2. **Choose Template**: Select from predefined processing templates
3. **Customize Prompt**: Modify AI processing instructions
4. **Configure Settings**: Adjust temperature, max tokens, response format
5. **Test Model**: Upload documents to test model performance

### Document Management
- **Search**: Filter documents by filename or content
- **Metadata**: View file size, upload date, and MIME type
- **Actions**: Preview, download, or delete documents
- **Confidence Scoring**: Visual indicators for OCR quality

## API Endpoints

### Authentication
- `POST /login` - User authentication
- `POST /register` - User registration

### Document Management
- `GET /documents` - List user documents
- `GET /documents/{id}` - Get specific document
- `POST /upload` - Upload and process document
- `DELETE /documents/{id}` - Delete document

### File Serving
- `GET /uploads/{filename}` - Serve uploaded files

## File Structure

```
FlowCraft/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── uploads/             # Uploaded files storage
│   ├── flowcraft.db         # SQLite database
│   └── venv/                # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   └── App.tsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json         # Node.js dependencies
└── README.md
```

## Technology Stack

### Frontend Technologies
- React 18 with TypeScript for type safety
- Vite for fast development and building
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- React Router for client-side routing

### Backend Technologies
- FastAPI for high-performance API development
- SQLAlchemy for database ORM
- Pydantic for data validation
- Tesseract OCR for text extraction
- PyMuPDF for PDF processing
- Python-JOSE for JWT token handling

## Troubleshooting

### Common Issues

**Backend won't start**
- Ensure virtual environment is activated
- Check all Python dependencies are installed
- Verify port 8000 is not in use

**Upload fails with "Invalid token"**
- Ensure you've logged in through the frontend
- Check browser localStorage for auth_token
- Restart both frontend and backend

**OCR extraction returns empty text**
- Verify Tesseract is properly installed
- Check image quality and text clarity
- Ensure supported file formats (PDF, PNG, JPG, JPEG)

**PDF preview not working**
- Browser compatibility issue with PDF rendering
- Use "Open in New Tab" button as fallback
- Check file permissions and accessibility

### Development Notes
- Backend uses mock authentication for development
- File uploads limited to 50MB
- SQLite database for development simplicity
- CORS enabled for all origins in development mode
