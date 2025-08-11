import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Brain, 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Search,
  BarChart3
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  
  // Reset stats to 0 for new users
  const stats = {
    totalDocuments: 0,
    processedDocuments: 0,
    pendingDocuments: 0,
    aiModels: 0,
    storageUsed: '0 GB',
    processingTime: '0s avg'
  }

  const recentActivity: Array<{
    id: number
    type: string
    document: string
    time: string
    status: string
  }> = [
    // Empty for new users
  ]

  const quickActions = [
    { 
      name: 'Upload Document', 
      icon: Upload, 
      action: () => navigate('/documents'), 
      color: 'bg-primary-500' 
    },
    { 
      name: 'Search Documents', 
      icon: Search, 
      action: () => navigate('/documents'), 
      color: 'bg-blue-500' 
    },
    { 
      name: 'View Analytics', 
      icon: BarChart3, 
      action: () => navigate('/dashboard'), 
      color: 'bg-green-500' 
    },
    { 
      name: 'Manage Models', 
      icon: Brain, 
      action: () => navigate('/models'), 
      color: 'bg-purple-500' 
    },
  ]

  const handleQuickAction = (action: () => void) => {
    action()
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back to FlowCraft AI
        </h1>
        <p className="text-xl text-gray-400">
          Your privacy-first document intelligence platform
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Documents</p>
              <p className="text-2xl font-bold text-white">{stats.totalDocuments.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Processed</p>
              <p className="text-2xl font-bold text-white">{stats.processedDocuments.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">AI Models</p>
              <p className="text-2xl font-bold text-white">{stats.aiModels}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Storage Used</p>
              <p className="text-2xl font-bold text-white">{stats.storageUsed}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card-dark p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => handleQuickAction(action.action)}
              className="flex flex-col items-center p-4 rounded-lg bg-glass-white/5 hover:bg-glass-white/10 transition-all duration-200 group cursor-pointer"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white text-center">{action.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card-dark p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-glass-white/5"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-green-500/20' : 'bg-primary-500/20'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-primary-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{activity.document}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'completed' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-primary-500/20 text-primary-400'
                  }`}>
                    {activity.status}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-glass-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-2">No documents yet</p>
              <p className="text-sm text-gray-500">Upload your first document to get started</p>
              <button 
                onClick={() => navigate('/documents')}
                className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                Upload Document
              </button>
            </div>
          )}
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card-dark p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
          <div className="space-y-6">
            {/* Processing Speed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Processing Speed</span>
                <span className="text-sm font-medium text-white">{stats.processingTime}</span>
              </div>
              <div className="w-full bg-glass-dark rounded-full h-2">
                <div className="bg-gradient-orange h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

            {/* Accuracy */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">OCR Accuracy</span>
                <span className="text-sm font-medium text-white">0%</span>
              </div>
              <div className="w-full bg-glass-dark rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

            {/* AI Confidence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">AI Confidence</span>
                <span className="text-sm font-medium text-white">0%</span>
              </div>
              <div className="w-full bg-glass-dark rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

            {/* System Status */}
            <div className="pt-4 border-t border-glass-border">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">All systems operational</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Phi-3 AI model ready for local processing</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="glass-card p-6 text-center"
      >
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-white">Privacy First</h3>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          All document processing happens locally on your device using Phi-3 AI. 
          No data is ever sent to external servers, ensuring complete privacy and security.
        </p>
      </motion.div>
    </div>
  )
}