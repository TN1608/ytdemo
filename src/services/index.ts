import api from "@/utils/axios";
import type {PlaylistItemsResponse, SearchResponse} from "@/types";

interface searchParams {
    query: string,
    maxResults?: number;
}

interface getPlaylistItemsParams {
    playlistId: string;
    maxResults?: number;
}

// params: ?part=snippet&maxResults=10&playlistId=YOUR_PLAYLIST_ID&key=${process.env.YOUTUBE_API_KEY}
export const index = async (query: string, maxResults: number = 10): Promise<SearchResponse> => {
    try {
        const resp = await api.get<SearchResponse>('/search', {
            params: {
                part: 'snippet',
                query,
                maxResults,
            },
        });
        return resp.data;
    } catch (error) {
        console.error('Error searching videos:', error);
        return {
            kind: "youtube#searchListResponse",
            etag: "some-etag",
            items: [],
            pageInfo: {
                totalResults: 0,
                resultsPerPage: 0
            }
        } as SearchResponse;
    }
};

export const getPlaylistItems = async ({
                                           playlistId,
                                           maxResults = 10
                                       }: getPlaylistItemsParams): Promise<PlaylistItemsResponse> => {
    try {
        const resp = await api.get<PlaylistItemsResponse>('/getPlaylist', {
            params: {
                part: 'snippet',
                playlistId,
                maxResults,
            },
        });
        return resp.data;
    } catch (err) {
        console.error('Error fetching playlist items:', err);
        return {
            kind: "youtube#playlistItemListResponse",
            etag: "some-etag",
            items: [],
            pageInfo: {
                totalResults: 0,
                resultsPerPage: 0
            },
            nextPageToken: undefined,
            prevPageToken: undefined
        } as PlaylistItemsResponse;
    }
};

// Body:
// {
//   "videoId": "dQw4w9WgXcQ",
// }
export const saveVideo = async (videoId: string) => {
    try {
        const resp = await api.post('/saveVideo', {videoId});
        return resp.data;
    } catch (err) {
        console.error('Error saving video:', err);
        throw new Error('Failed to save video');
    }
}

export const getSavedVideos = async () => {
    try {
        const resp = await api.get('/getSavedVideos');
        return resp.data;
    } catch (err) {
        console.error('Error fetching saved videos:', err);
        throw new Error('Failed to fetch saved videos');
    }
}


export const removeVideo = async (videoId: string) => {
    try {
        const resp = await api.delete('/deleteVideo', { data: { videoId } });
        return resp.data;
    } catch (err) {
        console.error('Error removing video:', err);
        throw new Error('Failed to remove video');
    }
}

export const likeVideo = async (videoId: string, status: boolean) => {
    try {
        const resp = await api.post('/likeVideo', {videoId, status});
        return resp.data;
    } catch (err) {
        console.error('Error liking video:', err);
        throw new Error('Failed to like video');
    }
}

export const getLikedVideos = async () => {
    try {
        const resp = await api.get('/getLikedVideos');
        return resp.data;
    } catch (err) {
        console.error('Error fetching liked videos:', err);
        throw new Error('Failed to fetch liked videos');
    }
}

