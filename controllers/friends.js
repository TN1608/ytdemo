const express = require('express');
const {db, firebase} = require('../config/firebase');
const {collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where} = require('firebase/firestore');
const {getUserByEmail} = require('../models/user');
const passport = require('passport');
const {arrayUnion, arrayRemove} = require('firebase/firestore');
const ERROR = require('../constants/ErrorCodes');
const friendRequestStatus = require('../constants/enum/friendRequests');

exports.sendFriendRequest = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const {email} = req.body;
        try {
            const fromUser = req.user;

            // Kiểm tra người nhận có tồn tại không
            const toUser = await getUserByEmail(email);
            if (!toUser) {
                return res.status(404).json({error: ERROR.USER_NOT_FOUND});
            }

            // Kiểm tra xem yêu cầu kết bạn đã tồn tại chưa
            const friendRequestsQuery = query(
                collection(db, 'friend_requests'),
                where('fromUser', '==', fromUser.email),
                where('toUser', '==', toUser.email)
            );
            const existingRequests = await getDocs(friendRequestsQuery);
            if (!existingRequests.empty) {
                return res.status(409).json({error: ERROR.FRIEND_REQUEST_SENT});
            }

            // Tạo ID duy nhất cho yêu cầu kết bạn
            const friendRequestId = `${fromUser.email}_request`;
            const friendRequestRef = doc(db, 'friend_requests', friendRequestId);
            await setDoc(friendRequestRef, {
                fromUser: fromUser.email,
                toUser: toUser.email,
                status: friendRequestStatus.PENDING.toString(),
                createdAt: new Date(),
            });

            // Thêm vào friendRequests của người nhận
            await updateDoc(doc(db, 'users', toUser.email), {
                friendRequests: arrayUnion(fromUser.email),
            });

            res.json({message: 'Friend request sent successfully', requestId: friendRequestId});
        } catch (err) {
            console.error('Error sending friend request:', err.message);
            return res.status(500).json({error: ERROR.INTERNAL_SERVER_ERROR});
        }
    }
]

exports.acceptFriendRequest = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const {requestId} = req.params;
        try {
            const user = req.user;

            const friendRequestRef = doc(db, 'friend_requests', requestId);
            const friendRequestDoc = await getDoc(friendRequestRef);
            if (!friendRequestDoc.exists()) {
                return res.status(404).json({error: ERROR.FRIEND_REQUEST_NOT_FOUND});
            }

            const friendRequestData = friendRequestDoc.data();
            if (friendRequestData.toUser !== user.email) {
                return res.status(403).json({error: ERROR.UNAUTHORIZED});
            }

            // Cập nhật trạng thái yêu cầu kết bạn
            await updateDoc(friendRequestRef, {
                status: friendRequestStatus.ACCEPTED.toString(),
            });

            // Thêm người dùng vào danh sách bạn bè
            await updateDoc(doc(db, 'users', user.email), {
                friends: arrayUnion(friendRequestData.fromUser),
                friendRequests: arrayRemove(friendRequestData.fromUser),
            });

            // Cập nhật người gửi yêu cầu kết bạn
            await updateDoc(doc(db, 'users', friendRequestData.fromUser), {
                friends: arrayUnion(user.email),
                friendRequests: arrayRemove(user.email),
            });

            res.json({message: 'Friend request accepted successfully'});
        } catch (err) {
            console.error('Error accepting friend request:', err.message);
            return res.status(500).json({error: ERROR.INTERNAL_SERVER_ERROR});
        }
    }
]
exports.rejectFriendRequest = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const {requestId} = req.params;
        try {
            const user = req.user;

            const friendRequestRef = doc(db, 'friend_requests', requestId);
            const friendRequestDoc = await getDoc(friendRequestRef);
            if (!friendRequestDoc.exists()) {
                return res.status(404).json({error: ERROR.FRIEND_REQUEST_NOT_FOUND});
            }

            const friendRequestData = friendRequestDoc.data();
            if (friendRequestData.toUser !== user.email) {
                return res.status(403).json({error: ERROR.UNAUTHORIZED});
            }

            // Cập nhật trạng thái yêu cầu kết bạn
            await updateDoc(friendRequestRef, {
                status: friendRequestStatus.REJECTED.toString(),
            });

            // Xóa người gửi khỏi danh sách yêu cầu kết bạn
            await updateDoc(doc(db, 'users', user.email), {
                friendRequests: arrayRemove(friendRequestData.fromUser),
            });

            // Cập nhật người gửi yêu cầu kết bạn
            await updateDoc(doc(db, 'users', friendRequestData.fromUser), {
                friendRequests: arrayRemove(user.email),
            });

            res.json({message: 'Friend request rejected successfully'});
        } catch (err) {
            console.error('Error rejecting friend request:', err.message);
            return res.status(500).json({error: ERROR.INTERNAL_SERVER_ERROR});
        }
    }
]

exports.getFriendRequests = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const user = req.user;

            // Lấy danh sách yêu cầu kết bạn của người dùng
            const friendRequestsQuery = query(
                collection(db, 'friend_requests'),
                where('toUser', '==', user.email),
                where('status', '==', friendRequestStatus.PENDING.toString())
            );
            const friendRequestsSnapshot = await getDocs(friendRequestsQuery);

            const friendRequests = [];
            friendRequestsSnapshot.forEach((doc) => {
                friendRequests.push({id: doc.id, ...doc.data()});
            });

            res.json({message: 'Get friend requests successfully', data: friendRequests});
        } catch (err) {
            console.error('Error getting friend requests:', err.message);
            return res.status(500).json({error: ERROR.INTERNAL_SERVER_ERROR});
        }
    }
]

exports.getFriends = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const user = req.user;

            console.log(req.user)
            // Lấy danh sách bạn bè của người dùng
            const userDocRef = doc(db, 'users', user.email);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                return res.status(404).json({error: ERROR.FRIEND_NOT_FOUND});
            }

            const friends = userDoc.data().friends || [];
            // Lấy thông tin chi tiết của bạn bè
            const friendDetails = await Promise.all(
                friends.map(async (friendEmail) => {
                    const friend = await getUserByEmail(friendEmail);
                    return friend ? {email: friend.email, username: friend.username || 'Anonymous'} : null;
                })
            );

            // Lọc bỏ các giá trị null
            res.json({message: 'Get friends successfully', data: friendDetails.filter((friend) => friend !== null)});
        } catch (err) {
            console.error('Error getting friends:', err.message);
            return res.status(500).json({error: ERROR.INTERNAL_SERVER_ERROR});
        }
    }
]

exports.findFriend = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const {email} = req.params;
        try {
            if (!email) {
                return res.status(400).json({error: ERROR.EMAIL_IS_REQUIRED});
            }

            const user = await getUserByEmail(email);
            if (!user) {
                return res.status(404).json({error: ERROR.USER_NOT_FOUND});
            }

            res.json({
                message: 'Friend found successfully',
                data: {email: user.email, username: user.username || 'Anonymous'}
            });
        } catch (err) {
            console.error('Error finding friend:', err.message);
            return res.status(500).json({error: ERROR.INTERNAL_SERVER_ERROR});
        }
    }
]

exports.getFriendRequestsSent = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const user = req.user;

            // Lấy danh sách yêu cầu kết bạn đã gửi
            const friendRequestsQuery = query(
                collection(db, 'friend_requests'),
                where('fromUser', '==', user.email),
                where('status', '==', friendRequestStatus.PENDING.toString())
            );
            const friendRequestsSnapshot = await getDocs(friendRequestsQuery);

            const sentRequests = [];
            friendRequestsSnapshot.forEach((doc) => {
                sentRequests.push({id: doc.id, ...doc.data()});
            });

            res.json({message: 'Get sent friend requests successfully', data: sentRequests});
        } catch (err) {
            console.error('Error getting sent friend requests:', err.message);
            return res.status(500).json({error: ERROR.INTERNAL_SERVER_ERROR});
        }
    }
]