import { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import socketService from '../services/socketService';
import './ProcessingQueue.css';

const ProcessingQueue = () => {
  const [activeProcessing, setActiveProcessing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProcessingVideos();

    // Register real-time event listeners
    socketService.on('video:uploaded', onVideoUploaded);
    socketService.on('video:progress', onProgressUpdate);
    socketService.on('video:completed', onProcessingComplete);
    socketService.on('video:failed', onProcessingFailed);

    return () => {
      socketService.off('video:uploaded', onVideoUploaded);
      socketService.off('video:progress', onProgressUpdate);
      socketService.off('video:completed', onProcessingComplete);
      socketService.off('video:failed', onProcessingFailed);
    };
  }, []);

  const loadProcessingVideos = async () => {
    try {
      setIsLoading(true);
      const responseData = await videoService.getVideos({ status: 'processing' });
      setActiveProcessing(responseData.videos);
    } catch (fetchError) {
      console.error('Failed to load processing queue:', fetchError);
    } finally {
      setIsLoading(false);
    }
  };

  const onVideoUploaded = (eventData) => {
    console.log('New video uploaded:', eventData);
    loadProcessingVideos();
  };

  const onProgressUpdate = (eventData) => {
    console.log('Processing progress update:', eventData);
    setActiveProcessing(previousVideos =>
      previousVideos.map(videoItem =>
        videoItem._id === eventData.videoId
          ? { ...videoItem, processingProgress: eventData.progress }
          : videoItem
      )
    );
  };

  const onProcessingComplete = (eventData) => {
    console.log('Video processing completed:', eventData);
    setActiveProcessing(previousVideos =>
      previousVideos.filter(videoItem => videoItem._id !== eventData.videoId)
    );
  };

  const onProcessingFailed = (eventData) => {
    console.log('Video processing failed:', eventData);
    setActiveProcessing(previousVideos =>
      previousVideos.map(videoItem =>
        videoItem._id === eventData.videoId
          ? { ...videoItem, status: 'failed' }
          : videoItem
      )
    );
  };

  return (
    <div className="processing-queue">
      <div className="queue-header">
        <h2>Processing Queue</h2>
        <div className="queue-stats">
          <span className="stat">
            {activeProcessing.length} video{activeProcessing.length !== 1 ? 's' : ''} processing
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : activeProcessing.length === 0 ? (
        <div className="no-processing">
          <p>✅ No videos currently processing</p>
          <p className="subtitle">All your videos have been processed!</p>
        </div>
      ) : (
        <div className="processing-list">
          {activeProcessing.map((videoItem) => (
            <div key={videoItem._id} className="processing-item">
              <div className="item-icon">⚙️</div>
              <div className="item-info">
                <h4>{videoItem.metadata.title}</h4>
                <p className="item-filename">{videoItem.originalName}</p>
                <div className="progress-container">
                  <div className="progress-bar-processing">
                    <div
                      className="progress-fill-processing"
                      style={{ width: `${videoItem.processingProgress}%` }}
                    >
                      <span className="progress-text-inner">
                        {videoItem.processingProgress}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="item-meta">
                  <span>📁 {(videoItem.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
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
