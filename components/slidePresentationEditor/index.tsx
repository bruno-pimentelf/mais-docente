import { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Content from './components/Content';
import LeftSidebar from './components/LeftSidebar';
import SlideTypeSelector from './components/SlideTypeSelector';
import ThemeSidebar from './components/ThemeSidebar';
import FloatingToolbar from './components/FloatingToolbar';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';

type Props = {
  onBack?: () => void;
  isViewOnly?: boolean;
  showPreviewSidebar?: boolean;
};

export default function SlidePresentationEditor({
  isViewOnly = false,
  showPreviewSidebar = true,
}: Props) {
  const slides = useSlidePresentationEditorStore((state) => state.slides);
  const addSlideAtPosition = useSlidePresentationEditorStore(
    (state) => state.addSlideAtPosition
  );
  const isCreateWithAiOpen = useSlideEditorLayoutStore(
    (state) => state.createWithAi.isOpen
  );
  const openSidebar = useSlideEditorLayoutStore((state) => state.openSidebar);

  useEffect(() => {
    if (slides.length === 0) {
      addSlideAtPosition({ position: 0 });
    }
  }, [slides.length, addSlideAtPosition]);

  return (
    <div
      className="relative flex h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-white"
      style={{ colorScheme: 'light' }}
    >
      {/* Sidebar de slides */}
      {showPreviewSidebar && <LeftSidebar isViewOnly={isViewOnly} />}

      {/* Area principal do slide */}
      <Content isViewOnly={isViewOnly} />

      {/* Sidebar de temas (direita - fixed) */}
      <AnimatePresence>
        {openSidebar === 'theme' && <ThemeSidebar />}
      </AnimatePresence>

      {/* Toolbar flutuante no topo */}
      <FloatingToolbar isViewOnly={isViewOnly} />

      {/* Modal de selecao de tipo de slide */}
      {isCreateWithAiOpen && <SlideTypeSelector />}
    </div>
  );
}
