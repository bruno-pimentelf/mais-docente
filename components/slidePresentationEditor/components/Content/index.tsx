import { memo, useEffect, useRef } from 'react';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useShallow } from 'zustand/react/shallow';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import ElementsSlide from './Slide/variants/ElementsSlide';
import SubHeader from '../SubHeader';

type Props = {
  hideHeader?: boolean;
  showPreviewSidebar?: boolean;
  isViewOnly?: boolean;
};

const Content = memo(function Content({
  hideHeader = false,
  showPreviewSidebar = true,
  isViewOnly = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const selectedSlide = useSlidePresentationEditorStore(
    useShallow((state) => {
      const id = state.selectedSlide;
      return id ? state.slides.find((s) => s.id === id) ?? null : null;
    })
  );
  const headerBarHeight = useSlideEditorLayoutStore((s) => s.headerBarHeight);
  const subHeaderHeight = useSlideEditorLayoutStore((s) => s.subHeaderHeight);
  const setSlideScalingDelta = useSlideEditorLayoutStore((s) => s.setSlideScalingDelta);

  useEffect(() => {
    if (!ref.current || !selectedSlide?.themeSettings) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry || !selectedSlide?.themeSettings) return;
      const { width, height } = entry.contentRect;
      const { width: sw, height: sh } = selectedSlide.themeSettings;
      const s = Math.min(width / sw, height / sh, 1);
      setSlideScalingDelta(s);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [selectedSlide?.themeSettings, setSlideScalingDelta]);

  return (
    <main
      className="flex flex-1 flex-col overflow-hidden bg-[#f9fafb]"
      style={{ colorScheme: 'light' }}
    >
      <SubHeader isPreview={false} isViewOnly={isViewOnly} hideHeader={hideHeader} />

      <div
        ref={ref}
        className="flex flex-1 items-center justify-center overflow-auto"
        style={{
          minHeight: `calc(100vh - ${headerBarHeight}px - ${subHeaderHeight}px - 58px)`,
        }}
      >
        {selectedSlide ? (
          <div className="relative">
            <ElementsSlide
              slideUuid={selectedSlide.id}
              isViewOnly={isViewOnly}
            />
          </div>
        ) : (
          <div className="text-[#6b7280] font-quicksand text-lg">
            Nenhum slide selecionado
          </div>
        )}
      </div>
    </main>
  );
});

export default Content;
