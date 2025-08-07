import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen gradient-background-dark">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">FlowCraft AI</span>
          </div>
          <Link to="/login">
            <Button className="gradient-orange hover:gradient-orange-hover text-white px-6 py-2 rounded-lg font-medium">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              FlowCraft AI
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the next generation of AI-powered workflow automation. 
            Streamline your processes and boost productivity with intelligent solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button className="gradient-orange hover:gradient-orange-hover text-white px-8 py-3 rounded-xl font-semibold text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/learn-more">
              <Button variant="outline" className="px-8 py-3 rounded-xl font-semibold text-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="glass-card-dark p-6 rounded-2xl text-center hover:shadow-xl transition-all">
            <div className="w-12 h-12 gradient-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Lightning Fast</h3>
            <p className="text-gray-300">Blazing fast AI processing with real-time results and instant feedback.</p>
          </div>
          
          <div className="glass-card-dark p-6 rounded-2xl text-center hover:shadow-xl transition-all">
            <div className="w-12 h-12 gradient-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Secure & Private</h3>
            <p className="text-gray-300">Enterprise-grade security with end-to-end encryption and data protection.</p>
          </div>
          
          <div className="glass-card-dark p-6 rounded-2xl text-center hover:shadow-xl transition-all">
            <div className="w-12 h-12 gradient-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Team Collaboration</h3>
            <p className="text-gray-300">Seamless collaboration tools for teams of any size, anywhere in the world.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
