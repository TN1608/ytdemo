'use client';
import type {PlaylistItem, SearchResult} from "@/types";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface VideoPlayerProps {
    videoId: string;
    videos: (PlaylistItem | SearchResult)[];
    onVideoSelect: (videoId: string) => void;
}

export default function VideoPlayer({videoId, videos, onVideoSelect}: VideoPlayerProps) {

    return (
        <div className="flex flex-col md:flex-row gap-4">
            {/* Video Player */}
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

            {/* Video List */}
            <div className="w-full md:w-80">
                <h2 className="text-lg font-bold mb-2">Videos</h2>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {videos?.map((item) => {
                        const isPlaylistItem = 'resourceId' in item.snippet;
                        const videoId = isPlaylistItem
                            ? (item as PlaylistItem).snippet.resourceId?.videoId
                            : (item as SearchResult).id.videoId;
                        return (
                            <Card
                                key={typeof item.id === 'string' ? item.id : (item.id as any).videoId ?? JSON.stringify(item.id)}
                                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => onVideoSelect(videoId || '')}>
                                <CardAction>
                                    <CardHeader>
                                        <CardTitle>{item.snippet.title}</CardTitle>
                                        <CardDescription>{item.snippet.description}</CardDescription>
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