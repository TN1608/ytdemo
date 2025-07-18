var express = require('express');
var router = express.Router();
const playlist = require('../controllers/playlist');

router.get('/api/playlist', playlist.getPlaylist);
router.post('/api/savePlaylist', playlist.savePlaylist);
router.get('/api/savedPlaylists', playlist.getSavedPlaylists);

module.exports = router;