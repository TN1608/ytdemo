var express = require('express');
var router = express.Router();
const axios = require('axios');
const {doc, getDoc, setDoc, getDocs, collection, deleteDoc} = require('firebase/firestore');
const {db} = require('../config/firebase');
const {getVideoData} = require('../services/getVideoData');
const passport = require('passport');

const url = 'https://www.googleapis.com/youtube/v3';

exports.saveVideo = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const {videoId} = req.body;
            const userId = req.user.id; // Lấy từ JWT (email)
            if (!videoId) {
                return res.status(400).json({error: 'Video ID is required'});
            }
            if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                return res.status(400).json({error: 'Invalid video ID format'});
            }

            // Kiểm tra video đã lưu chưa
            const videoRef = doc(db, 'savedVideos', `${userId}_${videoId}`);
            const videoDoc = await getDoc(videoRef);
            if (videoDoc.exists()) {
                return res.status(202).json({message: 'Video already saved'});
            }

            // Lấy thông tin từ YouTube
            const videoData = await getVideoData(videoId);
            const videoToSave = {
                userId,
                videoId,
                title: videoData.snippet.title,
                description: videoData.snippet.description,
                thumbnail: videoData.snippet.thumbnails.high.url,
                savedAt: new Date().toISOString(),
            };

            await setDoc(videoRef, videoToSave);
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
    },
];

exports.getSavedVideos = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const userId = req.user.id; // Lấy từ JWT
            const videosSnapshot = await getDocs(collection(db, 'savedVideos'));
            const videos = videosSnapshot.docs
                .filter((doc) => doc.data().userId === userId)
                .map((doc) => ({id: doc.data().videoId, ...doc.data()}));

            if (videos.length === 0) {
                return res.status(200).json({message: 'No saved videos found', videos: []});
            }

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
    },
];

exports.deleteVideo = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const {videoId} = req.body;
            const userId = req.user.id; // Lấy từ JWT
            if (!videoId) {
                return res.status(400).json({error: 'Video ID is required'});
            }

            const videoRef = doc(db, 'savedVideos', `${userId}_${videoId}`);
            const videoDoc = await getDoc(videoRef);
            if (!videoDoc.exists()) {
                return res.status(404).json({error: 'Video not found'});
            }

            await deleteDoc(videoRef);
            res.status(200).json({message: 'Video deleted successfully'});
        } catch (err) {
            console.error('Error deleting video:', err.message);
            res.status(500).json({
                error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
            });
        }
    },
];