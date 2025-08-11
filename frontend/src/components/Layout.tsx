import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Home, 
  FileText, 
  Brain, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  User,
  Upload
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and analytics'
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
    description: 'Manage your documents'
  },
  {
    name: 'AI Models',
    href: '/models',
    icon: Brain,
    description: 'Custom AI models'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account preferences'
  }
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const isActive = (href: string) => location.pathname === href

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-screen bg-gradient-dark">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col flex-grow bg-glass-dark backdrop-blur-md border-r border-glass-border">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-glass-border">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-orange rounded-xl flex items-center justify-center shadow-glow-orange">
                <Zap className="w-6 h-6 text-white" />
              </div>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1 className="text-xl font-bold text-gradient-orange">FlowCraft AI</h1>
                </motion.div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'nav-link-active'
                    : 'nav-link'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="ml-3 text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-glass-dark text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.description}
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-glass-border">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-glass-white/10"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Sign out</span>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-glass-dark backdrop-blur-md border border-glass-border rounded-lg text-white hover:bg-glass-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${
        collapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <main className="h-full overflow-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}