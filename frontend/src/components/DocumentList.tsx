import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  FileText, 
  Image, 
  File, 
  Eye, 
  Download, 
  Trash2, 
  RefreshCw, 
  Tag,
  Calendar,
  HardDrive,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Brain,
  Target,
  TrendingUp
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

interface DocumentListProps {
  documents: Document[]
  viewMode: 'grid' | 'list'
  onRefresh: () => void
}

export default function DocumentList({ documents, viewMode, onRefresh }: DocumentListProps) {
  const navigate = useNavigate()

  const handleViewDocument = (documentId: string) => {
    navigate(`/documents/${documentId}/view`)
  }

  const handleDeleteDocument = (documentId: string) => {
    // Remove from localStorage
    const savedDocuments = localStorage.getItem('flowcraft_documents')
    if (savedDocuments) {
      try {
        const allDocuments = JSON.parse(savedDocuments)
        const updatedDocuments = allDocuments.filter((doc: any) => doc.id !== documentId)
        localStorage.setItem('flowcraft_documents', JSON.stringify(updatedDocuments))
        
        // Show success message
        toast.success('Document deleted successfully')
        
        // Refresh the page to update the list
        window.location.reload()
      } catch (error) {
        console.error('Error deleting document:', error)
        toast.error('Failed to delete document')
      }
    }
  }

  const handleDownloadDocument = (document: Document) => {
    try {
      // Create a mock download with processed data
      const content = `Document: ${document.originalFilename}
      
AI Summary: ${document.aiSummary || 'No summary available'}

Key Insights:
${document.keyInsights?.map(insight => `- ${insight.label}: ${insight.value} (${Math.round(insight.confidence * 100)}% confidence)`).join('\n') || 'No insights available'}

Processing Details:
- Status: ${document.processingStatus}
- Document Type: ${document.documentType}
- OCR Confidence: ${document.ocrConfidence ? Math.round(document.ocrConfidence * 100) + '%' : 'N/A'}
- Created: ${new Date(document.createdAt).toLocaleDateString()}
- Tags: ${document.tags.join(', ')}

Key-Value Pairs:
${Object.entries(document.keyValuePairs).map(([key, value]) => `- ${key}: ${value}`).join('\n')}`

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = `${document.originalFilename.replace(/\.[^/.]+$/, '')}_processed.txt`
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Document downloaded successfully')
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Failed to download document')
    }
  }

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
      month: 'short',
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

  if (viewMode === 'grid') {
    return (
      <div className="document-grid">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="document-card group"
          >
            {/* Document Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileTypeColor(doc.mimeType)} bg-glass-white/10`}>
                {getFileIcon(doc.mimeType)}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.processingStatus)}`}>
                  {doc.processingStatus}
                </span>
                {doc.isHandwritten && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                    Handwritten
                  </span>
                )}
                <button className="p-1 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Info */}
            <div className="mb-4">
              <h3 className="font-semibold text-white mb-2 line-clamp-2">
                {doc.originalFilename}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4" />
                  <span>{formatFileSize(doc.fileSize)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(doc.createdAt)}</span>
                </div>
                
                {doc.ocrConfidence && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className={getConfidenceColor(doc.ocrConfidence)}>
                      OCR: {Math.round(doc.ocrConfidence * 100)}%
                    </span>
                  </div>
                )}

                {doc.handwrittenConfidence && (
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span className={getConfidenceColor(doc.handwrittenConfidence)}>
                      Handwriting: {Math.round(doc.handwrittenConfidence * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Summary */}
            {doc.aiSummary && (
              <div className="mb-4 p-3 bg-glass-white/5 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-primary-400" />
                  <span className="text-xs font-medium text-primary-400">AI Summary</span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-3">
                  {doc.aiSummary}
                </p>
              </div>
            )}

            {/* Key Insights */}
            {doc.keyInsights && doc.keyInsights.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Key Insights</span>
                </div>
                <div className="space-y-2">
                  {doc.keyInsights.slice(0, 3).map((insight, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(insight.type)}
                        <span className="text-gray-400">{insight.label}:</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{insight.value}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getConfidenceBadge(insight.confidence)}`}>
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                  {doc.keyInsights.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{doc.keyInsights.length - 3} more insights
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {doc.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {doc.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 3 && (
                    <span className="px-2 py-1 bg-glass-white/20 text-gray-400 text-xs rounded-full">
                      +{doc.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-glass-border">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleViewDocument(doc.id)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDownloadDocument(doc)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              
              <button 
                onClick={() => handleDeleteDocument(doc.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // List view
  return (
    <div className="glass-card-dark overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-glass-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                AI Summary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Key Insights
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {documents.map((doc, index) => (
              <motion.tr
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-glass-white/5 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFileTypeColor(doc.mimeType)} bg-glass-white/10`}>
                      {getFileIcon(doc.mimeType)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {doc.originalFilename}
                      </div>
                      <div className="text-sm text-gray-400">
                        {doc.documentType}
                        {doc.isHandwritten && (
                          <span className="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                            Handwritten
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    {doc.aiSummary ? (
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {doc.aiSummary}
                      </p>
                    ) : (
                      <span className="text-sm text-gray-500 italic">No summary available</span>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    {doc.keyInsights && doc.keyInsights.length > 0 ? (
                      <div className="space-y-1">
                        {doc.keyInsights.slice(0, 2).map((insight, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{insight.label}:</span>
                            <span className="text-white font-medium">{insight.value}</span>
                          </div>
                        ))}
                        {doc.keyInsights.length > 2 && (
                          <span className="text-xs text-gray-500">+{doc.keyInsights.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic">No insights</span>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(doc.processingStatus)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.processingStatus)}`}>
                      {doc.processingStatus}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {doc.ocrConfidence && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">OCR:</span>
                        <span className={`text-xs font-medium ${getConfidenceColor(doc.ocrConfidence)}`}>
                          {Math.round(doc.ocrConfidence * 100)}%
                        </span>
                      </div>
                    )}
                    {doc.handwrittenConfidence && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">HW:</span>
                        <span className={`text-xs font-medium ${getConfidenceColor(doc.handwrittenConfidence)}`}>
                          {Math.round(doc.handwrittenConfidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleViewDocument(doc.id)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDownloadDocument(doc)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty state */}
      {documents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-glass-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No documents found</h3>
          <p className="text-gray-400">Upload your first document to get started</p>
        </div>
      )}
    </div>
  )
}
