import React, { useState } from "react";
import { Button } from './ui/button';

interface ExportConfigProps {
  config: {
    destination: string;
    apiUrl?: string;
    email?: string;
  };
  onChange: (config: any) => void;
  onSave: () => void;
}

const ExportConfig: React.FC<ExportConfigProps> = ({ config, onChange, onSave }) => {
  const [localConfig, setLocalConfig] = useState(config);

  const handleChange = (field: string, value: string) => {
    const updated = { ...localConfig, [field]: value };
    setLocalConfig(updated);
    onChange(updated);
  };

  return (
    <div className="glass-card-dark p-6 w-full max-w-md mx-auto animate-fade-in">
      <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent font-sans">Export Configuration</h2>
      <div className="mb-4">
        <label className="block text-sm text-white mb-1 font-sans">Destination</label>
        <select
          className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 text-white focus:border-primary"
          value={localConfig.destination}
          onChange={e => handleChange("destination", e.target.value)}
        >
          <option value="download">Download</option>
          <option value="api">API Endpoint</option>
          <option value="email">Email</option>
        </select>
      </div>
      {localConfig.destination === "api" && (
        <div className="mb-4">
          <label className="block text-sm text-white mb-1 font-sans">API URL</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 text-white focus:border-primary"
            value={localConfig.apiUrl || ""}
            onChange={e => handleChange("apiUrl", e.target.value)}
            placeholder="https://api.example.com/endpoint"
          />
        </div>
      )}
      {localConfig.destination === "email" && (
        <div className="mb-4">
          <label className="block text-sm text-white mb-1 font-sans">Email Address</label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 text-white focus:border-primary"
            value={localConfig.email || ""}
            onChange={e => handleChange("email", e.target.value)}
            placeholder="user@example.com"
          />
        </div>
      )}
      <Button
        className="w-full mt-4"
        variant="primary"
        size="md"
        onClick={onSave}
      >
        Save Configuration
      </Button>
    </div>
  );
};

export default ExportConfig;
