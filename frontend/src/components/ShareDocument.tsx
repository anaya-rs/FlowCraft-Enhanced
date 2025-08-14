import React, { useState } from 'react';
import { X, Share2, Link, Users, Copy, Check, Webhook, FolderOpen, Globe } from 'lucide-react';
import { sharingService, DocumentShareCreate, DocumentShareResponse } from '../services/sharingService';
import toast from 'react-hot-toast';

interface ShareDocumentProps {
  documentId: string;
  documentName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface WebhookConfig {
  url: string;
  events: string[];
  secretKey: string;
  isActive: boolean;
}

interface ExportConfig {
  localDirectory: string;
  format: 'json' | 'csv' | 'pdf' | 'excel';
  autoExport: boolean;
  compression: boolean;
}

interface ApiConfig {
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    full_access: boolean;
  };
  rateLimit: number;
  ipRestriction: string;
}

export const ShareDocument: React.FC<ShareDocumentProps> = ({
  documentId,
  documentName,
  isOpen,
  onClose
}) => {
  const [shareType, setShareType] = useState<'api' | 'user' | 'webhook' | 'export'>('api');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [expirationDays, setExpirationDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedShare, setGeneratedShare] = useState<DocumentShareResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Webhook configuration
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    url: 'https://api.company.com/webhooks/documents',
    events: ['document.shared', 'document.accessed'],
    secretKey: `whsec_${Math.random().toString(36).substr(2, 15)}`,
    isActive: true
  });

  // Export configuration
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    localDirectory: '/data/exports',
    format: 'json',
    autoExport: false,
    compression: true
  });

  // API configuration
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    permissions: {
      read: true,
      write: false,
      delete: false,
      full_access: false
    },
    rateLimit: 1000,
    ipRestriction: ''
  });

  const handleShare = async () => {
    if (shareType === 'user' && (!recipientEmail || !recipientName)) {
      toast.error('Please fill in recipient email and name');
      return;
    }

    if (shareType === 'webhook' && !webhookConfig.url) {
      toast.error('Please provide a webhook URL');
      return;
    }

    if (shareType === 'export' && !exportConfig.localDirectory) {
      toast.error('Please provide a local directory path');
      return;
    }

    setIsLoading(true);
    try {
      let shareData: DocumentShareCreate;

      if (shareType === 'api') {
        shareData = {
          document_id: documentId,
          access_level: 'view',
          public_link: false,
          expires_at: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
          ...(message && { message }),
          api_endpoint_enabled: true,
          api_permissions: {
            read: apiConfig.permissions.read,
            write: apiConfig.permissions.write,
            delete: apiConfig.permissions.delete,
            full_access: apiConfig.permissions.full_access,
            rate_limit: apiConfig.rateLimit,
            ip_restriction: apiConfig.ipRestriction
          }
        };
      } else if (shareType === 'user') {
        shareData = {
          document_id: documentId,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          access_level: 'view',
          expires_at: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
          ...(message && { message }),
          public_link: false
        };
      } else if (shareType === 'webhook') {
        // For webhook sharing, we'll create a special share that triggers webhooks
        shareData = {
          document_id: documentId,
          access_level: 'view',
          public_link: false,
          expires_at: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
          message: `Webhook-enabled share to ${webhookConfig.url}`,
          webhook_url: webhookConfig.url,
          webhook_events: webhookConfig.events,
          webhook_secret: webhookConfig.secretKey
        };
      } else {
        // For export sharing, we'll create a share that also exports to local directory
        shareData = {
          document_id: documentId,
          access_level: 'view',
          public_link: false,
          expires_at: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
          message: `Export-enabled share to ${exportConfig.localDirectory}`,
          export_directory: exportConfig.localDirectory,
          export_format: exportConfig.format,
          auto_export: exportConfig.autoExport,
          compression: exportConfig.compression
        };
      }

      const result = await sharingService.shareDocument(documentId, shareData);
      setGeneratedShare(result);
      
      let successMessage = 'Document shared successfully!';
      if (shareType === 'webhook') {
        successMessage += ' Webhook configured and active.';
      } else if (shareType === 'export') {
        successMessage += ' Export configuration saved.';
      }
      
      toast.success(successMessage);
    } catch (error) {
      console.error('Error sharing document:', error);
      toast.error('Failed to share document');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const resetForm = () => {
    setShareType('api');
    setRecipientEmail('');
    setRecipientName('');
    setMessage('');
    setExpirationDays(30);
    setGeneratedShare(null);
    setWebhookConfig({
      url: 'https://api.company.com/webhooks/documents',
      events: ['document.shared', 'document.accessed'],
      secretKey: `whsec_${Math.random().toString(36).substr(2, 15)}`,
      isActive: true
    });
    setExportConfig({
      localDirectory: '/data/exports',
      format: 'json',
      autoExport: false,
      compression: true
    });
    setApiConfig({
      permissions: {
        read: true,
        write: false,
        delete: false,
        full_access: false
      },
      rateLimit: 1000,
      ipRestriction: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 font-sans">
            <Share2 className="w-5 h-5 text-orange-500" />
            Share Document
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-400 mb-1 font-sans">Document</p>
          <p className="text-white font-medium truncate font-sans">{documentName}</p>
        </div>

        {!generatedShare ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3 font-sans">Share Type</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => setShareType('api')}
                  className={`flex flex-col items-center justify-center gap-2 py-3 px-3 rounded-lg border transition-colors ${
                    shareType === 'api'
                      ? 'border-orange-500 bg-orange-500/20 text-orange-500'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-sans">API Endpoint</span>
                </button>
                <button
                  onClick={() => setShareType('user')}
                  className={`flex flex-col items-center justify-center gap-2 py-3 px-3 rounded-lg border transition-colors ${
                    shareType === 'user'
                      ? 'border-orange-500 bg-orange-500/20 text-orange-500'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-sans">Specific User</span>
                </button>
                <button
                  onClick={() => setShareType('webhook')}
                  className={`flex flex-col items-center justify-center gap-2 py-3 px-3 rounded-lg border transition-colors ${
                    shareType === 'webhook'
                      ? 'border-orange-500 bg-orange-500/20 text-orange-500'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Webhook className="w-4 h-4" />
                  <span className="text-xs font-sans">API Webhook</span>
                </button>
                <button
                  onClick={() => setShareType('export')}
                  className={`flex flex-col items-center justify-center gap-2 py-3 px-3 rounded-lg border transition-colors ${
                    shareType === 'export'
                      ? 'border-orange-500 bg-orange-500/20 text-orange-500'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-xs font-sans">Local Export</span>
                </button>
              </div>
            </div>

            {/* API Endpoint Configuration */}
            {shareType === 'api' && (
              <div className="space-y-4 mb-6 bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2 font-sans">
                  <Globe className="w-4 h-4 text-orange-400" />
                  API Endpoint Configuration
                </h3>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">API Permissions</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={apiConfig.permissions.read}
                        onChange={(e) => setApiConfig(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, read: e.target.checked }
                        }))}
                        className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300">Read Access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={apiConfig.permissions.write}
                        onChange={(e) => setApiConfig(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, write: e.target.checked }
                        }))}
                        className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300">Write Access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={apiConfig.permissions.delete}
                        onChange={(e) => setApiConfig(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, delete: e.target.checked }
                        }))}
                        className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300">Delete Access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={apiConfig.permissions.full_access}
                        onChange={(e) => setApiConfig(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, full_access: e.target.checked }
                        }))}
                        className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300">Full Access</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Rate Limit (requests/hour)</label>
                    <input
                      type="number"
                      value={apiConfig.rateLimit}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, rateLimit: parseInt(e.target.value) || 1000 }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      min="100"
                      max="10000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">IP Restriction (optional)</label>
                    <input
                      type="text"
                      value={apiConfig.ipRestriction}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, ipRestriction: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      placeholder="192.168.1.0/24"
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave empty for no restriction</p>
                  </div>
                </div>
              </div>
            )}

            {/* Webhook Configuration */}
            {shareType === 'webhook' && (
              <div className="space-y-4 mb-6 bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2 font-sans">
                  <Webhook className="w-4 h-4 text-blue-400" />
                  Webhook Configuration
                </h3>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    value={webhookConfig.url}
                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="https://api.company.com/webhooks/documents"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Events to Trigger</label>
                  <div className="space-y-2">
                    {['document.shared', 'document.accessed', 'document.downloaded'].map((event) => (
                      <label key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={webhookConfig.events.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWebhookConfig(prev => ({ ...prev, events: [...prev.events, event] }));
                            } else {
                              setWebhookConfig(prev => ({ ...prev, events: prev.events.filter(e => e !== event) }));
                            }
                          }}
                          className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-300">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Secret Key</label>
                  <input
                    type="text"
                    value={webhookConfig.secretKey}
                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                    readOnly
                  />
                  <p className="text-xs text-gray-400 mt-1">This secret key will be included in webhook headers for security</p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="webhookActive"
                    checked={webhookConfig.isActive}
                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="webhookActive" className="text-sm text-gray-300">
                    Activate webhook immediately
                  </label>
                </div>
              </div>
            )}

            {/* Export Configuration */}
            {shareType === 'export' && (
              <div className="space-y-4 mb-6 bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2 font-sans">
                  <FolderOpen className="w-4 h-4 text-green-400" />
                  Export Configuration
                </h3>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Local Directory</label>
                  <input
                    type="text"
                    value={exportConfig.localDirectory}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, localDirectory: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                    placeholder="/data/exports"
                  />
                  <p className="text-xs text-gray-400 mt-1">Directory where the document will be exported</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Export Format</label>
                    <select
                      value={exportConfig.format}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                    >
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Compression</label>
                    <select
                      value={exportConfig.compression ? 'enabled' : 'disabled'}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, compression: e.target.value === 'enabled' }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                    >
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoExport"
                    checked={exportConfig.autoExport}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, autoExport: e.target.checked }))}
                    className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label htmlFor="autoExport" className="text-sm text-gray-300">
                    Auto-export when document is accessed
                  </label>
                </div>
              </div>
            )}

            {/* User-specific fields */}
            {shareType === 'user' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Recipient Email</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Expires in</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(parseInt(e.target.value) || 1)}
                  min="1"
                  max="365"
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
                <span className="text-gray-400 text-sm">days</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                placeholder="Add a personal message..."
              />
            </div>

            <button
              onClick={handleShare}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  {shareType === 'webhook' ? 'Configure Webhook & Share' : 
                   shareType === 'export' ? 'Configure Export & Share' : 
                   'Share Document'}
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Document Shared Successfully!</h3>
            
            {shareType === 'api' && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">API Endpoint Created</p>
                <p className="text-white font-medium">Document is now accessible via API</p>
                <p className="text-gray-400 text-sm">Use the document ID to access via your API endpoints</p>
                
                {generatedShare.api_key && (
                  <div className="mt-3 p-3 bg-gray-700 rounded border border-gray-600">
                    <p className="text-sm text-gray-400 mb-1">API Key</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={generatedShare.api_key}
                        readOnly
                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(generatedShare.api_key!)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Keep this key secure - it provides access to your document</p>
                  </div>
                )}
              </div>
            )}

            {generatedShare.recipient_email && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-1">Shared with</p>
                <p className="text-white font-medium">{generatedShare.recipient_name}</p>
                <p className="text-gray-400 text-sm">{generatedShare.recipient_email}</p>
              </div>
            )}

            {shareType === 'webhook' && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-1">Webhook Configured</p>
                <p className="text-white font-medium">{webhookConfig.url}</p>
                <p className="text-gray-400 text-sm">Events: {webhookConfig.events.join(', ')}</p>
              </div>
            )}

            {shareType === 'export' && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-1">Export Configured</p>
                <p className="text-white font-medium">{exportConfig.localDirectory}</p>
                <p className="text-gray-400 text-sm">Format: {exportConfig.format.toUpperCase()}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Share Another
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
