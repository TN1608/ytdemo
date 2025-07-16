'use client';

import type {LikedVideo, PlaylistItem, SearchResult} from '@/types';
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useEffect, useState} from "react";
import {BsThreeDotsVertical} from "react-icons/bs";
import {AiOutlineDislike, AiOutlineLike} from "react-icons/ai";
import {Badge} from "@/components/ui/badge";
import {Switch} from "@/components/ui/switch";

interface VideoPlayerProps {
    videoId: string;
    videos: (PlaylistItem | SearchResult)[];
    onVideoSelect: (videoId: string) => void;
    onSave?: (videoId: string) => void;
    onRemove?: (videoId: string) => void;
    onLike?: (videoId: string) => void;
    onDislike?: (videoId: string) => void;
    savedVideos?: string[];
    likedVideos?: LikedVideo[];
    dislikedVideos?: string[];
    onToggleMiniPlayer?: () => void;
}

export default function VideoPlayer({
                                        videoId,
                                        videos,
                                        onVideoSelect,
                                        onSave,
                                        onRemove,
                                        onLike,
                                        onDislike,
                                        savedVideos,
                                        likedVideos,
                                        dislikedVideos,
                                        onToggleMiniPlayer,
                                    }: VideoPlayerProps) {
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [isLiking, setIsLiking] = useState<boolean>(false);
    const [isDisliking, setIsDisliking] = useState<boolean>(false);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [isDisliked, setIsDisliked] = useState<boolean>(false);

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

    const handleLike = async () => {
        if (onLike) {
            setIsLiking(true);
            try {
                onLike(videoId);
                if (isLiked) {
                    setIsLiked(false);
                } else {
                    setIsLiked(true);
                    if (isDisliked) {
                        setIsDisliked(false);
                    }
                }
            } catch (error) {
                console.error('Error liking video:', error);
            } finally {
                setIsLiking(false);
            }
        }
    };

    const handleDislike = async () => {
        if (onDislike) {
            setIsDisliking(true);
            try {
                onDislike(videoId);
                if (isDisliked) {
                    setIsDisliked(false);
                } else {
                    setIsDisliked(true);
                    if (isLiked) {
                        setIsLiked(false);
                    }
                }
            } catch (error) {
                console.error('Error disliking video:', error);
            } finally {
                setIsDisliking(false);
            }
        }
    };

    useEffect(() => {
        setIsSaved(savedVideos ? savedVideos.includes(videoId) : false);
        setIsLiked(likedVideos ? likedVideos.some(video => video.videoId === videoId && video.status === true) : false);
        setIsDisliked(likedVideos ? likedVideos.some(video => video.videoId === videoId && video.status === false) : false);
    }, [videoId, savedVideos, likedVideos, dislikedVideos]);

    return (
        <div className="flex flex-col lg:flex-row gap-4 bg-background min-h-screen text-foreground font-sans">
            {/* Main content section */}
            <div className="w-full lg:w-[calc(100%-400px)] flex flex-col px-4 lg:px-8 pt-6 bg-background">
                {/* Video player */}
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

                {/* Video info section */}
                <div className="w-full max-w-5xl mx-auto mt-4">
                    {/* Video title */}
                    <h1 className="text-xl lg:text-2xl font-semibold text-foreground mb-2 line-clamp-2">
                        {videos.find((v) => {
                            const isPlaylistItem = 'resourceId' in v.snippet;
                            const vid = isPlaylistItem
                                ? (v as PlaylistItem).snippet.resourceId?.videoId
                                : (v as SearchResult).id.videoId;
                            return vid === videoId;
                        })?.snippet.title}
                    </h1>

                    {/* Video stats */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
                        <span>
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
                        </span>
                        <span className="mx-1">•</span>
                        <span>123K views</span>
                    </div>

                    {/* Action buttons */}
                    <div
                        className="flex flex-wrap items-center justify-between gap-2 mb-4 border-t border-b border-border py-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-card rounded-full overflow-hidden">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-none border-r border-muted cursor-pointer ${isLiked ? 'bg-blue-100 text-blue-700' : 'text-foreground'} hover:bg-muted`}
                                    onClick={handleLike}
                                    disabled={isLiking}
                                >
                                    {isLiking ? '...' : <AiOutlineLike
                                        className={isLiked ? 'fill-blue-700' : ''}/>} {isLiked ? 'Đã thích' : 'Thích'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-none border-r border-muted cursor-pointer ${isDisliking ? 'fill-blue-700 text-blue-700' : 'text-foreground'} hover:bg-muted`}
                                    onClick={handleDislike}
                                    disabled={isDisliking}
                                >
                                    {isDisliking ? '...' : <AiOutlineDislike
                                        className={isDisliked ? 'fill-blue-700' : ''}/>}
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-foreground hover:bg-card"
                                onClick={isSaved ? handleRemove : handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? '...' : isSaved ? '✓ Saved' : '🔖 Save'}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-foreground hover:bg-card"
                            >
                                🔗 Share
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-foreground hover:bg-card"
                            >
                                ⬇️ Download
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-foreground hover:bg-card"
                            >
                                ✂️ Clip
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-foreground hover:bg-card"
                            onClick={onToggleMiniPlayer}
                        >
                            🔽 Mini Player
                        </Button>
                    </div>

                    {/* Channel info */}
                    <div className="flex items-start gap-3 mb-4 p-3 bg-card rounded-xl">
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
                                    className="w-12 h-12 rounded-full"
                                />
                            ) : null;
                        })()}
                        <div className="flex-1">
                            <div className="flex items-center">
                                <p className="text-base font-medium text-white">
                                    {videos.find((item) => {
                                        const isPlaylistItem = 'resourceId' in item.snippet;
                                        const vid = isPlaylistItem
                                            ? (item as PlaylistItem).snippet.resourceId?.videoId
                                            : (item as SearchResult).id.videoId;
                                        return vid === videoId;
                                    })?.snippet.channelTitle}
                                </p>
                                <Badge className="ml-2 rounded-full w-6 h-6 flex items-center justify-center p-0">
                                    <span className="text-[12px]">✓</span>
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">1.2M subscribers</p>
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-primary-foreground hover:bg-secondary text-primary font-medium rounded-full"
                        >
                            Subscribe
                        </Button>
                    </div>

                    {/* Video description */}
                    <div className="bg-card rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-foreground font-medium text-sm">Description</span>
                            <div className="flex-1 border-t border-muted"></div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <span>123,456 views</span>
                            <span className="mx-1">•</span>
                            <span>
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
                            </span>
                            <span className="mx-1">•</span>
                            <span className="text-blue-400 hover:text-blue-500 cursor-pointer">#hashtag</span>
                            <span className="text-blue-400 hover:text-blue-500 cursor-pointer">#video</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                            {videos.find((v) => {
                                const isPlaylistItem = 'resourceId' in v.snippet;
                                const vid = isPlaylistItem
                                    ? (v as PlaylistItem).snippet.resourceId?.videoId
                                    : (v as SearchResult).id.videoId;
                                return vid === videoId;
                            })?.snippet.description}
                        </p>
                        <button className="text-sm text-muted-foreground hover:text-foreground mt-2 font-medium">Show
                            more
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar section */}
            <div className="w-full lg:w-[400px] bg-background h-auto lg:h-[calc(100vh-80px)] px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-medium text-foreground">
                            {videos.length > 0 && 'resourceId' in videos[0].snippet ? 'Playlist' : 'Up Next'}
                        </h2>
                        {videos.length > 0 && 'resourceId' in videos[0].snippet && (
                            <div className="text-xs text-muted-foreground">
                                <span className="font-medium">{videos.length}</span> videos
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Autoplay</span>
                        <Switch
                            id="autoplay"
                            defaultChecked
                        />
                    </div>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    <div
                        className="bg-primary-foreground text-primary text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                        All
                    </div>
                    <div
                        className="bg-card text-foreground text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                        Related
                    </div>
                    <div
                        className="bg-card text-foreground text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                        Recently uploaded
                    </div>
                    <div
                        className="bg-card text-foreground text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                        Watched
                    </div>
                </div>

                {/* Recommended videos */}
                <div className="space-y-3">
                    {videos?.map((item, index) => {
                        const isPlaylistItem = 'resourceId' in item.snippet;
                        const itemVideoId = isPlaylistItem
                            ? (item as PlaylistItem).snippet.resourceId?.videoId
                            : (item as SearchResult).id.videoId;
                        const itemId = typeof item.id === 'string' ? item.id : item.id?.videoId || JSON.stringify(item);
                        return (
                            <div
                                key={itemId}
                                className={`flex cursor-pointer hover:bg-card transition-colors duration-200 rounded-lg overflow-hidden p-1 ${
                                    itemVideoId === videoId ? 'bg-card' : ''
                                }`}
                                onClick={() => onVideoSelect(itemVideoId || '')}
                            >
                                {/* Thumbnail */}
                                <div className="flex-shrink-0 relative w-40 h-20">
                                    {/*{videos.length > 0 && 'resourceId' in videos[0].snippet && (*/}
                                    {/*    <div*/}
                                    {/*        className="absolute top-0 left-0 bg-primary bg-opacity-80 text-primary-foreground text-xs px-1">*/}
                                    {/*        {index + 1}*/}
                                    {/*    </div>*/}
                                    {/*)}*/}
                                    <img
                                        src={item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url}
                                        alt={item.snippet.title}
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                    <div
                                        className="absolute bottom-1 right-1 bg-primary bg-opacity-80 text-primary-foreground text-xs px-1 rounded">
                                        {Math.floor(Math.random() * 10) + 1}:{Math.floor(Math.random() * 50) + 10}
                                    </div>
                                </div>

                                {/* Video info */}
                                <div className="flex-1 pl-2 flex flex-col justify-between">
                                    <div>
                                        <p className="text-sm text-foreground font-medium line-clamp-2">{item.snippet.title}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <p className="text-xs text-muted-foreground">{item.snippet.channelTitle}</p>
                                            {Math.random() > 0.7 && (
                                                <div
                                                    className="bg-muted-foreground bg-opacity-30 rounded-full w-3 h-3 flex items-center justify-center">
                                                    <span className="text-[8px] text-foreground">✓</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                            <span>{Math.floor(Math.random() * 900) + 100}K views</span>
                                            <span className="mx-1">•</span>
                                            <span>{Math.floor(Math.random() * 11) + 1} {Math.random() > 0.5 ? 'months' : 'days'} ago</span>
                                        </div>
                                        {Math.random() > 0.8 && (
                                            <div
                                                className="mt-1 bg-card text-[10px] text-foreground px-1 py-0.5 rounded inline-block">
                                                New
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Menu button */}
                                <button className="text-muted-foreground hover:text-foreground p-1">
                                    <BsThreeDotsVertical className={"text-lg"}/>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
