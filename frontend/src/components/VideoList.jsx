import { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import VideoPlayer from './VideoPlayer';
import './VideoList.css';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    sensitivityStatus: '',
    category: ''
  });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, [filters]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.sensitivityStatus) params.sensitivityStatus = filters.sensitivityStatus;
      if (filters.category) params.category = filters.category;

      const data = await videoService.getVideos(params);
      setVideos(data.videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handlePlay = (video) => {
    setSelectedVideo(video);
    setShowPlayer(true);
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await videoService.deleteVideo(videoId);
      setVideos(videos.filter(v => v._id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      uploading: 'badge-blue',
      processing: 'badge-yellow',
      completed: 'badge-green',
      failed: 'badge-red'
    };
    return statusColors[status] || 'badge-gray';
  };

  const getSensitivityBadge = (status) => {
    const statusColors = {
      pending: 'badge-gray',
      safe: 'badge-green',
      flagged: 'badge-red'
    };
    return statusColors[status] || 'badge-gray';
  };

  return (
    <div className="video-list">
      <div className="video-list-header">
        <h2>My Videos</h2>
        <button onClick={fetchVideos} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      <div className="filters">
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Status</option>
          <option value="uploading">Uploading</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        <select 
          name="sensitivityStatus" 
          value={filters.sensitivityStatus} 
          onChange={handleFilterChange}
        >
          <option value="">All Sensitivity</option>
          <option value="pending">Pending</option>
          <option value="safe">Safe</option>
          <option value="flagged">Flagged</option>
        </select>

        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          <option value="General">General</option>
          <option value="Education">Education</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Technology">Technology</option>
          <option value="Business">Business</option>
          <option value="Sports">Sports</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className="no-videos">No videos found</div>
      ) : (
        <div className="videos-grid">
          {videos.map((video) => (
            <div key={video._id} className="video-card">
              <div className="video-thumbnail">
                🎬
              </div>
              <div className="video-info">
                <h3>{video.metadata.title}</h3>
                <p className="video-description">
                  {video.metadata.description || 'No description'}
                </p>
                
                <div className="video-meta">
                  <span>📁 {formatFileSize(video.fileSize)}</span>
                  <span>📅 {formatDate(video.uploadedAt)}</span>
                </div>

                <div className="video-badges">
                  <span className={`badge ${getStatusBadge(video.status)}`}>
                    {video.status}
                  </span>
                  <span className={`badge ${getSensitivityBadge(video.sensitivityStatus)}`}>
                    {video.sensitivityStatus}
                  </span>
                  {video.metadata.category && (
                    <span className="badge badge-purple">
                      {video.metadata.category}
                    </span>
                  )}
                </div>

                {video.status === 'processing' && (
                  <div className="processing-progress">
                    <div className="progress-bar-small">
                      <div 
                        className="progress-fill-small" 
                        style={{ width: `${video.processingProgress}%` }}
                      />
                    </div>
                    <span>{video.processingProgress}%</span>
                  </div>
                )}

                <div className="video-actions">
                  {video.status === 'completed' && (
                    <button 
                      onClick={() => handlePlay(video)}
                      className="btn-play"
                    >
                      ▶ Play
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(video._id)}
                    className="btn-delete"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPlayer && selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </div>
  );
};

export default VideoList;
