import { useEffect } from 'react';
import Content from './components/Content';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import SlideTypeSelector from './components/SlideTypeSelector';
import ThemeSidebar from './components/ThemeSidebar';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';

type Props = {
  onBack: () => void;
  hideHeader?: boolean;
  isViewOnly?: boolean;
  showPreviewSidebar?: boolean;
};

export default function SlidePresentationEditor({
  onBack,
  hideHeader = false,
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
      className="relative flex flex-1 flex-col items-stretch justify-stretch"
      style={{ colorScheme: 'light' }}
    >
      <Header hideHeader={hideHeader} onBack={onBack} />
      <div className="flex flex-row">
        {showPreviewSidebar && <LeftSidebar hideHeader={hideHeader} isViewOnly={isViewOnly} />}
        <Content hideHeader={hideHeader} showPreviewSidebar={showPreviewSidebar} isViewOnly={isViewOnly} />
        {openSidebar === 'theme' && <ThemeSidebar />}
      </div>
      {isCreateWithAiOpen && <SlideTypeSelector />}
    </div>
  );
}
