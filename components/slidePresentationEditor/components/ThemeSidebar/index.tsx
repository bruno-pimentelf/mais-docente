'use client';

import { XMarkIcon } from '@heroicons/react/24/solid';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import {
  slideThemes,
} from '@/components/slidePresentationEditor/utils/themes/slide-themes';
import type { SlideTheme } from '@/components/slidePresentationEditor/utils/types/slide-theme.types';
import { CoverSlideFactory } from '@/components/slidePresentationEditor/utils/factories/cover-slide.factory';
import PureSlideRenderer from '../Content/Slide/variants/PureSlideRenderer';

const DEFAULT_LOGO = '/images/icons/mais-docente-logo.svg';
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
      className={`
        group flex w-full flex-col overflow-hidden rounded-xl text-left cursor-pointer
        transition-all duration-200 ease-out
        ${isActive
          ? 'ring-2 ring-blue-500 ring-offset-1 shadow-sm'
          : 'ring-1 ring-gray-200/80 hover:ring-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-gray-100">
        <PureSlideRenderer
          slide={previewSlide}
          scale={PREVIEW_SCALE}
          className="shrink-0"
        />
        {isActive && (
          <div className="absolute inset-0 bg-blue-500/10" />
        )}
      </div>
      <div className="px-3 py-2 bg-white">
        <span className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
          {theme.name}
        </span>
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
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed right-0 top-0 z-40 flex h-screen w-80 flex-col bg-white/95 backdrop-blur-md shadow-lg border-l border-gray-200/60"
      style={{ colorScheme: 'light' }}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Temas</h2>
        <button
          type="button"
          onClick={handleClose}
          className="flex size-8 items-center justify-center rounded-full transition-all hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer"
          aria-label="Fechar"
        >
          <XMarkIcon className="size-5" />
        </button>
      </div>
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent',
        }}
      >
        <div className="grid grid-cols-1 gap-4">
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
    </motion.aside>
  );
}
