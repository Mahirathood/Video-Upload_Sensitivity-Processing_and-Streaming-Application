const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    default: 'uploading'
  },
  processingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sensitivityStatus: {
    type: String,
    enum: ['pending', 'safe', 'flagged'],
    default: 'pending'
  },
  sensitivityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  metadata: {
    title: String,
    description: String,
    tags: [String],
    category: String
  },
  accessControl: {
    allowedRoles: {
      type: [String],
      default: ['viewer', 'editor', 'admin']
    },
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  }
});

// Index for efficient queries
videoSchema.index({ owner: 1, organization: 1 });
videoSchema.index({ status: 1 });
videoSchema.index({ sensitivityStatus: 1 });

module.exports = mongoose.model('Video', videoSchema);
