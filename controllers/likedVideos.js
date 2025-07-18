var express = require('express');
var router = express.Router();
const axios = require('axios');
const { doc, getDoc, setDoc, getDocs, collection, deleteDoc } = require('firebase/firestore');
const { db } = require('../config/firebase');
const { getVideoData } = require('../services/getVideoData');
const passport = require('passport');

const url = 'https://www.googleapis.com/youtube/v3';

exports.likeVideo = [
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { videoId, status } = req.body;
            const userId = req.user.id; // Lấy từ JWT (email)

            if (!videoId) {
                return res.status(400).json({ error: 'Video ID is required' });
            }
            if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                return res.status(400).json({ error: 'Invalid video ID format' });
            }

            // Kiểm tra video đã được like/dislike bởi người dùng
            const likeRef = doc(db, 'likedVideos', `${userId}_${videoId}`);
            const likeDoc = await getDoc(likeRef);

            if (likeDoc.exists() && likeDoc.data().status === status) {
                // Nếu đã like/dislike với cùng status, xóa để hủy
                await deleteDoc(likeRef);
                return res.status(200).json({ success: true, message: 'Video unliked successfully' });
            }

            // Lưu video vào danh sách likedVideos
            const videoData = await getVideoData(videoId);
            const videoToLike = {
                userId,
                videoId,
                title: videoData.snippet.title,
                description: videoData.snippet.description,
                thumbnail: videoData.snippet.thumbnails.high.url,
                status, // true: like, false: dislike
                updatedAt: new Date().toISOString(),
            };

            await setDoc(likeRef, videoToLike);
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
    },
];

exports.getLikedVideos = [
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.user.id; // Lấy từ JWT
            const likedVideosSnapshot = await getDocs(collection(db, 'likedVideos'));
            const videos = likedVideosSnapshot.docs
                .filter((doc) => doc.data().userId === userId) // Chỉ lấy video của người dùng
                .map((doc) => ({ id: doc.data().videoId, ...doc.data() }));

            if (videos.length === 0) {
                return res.status(200).json({ message: 'No liked videos found', videos: [] });
            }

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
    },
];