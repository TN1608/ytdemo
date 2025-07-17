var express = require('express');
var router = express.Router();
const getPlaylistController = require('../controllers/getPlaylist');

router.get('/api/getPlaylist', getPlaylistController.getPlaylist);

module.exports = router;