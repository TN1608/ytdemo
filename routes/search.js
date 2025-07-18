const express = require('express');
const router = express.Router();
const axios = require('axios');

const url = 'https://www.googleapis.com/youtube/v3';

router.get('/api/search', async (req, res) => {
    const {query, maxResults} = req.query;
    if (!query) {
        return res.status(400).json({error: 'Query parameter is required'});
    }
    try {
        const response = await axios.get(`${url}/search`, {
            params: {
                part: 'snippet',
                q: query,
                maxResults: parseInt(maxResults || 10, 10),
                type: 'video',
                key: process.env.YOUTUBE_API_KEY,
            },
        });
        res.json(response.data);
    } catch (err) {
        console.error('Error searching videos:', err.message);
        res.status(500).json({
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        });
    }
});

module.exports = router;