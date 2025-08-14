import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileText, Image } from 'lucide-react'
import { useDocumentProcessing } from '../hooks/useDocumentProcessing'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'

interface FileStatus {
  id: string
  file: File
  status: 'uploading' | 'uploaded' | 'processing' | 'ocr_complete' | 'ai_processing' | 'completed' | 'failed'
  progress: number
  error?: string
}

interface DocumentUploadProps {
  onUploadSuccess?: () => void
  onUploadError?: (error: string) => void
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const { uploadDocument, error: serviceError } = useDocumentProcessing()
  const { isAuthenticated } = useAuth()
  const [files, setFiles] = useState<FileStatus[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    if (!isAuthenticated) {
      if (onUploadError) {
        onUploadError("You must be logged in to upload documents")
      }
      return
    }

    setUploading(true)

    // Create file status entries
    const newFiles: FileStatus[] = acceptedFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      file,
      status: 'uploading',
      progress: 0,
    }))

    setFiles(prev => [...newFiles, ...prev])

    // Upload each file
    for (const fileStatus of newFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileStatus.id 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ))

        // Upload with progress tracking
        await uploadDocument(fileStatus.file)

        // Update status to uploaded (processing will start)
        setFiles(prev => prev.map(f => 
          f.id === fileStatus.id 
            ? { ...f, status: 'uploaded', progress: 100 }
            : f
        ))
        
        // Notify parent component of successful upload
        if (onUploadSuccess) {
          onUploadSuccess()
        }

      } catch (error: any) {
        // Update status to failed
        setFiles(prev => prev.map(f => 
          f.id === fileStatus.id 
            ? { ...f, status: 'failed', error: error.message }
            : f
        ))
        
        // Notify parent component of upload error
        if (onUploadError) {
          onUploadError(error.message)
        }
      }
    }

    setUploading(false)
  }, [uploadDocument, isAuthenticated, onUploadSuccess, onUploadError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.bmp', '.tiff'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploading || !isAuthenticated,
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const getStatusIcon = (status: FileStatus['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
      case 'uploaded':
        return <Loader2 className="w-4 h-4 animate-pulse text-yellow-400" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
      case 'ocr_complete':
        return <FileText className="w-4 h-4 text-green-400" />
      case 'ai_processing':
        return <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Upload className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: FileStatus['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-400'
      case 'uploaded':
        return 'text-yellow-400'
      case 'processing':
        return 'text-orange-400'
      case 'ocr_complete':
        return 'text-green-400'
      case 'ai_processing':
        return 'text-purple-400'
      case 'completed':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusText = (status: FileStatus['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...'
      case 'uploaded':
        return 'Processing started...'
      case 'processing':
        return 'OCR processing...'
      case 'ocr_complete':
        return 'OCR completed, AI processing...'
      case 'ai_processing':
        return 'AI analysis in progress...'
      case 'completed':
        return 'Processing completed'
      case 'failed':
        return 'Processing failed'
      default:
        return 'Ready to upload'
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') return <FileText className="w-4 h-4" />
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-400 font-sans">Authentication Required</h3>
          </div>
          <p className="text-yellow-300 font-sans">
            You must be logged in to upload documents. Please sign in to continue.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
            isDragActive
              ? 'border-orange-400 bg-orange-500/10'
              : 'border-gray-700/50 hover:border-orange-500/50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white font-sans">
                {isDragActive ? 'Drop files here' : 'Upload Documents'}
              </h3>
              <p className="text-sm text-gray-400 mt-2 font-sans">
                Drag and drop files here, or click to select
              </p>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>Supported: PDF, PNG, JPG, JPEG, BMP, TIFF</p>
              <p>Max size: 50MB</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      {serviceError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm font-medium">{serviceError}</span>
          </div>
        </motion.div>
      )}

      {/* File Status List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white font-sans">Upload Progress</h4>
          
          {files.map((fileStatus) => (
            <motion.div
              key={fileStatus.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                    {getFileIcon(fileStatus.file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-white truncate font-sans">
                      {fileStatus.file.name}
                    </h5>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(fileStatus.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(fileStatus.status)}
                    <span className={`text-xs font-medium ${getStatusColor(fileStatus.status)} font-sans`}>
                      {getStatusText(fileStatus.status)}
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => removeFile(fileStatus.id)}
                    variant="ghost"
                    size="sm"
                    icon={<X className="w-4 h-4" />}
                    title="Remove file"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              {fileStatus.status === 'uploading' && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fileStatus.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center font-sans">
                    {fileStatus.progress}% uploaded
                  </p>
                </div>
              )}

              {/* Error Display */}
              {fileStatus.error && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-red-400 text-sm font-medium font-sans">{fileStatus.error}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DocumentUpload
