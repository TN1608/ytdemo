'use client';

import type {PlaylistItem, PlaylistItemsResponse} from "@/types";
import {useEffect, useState} from "react";
import {getPlaylistItems} from "@/services/search";
import VideoPlayer from "@/components/VideoPlayer";
import {Skeleton} from "@/components/ui/skeleton";
import Header from "@/components/fragments/Header";

export default function Home() {
    const [videos, setVideos] = useState<PlaylistItem[]>([]);
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
                const data: PlaylistItemsResponse = await getPlaylistItems({
                    playlistId: 'RDimXIrrk1ftQ',
                    maxResults: 10
                }); // Playlist ID từ URL
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

        fetchVideos()
    }, []);
    return (
        <>
            {/* Header */}
            <Header onSearch={(query: string) => {
            }}/>
            <main className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
                <section className="flex-1">
                    {/* Loading, skeleton, yt title */}
                    {loading && (
                        <Skeleton className="h-8 w-1/3 mb-4"/>
                    )}
                    <h1 className="text-2xl font-bold mb-4">
                        {error ? error : 'YouTube Playlist'}
                    </h1>
                    <VideoPlayer
                        videoId={currentVideoId}
                        videos={videos}
                        onVideoSelect={handleVideoSelect}
                    />
                </section>
                {/* You can add a sidebar or playlist list here if needed */}
            </main>
            {/* Footer */}
            <footer className="bg-gray-100 text-center p-4 mt-8">
                <p className="text-gray-600">© 2023 Your YouTube Playlist App</p>
            </footer>
        </>
    );
}
