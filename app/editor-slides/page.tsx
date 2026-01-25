'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const SlidePresentationEditor = dynamic(
  () => import('@/components/slidePresentationEditor'),
  { ssr: false, loading: () => <div className="flex h-screen items-center justify-center">Carregando editor...</div> }
);

export default function EditorSlidesPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col">
      <SlidePresentationEditor onBack={() => router.back()} />
    </div>
  );
}
