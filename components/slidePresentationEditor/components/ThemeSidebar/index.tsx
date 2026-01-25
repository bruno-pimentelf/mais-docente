'use client';

import { XMarkIcon } from '@heroicons/react/24/solid';
import { useMemo } from 'react';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import {
  slideThemes,
} from '@/components/slidePresentationEditor/utils/themes/slide-themes';
import type { SlideTheme } from '@/components/slidePresentationEditor/utils/types/slide-theme.types';
import { CoverSlideFactory } from '@/components/slidePresentationEditor/utils/factories/cover-slide.factory';
import PureSlideRenderer from '../Content/Slide/variants/PureSlideRenderer';

const DEFAULT_LOGO = '/images/icons/lara-icon-talk.svg';
const PREVIEW_SCALE = 180 / 1920;

const themesList: SlideTheme[] = Object.values(slideThemes);

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: SlideTheme;
  isActive: boolean;
  onSelect: () => void;
}) {
  const previewSlide = useMemo(() => {
    const factory = new CoverSlideFactory(theme.cover);
    return factory.create({
      title: theme.name,
      subtitle: '',
      logo_path: theme.logo_path ?? DEFAULT_LOGO,
      slideOrder: 0,
    });
  }, [theme]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col overflow-hidden rounded-lg border-2 text-left transition-colors ${
        isActive
          ? 'border-blue-500 bg-blue-50/50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-gray-100">
        <PureSlideRenderer
          slide={previewSlide}
          scale={PREVIEW_SCALE}
          className="shrink-0"
        />
      </div>
      <div className="px-2 py-1.5">
        <span className="text-sm font-medium text-gray-900">{theme.name}</span>
      </div>
    </button>
  );
}

type ThemeSidebarProps = {
  onClose?: () => void;
};

export default function ThemeSidebar({ onClose }: ThemeSidebarProps) {
  const closeSlideSidebar = useSlideEditorLayoutStore((s) => s.closeSlideSidebar);
  const applyThemeToAllSlides = useSlidePresentationEditorStore(
    (s) => s.applyThemeToAllSlides
  );
  const currentTheme = useSlidePresentationEditorStore((s) => s.currentTheme);

  const handleClose = () => {
    onClose?.();
    closeSlideSidebar();
  };

  const handleSelectTheme = (theme: SlideTheme) => {
    applyThemeToAllSlides(theme);
    handleClose();
  };

  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col border-l border-gray-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-900">Temas</h2>
        <button
          type="button"
          onClick={handleClose}
          className="flex size-8 items-center justify-center rounded transition-colors hover:bg-gray-100"
          aria-label="Fechar"
        >
          <XMarkIcon className="size-5 text-gray-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-1 gap-3">
          {themesList.map((theme) => (
            <ThemeCard
              key={theme.name}
              theme={theme}
              isActive={currentTheme?.name === theme.name}
              onSelect={() => handleSelectTheme(theme)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
