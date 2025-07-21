const express = require('express');
const router = express.Router();

const getPlaylist = require('./getPlaylist');
const searchVideos = require('./search');
const saveVideo = require('./video');
const user = require('./user');
const friends = require('./friends');
const comments = require('./comments');

router.use('/', getPlaylist);
router.use('/', searchVideos);
router.use('/', saveVideo);
router.use('/', user);
router.use('/', friends);
router.use('/', comments);

module.exports = router;