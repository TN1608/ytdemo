var express = require('express');
var router = express.Router();
const axios = require('axios');
const {doc, getDoc, setDoc, getDocs, collection, deleteDoc} = require('firebase/firestore');
const {db} = require('../config/firebase');
const passport = require('passport');

const url = 'https://www.googleapis.com/youtube/v3';

exports.getPlaylist = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const {playlistId, maxResults = 10} = req.query;
        const userId = req.user.id; // Lấy từ JWT
        if (!playlistId) {
            return res.status(400).json({error: 'Playlist ID is required'});
        }

        try {
            // Kiểm tra playlist đã lưu chưa
            const playlistRef = doc(db, 'playlists', `${userId}_${playlistId}`);
            const playlistDoc = await getDoc(playlistRef);
            if (playlistDoc.exists()) {
                return res.status(200).json({
                    message: 'Playlist fetched from Firestore',
                    playlist: {id: playlistId, ...playlistDoc.data()},
                });
            }

            // Lấy từ YouTube API
            const response = await axios.get(`${url}/playlistItems`, {
                params: {
                    part: 'snippet',
                    playlistId: playlistId,
                    maxResults: maxResults,
                    key: process.env.YOUTUBE_API_KEY,
                },
            });

            res.status(200).json({
                message: 'Playlist fetched from YouTube',
                playlist: response.data,
            });
        } catch (err) {
            console.error('Error fetching playlist:', err.message);
            res.status(500).json({
                error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
            });
        }
    },
];

exports.savePlaylist = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const {playlistId} = req.body;
            const userId = req.user.id; // Lấy từ JWT
            if (!playlistId) {
                return res.status(400).json({error: 'Playlist ID is required'});
            }

            // Kiểm tra playlist đã lưu chưa
            const playlistRef = doc(db, 'playlists', `${userId}_${playlistId}`);
            const playlistDoc = await getDoc(playlistRef);
            if (playlistDoc.exists()) {
                return res.status(202).json({message: 'Playlist already saved'});
            }

            // Lấy thông tin playlist từ YouTube
            const response = await axios.get(`${url}/playlists`, {
                params: {
                    part: 'snippet',
                    id: playlistId,
                    key: process.env.YOUTUBE_API_KEY,
                },
            });

            if (!response.data.items || response.data.items.length === 0) {
                return res.status(404).json({error: 'Playlist not found'});
            }

            const playlistData = response.data.items[0].snippet;
            const playlistToSave = {
                userId,
                playlistId,
                title: playlistData.title,
                description: playlistData.description,
                thumbnail: playlistData.thumbnails?.high?.url || '',
                savedAt: new Date().toISOString(),
            };

            await setDoc(playlistRef, playlistToSave);
            return res.status(200).json({
                success: true,
                message: 'Playlist saved successfully',
                playlist: playlistToSave,
            });
        } catch (err) {
            console.error('Error saving playlist:', err.message);
            res.status(err.message === 'Playlist not found' ? 404 : 500).json({
                error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
            });
        }
    },
];

exports.getSavedPlaylists = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const userId = req.user.id; // Lấy từ JWT
            const playlistsSnapshot = await getDocs(collection(db, 'playlists'));
            const playlists = playlistsSnapshot.docs
                .filter((doc) => doc.data().userId === userId)
                .map((doc) => ({id: doc.data().playlistId, ...doc.data()}));

            if (playlists.length === 0) {
                return res.status(200).json({message: 'No saved playlists found', playlists: []});
            }

            res.status(200).json({
                message: 'Saved playlists fetched successfully',
                playlists,
            });
        } catch (err) {
            console.error('Error fetching saved playlists:', err.message);
            res.status(500).json({
                error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
            });
        }
    },
];