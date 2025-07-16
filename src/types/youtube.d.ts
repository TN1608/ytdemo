declare global {
    interface Window {
        YT: {
            Player: new (
                elementId: string,
                config: {
                    videoId: string;
                    playerVars?: {
                        autoplay?: 0 | 1;
                        rel?: 0 | 1;
                        modestbranding?: 0 | 1;
                    };
                    events?: {
                        onReady?: (event: any) => void;
                        onStateChange?: (event: any) => void;
                    };
                }
            ) => any;
        };
        onYouTubeIframeAPIReady: () => void;
    }
}

export {};