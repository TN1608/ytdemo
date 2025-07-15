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
        <div className="flex flex-col md:flex-row gap-0">
            {/*video title*/}
            <div className="w-full md:w-[calc(100%-350px)] flex flex-col items-center bg-black">
                <div className="relative w-full max-w-3xl" style={{paddingBottom: '56.25%'}}>
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
            <div
                className="w-full md:w-[350px] border-l border-gray-200 bg-white h-auto md:h-[calc(100vh-64px)] overflow-y-auto">
                <h2 className="text-lg font-bold mb-2 px-4 pt-4">
                    {videos.length > 0 && 'resourceId' in videos[0].snippet ? 'Playlist Videos' : 'Search Results'}
                </h2>
                <div className="space-y-2 px-4 pb-4">
                    {videos?.map((item) => {
                        const isPlaylistItem = 'resourceId' in item.snippet;
                        const itemVideoId = isPlaylistItem
                            ? (item as PlaylistItem).snippet.resourceId?.videoId
                            : (item as SearchResult).id.videoId;
                        const itemId = typeof item.id === 'string' ? item.id : item.id?.videoId || JSON.stringify(item);
                        return (
                            <Card
                                key={itemId}
                                className={`flex items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${
                                    itemVideoId === videoId ? 'bg-gray-200' : ''
                                }`}
                                onClick={() => onVideoSelect(itemVideoId || '')}
                            >
                                <CardAction className="flex w-full">
                                    <CardContent className="flex-shrink-0 w-32 h-20 flex items-center justify-center">
                                        <img
                                            src={item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url}
                                            alt={item.snippet.title}
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                    </CardContent>
                                    <CardHeader className="flex-1 pl-4">
                                        <CardTitle className="text-sm line-clamp-2">{item.snippet.title}</CardTitle>
                                        <CardDescription
                                            className="text-xs line-clamp-2">{item.snippet.description}</CardDescription>
                                    </CardHeader>
                                </CardAction>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>);
}