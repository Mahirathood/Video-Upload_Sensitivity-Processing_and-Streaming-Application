import { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import socketService from '../services/socketService';
import './ProcessingQueue.css';

const ProcessingQueue = () => {
  const [processingVideos, setProcessingVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcessingVideos();

    // Listen for real-time updates
    socketService.on('video:uploaded', handleVideoUploaded);
    socketService.on('video:progress', handleVideoProgress);
    socketService.on('video:completed', handleVideoCompleted);
    socketService.on('video:failed', handleVideoFailed);

    return () => {
      socketService.off('video:uploaded', handleVideoUploaded);
      socketService.off('video:progress', handleVideoProgress);
      socketService.off('video:completed', handleVideoCompleted);
      socketService.off('video:failed', handleVideoFailed);
    };
  }, []);

  const fetchProcessingVideos = async () => {
    try {
      setLoading(true);
      const data = await videoService.getVideos({ status: 'processing' });
      setProcessingVideos(data.videos);
    } catch (error) {
      console.error('Error fetching processing videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUploaded = (data) => {
    console.log('Video uploaded:', data);
    fetchProcessingVideos();
  };

  const handleVideoProgress = (data) => {
    console.log('Video progress:', data);
    setProcessingVideos(prev =>
      prev.map(video =>
        video._id === data.videoId
          ? { ...video, processingProgress: data.progress }
          : video
      )
    );
  };

  const handleVideoCompleted = (data) => {
    console.log('Video completed:', data);
    setProcessingVideos(prev =>
      prev.filter(video => video._id !== data.videoId)
    );
  };

  const handleVideoFailed = (data) => {
    console.log('Video failed:', data);
    setProcessingVideos(prev =>
      prev.map(video =>
        video._id === data.videoId
          ? { ...video, status: 'failed' }
          : video
      )
    );
  };

  return (
    <div className="processing-queue">
      <div className="queue-header">
        <h2>Processing Queue</h2>
        <div className="queue-stats">
          <span className="stat">
            {processingVideos.length} video{processingVideos.length !== 1 ? 's' : ''} processing
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : processingVideos.length === 0 ? (
        <div className="no-processing">
          <p>✅ No videos currently processing</p>
          <p className="subtitle">All your videos have been processed!</p>
        </div>
      ) : (
        <div className="processing-list">
          {processingVideos.map((video) => (
            <div key={video._id} className="processing-item">
              <div className="item-icon">⚙️</div>
              <div className="item-info">
                <h4>{video.metadata.title}</h4>
                <p className="item-filename">{video.originalName}</p>
                <div className="progress-container">
                  <div className="progress-bar-processing">
                    <div
                      className="progress-fill-processing"
                      style={{ width: `${video.processingProgress}%` }}
                    >
                      <span className="progress-text-inner">
                        {video.processingProgress}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="item-meta">
                  <span>📁 {(video.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>⏱️ Processing sensitivity analysis...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcessingQueue;
