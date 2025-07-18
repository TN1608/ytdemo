'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

type Video = {
    id: { videoId: string };
    snippet: {
        title: string;
        channelTitle: string;
        thumbnails: {
            high?: { url: string };
            default?: { url: string };
        };
    };
};

type LikedVideo = {
    id: string;
    status: boolean;
};

type Props = {
    videos: Video[];
    savedVideos: string[];
    likedVideos: LikedVideo[];
    loading: boolean;
    handleSave: (videoId: string) => void;
    handleRemove: (videoId: string) => void;
};

export default function VideoLists({
                                      videos,
                                      savedVideos,
                                      likedVideos,
                                      loading,
                                      handleSave,
                                      handleRemove,
                                  }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => {
                const videoId = video.id.videoId;
                const isSaved = savedVideos.includes(videoId);
                const isLiked = likedVideos.some((v) => v.id === videoId && v.status === true);
                const isDisliked = likedVideos.some((v) => v.id === videoId && v.status === false);

                return (
                    <div key={videoId} className="bg-card rounded-lg border-accent border transition-all hover:border-accent-foreground overflow-hidden shadow-md">
                        <Link href={`/watch/${videoId}`}>
                            <img
                                src={video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url}
                                alt={video.snippet.title}
                                className="w-full h-48 object-cover"
                            />
                        </Link>
                        <div className="p-4">
                            <Link href={`/watch/${videoId}`}>
                                <h2 className="text-sm font-medium line-clamp-2">{video.snippet.title}</h2>
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">{video.snippet.channelTitle}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => (isSaved ? handleRemove(videoId) : handleSave(videoId))}
                                    disabled={loading}
                                >
                                    {isSaved ? '✓ Đã lưu' : '🔖 Lưu'}
                                </Button>
                                {/*    Dropdown Share   */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            Chia sẻ
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Chia sẻ video</DropdownMenuLabel>
                                        <DropdownMenuItem
                                            onClick={() => navigator.clipboard.writeText(window.location.href)}>
                                            Sao chép liên kết
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem
                                            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}>
                                            Facebook
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank')}>
                                            Twitter
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}