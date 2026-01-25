import {
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentDuplicateIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import ContextMenu, { ContextMenuAction } from './index';
import { SlideVariants } from '../../types';

const t = (k: string) =>
  ({
    'slideOptions.addNewSlide': 'Adicionar novo slide',
    'slideOptions.duplicateSlide': 'Duplicar slide',
    'slideOptions.removeSlide': 'Remover slide',
    'slideOptions.moveUp': 'Mover para cima',
    'slideOptions.moveDown': 'Mover para baixo',
  })[k] ?? k;

const SlideOptionsContextMenu = () => {
  const slideUuid = useSlideEditorLayoutStore(
    (state) => state.contextMenu?.activeElementUuid
  );

  const addSlide = useSlidePresentationEditorStore((state) => state.addSlide);
  const duplicateSlide = useSlidePresentationEditorStore(
    (state) => state.duplicateSlide
  );
  const moveSlideDownwards = useSlidePresentationEditorStore(
    (state) => state.moveSlideDownwards
  );
  const moveSlideUpwards = useSlidePresentationEditorStore(
    (state) => state.moveSlideUpwards
  );
  const removeSlide = useSlidePresentationEditorStore(
    (state) => state.removeSlide
  );
  const isThereMultipleSlides = useSlidePresentationEditorStore(
    (state) => state.slides.length > 1
  );
  const isTheFirstSlide = useSlidePresentationEditorStore(
    (state) => state.slides[0]?.id === slideUuid
  );
  const isTheLastSlide = useSlidePresentationEditorStore(
    (state) =>
      state.slides[state.slides.length - 1]?.id === slideUuid
  );

  const canMoveUpwards = !isTheFirstSlide;
  const canMoveDownwards = !isTheLastSlide;

  const actions: ContextMenuAction[] = slideUuid
    ? ([
        {
          icon: <PlusCircleIcon className="size-5 text-gray-500" />,
          label: t('slideOptions.addNewSlide'),
          onClick: () => {
            addSlide(SlideVariants.TITLE);
          },
        },
        {
          icon: <DocumentDuplicateIcon className="size-5 text-gray-500" />,
          label: t('slideOptions.duplicateSlide'),
          onClick: () => {
            duplicateSlide(slideUuid);
          },
        },
        ...(isThereMultipleSlides
          ? [
              {
                icon: <TrashIcon className="size-5 text-red-500" />,
                label: t('slideOptions.removeSlide'),
                onClick: () => {
                  removeSlide(slideUuid);
                },
              },
            ]
          : []),
        ...(isThereMultipleSlides && canMoveUpwards
          ? [
              {
                icon: <ChevronUpIcon className="size-5 text-gray-500" />,
                label: t('slideOptions.moveUp'),
                onClick: () => {
                  moveSlideUpwards(slideUuid);
                },
              },
            ]
          : []),
        ...(isThereMultipleSlides && canMoveDownwards
          ? [
              {
                icon: <ChevronDownIcon className="size-5 text-gray-500" />,
                label: t('slideOptions.moveDown'),
                onClick: () => {
                  moveSlideDownwards(slideUuid);
                },
              },
            ]
          : []),
      ] as ContextMenuAction[])
    : [];

  return <ContextMenu actions={actions} />;
};

export default SlideOptionsContextMenu;
