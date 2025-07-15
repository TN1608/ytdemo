// app/page.tsx
'use client';

import {useEffect, useState} from 'react';
import {getPlaylistItems, search} from '@/services/search';
import type {PlaylistItem, SearchResponse, SearchResult} from '@/types';
import VideoPlayer from '@/components/VideoPlayer';
import {Skeleton} from '@/components/ui/skeleton';
import Header from '@/components/fragments/Header';
import {debounce} from 'lodash';
import {Separator} from "@/components/ui/separator";
import Silk from "@/components/Silk";
import Waves from "@/components/Wakes";

export default function Home() {
    const [videos, setVideos] = useState<(PlaylistItem | SearchResult)[]>([]);
    const [currentVideoId, setCurrentVideoId] = useState<string>('imXIrrk1ftQ');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleVideoSelect = (videoId: string) => {
        setCurrentVideoId(videoId);
    };

    useEffect(() => {
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
            const data: SearchResponse = await search(query, 10);
            setVideos(data.items);
            if (data.items.length > 0) {
                setCurrentVideoId(data.items[0].id.videoId);
            }
        } catch (err: any) {
            setError('Failed to search videos: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    }, 500);

    return (
        <div>
            <Header onSearch={handleSearch}/>
            <main className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
                <section className="flex-1">
                    {loading && <Skeleton className="h-8 w-1/3 mb-4"/>}
                    <h1 className="text-2xl font-bold mb-4">
                        {error ? error : videos.length > 0 && 'resourceId' in videos[0].snippet ? 'YouTube Playlist' : 'Search Results'}
                    </h1>
                    <Separator/>
                    <h1 className="text-3xl uppercase font-bold mt-4 mb-2">
                        {videos.length > 0
                            ? videos[0]?.snippet.title
                            : 'Select a video to play'}
                    </h1>
                    <VideoPlayer videoId={currentVideoId} videos={videos} onVideoSelect={handleVideoSelect}/>
                </section>
            </main>
        </div>
    );
}