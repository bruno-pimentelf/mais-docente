'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { contentChunkToSlides } from '@/components/slidePresentationEditor/utils/fromStreamingApi';
import { generateSlidesStream } from '@/lib/slides-streaming-api';
import type { ContentChunk, SlideRequest } from '@/lib/slides-streaming-api';
import { defaultTheme } from '@/components/slidePresentationEditor/utils/themes/slide-themes';
import type { SlideTheme } from '@/components/slidePresentationEditor/utils/types/slide-theme.types';

const PENDING_KEY = 'mais-docente-pending-generation';
const GENERATED_KEY = 'mais-docente-generated-slides';

function EditorSkeleton({ message = 'Preparando editor' }: { message?: string }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-white">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex flex-col w-64 min-w-64 h-screen bg-gray-50/50">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="h-3 w-12 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-3 w-4 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="flex-1 p-3 space-y-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full aspect-video rounded-xl bg-gray-200/60 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 flex flex-col items-center justify-center relative">
        {/* Toolbar skeleton */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 ml-32">
          <div className="flex items-center gap-3 rounded-full bg-white/60 backdrop-blur-sm px-4 py-3 border border-gray-200/40">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div
                key={i}
                className="size-11 rounded-full bg-gray-200/60 animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Slide skeleton */}
        <div className="relative mt-12">
          <div
            className="w-[800px] max-w-[90vw] aspect-video rounded-lg bg-white border border-gray-200/60 shadow-lg overflow-hidden"
          >
            <div className="h-full w-full flex flex-col items-center justify-center gap-6 p-12">
              {/* Title placeholder */}
              <div className="h-6 w-2/3 rounded-full bg-gray-100 animate-pulse" />
              {/* Subtitle placeholder */}
              <div className="h-4 w-1/2 rounded-full bg-gray-100 animate-pulse" style={{ animationDelay: '100ms' }} />
              {/* Content placeholders */}
              <div className="w-full space-y-3 mt-8">
                <div className="h-3 w-full rounded-full bg-gray-100 animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="h-3 w-5/6 rounded-full bg-gray-100 animate-pulse" style={{ animationDelay: '200ms' }} />
                <div className="h-3 w-4/6 rounded-full bg-gray-100 animate-pulse" style={{ animationDelay: '250ms' }} />
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="size-10 rounded-full border-2 border-gray-200" />
                <div className="absolute inset-0 size-10 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
              </div>
              <span className="text-sm font-medium text-gray-500">{message}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const SlidePresentationEditor = dynamic(
  () => import('@/components/slidePresentationEditor'),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  }
);

export default function EditorSlidesPage() {
  const [ready, setReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Preparando editor');
  const setSlidesFromGenerated = useSlidePresentationEditorStore(
    (s) => s.setSlidesFromGenerated
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pendingRaw = sessionStorage.getItem(PENDING_KEY);
    if (pendingRaw) {
      sessionStorage.removeItem(PENDING_KEY);
      let body: SlideRequest;
      try {
        body = JSON.parse(pendingRaw) as SlideRequest;
      } catch {
        setReady(true);
        return;
      }
      if (!body.category || !body.description || !body.locale || body.slidesNumber == null) {
        setReady(true);
        return;
      }
      setReady(false);
      setStatusMessage('Conectando...');
      let cancelled = false;

      generateSlidesStream(body, {
        onStructure: () => {
          if (!cancelled) setStatusMessage('Gerando estrutura...');
        },
        onSlideContent: (chunk) => {
          if (!cancelled) setStatusMessage(`Gerando slide ${chunk.slide_number}...`);
        },
        onContent: async (chunk) => {
          if (cancelled) return;
          try {
            const theme = defaultTheme as SlideTheme;
            const logoPath = useSlidePresentationEditorStore.getState().logo_path;
            const slides = await contentChunkToSlides(chunk, theme, logoPath);
            if (cancelled) return;
            setSlidesFromGenerated({
              slides,
              title: typeof chunk.presentation_info?.title === 'string'
                ? chunk.presentation_info.title
                : undefined,
            });
          } catch (_e) {
            // fallback: editor abre vazio
          } finally {
            if (!cancelled) setReady(true);
          }
        },
        onError: () => {
          if (!cancelled) setReady(true);
        },
      }).catch(() => {
        if (!cancelled) setReady(true);
      });

      return () => {
        cancelled = true;
      };
    }

    const generatedRaw = sessionStorage.getItem(GENERATED_KEY);
    if (generatedRaw) {
      let cancelled = false;
      (async () => {
        try {
          const content = JSON.parse(generatedRaw) as ContentChunk;
          if (
            !content ||
            content.type !== 'content' ||
            !Array.isArray(content.entire_slide_content)
          ) {
            sessionStorage.removeItem(GENERATED_KEY);
            if (!cancelled) setReady(true);
            return;
          }
          const theme = (defaultTheme as SlideTheme) ?? undefined;
          const logoPath = useSlidePresentationEditorStore.getState().logo_path;
          const slides = await contentChunkToSlides(content, theme, logoPath);
          if (cancelled) return;
          setSlidesFromGenerated({
            slides,
            title: typeof content.presentation_info?.title === 'string'
              ? content.presentation_info.title
              : undefined,
          });
          sessionStorage.removeItem(GENERATED_KEY);
        } catch (_e) {
          sessionStorage.removeItem(GENERATED_KEY);
        } finally {
          if (!cancelled) setReady(true);
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    setReady(true);
  }, [setSlidesFromGenerated]);

  if (!ready) {
    return <EditorSkeleton message={statusMessage} />;
  }
  return <SlidePresentationEditor />;
}
