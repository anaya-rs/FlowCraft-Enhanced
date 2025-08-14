import { useState, useEffect, useCallback, useRef } from 'react'
import { Document, ProcessingStatus } from '../services/documentService'
import documentService from '../services/documentService'

interface UseDocumentProcessingReturn {
  documents: Document[]
  loading: boolean
  error: string | null
  uploadDocument: (file: File) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  downloadDocument: (id: string) => Promise<void>
  retryProcessing: (id: string) => Promise<void>
  refreshDocuments: () => Promise<void>
  forceRefreshDocuments: () => Promise<void>
  processingDocuments: Document[]
  completedDocuments: Document[]
  failedDocuments: Document[]
}

export function useDocumentProcessing(): UseDocumentProcessingReturn {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingDocuments, setProcessingDocuments] = useState<Document[]>([])
  const [completedDocuments, setCompletedDocuments] = useState<Document[]>([])
  const [failedDocuments, setFailedDocuments] = useState<Document[]>([])

  // Refs for tracking processing documents
  const processingRef = useRef<Set<string>>(new Set())
  const statusPollingRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Load documents on mount
  useEffect(() => {
    refreshDocuments()
  }, [])

  // Update document lists when documents change
  useEffect(() => {
    console.log('Updating document lists with statuses:', documents.map(d => ({ id: d.id, status: d.status })))
    
    setProcessingDocuments(documents.filter(d => 
      ['uploaded', 'processing', 'ocr_complete', 'ai_processing'].includes(d.status)
    ))
    setCompletedDocuments(documents.filter(d => d.status === 'completed'))
    setFailedDocuments(documents.filter(d => d.status === 'failed'))
    
    console.log('Document lists updated:', {
      processing: documents.filter(d => ['uploaded', 'processing', 'ocr_complete', 'ai_processing'].includes(d.status)).length,
      completed: documents.filter(d => d.status === 'completed').length,
      failed: documents.filter(d => d.status === 'failed').length
    })
  }, [documents])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      statusPollingRef.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  // Start polling for document status
  const startStatusPolling = useCallback((documentId: string) => {
    if (statusPollingRef.current.has(documentId)) return

    const pollStatus = async () => {
      try {
        const status = await documentService.getDocumentStatus(documentId)
        
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: status.status, error: status.error || null }
            : doc
        ))

        // Stop polling if processing is complete or failed
        if (['completed', 'failed'].includes(status.status)) {
          stopStatusPolling(documentId)
          processingRef.current.delete(documentId)
          
          // Update the document status in local state
          setDocuments(prev => prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: status.status, error: status.error || null }
              : doc
          ))
        } else {
        }
      } catch (error) {
        console.error('Failed to poll document status:', error)
      }
    }

    // Start polling immediately
    pollStatus()
  }, [])

  // Stop polling for document status
  const stopStatusPolling = useCallback((documentId: string) => {
    const timeout = statusPollingRef.current.get(documentId)
    if (timeout) {
      clearTimeout(timeout)
      statusPollingRef.current.delete(documentId)
    }
  }, [])

  // Upload document
  const uploadDocument = useCallback(async (file: File) => {
    try {
      setError(null)
      setLoading(true)

      // Create temporary document entry
      const tempDoc: Document = {
        id: `temp-${Date.now()}`,
        filename: file.name,
        originalFilename: file.name,
        mimeType: file.type,
        status: 'uploaded',
        createdAt: new Date().toISOString(),
        fileSize: file.size,
      }

      setDocuments(prev => [tempDoc, ...prev])

      // Upload with progress tracking
      const uploadedDoc = await documentService.uploadDocument(file)

      // Replace temp document with real one
      setDocuments(prev => prev.map(doc => 
        doc.id === tempDoc.id ? uploadedDoc : doc
      ))

      // Start status polling for processing documents
      if (['uploaded', 'processing', 'ocr_complete', 'ai_processing'].includes(uploadedDoc.status)) {
        processingRef.current.add(uploadedDoc.id)
        // Don't start automatic polling - let user manually refresh if needed
        // startStatusPolling(uploadedDoc.id)
      }

    } catch (error: any) {
      setError(error.message)
      // Remove temp document on error
      setDocuments(prev => prev.filter(doc => !doc.id.startsWith('temp-')))
    } finally {
      setLoading(false)
    }
  }, [startStatusPolling])

  // Delete document
  const deleteDocument = useCallback(async (id: string) => {
    try {
      await documentService.deleteDocument(id)
      
      // Stop polling if document was being processed
      stopStatusPolling(id)
      processingRef.current.delete(id)
      
      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== id))
    } catch (error: any) {
      setError(error.message)
    }
  }, [stopStatusPolling])

  // Download document
  const downloadDocument = useCallback(async (id: string) => {
    try {
      const blob = await documentService.downloadDocument(id)
      const doc = documents.find(d => d.id === id)
      
      if (doc) {
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = doc.originalFilename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [documents])

  // Retry failed processing
  const retryProcessing = useCallback(async (id: string) => {
    try {
      await documentService.retryProcessing(id)
      
      // Update status to uploaded (will trigger processing)
      setDocuments(prev => prev.map(doc => 
        doc.id === id 
          ? { ...doc, status: 'uploaded', error: null }
          : doc
      ))

      // Start polling again
      processingRef.current.add(id)
      startStatusPolling(id)
    } catch (error: any) {
      setError(error.message)
    }
  }, [startStatusPolling])

  // Refresh documents
  const refreshDocuments = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      console.log('Refreshing documents...')
      
      const docs = await documentService.getDocuments()
      console.log('Documents fetched:', docs)
      setDocuments(docs)

      // Start polling for any documents still processing
      docs.forEach(doc => {
        if (['uploaded', 'processing', 'ocr_complete', 'ai_processing'].includes(doc.status)) {
          processingRef.current.add(doc.id)
          startStatusPolling(doc.id)
        }
      })
    } catch (error: any) {
      console.error('Error refreshing documents:', error)
      setError(error.message || 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }, [])

  // Force refresh documents (for manual refresh)
  const forceRefreshDocuments = useCallback(async () => {
    await refreshDocuments()
  }, [refreshDocuments])

  return {
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
    failedDocuments,
  }
}
