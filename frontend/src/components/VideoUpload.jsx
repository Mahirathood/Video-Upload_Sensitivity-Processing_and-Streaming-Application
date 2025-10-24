import { useState } from 'react';
import { videoService } from '../services/videoService';
import './VideoUpload.css';

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'General'
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!metadata.title) {
        setMetadata({ ...metadata, title: selectedFile.name });
      }
    }
  };

  const handleMetadataChange = (e) => {
    setMetadata({
      ...metadata,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a video file' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', metadata.title);
      formData.append('description', metadata.description);
      formData.append('tags', metadata.tags);
      formData.append('category', metadata.category);

      await videoService.uploadVideo(formData, (progress) => {
        setUploadProgress(progress);
      });

      setMessage({ 
        type: 'success', 
        text: 'Video uploaded successfully! Processing will begin shortly.' 
      });
      
      // Reset form
      setFile(null);
      setMetadata({
        title: '',
        description: '',
        tags: '',
        category: 'General'
      });
      setUploadProgress(0);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Upload failed. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="video-upload">
      <h2>Upload Video</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="video-file">Video File *</label>
          <input
            type="file"
            id="video-file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {file && (
            <p className="file-info">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={metadata.title}
            onChange={handleMetadataChange}
            required
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={metadata.description}
            onChange={handleMetadataChange}
            rows="4"
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={metadata.tags}
            onChange={handleMetadataChange}
            placeholder="e.g., tutorial, coding, react"
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={metadata.category}
            onChange={handleMetadataChange}
            disabled={uploading}
          >
            <option value="General">General</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
            <option value="Sports">Sports</option>
          </select>
        </div>

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="progress-text">Uploading: {uploadProgress}%</p>
          </div>
        )}

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={uploading || !file}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
