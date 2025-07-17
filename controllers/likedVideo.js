const likedVideos = require('../models/likedVideo');
const axios = require("axios");

const url = 'https://www.googleapis.com/youtube/v3';

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

exports.likeVideo = async (req, res) => {
    try {
        const {videoId, status} = req.body;
        if (!videoId) {
            return res.status(400).json({error: 'Video ID is required'});
        }
        if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            return res.status(400).json({error: 'Invalid video ID format'});
        }

        // Kiểm tra video đã được thích chưa
        const existingVideo = await likedVideos.findOne({id: videoId});
        if (existingVideo) {
            // Nếu video đã tồn tại thì xóa khỏi danh sách likedVideos
            await likedVideos.deleteOne({id: videoId});
            return res.status(200).json({
                success: true,
                message: 'Video removed from likedVideos successfully',
            });
        }

        // Lưu video vào danh sách likedVideos
        const videoData = await getVideoData(videoId);
        const videoToLike = {
            id: videoId,
            title: videoData.snippet.title,
            description: videoData.snippet.description,
            thumbnail: videoData.snippet.thumbnails.high.url,
            status: status,
            updatedAt: new Date(),
        };

        const newLikedVideo = new likedVideos(videoToLike);
        await newLikedVideo.save();
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
}

exports.getLikedVideos = async (req, res) => {
    try{
        const videos = await likedVideos.find({});
        if (videos.length === 0) {
            return res.status(200).json({message: 'No liked videos found', videos: []});
        }
        res.status(200).json(videos);
    }catch (err) {
        console.error('Error fetching liked videos:', err.message);
        res.status(500).json({
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        });
    }
};