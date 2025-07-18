const express = require('express');
const {saveVideo, getSavedVideos, deleteVideo} = require("../controllers/savedVideos");
const {likeVideo, getLikedVideos} = require("../controllers/likedVideos");
const {getById} = require("../controllers/video");
const router = express.Router();



// Lấy thông tin video từ YouTube
// GET: Lấy thông tin video từ YouTube
router.get('/api/getById', getById)

// POST: Lưu video
router.post('/api/saveVideo', saveVideo)

// GET: Lấy danh sách video đã lưu
router.get('/api/getSavedVideos', getSavedVideos)
// DELETE: Xóa video đã lưu
router.delete('/api/deleteVideo', deleteVideo)

// POST : LIKE THE VIDEO
// {
//      videoId: 'abc',
//      title: 'Video Title',
//      description: 'Video Description',
//      status: true/false (like/dislike)
//      updatedAt: timestamp
// }
// Neu ma ko like , ko dislike => xoa video khoi danh sach
router.post('/api/likeVideo', likeVideo)
// GET : GET LIKED VIDEOS
router.get('/api/getLikedVideos', getLikedVideos)

module.exports = router;