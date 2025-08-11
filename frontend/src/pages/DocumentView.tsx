import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Download, 
  Share, 
  Trash2, 
  Edit, 
  Eye,
  Brain,
  FileText,
  Image,
  File,
  CheckCircle,
  AlertCircle,
  Clock,
  Tag,
  Calendar,
  HardDrive,
  Target,
  TrendingUp,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react'

interface Document {
  id: string
  filename: string
  originalFilename: string
  fileSize: number
  mimeType: string
  processingStatus: string
  documentType: string
  ocrConfidence: number | null
  createdAt: string
  processedAt: string | null
  tags: string[]
  keyValuePairs: Record<string, string>
  aiSummary?: string
  keyInsights?: Array<{
    label: string
    value: string
    confidence: number
    type: 'text' | 'number' | 'date' | 'currency' | 'id'
  }>
  isHandwritten?: boolean
  handwrittenConfidence?: number
}

export default function DocumentView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'preview' | 'analysis' | 'export'>('preview')
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [zoom, setZoom] = useState(100)

  // Mock document data - in real app this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDocument({
        id: id || '1',
        filename: 'Invoice_2024_001.pdf',
        originalFilename: 'Invoice_2024_001.pdf',
        fileSize: 2457600,
        mimeType: 'application/pdf',
        processingStatus: 'completed',
        documentType: 'invoice',
        ocrConfidence: 0.94,
        createdAt: '2024-01-15T10:30:00Z',
        processedAt: '2024-01-15T10:32:00Z',
        tags: ['finance', 'invoice', '2024'],
        keyValuePairs: {
          'Invoice Number': 'INV-2024-001',
          'Amount': '$1,250.00',
          'Date': '2024-01-15',
          'Vendor': 'TechCorp Inc.',
          'Due Date': '2024-02-15',
          'Payment Terms': 'Net 30',
          'Line Items': 'Software License, Support Services'
        },
        aiSummary: 'Professional invoice from TechCorp Inc. for software licensing services totaling $1,250.00, due within 30 days. The document contains clear payment terms and detailed line items for services rendered.',
        keyInsights: [
          { label: 'Invoice Number', value: 'INV-2024-001', confidence: 0.98, type: 'id' },
          { label: 'Total Amount', value: '$1,250.00', confidence: 0.95, type: 'currency' },
          { label: 'Due Date', value: '2024-02-15', confidence: 0.92, type: 'date' },
          { label: 'Vendor Name', value: 'TechCorp Inc.', confidence: 0.89, type: 'text' },
          { label: 'Payment Terms', value: 'Net 30', confidence: 0.87, type: 'text' }
        ],
        isHandwritten: false,
        handwrittenConfidence: 0.02
      })
      setIsLoading(false)
    }, 1000)
  }, [id])

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') return <FileText className="w-6 h-6" />
    if (mimeType.startsWith('image/')) return <Image className="w-6 h-6" />
    return <File className="w-6 h-6" />
  }

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType === 'application/pdf') return 'text-red-400'
    if (mimeType.startsWith('image/')) return 'text-green-400'
    return 'text-blue-400'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Clock className="w-4 h-4 text-primary-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'processing':
        return 'bg-primary-500/20 text-primary-400'
      case 'error':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-500/20 text-green-400'
    if (confidence >= 0.7) return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-red-500/20 text-red-400'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-3 h-3" />
      case 'number': return <TrendingUp className="w-3 h-3" />
      case 'date': return <Calendar className="w-3 h-3" />
      case 'currency': return <Target className="w-3 h-3" />
      case 'id': return <Tag className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="glass-card-dark p-8 text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading document...</h2>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="p-8 text-center">
        <div className="glass-card-dark p-8">
          <h2 className="text-xl font-semibold text-white mb-2">Document not found</h2>
          <p className="text-gray-400 mb-4">The document you're looking for doesn't exist</p>
          <button
            onClick={() => navigate('/documents')}
            className="glass-button"
          >
            Back to Documents
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-gradient-dark' : 'p-8'} space-y-6`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-glass-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileTypeColor(document.mimeType)} bg-glass-white/10`}>
              {getFileIcon(document.mimeType)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{document.originalFilename}</h1>
              <p className="text-gray-400">
                {document.documentType} • {formatFileSize(document.fileSize)}
                {document.isHandwritten && (
                  <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                    Handwritten
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-glass-white/10 rounded-lg p-1">
            <button 
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm text-gray-300 min-w-[3rem] text-center">{zoom}%</span>
            <button 
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Full Screen Toggle */}
          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-glass-white/10"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <button className="glass-button-outline px-4 py-2 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          
          <button className="glass-button-outline px-4 py-2 flex items-center space-x-2">
            <Share className="w-4 h-4" />
            <span>Share</span>
          </button>
          
          <button className="glass-button-outline px-4 py-2 flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          
          <button className="glass-button-outline px-4 py-2 flex items-center space-x-2 text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </motion.div>

      {/* Side-by-Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card-dark p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Document Preview</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Zoom: {zoom}%</span>
            </div>
          </div>
          
          {/* Document Preview Area */}
          <div className="bg-glass-white/5 rounded-lg border-2 border-dashed border-glass-border p-12 text-center">
            <div className="w-24 h-24 bg-glass-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              {getFileIcon(document.mimeType)}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Document Preview</h3>
            <p className="text-gray-400 mb-4">
              {document.mimeType === 'application/pdf' 
                ? 'PDF viewer integration coming soon'
                : 'Image viewer integration coming soon'
              }
            </p>
            <div className="text-xs text-gray-500">
              {document.originalFilename} • {formatFileSize(document.fileSize)}
            </div>
          </div>
        </motion.div>

        {/* AI Analysis Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card-dark p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
          </div>
          
          {/* AI Summary */}
          {document.aiSummary && (
            <div className="mb-6 p-4 bg-glass-white/5 rounded-lg">
              <h3 className="text-sm font-medium text-primary-400 mb-2">AI Summary</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {document.aiSummary}
              </p>
            </div>
          )}

          {/* Key Insights */}
          {document.keyInsights && document.keyInsights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-green-400 mb-3">Key Insights</h3>
              <div className="space-y-2">
                {document.keyInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-glass-white/5 rounded">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(insight.type)}
                      <span className="text-sm text-gray-400">{insight.label}:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white font-medium">{insight.value}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getConfidenceBadge(insight.confidence)}`}>
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-blue-400 mb-3">Processing Details</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.processingStatus)}`}>
                {document.processingStatus}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Document Type</span>
              <span className="text-sm text-white capitalize">{document.documentType}</span>
            </div>
            
            {document.ocrConfidence && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">OCR Confidence</span>
                <span className={`text-sm font-medium ${getConfidenceColor(document.ocrConfidence)}`}>
                  {Math.round(document.ocrConfidence * 100)}%
                </span>
              </div>
            )}

            {document.handwrittenConfidence && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Handwriting Detection</span>
                <span className={`text-sm font-medium ${getConfidenceColor(document.handwrittenConfidence)}`}>
                  {Math.round(document.handwrittenConfidence * 100)}%
                </span>
              </div>
            )}
            
            {document.processedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Processed</span>
                <span className="text-sm text-white">{formatDate(document.processedAt)}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Document Info & Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-card-dark p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-glass-white/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Created</p>
              <p className="text-white font-medium">{formatDate(document.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-glass-white/10 rounded-lg flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">File Size</p>
              <p className="text-white font-medium">{formatFileSize(document.fileSize)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-glass-white/10 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">AI Processing</p>
              <p className="text-white font-medium">
                {document.aiSummary ? 'Completed' : 'In Progress'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="pt-4 border-t border-glass-border">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
