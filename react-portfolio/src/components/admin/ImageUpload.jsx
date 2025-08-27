import React, { useState } from 'react';
import { imageService } from '../../firebase/imageService';

const ImageUpload = ({ 
  currentImage, 
  onImageChange, 
  folder = 'images', 
  label = 'Upload Image',
  accept = 'image/*' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create preview
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Upload to Firebase
      const result = await imageService.uploadImage(file, folder);
      
      // Update parent component
      onImageChange(result.url, result.path);
      
      // Update preview with Firebase URL
      setPreviewUrl(result.url);
      
      // Clean up local preview
      URL.revokeObjectURL(localPreview);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Error uploading image: ${error.message}`);
      setPreviewUrl(currentImage || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onImageChange('', '');
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        {label}
      </label>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            backgroundColor: uploading ? '#f5f5f5' : 'white'
          }}
        />
        
        {uploading && (
          <div style={{ color: '#007bff', fontSize: '0.9rem' }}>
            Uploading...
          </div>
        )}
      </div>

      {previewUrl && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <strong>Current Image:</strong>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Remove
            </button>
          </div>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: '200px',
              maxHeight: '150px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#666', 
            marginTop: '0.5rem',
            wordBreak: 'break-all'
          }}>
            {previewUrl}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
