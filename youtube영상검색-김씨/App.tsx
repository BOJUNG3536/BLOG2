import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SearchHeader from './components/SearchHeader';
import VideoTable from './components/VideoTable';
import { fetchYouTubeVideos } from './services/youtubeService';
import { DateFilter, SortOrder, DurationFilter, VideoItem } from './types';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('any');
  
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [prevPageToken, setPrevPageToken] = useState<string | undefined>(undefined);
  const [pageTokenStack, setPageTokenStack] = useState<string[]>([]); // To manage history for simpler Prev button logic

  const handleSearch = async (token: string = '') => {
    if (!apiKey) {
      alert('사이드바에서 YouTube API Key를 먼저 입력해주세요.');
      return;
    }
    if (!query.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchYouTubeVideos(apiKey, query, sortOrder, dateFilter, durationFilter, token);
      setVideos(data.videos);
      setNextPageToken(data.nextPageToken);
      setPrevPageToken(data.prevPageToken);
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const onNextPage = () => {
    if (nextPageToken) {
      setPageTokenStack([...pageTokenStack, nextPageToken]);
      handleSearch(nextPageToken);
    }
  };

  const onPrevPage = () => {
    if (prevPageToken) {
      // Pop current, go back
      const newStack = [...pageTokenStack];
      newStack.pop();
      setPageTokenStack(newStack);
      handleSearch(prevPageToken);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar apiKey={apiKey} setApiKey={setApiKey} />

      {/* Main Content */}
      <main className="flex-1 md:ml-80 p-4 md:p-8 transition-all">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">영상 검색 대시보드</h2>
            <p className="text-gray-500 text-sm mt-1">
              키워드와 필터를 사용하여 경쟁 채널과 트렌드를 분석하세요.
            </p>
          </div>

          <SearchHeader 
            query={query}
            setQuery={setQuery}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            durationFilter={durationFilter}
            setDurationFilter={setDurationFilter}
            onSearch={() => {
              setPageTokenStack([]); // Reset pagination on new search
              handleSearch('');
            }}
            loading={loading}
          />

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              검색 결과 <span className="text-sm font-normal text-gray-500 ml-2">(페이지당 최대 50개)</span>
            </h3>
            
            {/* Pagination Controls */}
            <div className="flex space-x-2">
              <button
                onClick={onPrevPage}
                disabled={!prevPageToken || loading}
                className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </button>
              <button
                onClick={onNextPage}
                disabled={!nextPageToken || loading}
                className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          <VideoTable videos={videos} apiKey={apiKey} />
          
           {/* Bottom Pagination (Redundant but good UX) */}
           {videos.length > 0 && (
            <div className="mt-6 flex justify-center space-x-4">
               <button
                onClick={onPrevPage}
                disabled={!prevPageToken || loading}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                이전 페이지
              </button>
              <button
                onClick={onNextPage}
                disabled={!nextPageToken || loading}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                다음 페이지
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
           )}

        </div>
      </main>
    </div>
  );
};

export default App;