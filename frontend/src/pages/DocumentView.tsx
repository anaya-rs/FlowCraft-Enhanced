import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Download,
  Share2,
  Brain,
  Eye,
  Tag,
  Building,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  FileText,
  RefreshCw
} from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { Document } from '../services/documentService'
import documentService from '../services/documentService'
import { Button } from '../components/ui/button'
import { ShareDocument } from '../components/ShareDocument'
import toast from 'react-hot-toast'
import { commonTypography, pageLayout, buttonStyles } from '../lib/typography'

const DocumentView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [docData, setDocData] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'view' | 'analysis' | 'extraction' | 'entities'>('analysis')
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Fetch document data from API
  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) {
        setError('No document ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const documentData = await documentService.getDocument(id)
        setDocData(documentData)
        
      } catch (error: any) {
        console.error('Error fetching document:', error)
        if (error.message?.includes('404') || error.message?.includes('Not Found')) {
          setError('Document not found. It may have been deleted or moved.')
        } else {
          setError(error.message || 'Failed to fetch document')
        }
        toast.error('Failed to load document')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [id])

  // Real-time status polling
  useEffect(() => {
    if (!docData || docData.status === 'completed' || docData.status === 'failed') {
      return
    }

    const pollStatus = async () => {
      try {
        const statusData = await documentService.getDocumentStatus(id!)
        
        // Update document status
        setDocData(prev => prev ? { ...prev, status: statusData.status } : null)
        
        // If processing is complete, refresh the full document data
        if (statusData.status === 'completed') {
          const updatedDoc = await documentService.getDocument(id!)
          setDocData(updatedDoc)
        }
      } catch (error) {
        console.error('Error polling document status:', error)
        // Stop polling on error
      }
    }

    // Remove automatic polling - only poll when explicitly needed
    // const interval = setInterval(pollStatus, 2000)
    // return () => clearInterval(interval)
  }, [docData, id])

  const handleDownload = async () => {
    if (!docData) return

    try {
      await documentService.downloadDocument(docData.id)
      toast.success('Download started')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Download failed')
    }
  }

  const handleShare = async () => {
    if (!docData) return
    
    // Open the share modal
    setIsShareModalOpen(true)
  }

  const handleProcess = async () => {
    if (!docData) return

    try {
      setLoading(true)
      toast.loading('Processing document with AI...')
      
      // Call the process endpoint
      await documentService.processDocument(docData.id)
      
      // Poll for status updates
      const pollStatus = async () => {
        try {
          const statusData = await documentService.getDocumentStatus(docData!.id)
          
          if (statusData.status === 'completed') {
            // Refresh document data
            const updatedDoc = await documentService.getDocument(docData!.id)
            setDocData(updatedDoc)
            toast.success('Document processed successfully!')
            setLoading(false)
            return
          } else if (statusData.status === 'failed') {
            toast.error('Document processing failed')
            setLoading(false)
            return
          }
          
          // Continue polling
          setTimeout(pollStatus, 2000)
        } catch (error) {
          console.error('Error polling status:', error)
          toast.error('Error checking processing status')
          setLoading(false)
        }
      }
      
      // Start polling
      pollStatus()
      
    } catch (error: any) {
      console.error('Processing error:', error)
      toast.error('Failed to start processing')
      setLoading(false)
    }
  }

  const handleReanalyzeAI = async () => {
    if (!docData) return

    try {
      setReanalyzing(true)
      toast.loading('Re-analyzing document with AI...')
      
      // Call the re-analysis endpoint
      await documentService.reanalyzeDocument(docData.id)
      
      // Wait a bit for processing to complete
      toast.success('Document re-analyzed successfully! Refreshing...')
      
      // Refresh the document data
      setTimeout(async () => {
        try {
          await documentService.getDocument(docData.id) // Use documentService.getDocument directly
          toast.success('Document updated with new AI analysis!')
        } catch (error) {
          console.error('Failed to refresh document:', error)
          toast.error('Document re-analyzed but failed to refresh')
        }
      }, 3000)
      
    } catch (error) {
      console.error('Re-analysis error:', error)
      toast.error('Failed to re-analyze document')
    } finally {
      setReanalyzing(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast.error('Copy failed')
    }
  }

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'PERSON': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'ORGANIZATION': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'MONEY': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'DATE': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'LOCATION': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-700/50 rounded-lg p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2 font-sans">Document Not Found</h2>
          <p className="text-red-300 mb-6 font-sans">{error}</p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="primary"
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/documents')}
              variant="secondary"
              className="w-full"
            >
              Browse Documents
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-8 text-center">
          <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white font-sans">Loading Document...</h2>
          <p className="text-gray-400 mt-2 font-sans">Please wait while we fetch the document details</p>
        </div>
      </div>
    )
  }

  if (!docData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2 font-sans">Document not found</h3>
        <p className="text-gray-400 mb-4 font-sans">The document you're looking for doesn't exist.</p>
        <Button
          onClick={() => navigate('/documents')}
          variant="primary"
          size="md"
        >
          Back to Documents
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Compact Header */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/documents')}
              variant="ghost"
              size="sm"
              title="Back to Documents"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className={`${commonTypography.pageTitle} text-white`}>
                  {docData?.originalFilename || 'Loading...'}
                </h1>
                <div className="flex items-center space-x-3 text-gray-400 text-xs mt-1">
                  <span className="px-2 py-1 bg-gray-700/50 rounded-md">
                    {docData?.mimeType || 'Loading...'}
                  </span>
                  <span>{docData?.createdAt ? new Date(docData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'Loading...'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status and Actions */}
          <div className="flex items-center space-x-3">
            {docData?.status && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                docData.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                docData.status === 'processing' || docData.status === 'ocr_complete' || docData.status === 'ai_processing' ? 
                  'bg-blue-500/20 text-blue-400' :
                docData.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
              }`}>
                {docData.status === 'completed' ? '✓ Completed' :
                 docData.status === 'processing' ? '🔄 Processing' :
                 docData.status === 'ocr_complete' ? '📝 OCR Complete' :
                 docData.status === 'ai_processing' ? '🧠 AI Processing' :
                 docData.status === 'failed' ? '❌ Failed' :
                 docData.status}
              </span>
            )}
            
            {docData.ocrConfidence && (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                OCR: {((docData.ocrConfidence) * 100).toFixed(1)}%
              </span>
            )}
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownload}
                disabled={loading || !docData}
                variant="primary"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {docData?.status !== 'completed' && (
                <Button
                  onClick={handleProcess}
                  disabled={loading}
                  variant="secondary"
                  size="sm"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : 'Process with AI'}
                </Button>
              )}
              <Button
                onClick={handleShare}
                disabled={!docData}
                variant="secondary"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Status Banner */}
      {docData?.status && docData.status !== 'completed' && (
        <div className={`p-4 rounded-lg border ${
          docData.status === 'processing' || docData.status === 'ocr_complete' || docData.status === 'ai_processing' 
            ? 'bg-blue-500/20 border-blue-500/30' 
            : 'bg-red-500/20 border-red-500/30'
        }`}>
          <div className="flex items-center space-x-3">
            {docData.status === 'processing' || docData.status === 'ocr_complete' || docData.status === 'ai_processing' ? (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <div>
              <h3 className="font-medium text-white">
                {docData.status === 'processing' ? 'OCR Processing...' :
                 docData.status === 'ocr_complete' ? 'OCR Complete, AI Processing...' :
                 docData.status === 'ai_processing' ? 'AI Analysis in Progress...' :
                 'Processing Failed'}
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                {docData.status === 'processing' ? 'Extracting text from your document...' :
                 docData.status === 'ocr_complete' ? 'Text extracted successfully, analyzing with AI...' :
                 docData.status === 'ai_processing' ? 'Generating insights and extracting data...' :
                 'Something went wrong during processing. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compact Tab Navigation */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-1">
        <nav className="flex space-x-1">
          {[
            { id: 'view', label: 'Document', icon: Eye },
            { id: 'analysis', label: 'AI Analysis', icon: Brain },
            { id: 'extraction', label: 'Data', icon: Tag },
            { id: 'entities', label: 'Entities', icon: Building }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {/* AI Analysis Tab - Default and Main Focus */}
        {activeTab === 'analysis' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {docData.aiAnalysis ? (
              <div className="space-y-6">
                {/* Main AI Insights Card */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`${commonTypography.sectionTitle} text-white`}>AI Analysis Results</h3>
                        <p className={`${commonTypography.caption} text-gray-400`}>
                          Powered by Phi-3 - {docData.aiAnalysis['model_used'] || 'AI Model'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={handleReanalyzeAI}
                        variant="outline"
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 border-orange-500 text-white"
                        disabled={reanalyzing}
                      >
                        {reanalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Re-analyzing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Re-analyze with AI
                          </>
                        )}
                      </Button>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                        {docData.aiAnalysis['model_used'] || 'AI Analysis'}
                      </span>
                      <Button
                        onClick={() => copyToClipboard(docData.aiAnalysis && docData.aiAnalysis['summary'] ? docData.aiAnalysis['summary'] : '', 'summary')}
                        variant="ghost"
                        size="sm"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Summary Section */}
                  {docData.aiAnalysis && docData.aiAnalysis['summary'] && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Document Summary</h4>
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-gray-200 text-base leading-relaxed">
                          {docData.aiAnalysis['summary']}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Key Information Grid */}
                  {docData.aiAnalysis && docData.aiAnalysis['key_information'] && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Key Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(docData.aiAnalysis['key_information']).map(([key, value]) => (
                          <div key={key} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                            <div className="text-sm text-gray-400 mb-1 capitalize">{key.replace('_', ' ')}</div>
                            <div className="text-white font-medium">
                              {value && typeof value === 'string' ? value : 
                               value && typeof value === 'number' ? value.toString() : 
                               'Not found'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Extracted Fields */}
                  {docData.aiAnalysis && docData.aiAnalysis['extracted_fields'] && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Extracted Fields</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(docData.aiAnalysis['extracted_fields']).map(([key, value]) => (
                          <div key={key} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                            <div className="text-sm text-gray-400 mb-1 capitalize">{key.replace('_', ' ')}</div>
                            <div className="text-white font-medium">
                              {value && typeof value === 'string' ? value : 
                               value && typeof value === 'number' ? value.toString() : 
                               'Not found'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Items */}
                  {docData.aiAnalysis && docData.aiAnalysis['action_items'] && docData.aiAnalysis['action_items'].length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Action Items</h4>
                      <div className="space-y-2">
                        {docData.aiAnalysis['action_items'].map((item: string, index: number) => (
                          <div key={index} className="flex items-center space-x-3 bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="text-gray-200">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Risk Factors */}
                  {docData.aiAnalysis && docData.aiAnalysis['risk_factors'] && docData.aiAnalysis['risk_factors'].length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Risk Factors</h4>
                      <div className="space-y-2">
                        {docData.aiAnalysis['risk_factors'].map((risk: string, index: number) => (
                          <div key={index} className="flex items-center space-x-3 bg-red-900/20 rounded-lg p-3 border border-red-700/50">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-red-200">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Analysis Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Confidence Score */}
                  {docData.aiAnalysis && docData.aiAnalysis['overall_confidence'] && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-white">Overall Confidence</h4>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                          {(docData.aiAnalysis['overall_confidence'] * 100).toFixed(1)}%
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(docData.aiAnalysis['overall_confidence'] * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Document Classification */}
                  {docData.aiAnalysis && docData.aiAnalysis['classification'] && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <Tag className="w-5 h-5 text-blue-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-white">Classification</h4>
                      </div>
                      <div className="text-center">
                        <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-lg font-medium capitalize">
                          {docData.aiAnalysis['classification']}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Sentiment Analysis */}
                  {docData.aiAnalysis && docData.aiAnalysis['sentiment'] && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                          <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-white">Sentiment</h4>
                      </div>
                      <div className="text-center">
                        <span className={`inline-block px-4 py-2 rounded-xl text-lg font-medium capitalize ${
                          docData.aiAnalysis['sentiment'] === 'positive' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          docData.aiAnalysis['sentiment'] === 'negative' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        } border`}>
                          {docData.aiAnalysis['sentiment']}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">No AI Analysis Available</h3>
                <p className="text-gray-400 mb-6">
                  This document hasn't been analyzed by Phi-3 yet. Click the "Process with AI" button to start analysis.
                </p>
                <Button
                  onClick={handleProcess}
                  disabled={loading}
                  variant="primary"
                  size="lg"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  {loading ? 'Processing...' : 'Process with Phi-3'}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Document View Tab */}
        {activeTab === 'view' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Document Content</h3>
              </div>
              
              {docData.extractedText ? (
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                  <pre className="text-gray-200 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                    {docData.extractedText}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No text content available</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Data Extraction Tab */}
        {activeTab === 'extraction' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Data Extraction</h3>
              </div>
              
              {docData.keyValuePairs && Object.keys(docData.keyValuePairs).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(docData.keyValuePairs).map(([key, value]) => (
                    <div key={key} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                      <div className="font-medium text-gray-300 mb-2">{key}</div>
                      <div className="text-white">{typeof value === 'object' ? value.value || value : value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No structured data extracted</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Entities Tab */}
        {activeTab === 'entities' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Named Entities</h3>
              </div>
              
              {docData.entities && docData.entities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {docData.entities.map((entity, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getEntityColor(entity.type)}`}>
                      <div className="font-medium">{entity.value}</div>
                      <div className="text-sm opacity-70 capitalize">{entity.type}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No named entities detected</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Share Document Modal */}
      <ShareDocument
        documentId={docData.id}
        documentName={docData.originalFilename}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}

export default DocumentView
