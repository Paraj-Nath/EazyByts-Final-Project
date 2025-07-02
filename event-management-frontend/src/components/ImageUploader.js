// src/components/ImageUploader.js
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

function ImageUploader({ onImageChange, currentImageUrl }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    // Set initial preview if an image URL is provided (for EditEvent)
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    } else {
      setPreviewUrl(null); // Clear preview if no current image
    }
  }, [currentImageUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed.');
        event.target.value = null; // Clear input
        setPreviewUrl(null);
        onImageChange(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size cannot exceed 5MB.');
        event.target.value = null; // Clear input
        setPreviewUrl(null);
        onImageChange(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      onImageChange(file); // Pass the File object to the parent component
    } else {
      setPreviewUrl(null);
      onImageChange(null); // Pass null if no file selected/cleared
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
    onImageChange(''); // Signal to parent to remove image (for update scenarios)
    toast.info('Image cleared. Upload a new one or save to remove.');
  };

  return (
    <div style={{ marginBottom: '15px', border: '1px dashed #ccc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
      <label htmlFor="image-upload" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
        Event Image Upload:
      </label>
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ marginBottom: '10px', display: 'block', width: '100%' }}
      />
      {previewUrl && (
        <div style={{ marginTop: '15px' }}>
          <img
            src={previewUrl}
            alt="Image Preview"
            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button
            type="button" // Important to prevent form submission
            onClick={clearImage}
            style={{
              marginTop: '10px',
              padding: '8px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9em'
            }}
          >
            Remove Image
          </button>
        </div>
      )}
      {!previewUrl && currentImageUrl && (
          <p style={{ color: '#777', fontSize: '0.9em' }}>
              No new image selected. Current image will be kept.
              <button
                type="button"
                onClick={clearImage}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.8em'
                }}
              >
                  Clear Current
              </button>
          </p>
      )}
    </div>
  );
}

export default ImageUploader;