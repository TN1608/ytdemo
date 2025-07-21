const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const PROVIDER = require('../constants/enum/provider');
const { db } = require('../config/firebase');
const { doc, setDoc, getDoc, updateDoc } = require('firebase/firestore');
const config = require('../config');

// Hàm hash mật khẩu
const hashPassword = async (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return reject(err);
            bcrypt.hash(password, salt, null, (err, hash) => {
                if (err) return reject(err);
                resolve(hash);
            });
        });
    });
};

// Hàm so sánh mật khẩu
const comparePassword = (candidatePassword, hashedPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, hashedPassword, (err, isMatch) => {
            if (err) return reject(err);
            resolve(isMatch);
        });
    });
};

// Hàm tạo người dùng
const createUser = async ({ username, email, password, provider = PROVIDER.LOCAL,googleId,  verified = false }) => {
    const userRef = doc(db, 'users', email);
    const hashedPassword = password ? await hashPassword(password) : null;
    await setDoc(userRef, {
        username,
        email,
        provider,
        verified,
        friends:[],
        friendRequests: [],
        password: hashedPassword,
        googleId: googleId || null,
    });
    return { id: email, email, provider, verified, password: hashedPassword, googleId: googleId || null };
};

// Hàm lấy người dùng theo email
const getUserByEmail = async (email) => {
    const userRef = doc(db, 'users', email);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return null;
    return { id: userDoc.id, ...userDoc.data() };
};

// Hàm cập nhật người dùng
const updateUser = async (email, updates) => {
    const userRef = doc(db, 'users', email);
    await updateDoc(userRef, updates);
    return await getUserByEmail(email);
};
const getUserFromToken = async (token) => {
    try{
        const decoded = jwt.verify(token, config.secret);
        return await getUserByEmail(decoded.sub);
    }catch (err){
        console.error('Token verification failed:', err.message);
        return null;
    }
}

module.exports = {
    hashPassword,
    comparePassword,
    createUser,
    getUserByEmail,
    updateUser,
    getUserFromToken,
};