import axios from 'axios'
import authService from './authService'

const API_BASE = 'http://localhost:8000'

export type ProcessingStatus = 
  | 'uploaded' 
  | 'processing'
  | 'ocr_complete'
  | 'ai_processing'
  | 'completed'
  | 'failed'

export interface Document {
  id: string
  filename: string
  originalFilename: string
  mimeType: string
  status: ProcessingStatus
  createdAt: string
  processedAt?: string
  fileSize?: number
  extractedText?: string
  ocrConfidence?: number
  documentType?: string
  aiAnalysis?: Record<string, any>
  keyValuePairs?: Record<string, any>
  entities?: Array<{
    type: string
    value: string
    confidence: number
    source?: string
  }>
  error?: string | null
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface DocumentStatus {
  status: ProcessingStatus
  progress: number
  message: string
  error?: string
}

class DocumentService {
  private api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = authService.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  // Upload document with progress tracking
  async uploadDocument(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Document> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await this.api.post('/api/v1/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100),
            })
          }
        },
      })

      return this.transformDocumentData(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Upload failed')
    }
  }

  // Transform backend document data to match frontend interface
  private transformDocumentData(backendDoc: any): Document {
    return {
      id: backendDoc.id,
      filename: backendDoc.filename,
      originalFilename: backendDoc.original_filename,
      mimeType: backendDoc.mime_type,
      status: backendDoc.processing_status || backendDoc.status || 'uploaded',
      createdAt: backendDoc.created_at,
      processedAt: backendDoc.processed_at,
      fileSize: backendDoc.file_size,
      extractedText: backendDoc.extracted_text,
      ocrConfidence: backendDoc.ocr_confidence,
      documentType: backendDoc.document_type,
      aiAnalysis: backendDoc.ai_analysis,
      keyValuePairs: backendDoc.key_value_pairs,
      entities: backendDoc.entities,
      error: null
    }
  }

  // Get all documents
  async getDocuments(): Promise<Document[]> {
    try {
      console.log('DocumentService: getDocuments() called')
      console.log('DocumentService: API base URL:', this.api.defaults.baseURL)
      console.log('DocumentService: Making request to /api/v1/documents/')
      
      const token = authService.getAccessToken()
      console.log('DocumentService: Token available:', !!token)
      
      const response = await this.api.get('/api/v1/documents/')
      console.log('DocumentService: Response received:', response.status, response.data)
      
      // Handle the response structure from the backend
      let documents = response.data
      if (response.data && response.data.documents) {
        documents = response.data.documents
      }
      
      // Transform backend data to frontend format
      return documents.map((doc: any) => this.transformDocumentData(doc))
    } catch (error: any) {
      console.error('DocumentService: Documents API error:', error)
      console.error('DocumentService: Error response:', error.response?.data)
      console.error('DocumentService: Request URL that failed:', error.config?.url)
      throw new Error(error.response?.data?.detail || 'Failed to fetch documents')
    }
  }

  // Get single document
  async getDocument(id: string): Promise<Document> {
    try {
      const response = await this.api.get(`/api/v1/documents/${id}`)
      return this.transformDocumentData(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch document')
    }
  }

  // Get document status
  async getDocumentStatus(id: string): Promise<DocumentStatus> {
    try {
      const response = await this.api.get(`/api/v1/documents/${id}/status`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get document status')
    }
  }

  // Re-analyze document with AI
  async reanalyzeDocument(id: string): Promise<Document> {
    try {
      const response = await this.api.post(`/api/v1/documents/${id}/process`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to re-analyze document')
    }
  }

  // Download document
  async downloadDocument(id: string): Promise<Blob> {
    try {
      const response = await this.api.get(`/api/v1/documents/${id}/download`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Download failed')
    }
  }

  // Delete document
  async deleteDocument(id: string): Promise<void> {
    try {
      await this.api.delete(`/api/v1/documents/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Delete failed')
    }
  }

  // Retry failed document processing
  async retryProcessing(id: string): Promise<void> {
    try {
      await this.api.post(`/api/v1/documents/${id}/retry`)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Retry failed')
    }
  }

  // Process document with AI analysis
  async processDocument(id: string): Promise<void> {
    try {
      await this.api.post(`/api/v1/documents/${id}/process`)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Processing failed')
    }
  }

  // Search documents
  async searchDocuments(query: string): Promise<Document[]> {
    try {
      const response = await this.api.get('/api/v1/documents/search', {
        params: { q: query },
      })
      return response.data.map((doc: any) => this.transformDocumentData(doc))
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Search failed')
    }
  }

  // Get document analytics for dashboard
  async getDocumentAnalytics(): Promise<{
    total: number
    processing: number
    completed: number
    failed: number
    successRate: number
    averageConfidence: number
    storageUsed: number
  }> {
    try {
      const token = authService.getAccessToken()
      
      // Call the dashboard stats endpoint instead of documents analytics
      const response = await this.api.get('/api/v1/dashboard/stats')
      
      // Transform the dashboard stats to match the expected format
      const stats = response.data
      return {
        total: stats.total_documents || 0,
        processing: stats.processing_queue_size || 0,
        completed: stats.total_processing_jobs || 0,
        failed: 0, // This will need to be calculated separately
        successRate: 100, // Default value, can be calculated from stats
        averageConfidence: 0, // Not available in dashboard stats
        storageUsed: 0 // Not available in dashboard stats
      }
    } catch (error: any) {
      console.error('DocumentService: Analytics API error:', error)
      console.error('DocumentService: Error response:', error.response?.data)
      throw new Error(error.response?.data?.detail || 'Failed to fetch analytics')
    }
  }

  // Get recent activity for dashboard
  async getRecentActivity(limit: number = 20): Promise<any[]> {
    try {
      const response = await this.api.get(`/api/v1/dashboard/recent-activity?limit=${limit}`)
      return response.data
    } catch (error: any) {
      console.error('DocumentService: Recent activity API error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to fetch recent activity')
    }
  }
}

export const documentService = new DocumentService()
export default documentService
