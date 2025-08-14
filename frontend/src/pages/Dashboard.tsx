import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Upload, ArrowRight, FileText, CheckCircle, Clock, AlertCircle, Loader2, Brain, RefreshCw, BarChart3, Target, HardDrive, Upload as UploadIcon, FolderOpen, Bot } from 'lucide-react'
import documentService from '../services/documentService'
import authService from '../services/authService'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { commonTypography, spacingClasses, pageLayout, buttonStyles } from '../lib/typography'

export default function Dashboard() {
  const navigate = useNavigate()
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      console.log('Dashboard: User not authenticated, redirecting to login')
      toast.error('Please log in to access the dashboard')
      navigate('/login')
      return
    }
  }, [navigate])

  // Real data state
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    successRate: 0,
    averageConfidence: 0,
    storageUsed: 0
  })
  const [recentDocuments, setRecentDocuments] = useState<any[]>([])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      console.log('Dashboard: Starting to fetch analytics...')
      const analytics = await documentService.getDocumentAnalytics()
      console.log('Dashboard: Analytics received:', analytics)
      setStats(analytics)
    } catch (error: any) {
      console.error('Dashboard: Failed to fetch analytics:', error)
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast.error('Session expired. Please log in again.')
        authService.logout()
        navigate('/login')
        return
      }
      
      toast.error('Failed to fetch analytics data')
      // Set default stats to prevent infinite loading
      setStats({
        total: 0,
        completed: 0,
        failed: 0,
        processing: 0,
        successRate: 0,
        averageConfidence: 0,
        storageUsed: 0
      })
    }
  }

  const fetchRecentDocuments = async () => {
    try {
      console.log('Dashboard: Starting to fetch recent activity...')
      const activities = await documentService.getRecentActivity(5)
      console.log('Dashboard: Recent activity received:', activities)
      setRecentDocuments(activities)
    } catch (error: any) {
      console.error('Dashboard: Failed to fetch recent activity:', error)
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast.error('Session expired. Please log in again.')
        authService.logout()
        navigate('/login')
        return
      }
      
      toast.error('Failed to fetch recent activity')
      // Set empty array to prevent infinite loading
      setRecentDocuments([])
    }
  }

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('Dashboard: Starting to load initial data...')
      setLoading(true)
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('Dashboard: Loading timed out after 10 seconds')
        setLoading(false)
        toast.error('Dashboard loading timed out. Please refresh the page.')
      }, 10000) // 10 second timeout
      
      try {
        console.log('Dashboard: Calling Promise.all for data fetching...')
        await Promise.all([
          fetchDashboardData(),
          fetchRecentDocuments()
        ])
        console.log('Dashboard: All data fetched successfully')
        clearTimeout(timeoutId)
      } catch (error) {
        console.error('Dashboard: Failed to load initial data:', error)
        toast.error('Failed to load dashboard data')
        clearTimeout(timeoutId)
      } finally {
        console.log('Dashboard: Setting loading to false')
        setLoading(false)
      }
    }
    
    console.log('Dashboard: useEffect triggered, calling loadInitialData')
    loadInitialData()
  }, [])

  // Refresh function
  const handleRefresh = async () => {
    setLoading(true)
    try {
      await fetchDashboardData()
      await fetchRecentDocuments()
    } catch (error) {
      console.error('Failed to refresh dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerAIAnalysis = async (documentId: string) => {
    try {
      setLoading(true)
      // Call the backend to trigger AI analysis
      const response = await fetch(`/api/v1/documents/${documentId}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        toast.success('AI analysis started! This may take a few minutes.')
        // Refresh the data after a short delay
        setTimeout(() => {
          handleRefresh()
        }, 2000)
      } else {
        toast.error('Failed to start AI analysis')
      }
    } catch (error) {
      console.error('Error triggering AI analysis:', error)
      toast.error('Error starting AI analysis')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading && stats.total === 0 && recentDocuments.length === 0) {
    return (
      <div className={pageLayout.container}>
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-96 p-6 lg:p-8">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
            <h2 className={`${commonTypography.sectionTitle} text-white`}>Loading Dashboard...</h2>
            <p className={`${commonTypography.bodyText} text-gray-400 mt-2`}>Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if no data could be loaded
  if (!loading && stats.total === 0 && recentDocuments.length === 0) {
    return (
      <div className={pageLayout.container}>
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-96 p-6 lg:p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className={`${commonTypography.sectionTitle} text-white mb-2`}>Failed to Load Dashboard</h2>
            <p className={`${commonTypography.bodyText} text-gray-400 mb-4`}>Unable to fetch dashboard data. Please check your connection and try again.</p>
            <Button 
              onClick={handleRefresh}
              className={buttonStyles.primary}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={pageLayout.container}>
      {/* Header Section */}
      <div className={pageLayout.header.container}>
        <div className={pageLayout.header.content}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className={pageLayout.header.title}>Dashboard</h1>
              <p className={pageLayout.header.subtitle}>
                {stats.total === 0 
                  ? "Welcome to FlowCraft AI! Upload your first document to get started with AI-powered analysis."
                  : "Welcome to FlowCraft AI! Here's what's happening with your documents."
                }
              </p>
              
              {/* Quick Actions */}
              <div className={pageLayout.header.actions}>
                <button className={`${buttonStyles.primary} px-6 lg:px-8 py-3 lg:py-4 rounded-lg flex items-center justify-center space-x-2 border-0`}>
                  <UploadIcon className="w-5 h-5" />
                  <span>Upload Document</span>
                </button>
                <button className={`${buttonStyles.secondary} px-6 lg:px-8 py-3 lg:py-4 rounded-lg flex items-center justify-center space-x-2`}>
                  <FolderOpen className="w-5 h-5" />
                  <span>View Documents</span>
                </button>
                <button className={`${buttonStyles.primary} px-6 lg:px-8 py-3 lg:py-4 rounded-lg flex items-center justify-center space-x-2 border-0`}>
                  <Bot className="w-5 h-5" />
                  <span>AI Analysis</span>
                </button>
              </div>
            </div>
            
            <div className={pageLayout.header.rightActions}>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-orange-500 text-white px-4 lg:px-6 py-2 lg:py-3 shadow-lg hover:shadow-xl"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={pageLayout.content.container}>
        {/* Stats Grid */}
        <div className={`${pageLayout.grid.stats} ${pageLayout.content.section}`}>
          <div className={`${pageLayout.content.card} hover:border-orange-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift animate-fade-in min-h-[140px]`}>
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-orange-400" />
              </div>
              <p className={`${commonTypography.label} text-gray-300 mb-2`}>Total Documents</p>
              <p className={`${commonTypography.subsectionTitle} text-white`}>{stats.total}</p>
            </div>
          </div>
          
          <div className={`${pageLayout.content.card} hover:border-orange-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift animate-fade-in min-h-[140px]`} style={{animationDelay: '0.1s'}}>
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3">
                <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
              </div>
              <p className={`${commonTypography.label} text-gray-300 mb-2`}>Processing</p>
              <p className={`${commonTypography.subsectionTitle} text-white`}>{stats.processing}</p>
            </div>
          </div>
          
          <div className={`${pageLayout.content.card} hover:border-green-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift animate-fade-in min-h-[140px]`} style={{animationDelay: '0.2s'}}>
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <p className={`${commonTypography.label} text-gray-300 mb-2`}>Completed</p>
              <p className={`${commonTypography.subsectionTitle} text-white`}>{stats.completed}</p>
            </div>
          </div>
          
          <div className={`${pageLayout.content.card} hover:border-orange-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift animate-fade-in min-h-[140px]`} style={{animationDelay: '0.3s'}}>
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3">
                <BarChart3 className="w-6 h-6 text-orange-400" />
              </div>
              <p className={`${commonTypography.label} text-gray-300 mb-2`}>Success Rate</p>
              <p className={`${commonTypography.subsectionTitle} text-white`}>{stats.successRate}%</p>
            </div>
          </div>

          <div className={`${pageLayout.content.card} hover:border-orange-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift animate-fade-in min-h-[140px]`} style={{animationDelay: '0.4s'}}>
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <p className={`${commonTypography.label} text-gray-300 mb-2`}>Average Confidence</p>
              <p className={`${commonTypography.subsectionTitle} text-white`}>{stats.averageConfidence}%</p>
            </div>
          </div>
          
          <div className={`${pageLayout.content.card} hover:border-orange-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift animate-fade-in min-h-[140px]`} style={{animationDelay: '0.5s'}}>
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3">
                <HardDrive className="w-6 h-6 text-orange-400" />
              </div>
              <p className={`${commonTypography.label} text-gray-300 mb-2`}>Storage Used</p>
              <p className={`${commonTypography.subsectionTitle} text-white`}>
                {(stats.storageUsed / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        {recentDocuments.length > 0 && (
          <div className={`${pageLayout.content.card} hover:border-orange-500/30 transition-all duration-300 shadow-lg hover:shadow-xl`}>
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className={`${commonTypography.subsectionTitle} text-white`}>Recent Documents</h2>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-orange-500 text-white shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className={`${commonTypography.subsectionTitle} text-white font-medium`}>{doc.originalFilename}</p>
                      <p className={`${commonTypography.caption} text-gray-400`}>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <span className={`px-2 lg:px-3 py-1 rounded-full ${commonTypography.caption} font-medium ${
                      doc.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      doc.status === 'processing' || doc.status === 'ai_processing' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      doc.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      doc.status === 'ocr_complete' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      doc.status === 'uploaded' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {doc.status === 'ocr_complete' ? 'OCR Complete' :
                       doc.status === 'ai_processing' ? 'AI Processing' :
                       doc.status === 'uploaded' ? 'Uploaded' :
                       doc.status}
                    </span>
                    {doc.ocrConfidence && (
                      <span className={`px-2 lg:px-3 py-1 bg-blue-500/20 text-blue-400 ${commonTypography.caption} rounded-full border border-blue-500/30`}>
                        OCR: {((doc.ocrConfidence) * 100).toFixed(1)}%
                      </span>
                    )}
                    {doc.aiAnalysis && doc.aiAnalysis.summary ? (
                      <span className={`px-2 lg:px-3 py-1 bg-green-500/20 text-green-400 ${commonTypography.caption} rounded-full border border-green-500/30`}>
                        AI: Complete
                      </span>
                    ) : doc.status === 'completed' ? (
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 lg:px-3 py-1 bg-yellow-500/20 text-yellow-400 ${commonTypography.caption} rounded-full border border-yellow-500/30`}>
                          AI: Missing
                        </span>
                        <Button
                          onClick={() => triggerAIAnalysis(doc.id)}
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-2 lg:px-3 py-1 h-6 lg:h-7 shadow-lg hover:shadow-xl border-0"
                        >
                          Run AI
                        </Button>
                      </div>
                    ) : doc.status === 'ocr_complete' ? (
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 lg:px-3 py-1 bg-yellow-500/20 text-yellow-400 ${commonTypography.caption} rounded-full border border-yellow-500/30`}>
                          AI: Ready
                        </span>
                        <Button
                          onClick={() => triggerAIAnalysis(doc.id)}
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-2 lg:px-3 py-1 h-6 lg:h-7 shadow-lg hover:shadow-xl border-0"
                        >
                          Run AI
                        </Button>
                      </div>
                    ) : (
                      <span className={`px-2 lg:px-3 py-1 bg-gray-500/20 text-gray-400 ${commonTypography.caption} rounded-full border border-gray-500/30`}>
                        AI: Waiting
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}