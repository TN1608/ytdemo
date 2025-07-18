import axios from 'axios';
const url = 'https://www.googleapis.com/youtube/v3';

export async function getVideoData(videoId) {
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