const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// Get video metadata using ffmpeg
const getVideoMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
};

// Simulate video sensitivity analysis
// In production, this would use ML models or external APIs
const analyzeSensitivity = async (filePath, progressCallback) => {
  return new Promise((resolve, reject) => {
    try {
      // Simulate processing with progress updates
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        
        if (progressCallback) {
          progressCallback(progress);
        }

        if (progress >= 100) {
          clearInterval(interval);
          
          // Simulate random sensitivity score
          const sensitivityScore = Math.floor(Math.random() * 100);
          const sensitivityStatus = sensitivityScore > 70 ? 'flagged' : 'safe';
          
          resolve({
            sensitivityScore,
            sensitivityStatus,
            analysis: {
              violence: Math.random() > 0.8,
              nudity: Math.random() > 0.9,
              explicitContent: Math.random() > 0.85,
              harmfulContent: Math.random() > 0.9
            }
          });
        }
      }, 500); // Update every 500ms
    } catch (error) {
      reject(error);
    }
  });
};

// Extract video duration
const getVideoDuration = async (filePath) => {
  try {
    const metadata = await getVideoMetadata(filePath);
    return metadata.format.duration || 0;
  } catch (error) {
    console.error('Error getting video duration:', error);
    return 0;
  }
};

module.exports = {
  getVideoMetadata,
  analyzeSensitivity,
  getVideoDuration
};
