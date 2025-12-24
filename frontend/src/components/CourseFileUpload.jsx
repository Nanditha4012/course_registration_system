import { useState } from 'react';
import { courseAPI } from '../services/api';

export default function CourseFileUpload({ courseId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setError(null);
    
    if (!selected) {
      setFile(null);
      return;
    }

    // Validate file size (10MB limit)
    if (selected.size > 10 * 1024 * 1024) {
      setError('File must be less than 10MB');
      setFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!allowedTypes.includes(selected.type)) {
      setError('Only PDF, Word, and PowerPoint files are allowed');
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await courseAPI.uploadFile(courseId, formData);
      
      alert('File uploaded successfully!');
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
      
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ 
      padding: 20, 
      background: '#f5f5f5', 
      borderRadius: 8, 
      marginBottom: 24 
    }}>
      <h4 style={{ marginTop: 0, marginBottom: 12 }}>Upload Course Material</h4>
      
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <input 
            id="file-upload-input"
            type="file" 
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ flex: 1 }}
          />
          <button 
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{ 
              padding: '8px 20px', 
              background: file && !uploading ? '#1976d2' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: file && !uploading ? 'pointer' : 'not-allowed',
              fontWeight: 500
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        
        {file && !error && (
          <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
            📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
        
        {error && (
          <p style={{ margin: 0, fontSize: 14, color: '#d32f2f' }}>
            ⚠️ {error}
          </p>
        )}
        
        <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
          Accepted formats: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx) • Max 10MB
        </p>
      </div>
    </div>
  );
}
