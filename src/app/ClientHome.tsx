'use client';

import { useState } from 'react';
import Header from '../components/fragments/Header';
import VideoPlayer from '../components/VideoPlayer';
import { PlaylistItem, SearchResult } from '@/types';
import api from "@/utils/axios";

interface ClientHomeProps {
    initialVideos: PlaylistItem[];
}

export default function ClientHome({ initialVideos }: ClientHomeProps) {
    const [videos, setVideos] = useState<(SearchResult | PlaylistItem)[]>(initialVideos || []);
    const [currentVideoId, setCurrentVideoId] = useState<string>(
        initialVideos?.[0]?.snippet.resourceId?.videoId || 'imXIrrk1ftQ'
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/youtube', {
                params: { query, maxResults: 10 },
            });
            const data = response.data;
            setVideos(data.items);
            if (data.items.length > 0) {
                setCurrentVideoId(data.items[0].id.videoId);
            }
        } catch (err) {
            setError('Failed to search videos.');
        }
        setIsLoading(false);
    };

    const handleVideoSelect = (videoId: string) => {
        setCurrentVideoId(videoId);
    };

    if (isLoading) return <div className="container mx-auto p-4">Loading...</div>;
    if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Header onSearch={handleSearch} />
            <div className="container mx-auto p-4">
                <VideoPlayer
                    videoId={currentVideoId}
                    videos={videos}
                    onVideoSelect={handleVideoSelect}
                />
            </div>
        </div>
    );
}