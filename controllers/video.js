var express = require('express');
var router = express.Router();
const axios = require('axios');

const url = 'https://www.googleapis.com/youtube/v3';

exports.getById = async (req, res) => {
    const {videoId} = req.query;
    if (!videoId) {
        return res.status(400).json({error: 'Video ID is required'});
    }
    try {
        const response = await axios.get(`${url}/videos`, {
            params: {
                part: 'snippet,contentDetails,statistics',
                id: videoId,
                key: process.env.YOUTUBE_API_KEY,
            },
        });
        res.status(200).json(response.data);
    } catch (err) {
        console.error('Error fetching video:', err.message);
        res.status(500).json({
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        });
    }
}