'use client';

import MiniPlayer from '@/components/MiniPlayer';
import { useMiniPlayerStore } from '@/utils/miniPlayerStore';

export default function MiniPlayerWrapper() {
    const { isMiniPlayerOpen, miniPlayerVideoId, closeMiniPlayer } = useMiniPlayerStore();

    if (!isMiniPlayerOpen || !miniPlayerVideoId) return null;

    return (
        <MiniPlayer
            videoId={miniPlayerVideoId}
            onClose={closeMiniPlayer}
            onMaximize={() => useMiniPlayerStore.getState().toggleMiniPlayer()}
        />
    );
}