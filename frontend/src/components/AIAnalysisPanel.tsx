import React from "react";

interface Entity {
  type: string;
  value: string;
  confidence: number;
}

interface AIAnalysisPanelProps {
  summary: string;
  keyValues: Record<string, { value: string; confidence: number }>;
  confidence: number;
  entities?: Entity[];
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ summary, keyValues, confidence, entities }) => {
  return (
    <div className="glass-card-dark p-6 w-full max-w-lg mx-auto animate-fade-in">
      <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent font-sans">AI Analysis</h2>
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-1 font-sans">Summary</div>
        <div className="text-white text-base font-medium mb-2 font-sans">{summary}</div>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-sans">
          <span>Overall Confidence:</span>
          <span className="font-bold text-primary">{Math.round(confidence * 100)}%</span>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-1 font-sans">Key-Value Pairs</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(keyValues).map(([k, v]) => (
            <div key={k} className="flex flex-col bg-white/5 rounded p-2">
              <span className="text-xs text-gray-400 font-sans">{k}</span>
              <span className="text-white font-semibold font-sans">{v.value}</span>
              <span className="text-xs text-primary font-sans">{Math.round(v.confidence * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
      {entities && entities.length > 0 && (
        <div className="mb-2">
          <div className="text-sm text-muted-foreground mb-1 font-sans">Entities</div>
          <div className="flex flex-wrap gap-2">
            {entities.map((e, i) => (
              <span key={i} className="px-2 py-1 rounded bg-gradient-orange text-xs text-white font-medium animate-fade-in font-sans">
                {e.type}: {e.value} ({Math.round(e.confidence * 100)}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;
