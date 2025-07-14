import api from '@/utils/axios';
import type { PlaylistItemsResponse, SearchResponse } from '@/types';

interface SearchParams {
    query: string;
    maxResults?: number;
}

interface GetPlaylistItemsParams {
    playlistId: string;
    maxResults?: number;
}

export const search = async ({ query, maxResults = 10 }: SearchParams): Promise<SearchResponse> => {
    try {
        const resp = await api.get<SearchResponse>('/search', {
            params: {
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults,
            },
        });
        return resp.data;
    } catch (error) {
        console.error('Error searching videos:', error);
        return {
            kind: 'youtube#searchListResponse',
            etag: 'some-etag',
            items: [],
            pageInfo: {
                totalResults: 0,
                resultsPerPage: 0,
            },
        } as SearchResponse;
    }
};

export const getPlaylistItems = async ({
                                           playlistId,
                                           maxResults = 10,
                                       }: GetPlaylistItemsParams): Promise<PlaylistItemsResponse> => {
    try {
        const resp = await api.get<PlaylistItemsResponse>('/playlistItems', {
            params: {
                part: 'snippet',
                playlistId,
                maxResults,
            },
        });
        return resp.data;
    } catch (err) {
        console.error('Lỗi khi lấy danh sách video trong playlist:', err);
        return {
            kind: 'youtube#playlistItemListResponse',
            etag: 'some-etag',
            items: [],
            pageInfo: {
                totalResults: 0,
                resultsPerPage: 0,
            },
            nextPageToken: undefined,
            prevPageToken: undefined,
        } as PlaylistItemsResponse;
    }
};