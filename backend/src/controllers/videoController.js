const Video = require('../models/Video');
const { analyzeSensitivity, getVideoDuration } = require('../utils/videoProcessor');
const fs = require('fs');
const path = require('path');

// Upload video
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { title, description, tags, category } = req.body;

    // Get video duration
    const duration = await getVideoDuration(req.file.path);

    // Create video document
    const video = new Video({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      duration,
      owner: req.user._id,
      organization: req.user.organization,
      status: 'processing',
      metadata: {
        title: title || req.file.originalname,
        description: description || '',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        category: category || 'General'
      }
    });

    await video.save();

    // Emit socket event for upload completion
    if (req.app.io) {
      req.app.io.to(req.user._id.toString()).emit('video:uploaded', {
        videoId: video._id,
        filename: video.originalName
      });
    }

    // Start async processing
    processVideo(video._id, req.app.io, req.user._id.toString());

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        filename: video.originalName,
        status: video.status,
        uploadedAt: video.uploadedAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if upload failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Error uploading video' });
  }
};

// Process video (async function)
async function processVideo(videoId, io, userId) {
  try {
    const video = await Video.findById(videoId);
    
    if (!video) {
      console.error('Video not found:', videoId);
      return;
    }

    // Analyze video sensitivity with progress updates
    const result = await analyzeSensitivity(video.filePath, (progress) => {
      // Update progress in database
      Video.findByIdAndUpdate(videoId, { processingProgress: progress }).exec();
      
      // Emit progress to client
      if (io) {
        io.to(userId).emit('video:progress', {
          videoId: video._id,
          progress
        });
      }
    });

    // Update video with results
    video.sensitivityStatus = result.sensitivityStatus;
    video.sensitivityScore = result.sensitivityScore;
    video.status = 'completed';
    video.processedAt = new Date();
    video.processingProgress = 100;

    await video.save();

    // Emit completion event
    if (io) {
      io.to(userId).emit('video:completed', {
        videoId: video._id,
        sensitivityStatus: result.sensitivityStatus,
        sensitivityScore: result.sensitivityScore
      });
    }
  } catch (error) {
    console.error('Processing error:', error);
    
    // Update video status to failed
    await Video.findByIdAndUpdate(videoId, { 
      status: 'failed',
      processingProgress: 0
    });

    if (io) {
      io.to(userId).emit('video:failed', {
        videoId: videoId,
        error: 'Processing failed'
      });
    }
  }
}

// Get all videos for current user
exports.getVideos = async (req, res) => {
  try {
    const { status, sensitivityStatus, category, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // Multi-tenant filter
    if (req.user.role !== 'admin') {
      query.organization = req.user.organization;
      
      // Viewers can only see their assigned videos or videos they own
      if (req.user.role === 'viewer') {
        query.$or = [
          { owner: req.user._id },
          { 'accessControl.allowedUsers': req.user._id }
        ];
      } else {
        // Editors can see their organization's videos
        query.owner = req.user._id;
      }
    }

    // Apply filters
    if (status) query.status = status;
    if (sensitivityStatus) query.sensitivityStatus = sensitivityStatus;
    if (category) query['metadata.category'] = category;

    const videos = await Video.find(query)
      .populate('owner', 'username email')
      .sort({ uploadedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Video.countDocuments(query);

    res.json({
      videos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Error fetching videos' });
  }
};

// Get single video
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('owner', 'username email');

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        video.organization !== req.user.organization) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Error fetching video' });
  }
};

// Stream video
exports.streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        video.organization !== req.user.organization) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const videoPath = video.filePath;
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range requests for video streaming
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.mimeType,
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Send entire video
      const head = {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType,
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({ error: 'Error streaming video' });
  }
};

// Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Only owner or admin can delete
    if (req.user.role !== 'admin' && 
        video.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from filesystem
    if (fs.existsSync(video.filePath)) {
      fs.unlinkSync(video.filePath);
    }

    await Video.findByIdAndDelete(req.params.id);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Error deleting video' });
  }
};

// Update video metadata
exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Only owner, editor, or admin can update
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role !== 'admin' && 
        video.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, tags, category } = req.body;

    if (title) video.metadata.title = title;
    if (description) video.metadata.description = description;
    if (tags) video.metadata.tags = tags.split(',').map(tag => tag.trim());
    if (category) video.metadata.category = category;

    await video.save();

    res.json({ message: 'Video updated successfully', video });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Error updating video' });
  }
};

module.exports.processVideo = processVideo;
