import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  List, 
  Grid3X3,
  Eye,
  Download,
  Trash2,
  MoreHorizontal,
  Calendar,
  File,
  Image,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  RotateCcw,
  X,
  Brain
} from 'lucide-react'
import DocumentUpload from '../components/DocumentUpload'
import { useDocumentProcessing } from '../hooks/useDocumentProcessing'
import { Document } from '../services/documentService'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import Card from '../components/ui/card'
import toast from 'react-hot-toast'
import { commonTypography, pageLayout, buttonStyles } from '../lib/typography'

const Documents: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showUpload, setShowUpload] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  const {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    retryProcessing,
    refreshDocuments,
    forceRefreshDocuments,
    processingDocuments,
    completedDocuments,
    failedDocuments
  } = useDocumentProcessing()

  // Ensure documents are properly typed
  const typedDocuments: Document[] = documents || []

  const navigate = useNavigate()

  // Initial load only - no auto-refresh to prevent jarring reloads
  useEffect(() => {
    refreshDocuments()
  }, [refreshDocuments])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-blue-400'
      case 'ocr_complete': return 'text-yellow-400'
      case 'ai_processing': return 'text-purple-400'
      case 'failed': return 'text-red-400'
      case 'uploaded': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case 'ocr_complete': return <FileText className="w-4 h-4 text-yellow-400" />
      case 'ai_processing': return <Brain className="w-4 h-4 text-purple-400 animate-spin" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />
      case 'uploaded': return <Loader2 className="w-4 h-4 text-orange-400 animate-pulse" />
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'processing': return 'OCR Processing'
      case 'ocr_complete': return 'OCR Complete'
      case 'ai_processing': return 'AI Analysis'
      case 'failed': return 'Failed'
      case 'uploaded': return 'Processing Started'
      default: return 'Unknown'
    }
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <FileText className="w-5 h-5 text-blue-400" />
      case 'contract': return <FileText className="w-5 h-5 text-green-400" />
      case 'receipt': return <Image className="w-5 h-5 text-yellow-400" />
      case 'report': return <FileText className="w-5 h-5 text-purple-400" />
      default: return <File className="w-5 h-5 text-gray-400" />
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'invoice': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'contract': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'receipt': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'report': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Working functionality
  const handleViewDocument = (docId: string) => {
    if (docId) {
      navigate(`/documents/${docId}`)
    }
  }

  const handleDownloadDocument = async (docId: string) => {
    if (docId) {
      try {
        await downloadDocument(docId)
      } catch (error) {
        toast.error('Download failed')
      }
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (docId) {
      try {
        await deleteDocument(docId)
        setSelectedDocuments(prev => prev.filter(id => id !== docId))
      } catch (error) {
        toast.error('Delete failed')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return
    
    if (window.confirm(`Are you sure you want to delete ${selectedDocuments.length} documents?`)) {
      try {
        for (const id of selectedDocuments) {
          await deleteDocument(id)
        }
        setSelectedDocuments([])
      } catch (error) {
        toast.error('Bulk delete failed')
      }
    }
  }

  const handleSelectDocument = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDocuments.length === typedDocuments.length) {
      setSelectedDocuments([])
    } else {
      setSelectedDocuments(typedDocuments.map(d => d.id))
    }
  }

  const handleRetryDocument = async (docId: string) => {
    try {
      await retryProcessing(docId)
      // Refresh documents to show updated status
      await refreshDocuments()
    } catch (error) {
      toast.error('Retry failed')
    }
  }

  const handleUploadSuccess = async () => {
    // Automatically refresh documents after successful upload
    await refreshDocuments()
    setShowUpload(false)
    toast.success('Document uploaded successfully!')
  }

  const handleUploadError = (error: string) => {
    toast.error(`Upload failed: ${error}`)
  }

  const filteredDocuments = typedDocuments.filter(doc => {
    const matchesSearch = doc.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.documentType?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || doc.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className={pageLayout.container}>
      {/* Header Section */}
      <div className={pageLayout.header.container}>
        <div className={pageLayout.header.content}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className={pageLayout.header.title}>Documents</h1>
              <p className={pageLayout.header.subtitle}>
                Manage and analyze your documents with AI-powered intelligence
              </p>
            </div>
            
            <div className={pageLayout.header.rightActions}>
              <Button
                onClick={() => setShowUpload(!showUpload)}
                variant="primary"
                size="sm"
                className={buttonStyles.primary}
              >
                <Upload className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Upload Document</span>
                <span className="sm:hidden">Upload</span>
              </Button>
              
              <Button
                onClick={() => setViewMode('grid')}
                variant="secondary"
                size="sm"
                className={`${buttonStyles.secondary} ${viewMode === 'grid' ? 'bg-orange-500 text-white' : ''}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                variant="secondary"
                size="sm"
                className={`${buttonStyles.secondary} ${viewMode === 'list' ? 'bg-orange-500 text-white' : ''}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={pageLayout.content.container}>
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Upload Section */}
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className={`${pageLayout.content.cardCompact} bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${commonTypography.subsectionTitle} text-white`}>Upload New Documents</h3>
                <Button
                  onClick={() => setShowUpload(false)}
                  variant="secondary"
                  size="sm"
                  className={buttonStyles.secondary}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <DocumentUpload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
            </Card>
          </motion.div>
        )}

        {/* Processing Status Summary */}
        {processingDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-blue-400 text-sm">
                {processingDocuments.length} document(s) currently processing
              </span>
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-blue-400 text-xs">Processing...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bulk Actions */}
        {selectedDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-orange-400 text-sm">
                {selectedDocuments.length} document(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleBulkDelete}
                  disabled={loading}
                  variant="danger"
                  size="sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Selected'}
                </Button>
                <Button
                  onClick={() => setSelectedDocuments([])}
                  variant="secondary"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </motion.div>
        )}

                 {/* Controls */}
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none text-sm w-64"
              />
            </div>
            
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none text-sm"
            >
              <option value="all">All Documents</option>
              <option value="completed">Completed</option>
              <option value="processing">OCR Processing</option>
              <option value="ocr_complete">OCR Complete</option>
              <option value="ai_processing">AI Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>


        </div>

        {/* Document Count */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{filteredDocuments.length} of {typedDocuments.length} documents</span>
          {typedDocuments.length > 0 && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDocuments.length === typedDocuments.length}
                onChange={handleSelectAll}
                className="rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
              />
              <span>Select All</span>
            </label>
          )}
        </div>

        {/* Documents Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200 ${
                  selectedDocuments.includes(doc.id) 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-700/50'
                }`}
              >
                {/* Selection checkbox */}
                <div className="flex items-start justify-between mb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => handleSelectDocument(doc.id)}
                      className="rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                    />
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                      {getDocumentTypeIcon(doc.documentType || 'unknown')}
                    </div>
                  </label>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(doc.status)}
                    <span className={`text-xs ${getStatusColor(doc.status)}`}>
                      {getStatusText(doc.status)}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-white mb-2 line-clamp-2">
                  {doc.originalFilename}
                </h3>
                
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Type:</span>
                    <span className={`px-2 py-1 rounded-full border ${getDocumentTypeColor(doc.documentType || 'unknown')}`}>
                      {doc.documentType || 'unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Size:</span>
                    <span>{formatFileSize(doc.fileSize || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  {doc.ocrConfidence && (
                    <div className="flex items-center justify-between">
                      <span>OCR:</span>
                      <span>{(doc.ocrConfidence * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-center space-x-2 mt-4 pt-3 border-t border-gray-700/50">
                  <Button 
                    onClick={() => handleViewDocument(doc.id)}
                    variant="secondary"
                    size="sm"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={() => handleDownloadDocument(doc.id)}
                    disabled={loading}
                    variant="secondary"
                    size="sm"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  </Button>
                  <Button 
                    onClick={() => handleDeleteDocument(doc.id)}
                    disabled={loading}
                    variant="secondary"
                    size="sm"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                  {doc.status === 'failed' && (
                    <Button 
                      onClick={() => handleRetryDocument(doc.id)}
                      disabled={loading}
                      variant="secondary"
                      size="sm"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200 ${
                  selectedDocuments.includes(doc.id) 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => handleSelectDocument(doc.id)}
                        className="rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                      />
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                        {getDocumentTypeIcon(doc.documentType || 'unknown')}
                      </div>
                    </label>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        {doc.originalFilename}
                      </h3>
                      <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                        <span className={`px-2 py-1 rounded-full border ${getDocumentTypeColor(doc.documentType || 'unknown')}`}>
                          {doc.documentType || 'unknown'}
                        </span>
                        <span>{formatFileSize(doc.fileSize || 0)}</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        {doc.ocrConfidence && (
                          <span>OCR: {(doc.ocrConfidence * 100).toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(doc.status)}
                      <span className={`text-xs ${getStatusColor(doc.status)}`}>
                        {getStatusText(doc.status)}
                      </span>
                    </div>
                    
                    {/* Retry button for failed documents */}
                    {doc.status === 'failed' && (
                      <Button
                        onClick={() => handleRetryDocument(doc.id)}
                        variant="secondary"
                        size="sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
                    <div className="flex items-center space-x-1">
                      <Button 
                        onClick={() => handleViewDocument(doc.id)}
                        variant="secondary"
                        size="sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={() => handleDownloadDocument(doc.id)}
                        disabled={loading}
                        variant="secondary"
                        size="sm"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </Button>
                      <Button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={loading}
                        variant="secondary"
                        size="sm"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                      {doc.status === 'failed' && (
                        <Button 
                          onClick={() => handleRetryDocument(doc.id)}
                          disabled={loading}
                          variant="secondary"
                          size="sm"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to get started'
              }
            </p>
            {!searchQuery && selectedFilter === 'all' && (
              <Button
                onClick={() => setShowUpload(true)}
                variant="primary"
              >
                Upload Document
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Documents
