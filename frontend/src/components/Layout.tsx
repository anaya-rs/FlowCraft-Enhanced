import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Brain, 
  Settings, 
  User, 
  LogOut,
  Upload,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  BarChart3,
  Cog,
  Database
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { commonTypography } from '../lib/typography'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: BarChart3,
      description: 'Overview & Analytics'
    },
    { 
      name: 'Documents', 
      href: '/documents', 
      icon: FileText,
      description: 'Upload & Manage Files'
    },
    { 
      name: 'AI Models', 
      href: '/models', 
      icon: Brain,
      description: 'Configure AI Settings'
    },
    { 
      name: 'Configuration', 
      href: '/configuration', 
      icon: Cog,
      description: 'System Settings'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      description: 'User Preferences'
    }
  ]

  const handleLogout = () => {
    try {
      logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Save sidebar state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString())
    } catch (error) {
      console.error('Failed to save sidebar state:', error)
    }
  }, [sidebarCollapsed])

  // Load sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed')
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true')
      }
    } catch (error) {
      console.error('Failed to load sidebar state:', error)
    }
  }, [])

  // Handle navigation errors
  const handleNavigation = (href: string) => {
    try {
      navigate(href)
    } catch (error) {
      console.error('Navigation error:', error)
      // Don't fallback to window.location - let React Router handle it
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 lg:hidden shadow-2xl"
          >
            <div className="flex h-full flex-col">
              {/* Sidebar header */}
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-700/50 px-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-sans">
                      FlowCraft AI
                    </h1>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="px-6 py-4 border-b border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate font-sans">
                         {user.first_name} {user.last_name}
                       </p>
                       <p className="text-xs text-gray-400 truncate font-sans">
                         {user.email}
                       </p>
                     </div>
                   </div>
                 </div>
               )}

              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <motion.button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative flex items-start space-x-4 px-4 py-3 rounded-xl font-medium transition-all duration-200 w-full text-left ${
                        isActive 
                          ? "bg-gray-700/80 text-white shadow-lg" 
                          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      }`}
                    >
                      <div className={`flex-shrink-0 transition-colors duration-200 ${
                        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`${commonTypography.nav} font-sans`}>{item.name}</p>
                        <p className={`${commonTypography.caption} text-gray-400 group-hover:text-gray-300 transition-colors duration-200 font-sans`}>
                          {item.description}
                        </p>
                      </div>
                    </motion.button>
                  )
                })}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-700/50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 font-medium transition-all duration-200 border border-red-500/30 hover:border-red-500/50 group"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div 
        className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col overflow-hidden"
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ width: sidebarCollapsed ? 80 : 280 }}
      >
        <div className="flex grow flex-col bg-gray-900 border-r border-gray-700/50 shadow-lg w-full overflow-y-auto">
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className={`${commonTypography.subsectionTitle} bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent`}>
                    FlowCraft AI
                  </h1>
                </div>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all duration-200 flex items-center justify-center"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="px-6 py-4 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 min-w-0 overflow-hidden"
                    >
                      <p className="text-sm font-semibold text-white truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  whileHover={{ x: 4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex items-center space-x-4 px-4 py-3 rounded-2xl font-medium transition-all duration-300 w-full text-left ${
                    isActive 
                      ? "bg-gray-700/80 text-white shadow-lg" 
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow-md"
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <div className={`flex-shrink-0 transition-all duration-300 ${
                    isActive 
                      ? "text-white scale-110" 
                      : "text-gray-400 group-hover:text-white group-hover:scale-110"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex-1 min-w-0 overflow-hidden"
                      >
                        <p className={`${commonTypography.nav} tracking-wide font-sans`}>{item.name}</p>
                        <p className={`${commonTypography.caption} text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mt-0.5 font-sans`}>
                          {item.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 font-medium transition-all duration-200 border border-red-500/30 hover:border-red-500/50 group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 shadow-lg w-10 h-10 flex items-center justify-center"
        >
          <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
            <div className="w-4 h-0.5 bg-current rounded-full"></div>
            <div className="w-4 h-0.5 bg-current rounded-full"></div>
            <div className="w-4 h-0.5 bg-current rounded-full"></div>
          </div>
        </button>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-80'
      }`}>
        <main className="w-full">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-8 lg:pt-8 pt-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout