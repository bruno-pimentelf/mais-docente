import type { SlideText } from '../../../../../types';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useShallow } from 'zustand/react/shallow';

type Props = {
  slideUuid: string;
  elementUuid: string;
};

const usePreviewTextBlock = ({ slideUuid, elementUuid }: Props) => {
  const element = useSlidePresentationEditorStore(
    useShallow(
      (state) =>
        state.slides
          .find((slide) => slide.id === slideUuid)
          ?.elements?.find((element) => element.id === elementUuid) as SlideText
    )
  );

  const textSlideElement: SlideText | null = element
    ? (element as SlideText)
    : null;

  return {
    ...textSlideElement,
  };
};

export default usePreviewTextBlock;
