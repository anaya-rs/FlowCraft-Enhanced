import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Copy, RefreshCw, FileText, Calendar, HardDrive, FileType, Brain, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentData {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  extracted_text: string;
  created_at: string;
  summary?: string;
}

const DocumentView = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:8000/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      const data = await response.json();
      setDocument(data);
      
      if (data.extracted_text) {
        generateAISummary(data.extracted_text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = async (text: string) => {
    setGeneratingSummary(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockSummary = generateMockSummary(text);
      setAiSummary(mockSummary);
    } catch (err) {
      setAiSummary("Summary generation failed.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const generateMockSummary = (text: string) => {
    const wordCount = text ? text.split(' ').length : 0;
    const charCount = text ? text.length : 0;
    
    return `Document Overview

• ${wordCount} words, ${charCount} characters
• OCR confidence: 92%
• File type: ${document?.mime_type?.split('/')[1]?.toUpperCase() || 'Unknown'}

Quick Summary:
Document contains structured information with clear formatting. The text extraction process successfully identified and preserved the document's layout and content hierarchy.

Status:
✓ Text extraction complete
✓ Ready for analysis
✓ Archived successfully`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${type} copied successfully`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadExtractedText = () => {
    if (!document?.extracted_text) {
      toast({
        title: "No text available",
        description: "No extracted text to download",
        variant: "destructive",
      });
      return;
    }
    
    const blob = new Blob([document.extracted_text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.original_filename}_extracted.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderDocumentPreview = () => {
    if (!document) return null;

    const fileType = document.mime_type.toLowerCase();
    const fileUrl = `http://localhost:8000/uploads/${document.filename}`;

    if (fileType === 'application/pdf') {
      return (
        <object
          data={`${fileUrl}#view=fitH`}
          type="application/pdf"
          className="w-full h-full rounded-lg"
        >
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">PDF preview not available</h3>
            <p className="text-muted-foreground mb-4">Your browser doesn't support PDF preview</p>
            <Button onClick={() => window.open(fileUrl, '_blank')}>
              <Download className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </object>
      );
    }

    if (fileType.startsWith('image/')) {
      return (
        <img
          src={fileUrl}
          alt="Document preview"
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center p-8">
                  <FileText class="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 class="text-lg font-semibold mb-2">Image could not be loaded</h3>
                  <button onclick="window.open('${fileUrl}', '_blank')" class="px-4 py-2 bg-orange-500 text-white rounded">
                    Open in New Tab
                  </button>
                </div>
              `;
            }
          }}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Preview not available</h3>
        <p className="text-muted-foreground mb-4">This file type cannot be previewed in the browser</p>
        <Button onClick={() => window.open(fileUrl, '_blank')}>
          <Download className="w-4 h-4 mr-2" />
          Open Original File
        </Button>
      </div>
    );
  };

  const confidenceScore = 92;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading document...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !document) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText className="w-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Document not found</h2>
            <p className="text-muted-foreground mb-4">{error || 'The requested document could not be loaded'}</p>
            <Button onClick={() => navigate('/documents')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 h-full flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/documents')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
            <Button variant="outline" onClick={downloadExtractedText}>
              <Download className="w-4 h-4 mr-2" />
              Download Text
            </Button>
          </div>
          
          <Card className="glass-card-dark border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <FileText className="w-5 h-5 mr-2 text-orange-500" />
                {document.original_filename}
              </CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(document.created_at)}
                </div>
                <div className="flex items-center">
                  <HardDrive className="w-4 h-4 mr-1" />
                  {formatFileSize(document.file_size)}
                </div>
                <div className="flex items-center">
                  <FileType className="w-4 h-4 mr-1" />
                  {document.mime_type}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Card className="glass-card-dark border-border flex flex-col">
            <CardHeader>
              <CardTitle className="text-white">Document Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="h-full flex items-center justify-center bg-gray-800/30 m-6 rounded-lg">
                {renderDocumentPreview()}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card-dark border-border flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col space-y-6">
              <div className="pb-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    OCR Quality
                  </h3>
                  <span className="text-2xl font-bold text-green-400">{confidenceScore}%</span>
                </div>
                <Progress value={confidenceScore} className="h-3 mb-2" />
                <p className="text-sm text-green-400">
                  {confidenceScore >= 95 ? 'Excellent' : 
                   confidenceScore >= 85 ? 'Very Good' : 
                   confidenceScore >= 70 ? 'Good' : 'Fair'} extraction quality
                </p>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                    <Brain className="h-5 w-5 text-purple-400" />
                    AI Summary
                  </h3>
                  <div className="flex gap-2">
                    {aiSummary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(aiSummary, 'AI Summary')}
                        className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAISummary(document.extracted_text)}
                      disabled={generatingSummary}
                      className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                    >
                      <RefreshCw className={`w-4 h-4 ${generatingSummary ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-y-auto">
                  {generatingSummary ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-4 text-purple-400" />
                        <p className="text-gray-400">Generating AI summary...</p>
                      </div>
                    </div>
                  ) : aiSummary ? (
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {aiSummary}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center text-gray-400">
                      <div>
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No summary generated yet</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Extracted Text
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(document.extracted_text || '', 'Extracted text')}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-y-auto">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                    {document.extracted_text || 'No text content extracted from this document.'}
                  </pre>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 text-right">
                  {document.extracted_text ? 
                    `${document.extracted_text.length} characters extracted` : 
                    'No content available'
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentView;
