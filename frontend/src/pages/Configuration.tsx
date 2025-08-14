import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  Settings, 
  Database, 
  Key, 
  Globe, 
  Shield, 
  Upload, 
  Download, 
  Trash2,
  Plus,
  X,
  Check,
  AlertTriangle,
  Cog, 
  Zap, 
  Webhook, 
  Eye,
  EyeOff,
  TestTube,
  RefreshCw
} from 'lucide-react'
import { Button } from '../components/ui/button'
import toast from 'react-hot-toast'
import { commonTypography, pageLayout, buttonStyles } from '../lib/typography'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  lastTriggered?: string
  secretKey: string
}

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  createdAt: string
  lastUsed?: string
}

const Configuration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'webhooks' | 'security' | 'storage'>('general')
  const [showSecretKey, setShowSecretKey] = useState<Record<string, boolean>>({})
  
  // Mock data
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      name: 'Document Processing Complete',
      url: 'https://api.company.com/webhooks/documents',
      events: ['document.processed', 'document.failed'],
      isActive: true,
      lastTriggered: '2024-01-15T10:30:00Z',
      secretKey: 'whsec_abc123def456'
    },
    {
      id: '2',
      name: 'Export Ready',
      url: 'https://api.company.com/webhooks/exports',
      events: ['export.completed'],
      isActive: false,
      secretKey: 'whsec_xyz789uvw012'
    }
  ])

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'fc_live_abc123def456ghi789',
      permissions: ['read:documents', 'write:documents', 'export:data'],
      createdAt: '2024-01-01T00:00:00Z',
      lastUsed: '2024-01-15T09:15:00Z'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'fc_test_xyz789uvw012abc345',
      permissions: ['read:documents'],
      createdAt: '2024-01-10T00:00:00Z'
    }
  ])

  const [systemConfig, setSystemConfig] = useState({
    maxFileSize: 50,
    supportedFormats: ['.pdf', '.png', '.jpg', '.jpeg', '.bmp', '.tiff'],
    ocrEngines: ['tesseract', 'easyocr', 'trocr'],
    aiModel: 'phi3',
    processingTimeout: 300,
    enableCaching: true,
    maxConcurrentJobs: 4,
    importDirectory: '/data/import',
    exportDirectory: '/data/export',
    watchImportDirectory: true,
    autoProcessImports: true,
    autoExportOnComplete: false
  })

  const [exportConfig, setExportConfig] = useState({
    defaultFormat: 'json',
    enableWebhooks: true,
    batchSize: 100,
    retentionDays: 30,
    compressionEnabled: true
  })

  const toggleSecretKey = (id: string) => {
    setShowSecretKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const addWebhook = () => {
    const newWebhook: Webhook = {
      id: Date.now().toString(),
      name: 'New Webhook',
      url: 'https://api.company.com/webhooks/new',
      events: ['document.processed'],
      isActive: false,
      secretKey: `whsec_${Math.random().toString(36).substr(2, 15)}`
    }
    setWebhooks(prev => [...prev, newWebhook])
  }

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id))
  }

  const testWebhook = (webhook: Webhook) => {
    // Mock webhook test
    alert(`Testing webhook: ${webhook.name}`)
  }

  const addApiKey = () => {
    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `fc_${Math.random().toString(36).substr(2, 20)}`,
      permissions: ['read:documents'],
      createdAt: new Date().toISOString()
    }
    setApiKeys(prev => [...prev, newApiKey])
  }

  const deleteApiKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id))
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Cog },
    { id: 'api', name: 'API & Export', icon: Globe },
    { id: 'webhooks', name: 'Webhooks', icon: Webhook },
    { id: 'security', icon: Shield, name: 'Security' },
    { id: 'storage', name: 'Storage', icon: Database }
  ]

  const handleSaveChanges = () => {
    toast.success('Configuration saved!')
  }

  return (
    <div className={pageLayout.container}>
      {/* Header Section */}
      <div className={pageLayout.header.container}>
        <div className={pageLayout.header.content}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className={pageLayout.header.title}>Configuration</h1>
              <p className={pageLayout.header.subtitle}>
                Manage system settings, API configuration, and integrations
              </p>
            </div>
            
            <Button 
              onClick={handleSaveChanges}
              className={buttonStyles.primary}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={pageLayout.content.container}>
        {/* Configuration Tabs */}
        <div className={`${pageLayout.content.card} mb-6`}>
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className={`${commonTypography.sectionTitle} text-white`}>General Settings</h2>
                  
                  <div className={pageLayout.grid.form}>
                    <div>
                      <label className={`${commonTypography.label} block text-gray-300 mb-2`}>Max File Size (MB)</label>
                      <input
                        type="number"
                        value={systemConfig.maxFileSize}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className={`${commonTypography.label} block text-gray-300 mb-2`}>Processing Timeout (seconds)</label>
                      <input
                        type="number"
                        value={systemConfig.processingTimeout}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, processingTimeout: parseInt(e.target.value) }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className={`${commonTypography.label} block text-gray-300 mb-2`}>Max Concurrent Jobs</label>
                      <input
                        type="number"
                        value={systemConfig.maxConcurrentJobs}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, maxConcurrentJobs: parseInt(e.target.value) }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className={`${commonTypography.label} block text-gray-300 mb-2`}>AI Model</label>
                      <select
                        value={systemConfig.aiModel}
                        onChange={(e) => setSystemConfig(prev => ({ ...prev, aiModel: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                      >
                        <option value="phi3">Phi-3 (Recommended)</option>
                        <option value="llama2">Llama 2</option>
                        <option value="mistral">Mistral</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className={`${commonTypography.subsectionTitle} text-white`}>Import/Export Directories</h3>
                    
                    <div className={pageLayout.grid.form}>
                      <div>
                        <label className={`${commonTypography.label} block text-gray-300 mb-2`}>Import Directory</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={systemConfig.importDirectory}
                            onChange={(e) => setSystemConfig(prev => ({ ...prev, importDirectory: e.target.value }))}
                            className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                            placeholder="/path/to/import/directory"
                          />
                          <Button
                            onClick={() => {
                              // Simulate file browser - in production this would open a native file dialog
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.webkitdirectory = true
                              input.onchange = (e) => {
                                const files = (e.target as HTMLInputElement).files
                                if (files && files.length > 0) {
                                  const file = files[0]
                                  if (file && file.webkitRelativePath) {
                                    // Use the directory name instead of path
                                    const dirName = file.webkitRelativePath.split('/')[0] || 'import'
                                    setSystemConfig(prev => ({ ...prev, importDirectory: dirName }))
                                  }
                                }
                              }
                              input.click()
                            }}
                            variant="secondary"
                            size="sm"
                            className={buttonStyles.secondary}
                          >
                            Browse
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Directory to watch for new documents to import</p>
                      </div>
                      
                      <div>
                        <label className={`${commonTypography.label} block text-gray-300 mb-2`}>Export Directory</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={systemConfig.exportDirectory}
                            onChange={(e) => setSystemConfig(prev => ({ ...prev, exportDirectory: e.target.value }))}
                            className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                            placeholder="/path/to/export/directory"
                          />
                          <Button
                            onClick={() => {
                              // Simulate file browser - in production this would open a native file dialog
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.webkitdirectory = true
                              input.onchange = (e) => {
                                const files = (e.target as HTMLInputElement).files
                                if (files && files.length > 0) {
                                  const file = files[0]
                                  if (file && file.webkitRelativePath) {
                                    const dirName = file.webkitRelativePath.split('/')[0] || 'export'
                                    setSystemConfig(prev => ({ ...prev, exportDirectory: dirName }))
                                  }
                                }
                              }
                              input.click()
                            }}
                            variant="secondary"
                            size="sm"
                            className={buttonStyles.secondary}
                          >
                            Browse
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Directory where processed documents will be exported</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="watchImportDirectory"
                          checked={systemConfig.watchImportDirectory}
                          onChange={(e) => setSystemConfig(prev => ({ ...prev, watchImportDirectory: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <label htmlFor="watchImportDirectory" className="text-sm text-gray-300">
                          Watch import directory for new files
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="autoProcessImports"
                          checked={systemConfig.autoProcessImports}
                          onChange={(e) => setSystemConfig(prev => ({ ...prev, autoProcessImports: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <label htmlFor="autoProcessImports" className="text-sm text-gray-300">
                          Automatically process imported documents
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="autoExportOnComplete"
                          checked={systemConfig.autoExportOnComplete}
                          onChange={(e) => setSystemConfig(prev => ({ ...prev, autoExportOnComplete: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <label htmlFor="autoExportOnComplete" className="text-sm text-gray-300">
                          Auto-export documents when processing completes
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="enableCaching"
                          checked={systemConfig.enableCaching}
                          onChange={(e) => setSystemConfig(prev => ({ ...prev, enableCaching: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <label htmlFor="enableCaching" className="text-sm text-gray-300">Enable document processing cache</label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'api' && (
                <motion.div
                  key="api"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className={`${commonTypography.sectionTitle} text-white`}>API Configuration & Export</h2>
                                         <Button
                       onClick={addApiKey}
                       variant="ghost"
                       size="sm"
                     >
                       <Plus className="w-4 h-4 mr-2" />
                       Add API Key
                     </Button>
                  </div>

                  {/* API Keys */}
                  <div className="space-y-4">
                    <h3 className={`${commonTypography.subsectionTitle} text-white`}>API Keys</h3>
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-white font-medium">{apiKey.name}</h4>
                            <p className="text-sm text-gray-400">Created: {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Button
                            onClick={() => deleteApiKey(apiKey.id)}
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4" />}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400">API Key:</span>
                            <code className="flex-1 bg-gray-800 px-2 py-1 rounded text-sm text-gray-300 font-mono">
                              {apiKey.key}
                            </code>
                            <Button className="p-1 text-gray-400 hover:text-white">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400">Permissions:</span>
                            <div className="flex space-x-2">
                              {apiKey.permissions.map((permission) => (
                                <span key={permission} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                  {permission}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Export Configuration */}
                  <div className="space-y-4">
                    <h3 className={`${commonTypography.subsectionTitle} text-white`}>Export Configuration</h3>
                    
                    <div className={pageLayout.grid.form}>
                      <div>
                        <label className={`${commonTypography.label} block text-gray-300 mb-2`}>Default Export Format</label>
                        <select
                          value={exportConfig.defaultFormat}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, defaultFormat: e.target.value }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                        >
                          <option value="json">JSON</option>
                          <option value="csv">CSV</option>
                          <option value="pdf">PDF</option>
                          <option value="excel">Excel</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className={`${commonTypography.label} block text-gray-300 mb-2`}>Batch Size</label>
                        <input
                          type="number"
                          value={exportConfig.batchSize}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className={`${commonTypography.label} block text-gray-300 mb-2`}>Retention Days</label>
                        <input
                          type="number"
                          value={exportConfig.retentionDays}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className={`${commonTypography.label} block text-gray-300 mb-2`}>Compression</label>
                        <select
                          value={exportConfig.compressionEnabled ? 'enabled' : 'disabled'}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, compressionEnabled: e.target.value === 'enabled' }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                        >
                          <option value="enabled">Enabled</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        // Export configuration to JSON file
                        const configData = {
                          system: systemConfig,
                          export: exportConfig,
                          timestamp: new Date().toISOString()
                        }
                        const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'flowcraft-config.json'
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      variant="secondary"
                      size="md"
                      icon={<Download className="w-4 h-4" />}
                    >
                      Export Configuration
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'webhooks' && (
                <motion.div
                  key="webhooks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className={`${commonTypography.sectionTitle} text-white`}>Webhook Management</h2>
                    <Button
                      onClick={addWebhook}
                      variant="ghost"
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Add Webhook
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {webhooks.map((webhook) => (
                      <div key={webhook.id} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-white font-medium">{webhook.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              webhook.isActive 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {webhook.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => testWebhook(webhook)}
                              variant="ghost"
                              size="sm"
                              icon={<TestTube className="w-4 h-4" />}
                              title="Test Webhook"
                            />
                            <Button
                              onClick={() => deleteWebhook(webhook.id)}
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="w-4 h-4" />}
                              title="Delete Webhook"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Webhook URL</label>
                            <input
                              type="url"
                              value={webhook.url}
                              className="w-full bg-gray-800 px-3 py-2 rounded text-sm text-gray-300 font-mono"
                              readOnly
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Events</label>
                            <div className="flex flex-wrap gap-2">
                              {webhook.events.map((event) => (
                                <span key={event} className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                                  {event}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Secret Key</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type={showSecretKey[webhook.id] ? 'text' : 'password'}
                                value={webhook.secretKey}
                                className="flex-1 bg-gray-800 px-3 py-2 rounded text-sm text-gray-300 font-mono"
                                readOnly
                              />
                              <Button
                                onClick={() => toggleSecretKey(webhook.id)}
                                className="p-2 text-gray-400 hover:text-white"
                              >
                                {showSecretKey[webhook.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          {webhook.lastTriggered && (
                            <div className="text-sm text-gray-400">
                              Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className={`${commonTypography.sectionTitle} text-white`}>Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-4">Authentication</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">JWT Token Expiry</h4>
                            <p className="text-sm text-gray-400">Access token expiration time</p>
                          </div>
                          <select className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none">
                            <option value="1h">1 Hour</option>
                            <option value="24h">24 Hours</option>
                            <option value="7d">7 Days</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">Refresh Token Expiry</h4>
                            <p className="text-sm text-gray-400">Refresh token expiration time</p>
                          </div>
                          <select className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none">
                            <option value="7d">7 Days</option>
                            <option value="30d">30 Days</option>
                            <option value="90d">90 Days</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-4">Rate Limiting</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">API Requests per Hour</label>
                          <input
                            type="number"
                            defaultValue="1000"
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Upload Requests per Hour</label>
                          <input
                            type="number"
                            defaultValue="100"
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'storage' && (
                <motion.div
                  key="storage"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className={`${commonTypography.sectionTitle} text-white`}>Storage Configuration</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-4">Document Storage</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Storage Used</span>
                          <span className="text-white">2.4 GB / 5 GB</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '48%' }}></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>48% used</span>
                          <span>2.6 GB available</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-4">Cache Storage</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cache Size</span>
                          <span className="text-white">156 MB</span>
                        </div>
                        <Button
                          onClick={() => {
                            // Clear cache functionality
                            if (confirm('Are you sure you want to clear the cache? This will free up storage space.')) {
                              // In production, this would clear localStorage, IndexedDB, etc.
                              toast.success('Cache cleared successfully')
                            }
                          }}
                          variant="secondary"
                          size="md"
                          icon={<Download className="w-4 h-4" />}
                        >
                          Clear Cache
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Storage Policies</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Auto-cleanup Old Exports</h4>
                          <p className="text-sm text-gray-400">Automatically remove exports older than specified days</p>
                        </div>
                        <input
                          type="number"
                          defaultValue="30"
                          className="w-20 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none text-center"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Compress Old Documents</h4>
                          <p className="text-sm text-gray-400">Compress documents older than 90 days to save space</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuration
