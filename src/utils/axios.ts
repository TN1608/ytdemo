import axios from 'axios'

const api = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    params: {
        key:  process.env.YOUTUBE_API_KEY,
    },
    headers: {
        'Content-Type': 'application/json',
    },
})

export default api;