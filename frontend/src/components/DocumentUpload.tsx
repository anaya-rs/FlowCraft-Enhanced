import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, FileText, Image, File, X, CheckCircle, AlertCircle, Brain } from 'lucide-react'
import toast from 'react-hot-toast'

interface UploadedFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  documentId?: string
}

interface DocumentUploadProps {
  onDocumentUploaded?: (document: any) => void
  onUploadComplete?: () => void
}

export default function DocumentUpload({ onDocumentUploaded, onUploadComplete }: DocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Simulate document processing with proper state management
  const processDocument = async (fileInfo: UploadedFile) => {
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
      
      // Create mock document data
      const mockDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filename: fileInfo.file.name,
        originalFilename: fileInfo.file.name,
        fileSize: fileInfo.file.size,
        mimeType: fileInfo.file.type,
        processingStatus: 'completed',
        documentType: getDocumentType(fileInfo.file.type),
        ocrConfidence: 0.85 + Math.random() * 0.15,
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        tags: generateTags(fileInfo.file.type),
        keyValuePairs: generateKeyValuePairs(fileInfo.file.name),
        aiSummary: generateAISummary(fileInfo.file.name, fileInfo.file.type),
        keyInsights: generateKeyInsights(fileInfo.file.name),
        isHandwritten: Math.random() > 0.7,
        handwrittenConfidence: Math.random() > 0.7 ? 0.6 + Math.random() * 0.3 : 0.1
      }

      // Update file status to completed
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileInfo.id 
          ? { ...f, status: 'completed', documentId: mockDocument.id }
          : f
      ))

      // Notify parent component
      if (onDocumentUploaded) {
        onDocumentUploaded(mockDocument)
      }

      toast.success(`${fileInfo.file.name} processed successfully!`)
      
      return mockDocument
    } catch (error) {
      console.error('Error processing document:', error)
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileInfo.id 
          ? { ...f, status: 'error', error: 'Processing failed' }
          : f
      ))
      toast.error(`Failed to process ${fileInfo.file.name}`)
    }
  }

  const getDocumentType = (mimeType: string): string => {
    if (mimeType === 'application/pdf') return 'pdf'
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType === 'text/plain') return 'text'
    return 'document'
  }

  const generateTags = (mimeType: string): string[] => {
    const tags = []
    if (mimeType === 'application/pdf') tags.push('pdf', 'document')
    if (mimeType.startsWith('image/')) tags.push('image', 'visual')
    if (mimeType === 'text/plain') tags.push('text', 'plain')
    
    // Add random business tags
    const businessTags = ['business', 'finance', 'legal', 'contract', 'invoice', 'report']
    tags.push(businessTags[Math.floor(Math.random() * businessTags.length)])
    
    return tags
  }

  const generateKeyValuePairs = (filename: string): Record<string, string> => {
    const pairs: Record<string, string> = {}
    
    if (filename.toLowerCase().includes('invoice')) {
      pairs['Invoice Number'] = `INV-${Date.now().toString().slice(-6)}`
      pairs['Amount'] = `$${(Math.random() * 1000 + 100).toFixed(2)}`
      pairs['Date'] = new Date().toISOString().split('T')[0]
      pairs['Vendor'] = 'Sample Vendor Inc.'
    } else if (filename.toLowerCase().includes('contract')) {
      pairs['Contract ID'] = `CTR-${Date.now().toString().slice(-6)}`
      pairs['Parties'] = 'Company A & Company B'
      pairs['Effective Date'] = new Date().toISOString().split('T')[0]
      pairs['Term'] = '12 months'
    } else {
      pairs['Document Type'] = getDocumentType(filename.split('.').pop() || '')
      pairs['Processed Date'] = new Date().toISOString().split('T')[0]
      pairs['File Size'] = `${(Math.random() * 1000 + 100).toFixed(0)} KB`
    }
    
    return pairs
  }

  const generateAISummary = (filename: string, mimeType: string): string => {
    if (filename.toLowerCase().includes('invoice')) {
      return 'Professional invoice document containing billing information, payment terms, and line items for services rendered. The document is well-structured and ready for processing.'
    } else if (filename.toLowerCase().includes('contract')) {
      return 'Legal contract document with multiple clauses and terms. Contains signature blocks and legal language requiring careful review and analysis.'
    } else if (mimeType.startsWith('image/')) {
      return 'Image document successfully processed with OCR technology. Text extraction completed with high confidence scores for accurate data capture.'
    } else {
      return 'Document successfully processed and analyzed. AI extraction completed with comprehensive data structure and metadata generation.'
    }
  }

  const generateKeyInsights = (filename: string) => {
    const insights = []
    
    if (filename.toLowerCase().includes('invoice')) {
      insights.push(
        { label: 'Invoice Number', value: `INV-${Date.now().toString().slice(-6)}`, confidence: 0.98, type: 'id' as const },
        { label: 'Total Amount', value: `$${(Math.random() * 1000 + 100).toFixed(2)}`, confidence: 0.95, type: 'currency' as const },
        { label: 'Due Date', value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], confidence: 0.92, type: 'date' as const }
      )
    } else if (filename.toLowerCase().includes('contract')) {
      insights.push(
        { label: 'Contract ID', value: `CTR-${Date.now().toString().slice(-6)}`, confidence: 0.96, type: 'id' as const },
        { label: 'Effective Date', value: new Date().toISOString().split('T')[0], confidence: 0.94, type: 'date' as const },
        { label: 'Contract Type', value: 'Service Agreement', confidence: 0.89, type: 'text' as const }
      )
    } else {
      insights.push(
        { label: 'Document Type', value: 'General Document', confidence: 0.87, type: 'text' as const },
        { label: 'Processed Date', value: new Date().toISOString().split('T')[0], confidence: 0.91, type: 'date' as const },
        { label: 'Confidence Score', value: `${(85 + Math.random() * 15).toFixed(1)}%`, confidence: 0.88, type: 'number' as const }
      )
    }
    
    return insights
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading' as const
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    setIsUploading(true)

    // Process each file through the pipeline
    newFiles.forEach(async (fileInfo) => {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === fileInfo.id && f.status === 'uploading') {
            const newProgress = Math.min(f.progress + Math.random() * 15, 100)
            if (newProgress >= 100) {
              clearInterval(uploadInterval)
              return { ...f, progress: 100, status: 'processing' }
            }
            return { ...f, progress: newProgress }
          }
          return f
        }))
      }, 150)

      // Wait for upload to complete, then process
      setTimeout(async () => {
        await processDocument(fileInfo)
        
        // Check if all files are complete
        const allComplete = uploadedFiles.every(f => f.status === 'completed' || f.status === 'error')
        if (allComplete) {
          setIsUploading(false)
          if (onUploadComplete) {
            onUploadComplete()
          }
        }
      }, 3000 + Math.random() * 2000)
    })
  }, [uploadedFiles, onDocumentUploaded, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.bmp', '.tiff'],
      'text/plain': ['.txt']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="w-6 h-6" />
    if (file.type.startsWith('image/')) return <Image className="w-6 h-6" />
    return <File className="w-6 h-6" />
  }

  const getFileTypeColor = (file: File) => {
    if (file.type === 'application/pdf') return 'text-red-400'
    if (file.type.startsWith('image/')) return 'text-green-400'
    return 'text-blue-400'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Clean up completed files after 10 seconds
  useEffect(() => {
    const cleanupTimer = setTimeout(() => {
      setUploadedFiles(prev => prev.filter(f => f.status !== 'completed'))
    }, 10000)

    return () => clearTimeout(cleanupTimer)
  }, [uploadedFiles])

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card-dark p-8"
      >
        <div
          {...getRootProps()}
          className={`upload-area ${isDragActive ? 'upload-area-active' : ''} cursor-pointer transition-all duration-300`}
        >
          <input {...getInputProps()} />
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary-500" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Documents'}
            </h3>
            
            <p className="text-gray-400 mb-4">
              Drag and drop your documents here, or click to browse
            </p>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>Supported formats: PDF, PNG, JPG, JPEG, BMP, TIFF, TXT</p>
              <p>Maximum file size: 50MB</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upload Progress */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card-dark p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Upload Progress ({uploadedFiles.filter(f => f.status === 'completed').length}/{uploadedFiles.length})
          </h3>
          
          <div className="space-y-4">
            {uploadedFiles.map((fileInfo) => (
              <motion.div
                key={fileInfo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4 p-4 rounded-lg bg-glass-white/5"
              >
                {/* File Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileTypeColor(fileInfo.file)} bg-glass-white/10`}>
                  {getFileIcon(fileInfo.file)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {fileInfo.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(fileInfo.file.size)} • {fileInfo.file.type}
                  </p>
                </div>

                {/* Progress */}
                <div className="flex-1 max-w-xs">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${fileInfo.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.round(fileInfo.progress)}%
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  {fileInfo.status === 'uploading' && (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {fileInfo.status === 'processing' && (
                    <div className="flex items-center space-x-1">
                      <Brain className="w-4 h-4 text-primary-500 animate-pulse" />
                      <span className="text-xs text-primary-500">AI Processing</span>
                    </div>
                  )}
                  {fileInfo.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {fileInfo.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  
                  <button
                    onClick={() => removeFile(fileInfo.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Upload Actions */}
          {isUploading && (
            <div className="mt-6 pt-4 border-t border-glass-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Processing documents with AI...
                </p>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-primary-500 animate-pulse" />
                  <span className="text-sm text-primary-500">AI Analysis</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
