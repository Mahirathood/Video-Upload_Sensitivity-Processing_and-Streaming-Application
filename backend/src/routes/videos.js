const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Routes
router.post(
  '/upload', 
  auth, 
  authorize('editor', 'admin'), 
  upload.single('video'), 
  videoController.uploadVideo
);

router.get('/', auth, videoController.getVideos);
router.get('/:id', auth, videoController.getVideo);
router.get('/:id/stream', auth, videoController.streamVideo);
router.put('/:id', auth, authorize('editor', 'admin'), videoController.updateVideo);
router.delete('/:id', auth, authorize('editor', 'admin'), videoController.deleteVideo);

module.exports = router;
