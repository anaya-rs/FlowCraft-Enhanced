import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Plus, 
  Settings, 
  Play, 
  Copy, 
  Trash2, 
  Zap,
  BarChart3,
  Clock,
  CheckCircle,
  MoreVertical
} from 'lucide-react'

interface AIModel {
  id: string
  name: string
  description: string
  modelType: string
  promptTemplate: string
  temperature: number
  maxTokens: number
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

export default function Models() {
  const [models, setModels] = useState<AIModel[]>([
    {
      id: '1',
      name: 'Invoice Extractor',
      description: 'Specialized model for extracting key information from invoices',
      modelType: 'extractor',
      promptTemplate: 'Extract the following fields from this invoice: invoice number, amount, date, vendor, line items',
      temperature: 0.3,
      maxTokens: 500,
      isActive: true,
      usageCount: 156,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'Contract Analyzer',
      description: 'Analyzes legal contracts and extracts key terms and conditions',
      modelType: 'classifier',
      promptTemplate: 'Analyze this contract and identify key terms, obligations, and risks',
      temperature: 0.5,
      maxTokens: 1000,
      isActive: true,
      usageCount: 89,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-14T00:00:00Z'
    },
    {
      id: '3',
      name: 'Document Summarizer',
      description: 'Creates concise summaries of long documents',
      modelType: 'summarizer',
      promptTemplate: 'Provide a comprehensive summary of this document in 3-5 bullet points',
      temperature: 0.7,
      maxTokens: 300,
      isActive: false,
      usageCount: 234,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-12T00:00:00Z'
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'extractor':
        return 'bg-blue-500/20 text-blue-400'
      case 'classifier':
        return 'bg-green-500/20 text-green-400'
      case 'summarizer':
        return 'bg-purple-500/20 text-purple-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'extractor':
        return <Zap className="w-4 h-4" />
      case 'classifier':
        return <CheckCircle className="w-4 h-4" />
      case 'summarizer':
        return <BarChart3 className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const toggleModelStatus = (id: string) => {
    setModels(prev => prev.map(model => 
      model.id === id ? { ...model, isActive: !model.isActive } : model
    ))
  }

  const duplicateModel = (model: AIModel) => {
    const newModel = {
      ...model,
      id: Math.random().toString(36).substr(2, 9),
      name: `${model.name} (Copy)`,
      isActive: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setModels(prev => [...prev, newModel])
  }

  const deleteModel = (id: string) => {
    setModels(prev => prev.filter(model => model.id !== id))
  }

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
          <h1 className="text-3xl font-bold text-white mb-2">AI Models</h1>
          <p className="text-gray-400">
            Manage and configure custom AI models for document processing
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="glass-button flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Model</span>
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Models</p>
              <p className="text-2xl font-bold text-white">{models.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Models</p>
              <p className="text-2xl font-bold text-white">
                {models.filter(m => m.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Usage</p>
              <p className="text-2xl font-bold text-white">
                {models.reduce((sum, m) => sum + m.usageCount, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Latest Update</p>
              <p className="text-2xl font-bold text-white">
                {formatDate(models[0]?.updatedAt || '')}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Models Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {models.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="glass-card-dark p-6 group"
          >
            {/* Model Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getModelTypeColor(model.modelType)}`}>
                {getModelTypeIcon(model.modelType)}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  model.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {model.isActive ? 'Active' : 'Inactive'}
                </span>
                
                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Model Info */}
            <div className="mb-4">
              <h3 className="font-semibold text-white mb-2">{model.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{model.description}</p>
              
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{model.modelType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Temperature:</span>
                  <span>{model.temperature}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Max Tokens:</span>
                  <span>{model.maxTokens}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Usage:</span>
                  <span>{model.usageCount} times</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-glass-border">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleModelStatus(model.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    model.isActive 
                      ? 'text-green-400 hover:bg-green-500/20' 
                      : 'text-gray-400 hover:bg-gray-500/20'
                  }`}
                  title={model.isActive ? 'Deactivate' : 'Activate'}
                >
                  <Play className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => duplicateModel(model)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setSelectedModel(model)}
                  className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => deleteModel(model.id)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {models.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card-dark p-12 text-center"
        >
          <div className="w-20 h-20 bg-glass-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No AI models yet</h3>
          <p className="text-gray-400 mb-6">
            Create your first custom AI model to start processing documents intelligently
          </p>
          <button className="glass-button">
            <Plus className="w-4 h-4 mr-2" />
            Create Model
          </button>
        </motion.div>
      )}
    </div>
  )
}
