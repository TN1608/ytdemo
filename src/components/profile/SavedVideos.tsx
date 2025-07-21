'use client';

import { SavedVideo } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from "next/link";

interface SavedVideosProps {
    savedVideos: SavedVideo[];
}

export default function SavedVideos({ savedVideos }: SavedVideosProps) {
    return (
        <div className="p-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedVideos.length > 0 ? (
                savedVideos.map((video) => (
                    <Card key={video.videoId} className="flex flex-col h-full">
                        <CardHeader className="pb-2">
                            <Link href={`/watch/${video.videoId}`} className="text-lg font-semibold truncate hover:underline">
                                {video.title}
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 flex-1 justify-center">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-48 object-cover rounded-md border"
                            />
                        </CardContent>
                    </Card>
                ))
            ) : (
                <p className="text-muted-foreground">No saved videos found.</p>
            )}
        </div>
    );
}