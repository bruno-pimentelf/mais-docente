import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { memo, useEffect, useRef, useState } from 'react';
import PureSlideRenderer from '../Content/Slide/variants/PureSlideRenderer';
import SlideOptionsContextMenu from '../ContextMenu/SlideOptions';
import { useShallow } from 'zustand/react/shallow';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';

export const SlidePreview = memo(function SlidePreviewMemo({
  slideUuid,
  disableContextMenu,
  disableClick,
  onSlideClick,
  performanceMode = false,
}: SlidePreviewProps) {
  const removeSlide = useSlidePresentationEditorStore(
    (state) => state.removeSlide
  );
  const setSelectedSlide = useSlidePresentationEditorStore(
    (state) => state.setSelectedSlide
  );
  const isSlideSelected = useSlidePresentationEditorStore(
    (state) => state.selectedSlide === slideUuid
  );
  const slideNumber = useSlidePresentationEditorStore(
    (state) => state.slides.findIndex((slide) => slide.id === slideUuid) + 1
  );
  const numSlides = useSlidePresentationEditorStore(
    (state) => state.slides.length
  );
  const slide = useSlidePresentationEditorStore(
    useShallow((state) => state.slides.find((slide) => slide.id === slideUuid))
  );
  const lastActiveSlide = useSlidePresentationEditorStore(
    (state) => state.lastAddedSlideId
  );

  const contextMenu = useSlideEditorLayoutStore((state) => state.contextMenu);
  const openContextMenu = useSlideEditorLayoutStore(
    (state) => state.openContextMenu
  );

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    openContextMenu({
      activeElementUuid: slideUuid,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const isContextMenuOpen =
    contextMenu &&
    contextMenu.visible &&
    contextMenu.activeElementUuid === slideUuid;

  const handleClick = () => {
    if (!isSlideSelected) {
      setSelectedSlide(slideUuid);
    } else {
      onSlideClick?.();
    }
    ref.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disableClick) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (numSlides > 1) {
        e.preventDefault();
        e.stopPropagation();
        removeSlide(slideUuid);
      }
    }
  };

  const [scale, setScale] = useState<number | undefined>(undefined);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(
    undefined
  );
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && slide?.themeSettings) {
      const resizeObserver = new ResizeObserver((entries) => {
        const { width } = entries[0].contentRect;
        const { width: slideWidth } = slide.themeSettings;
        const scale = width / slideWidth;
        setScale(scale);
        setScaledHeight(slide.themeSettings.height * scale);
      });
      resizeObserver.observe(ref.current);
      return () => resizeObserver.disconnect();
    }
  }, [slide?.themeSettings]);

  const isLastActiveSlide = lastActiveSlide === slideUuid;
  useEffect(() => {
    if (isLastActiveSlide && ref.current) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isLastActiveSlide]);

  if (!slide) {
    return null;
  }

  if (!isSlideSelected && performanceMode) {
    return (
      <>
        <div
          onContextMenu={disableContextMenu ? undefined : handleContextMenu}
          onClick={disableClick ? undefined : handleClick}
          ref={ref}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="relative w-full cursor-pointer overflow-hidden rounded-[12px] border-2 border-gray-300 p-1 transition-all duration-200"
          style={{
            height: scaledHeight || 120,
          }}
        >
          <div className="relative size-full overflow-hidden rounded-[8px] bg-gray-100">
            <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent bg-[length:200%_100%]" />
            <div className="relative flex h-full flex-col justify-between p-4">
              <div className="absolute left-2 top-2 rounded bg-gray-300 px-2 py-1 text-xs font-medium text-gray-600">
                {slideNumber}
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-3 w-3/4 rounded bg-gray-300" />
                <div className="h-3 w-1/2 rounded bg-gray-300" />
                <div className="h-3 w-2/3 rounded bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
        {isContextMenuOpen && <SlideOptionsContextMenu />}
      </>
    );
  }

  return (
    <>
      <div
        onContextMenu={disableContextMenu ? undefined : handleContextMenu}
        onClick={
          disableClick
            ? undefined
            : (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClick();
              }
        }
        onMouseDownCapture={undefined}
        ref={ref}
        className={`relative w-full ${isSlideSelected ? 'border-2 border-blue-600 shadow-md' : 'border-2 border-gray-300'} cursor-pointer overflow-hidden rounded-[12px] p-1 transition-all duration-200`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{
          height: scaledHeight,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          cursor: 'grab',
        }}
      >
        <div className="relative size-full overflow-hidden rounded-[8px]">
          {scale && (
            <PureSlideRenderer
              slide={slide}
              scale={scale}
              className="absolute top-0 left-0"
            />
          )}
        </div>
      </div>
      {isContextMenuOpen && <SlideOptionsContextMenu />}
    </>
  );
});

SlidePreview.displayName = 'SlidePreview';

type SlidePreviewProps = {
  slideUuid: string;
  disableContextMenu?: boolean;
  disableClick?: boolean;
  onSlideClick?: () => void;
  performanceMode?: boolean;
};
