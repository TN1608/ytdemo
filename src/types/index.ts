//thumbnail types
export interface Thumbnail {
    url: string;
    width: number;
    height: number;
}

export interface Thumbnails {
    default?: Thumbnail;
    medium?: Thumbnail;
    high?: Thumbnail;
    standard?: Thumbnail;
    maxres?: Thumbnail;
}

export interface ResourceId {
    kind: string;
    videoId: string;
}

export interface Snippet {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: Thumbnails;
    channelTitle: string;
    playlistId?: string; // Chỉ có trong playlistItems
    resourceId?: ResourceId; // Chỉ có trong playlistItems
}


export interface PlaylistItem {
    kind: string;
    etag: string;
    id: string;
    snippet: Snippet;
}

// Định nghĩa kiểu SearchResult (kết quả tìm kiếm video)
export interface SearchResult {
    kind: string;
    etag: string;
    id: {
        kind: string;
        videoId: string;
    };
    snippet: Snippet;
}

// Định nghĩa kiểu PageInfo (thông tin phân trang)
export interface PageInfo {
    totalResults: number;
    resultsPerPage: number;
}

// Định nghĩa kiểu response cho endpoint /playlistItems
export interface PlaylistItemsResponse {
    kind: string;
    etag: string;
    nextPageToken?: string;
    prevPageToken?: string;
    pageInfo: PageInfo;
    items: PlaylistItem[];
}

// Định nghĩa kiểu response cho endpoint /index
export interface SearchResponse {
    kind: string;
    etag: string;
    nextPageToken?: string;
    prevPageToken?: string;
    pageInfo: PageInfo;
    items: SearchResult[];
}

export interface SavedVideo {
    id: string;
    description: string;
    thumbnail: string;
    savedAt: string;
    videoId: string;
    title: string;
}

export interface SavedVideosResponse {
    message: string;
    videos: SavedVideo[];
}

export interface LikedVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    status: boolean;
    updatedAt: string;
}

export interface LikedVideosResponse {
    message: string;
    videos: LikedVideo[];
}


//API ENDPOINT JSON
// {
//     "kind": "youtube#playlistItemListResponse",
//     "etag": "some-etag",
//     "nextPageToken": "CAoQAA",
//     "pageInfo": {
//     "totalResults": 100,
//         "resultsPerPage": 10
// },
//     "items": [
//     {
//         "kind": "youtube#playlistItem",
//         "etag": "some-etag",
//         "id": "PL4cUxeGkcC9gZD-Tvwfodw5axV3HCr0y.1",
//         "snippet": {
//             "publishedAt": "2023-01-01T12:00:00Z",
//             "channelId": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
//             "title": "Sample Video Title",
//             "description": "This is a sample video.",
//             "thumbnails": {
//                 "default": {
//                     "url": "https://i.ytimg.com/vi/abc123/default.jpg",
//                     "width": 120,
//                     "height": 90
//                 },
//                 "medium": {
//                     "url": "https://i.ytimg.com/vi/abc123/mqdefault.jpg",
//                     "width": 320,
//                     "height": 180
//                 },
//                 "high": {
//                     "url": "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
//                     "width": 480,
//                     "height": 360
//                 }
//             },
//             "channelTitle": "Sample Channel",
//             "playlistId": "PL4cUxeGkcC9gZD-Tvwfodw5axV3HCr0y",
//             "resourceId": {
//                 "kind": "youtube#video",
//                 "videoId": "abc123"
//             }
//         }
//     }
// ]
// }
