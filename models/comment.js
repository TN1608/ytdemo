const {db} = require('../config/firebase');
const {doc, setDoc, updateDoc} = require('firebase/firestore');
const {arrayUnion} = require('firebase/firestore');

const createComment = async ({videoId, content, parentId, user}) => {
    const commentId = `${user.email}_${videoId}_${Date.now()}`;
    const commentRef = doc(db, 'comments', commentId);
    await setDoc(commentRef, {
        id: commentId,
        videoId,
        userEmail: user.email,
        username: user.username || 'Anonymous',
        content,
        createdAt: new Date().toISOString(),
        parentId: parentId || null,
        replies: [],
    })
    if (parentId) {
        // Nếu có parentId, thêm comment vào mảng replies của comment cha
        const parentCommentRef = doc(db, 'comments', parentId);
        await updateDoc(parentCommentRef, {
            replies: arrayUnion(commentId)
        });
    }
}

module.exports = {
    createComment,
}