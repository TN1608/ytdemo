import axios from 'axios'

const apiKey = process.env.NEXT_PUBLIC_API_KEY

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    params: {
        key: apiKey,
    },
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
    },
    withCredentials: true, // Để gửi cookie trong request
})

export default api;