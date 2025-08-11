# FlowCraft AI Frontend

A modern, privacy-first document processing platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Glass-morphism Design**: Beautiful dark theme with orange accents
- **Document Management**: Upload, view, and manage documents
- **AI Analysis**: Local Phi-3 AI processing with confidence scoring
- **Advanced OCR**: Multi-engine support (Tesseract, EasyOCR, TrOCR)
- **Smart Search**: Full-text search with advanced filters
- **Export System**: Multiple format support (JSON, CSV, TXT, PDF)
- **Responsive Design**: Mobile-first approach with smooth animations

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom glass-morphism theme
- **State Management**: React Query + Context API
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run format` - Format code with Prettier

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main app layout with sidebar
│   ├── Login.tsx       # Authentication component
│   ├── DocumentUpload.tsx # File upload with drag & drop
│   └── DocumentList.tsx   # Document grid/list views
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Documents.tsx   # Document management
│   ├── DocumentView.tsx # Individual document view
│   ├── Models.tsx      # AI model management
│   ├── Settings.tsx    # User preferences
│   └── NotFound.tsx    # 404 page
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication logic
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

### Styling

The app uses a custom Tailwind CSS configuration with:

- **Glass-morphism effects**: Backdrop blur and transparency
- **Custom color palette**: Orange (#ff6b35, #f7931e) with dark theme
- **Responsive design**: Mobile-first approach
- **Smooth animations**: CSS transitions and Framer Motion

### Authentication

- JWT-based authentication
- Mock credentials: `admin@flowcraft.ai` / `admin123`
- Automatic token refresh
- Protected routes

## 🎨 Design System

### Color Palette

- **Primary**: Orange (#ff6b35, #f7931e)
- **Dark Theme**: Slate grays (#0f172a to #f8fafc)
- **Glass Effects**: Semi-transparent whites and darks

### Components

- **Glass Cards**: Semi-transparent backgrounds with backdrop blur
- **Gradient Buttons**: Orange gradients with hover effects
- **Status Indicators**: Color-coded processing states
- **Progress Bars**: Animated progress indicators

## 📱 Responsive Design

- **Mobile**: Bottom navigation, stacked layouts
- **Tablet**: Collapsible sidebar, grid layouts
- **Desktop**: Full sidebar, multi-column grids

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test -- --coverage
```

## 🚀 Deployment

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Serve the dist folder** with any static file server

3. **Environment variables**:
   - `VITE_API_URL`: Backend API URL (defaults to localhost:8000)

## 🔒 Security Features

- **Privacy-first**: All processing happens locally
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schema validation
- **XSS Protection**: React's built-in protection

## 🌟 Key Features

### Document Processing
- Drag & drop file upload
- Multi-format support (PDF, images, text)
- Real-time processing status
- Confidence scoring

### AI Integration
- Local Phi-3 AI model
- Custom prompt templates
- Batch processing
- Model management

### User Experience
- Smooth animations
- Keyboard shortcuts
- Accessibility compliance
- Error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

---