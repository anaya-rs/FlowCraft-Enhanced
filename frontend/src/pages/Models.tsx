import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Calendar, Settings, Trash2, Play, Edit, Eye, X } from "lucide-react";
import { Link } from "react-router-dom";

const Models = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<any[]>([]);
  const [runningModel, setRunningModel] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelResult, setModelResult] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    const savedModels = JSON.parse(localStorage.getItem('created_models') || '[]');
    setModels(savedModels);
  }, []);

  const deleteModel = (index: number) => {
    if (confirm("Are you sure you want to delete this model?")) {
      const updatedModels = models.filter((_, i) => i !== index);
      setModels(updatedModels);
      localStorage.setItem('created_models', JSON.stringify(updatedModels));
    }
  };

  // ===== RUN MODEL FUNCTIONALITY =====
  const handleRunModel = (model: any) => {
    setRunningModel(model);
    setSelectedFile(null);
    setModelResult("");
    setUploadResult(null);
  };

  const processWithModel = async () => {
    if (!selectedFile || !runningModel) return;
    
    setIsRunning(true);
    setModelResult("");
    setUploadResult(null);

    try {
      // First upload the file to get extracted text
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const uploadData = await uploadResponse.json();
      setUploadResult(uploadData);
      const extractedText = uploadData.extracted_text;

      // Simulate AI processing by replacing placeholder in prompt
      const processedPrompt = runningModel.prompt.replace('{document_text}', extractedText);
      
      setModelResult(`
🤖 AI Model Processing Result:

Model: ${runningModel.name}
Temperature: ${runningModel.temperature}
Max Tokens: ${runningModel.maxTokens}

Processed Prompt:
${processedPrompt}

---

DEMO RESULT: This is a simulated AI response. In a real implementation, this would be sent to an AI service like OpenAI with your prompt and the extracted document text.

Document Analysis: The uploaded document "${selectedFile.name}" contains ${extractedText.length} characters of extracted text. The AI model would analyze this content according to your custom prompt and return intelligent insights.
      `);

    } catch (error) {
      console.error("Model processing error:", error);
      setModelResult("❌ Error: Failed to process document with model. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Models</h1>
            <p className="text-gray-300">Manage your AI processing models</p>
          </div>
          <Link to="/create-model">
            <Button className="gradient-orange hover:gradient-orange-hover text-white">
              <Brain className="h-4 w-4 mr-2" />
              Create New Model
            </Button>
          </Link>
        </div>

        {models.length === 0 ? (
          <Card className="glass-card-dark border-border">
            <CardContent className="p-12 text-center">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Models Created</h3>
              <p className="text-gray-400 mb-6">Create your first AI model to get started</p>
              <Link to="/create-model">
                <Button className="gradient-orange hover:gradient-orange-hover text-white">
                  Create Model
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model, index) => (
              <Card key={index} className="glass-card-dark border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 gradient-orange rounded-lg flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        title="Edit model"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteModel(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        title="Delete model"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg">{model.name || 'Unnamed Model'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">{model.description || 'No description'}</p>
                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Created: {new Date(model.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-3 w-3" />
                      Temperature: {model.temperature || 0.7}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleRunModel(model)}
                    size="sm" 
                    className="w-full gradient-orange hover:gradient-orange-hover text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Model
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ===== MODEL RUNNER MODAL ===== */}
        {runningModel && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">Run Model: {runningModel.name}</h3>
                <Button
                  onClick={() => setRunningModel(null)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                {/* File Upload */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Upload Document to Process</h4>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white hover:file:bg-primary/80"
                      />
                    </div>
                    <Button
                      onClick={processWithModel}
                      disabled={!selectedFile || isRunning}
                      className="gradient-orange hover:gradient-orange-hover text-white"
                    >
                      {isRunning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Process Document
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Upload Success with Link to DocumentView */}
                {uploadResult && (
                  <div className="p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-400 font-medium">Document Processed Successfully</span>
                      <Button
                        onClick={() => navigate(`/documents/view/${uploadResult.id}`)}
                        size="sm"
                        variant="outline"
                        className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Document
                      </Button>
                    </div>
                    <p className="text-xs text-gray-300">
                      Click "View Full Document" to see the document preview and extracted text side-by-side with confidence score.
                    </p>
                  </div>
                )}

                {/* Model Info */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Model Configuration</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Temperature: {runningModel.temperature || 0.7}</div>
                    <div>Max Tokens: {runningModel.maxTokens || 1000}</div>
                    <div>Response Format: {runningModel.responseFormat || 'text'}</div>
                  </div>
                </div>

                {/* Results */}
                {modelResult && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Processing Result</h4>
                    <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                        {modelResult}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Models;
