import { useState } from 'react';
import { videoService } from '../services/videoService';
import './VideoUpload.css';

const VideoUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoMetadata, setVideoMetadata] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'General'
  });
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({ type: '', text: '' });

  const handleFileSelection = (event) => {
    const chosenFile = event.target.files[0];
    if (chosenFile) {
      setSelectedFile(chosenFile);
      if (!videoMetadata.title) {
        setVideoMetadata({ ...videoMetadata, title: chosenFile.name });
      }
    }
  };

  const handleMetadataInput = (event) => {
    setVideoMetadata({
      ...videoMetadata,
      [event.target.name]: event.target.value
    });
  };

  const handleFormSubmission = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setNotificationMessage({ type: 'error', text: 'Video file selection is required' });
      return;
    }

    setIsUploading(true);
    setNotificationMessage({ type: '', text: '' });

    try {
      const uploadData = new FormData();
      uploadData.append('video', selectedFile);
      uploadData.append('title', videoMetadata.title);
      uploadData.append('description', videoMetadata.description);
      uploadData.append('tags', videoMetadata.tags);
      uploadData.append('category', videoMetadata.category);

      await videoService.uploadVideo(uploadData, (currentProgress) => {
        setProgressPercentage(currentProgress);
      });

      setNotificationMessage({ 
        type: 'success', 
        text: 'Upload completed! Video processing will start momentarily.' 
      });
      
      // Clear form data
      setSelectedFile(null);
      setVideoMetadata({
        title: '',
        description: '',
        tags: '',
        category: 'General'
      });
      setProgressPercentage(0);
      
      // Reset file input field
      const fileInputElement = document.querySelector('input[type="file"]');
      if (fileInputElement) fileInputElement.value = '';
    } catch (uploadError) {
      setNotificationMessage({ 
        type: 'error', 
        text: uploadError.response?.data?.error || 'Upload operation failed. Please retry.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="video-upload">
      <h2>Upload Video</h2>
      
      {notificationMessage.text && (
        <div className={`message ${notificationMessage.type}`}>
          {notificationMessage.text}
        </div>
      )}

      <form onSubmit={handleFormSubmission}>
        <div className="form-group">
          <label htmlFor="video-file">Video File *</label>
          <input
            type="file"
            id="video-file"
            accept="video/*"
            onChange={handleFileSelection}
            disabled={isUploading}
          />
          {selectedFile && (
            <p className="file-info">
              Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={videoMetadata.title}
            onChange={handleMetadataInput}
            required
            disabled={isUploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={videoMetadata.description}
            onChange={handleMetadataInput}
            rows="4"
            disabled={isUploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={videoMetadata.tags}
            onChange={handleMetadataInput}
            placeholder="e.g., tutorial, coding, react"
            disabled={isUploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={videoMetadata.category}
            onChange={handleMetadataInput}
            disabled={isUploading}
          >
            <option value="General">General</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
            <option value="Sports">Sports</option>
          </select>
        </div>

        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="progress-text">Uploading: {progressPercentage}%</p>
          </div>
        )}

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
