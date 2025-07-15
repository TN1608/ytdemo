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
export const search = async (query: string, maxResults: number = 10): Promise<SearchResponse> => {
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