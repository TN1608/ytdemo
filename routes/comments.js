const express = require('express');
const {getComments, addComment, deleteComment} = require("../controllers/comments");
const router = express.Router();

router.get('/api/comments', getComments)
router.post('/api/comment', addComment)
router.delete('/api/comment/:commentId', deleteComment)

module.exports = router;