'use client';

import type {PlaylistItem, SearchResult} from '@/types';
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

interface VideoPlayerProps {
    videoId: string;
    videos: (PlaylistItem | SearchResult)[];
    onVideoSelect: (videoId: string) => void;
}

export default function VideoPlayer({videoId, videos, onVideoSelect}: VideoPlayerProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <div className="relative w-full" style={{paddingBottom: '56.25%' /* 16:9 aspect ratio */}}>
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
            <div className="w-full md:w-80">
                <h2 className="text-lg font-bold mb-2">Videos</h2>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {videos?.map((item) => {
                        const isPlaylistItem = 'resourceId' in item.snippet;
                        const itemVideoId = isPlaylistItem
                            ? (item as PlaylistItem).snippet.resourceId?.videoId
                            : (item as SearchResult).id.videoId;
                        const itemId = typeof item.id === 'string' ? item.id : item.id.videoId;
                        return (
                            <Card
                                key={itemId}
                                className={`cursor-pointer hover:shadow-lg transition-shadow duration-200 ${
                                    itemVideoId === videoId ? 'bg-gray-100' : ''
                                }`}
                                onClick={() => onVideoSelect(itemVideoId || '')}
                            >
                                <CardAction>
                                    <CardHeader>
                                        <CardTitle className="text-sm">{item.snippet.title}</CardTitle>
                                        <CardDescription
                                            className="text-xs">{item.snippet.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <img
                                            src={item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url}
                                            alt={item.snippet.title}
                                            className="w-full h-auto rounded-md"
                                        />
                                    </CardContent>
                                </CardAction>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}