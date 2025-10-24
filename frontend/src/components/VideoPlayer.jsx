import { useEffect, useRef } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ video, onClose }) => {
  const videoRef = useRef(null);
  const token = localStorage.getItem('token');
  const streamUrl = `http://localhost:5000/api/videos/${video._id}/stream`;

  useEffect(() => {
    // Handle escape key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="video-player-modal" onClick={onClose}>
      <div className="video-player-content" onClick={(e) => e.stopPropagation()}>
        <div className="player-header">
          <h3>{video.metadata.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="player-wrapper">
          <video
            ref={videoRef}
            controls
            autoPlay
            className="video-element"
          >
            <source src={streamUrl} type={video.mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="player-info">
          {video.metadata.description && (
            <div className="info-section">
              <h4>Description</h4>
              <p>{video.metadata.description}</p>
            </div>
          )}

          <div className="info-section">
            <h4>Details</h4>
            <div className="details-grid">
              <div>
                <span className="label">Category:</span>
                <span>{video.metadata.category || 'N/A'}</span>
              </div>
              <div>
                <span className="label">Sensitivity:</span>
                <span className={`status-${video.sensitivityStatus}`}>
                  {video.sensitivityStatus}
                </span>
              </div>
              <div>
                <span className="label">Uploaded:</span>
                <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="label">File Size:</span>
                <span>{(video.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>
          </div>

          {video.metadata.tags && video.metadata.tags.length > 0 && (
            <div className="info-section">
              <h4>Tags</h4>
              <div className="tags">
                {video.metadata.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
