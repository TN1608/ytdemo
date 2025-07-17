const express = require('express');
const router = express.Router();
const axios = require('axios');
const {doc, getDoc, setDoc, getDocs, collection, deleteDoc} = require('firebase/firestore');
const {db} = require('../config/firebase');

const url = 'https://www.googleapis.com/youtube/v3';

// Lấy thông tin video từ YouTube
async function getVideoData(videoId) {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        throw new Error('Invalid video ID format');
    }
    try {
        const response = await axios.get(`${url}/videos`, {
            params: {
                part: 'snippet',
                id: videoId,
                key: process.env.YOUTUBE_API_KEY,
            },
        });
        if (response.data.items.length === 0) {
            throw new Error('Video not found');
        }
        return response.data.items[0];
    } catch (error) {
        console.error('Error fetching video data:', error.message);
        throw error;
    }
}

// POST: Lưu video
router.post('/api/saveVideo', async (req, res) => {
    try {
        const {videoId} = req.body; // Chuyển videoId sang body
        if (!videoId) {
            return res.status(400).json({error: 'Video ID is required'});
        }
        if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            return res.status(400).json({error: 'Invalid video ID format'});
        }

        // Kiểm tra video đã lưu chưa
        const videoDoc = await getDoc(doc(db, 'videos', videoId));
        if (videoDoc.exists()) {
            return res.status(202).json({message: 'Video already saved'});
        }

        // Lấy thông tin từ YouTube
        const videoData = await getVideoData(videoId);
        const videoToSave = {
            videoId,
            title: videoData.snippet.title,
            description: videoData.snippet.description,
            thumbnail: videoData.snippet.thumbnails.high.url,
            savedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'videos', videoId), videoToSave);
        return res.status(200).json({
            success: true,
            message: 'Video saved successfully',
            video: videoToSave,
        });
    } catch (err) {
        console.error('Error saving video:', err.message);
        res.status(err.message === 'Video not found' ? 404 : 500).json({
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        });
    }
});

// GET: Lấy danh sách video đã lưu
router.get('/api/getSavedVideos', async (req, res) => {
    try {
        const videosSnapshot = await getDocs(collection(db, 'videos'));
        if (videosSnapshot.empty) {
            return res.status(200).json({message: 'No saved videos found', videos: []});
        }
        const videos = videosSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        res.status(200).json({
            message: 'Saved videos fetched successfully',
            videos,
        });
    } catch (err) {
        console.error('Error fetching saved videos:', err.message);
        res.status(500).json({
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        });
    }
});

// DELETE: Xóa video đã lưu
router.delete('/api/videos/:videoId', async (req, res) => {
    try {
        const {videoId} = req.params;
        await deleteDoc(doc(db, 'videos', videoId));
        res.status(200).json({message: 'Video deleted successfully'});
    } catch (err) {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// POST : LIKE THE VIDEO
// {
//      videoId: 'abc',
//      title: 'Video Title',
//      description: 'Video Description',
//      status: true/false (like/dislike)
//      updatedAt: timestamp
// }
// Neu ma ko like , ko dislike => xoa video khoi danh sach
router.post('/api/likeVideo', async (req, res) => {
    try {
        const {videoId, status} = req.body;
        if (!videoId) {
            return res.status(400).json({error: 'Video ID is required'});
        }
        if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            return res.status(400).json({error: 'Invalid video ID format'});
        }

        // Kiểm tra video đã được thích chưa
        // neu duoc thich roi thi xoa video khoi danh sach likedVideos
        const videoDoc = await getDoc(doc(db, 'likedVideos', videoId));
        if (videoDoc.exists()) {
            // Nếu video đã được thích, xóa khỏi danh sách likedVideos
            await deleteDoc(doc(db, 'likedVideos', videoId));
            return res.status(200).json({message: 'Video unliked successfully'});
        }

        // Lưu video vào danh sách likedVideos
        const videoData = await getVideoData(videoId);
        const videoToLike = {
            videoId,
            title: videoData.snippet.title,
            description: videoData.snippet.description,
            thumbnail: videoData.snippet.thumbnails.high.url,
            status: status,
            updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'likedVideos', videoId), videoToLike);
        return res.status(200).json({
            success: true,
            message: 'Video liked successfully',
            video: videoToLike,
        });
    } catch (err) {
        console.error('Error liking video:', err.message);
        res.status(err.message === 'Video not found' ? 404 : 500).json({
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        });
    }
})
// GET : GET LIKED VIDEOS
router.get('/api/getLikedVideos', async (req, res) => {
    try {
        const likedVideosSnapshot = await getDocs(collection(db, 'likedVideos'));
        if (likedVideosSnapshot.empty) {
            return res.status(200).json({message: 'No liked videos found', videos: []});
        }
        const videos = likedVideosSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        res.status(200).json({
            message: 'Liked videos fetched successfully',
            videos,
        });
    } catch (err) {
        console.error('Error fetching liked videos:', err.message);
        res.status(500).json({
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        });
    }
});

module.exports = router;