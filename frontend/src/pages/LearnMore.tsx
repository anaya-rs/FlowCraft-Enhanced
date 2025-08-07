import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  FileText,
  Brain,
  Shield,
  Zap,
  Users,
  CheckCircle,
  Upload,
  Search,
  Download,
  Scale,
  Clock,
  Award,
  Globe,
  Lock,
  BarChart3
} from "lucide-react";

const LearnMore = () => {
  const features = [
    {
      icon: Search,
      title: "Smart OCR Processing",
      description: "Extract text from images, scanned documents, and PDFs with high accuracy even for handwritten or low-quality documents. Support for multiple languages and document types."
    },
    {
      icon: Brain,
      title: "AI-Powered Q&A",
      description: "Ask natural language questions about your documents and get instant, contextual answers with confidence scores. Perfect for research, compliance, and data extraction."
    },
    {
      icon: FileText,
      title: "Custom Model Builder",
      description: "Create specialized AI models for your specific needs. Choose from preset templates: Interpreter, Summarizer, Extractor, Translator, or build custom workflows."
    },
    {
      icon: Shield,
      title: "Secure & Scalable",
      description: "Enterprise-grade security with JWT authentication, process thousands of documents efficiently, and maintain full audit trail with user management."
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Upload Documents",
      description: "Upload your documents (images, PDFs, scanned files)",
      icon: Upload
    },
    {
      step: "2",
      title: "Choose Model",
      description: "Choose or create a processing model",
      icon: Brain
    },
    {
      step: "3",
      title: "Get Results",
      description: "Get instant results with AI-powered insights",
      icon: Zap
    },
    {
      step: "4",
      title: "Export Data",
      description: "Export data or ask follow-up questions",
      icon: Download
    }
  ];

  const useCases = [
    {
      title: "Legal",
      description: "Contract analysis, compliance checking, case research",
      icon: Scale
    },
    {
      title: "Healthcare",
      description: "Medical record processing, insurance claims",
      icon: FileText
    },
    {
      title: "Finance",
      description: "Invoice processing, financial statement analysis",
      icon: BarChart3
    },
    {
      title: "Education",
      description: "Research paper analysis, student document processing",
      icon: Award
    },
    {
      title: "Government",
      description: "Form processing, citizen service automation",
      icon: Globe
    }
  ];

  const benefits = [
    "Reduce manual data entry by 90%",
    "Process documents 10x faster than traditional methods",
    "Improve accuracy with AI-powered validation",
    "Scale processing without hiring additional staff",
    "Integrate with existing workflows via API"
  ];

  const techSpecs = [
    "Built with FastAPI backend and Next.js frontend",
    "Supports JWT authentication and role-based access",
    "RESTful API for easy integration",
    "Real-time processing with status updates",
    "Comprehensive audit logging"
  ];

  return (
    <div className="min-h-screen gradient-background-dark">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FC</span>
            </div>
            <span className="text-xl font-bold text-white">FlowCraft AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="text-white hover:text-primary">
                Home
              </Button>
            </Link>
            <Link to="/login">
              <Button className="gradient-orange hover:gradient-orange-hover text-white">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Transform Documents with{" "}
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              AI-Powered Intelligence
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            FlowCraft AI combines OCR technology with advanced language models to extract, 
            analyze, and process any document with unprecedented accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button className="gradient-orange hover:gradient-orange-hover text-white px-8 py-3 rounded-xl font-semibold text-lg">
                Start Processing Documents Today
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" className="px-8 py-3 rounded-xl font-semibold text-lg border-2 border-primary text-primary hover:bg-primary hover:text-white">
              Book a Demo
            </Button>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="mb-20">
          <Card className="glass-card-dark border-border max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Platform Overview</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                FlowCraft AI is an intelligent document processing platform that revolutionizes how businesses 
                handle paperwork. Using cutting-edge OCR (Optical Character Recognition) and GPT-powered AI models, 
                users can upload images or PDFs and instantly extract text, answer questions, and create custom 
                processing workflows. Our platform transforms manual document processing into automated, 
                intelligent workflows that save time and reduce errors.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="glass-card-dark border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 gradient-orange rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-gray-300">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 gradient-orange rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-300 text-sm">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Use Cases</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <Card key={index} className="glass-card-dark border-border text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 gradient-orange rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
                    <p className="text-gray-300 text-sm">{useCase.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Benefits</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Technical Specifications</h2>
              <div className="space-y-4">
                {techSpecs.map((spec, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-gray-300">{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="glass-card-dark border-border max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-gray-300 mb-6">
                Join thousands of businesses transforming their document processing with FlowCraft AI
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button className="gradient-orange hover:gradient-orange-hover text-white px-8 py-3 rounded-xl font-semibold">
                    Start Free Trial
                  </Button>
                </Link>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-xl font-semibold">
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;