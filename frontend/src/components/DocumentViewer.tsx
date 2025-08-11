import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import AIAnalysisPanel from "./AIAnalysisPanel";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface DocumentViewerProps {
  document: {
    file_path: string;
    mime_type: string;
    original_filename: string;
    extracted_text?: string;
    processing_status?: string;
  };
  aiAnalysis: {
    summary: string;
    keyValues: Record<string, { value: string; confidence: number }>;
    confidence: number;
    entities?: any[];
  };
  error?: string;
  isLoading?: boolean;
}

const isPdf = (mime: string) => mime === "application/pdf";
const isImage = (mime: string) => ["image/png", "image/jpeg", "image/jpg", "image/bmp", "image/tiff"].includes(mime);

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, aiAnalysis, error, isLoading }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 w-full animate-fade-in">
      <div className="flex-1 glass-card-dark p-4 flex flex-col items-center justify-center min-h-[400px]">
        <h3 className="text-lg font-bold mb-2 text-white">Document Preview</h3>
        {isLoading ? (
          <div className="text-primary animate-pulse">Processing...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : isPdf(document.mime_type) ? (
          <Document file={document.file_path} loading={<div className="text-gray-400">Loading PDF...</div>}>
            <Page pageNumber={1} width={350} />
          </Document>
        ) : isImage(document.mime_type) ? (
          <img src={document.file_path} alt={document.original_filename} className="rounded-lg max-h-96 object-contain shadow-lg" />
        ) : (
          <div className="text-gray-400">Unsupported file type</div>
        )}
        <div className="mt-4 text-xs text-gray-400">{document.original_filename}</div>
      </div>
      <div className="flex-1">
        <AIAnalysisPanel {...aiAnalysis} />
      </div>
    </div>
  );
};

export default DocumentViewer;
