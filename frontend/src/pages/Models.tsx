import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Brain, 
  CheckCircle, 
  BarChart3, 
  Clock, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Settings,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  X,
  Zap,
  Info,
  AlertCircle,
  Save
} from 'lucide-react'
import { Button } from '../components/ui/button'
import toast from 'react-hot-toast'
import { commonTypography, pageLayout, buttonStyles } from '../lib/typography'

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

interface CreateModelForm {
  name: string
  description: string
  modelType: string
  promptTemplate: string
  temperature: number
  maxTokens: number
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<CreateModelForm>({
    name: '',
    description: '',
    modelType: 'extractor',
    promptTemplate: '',
    temperature: 0.5,
    maxTokens: 500
  })

  const modelTypes = [
    { value: 'extractor', label: 'Data Extractor', description: 'Extract structured data from documents' },
    { value: 'classifier', label: 'Document Classifier', description: 'Categorize and classify documents' },
    { value: 'summarizer', label: 'Content Summarizer', description: 'Create concise summaries' },
    { value: 'analyzer', label: 'Content Analyzer', description: 'Analyze and understand content' }
  ]

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors['name'] = 'Model name is required'
    } else if (formData.name.length < 3) {
      errors['name'] = 'Model name must be at least 3 characters'
    }
    
    if (!formData.description.trim()) {
      errors['description'] = 'Description is required'
    } else if (formData.description.length < 10) {
      errors['description'] = 'Description must be at least 10 characters'
    }
    
    if (!formData.promptTemplate.trim()) {
      errors['promptTemplate'] = 'Prompt template is required'
    } else if (formData.promptTemplate.length < 20) {
      errors['promptTemplate'] = 'Prompt template must be at least 20 characters'
    }
    
    if (formData.temperature < 0 || formData.temperature > 1) {
      errors['temperature'] = 'Temperature must be between 0 and 1'
    }
    
    if (formData.maxTokens < 50 || formData.maxTokens > 4000) {
      errors['maxTokens'] = 'Max tokens must be between 50 and 4000'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateModel = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newModel: AIModel = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setModels(prev => [newModel, ...prev])
      setShowCreateForm(false)
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        modelType: 'extractor',
        promptTemplate: '',
        temperature: 0.5,
        maxTokens: 500
      })
      
    } catch (error) {
      toast.error('Failed to create model')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'extractor':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'classifier':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'summarizer':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'analyzer':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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
      case 'analyzer':
        return <Brain className="w-4 h-4" />
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
    <div className={pageLayout.container}>
      {/* Header Section */}
      <div className={pageLayout.header.container}>
        <div className={pageLayout.header.content}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className={pageLayout.header.title}>AI Models</h1>
              <p className={pageLayout.header.subtitle}>
                Manage and configure custom AI models for document processing
              </p>
            </div>
            
            <Button 
              onClick={() => setShowCreateForm(true)}
              variant="primary"
              size="md"
              className={`${buttonStyles.primary} flex items-center space-x-2`}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Create Model</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={pageLayout.content.container}>
        {/* Stats - Compact Cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${pageLayout.content.section}`}>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${commonTypography.label} text-gray-400 mb-1`}>Total Models</p>
                <p className={`${commonTypography.sectionTitle} text-white`}>{models.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${commonTypography.label} text-gray-400 mb-1`}>Active Models</p>
                <p className={`${commonTypography.sectionTitle} text-white`}>
                  {models.filter(m => m.isActive).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${commonTypography.label} text-gray-400 mb-1`}>Total Usage</p>
                <p className={`${commonTypography.sectionTitle} text-white`}>
                  {models.reduce((sum, m) => sum + m.usageCount, 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${commonTypography.label} text-gray-400 mb-1`}>Latest Update</p>
                <p className={`${commonTypography.sectionTitle} text-white`}>
                  {formatDate(models[0]?.updatedAt || new Date().toISOString())}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Models Grid */}
        <div className={pageLayout.content.section}>
          <h2 className={`${pageLayout.content.sectionTitle} text-white mb-6`}>Your AI Models</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
          {models.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 group"
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
                                       <Button
                     className="p-1 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                     variant="ghost"
                     size="sm"
                   >
                     <MoreVertical className="w-4 h-4" />
                   </Button>
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
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <div className="flex items-center space-x-2">
                                   <Button
                   onClick={() => toggleModelStatus(model.id)}
                   variant={model.isActive ? "success" : "secondary"}
                   size="sm"
                   title={model.isActive ? "Pause Model" : "Activate Model"}
                 >
                   {model.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                 </Button>
                 
                 <Button
                   onClick={() => duplicateModel(model)}
                   variant="ghost"
                   size="sm"
                   title="Duplicate"
                 >
                   <Copy className="w-4 h-4" />
                 </Button>
                 
                 <Button
                   onClick={() => setSelectedModel(model)}
                   variant="ghost"
                   size="sm"
                   title="Model Settings"
                 >
                   <Settings className="w-4 h-4" />
                 </Button>
               </div>
               
               <Button
                 onClick={() => deleteModel(model.id)}
                 variant="danger"
                 size="sm"
                 title="Delete Model"
               >
                 <Trash2 className="w-4 h-4" />
               </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Empty State */}
      {models.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No AI models yet</h3>
          <p className="text-gray-400 mb-6">
            Create your first custom AI model to start processing documents intelligently
          </p>
          <Button className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <Plus className="w-4 h-4 mr-2" />
            Create Model
          </Button>
        </motion.div>
      )}

      {/* Create Model Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create AI Model</h2>
                  <p className="text-gray-400 mt-1">Configure a custom AI model for document processing</p>
                </div>
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="ghost"
                  size="sm"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Model Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Invoice Data Extractor"
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      formErrors['name'] 
                        ? 'border-red-500/50 focus:ring-red-500/50' 
                        : 'border-gray-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                    }`}
                  />
                  {formErrors['name'] && (
                    <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formErrors['name']}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this model does and when to use it..."
                    rows={3}
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                      formErrors['description'] 
                        ? 'border-red-500/50 focus:ring-red-500/50' 
                        : 'border-gray-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                    }`}
                  />
                  {formErrors['description'] && (
                    <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formErrors['description']}</span>
                    </div>
                  )}
                </div>

                {/* Model Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modelTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, modelType: type.value }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          formData.modelType === type.value
                            ? 'border-orange-500/50 bg-orange-500/10 text-white'
                            : 'border-gray-600/50 bg-gray-900/30 hover:border-gray-500/50 text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getModelTypeColor(type.value)}`}>
                            {getModelTypeIcon(type.value)}
                          </div>
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-sm text-gray-400">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prompt Template *
                  </label>
                  <div className="mb-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Info className="w-3 h-3" />
                      <span>Use {`{{content}}`} as placeholder for document content</span>
                    </div>
                  </div>
                  <textarea
                    value={formData.promptTemplate}
                    onChange={(e) => setFormData(prev => ({ ...prev, promptTemplate: e.target.value }))}
                    placeholder="You are an AI assistant specialized in document analysis. Analyze the following document and extract..."
                    rows={4}
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                      formErrors['promptTemplate'] 
                        ? 'border-red-500/50 focus:ring-red-500/50' 
                        : 'border-gray-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                    }`}
                  />
                  {formErrors['promptTemplate'] && (
                    <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formErrors['promptTemplate']}</span>
                    </div>
                  )}
                </div>

                {/* Model Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Temperature */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Temperature
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.temperature}
                        onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Conservative (0.0)</span>
                        <span className="text-orange-400 font-medium">{formData.temperature}</span>
                        <span>Creative (1.0)</span>
                      </div>
                    </div>
                    {formErrors['temperature'] && (
                      <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors['temperature']}</span>
                      </div>
                    )}
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="4000"
                      value={formData.maxTokens}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 500 }))}
                      className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                        formErrors['maxTokens'] 
                          ? 'border-red-500/50 focus:ring-red-500/50' 
                          : 'border-gray-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                      }`}
                    />
                    {formErrors['maxTokens'] && (
                      <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors['maxTokens']}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-700/50">
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="ghost"
                  size="sm"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleCreateModel}
                  disabled={isSubmitting}
                  variant="primary"
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Model</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
