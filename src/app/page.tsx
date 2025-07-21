'use client';

import {useEffect, useMemo, useState} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {search, getSavedVideos, getLikedVideos, saveVideo, removeVideo, likeVideo} from '@/services/video';
import type {SearchResult, LikedVideo} from '@/types';
import {Skeleton} from '@/components/ui/skeleton';
import {toast} from 'sonner';
import Link from 'next/link';
import {debounce} from 'lodash';
import {useAuth} from "@/context/AuthenticateProvider";
import {Button} from "@/components/ui/button";
import {useSearch} from "@/context/SearchProvider";
import VideoLists from "@/components/VideoLists";

export default function Home() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const {isAuthenticated} = useAuth();
    const {setSearchHandler} = useSearch();
    const [videos, setVideos] = useState<SearchResult[]>([]);
    const [savedVideos, setSavedVideos] = useState<string[]>([]);
    const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVideos = async (query: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const data = await search(query, 20);
            setVideos(data.items);
        } catch (err: any) {
            setError('Failed to load videos: ' + (err.response?.data?.error || err.message));
            toast.error(err.response?.data?.error || 'Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedVideos = async () => {
        if (!isAuthenticated) return;
        try {
            const resp = await getSavedVideos();
            setSavedVideos(resp.videos.map((item: any) => item.videoId));
        } catch (err: any) {
            console.error('Error fetching saved videos:', err);
            setError('Failed to fetch saved videos');
            toast.error(err.message || 'Failed to fetch saved videos');
        }
    };

    const fetchLikedVideos = async () => {
        if (!isAuthenticated) return;
        try {
            const resp = await getLikedVideos();
            setLikedVideos(resp.videos);
        } catch (err: any) {
            console.error('Error fetching liked videos:', err);
            setError('Failed to fetch liked videos');
            toast.error(err.message || 'Failed to fetch liked videos');
        }
    };

    useEffect(() => {
        const query = searchParams.get('q');
        fetchVideos(query || 'US UK Music');
        if (isAuthenticated) {
            fetchSavedVideos();
            fetchLikedVideos();
        }
    }, [searchParams, isAuthenticated]);

    const debouncedSearch = useMemo(
        () => debounce(async (query: string) => {
            try {
                await fetchVideos(query);
                router.push(`/search?q=${encodeURIComponent(query)}`);
            } catch (err: any) {
                toast.error(err.response?.data?.error || 'Failed to search videos');
            }
        }, 500),
        [router] // add dependencies as needed
    );

    useEffect(() => {
        setSearchHandler(debouncedSearch);
        return () => {
            setSearchHandler(() => {
            });
        };
    }, [setSearchHandler, debouncedSearch]);

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
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{searchParams.get('q') ? 'Kết quả tìm kiếm' : 'Videos Phổ biến'}</h1>
            {loading && <Skeleton className="h-8 w-full mb-4"/>}
            {error && <p className="text-red-500">{error}</p>}
            {!isAuthenticated && (
                <p className="text-sm text-muted-foreground mb-4">
                    <Link href="/signin" className="text-blue-500 hover:underline">
                        Đăng nhập
                    </Link>{' '}
                    để lưu hoặc thích video
                </p>
            )}
            <VideoLists
                videos={videos}
                savedVideos={savedVideos}
                likedVideos={likedVideos}
                loading={loading}
                handleSave={handleSave}
                handleRemove={handleRemove}
            />
        </div>
    );
}