'use client';

import React from 'react';
import DramaGameComponent from '@/components/DramaGameComponent.jsx';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto pt-8 pb-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4">
              <h2 className="text-lg font-semibold">剧情织造机 (Text Game Weaver) V1.3.20</h2>
              <p className="text-sm opacity-90 mt-1">交互式剧情游戏编辑器 - 完整功能预览</p>
            </div>
            
            <div className="p-0">
              <div className="border-t">
                <DramaGameComponent />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            剧情游戏编辑器预览界面 | 基于 Next.js 构建
          </p>
        </div>
      </footer>
    </div>
  );
}