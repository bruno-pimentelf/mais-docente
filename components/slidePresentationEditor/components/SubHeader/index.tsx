'use client';

import { Undo2, Redo2, Palette, ListChecks } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import useMediaQuery from '../../hooks/useMediaQuery';
import TopbarElementsMenu from './TopbarElementsMenu';
import { SlideVariants } from '../../types';

type SubHeaderProps = {
  isPreview: boolean;
  isViewOnly?: boolean;
  hideHeader?: boolean;
  handleMobileShapeClick?: () => void;
};

const SubHeader = ({
  hideHeader,
  isPreview,
  isViewOnly,
  handleMobileShapeClick,
}: SubHeaderProps) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isPresentationMode = useSlideEditorLayoutStore((s) => s.isPresenting);
  const setSubHeaderHeight = useSlideEditorLayoutStore((s) => s.setSubHeaderHeight);
  const setSlideSidebar = useSlideEditorLayoutStore((s) => s.setSlideSidebar);
  const openSidebar = useSlideEditorLayoutStore((s) => s.openSidebar);
  const selectedSlide = useSlidePresentationEditorStore((s) =>
    s.slides.find((slide) => slide.id === s.selectedSlide)
  );
  const isQuizSlide = selectedSlide?.variant === SlideVariants.INTERACTIVE_MULTIPLE_CHOICE;

  const { undo, redo, pastStates, futureStates } =
    useSlidePresentationEditorStore.temporal.getState();
  const isUndoEnabled = pastStates.length > 0;
  const isRedoEnabled = futureStates.length > 0;

  const showHeader = !isPresentationMode && !isPreview && !isViewOnly && !isMobile;
  const subHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showHeader || hideHeader) {
      setSubHeaderHeight(0);
      return;
    }
    const el = subHeaderRef.current;
    if (el) setSubHeaderHeight(el.clientHeight);
    const ro = new ResizeObserver(() => {
      if (subHeaderRef.current) setSubHeaderHeight(subHeaderRef.current.clientHeight);
    });
    if (el) ro.observe(el);
    return () => {
      ro.disconnect();
      setSubHeaderHeight(0);
    };
  }, [showHeader, hideHeader, setSubHeaderHeight]);

  if (!showHeader || hideHeader) return null;

  return (
    <div
      ref={subHeaderRef}
      className={`flex h-[52px] w-full flex-row items-center gap-2 border-b border-[#f3f4f6] bg-[#ffffff] px-4 ${hideHeader ? 'md:invisible' : ''}`}
      style={{ colorScheme: 'light' }}
    >
      <button
        type="button"
        onClick={() => undo()}
        disabled={!isUndoEnabled}
        className="flex size-8 items-center justify-center rounded transition-colors hover:bg-[#f3f4f6] disabled:opacity-50 text-[#111827]"
        title="Desfazer"
      >
        <Undo2 className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => redo()}
        disabled={!isRedoEnabled}
        className="flex size-8 items-center justify-center rounded transition-colors hover:bg-[#f3f4f6] disabled:opacity-50 text-[#111827]"
        title="Refazer"
      >
        <Redo2 className="size-4" />
      </button>
      <div className="mx-2 h-6 w-px bg-[#e5e7eb]" />
      <button
        type="button"
        onClick={() => setSlideSidebar(openSidebar === 'theme' ? null : 'theme')}
        className={`flex size-8 items-center justify-center rounded transition-colors hover:bg-[#f3f4f6] ${openSidebar === 'theme' ? 'bg-[#dbeafe] text-[#2563eb]' : 'text-[#111827]'}`}
        title="Temas"
      >
        <Palette className="size-4" />
      </button>
      {isQuizSlide && (
        <button
          type="button"
          onClick={() => setSlideSidebar(openSidebar === 'quiz' ? null : 'quiz')}
          className={`flex size-8 items-center justify-center rounded transition-colors hover:bg-[#f3f4f6] ${openSidebar === 'quiz' ? 'bg-[#dbeafe] text-[#2563eb]' : 'text-[#111827]'}`}
          title="Editar quiz"
        >
          <ListChecks className="size-4" />
        </button>
      )}
      <div className="mx-2 h-6 w-px bg-[#e5e7eb]" />
      <TopbarElementsMenu
        isPreview={isPreview}
        isViewOnly={isViewOnly}
        handleMobileShapeClick={handleMobileShapeClick}
      />
    </div>
  );
};

export default SubHeader;
