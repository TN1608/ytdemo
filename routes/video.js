const express = require('express');
const router = express.Router();
const saveVideoController = require('../controllers/savedVideo');
const likeVideoController = require('../controllers/likedVideo');
const getPlaylistController = require('../controllers/getPlaylist');


router.post('/api/saveVideo', saveVideoController.saveVideo);
router.get('/api/getSavedVideos', saveVideoController.getSavedVideos);
router.delete('/api/deleteVideo', saveVideoController.deleteVideo);

router.post('/api/likeVideo', likeVideoController.likeVideo);
router.get('/api/getLikedVideos', likeVideoController.getLikedVideos);

router.get('/api/getPlaylist', getPlaylistController.getPlaylist);

module.exports = router;