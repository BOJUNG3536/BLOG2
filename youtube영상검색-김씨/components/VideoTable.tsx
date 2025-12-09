import React, { useState } from 'react';
import { VideoItem, CommentThreadItem } from '../types';
import { Eye, MessageCircle, ExternalLink, Hash, ChevronDown, ChevronUp, User, Clock, Download } from 'lucide-react';
import { fetchVideoComments } from '../services/youtubeService';

interface VideoTableProps {
  videos: VideoItem[];
  apiKey: string;
}

const formatNumber = (numStr?: string) => {
  if (!numStr) return '0';
  return parseInt(numStr).toLocaleString();
};

const formatDuration = (isoDuration?: string) => {
  if (!isoDuration) return 'N/A';
  
  // Parse ISO 8601 duration (e.g., PT1H2M10S, PT5M)
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
  const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
  const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;

  // Format strings
  const hh = hours > 0 ? `${hours}:` : '';
  const mm = hours > 0 ? minutes.toString().padStart(2, '0') : minutes.toString();
  const ss = seconds.toString().padStart(2, '0');

  return `${hh}${mm}:${ss}`;
};

const VideoTable: React.FC<VideoTableProps> = ({ videos, apiKey }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentThreadItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  const handleToggleComments = async (videoId: string) => {
    if (expandedId === videoId) {
      setExpandedId(null);
      setComments([]);
      setCommentsError(null);
      return;
    }

    setExpandedId(videoId);
    setLoadingComments(true);
    setCommentsError(null);
    setComments([]);

    try {
      const data = await fetchVideoComments(apiKey, videoId);
      setComments(data);
    } catch (err: any) {
      setCommentsError(err.message || '댓글을 불러오는 중 오류가 발생했습니다. (댓글이 중지되었을 수 있습니다)');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleExportCSV = () => {
    if (videos.length === 0) return;

    const BOM = '\uFEFF'; // BOM for Excel to display Korean characters correctly
    const headers = ['Video ID', 'Title', 'Channel', 'Duration', 'Published At', 'Views', 'Comments', 'Tags', 'URL'];
    
    const rows = videos.map(v => {
      const tags = v.snippet.tags ? v.snippet.tags.join(', ') : '';
      return [
        v.id,
        `"${v.snippet.title.replace(/"/g, '""')}"`, // Escape quotes
        `"${v.snippet.channelTitle.replace(/"/g, '""')}"`,
        formatDuration(v.contentDetails?.duration),
        v.snippet.publishedAt.split('T')[0],
        v.statistics?.viewCount || '0',
        v.statistics?.commentCount || '0',
        `"${tags.replace(/"/g, '""')}"`,
        `https://www.youtube.com/watch?v=${v.id}`
      ];
    });

    const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `youtube_search_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
        <div className="text-gray-400 mb-2">검색 결과가 없습니다.</div>
        <div className="text-sm text-gray-500">다른 검색어나 필터를 시도해보세요.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <span className="text-sm text-gray-500 font-medium">
          총 {videos.length}개의 영상
        </span>
        <button 
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 hover:text-green-700 hover:border-green-300 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>CSV 다운로드</span>
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                썸네일
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                영상 정보
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                통계 및 길이
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                태그
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {videos.map((video) => (
              <React.Fragment key={video.id}>
                <tr className={`${expandedId === video.id ? 'bg-red-50' : 'hover:bg-gray-50'} transition-colors`}>
                  {/* Thumbnail */}
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <div className="flex-shrink-0 h-20 w-36 relative rounded-md overflow-hidden bg-gray-200 group">
                      <img
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        src={video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url}
                        alt={video.snippet.title}
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded">
                        {formatDuration(video.contentDetails?.duration)}
                      </div>
                    </div>
                  </td>

                  {/* Info */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col space-y-1">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-gray-900 hover:text-red-600 line-clamp-2 leading-tight flex items-start gap-1 group"
                      >
                        {video.snippet.title}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-gray-400" />
                      </a>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">채널: </span>
                        <a 
                          href={`https://www.youtube.com/channel/${video.snippet.channelId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-red-600"
                        >
                          {video.snippet.channelTitle}
                        </a>
                      </div>
                      <div className="text-xs text-gray-400">
                        게시일: {new Date(video.snippet.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>

                  {/* Stats */}
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <div className="flex flex-col space-y-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2" title="길이">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-gray-700">{formatDuration(video.contentDetails?.duration)}</span>
                      </div>
                      <div className="flex items-center space-x-2" title="조회수">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-700">{formatNumber(video.statistics?.viewCount)}회</span>
                      </div>
                      <div className="flex items-center space-x-2" title="댓글 수">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        <span>{formatNumber(video.statistics?.commentCount)}개</span>
                      </div>
                      <button
                        onClick={() => handleToggleComments(video.id)}
                        className={`mt-2 text-xs flex items-center space-x-1 px-2 py-1 rounded border transition-all ${
                          expandedId === video.id
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                         {expandedId === video.id ? (
                           <><span>닫기</span><ChevronUp className="w-3 h-3" /></>
                         ) : (
                           <><span>댓글 보기</span><ChevronDown className="w-3 h-3" /></>
                         )}
                      </button>
                    </div>
                  </td>

                  {/* Tags */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                      {video.snippet.tags && video.snippet.tags.length > 0 ? (
                        video.snippet.tags.slice(0, 10).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            <Hash className="w-3 h-3 mr-0.5 text-slate-400" />
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">태그 없음</span>
                      )}
                      {video.snippet.tags && video.snippet.tags.length > 10 && (
                        <span className="text-xs text-gray-400 ml-1">
                          +{video.snippet.tags.length - 10} 더보기
                        </span>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Comment Section */}
                {expandedId === video.id && (
                  <tr className="bg-gray-50/50">
                    <td colSpan={4} className="px-6 py-4">
                      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-inner">
                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                          <MessageCircle className="w-4 h-4 mr-2 text-red-500" />
                          최신 인기 댓글 (Top 5)
                        </h4>
                        
                        {loadingComments && (
                          <div className="flex justify-center py-4">
                             <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}

                        {!loadingComments && commentsError && (
                           <div className="text-sm text-red-500 py-2 px-3 bg-red-50 rounded border border-red-100">
                             {commentsError}
                           </div>
                        )}

                        {!loadingComments && !commentsError && comments.length === 0 && (
                          <div className="text-sm text-gray-500 italic py-2">표시할 댓글이 없습니다.</div>
                        )}

                        {!loadingComments && !commentsError && comments.length > 0 && (
                          <div className="space-y-4">
                            {comments.map((comment) => {
                               const snippet = comment.snippet.topLevelComment.snippet;
                               return (
                                <div key={comment.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                  <div className="flex-shrink-0">
                                    {snippet.authorProfileImageUrl ? (
                                      <img 
                                        src={snippet.authorProfileImageUrl} 
                                        alt={snippet.authorDisplayName} 
                                        className="w-8 h-8 rounded-full"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://www.gravatar.com/avatar?d=mp';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-4 h-4 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-semibold text-gray-900">{snippet.authorDisplayName}</span>
                                      <span className="text-xs text-gray-400">{new Date(snippet.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{snippet.textDisplay}</p>
                                    <div className="mt-1 flex items-center text-xs text-gray-400 space-x-2">
                                      <span>좋아요 {snippet.likeCount}</span>
                                    </div>
                                  </div>
                                </div>
                               )
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VideoTable;