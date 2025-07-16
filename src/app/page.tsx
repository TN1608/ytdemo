'use client';

import {useCallback, useEffect, useState} from 'react';
import {getPlaylistItems, getSavedVideos, index, removeVideo, saveVideo} from '@/services';
import type {PlaylistItem, SearchResponse, SearchResult} from '@/types';
import VideoPlayer from '@/components/VideoPlayer';
import {Skeleton} from '@/components/ui/skeleton';
import Header from '@/components/fragments/Header';
import {debounce} from 'lodash';
import {toast} from "sonner"

export default function Home() {
    const [videos, setVideos] = useState<(PlaylistItem | SearchResult)[]>([]);
    const [savedVideos, setSavedVideos] = useState<string[]>([]);

    const [currentVideoId, setCurrentVideoId] = useState<string>('imXIrrk1ftQ');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    const handleVideoSelect = (videoId: string) => {
        setCurrentVideoId(videoId);
    };

    const fetchSavedVideos = async () => {
        try {
            const resp = await getSavedVideos();
            setSavedVideos(resp.videos.map((item: any) => item.videoId));
            // setSavedVideos(resp.videos)
        } catch (err: any) {
            console.error('Error fetching saved videos:', err);
            setError('Failed to fetch saved videos');
        }
    };

    useEffect(() => {
        fetchSavedVideos();

        async function fetchVideos() {
            setLoading(true);
            setError(null);
            try {
                const data = await getPlaylistItems({
                    playlistId: 'RDimXIrrk1ftQ',
                    maxResults: 10,
                });
                setVideos(data.items);
                if (data.items.length > 0 && !currentVideoId) {
                    setCurrentVideoId(data.items[0].snippet.resourceId?.videoId || '');
                }
            } catch (err) {
                setError('Failed to load playlist.');
            } finally {
                setLoading(false);
            }
        }

        fetchVideos();
    }, []);

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
                    />
                </section>
            </main>
        </div>
    );
}