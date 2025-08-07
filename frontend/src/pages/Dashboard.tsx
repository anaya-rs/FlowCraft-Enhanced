import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  Brain, 
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const stats = [
    { name: 'Models Created', value: '12', icon: Brain, change: '+2 this week' },
    { name: 'Documents Processed', value: '1,284', icon: FileText, change: '+18% from last month' },
    { name: 'Processing Time', value: '2.3s', icon: Clock, change: 'Average response' },
    { name: 'Success Rate', value: '99.2%', icon: CheckCircle, change: '+0.3% improvement' },
  ];

  const recentModels = [
    { name: 'Invoice Processor', type: 'Data Extractor', status: 'Active', usage: '145 docs' },
    { name: 'Contract Analyzer', type: 'Document Interpreter', status: 'Active', usage: '89 docs' },
    { name: 'Summary Generator', type: 'Content Summarizer', status: 'Draft', usage: '23 docs' },
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-300">Overview of your AI models and document processing</p>
          </div>
          <Link to="/create-model">
            <Button className="gradient-orange hover:gradient-orange-hover text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Model
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} className="glass-card-dark border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.name}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-primary mt-1">{stat.change}</p>
                    </div>
                    <div className="w-12 h-12 gradient-orange rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Models */}
        <Card className="glass-card-dark border-border">
          <CardHeader>
            <CardTitle className="text-xl text-white">Recent Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentModels.map((model, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 gradient-orange rounded-lg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{model.name}</h3>
                      <p className="text-sm text-gray-400">{model.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-300">{model.usage}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      model.status === 'Active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;