const {db, firebase} = require('../config/firebase');
const {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    arrayRemove
} = require('firebase/firestore');
const passport = require('passport');
const {createComment} = require("../models/comment");

exports.addComment = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const {videoId, content, parentId} = req.body;
        try {
            const user = req.user;

            // Kiểm tra dữ liệu đầu vào
            if (!videoId || !content) {
                return res.status(400).json({error: 'Video ID and content are required'});
            }

            // Tạo comment mới
            await createComment({
                videoId,
                content,
                parentId,
                user: {
                    email: user.email,
                    username: user.username || 'Anonymous'
                }
            });

            return res.status(201).json({
                message: 'Comment added successfully', comment: {
                    videoId,
                    content,
                    parentId: parentId || null,
                    userEmail: user.email,
                    username: user.username || 'Anonymous',
                    createdAt: new Date().toISOString()
                }
            });
        } catch (err) {
            console.error('Error adding comment:', err.message);
            return res.status(500).json({error: 'Internal Server Error'});
        }
    }
]

exports.getComments = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const {videoId} = req.query;
        try {
            if (!videoId) {
                return res.status(400).json({error: 'Video ID is required'});
            }
            const commentsQuery = query(
                collection(db, 'comments'),
                where('videoId', '==', videoId),
                where('parentId', '==', null) // Lấy các comment gốc (không phải reply)
            );
            const commentsSnapshot = await getDocs(commentsQuery);
            const comments = [];
            for (const commentDoc of commentsSnapshot.docs) {
                const commentData = commentDoc.data();
                // Fetch replies
                const replies = await Promise.all(
                    (commentData.replies || []).map(async (replyId) => {
                        const replyDoc = await getDoc(doc(db, 'comments', replyId));
                        return replyDoc.exists() ? {id: replyDoc.id, ...replyDoc.data()} : null;
                    })
                );
                comments.push({id: commentDoc.id, ...commentData, replies: replies.filter((r) => r !== null)});
            }

            return res.status(200).json({
                message: 'Comments fetched successfully',
                data: comments
            });
        } catch (err) {
            console.error('Error fetching comments:', err.message);
            return res.status(500).json({error: 'Internal Server Error'});
        }
    }
]

exports.deleteComment = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const {commentId} = req.params;
        try {
            const commentRef = doc(db, 'comments', commentId);
            const commentDoc = await getDoc(commentRef);

            if (!commentDoc.exists()) {
                return res.status(404).json({error: 'Comment not found'});
            }

            for (const replyId of commentDoc.data().replies || []) {
                // Xoá tất cả các reply liên quan
                const replyRef = doc(db, 'comments', replyId);
                await deleteDoc(replyRef);
            }
            if (commentDoc.data().parentId) {
                const parentCommentRef = doc(db, 'comments', commentDoc.data().parentId);
                await updateDoc(parentCommentRef, {
                    replies: arrayRemove(commentId)
                })
            }

            await deleteDoc(commentRef);
            return res.status(200).json({message: 'Comment deleted successfully'});
        } catch (err) {
            console.error('Error deleting comment:', err.message);
            return res.status(500).json({error: 'Internal Server Error'});
        }
    }
]