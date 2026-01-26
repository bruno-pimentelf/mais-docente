'use client';

import dynamic from 'next/dynamic';

const SlidePresentationEditor = dynamic(
  () => import('@/components/slidePresentationEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
          <span className="text-sm text-gray-500">Carregando editor...</span>
        </div>
      </div>
    ),
  }
);

export default function EditorSlidesPage() {
  return <SlidePresentationEditor />;
}
