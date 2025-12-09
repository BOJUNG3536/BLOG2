import { SearchResponse, VideoListResponse, VideoItem, SortOrder, DateFilter, DurationFilter, CommentThreadResponse, CommentThreadItem } from '../types';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to calculate publishedAfter date in RFC 3339 format
const getPublishedAfterDate = (filter: DateFilter): string | undefined => {
  if (filter === 'all') return undefined;

  const date = new Date();
  switch (filter) {
    case '1month':
      date.setMonth(date.getMonth() - 1);
      break;
    case '3months':
      date.setMonth(date.getMonth() - 3);
      break;
    case '6months':
      date.setMonth(date.getMonth() - 6);
      break;
    case '1year':
      date.setFullYear(date.getFullYear() - 1);
      break;
    case '5years':
      date.setFullYear(date.getFullYear() - 5);
      break;
  }
  return date.toISOString();
};

export const fetchYouTubeVideos = async (
  apiKey: string,
  query: string,
  sort: SortOrder,
  dateFilter: DateFilter,
  durationFilter: DurationFilter,
  pageToken: string = ''
): Promise<{ videos: VideoItem[]; nextPageToken?: string; prevPageToken?: string; totalResults: number }> => {
  if (!apiKey) throw new Error('API Key가 필요합니다.');

  // Step 1: Search for videos to get IDs (Max 50 per page due to API hard limits)
  // Although user asked for 100, standard practice is 50. We stick to 50 for stability.
  const searchParams = new URLSearchParams({
    part: 'snippet',
    maxResults: '50', 
    q: query,
    type: 'video',
    order: sort,
    key: apiKey,
  });

  if (pageToken) {
    searchParams.append('pageToken', pageToken);
  }

  // Add Duration Filter
  if (durationFilter !== 'any') {
    searchParams.append('videoDuration', durationFilter);
  }

  const publishedAfter = getPublishedAfterDate(dateFilter);
  if (publishedAfter) {
    searchParams.append('publishedAfter', publishedAfter);
  }

  const searchRes = await fetch(`${BASE_URL}/search?${searchParams.toString()}`);
  
  if (!searchRes.ok) {
    const errorData = await searchRes.json();
    throw new Error(errorData.error?.message || '검색 요청 중 오류가 발생했습니다.');
  }

  const searchData: SearchResponse = await searchRes.json();

  if (!searchData.items || searchData.items.length === 0) {
    return { videos: [], nextPageToken: undefined, prevPageToken: undefined, totalResults: 0 };
  }

  // Step 2: Get detailed statistics for the found video IDs
  const videoIds = searchData.items.map((item) => item.id.videoId).join(',');
  const statsParams = new URLSearchParams({
    part: 'snippet,statistics,contentDetails', // Added contentDetails for duration
    id: videoIds,
    key: apiKey,
  });

  const statsRes = await fetch(`${BASE_URL}/videos?${statsParams.toString()}`);
  
  if (!statsRes.ok) {
    const errorData = await statsRes.json();
    throw new Error(errorData.error?.message || '상세 정보 요청 중 오류가 발생했습니다.');
  }

  const statsData: VideoListResponse = await statsRes.json();

  return {
    videos: statsData.items,
    nextPageToken: searchData.nextPageToken,
    prevPageToken: searchData.prevPageToken,
    totalResults: searchData.pageInfo.totalResults,
  };
};

export const fetchVideoComments = async (
  apiKey: string,
  videoId: string
): Promise<CommentThreadItem[]> => {
  if (!apiKey) throw new Error('API Key is required');

  const params = new URLSearchParams({
    part: 'snippet',
    videoId: videoId,
    maxResults: '5', // Fetch top 5 comments to keep UI clean
    textFormat: 'plainText',
    order: 'relevance',
    key: apiKey,
  });

  const res = await fetch(`${BASE_URL}/commentThreads?${params.toString()}`);
  
  if (!res.ok) {
    const errorData = await res.json();
    // Common error: comments disabled
    throw new Error(errorData.error?.message || '댓글을 불러올 수 없습니다.');
  }

  const data: CommentThreadResponse = await res.json();
  return data.items || [];
};