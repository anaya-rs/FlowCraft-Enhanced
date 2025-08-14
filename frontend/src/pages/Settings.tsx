import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Save, 
  Eye, 
  EyeOff,
  Check,
  X
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { commonTypography, pageLayout, buttonStyles } from '../lib/typography'

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
    { id: 'ai', name: 'AI Settings', icon: Globe },
    { id: 'data', name: 'Data & Storage', icon: X }
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
    toast.success('Profile updated successfully')
  }

  const handleSaveSecurity = () => {
    toast.success('Security settings updated successfully')
  }

  const handleSaveAI = () => {
    toast.success('AI settings updated successfully')
  }

  return (
    <div className={pageLayout.container}>
      {/* Header Section */}
      <div className={pageLayout.header.container}>
        <div className={pageLayout.header.content}>
          <div className="text-left">
            <h1 className={`${pageLayout.header.title} font-sans`}>Settings</h1>
            <p className={`${pageLayout.header.subtitle} font-sans`}>
              Manage your account preferences and FlowCraft AI configuration
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={pageLayout.content.container}>
        {/* Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:w-64"
          >
            <div className={`${pageLayout.content.cardCompact} bg-gray-800/80 backdrop-blur-sm border border-gray-700/50`}>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <Button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      variant={activeTab === tab.id ? "primary" : "ghost"}
                      size="md"
                      className={`w-full justify-start font-sans items-center ${
                        activeTab === tab.id 
                          ? 'bg-orange-500 text-white' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span className="leading-none">{tab.name}</span>
                    </Button>
                  )
                })}
              </nav>
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
            <div className={`${pageLayout.content.card} bg-gray-800/80 backdrop-blur-sm border border-gray-700/50`}>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-orange-400" />
                    </div>
                    <h2 className={`${commonTypography.sectionTitle} text-white font-sans leading-none`}>Profile Information</h2>
                  </div>

                  <div className={pageLayout.grid.form}>
                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none font-sans leading-tight"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none font-sans leading-tight"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed font-sans leading-tight"
                      />
                      <p className="text-xs text-gray-500 font-sans leading-tight">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>Company</label>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none font-sans leading-tight"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>Role</label>
                      <input
                        type="text"
                        value={profileData.role}
                        onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none font-sans leading-tight"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveProfile}
                    className={`${buttonStyles.primary} w-full font-sans`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className={`${commonTypography.sectionTitle} text-white font-sans leading-none`}>Security Settings</h2>
                  </div>

                  <div className={pageLayout.grid.form}>
                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none font-sans leading-tight"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none font-sans leading-tight"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>Confirm New Password</label>
                      <input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none font-sans leading-tight"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>Session Timeout (minutes)</label>
                      <select
                        value={securityData.sessionTimeout}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none font-sans leading-tight"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="twoFactor"
                      checked={securityData.twoFactorEnabled}
                      onChange={(e) => setSecurityData(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                      className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <label htmlFor="twoFactor" className={`${commonTypography.label} text-gray-300 font-sans`}>
                      Enable Two-Factor Authentication
                    </label>
                  </div>

                  <Button 
                    onClick={handleSaveSecurity}
                    className={`${buttonStyles.primary} w-full font-sans`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </Button>
                </motion.div>
              )}

              {/* AI Settings Tab */}
              {activeTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className={`${commonTypography.sectionTitle} text-white font-sans leading-none`}>AI Settings</h2>
                  </div>

                  <div className={pageLayout.grid.form}>
                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>Default AI Model</label>
                      <select
                        value={aiSettings.defaultModel}
                        onChange={(e) => setAiSettings(prev => ({ ...prev, defaultModel: e.target.value }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none font-sans leading-tight"
                      >
                        <option value="phi3">Phi-3 (Recommended)</option>
                        <option value="llama2">Llama 2</option>
                        <option value="mistral">Mistral</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>Confidence Threshold</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={aiSettings.confidenceThreshold}
                        onChange={(e) => setAiSettings(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400 font-sans leading-tight">
                        <span>Low (0.1)</span>
                        <span className="text-orange-400 font-medium">{aiSettings.confidenceThreshold}</span>
                        <span>High (1.0)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>Max Processing Time (seconds)</label>
                      <input
                        type="number"
                        min="60"
                        max="1800"
                        value={aiSettings.maxProcessingTime}
                        onChange={(e) => setAiSettings(prev => ({ ...prev, maxProcessingTime: parseInt(e.target.value) }))}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none font-sans leading-tight"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`${commonTypography.label} block text-gray-300 font-sans`}>Batch Processing</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="batchProcessing"
                          checked={aiSettings.enableBatchProcessing}
                          onChange={(e) => setAiSettings(prev => ({ ...prev, enableBatchProcessing: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <label htmlFor="batchProcessing" className={`${commonTypography.label} text-gray-300 font-sans leading-tight`}>
                          Enable batch processing for multiple documents
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveAI}
                    className={`${buttonStyles.primary} w-full font-sans`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save AI Settings
                  </Button>
                </motion.div>
              )}

              {/* Other tabs */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-green-400" />
                    </div>
                    <h2 className={`${commonTypography.sectionTitle} text-white font-sans leading-none`}>Notification Preferences</h2>
                  </div>
                  <p className="text-gray-400 font-sans">Notification settings coming soon...</p>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Palette className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h2 className={`${commonTypography.sectionTitle} text-white font-sans leading-none`}>Appearance Settings</h2>
                  </div>
                  <p className="text-gray-400 font-sans">Appearance customization coming soon...</p>
                </motion.div>
              )}

              {activeTab === 'data' && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <X className="w-5 h-5 text-red-400" />
                    </div>
                    <h2 className={`${commonTypography.sectionTitle} text-white font-sans leading-none`}>Data & Storage</h2>
                  </div>
                  <p className="text-gray-400 font-sans">Data management settings coming soon...</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
