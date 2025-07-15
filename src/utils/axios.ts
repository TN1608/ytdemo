import axios from 'axios'

const apiKey = process.env.NEXT_PUBLIC_API_KEY

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    params: {
        key: apiKey,
    },
    headers: {
        'Content-Type': 'application/json',
    },
})

export default api;