import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Shield, 
  Zap, 
  FileText, 
  Eye, 
  Download, 
  Search, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Lock,
  Cpu,
  Database,
  Globe
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { typography, spacingClasses } from '../lib/typography'

const Homepage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login - redirect to dashboard
    navigate('/dashboard')
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock signup - redirect to dashboard
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className={`${typography.section.h1} text-white`}>FlowCraft AI</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className={`${typography.body.base} text-gray-300 hover:text-white transition-colors duration-200`}
            >
              Login
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Single View */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className={`${typography.hero.h1} text-white mb-6 leading-tight`}>
              Privacy-First
              <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Document Intelligence
              </span>
            </h1>
            <p className={`${typography.body.large} text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8`}>
              Process documents with enterprise-grade AI while keeping your data 100% private. 
              No cloud APIs, no data sharing, just powerful local intelligence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link
              to="/login"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Start Processing Documents</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/learn-more"
              className="px-8 py-4 border border-gray-600 text-white rounded-lg font-semibold text-lg hover:border-gray-500 hover:bg-gray-800/50 transition-all duration-200"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Homepage
