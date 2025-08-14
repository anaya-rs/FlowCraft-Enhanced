import axios from 'axios';
import authService from './authService';

const API_BASE = 'http://localhost:8000/api/v1';

export interface DocumentShareCreate {
  document_id: string;
  recipient_email?: string;
  recipient_name?: string;
  access_level: 'view' | 'comment' | 'edit';
  expires_at?: string;
  message?: string;
  public_link: boolean;
  
  // API Endpoint Configuration
  api_endpoint_enabled?: boolean;
  api_permissions?: {
    read: boolean;
    write: boolean;
    delete: boolean;
    full_access: boolean;
    rate_limit?: number;
    ip_restriction?: string;
  };
  
  // Webhook Configuration
  webhook_url?: string;
  webhook_events?: string[];
  webhook_secret?: string;
  
  // Export Configuration
  export_directory?: string;
  export_format?: 'json' | 'csv' | 'pdf' | 'excel';
  auto_export?: boolean;
  compression?: boolean;
}

export interface DocumentShareResponse {
  id: string;
  document_id: string;
  document_name: string;
  shared_by: string;
  recipient_email?: string;
  recipient_name?: string;
  access_level: string;
  share_link?: string;
  expires_at?: string;
  message?: string;
  
  // API Endpoint Configuration
  api_endpoint_enabled: boolean;
  api_key?: string;
  api_permissions?: any;
  
  // Webhook Configuration
  webhook_url?: string;
  webhook_events?: string[];
  webhook_secret?: string;
  webhook_active: boolean;
  
  // Export Configuration
  export_directory?: string;
  export_format?: string;
  auto_export: boolean;
  compression: boolean;
  
  created_at: string;
  is_active: boolean;
}

export interface DocumentShareUpdate {
  access_level?: 'view' | 'comment' | 'edit';
  expires_at?: string;
  message?: string;
  is_active?: boolean;
}

export interface DocumentShareList {
  shares: DocumentShareResponse[];
  total: number;
}

export interface SharedDocumentAccess {
  document_id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  access_level: string;
  shared_by: string;
  message?: string;
  extracted_text?: string;
  ocr_confidence?: number;
  document_type?: string;
  ai_analysis?: any;
  key_value_pairs?: any;
  entities?: any;
}

class SharingService {
  private api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = authService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async shareDocument(documentId: string, shareData: DocumentShareCreate): Promise<DocumentShareResponse> {
    const response = await this.api.post(`/sharing/documents/${documentId}/share`, shareData);
    return response.data;
  }

  async getDocumentShares(documentId: string, skip = 0, limit = 100): Promise<DocumentShareList> {
    const response = await this.api.get(`/sharing/documents/${documentId}/shares`, {
      params: { skip, limit }
    });
    return response.data;
  }

  async getUserShares(skip = 0, limit = 100): Promise<DocumentShareList> {
    const response = await this.api.get('/sharing/shares', {
      params: { skip, limit }
    });
    return response.data;
  }

  async updateShare(shareId: string, shareUpdate: DocumentShareUpdate): Promise<DocumentShareResponse> {
    const response = await this.api.put(`/sharing/shares/${shareId}`, shareUpdate);
    return response.data;
  }

  async deleteShare(shareId: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/sharing/shares/${shareId}`);
    return response.data;
  }

  async accessSharedDocument(shareToken: string): Promise<SharedDocumentAccess> {
    const response = await this.api.get(`/sharing/shared/${shareToken}`);
    return response.data;
  }

  async revokeShare(shareId: string): Promise<{ message: string }> {
    const response = await this.api.post(`/sharing/shares/${shareId}/revoke`);
    return response.data;
  }

  async extendShare(shareId: string, days: number): Promise<{ message: string; new_expires_at: string }> {
    const response = await this.api.post(`/sharing/shares/${shareId}/extend`, null, {
      params: { days }
    });
    return response.data;
  }

  async generatePublicLink(documentId: string, accessLevel: 'view' | 'comment' | 'edit' = 'view'): Promise<DocumentShareResponse> {
    const shareData: DocumentShareCreate = {
      document_id: documentId,
      access_level: accessLevel,
      public_link: true
    };
    return this.shareDocument(documentId, shareData);
  }

  async shareWithUser(
    documentId: string, 
    recipientEmail: string, 
    recipientName: string, 
    accessLevel: 'view' | 'comment' | 'edit' = 'view',
    message?: string
  ): Promise<DocumentShareResponse> {
    const shareData: DocumentShareCreate = {
      document_id: documentId,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      access_level: accessLevel,
      public_link: false,
      ...(message && { message })
    };
    return this.shareDocument(documentId, shareData);
  }
}

export const sharingService = new SharingService();
