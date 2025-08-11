import { useState } from "react";
import axios from "axios";

const API_UPLOAD = "http://localhost:8000/api/v1/documents/upload";

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file: File): Promise<any | null> {
    setIsUploading(true);
    setError("");
    setProgress(0);
    try {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(API_UPLOAD, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setProgress(100);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Upload failed.");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return {
    uploadFile,
    progress,
    isUploading,
    error,
  };
}
