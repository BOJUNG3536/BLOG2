import React, { useState } from 'react';
import { Key, Save, Youtube } from 'lucide-react';

interface SidebarProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ apiKey, setApiKey }) => {
  const [inputValue, setInputValue] = useState(apiKey);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (inputValue.trim()) {
      setApiKey(inputValue.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <aside className="w-full md:w-80 bg-slate-900 text-white flex flex-col h-auto md:h-screen md:fixed md:left-0 md:top-0 shadow-xl z-20">
      <div className="p-6 border-b border-slate-700 flex items-center space-x-3">
        <Youtube className="w-8 h-8 text-red-500" />
        <h1 className="text-xl font-bold tracking-tight">YT Dashboard</h1>
      </div>

      <div className="p-6 flex-1">
        <div className="mb-6">
          <label className="block text-slate-400 text-sm font-medium mb-2" htmlFor="apiKey">
            YouTube Data API Key
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-4 w-4 text-slate-500" />
            </div>
            <input
              id="apiKey"
              type="password"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block pl-10 p-2.5 placeholder-slate-500"
              placeholder="API Key 입력"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            검색을 수행하려면 유효한 API 키가 필요합니다.
          </p>
        </div>

        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 ${
            isSaved 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? '저장됨' : 'API Key 저장'}</span>
        </button>

        <div className="mt-8 border-t border-slate-700 pt-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">안내</h3>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li>일일 할당량(Quota)을 확인하세요.</li>
            <li>키는 브라우저 메모리에만 저장됩니다.</li>
            <li>영상 상세 정보 조회를 위해 검색 1회당 2 단위의 쿼터가 소모될 수 있습니다.</li>
          </ul>
        </div>
      </div>
      
      <div className="p-4 bg-slate-950 text-center text-xs text-slate-500">
        &copy; 2024 YouTube Dash
      </div>
    </aside>
  );
};

export default Sidebar;
