import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Zap, 
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'ai', name: 'AI Settings', icon: Zap },
    { id: 'data', name: 'Data & Storage', icon: Database }
  ]

  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    company: 'FlowCraft Inc.',
    role: 'Document Analyst'
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: 30
  })

  const [aiSettings, setAiSettings] = useState({
    defaultModel: 'phi3',
    autoProcess: true,
    confidenceThreshold: 0.8,
    maxProcessingTime: 300,
    enableBatchProcessing: true
  })

  const handleSaveProfile = () => {
    // Save profile data
    console.log('Saving profile:', profileData)
  }

  const handleSaveSecurity = () => {
    // Save security settings
    console.log('Saving security:', securityData)
  }

  const handleSaveAI = () => {
    // Save AI settings
    console.log('Saving AI settings:', aiSettings)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">
          Manage your account preferences and FlowCraft AI configuration
        </p>
      </motion.div>

      {/* Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:w-64"
        >
          <div className="glass-card-dark p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-glass-white/10'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1"
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="glass-card-dark p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="glass-input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="glass-input w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="glass-input w-full bg-glass-dark/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                      className="glass-input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profileData.role}
                      onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                      className="glass-input w-full"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-glass-border">
                  <button
                    onClick={handleSaveProfile}
                    className="glass-button flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="glass-card-dark p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security Settings</span>
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="glass-input w-full pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="glass-input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="glass-input w-full pr-10"
                      />
                      <button
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-glass-white/5 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={() => setSecurityData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      securityData.twoFactorEnabled
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {securityData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                
                <div className="pt-4 border-t border-glass-border">
                  <button
                    onClick={handleSaveSecurity}
                    className="glass-button flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Security</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Settings Tab */}
          {activeTab === 'ai' && (
            <div className="glass-card-dark p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>AI Processing Settings</span>
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default AI Model
                  </label>
                  <select
                    value={aiSettings.defaultModel}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, defaultModel: e.target.value }))}
                    className="glass-select w-full"
                  >
                    <option value="phi3">Phi-3 (Default)</option>
                    <option value="phi2">Phi-2</option>
                    <option value="custom">Custom Model</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-glass-white/5 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Auto-Process Documents</h3>
                    <p className="text-sm text-gray-400">Automatically process documents when uploaded</p>
                  </div>
                  <button
                    onClick={() => setAiSettings(prev => ({ ...prev, autoProcess: !prev.autoProcess }))}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      aiSettings.autoProcess
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {aiSettings.autoProcess ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confidence Threshold
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings.confidenceThreshold}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-white font-medium">
                      {Math.round(aiSettings.confidenceThreshold * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only show results above this confidence level
                  </p>
                </div>
                
                <div className="pt-4 border-t border-glass-border">
                  <button
                    onClick={handleSaveAI}
                    className="glass-button flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save AI Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs can be implemented similarly */}
          {activeTab === 'notifications' && (
            <div className="glass-card-dark p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </h2>
              <p className="text-gray-400">Notification settings coming soon...</p>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="glass-card-dark p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Appearance Settings</span>
              </h2>
              <p className="text-gray-400">Appearance customization coming soon...</p>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="glass-card-dark p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Data & Storage</span>
              </h2>
              <p className="text-gray-400">Data management settings coming soon...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
