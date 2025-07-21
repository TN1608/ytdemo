const express = require('express');
const router = express.Router();

const getPlaylist = require('./getPlaylist');
const searchVideos = require('./search');
const saveVideo = require('./video');
const user = require('./user');
const friends = require('./friends');


router.use('/', getPlaylist);
router.use('/', searchVideos);
router.use('/', saveVideo);
router.use('/', user);
router.use('/', friends);

module.exports = router;