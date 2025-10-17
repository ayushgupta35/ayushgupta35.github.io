import React, { useState } from 'react';
import { imageService } from '../../firebase/imageService';

const HtmlFileUpload = ({ currentFile, onFileChange, label = "HTML File" }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.html')) {
      setError('Please select an HTML file (.html)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const result = await imageService.uploadHtmlFile(file);
      onFileChange(result.url, result.path);
    } catch (error) {
      console.error('Error uploading HTML file:', error);
      setError('Failed to upload HTML file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this HTML file?')) {
      onFileChange('', '');
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
        {label}
      </label>
      
      {!currentFile ? (
        <div style={{
          border: '2px dashed #ddd',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <input
            type="file"
            accept=".html"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ marginBottom: '1rem' }}
          />
          <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
            {uploading ? 'Uploading HTML file...' : 'Select an HTML file to upload'}
          </p>
          <p style={{ margin: '0', color: '#999', fontSize: '0.8rem' }}>
            Supported: .html files (max 10MB)
          </p>
        </div>
      ) : (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#4B2E83',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              HTML
            </div>
            <div>
              <p style={{ margin: '0', fontWeight: '500' }}>HTML File Uploaded</p>
              <a 
                href={currentFile} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#4B2E83', 
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}
              >
                View File
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="file"
              accept=".html"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }}
              id="html-file-replace"
            />
            <label
              htmlFor="html-file-replace"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {uploading ? 'Uploading...' : 'Replace'}
            </label>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {uploading && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          backgroundColor: '#d1ecf1',
          border: '1px solid #bee5eb',
          borderRadius: '4px',
          color: '#0c5460',
          fontSize: '0.9rem'
        }}>
          Uploading HTML file to Firebase Storage...
        </div>
      )}
    </div>
  );
};

export default HtmlFileUpload;