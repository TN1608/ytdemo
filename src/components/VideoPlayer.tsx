'use client';

import type {PlaylistItem, SearchResult} from '@/types';
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useEffect, useState} from "react";

interface VideoPlayerProps {
    videoId: string;
    videos: (PlaylistItem | SearchResult)[];
    onVideoSelect: (videoId: string) => void;
    onSave?: (videoId: string) => void;
    onRemove?: (videoId: string) => void;
    savedVideos?: string[];
}

export default function VideoPlayer({
                                        videoId,
                                        videos,
                                        onVideoSelect,
                                        onSave,
                                        onRemove,
                                        savedVideos,
                                    }: VideoPlayerProps) {
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(false);

    const handleSave = async () => {
        if (onSave) {
            setIsSaving(true);
            try {
                onSave(videoId);
                setIsSaved(true);
            } catch (error) {
                console.error('Error saving video:', error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleRemove = async () => {
        if (onRemove) {
            setIsSaving(true);
            try {
                onRemove(videoId);
                setIsSaved(false);
            } catch (error) {
                console.error('Error removing video:', error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    useEffect(() => {
        setIsSaved(savedVideos ? savedVideos.includes(videoId) : false);
    }, [videoId, savedVideos]);

    return (
        <div className="flex flex-col lg:flex-row gap-4 bg-background min-h-screen text-foreground font-sans">
            <div className="w-full lg:w-[calc(100%-400px)] flex flex-col px-4 lg:px-8 pt-6 bg-background">
                <div className="relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl"
                     style={{paddingBottom: '56.25%'}}>
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
                <div className="w-full max-w-5xl mx-auto mt-6">
                    <h1 className="text-xl lg:text-2xl font-semibold text-foreground mb-3 line-clamp-2">
                        {videos.find((v) => {
                            const isPlaylistItem = 'resourceId' in v.snippet;
                            const vid = isPlaylistItem
                                ? (v as PlaylistItem).snippet.resourceId?.videoId
                                : (v as SearchResult).id.videoId;
                            return vid === videoId;
                        })?.snippet.title}
                    </h1>
                    <div className="flex items-center gap-4 mb-4">
                        {(() => {
                            const thumbnailUrl = videos.find((item) => {
                                const isPlaylistItem = 'resourceId' in item.snippet;
                                const vid = isPlaylistItem
                                    ? (item as PlaylistItem).snippet.resourceId?.videoId
                                    : (item as SearchResult).id.videoId;
                                return vid === videoId;
                            })?.snippet.thumbnails?.default?.url;
                            return thumbnailUrl ? (
                                <img
                                    src={thumbnailUrl}
                                    alt="Channel Thumbnail"
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : null;
                        })()}
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {videos.find((item) => {
                                    const isPlaylistItem = 'resourceId' in item.snippet;
                                    const vid = isPlaylistItem
                                        ? (item as PlaylistItem).snippet.resourceId?.videoId
                                        : (item as SearchResult).id.videoId;
                                    return vid === videoId;
                                })?.snippet.channelTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {(() => {
                                    const video = videos.find((item) => {
                                        const isPlaylistItem = 'resourceId' in item.snippet;
                                        const vid = isPlaylistItem
                                            ? (item as PlaylistItem).snippet.resourceId?.videoId
                                            : (item as SearchResult).id.videoId;
                                        return vid === videoId;
                                    });
                                    if (!video?.snippet.publishedAt) return '';
                                    const date = new Date(video.snippet.publishedAt);
                                    return date.toLocaleString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh'});
                                })()}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={isSaved ? handleRemove : handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : isSaved ? 'Remove from Saved' : 'Save Video'}
                            </Button>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl p-4">
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {videos.find((v) => {
                                const isPlaylistItem = 'resourceId' in v.snippet;
                                const vid = isPlaylistItem
                                    ? (v as PlaylistItem).snippet.resourceId?.videoId
                                    : (v as SearchResult).id.videoId;
                                return vid === videoId;
                            })?.snippet.description}
                        </p>
                        <button className="text-sm text-muted-foreground hover:text-foreground mt-2">Show more</button>
                    </div>
                </div>
            </div>
            {/*Side section*/}
            <div className="w-full lg:w-[400px] bg-background h-auto lg:h-[calc(100vh-80px)] px-4 py-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                    {videos.length > 0 && 'resourceId' in videos[0].snippet ? 'Playlist Videos' : 'Up Next'}
                </h2>
                <div className="space-y-3">
                    {videos?.map((item) => {
                        const isPlaylistItem = 'resourceId' in item.snippet;
                        const itemVideoId = isPlaylistItem
                            ? (item as PlaylistItem).snippet.resourceId?.videoId
                            : (item as SearchResult).id.videoId;
                        const itemId = typeof item.id === 'string' ? item.id : item.id?.videoId || JSON.stringify(item);
                        return (
                            <Card
                                key={itemId}
                                className={`flex bg-card cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg overflow-hidden ${
                                    itemVideoId === videoId ? 'bg-muted ring-2 ring-primary' : ''
                                }`}
                                onClick={() => onVideoSelect(itemVideoId || '')}
                            >
                                <CardAction className="flex w-full">
                                    <CardContent className="flex-shrink-0 w-40 h-24">
                                        <img
                                            src={item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url}
                                            alt={item.snippet.title}
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                    </CardContent>
                                    <CardHeader className="flex-1 pl-4 flex items-center justify-between">
                                        <div>
                                            <CardTitle
                                                className="text-sm text-foreground line-clamp-3">{item.snippet.title}</CardTitle>
                                            <CardDescription
                                                className="text-xs text-muted-foreground line-clamp-2">{item.snippet.description}</CardDescription>
                                        </div>
                                    </CardHeader>
                                </CardAction>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}