'use client';

import {useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {X, Play, Pause, Maximize2} from 'lucide-react';
import Draggable from 'react-draggable';

interface MiniPlayerProps {
    videoId: string;
    onClose: () => void;
    onMaximize: () => void;
}

export default function MiniPlayer({videoId, onClose, onMaximize}: MiniPlayerProps) {
    const playerRef = useRef<any>(null);
    const draggableRef = useRef<HTMLDivElement>(null);
    const [playerState, setPlayerState] = useState<number>(-1); // -1: unstarted, 1: playing, 2: paused
    const [isApiLoaded, setIsApiLoaded] = useState<boolean>(false);

    // Tải YouTube IFrame Player API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            // Đợi API tải xong
            window.onYouTubeIframeAPIReady = () => {
                setIsApiLoaded(true);
            };
        } else {
            setIsApiLoaded(true);
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, []);

    // Khởi tạo YouTube Player khi API đã tải và videoId thay đổi
    useEffect(() => {
        if (isApiLoaded && window.YT && window.YT.Player) {
            playerRef.current = new window.YT.Player('mini-player-iframe', {
                videoId,
                playerVars: {
                    autoplay: 0,
                    rel: 0,
                    modestbranding: 1,
                },
                events: {
                    onReady: (event: any) => {
                        event.target.playVideo();
                        setPlayerState(1);
                    },
                    onStateChange: (event: any) => {
                        setPlayerState(event.data);
                    },
                },
            });
        }
    }, [videoId, isApiLoaded]);

    const togglePlayPause = () => {
        if (playerRef.current) {
            if (playerState === 1) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        }
    };

    return (
        <Draggable handle=".drag-handle" nodeRef={draggableRef} bounds="body">
            <div
                ref={draggableRef}
                className="fixed bottom-4 right-4 w-80 bg-background border border-muted rounded-lg shadow-lg z-50 hover:shadow-xl transition-shadow duration-300"
            >
                <div
                    className="drag-handle cursor-move bg-card p-1 flex items-center justify-between rounded-t-lg border-b border-muted">
                    <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mx-1"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mx-1"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500 mx-1"></div>
                    </div>
                    <div className="text-xs text-muted-foreground">Kéo để di chuyển</div>
                </div>
                <div className="relative w-full" style={{paddingBottom: '56.25%'}}>
                    <div id="mini-player-iframe" className="absolute top-0 left-0 w-full h-full"></div>
                </div>
                <div className="p-2 flex items-center justify-between bg-card rounded-b-lg">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePlayPause}
                        className="text-foreground hover:bg-muted"
                        disabled={!playerRef.current}
                    >
                        {playerState === 1 ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMaximize}
                            className="text-foreground hover:bg-muted"
                            title="Phóng to"
                        >
                            <Maximize2 className="w-4 h-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-foreground hover:bg-muted"
                            title="Đóng"
                        >
                            <X className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>
            </div>
        </Draggable>
    );
}