import React from 'react'
import { Link } from 'react-router-dom'
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
  Globe,
  ArrowLeft
} from 'lucide-react'
import { typography, spacingClasses } from '../lib/typography'

const LearnMore: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "Local AI Processing",
      description: "100% private document analysis using Phi-3 AI model via Ollama",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "All processing happens locally - no data ever leaves your device",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: FileText,
      title: "Professional OCR",
      description: "Multi-engine OCR with Tesseract, EasyOCR, and TrOCR for handwritten text",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Instant document classification, key-value extraction, and AI summaries",
      color: "from-yellow-500 to-orange-500"
    }
  ]

  const useCases = [
    {
      title: "Document Analysis",
      description: "Automatically classify and analyze invoices, contracts, reports, and more",
      icon: FileText
    },
    {
      title: "Data Extraction",
      description: "Extract structured data like invoice numbers, amounts, dates, and vendor information",
      icon: Download
    },
    {
      title: "AI Summaries",
      description: "Generate intelligent summaries and key insights from complex documents",
      icon: Brain
    },
    {
      title: "Search & Discovery",
      description: "AI-powered search across your document library with semantic understanding",
      icon: Search
    }
  ]

  const benefits = [
    "No API costs or usage limits",
    "Complete data privacy and security",
    "Enterprise-grade accuracy and reliability",
    "Works offline without internet connection",
    "Customizable AI models and processing",
    "Professional export formats (PDF, Excel, CSV)"
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              <span className={`${typography.body.base} text-gray-400 hover:text-white transition-colors`}>Back to Home</span>
            </Link>
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

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h1 className={`${typography.hero.h1} text-white mb-6 leading-tight`}>
              Learn More About
              <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                FlowCraft AI
              </span>
            </h1>
            <p className={`${typography.body.large} text-gray-300 max-w-3xl mx-auto leading-relaxed`}>
              Discover how our privacy-first approach to document intelligence is transforming 
              the way professionals handle their documents.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`${typography.section.h1} text-white mb-4`}>
              Why Choose FlowCraft AI?
            </h2>
            <p className={`${typography.body.large} text-gray-400 max-w-2xl mx-auto`}>
              Built for professionals who demand privacy, accuracy, and control over their document processing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-800/70 transition-all duration-200"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`${typography.content.h1} text-white mb-3`}>{feature.title}</h3>
                <p className={`${typography.body.base} text-gray-400 leading-relaxed`}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="px-6 py-20 bg-gray-800/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`${typography.section.h1} text-white mb-4`}>
              Professional Use Cases
            </h2>
            <p className={`${typography.body.large} text-gray-400 max-w-2xl mx-auto`}>
              From legal documents to financial reports, FlowCraft AI handles it all with precision.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`${typography.content.h1} text-white mb-2`}>{useCase.title}</h3>
                  <p className={`${typography.body.base} text-gray-400 leading-relaxed`}>{useCase.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`${typography.section.h1} text-white mb-4`}>
              Powered by Cutting-Edge Technology
            </h2>
            <p className={`${typography.body.large} text-gray-400 max-w-2xl mx-auto`}>
              Built on the latest AI and OCR technologies for unmatched accuracy and performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className={`${typography.content.h1} text-white mb-4`}>Phi-3 AI Model</h3>
              <p className={`${typography.body.base} text-gray-400 leading-relaxed`}>
                Microsoft's latest Phi-3 model running locally via Ollama for intelligent document understanding, 
                classification, and data extraction.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-10 h-10 text-white" />
              </div>
              <h3 className={`${typography.content.h1} text-white mb-4`}>Multi-Engine OCR</h3>
              <p className={`${typography.body.base} text-gray-400 leading-relaxed`}>
                Tesseract for general text, EasyOCR for complex layouts, and TrOCR for handwritten text recognition 
                with automatic fallback and confidence scoring.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h3 className={`${typography.content.h1} text-white mb-4`}>100% Local Processing</h3>
              <p className={`${typography.body.base} text-gray-400 leading-relaxed`}>
                All document processing happens on your device. No internet required, no data sent to external servers, 
                complete privacy and security.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-gray-800/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`${typography.section.h1} text-white mb-4`}>
              Enterprise Benefits
            </h2>
            <p className={`${typography.body.large} text-gray-400 max-w-2xl mx-auto`}>
              Why leading companies choose FlowCraft AI for their document processing needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3"
              >
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <span className={`${typography.body.base} text-gray-300 text-lg`}>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={`${typography.hero.h1} text-white mb-6`}>
              Ready to Transform Your Document Processing?
            </h2>
            <p className={`${typography.body.large} text-gray-400 mb-8 max-w-2xl mx-auto`}>
              Join thousands of professionals who trust FlowCraft AI for their document intelligence needs.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/login"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/"
                className="px-8 py-4 border border-gray-600 text-white rounded-lg font-semibold text-lg hover:border-gray-500 hover:bg-gray-800/50 transition-all duration-200"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LearnMore