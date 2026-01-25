'use client';

import { Undo2, Redo2, Palette } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import useMediaQuery from '../../hooks/useMediaQuery';
import TopbarElementsMenu from './TopbarElementsMenu';

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
      className={`flex h-[52px] w-full flex-row items-center gap-2 border-b border-gray-100 bg-white px-4 ${hideHeader ? 'md:invisible' : ''}`}
    >
      <button
        type="button"
        onClick={() => undo()}
        disabled={!isUndoEnabled}
        className="flex size-8 items-center justify-center rounded transition-colors hover:bg-gray-100 disabled:opacity-50"
        title="Desfazer"
      >
        <Undo2 className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => redo()}
        disabled={!isRedoEnabled}
        className="flex size-8 items-center justify-center rounded transition-colors hover:bg-gray-100 disabled:opacity-50"
        title="Refazer"
      >
        <Redo2 className="size-4" />
      </button>
      <div className="mx-2 h-6 w-px bg-gray-200" />
      <button
        type="button"
        onClick={() => setSlideSidebar(openSidebar === 'theme' ? null : 'theme')}
        className={`flex size-8 items-center justify-center rounded transition-colors hover:bg-gray-100 ${openSidebar === 'theme' ? 'bg-blue-100 text-blue-600' : ''}`}
        title="Temas"
      >
        <Palette className="size-4" />
      </button>
      <div className="mx-2 h-6 w-px bg-gray-200" />
      <TopbarElementsMenu
        isPreview={isPreview}
        isViewOnly={isViewOnly}
        handleMobileShapeClick={handleMobileShapeClick}
      />
    </div>
  );
};

export default SubHeader;
