const express = require('express');
const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getFriends, findFriend, getFriendRequestsSent
} = require("../controllers/friends");
const ERROR = require("../constants/ErrorCodes");
const {getUserFromToken} = require("../models/user");
const router = express.Router();


router.post('/api/request', sendFriendRequest)
router.post('/api/accept/:requestId', acceptFriendRequest)
router.post('/api/reject/:requestId', rejectFriendRequest)
router.get('/api/requests', getFriendRequests)
router.get('/api/friends', getFriends)
router.post('/api/friend/:email', findFriend)
router.get('/api/requestsSent', getFriendRequestsSent)

module.exports = router;