'use client';

import type {LikedVideo, SearchResult, Video} from '@/types';
import {Button} from '@/components/ui/button';
import {useCallback, useEffect, useState} from 'react';
import {BsThreeDotsVertical} from 'react-icons/bs';
import {AiOutlineDislike, AiOutlineLike} from 'react-icons/ai';
import {Badge} from '@/components/ui/badge';
import {Switch} from '@/components/ui/switch';
import {Minimize2} from 'lucide-react';
import {useMiniPlayerStore} from '@/utils/miniPlayerStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {toast} from 'sonner';
import {useAuth} from '@/context/AuthenticateProvider';
import {getByVideoId} from '@/services/video';
import Comments from "@/components/Comments";
import Link from "next/link";

interface VideoPlayerProps {
    videoId: string;
    videos: SearchResult[];
    onVideoSelect: (videoId: string) => void;
    onSave?: (videoId: string) => void;
    onRemove?: (videoId: string) => void;
    onLike?: (videoId: string) => void;
    onDislike?: (videoId: string) => void;
    savedVideos?: string[];
    likedVideos?: LikedVideo[];
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
                                    }: VideoPlayerProps) {
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [isLiking, setIsLiking] = useState<boolean>(false);
    const [isDisliking, setIsDisliking] = useState<boolean>(false);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [isDisliked, setIsDisliked] = useState<boolean>(false);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
    const {isAuthenticated} = useAuth();
    const {toggleMiniPlayer, setMiniPlayerVideoId} = useMiniPlayerStore();
    const [autoplay, setAutoplay] = useState(true);

    const getVideo = useCallback(async () => {
        try {
            const resp = await getByVideoId(videoId);
            setCurrentVideo(resp.items[0]);
        } catch (err) {
            console.error('Error fetching video:', err);
            toast.error('Không thể tải video');
        }
    }, [videoId]);

    useEffect(() => {
        getVideo();
    }, [getVideo]);

    useEffect(() => {
        setIsSaved(savedVideos ? savedVideos.includes(videoId) : false);
        setIsLiked(likedVideos ? likedVideos.some((video) => video.id === videoId && video.status === true) : false);
        setIsDisliked(likedVideos ? likedVideos.some((video) => video.id === videoId && video.status === false) : false);
    }, [videoId, savedVideos, likedVideos]);

    const handleSave = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để lưu video');
            window.location.href = '/signin';
            return;
        }
        if (onSave) {
            setIsSaving(true);
            try {
                await onSave(videoId);
                setIsSaved(true);
            } catch (error) {
                console.error('Error saving video:', error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleRemove = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để bỏ lưu video');
            window.location.href = '/signin';
            return;
        }
        if (onRemove) {
            setIsSaving(true);
            try {
                await onRemove(videoId);
                setIsSaved(false);
            } catch (error) {
                console.error('Error removing video:', error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thích video');
            window.location.href = '/signin';
            return;
        }
        if (onLike) {
            setIsLiking(true);
            try {
                await onLike(videoId);
            } catch (error) {
                console.error('Error liking video:', error);
            } finally {
                setIsLiking(false);
            }
        }
    };

    const handleDislike = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để không thích video');
            window.location.href = '/signin';
            return;
        }
        if (onDislike) {
            setIsDisliking(true);
            try {
                await onDislike(videoId);
            } catch (error) {
                console.error('Error disliking video:', error);
            } finally {
                setIsDisliking(false);
            }
        }
    };

    const handleShare = (platform: string) => {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(
                    currentVideo?.snippet.title || ''
                )}`;
                break;
            default:
                shareUrl = videoUrl;
        }

        window.open(shareUrl, '_blank');
    };

    const handleToggleMiniPlayer = () => {
        setMiniPlayerVideoId(videoId);
        toggleMiniPlayer();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 bg-background min-h-screen text-foreground font-sans">
            {/* Main content section */}
            <div className="w-full lg:w-[calc(100%-400px)] flex flex-col px-4 lg:px-8 pt-6 bg-background">
                {/* Video player */}
                <div className="relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl"
                     style={{paddingBottom: '56.25%'}}>
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`}
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
                        {currentVideo?.snippet.title || 'Video Title'}
                    </h1>

                    {/* Video stats */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>
              {currentVideo?.snippet.publishedAt
                  ? new Date(currentVideo.snippet.publishedAt).toLocaleString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh'})
                  : ''}
            </span>
                        <span className="mx-1">•</span>
                        <span>{currentVideo?.statistics?.viewCount ? `${parseInt(currentVideo.statistics.viewCount).toLocaleString()} lượt xem` : '123K lượt xem'}</span>
                        <span className="mx-1">•</span>
                        <span>
              {currentVideo?.contentDetails?.duration
                  ? formatDuration(currentVideo.contentDetails.duration)
                  : 'Unknown duration'}
            </span>
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
                                    {isLiking ? '...' : <AiOutlineLike className={isLiked ? 'fill-blue-700' : ''}/>}
                                    {isLiked ? `Đã thích (${currentVideo?.statistics?.likeCount || 0})` : `Thích (${currentVideo?.statistics?.likeCount || 0})`}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-none border-r border-muted cursor-pointer ${isDisliked ? 'bg-blue-100 text-blue-700' : 'text-foreground'} hover:bg-muted`}
                                    onClick={handleDislike}
                                    disabled={isDisliking}
                                >
                                    {isDisliking ? '...' :
                                        <AiOutlineDislike className={isDisliked ? 'fill-blue-700' : ''}/>}
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-foreground hover:bg-card"
                                onClick={isSaved ? handleRemove : handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? '...' : isSaved ? '✓ Đã lưu' : '🔖 Lưu'}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm"
                                            className="rounded-full text-foreground hover:bg-card">
                                        🔗 Chia sẻ
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Chia sẻ video</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() => navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${videoId}`)}>
                                        Sao chép liên kết
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleShare('facebook')}>
                                        Chia sẻ lên Facebook
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleShare('twitter')}>
                                        Chia sẻ lên Twitter
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={() => handleShare('copy')}>
                                        Nhúng video
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="ghost" size="sm" className="rounded-full text-foreground hover:bg-card">
                                ⬇️ Tải xuống
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-full text-foreground hover:bg-card">
                                ✂️ Cắt
                            </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-full text-foreground hover:bg-card"
                                onClick={handleToggleMiniPlayer}>
                            <Minimize2 className="w-4 h-4 mr-1"/> Mini Player
                        </Button>
                    </div>

                    {/* Channel info */}
                    <div className="flex items-start gap-3 mb-4 p-3 bg-card rounded-xl">
                        {currentVideo?.snippet.thumbnails?.default?.url && (
                            <img src={currentVideo.snippet.thumbnails.default.url} alt="Channel Thumbnail"
                                 className="w-12 h-12 rounded-full"/>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center">
                                <p className="text-base font-medium text-foreground">{currentVideo?.snippet.channelTitle || 'Channel Name'}</p>
                                <Badge className="ml-2 rounded-full w-6 h-6 flex items-center justify-center p-0">
                                    <span className="text-[12px]">✓</span>
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">1.2M subscribers</p>
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-primary-foreground cursor-pointer border border-red-700 hover:border-red-300 hover:bg-secondary text-primary font-medium rounded-full"
                        >
                            Subscribe
                        </Button>
                    </div>

                    {/* Video description */}
                    <div className="bg-card rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-foreground font-medium text-sm">Mô tả</span>
                            <div className="flex-1 border-t border-muted"></div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <span>{currentVideo?.statistics?.viewCount ? `${parseInt(currentVideo.statistics.viewCount).toLocaleString()} lượt xem` : '123,456 lượt xem'}</span>
                            <span className="mx-1">•</span>
                            <span>
                {currentVideo?.snippet.publishedAt
                    ? new Date(currentVideo.snippet.publishedAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })
                    : ''}
              </span>
                            <span className="mx-1">•</span>
                            <span>
                {currentVideo?.snippet.tags?.map((tag, index) => (
                    <span key={index} className="text-blue-400 hover:text-blue-500 cursor-pointer">
                    #{tag}{' '}
                  </span>
                ))}
              </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                            {currentVideo?.snippet.description || 'Video Description'}
                        </p>
                        <button className="text-sm text-muted-foreground hover:text-foreground mt-2 font-medium">Xem
                            thêm
                        </button>
                    </div>

                    {isAuthenticated && (
                        <Comments videoId={videoId}/>
                    )}
                    {!isAuthenticated && (
                        <div className="bg-card rounded-xl p-4 mb-6">
                            <p className="text-sm text-muted-foreground mb-2">Đăng nhập để bình luận</p>
                            <Link href="/signin">
                                <Button variant="outline" size="sm"
                                        className="bg-primary-foreground text-primary font-medium rounded-full">
                                    Đăng nhập
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar section */}
            <div className="w-full lg:w-[400px] bg-background h-auto lg:h-[calc(100vh-80px)] px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-medium text-foreground">Video liên quan</h2>
                        {videos.length > 0 &&
                            <div className="text-xs text-muted-foreground">{videos.length} video</div>}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Tự động phát</span>
                        <Switch id="autoplay" checked={autoplay} onCheckedChange={setAutoplay}/>
                    </div>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    <div
                        className="bg-primary-foreground text-primary text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                        Tất cả
                    </div>
                    <div
                        className="bg-card text-foreground text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                        Liên quan
                    </div>
                    <div
                        className="bg-card text-foreground text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                        Tải lên gần đây
                    </div>
                    <div
                        className="bg-card text-foreground text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                        Đã xem
                    </div>
                </div>

                {/* Recommended videos */}
                <div className="space-y-3">
                    {videos?.map((item) => {
                        const itemVideoId = 'resourceId' in item.snippet ? item.snippet.resourceId?.videoId : item.id.videoId;
                        const itemId = typeof item.id === 'string' ? item.id : item.id?.videoId || JSON.stringify(item);
                        const isSaved = savedVideos ? savedVideos.includes(itemVideoId || '') : false;
                        const isLiked = likedVideos ? likedVideos.some((video) => video.id === itemVideoId && video.status === true) : false;
                        const isDisliked = likedVideos ? likedVideos.some((video) => video.id === itemVideoId && video.status === false) : false;
                        return (
                            <div
                                key={itemId}
                                className={`flex cursor-pointer hover:bg-card transition-colors duration-200 rounded-lg overflow-hidden p-1 ${itemVideoId === videoId ? 'bg-card' : ''}`}
                                onClick={() => onVideoSelect(itemVideoId || '')}
                            >
                                {/* Thumbnail */}
                                <div className="flex-shrink-0 relative w-40 h-20">
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
                                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{item.snippet.channelTitle}</p>
                                            {Math.random() > 0.7 && (
                                                <span
                                                    className="ml-1 bg-muted-foreground bg-opacity-30 rounded-full w-4 h-4 flex items-center justify-center"
                                                    title="Verified">
                                              <span className="text-[10px] text-foreground">✓</span>
                                            </span>
                                            )}
                                        </div>
                                        <div
                                            className="flex items-center text-xs text-muted-foreground mt-0.5 space-x-1">
                                            <span>{Math.floor(Math.random() * 900) + 100}K lượt xem</span>
                                            <span aria-hidden="true">•</span>
                                            <span>{Math.floor(Math.random() * 11) + 1} {Math.random() > 0.5 ? 'tháng' : 'ngày'} trước</span>
                                        </div>
                                        {Math.random() > 0.8 && (
                                            <span
                                                className="mt-1 bg-card text-[10px] text-blue-600 px-1.5 py-0.5 rounded font-semibold inline-block">Mới</span>
                                        )}
                                    </div>
                                </div>
                                {/* Menu button */}
                                <div className="ml-2 flex items-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="p-1">
                                                <BsThreeDotsVertical className="w-5 h-5 text-muted-foreground"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {isSaved ? (
                                                <DropdownMenuItem onClick={handleRemove}>Bỏ lưu</DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem onClick={handleSave}>Lưu video</DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem
                                                onClick={handleLike}>{isLiked ? 'Bỏ thích' : 'Thích video'}</DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={handleDislike}>{isDisliked ? 'Bỏ không thích' : 'Không thích video'}</DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem onClick={() => handleShare('copy')}>Sao chép liên
                                                kết</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleShare('facebook')}>Chia sẻ lên
                                                Facebook</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleShare('twitter')}>Chia sẻ lên
                                                Twitter</DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem onClick={() => handleShare('copy')}>Nhúng
                                                video</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Hàm helper để format duration từ định dạng ISO 8601 (PT4M59S)
function formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'Unknown duration';
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    return `${hours ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}