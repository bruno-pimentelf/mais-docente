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
          .find((s) => s.id === slideUuid)
          ?.elements?.find((el) => el.id === elementUuid) as SlideText | undefined
    )
  );

  return element ?? ({} as SlideText);
};

export default usePreviewTextBlock;
