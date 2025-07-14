'use client';

import type {PlaylistItem, PlaylistItemsResponse} from "@/types";
import {useEffect, useState} from "react";
import {getPlaylistItems} from "@/services/search";
import VideoPlayer from "@/components/VideoPlayer";
import {Skeleton} from "@/components/ui/skeleton";

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
        <div className="container mx-auto p-4">
            {/*Loading , skeleton, yt title*/}
            {loading && <Skeleton
                className="h-8 w-1/3 mb-4"
            />
            }
            <h1 className={"text-2xl font-bold mb-4"}>
                {error ? error : 'YouTube Playlist'}
            </h1>
            <VideoPlayer
                videoId={currentVideoId}
                playlistItems={videos}
                onVideoSelect={handleVideoSelect}
            />
        </div>
    );
}
