const VideoModel = require('../models/Video');
const { analyzeSensitivity, getVideoDuration } = require('../utils/videoProcessor');
const fileSystem = require('fs');
const pathModule = require('path');

// Handle new video upload
exports.uploadVideo = async (request, response) => {
  try {
    // Validate file presence
    if (!request.file) {
      return response.status(400).json({ error: 'Video file is required' });
    }

    const { title, description, tags, category } = request.body;

    // Extract video metadata
    const videoDuration = await getVideoDuration(request.file.path);

    // Initialize video document
    const videoDocument = new VideoModel({
      filename: request.file.filename,
      originalName: request.file.originalname,
      filePath: request.file.path,
      fileSize: request.file.size,
      mimeType: request.file.mimetype,
      duration: videoDuration,
      owner: request.user._id,
      organization: request.user.organization,
      status: 'processing',
      metadata: {
        title: title || request.file.originalname,
        description: description || '',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        category: category || 'General'
      }
    });

    await videoDocument.save();

    // Notify client via WebSocket
    if (request.app.socketIO) {
      request.app.socketIO.to(request.user._id.toString()).emit('video:uploaded', {
        videoId: videoDocument._id,
        filename: videoDocument.originalName
      });
    }

    // Trigger background processing
    initiateVideoProcessing(videoDocument._id, request.app.socketIO, request.user._id.toString());

    response.status(201).json({
      message: 'Video upload successful',
      video: {
        id: videoDocument._id,
        filename: videoDocument.originalName,
        status: videoDocument.status,
        uploadedAt: videoDocument.uploadedAt
      }
    });
  } catch (uploadError) {
    console.error('Video upload failed:', uploadError);
    
    // Cleanup orphaned file
    if (request.file && fileSystem.existsSync(request.file.path)) {
      fileSystem.unlinkSync(request.file.path);
    }
    
    response.status(500).json({ error: 'Video upload process failed' });
  }
};

// Background video analysis workflow
async function initiateVideoProcessing(videoIdentifier, socketInstance, userIdentifier) {
  try {
    const videoRecord = await VideoModel.findById(videoIdentifier);
    
    if (!videoRecord) {
      console.error('Video record not located:', videoIdentifier);
      return;
    }

    // Perform content analysis with progress tracking
    const analysisResult = await analyzeSensitivity(videoRecord.filePath, (currentProgress) => {
      // Persist progress to database
      VideoModel.findByIdAndUpdate(videoIdentifier, { processingProgress: currentProgress }).exec();
      
      // Broadcast progress to client
      if (socketInstance) {
        socketInstance.to(userIdentifier).emit('video:progress', {
          videoId: videoRecord._id,
          progress: currentProgress
        });
      }
    });

    // Update final analysis results
    videoRecord.sensitivityStatus = analysisResult.sensitivityStatus;
    videoRecord.sensitivityScore = analysisResult.sensitivityScore;
    videoRecord.status = 'completed';
    videoRecord.processedAt = new Date();
    videoRecord.processingProgress = 100;

    await videoRecord.save();

    // Notify completion via WebSocket
    if (socketInstance) {
      socketInstance.to(userIdentifier).emit('video:completed', {
        videoId: videoRecord._id,
        sensitivityStatus: analysisResult.sensitivityStatus,
        sensitivityScore: analysisResult.sensitivityScore
      });
    }
  } catch (processingError) {
    console.error('Video processing encountered error:', processingError);
    
    // Mark processing as failed
    await VideoModel.findByIdAndUpdate(videoIdentifier, { 
      status: 'failed',
      processingProgress: 0
    });

    if (socketInstance) {
      socketInstance.to(userIdentifier).emit('video:failed', {
        videoId: videoIdentifier,
        error: 'Analysis workflow failed'
      });
    }
  }
}

// Retrieve user's video collection
exports.getVideos = async (request, response) => {
  try {
    const { status, sensitivityStatus, category, page = 1, limit = 10 } = request.query;
    
    const searchCriteria = {};
    
    // Apply multi-tenancy filtering
    if (request.user.role !== 'admin') {
      searchCriteria.organization = request.user.organization;
      
      // Restrict viewer access to authorized content
      if (request.user.role === 'viewer') {
        searchCriteria.$or = [
          { owner: request.user._id },
          { 'accessControl.allowedUsers': request.user._id }
        ];
      } else {
        // Editors access their own uploads
        searchCriteria.owner = request.user._id;
      }
    }

    // Build dynamic filters
    if (status) searchCriteria.status = status;
    if (sensitivityStatus) searchCriteria.sensitivityStatus = sensitivityStatus;
    if (category) searchCriteria['metadata.category'] = category;

    const videoCollection = await VideoModel.find(searchCriteria)
      .populate('owner', 'username email')
      .sort({ uploadedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalCount = await VideoModel.countDocuments(searchCriteria);

    response.json({
      videos: videoCollection,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (fetchError) {
    console.error('Failed to retrieve videos:', fetchError);
    response.status(500).json({ error: 'Unable to fetch video collection' });
  }
};

// Fetch individual video details
exports.getVideo = async (request, response) => {
  try {
    const videoRecord = await VideoModel.findById(request.params.id).populate('owner', 'username email');

    if (!videoRecord) {
      return response.status(404).json({ error: 'Video resource not found' });
    }

    // Enforce access control
    if (request.user.role !== 'admin' && 
        videoRecord.organization !== request.user.organization) {
      return response.status(403).json({ error: 'Unauthorized access attempt' });
    }

    response.json({ video: videoRecord });
  } catch (retrievalError) {
    console.error('Video retrieval error:', retrievalError);
    response.status(500).json({ error: 'Failed to load video details' });
  }
};

// Stream video with range support
exports.streamVideo = async (request, response) => {
  try {
    const videoRecord = await VideoModel.findById(request.params.id);

    if (!videoRecord) {
      return response.status(404).json({ error: 'Video content not found' });
    }

    // Validate user permissions
    if (request.user.role !== 'admin' && 
        videoRecord.organization !== request.user.organization) {
      return response.status(403).json({ error: 'Stream access denied' });
    }

    const videoFilePath = videoRecord.filePath;
    const fileStats = fileSystem.statSync(videoFilePath);
    const totalSize = fileStats.size;
    const rangeHeader = request.headers.range;

    if (rangeHeader) {
      // Process byte-range streaming request
      const rangeParts = rangeHeader.replace(/bytes=/, '').split('-');
      const startByte = parseInt(rangeParts[0], 10);
      const endByte = rangeParts[1] ? parseInt(rangeParts[1], 10) : totalSize - 1;
      const chunkLength = (endByte - startByte) + 1;
      const videoStream = fileSystem.createReadStream(videoFilePath, { start: startByte, end: endByte });
      const streamHeaders = {
        'Content-Range': `bytes ${startByte}-${endByte}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkLength,
        'Content-Type': videoRecord.mimeType,
      };

      response.writeHead(206, streamHeaders);
      videoStream.pipe(response);
    } else {
      // Stream complete video file
      const fullHeaders = {
        'Content-Length': totalSize,
        'Content-Type': videoRecord.mimeType,
      };
      response.writeHead(200, fullHeaders);
      fileSystem.createReadStream(videoFilePath).pipe(response);
    }
  } catch (streamError) {
    console.error('Video streaming failed:', streamError);
    response.status(500).json({ error: 'Unable to stream video content' });
  }
};

// Remove video and associated file
exports.deleteVideo = async (request, response) => {
  try {
    const videoRecord = await VideoModel.findById(request.params.id);

    if (!videoRecord) {
      return response.status(404).json({ error: 'Video not found for deletion' });
    }

    // Verify deletion permissions
    if (request.user.role !== 'admin' && 
        videoRecord.owner.toString() !== request.user._id.toString()) {
      return response.status(403).json({ error: 'Deletion not authorized' });
    }

    // Remove physical file from storage
    if (fileSystem.existsSync(videoRecord.filePath)) {
      fileSystem.unlinkSync(videoRecord.filePath);
    }

    await VideoModel.findByIdAndDelete(request.params.id);

    response.json({ message: 'Video successfully removed' });
  } catch (deletionError) {
    console.error('Video deletion failed:', deletionError);
    response.status(500).json({ error: 'Unable to delete video' });
  }
};

// Modify video metadata
exports.updateVideo = async (request, response) => {
  try {
    const videoRecord = await VideoModel.findById(request.params.id);

    if (!videoRecord) {
      return response.status(404).json({ error: 'Video not available for update' });
    }

    // Restrict viewer modifications
    if (request.user.role === 'viewer') {
      return response.status(403).json({ error: 'Viewers cannot modify content' });
    }

    // Verify ownership for non-admins
    if (request.user.role !== 'admin' && 
        videoRecord.owner.toString() !== request.user._id.toString()) {
      return response.status(403).json({ error: 'Update permission denied' });
    }

    const { title, description, tags, category } = request.body;

    // Apply metadata updates
    if (title) videoRecord.metadata.title = title;
    if (description) videoRecord.metadata.description = description;
    if (tags) videoRecord.metadata.tags = tags.split(',').map(tag => tag.trim());
    if (category) videoRecord.metadata.category = category;

    await videoRecord.save();

    response.json({ message: 'Video metadata updated successfully', video: videoRecord });
  } catch (updateError) {
    console.error('Video update operation failed:', updateError);
    response.status(500).json({ error: 'Failed to update video information' });
  }
};

module.exports.initiateVideoProcessing = initiateVideoProcessing;
