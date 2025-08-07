import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { 
  Search, 
  FileText, 
  Target, 
  HelpCircle, 
  Globe, 
  Settings,
  ChevronDown,
  Save,
  Play,
  Upload,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const CreateModel = () => {
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState("1000");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string>("");
  
  // NEW STATE FOR FORM DATA
  const [modelName, setModelName] = useState("");
  const [description, setDescription] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [responseFormat, setResponseFormat] = useState("text");
  const [showPreview, setShowPreview] = useState(false);

  const presets = [
    {
      id: 'interpreter',
      title: 'Document Interpreter',
      icon: Search,
      description: 'Extract and analyze document meaning',
      prompt: 'Analyze the following document and provide a comprehensive interpretation of its content, structure, and key insights:\n\n{document_text}'
    },
    {
      id: 'summarizer',
      title: 'Content Summarizer',
      icon: FileText,
      description: 'Create concise summaries from documents',
      prompt: 'Create a concise summary of the following document, highlighting the main points and key information:\n\n{document_text}'
    },
    {
      id: 'extractor',
      title: 'Data Extractor',
      icon: Target,
      description: 'Pull specific data points and fields',
      prompt: 'Extract structured data from the following document. Identify and extract key data points, dates, names, amounts, and relevant information:\n\n{document_text}'
    },
    {
      id: 'qa',
      title: 'Question Answerer',
      icon: HelpCircle,
      description: 'Answer questions about document content',
      prompt: 'Based on the following document, answer any questions about its content accurately and thoroughly:\n\n{document_text}\n\nQuestion: {user_question}'
    },
    {
      id: 'translator',
      title: 'Language Translator',
      icon: Globe,
      description: 'Translate documents between languages',
      prompt: 'Translate the following document to {target_language} while maintaining the original meaning and structure:\n\n{document_text}'
    },
    {
      id: 'custom',
      title: 'Custom Model',
      icon: Settings,
      description: 'Build from scratch with your own prompt',
      prompt: 'Write your custom prompt here. Use {document_text} to reference the uploaded document content...'
    }
  ];

  const promptTemplates = [
    {
      title: 'Invoice Processing',
      description: 'Extract invoice details like amounts, dates, vendor info',
      prompt: 'Extract the following information from this invoice:\n- Invoice number\n- Date\n- Vendor name\n- Total amount\n- Line items\n\nDocument: {document_text}'
    },
    {
      title: 'Contract Analysis',
      description: 'Analyze contract terms and conditions',
      prompt: 'Analyze this contract and identify:\n- Key terms and conditions\n- Important dates\n- Parties involved\n- Obligations and responsibilities\n\nContract: {document_text}'
    },
    {
      title: 'Research Summary',
      description: 'Summarize research papers and academic documents',
      prompt: 'Provide a structured summary of this research document including:\n- Abstract/Overview\n- Key findings\n- Methodology\n- Conclusions\n\nDocument: {document_text}'
    }
  ];

  // HANDLE PRESET SELECTION
  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setCustomPrompt(preset.prompt);
    }
  };

  // HANDLE TEMPLATE SELECTION
  const handleTemplateSelect = (template: any) => {
    setCustomPrompt(template.prompt);
    setModelName(template.title);
    setDescription(template.description);
  };

  // HANDLE PROMPT PREVIEW
  const handlePreviewPrompt = () => {
    setShowPreview(!showPreview);
  };

  // HANDLE SAVE DRAFT
  const handleSaveDraft = async () => {
    const draftData = {
      modelName,
      description,
      customPrompt,
      temperature: temperature[0],
      maxTokens,
      responseFormat,
      selectedPreset,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage for now (in real app, save to backend)
    localStorage.setItem('model_draft', JSON.stringify(draftData));
    alert('Draft saved successfully!');
    console.log('Draft saved:', draftData);
  };

  // HANDLE CREATE MODEL
  const handleCreateModel = async () => {
    if (!modelName.trim()) {
      alert('Please enter a model name');
      return;
    }
    if (!customPrompt.trim()) {
      alert('Please enter a custom prompt');
      return;
    }

    const modelData = {
      name: modelName,
      description,
      prompt: customPrompt,
      temperature: temperature[0],
      maxTokens: parseInt(maxTokens),
      responseFormat,
      selectedPreset,
      createdAt: new Date().toISOString()
    };

    try {
      // In a real app, you'd send this to your backend
      console.log('Creating model:', modelData);
      
      // For now, just save to localStorage and show success
      const existingModels = JSON.parse(localStorage.getItem('created_models') || '[]');
      existingModels.push(modelData);
      localStorage.setItem('created_models', JSON.stringify(existingModels));
      
      alert('Model created successfully!');
      
      // Reset form
      setModelName('');
      setDescription('');
      setCustomPrompt('');
      setSelectedPreset(null);
      setTemperature([0.7]);
      setMaxTokens('1000');
      setResponseFormat('text');
      
    } catch (error) {
      console.error('Error creating model:', error);
      alert('Failed to create model. Please try again.');
    }
  };

  // Handle file upload
  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    setUploadError("");
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadResult(result);
      console.log("Upload successful:", result);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Custom Model</h1>
          <p className="text-gray-300">Design your AI processor for documents</p>
        </div>

        {/* Preset Selection */}
        <Card className="glass-card-dark border-border mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">Choose a Preset Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedPreset === preset.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 gradient-orange rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white">{preset.title}</h3>
                    </div>
                    <p className="text-sm text-gray-400">{preset.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Configuration */}
            <Card className="glass-card-dark border-border">
              <CardHeader>
                <CardTitle className="text-xl text-white">Model Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="modelName" className="text-white">Model Name</Label>
                  <Input
                    id="modelName"
                    placeholder="Enter model name"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="mt-2 bg-input border-border text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your model does"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 bg-input border-border text-white placeholder:text-gray-400"
                    rows={3}
                  />
                </div>

                {/* Advanced Settings */}
                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between text-white">
                      Advanced Settings
                      <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-6 mt-4">
                    <div>
                      <Label className="text-white">Temperature: {temperature[0]}</Label>
                      <p className="text-xs text-gray-400 mb-2">Controls creativity (0 = focused, 1 = creative)</p>
                      <Slider
                        value={temperature}
                        onValueChange={setTemperature}
                        max={1}
                        min={0}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maxTokens" className="text-white">Max Tokens</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(e.target.value)}
                        className="mt-2 bg-input border-border text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-white">Response Format</Label>
                      <Select value={responseFormat} onValueChange={setResponseFormat}>
                        <SelectTrigger className="mt-2 bg-input border-border text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="structured">Structured</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Prompt Builder */}
            <Card className="glass-card-dark border-border">
              <CardHeader>
                <CardTitle className="text-xl text-white">Prompt Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="prompt" className="text-white">Custom Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Write your custom prompt here. Use {document_text} to reference the uploaded document content..."
                    className="mt-2 bg-input border-border text-white placeholder:text-gray-400 min-h-[200px]"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">Use {"{document_text}"} to reference uploaded content</p>
                    <p className="text-xs text-gray-400">{customPrompt.length} / 2000 characters</p>
                  </div>
                </div>
                
                <Button 
                  onClick={handlePreviewPrompt}
                  variant="outline" 
                  className="mt-4 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {showPreview ? "Hide Preview" : "Preview Prompt"}
                </Button>

                {/* Prompt Preview */}
                {showPreview && customPrompt && (
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                    <h4 className="text-sm font-medium text-white mb-2">Prompt Preview:</h4>
                    <div className="text-xs text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {customPrompt.replace('{document_text}', '[Your uploaded document content will appear here]')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prompt Templates */}
            <Card className="glass-card-dark border-border">
              <CardHeader>
                <CardTitle className="text-lg text-white">Prompt Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {promptTemplates.map((template, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                    <h4 className="font-medium text-white text-sm mb-1">{template.title}</h4>
                    <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                    <Button 
                      onClick={() => handleTemplateSelect(template)}
                      size="sm" 
                      variant="ghost" 
                      className="text-xs text-primary hover:bg-primary hover:text-white"
                    >
                      Use Template
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Test Section */}
            <Card className="glass-card-dark border-border">
              <CardHeader>
                <CardTitle className="text-lg text-white">Test Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-4">Upload a sample document to test your model</p>
                  
                  {/* File Input */}
                  <input
                    type="file"
                    id="testFile"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="testFile"
                    className="inline-flex items-center px-4 py-2 text-sm rounded-md border border-primary text-primary bg-transparent hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </label>
                  
                  {/* Selected File Display */}
                  {file && (
                    <div className="mt-3 p-2 bg-muted rounded text-left">
                      <p className="text-xs text-gray-400">Selected: <span className="text-white">{file.name}</span></p>
                      <p className="text-xs text-gray-500">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  {file && (
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      size="sm"
                      className="mt-4 w-full gradient-orange hover:gradient-orange-hover text-white"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload & Test
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Upload Result */}
                  {uploadResult && (
                    <div className="mt-4 p-3 bg-green-900/20 border border-green-500/20 rounded-lg text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">Upload Successful</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">
                        <strong>File:</strong> {uploadResult.original_filename}
                      </p>
                      <p className="text-xs text-gray-300 mb-2">
                        <strong>Type:</strong> {uploadResult.mime_type}
                      </p>
                      {uploadResult.extracted_text && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-400 mb-1"><strong>Extracted Text Preview:</strong></p>
                          <div className="bg-gray-800 rounded p-2 max-h-32 overflow-y-auto">
                            <p className="text-xs text-gray-300">
                              {uploadResult.extracted_text.substring(0, 200)}
                              {uploadResult.extracted_text.length > 200 && "..."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Upload Error */}
                  {uploadError && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-left">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-red-400 font-medium">Upload Failed</span>
                      </div>
                      <p className="text-xs text-red-300 mt-1">{uploadError}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <Button 
            onClick={handleSaveDraft}
            variant="outline" 
            className="border-border text-white hover:bg-muted"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={handleCreateModel}
            className="gradient-orange hover:gradient-orange-hover text-white"
          >
            Create Model
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateModel;
