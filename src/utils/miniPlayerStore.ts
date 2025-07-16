import { create } from 'zustand';

interface MiniPlayerState {
    isMiniPlayerOpen: boolean;
    miniPlayerVideoId: string | null;
    toggleMiniPlayer: () => void;
    setMiniPlayerVideoId: (videoId: string | null) => void;
    closeMiniPlayer: () => void;
}

export const useMiniPlayerStore = create<MiniPlayerState>((set) => ({
    isMiniPlayerOpen: false,
    miniPlayerVideoId: null,
    toggleMiniPlayer: () => set((state) => ({ isMiniPlayerOpen: !state.isMiniPlayerOpen })),
    setMiniPlayerVideoId: (videoId) => set({ miniPlayerVideoId: videoId }),
    closeMiniPlayer: () => set({ isMiniPlayerOpen: false, miniPlayerVideoId: null }),
}));