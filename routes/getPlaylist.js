var express = require('express');
var router = express.Router();
const axios = require('axios');

const url = 'https://www.googleapis.com/youtube/v3';

router.get('/api/getPlaylist', async (req, res) => {
    const {playlistId, maxResults = 10} = req.query;
    if (!playlistId) {
        return res.status(400).json({error: 'Playlist ID parameter is required'});
    }
    try {
        const response = await axios.get(`${url}/playlistItems`, {
            params: {
                part: 'snippet',
                playlistId: playlistId,
                maxResults: maxResults,
                key: process.env.YOUTUBE_API_KEY
            }
        });
        res.json(response.data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;