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
          className="group relative w-full cursor-pointer overflow-hidden rounded-xl ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-md transition-all duration-200"
          style={{
            height: scaledHeight || 120,
          }}
        >
          {/* Numero do slide */}
          <div className="absolute top-2 left-2 z-10 flex items-center justify-center size-6 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
            {slideNumber}
          </div>

          <div className="relative size-full overflow-hidden bg-gray-50">
            <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent bg-[length:200%_100%]" />
            <div className="relative flex h-full flex-col justify-center items-center p-4">
              <div className="space-y-2 w-full px-4">
                <div className="h-2 w-3/4 rounded-full bg-gray-200" />
                <div className="h-2 w-1/2 rounded-full bg-gray-200" />
                <div className="h-2 w-2/3 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>

          {/* Overlay no hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
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
        className={`
          group relative w-full overflow-hidden rounded-xl
          transition-all duration-200 ease-out
          ${isSlideSelected
            ? 'ring-2 ring-blue-500 ring-offset-1 shadow-sm scale-[1.01]'
            : 'ring-1 ring-gray-200/80 hover:ring-gray-300 hover:shadow-sm'
          }
        `}
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
        {/* Numero do slide - minimalista */}
        <div className={`
          absolute top-2 left-2 z-10
          flex items-center justify-center
          size-6 rounded-full text-xs font-medium
          transition-all duration-200
          ${isSlideSelected
            ? 'bg-blue-500 text-white'
            : 'bg-black/50 text-white backdrop-blur-sm'
          }
        `}>
          {slideNumber}
        </div>

        {/* Preview do slide */}
        <div className="relative size-full overflow-hidden bg-white">
          {scale && (
            <PureSlideRenderer
              slide={slide}
              scale={scale}
              className="absolute top-0 left-0"
            />
          )}
        </div>

        {/* Overlay no hover */}
        <div className={`
          absolute inset-0 bg-black/0 transition-colors duration-200
          ${!isSlideSelected ? 'group-hover:bg-black/5' : ''}
        `} />
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
