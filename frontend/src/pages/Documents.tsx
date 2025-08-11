import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  FileText, 
  Image, 
  File,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Tag,
  Calendar,
  Settings,
  ExternalLink
} from 'lucide-react'
import DocumentUpload from '../components/DocumentUpload'
import DocumentList from '../components/DocumentList'

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

export default function Documents() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showExportConfig, setShowExportConfig] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load initial documents from localStorage or use mock data
  useEffect(() => {
    const savedDocuments = localStorage.getItem('flowcraft_documents')
    if (savedDocuments) {
      try {
        setDocuments(JSON.parse(savedDocuments))
      } catch (error) {
        console.error('Error loading saved documents:', error)
        setDocuments(getInitialMockDocuments())
      }
    } else {
      setDocuments(getInitialMockDocuments())
    }
  }, [])

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('flowcraft_documents', JSON.stringify(documents))
    }
  }, [documents])

  const getInitialMockDocuments = (): Document[] => [
    {
      id: '1',
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
        'Vendor': 'TechCorp Inc.'
      },
      aiSummary: 'Professional invoice from TechCorp Inc. for software licensing services totaling $1,250.00, due within 30 days.',
      keyInsights: [
        { label: 'Invoice Number', value: 'INV-2024-001', confidence: 0.98, type: 'id' },
        { label: 'Total Amount', value: '$1,250.00', confidence: 0.95, type: 'currency' },
        { label: 'Due Date', value: '2024-02-14', confidence: 0.92, type: 'date' },
        { label: 'Vendor Name', value: 'TechCorp Inc.', confidence: 0.89, type: 'text' }
      ],
      isHandwritten: false,
      handwrittenConfidence: 0.02
    },
    {
      id: '2',
      filename: 'Contract_Agreement.pdf',
      originalFilename: 'Contract_Agreement.pdf',
      fileSize: 3145728,
      mimeType: 'application/pdf',
      processingStatus: 'processing',
      documentType: 'contract',
      ocrConfidence: null,
      createdAt: '2024-01-15T11:00:00Z',
      processedAt: null,
      tags: ['legal', 'contract'],
      keyValuePairs: {},
      aiSummary: 'Legal contract document currently being processed. Contains multiple pages with mixed printed and handwritten content.',
      keyInsights: [],
      isHandwritten: true,
      handwrittenConfidence: 0.78
    },
    {
      id: '3',
      filename: 'Financial_Report.jpg',
      originalFilename: 'Financial_Report.jpg',
      fileSize: 1572864,
      mimeType: 'image/jpeg',
      processingStatus: 'completed',
      documentType: 'report',
      ocrConfidence: 0.89,
      createdAt: '2024-01-14T15:45:00Z',
      processedAt: '2024-01-14T15:47:00Z',
      tags: ['finance', 'report', '2024'],
      keyValuePairs: {
        'Report Type': 'Financial Summary',
        'Period': 'Q4 2023',
        'Total Revenue': '$45,250.00'
      },
      aiSummary: 'Q4 2023 financial summary report showing strong revenue growth with total revenue of $45,250.00 and positive quarterly performance.',
      keyInsights: [
        { label: 'Report Period', value: 'Q4 2023', confidence: 0.96, type: 'text' },
        { label: 'Total Revenue', value: '$45,250.00', confidence: 0.93, type: 'currency' },
        { label: 'Growth Rate', value: '+12.5%', confidence: 0.87, type: 'number' },
        { label: 'Report Date', value: '2024-01-14', confidence: 0.91, type: 'date' }
      ],
      isHandwritten: false,
      handwrittenConfidence: 0.05
    }
  ]

  const handleDocumentUploaded = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev])
  }

  const handleUploadComplete = () => {
    // Refresh the documents list
    console.log('Upload complete, documents refreshed')
  }

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const handleDownloadDocument = (document: Document) => {
    // Create a mock download
    const blob = new Blob([`Document: ${document.originalFilename}\n\nAI Summary: ${document.aiSummary || 'No summary available'}\n\nKey Insights: ${JSON.stringify(document.keyInsights || [], null, 2)}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${document.originalFilename.replace(/\.[^/.]+$/, '')}_processed.txt`
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filters = [
    { id: 'all', name: 'All Documents', count: documents.length },
    { id: 'completed', name: 'Completed', count: documents.filter(d => d.processingStatus === 'completed').length },
    { id: 'processing', name: 'Processing', count: documents.filter(d => d.processingStatus === 'processing').length },
    { id: 'invoice', name: 'Invoices', count: documents.filter(d => d.documentType === 'invoice').length },
    { id: 'contract', name: 'Contracts', count: documents.filter(d => d.documentType === 'contract').length },
    { id: 'report', name: 'Reports', count: documents.filter(d => d.documentType === 'report').length }
  ]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.aiSummary && doc.aiSummary.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'completed' && doc.processingStatus === 'completed') ||
                         (selectedFilter === 'processing' && doc.processingStatus === 'processing') ||
                         doc.documentType === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-gray-400">
            Manage and analyze your documents with AI-powered intelligence
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Export Configuration Button */}
          <button
            onClick={() => setShowExportConfig(!showExportConfig)}
            className="glass-button-primary px-4 py-2 flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Export Config</span>
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="glass-button-outline px-4 py-2 flex items-center space-x-2"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            <span>{viewMode === 'grid' ? 'List' : 'Grid'}</span>
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
              showFilters 
                ? 'bg-primary-500 text-white' 
                : 'glass-button-outline'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </motion.div>

      {/* Export Configuration Panel */}
      {showExportConfig && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card-dark p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Export Configuration</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Active</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Export Format</label>
              <select className="glass-input w-full">
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="txt">TXT</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            
            {/* Destination Folder */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Destination Folder</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  placeholder="/exports/documents" 
                  className="glass-input flex-1"
                  defaultValue="/exports/documents"
                />
                <button className="glass-button-outline px-3 py-2">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* API Export Path */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">API Export Path</label>
              <input 
                type="text" 
                placeholder="https://api.example.com/webhook" 
                className="glass-input w-full"
              />
            </div>
            
            {/* Webhook Authentication */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
              <input 
                type="password" 
                placeholder="Enter API key" 
                className="glass-input w-full"
              />
            </div>
            
            {/* Auto Export */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Auto Export</label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-300">Enable automatic export</span>
                </label>
              </div>
            </div>
            
            {/* Export Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-400">Ready for export</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-glass-border">
            <button className="glass-button-outline px-4 py-2">Test Connection</button>
            <button className="glass-button-primary px-4 py-2">Save Configuration</button>
          </div>
        </motion.div>
      )}

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <DocumentUpload 
          onDocumentUploaded={handleDocumentUploaded}
          onUploadComplete={handleUploadComplete}
        />
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card-dark p-6"
      >
        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10"
            />
          </div>
          
          <div className="text-sm text-gray-400">
            {filteredDocuments.length} of {documents.length} documents
          </div>
        </div>

        {/* Filter Chips */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-gray-300">Filter by:</h3>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`filter-chip ${
                    selectedFilter === filter.id ? 'filter-chip-active' : ''
                  }`}
                >
                  {filter.name}
                  <span className="ml-2 px-2 py-0.5 bg-glass-white/20 rounded-full text-xs">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Documents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <DocumentList 
          documents={filteredDocuments} 
          viewMode={viewMode}
          onRefresh={() => {
            // Refresh documents
            console.log('Refreshing documents...')
          }}
        />
      </motion.div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card-dark p-12 text-center"
        >
          <div className="w-20 h-20 bg-glass-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No documents found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload your first document to get started'
            }
          </p>
          {!searchQuery && selectedFilter === 'all' && (
            <button className="glass-button">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}
