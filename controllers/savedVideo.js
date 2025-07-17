const savedVideo = require('../models/savedVideo');
const axios = require("axios");

const url = 'https://www.googleapis.com/youtube/v3';

async function getVideoData(videoId) {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        throw new Error('Invalid video ID format');
    }
    try {
        const response = await axios.get(`${url}/videos`, {
            params: {
                part: 'snippet', id: videoId, key: process.env.YOUTUBE_API_KEY,
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

exports.saveVideo = async (req, res) => {
    const {videoId} = req.body;
    if (!videoId) {
        return res.status(400).json({error: 'Video ID is required'});
    }
    try {
        const existingVideo = await savedVideo.findOne({videoId: videoId});
        if (existingVideo) {
            return res.status(202).json({message: 'Video already saved'});
        }

        const videoData = await getVideoData(videoId);
        const videoToSave = new savedVideo({
            id: videoData.id,
            title: videoData.snippet.title,
            description: videoData.snippet.description,
            thumbnail: videoData.snippet.thumbnails.high.url,
            savedAt: new Date(),
        });

        await videoToSave.save();
        return res.status(200).json({
            success: true, message: 'Video saved successfully', video: videoToSave,
        });
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}
exports.getSavedVideos = async (req, res) => {
    try {
        const videos = await savedVideo.find({});
        if (videos.length === 0) {
            return res.status(200).json(videos);
        }
        res.status(200).json(videos);
    } catch (err) {
        return res.status(500).json({error: 'Database error'});
    }
}

exports.deleteVideo = async (req, res) => {
    const {videoId} = req.body;
    if (!videoId) {
        return res.status(400).json({error: 'Video ID is required'});
    }

    try {
        const deletedVideo = await savedVideo.findOneAndDelete({id: videoId});
        if (!deletedVideo) {
            return res.status(404).json({error: 'Video not found'});
        }
        res.status(200).json({
            success: true, message: 'Video deleted successfully', video: deletedVideo,
        });
    } catch (err) {
        return res.status(500).json({error: 'Database error'});
    }
}