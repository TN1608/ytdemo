import jwt from 'jsonwebtoken';

export async function verifyToken(token) {
    try {
        return await jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error('Token verification failed:', err.message);
        throw new Error('Invalid token');
    }
}