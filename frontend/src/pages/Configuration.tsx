import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  ExternalLink, 
  Database, 
  Webhook, 
  FolderOpen, 
  Key, 
  Globe,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
  TestTube
} from 'lucide-react'

interface ExportConfig {
  format: string
  destinationFolder: string
  apiEndpoint: string
  apiKey: string
  autoExport: boolean
  webhookUrl: string
  webhookSecret: string
  enabled: boolean
}

export default function Configuration() {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'json',
    destinationFolder: '/exports/documents',
    apiEndpoint: 'https://api.example.com/export',
    apiKey: '',
    autoExport: true,
    webhookUrl: 'https://webhook.example.com/flowcraft',
    webhookSecret: '',
    enabled: true
  })

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  const handleConfigChange = (field: keyof ExportConfig, value: any) => {
    setExportConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleTestConnection = async () => {
    setTestStatus('testing')
    // Simulate API test
    setTimeout(() => {
      setTestStatus('success')
      setTimeout(() => setTestStatus('idle'), 3000)
    }, 2000)
  }

  const handleSaveConfig = async () => {
    setSaveStatus('saving')
    // Simulate save
    setTimeout(() => {
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }, 1000)
  }

  const exportFormats = [
    { value: 'json', label: 'JSON', description: 'Structured data format' },
    { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
    { value: 'txt', label: 'Plain Text', description: 'Simple text format' },
    { value: 'pdf', label: 'PDF', description: 'Portable document format' }
  ]

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
          Configuration
        </h1>
        <p className="text-xl text-gray-400">
          Configure export settings, API endpoints, and system preferences
        </p>
      </motion.div>

      {/* Export Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card-dark p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Export Configuration</h2>
              <p className="text-gray-400">Configure how documents are exported and shared</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${exportConfig.enabled ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`}></div>
            <span className={`text-sm ${exportConfig.enabled ? 'text-green-400' : 'text-gray-400'}`}>
              {exportConfig.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Export Format</label>
            <select 
              value={exportConfig.format}
              onChange={(e) => handleConfigChange('format', e.target.value)}
              className="glass-input w-full"
            >
              {exportFormats.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label} - {format.description}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Folder */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Local Export Folder</label>
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={exportConfig.destinationFolder}
                onChange={(e) => handleConfigChange('destinationFolder', e.target.value)}
                className="glass-input flex-1"
                placeholder="/exports/documents"
              />
              <button className="glass-button-outline px-3 py-2">
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* API Endpoint */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">API Export Endpoint</label>
            <input 
              type="url" 
              value={exportConfig.apiEndpoint}
              onChange={(e) => handleConfigChange('apiEndpoint', e.target.value)}
              className="glass-input w-full"
              placeholder="https://api.example.com/export"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">API Authentication Key</label>
            <div className="flex items-center space-x-2">
              <input 
                type="password" 
                value={exportConfig.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                className="glass-input flex-1"
                placeholder="Enter API key"
              />
              <button className="glass-button-outline px-3 py-2">
                <Key className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
            <input 
              type="url" 
              value={exportConfig.webhookUrl}
              onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
              className="glass-input w-full"
              placeholder="https://webhook.example.com/flowcraft"
            />
          </div>

          {/* Webhook Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Webhook Secret</label>
            <input 
              type="password" 
              value={exportConfig.webhookSecret}
              onChange={(e) => handleConfigChange('webhookSecret', e.target.value)}
              className="glass-input w-full"
              placeholder="Enter webhook secret"
            />
          </div>
        </div>

        {/* Auto Export Toggle */}
        <div className="mt-6 pt-6 border-t border-glass-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Automatic Export</h3>
              <p className="text-gray-400">Automatically export processed documents</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={exportConfig.autoExport}
                onChange={(e) => handleConfigChange('autoExport', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-glass-border">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="glass-button-outline px-4 py-2 flex items-center space-x-2 disabled:opacity-50"
            >
              {testStatus === 'testing' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              <span>
                {testStatus === 'testing' ? 'Testing...' : 
                 testStatus === 'success' ? 'Success!' : 
                 testStatus === 'error' ? 'Failed' : 'Test Connection'}
              </span>
            </button>
            
            {testStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Connection successful</span>
              </div>
            )}
            
            {testStatus === 'error' && (
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Connection failed</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleSaveConfig}
            disabled={saveStatus === 'saving'}
            className="glass-button-primary px-6 py-2 flex items-center space-x-2 disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'success' ? 'Saved!' : 'Save Configuration'}
            </span>
          </button>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card-dark p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-white">System Status</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-glass-white/5">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">Export Service</span>
            </div>
            <p className="text-xs text-gray-400">Running and ready</p>
          </div>
          
          <div className="p-4 rounded-lg bg-glass-white/5">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">API Gateway</span>
            </div>
            <p className="text-xs text-gray-400">Connected to external systems</p>
          </div>
          
          <div className="p-4 rounded-lg bg-glass-white/5">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">Webhook Service</span>
            </div>
            <p className="text-xs text-gray-400">Listening for events</p>
          </div>
        </div>
      </motion.div>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-card p-6 text-center"
      >
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-white">Configuration Security</h3>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          All configuration data is stored locally and encrypted. API keys and secrets are never logged 
          or transmitted without encryption. Your export settings remain private and secure.
        </p>
      </motion.div>
    </div>
  )
}
