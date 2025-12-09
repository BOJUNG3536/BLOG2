export interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  channelTitle: string;
  tags?: string[];
  categoryId: string;
  liveBroadcastContent: string;
}

export interface VideoStatistics {
  viewCount: string;
  likeCount?: string;
  favoriteCount: string;
  commentCount: string;
}

export interface VideoContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  regionRestriction?: {
    allowed: string[];
    blocked: string[];
  };
}

export interface VideoItem {
  kind: string;
  etag: string;
  id: string; // Adjusted: In video details, id is a string. In search, id is object. We normalize this.
  snippet: VideoSnippet;
  statistics?: VideoStatistics;
  contentDetails?: VideoContentDetails;
}

export interface SearchResultItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: VideoSnippet;
}

export interface SearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: SearchResultItem[];
}

export interface VideoListResponse {
  kind: string;
  etag: string;
  items: VideoItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export type DateFilter = '1month' | '3months' | '6months' | '1year' | '5years' | 'all';
export type SortOrder = 'date' | 'viewCount' | 'relevance' | 'rating';
export type DurationFilter = 'any' | 'short' | 'medium' | 'long';

export interface SearchParams {
  query: string;
  dateFilter: DateFilter;
  sortOrder: SortOrder;
  durationFilter: DurationFilter;
  pageToken?: string;
}

// Comment related types
export interface CommentSnippet {
  textDisplay: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  publishedAt: string;
  likeCount: number;
}

export interface CommentThreadItem {
  id: string;
  snippet: {
    topLevelComment: {
      snippet: CommentSnippet;
    };
  };
}

export interface CommentThreadResponse {
  items: CommentThreadItem[];
}