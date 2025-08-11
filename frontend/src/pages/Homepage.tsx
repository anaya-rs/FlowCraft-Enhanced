import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  FileText, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Eye,
  Download,
  Upload,
  Search,
  BarChart3,
  Cog
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Homepage() {
  const navigate = useNavigate()
  const [isLoginVisible, setIsLoginVisible] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginForm.email === 'admin@flowcraft.ai' && loginForm.password === 'admin123') {
      // In a real app, this would set JWT token
      localStorage.setItem('flowcraft_auth', 'true')
      navigate('/dashboard')
    } else {
      alert('Invalid credentials. Use admin@flowcraft.ai / admin123')
    }
  }

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Local AI Processing',
      description: 'Phi-3 AI model runs completely on your device for maximum privacy and speed.'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Advanced OCR',
      description: 'EasyOCR and TrOCR technology for exceptional text recognition accuracy.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Privacy First',
      description: '100% local processing ensures your documents never leave your device.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Optimized processing pipeline for quick document analysis and insights.'
    }
  ]

  const useCases = [
    'Document Analysis & Classification',
    'Intelligent Data Extraction',
    'Handwritten Text Recognition',
    'AI-Generated Summaries',
    'Key-Value Pair Extraction',
    'Multi-format Export (JSON, CSV, TXT)'
  ]

  const benefits = [
    'Enterprise-grade accuracy with local AI',
    'No recurring cloud costs or subscriptions',
    'Complete data sovereignty and privacy',
    'Scalable processing for any document volume',
    'Professional API integration capabilities',
    'Advanced webhook and automation support'
  ]

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-orange-500/30 rounded-tl-lg"></div>
        <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-orange-400/50 rounded-tl-md"></div>
      </div>
      
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-orange-500/30 rounded-tr-lg"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-orange-400/50 rounded-tr-md"></div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-32 h-32">
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-orange-500/30 rounded-bl-lg"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b border-orange-400/50 rounded-bl-md"></div>
      </div>
      
      <div className="absolute bottom-0 right-0 w-32 h-32">
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-orange-500/30 rounded-br-lg"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-orange-400/50 rounded-br-md"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">FlowCraft</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsLoginVisible(!isLoginVisible)}
                className="glass-button-outline px-6 py-2"
              >
                {isLoginVisible ? 'Close' : 'Login'}
              </button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Professional
              <span className="block text-gradient-orange">Document Processing</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Transform your documents with local AI intelligence. Advanced OCR, intelligent analysis, 
              and complete privacy - all running on your device.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={() => setIsLoginVisible(true)}
                className="glass-button px-8 py-4 text-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button 
                onClick={() => document.getElementById('learn-more')?.scrollIntoView({ behavior: 'smooth' })}
                className="glass-button-outline px-8 py-4 text-lg"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </section>

        {/* Login Section */}
        {isLoginVisible && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-6 py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="glass-card-dark p-8 relative">
                {/* Corner decorations for login form */}
                <div className="absolute top-0 left-0 w-8 h-8">
                  <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-orange-500/40 rounded-tl"></div>
                </div>
                <div className="absolute top-0 right-0 w-8 h-8">
                  <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-orange-500/40 rounded-tr"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-8 h-8">
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-orange-500/40 rounded-bl"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8">
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-orange-500/40 rounded-br"></div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome to FlowCraft</h2>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="glass-input w-full"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="glass-input w-full"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  
                  <button type="submit" className="glass-button w-full py-3">
                    Sign In
                  </button>
                </form>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-400">
                    Demo credentials: admin@flowcraft.ai / admin123
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose FlowCraft?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Professional document processing with enterprise-grade capabilities, 
              all running locally on your device for complete privacy and control.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card-dark p-6 text-center"
              >
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-orange-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Learn More Section */}
        <section id="learn-more" className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Professional Document Intelligence
              </h2>
              
              <p className="text-lg text-gray-300 mb-8">
                FlowCraft combines cutting-edge AI technology with enterprise-grade processing 
                capabilities to deliver exceptional document analysis and insights.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">Key Capabilities:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {useCases.map((useCase, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="glass-card-dark p-8"
            >
              <h3 className="text-2xl font-semibold text-white mb-6">Technology Stack</h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Phi-3 AI Model</h4>
                    <p className="text-gray-400">Local AI processing for intelligent analysis</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">EasyOCR + TrOCR</h4>
                    <p className="text-gray-400">Advanced text recognition for all document types</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Multi-format Export</h4>
                    <p className="text-gray-400">JSON, CSV, TXT, and API integration</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Enterprise Benefits</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Professional-grade document processing with the flexibility and control 
              your business needs.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card-dark p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-orange-400" />
                  </div>
                  <p className="text-gray-300">{benefit}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="glass-card-dark p-12 max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Document Processing?
              </h2>
              
              <p className="text-xl text-gray-300 mb-8">
                Join professionals who trust FlowCraft for their document intelligence needs. 
                Get started today with our powerful local AI processing platform.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button 
                  onClick={() => setIsLoginVisible(true)}
                  className="glass-button px-8 py-4 text-lg"
                >
                  Start Processing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                
                <button 
                  onClick={() => navigate('/configuration')}
                  className="glass-button-outline px-8 py-4 text-lg"
                >
                  <Cog className="w-5 h-5 mr-2" />
                  View Configuration
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-white/10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FlowCraft</span>
            </div>
            
            <p className="text-gray-400 mb-4">
              Professional document processing with local AI intelligence
            </p>
            
            <p className="text-sm text-gray-500">
              © 2024 FlowCraft. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
