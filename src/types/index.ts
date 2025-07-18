// thumbnail types
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
    tags?: string[]; // Thêm để hỗ trợ tags trong video snippet
    categoryId?: string; // Thêm để hỗ trợ categoryId
    liveBroadcastContent?: string; // Thêm để hỗ trợ liveBroadcastContent
    localized?: {
        title: string;
        description: string;
    }; // Thêm để hỗ trợ localized
    defaultAudioLanguage?: string; // Thêm để hỗ trợ defaultAudioLanguage
}

// Định nghĩa kiểu cho contentDetails
export interface ContentDetails {
    duration: string; // Ví dụ: "PT4M59S"
    dimension: string; // Ví dụ: "2d"
    definition: string; // Ví dụ: "hd"
    caption: string; // Ví dụ: "true"
    licensedContent: boolean;
    contentRating: Record<string, any>; // Có thể để Record vì contentRating có thể rỗng
    projection: string; // Ví dụ: "rectangular"
}

// Định nghĩa kiểu cho statistics
export interface Statistics {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
}

// Định nghĩa kiểu cho Video (một item trong youtube#videoListResponse)
export interface Video {
    kind: string;
    etag: string;
    id: string;
    snippet: Snippet;
    contentDetails?: ContentDetails;
    statistics?: Statistics;
}

export interface VideoListResponse {
    kind: string; // Ví dụ: "youtube#videoListResponse"
    etag: string;
    items: Video[];
    pageInfo: PageInfo;
}

// Định nghĩa kiểu PlaylistItem (kết quả playlist item)
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

// Định nghĩa kiểu response cho endpoint /search
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