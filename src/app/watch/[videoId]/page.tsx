'use client';

import {useCallback, useEffect, useState} from 'react';
import {useParams, useSearchParams} from 'next/navigation';
import {getLikedVideos, getPlaylistItems, getSavedVideos, saveVideo, removeVideo, likeVideo, search} from '@/services/video';
import type {LikedVideo, PlaylistItem, SearchResponse, SearchResult} from '@/types';
import VideoPlayer from '@/components/VideoPlayer';
import {Skeleton} from '@/components/ui/skeleton';
import {toast} from 'sonner';
import Link from 'next/link';
import {debounce} from 'lodash';
import {useAuth} from '@/context/AuthenticateProvider';
import {useSearch} from '@/context/SearchProvider';
import MiniPlayer from '@/components/MiniPlayer';

export default function VideoDetail() {
    const params = useParams();
    const searchParams = useSearchParams();
    const {isAuthenticated} = useAuth();
    const {setSearchHandler} = useSearch();
    const [videos, setVideos] = useState<SearchResult[]>([]);
    const [savedVideos, setSavedVideos] = useState<string[]>([]);
    const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
    const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState<boolean>(false);
    const [currentVideoId, setCurrentVideoId] = useState<string>(params.videoId as string);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState<string>(searchParams.get('q') || '');
    const videoId = params.videoId as string;

    const fetchVideos = useCallback(async (query: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const data: SearchResponse = await search(query, 10);
            setVideos(data.items);
        } catch (err: any) {
            setError('Failed to load videos: ' + (err.response?.data?.error || err.message));
            toast.error(err.response?.data?.error || 'Failed to load videos');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSavedVideos = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const resp = await getSavedVideos();
            setSavedVideos(resp.videos.map((item: any) => item.videoId));
        } catch (err: any) {
            console.error('Error fetching saved videos:', err);
            setError('Failed to fetch saved videos');
            toast.error(err.message || 'Failed to fetch saved videos');
        }
    }, [isAuthenticated]);

    const fetchLikedVideos = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const resp = await getLikedVideos();
            setLikedVideos(resp.videos);
        } catch (err: any) {
            console.error('Error fetching liked videos:', err);
            setError('Failed to fetch liked videos');
            toast.error(err.message || 'Failed to fetch liked videos');
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const newQuery = searchParams.get('q') || 'nerissa';
        if (newQuery !== query) {
            setQuery(newQuery);
            fetchVideos(newQuery);
        }
        if (isAuthenticated) {
            fetchSavedVideos();
            fetchLikedVideos();
        }
    }, [searchParams, isAuthenticated, query, fetchVideos, fetchSavedVideos, fetchLikedVideos]);

    const handleSearch = useCallback(
        debounce(async (query: string) => {
            setLoading(true);
            setError(null);
            try {
                const data: SearchResponse = await search(query, 10);
                setVideos(data.items);
                if (data.items.length > 0) {
                    setCurrentVideoId(data.items[0].id.videoId);
                }
            } catch (err: any) {
                toast.error(err.response?.data?.error || 'Failed to search videos');
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        setSearchHandler(handleSearch);
        return () => {
            setSearchHandler(() => {
            });
        };
    }, [setSearchHandler, handleSearch]);

    const handleSave = async (videoId: string) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để lưu video');
            localStorage.setItem('redirectUrl', window.location.href);
            window.location.href = '/signin';
            return;
        }
        try {
            const response = await saveVideo(videoId);
            toast.success(response.message || 'Video saved successfully');
            await fetchSavedVideos();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to save video');
        }
    };

    const handleRemove = async (videoId: string) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để bỏ lưu video');
            localStorage.setItem('redirectUrl', window.location.href);
            window.location.href = '/signin';
            return;
        }
        try {
            const response = await removeVideo(videoId);
            toast.success(response.message || 'Video removed successfully');
            await fetchSavedVideos();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to remove video');
        }
    };

    const handleLike = async (videoId: string) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thích video');
            localStorage.setItem('redirectUrl', window.location.href);
            window.location.href = '/signin';
            return;
        }
        try {
            // Gửi request like với status: true
            await likeVideo(videoId, true);
            // Hiển thị thông báo dựa trên trạng thái trước đó
            const isAlreadyLiked = likedVideos.some((video) => video.id === videoId && video.status);
            toast.success(isAlreadyLiked ? 'Like removed successfully' : 'Video liked successfully');
            // Cập nhật danh sách liked videos
            await fetchLikedVideos();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to like video');
        }
    };

    const handleDislike = async (videoId: string) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để không thích video');
            localStorage.setItem('redirectUrl', window.location.href);
            window.location.href = '/signin';
            return;
        }
        try {
            // Gửi request dislike với status: false
            await likeVideo(videoId, false);
            // Hiển thị thông báo dựa trên trạng thái trước đó
            const isAlreadyDisliked = likedVideos.some((video) => video.id === videoId && !video.status);
            toast.success(isAlreadyDisliked ? 'Dislike removed successfully' : 'Video disliked successfully');
            // Cập nhật danh sách liked videos
            await fetchLikedVideos();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to dislike video');
        }
    };

    const handleVideoSelect = (selectedVideoId: string) => {
        setCurrentVideoId(selectedVideoId);
    };

    const toggleMiniPlayer = () => {
        setIsMiniPlayerOpen((prev) => !prev);
    };

    return (
        <div>
            <main className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
                <section className="flex-1">
                    {loading && <Skeleton className="h-8 w-1/3 mb-4"/>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isAuthenticated && (
                        <p className="text-sm text-muted-foreground mb-4">
                            <Link href="/signin" className="text-blue-500 hover:underline">
                                Đăng nhập
                            </Link>{' '}
                            để lưu hoặc thích video
                        </p>
                    )}
                    <VideoPlayer
                        key={currentVideoId}
                        videoId={currentVideoId}
                        videos={videos}
                        onVideoSelect={handleVideoSelect}
                        onSave={handleSave}
                        onRemove={handleRemove}
                        onLike={handleLike}
                        onDislike={handleDislike}
                        savedVideos={savedVideos}
                        likedVideos={likedVideos}
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