const express = require('express');
const router = express.Router();

const getPlaylist = require('./getPlaylist');
const searchVideos = require('./search');
const saveVideo = require('./saveVideo');
const user = require('./user');


router.use('/', getPlaylist);
router.use('/', searchVideos);
router.use('/', saveVideo);
router.use('/', user);

module.exports = router;