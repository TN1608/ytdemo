'use client';

import {useCallback, useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {getLikedVideos, getPlaylistItems, getSavedVideos, index, likeVideo, removeVideo, saveVideo} from '@/services';
import type {LikedVideo, LikedVideosResponse, PlaylistItem, SearchResponse, SearchResult} from '@/types';
import VideoPlayer from '@/components/VideoPlayer';
import {Skeleton} from '@/components/ui/skeleton';
import Header from '@/components/fragments/Header';
import {debounce} from 'lodash';
import {toast} from "sonner"
import MiniPlayer from "@/components/MiniPlayer";

export default function Home() {
    const searchParams = useSearchParams();
    const [videos, setVideos] = useState<(PlaylistItem | SearchResult)[]>([]);
    const [savedVideos, setSavedVideos] = useState<string[]>([]);
    const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
    const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState<boolean>(false);

    const [currentVideoId, setCurrentVideoId] = useState<string>('imXIrrk1ftQ');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    const handleVideoSelect = (videoId: string) => {
        setCurrentVideoId(videoId);
    };

    const fetchSavedVideos = async () => {
        try {
            const resp = await getSavedVideos();
            setSavedVideos(resp.videos.map((item: any) => item.id));
            // setSavedVideos(resp.videos)
        } catch (err: any) {
            console.error('Error fetching saved videos:', err);
            setError('Failed to fetch saved videos');
        }
    };

    const fetchLikedVideos = async () => {
        try {
            const resp = await getLikedVideos();
            setLikedVideos(resp.videos);
        } catch (err: any) {
            console.error('Error fetching liked videos:', err);
            setError('Failed to fetch liked videos');
        }
    }

    useEffect(() => {
        fetchSavedVideos();
        fetchLikedVideos();

        async function fetchVideos() {
            setLoading(true);
            setError(null);
            try {
                // Check if there's a search query in the URL
                const searchQuery = searchParams.get('q');

                if (searchQuery) {
                    // If there's a search query, perform a search
                    const data: SearchResponse = await index(searchQuery, 10);
                    setVideos(data.items);
                    if (data.items.length > 0) {
                        setCurrentVideoId(data.items[0].id.videoId);
                    }
                    console.log('Search results from URL query:', data.items);
                } else {
                    // Otherwise, load the default playlist
                    const data = await getPlaylistItems({
                        playlistId: 'RDimXIrrk1ftQ',
                        maxResults: 10,
                    });
                    setVideos(data.items);
                    if (data.items.length > 0 && !currentVideoId) {
                        setCurrentVideoId(data.items[0].snippet.resourceId?.videoId || '');
                    }
                }
            } catch (err) {
                setError('Failed to load videos.');
            } finally {
                setLoading(false);
            }
        }

        fetchVideos();
    }, [searchParams]);

    const handleSearch = debounce(async (query: string) => {
        setLoading(true);
        setError(null);
        try {
            const data: SearchResponse = await index(query, 10);
            setVideos(data.items);
            if (data.items.length > 0) {
                setCurrentVideoId(data.items[0].id.videoId);
            }
            console.log('Search results:', data.items);
        } catch (err: any) {
            setError('Failed to index videos: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    }, 500);

    const handleSave = async (videoId: string) => {
        try {
            const response = await saveVideo(videoId);
            toast.success(response.message || 'Video saved successfully');
            await fetchSavedVideos();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to save video');
        }
    };

    const handleRemove = async (videoId: string) => {
        try {
            const response = await removeVideo(videoId);
            toast.success(response.message || 'Video removed successfully');
            await fetchSavedVideos()
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to remove video');
        }
    };

    const handleLike = async (videoId: string) => {
        try {
            const isAlreadyLiked = likedVideos.some(video => video.id === videoId && video.status);
            const status = !isAlreadyLiked;
            if (!isAlreadyLiked) {
                const response = await likeVideo(videoId, true);
            }
            await fetchLikedVideos();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to like video');
        }
    }

    const handleDislike = async (videoId: string) => {
        try {
            const isAlreadyDisliked = likedVideos.some(video => video.id === videoId && video.status === false);
            if (!isAlreadyDisliked) {
                const response = await likeVideo(videoId, false);
                await fetchLikedVideos();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to dislike video');
        }
    }

    const toggleMiniPlayer = () => {
        setIsMiniPlayerOpen(prev => !prev);
    };

    return (
        <div>
            <Header onSearch={handleSearch}/>
            <main className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
                <section className="flex-1">
                    {loading && <Skeleton className="h-8 w-1/3 mb-4"/>}
                    <VideoPlayer
                        key={currentVideoId}
                        videoId={currentVideoId}
                        videos={videos}
                        onVideoSelect={handleVideoSelect}
                        onSave={handleSave}
                        onRemove={handleRemove}
                        savedVideos={savedVideos}
                        likedVideos={likedVideos}
                        onLike={handleLike}
                        onDislike={handleDislike}
                    />
                    {isMiniPlayerOpen && (
                        <MiniPlayer
                            videoId={currentVideoId}
                            onClose={() => setIsMiniPlayerOpen(false)}
                            onMaximize={toggleMiniPlayer}
                        />
                    )}
                </section>
            </main>
        </div>
    );
}
