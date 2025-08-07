import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Upload, 
  Search, 
  Download, 
  Eye, 
  Trash2,
  Calendar,
  FileImage,
  File
} from "lucide-react";

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/documents", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        await loadDocuments();
        setSelectedFile(null);
        alert("File uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // ===== UPDATED FUNCTIONS FOR ICON ACTIONS =====
  const handleViewDocument = (doc: any) => {
    navigate(`/documents/view/${doc.id}`);
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      const response = await fetch(`http://localhost:8000/documents/${doc.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      
      if (response.ok) {
        const docData = await response.json();
        const blob = new Blob([docData.extracted_text || "No text extracted"], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.original_filename}_extracted.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to download document");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed");
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    if (confirm(`Are you sure you want to delete "${doc.original_filename}"?`)) {
      try {
        const updatedDocs = documents.filter(d => d.id !== doc.id);
        setDocuments(updatedDocs);
        alert("Document deleted successfully!");
      } catch (error) {
        console.error("Delete error:", error);
        alert("Delete failed");
      }
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return FileImage;
    if (mimeType?.includes('pdf')) return FileText;
    return File;
  };

  const filteredDocuments = documents.filter(doc =>
    doc.original_filename?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
            <p className="text-gray-300">Manage your uploaded documents and extracted content</p>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="glass-card-dark border-border mb-8">
          <CardHeader>
            <CardTitle className="text-white">Quick Upload</CardTitle>
          </CardHeader>
          <CardContent>
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
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="gradient-orange hover:gradient-orange-hover text-white"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        {/* Documents List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="glass-card-dark border-border">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Documents Found</h3>
              <p className="text-gray-400">Upload your first document to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => {
              const FileIcon = getFileIcon(doc.mime_type);
              return (
                <Card key={doc.id} className="glass-card-dark border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 gradient-orange rounded-lg flex items-center justify-center">
                        <FileIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleViewDocument(doc)}
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                          title="View document details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDownloadDocument(doc)}
                          variant="ghost" 
                          size="sm" 
                          className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                          title="Download extracted text"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteDocument(doc)}
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          title="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-white text-sm truncate">{doc.original_filename}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                      <div>Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    {doc.extracted_text && (
                      <div className="p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Extracted Text:</p>
                        <p className="text-xs text-gray-300">
                          {doc.extracted_text.substring(0, 100)}...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Documents;
