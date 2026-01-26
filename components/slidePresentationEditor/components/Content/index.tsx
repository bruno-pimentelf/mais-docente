import { memo, useEffect, useRef } from 'react';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useShallow } from 'zustand/react/shallow';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import ElementsSlide from './Slide/variants/ElementsSlide';

type Props = {
  isViewOnly?: boolean;
};

const Content = memo(function Content({
  isViewOnly = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const selectedSlide = useSlidePresentationEditorStore(
    useShallow((state) => {
      const id = state.selectedSlide;
      return id ? state.slides.find((s) => s.id === id) ?? null : null;
    })
  );
  const setSlideScalingDelta = useSlideEditorLayoutStore((s) => s.setSlideScalingDelta);

  useEffect(() => {
    if (!ref.current || !selectedSlide?.themeSettings) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry || !selectedSlide?.themeSettings) return;
      const { width, height } = entry.contentRect;
      const { width: sw, height: sh } = selectedSlide.themeSettings;
      // Deixa uma margem para o slide respirar na tela
      const padding = 120;
      const availableWidth = width - padding;
      const availableHeight = height - padding;
      const s = Math.min(availableWidth / sw, availableHeight / sh, 1);
      setSlideScalingDelta(s);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [selectedSlide?.themeSettings, setSlideScalingDelta]);

  return (
    <main
      className="relative flex flex-1 flex-col overflow-hidden"
      style={{ colorScheme: 'light' }}
    >
      {/* Area de visualizacao do slide - centralizada */}
      <div
        ref={ref}
        className="flex flex-1 items-center justify-center overflow-auto pt-24 pb-8 px-8"
      >
        {selectedSlide ? (
          <div className="relative">
            {/* Sombra elegante atras do slide */}
            <div
              className="absolute inset-0 rounded-2xl bg-black/5 blur-2xl scale-105 -z-10"
              aria-hidden
            />
            {/* Container do slide com borda sutil */}
            <div className="rounded-lg overflow-hidden shadow-2xl ring-1 ring-black/5">
              <ElementsSlide
                slideUuid={selectedSlide.id}
                isViewOnly={isViewOnly}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <div className="w-64 h-40 rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <span className="text-sm">Nenhum slide</span>
            </div>
            <span className="text-sm">Selecione um slide para editar</span>
          </div>
        )}
      </div>
    </main>
  );
});

export default Content;
