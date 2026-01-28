'use client';

import { useState, useCallback } from 'react';
import { Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import { QRCodeSVG } from 'qrcode.react';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import type { SlideInteractiveMultipleChoice } from '../../../../../types';
import { cn } from '@/lib/utils';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const OPTION_STYLES: Record<
  number,
  { card: string; badge: string; border: string }
> = {
  0: { card: 'bg-[#EDF2FF]', badge: 'bg-[#3255BF]', border: 'border-[#3255BF]/50' },
  1: { card: 'bg-[#E8F5E9]', badge: 'bg-[#2E7D32]', border: 'border-[#2E7D32]/50' },
  2: { card: 'bg-[#FFF8E1]', badge: 'bg-[#F9A825]', border: 'border-[#F9A825]/50' },
  3: { card: 'bg-[#FFEDE0]', badge: 'bg-[#FA7942]', border: 'border-[#FA7942]/50' },
};

function getOptionStyle(i: number) {
  return OPTION_STYLES[i] ?? OPTION_STYLES[0];
}

type Props = {
  slideUuid: string;
  element: SlideInteractiveMultipleChoice;
  viewOnly?: boolean;
  onOpenOptions?: () => void;
};

export default function InteractiveMultipleChoice({
  slideUuid,
  element,
  viewOnly = true,
  onOpenOptions,
}: Props) {
  void slideUuid;
  const slideScalingDelta = useSlideEditorLayoutStore((s) => s.slideScalingDelta);
  const openSidebar = useSlideEditorLayoutStore((s) => s.openSidebar);
  const quizSidebarActiveTab = useSlideEditorLayoutStore(
    (s) => s.quizSidebarActiveTab
  );
  const quizQrCodeUrl = useSlideEditorLayoutStore((s) => s.quizQrCodeUrl);

  const x = (element?.x ?? 0) * slideScalingDelta;
  const y = (element?.y ?? 0) * slideScalingDelta;
  const width = (element?.width ?? 1920) * slideScalingDelta;
  const height = (element?.height ?? 1080) * slideScalingDelta;

  const alternatives = element?.alternatives ?? [];
  const hasImage = Boolean(element?.image?.trim());
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const isEditable = !viewOnly && Boolean(onOpenOptions);
  const isQuizSidebarOpen = openSidebar === 'quiz';
  const displayQrUrl = quizQrCodeUrl.trim() || 'https://mais-docente.app';

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (img.naturalWidth && img.naturalHeight) {
        setImageAspect(img.naturalWidth / img.naturalHeight);
      }
    },
    []
  );

  const effectiveAspect = hasImage ? imageAspect : null;

  type SlideMode = 'editar' | 'respostas' | 'qrcode';
  const slideMode: SlideMode =
    viewOnly || !isQuizSidebarOpen
      ? 'editar'
      : (quizSidebarActiveTab as SlideMode);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!isEditable || !onOpenOptions) return;
    e.stopPropagation();
    e.preventDefault();
    onOpenOptions();
  };

  const baseContainerProps = {
    style: {
      width,
      minHeight: height,
      pointerEvents: (viewOnly ? 'none' : 'auto') as 'none' | 'auto',
    },
  };

  if (slideMode === 'qrcode') {
    const qrSize = Math.min(width * 0.38, 380);
    return (
      <Group x={x} y={y}>
        <Html>
          <div
            {...baseContainerProps}
            className="flex flex-col items-center justify-center rounded-2xl bg-linear-to-br from-gray-50 to-white p-10"
          >
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-gray-200/80 bg-white px-12 py-12 shadow-sm">
              <QRCodeSVG
                value={displayQrUrl}
                size={qrSize}
                level="M"
                marginSize={2}
                bgColor="#ffffff"
                fgColor="#111827"
                className="rounded-xl"
              />
              <p className="max-w-full truncate text-center text-sm font-medium text-gray-500">
                Escaneie para acessar
              </p>
            </div>
          </div>
        </Html>
      </Group>
    );
  }

  const showRespostas = slideMode === 'respostas';
  const hasLeftVisual = hasImage;
  const contentWidthClass = hasLeftVisual ? 'min-w-0 flex-1' : 'w-full';
  const maxImageWidth = width * 0.42;
  let imagePanelWidth = maxImageWidth;
  let imagePanelHeight = height;
  if (hasImage && effectiveAspect != null && effectiveAspect > 0) {
    const byHeight = height * effectiveAspect;
    if (byHeight <= maxImageWidth) {
      imagePanelWidth = byHeight;
      imagePanelHeight = height;
    } else {
      imagePanelWidth = maxImageWidth;
      imagePanelHeight = maxImageWidth / effectiveAspect;
    }
  }

  return (
    <Group x={x} y={y}>
      <Html>
        <div
          role={isEditable && !showRespostas ? 'button' : undefined}
          tabIndex={isEditable && !showRespostas ? 0 : undefined}
          onClick={handleContainerClick}
          onKeyDown={(e) => {
            if (
              isEditable &&
              !showRespostas &&
              onOpenOptions &&
              (e.key === 'Enter' || e.key === ' ')
            ) {
              e.preventDefault();
              e.stopPropagation();
              onOpenOptions();
            }
          }}
          className={cn(
            'flex min-h-full w-full overflow-hidden rounded-2xl bg-white shadow-sm',
            hasLeftVisual ? 'flex-row' : 'flex-col',
            isEditable && !showRespostas
              ? 'cursor-pointer border-2 border-blue-200/80 transition-all hover:border-blue-300 hover:shadow-md'
              : 'border border-gray-200/70'
          )}
          {...baseContainerProps}
        >
          {hasLeftVisual && (
            <div
              className="flex shrink-0 items-center justify-center self-center overflow-hidden rounded-l-2xl bg-gray-100 ring-1 ring-inset ring-gray-200/60"
              style={{
                width: imagePanelWidth,
                height: imagePanelHeight,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={element!.image!}
                alt="Quiz"
                className="h-full w-full object-contain"
                onLoad={onImageLoad}
              />
            </div>
          )}

          <div
            className={cn(
              'flex flex-1 flex-col justify-center gap-8 px-12 py-10',
              contentWidthClass,
              hasLeftVisual && 'min-w-0'
            )}
          >
            <div>
              <p
                className={cn(
                  'font-quicksand font-bold leading-snug text-gray-900',
                  hasLeftVisual ? 'text-[1.5rem]' : 'text-[1.85rem]'
                )}
              >
                {element?.question?.trim() || (
                  <span className="italic text-gray-400">Pergunta</span>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {alternatives.map((opt, i) => {
                const style = getOptionStyle(i);
                const isCorrect = opt.isAnswer;

                if (showRespostas) {
                  return (
                    <div
                      key={opt.id}
                      className={cn(
                        'flex items-center gap-5 rounded-xl border-2 py-4 px-6 transition-all',
                        style.card,
                        isCorrect
                          ? 'border-emerald-400 ring-2 ring-emerald-200/60'
                          : 'border-transparent opacity-80'
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-sm',
                          style.badge
                        )}
                      >
                        {OPTION_LETTERS[i] ?? ''}
                      </div>
                      <span
                        className={cn(
                          'flex-1 text-[1.05rem] font-medium',
                          isCorrect ? 'text-gray-900' : 'text-gray-600'
                        )}
                      >
                        {opt.text || '—'}
                      </span>
                      {isCorrect && (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          ✓ Correta
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={opt.id}
                    className={cn(
                      'flex items-center gap-5 rounded-xl border-2 py-4 px-6 transition-colors',
                      style.card,
                      'border-transparent'
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-sm',
                        style.badge
                      )}
                    >
                      {OPTION_LETTERS[i] ?? ''}
                    </div>
                    <span className="flex-1 text-[1.05rem] font-medium text-gray-900">
                      {opt.text || (
                        <span className="italic text-gray-400">Opção</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {isEditable && !showRespostas && (
              <p className="text-xs font-medium text-gray-400">
                Clique para editar no painel →
              </p>
            )}
          </div>
        </div>
      </Html>
    </Group>
  );
}
