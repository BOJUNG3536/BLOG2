import React from 'react';
import { Search, Calendar, BarChart2, Clock } from 'lucide-react';
import { DateFilter, SortOrder, DurationFilter } from '../types';

interface SearchHeaderProps {
  query: string;
  setQuery: (val: string) => void;
  dateFilter: DateFilter;
  setDateFilter: (val: DateFilter) => void;
  sortOrder: SortOrder;
  setSortOrder: (val: SortOrder) => void;
  durationFilter: DurationFilter;
  setDurationFilter: (val: DurationFilter) => void;
  onSearch: () => void;
  loading: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  query,
  setQuery,
  dateFilter,
  setDateFilter,
  sortOrder,
  setSortOrder,
  durationFilter,
  setDurationFilter,
  onSearch,
  loading
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder="검색어를 입력하세요 (예: React 강의)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        {/* Search Button */}
        <button
          onClick={onSearch}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            '검색'
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {/* Date Filter */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>기간 필터</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '전체', value: 'all' },
              { label: '1개월', value: '1month' },
              { label: '3개월', value: '3months' },
              { label: '6개월', value: '6months' },
              { label: '1년', value: '1year' },
              { label: '5년', value: '5years' },
            ].map((option) => (
              <label key={option.value} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dateFilter"
                  value={option.value}
                  checked={dateFilter === option.value}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="sr-only peer"
                />
                <span className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600 peer-checked:bg-red-100 peer-checked:text-red-700 peer-checked:border-red-200 transition-all hover:bg-gray-50">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Duration Filter */}
        <div className="flex flex-col space-y-2">
           <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4" />
            <span>영상 길이 (Shorts/Long)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '전체', value: 'any' },
              { label: 'Shorts (4분↓)', value: 'short' },
              { label: '중간 (4~20분)', value: 'medium' },
              { label: 'Long (20분↑)', value: 'long' },
            ].map((option) => (
              <label key={option.value} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="durationFilter"
                  value={option.value}
                  checked={durationFilter === option.value}
                  onChange={(e) => setDurationFilter(e.target.value as DurationFilter)}
                  className="sr-only peer"
                />
                <span className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600 peer-checked:bg-purple-100 peer-checked:text-purple-700 peer-checked:border-purple-200 transition-all hover:bg-gray-50">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort Order */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <BarChart2 className="w-4 h-4" />
            <span>정렬 순서</span>
          </div>
          <div className="relative w-full md:w-48">
             <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="block w-full pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="date">최신순 (Date)</option>
              <option value="viewCount">조회순 (Views)</option>
              <option value="relevance">관련성 (Relevance)</option>
              <option value="rating">인기순 (Rating)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;