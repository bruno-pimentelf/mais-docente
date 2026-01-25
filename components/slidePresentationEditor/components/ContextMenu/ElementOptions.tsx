import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Html } from 'react-konva-utils';
import { useShallow } from 'zustand/react/shallow';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import ContextMenu, { type ContextMenuAction } from './index';

const t = (key: string) => {
  const map: Record<string, string> = {
    'contextMenu.elementOptions.removeElement': 'Remover',
    'contextMenu.elementOptions.moveUp': 'Trazer para frente',
    'contextMenu.elementOptions.moveDown': 'Enviar para trás',
  };
  return map[key] ?? key;
};

const SlideElementOptionsContextMenu = () => {
  const elementUuid = useSlideEditorLayoutStore(
    (state) => state.contextMenu?.activeElementUuid
  );
  const removeElement = useSlidePresentationEditorStore(
    (state) => state.removeElement
  );
  const moveElementLayerUpwards = useSlidePresentationEditorStore(
    (state) => state.moveElementLayerUpwards
  );
  const moveElementLayerDownwards = useSlidePresentationEditorStore(
    (state) => state.moveElementLayerDownwards
  );
  const slideUuid = useSlidePresentationEditorStore(
    (state) =>
      state.slides.find((slide) =>
        slide.elements?.some((el) => el.id === elementUuid)
      )?.id
  );
  const elements = useSlidePresentationEditorStore(
    useShallow(
      (state) => state.slides.find((s) => s.id === slideUuid)?.elements
    )
  );

  const isThereMultipleElements = elements && elements.length > 1;
  const isOnTop = elements?.[elements.length - 1]?.id === elementUuid;
  const isOnBottom = elements?.[0]?.id === elementUuid;
  const canMoveUpwards = !isOnTop;
  const canMoveDownwards = !isOnBottom;

  const defaultOptions = (sId: string, eId: string): ContextMenuAction[] => [
    {
      icon: <TrashIcon className="size-5 text-gray-500" />,
      label: t('contextMenu.elementOptions.removeElement'),
      onClick() {
        removeElement({ slideUuid: sId, elementUuid: eId });
      },
    },
  ];

  const actions: ContextMenuAction[] =
    elementUuid && slideUuid && isThereMultipleElements
      ? ([
          ...defaultOptions(slideUuid, elementUuid),
          ...(canMoveUpwards
            ? [
                {
                  icon: <ChevronUpIcon className="size-5 text-gray-500" />,
                  label: t('contextMenu.elementOptions.moveUp'),
                  onClick() {
                    moveElementLayerUpwards({ slideUuid, elementUuid });
                  },
                },
              ]
            : []),
          ...(canMoveDownwards
            ? [
                {
                  icon: <ChevronDownIcon className="size-5 text-gray-500" />,
                  label: t('contextMenu.elementOptions.moveDown'),
                  onClick() {
                    moveElementLayerDownwards({ slideUuid, elementUuid });
                  },
                },
              ]
            : []),
        ] as ContextMenuAction[])
      : elementUuid && slideUuid
        ? defaultOptions(slideUuid, elementUuid)
        : [];

  return (
    <Html>
      <ContextMenu actions={actions} />
    </Html>
  );
};

export default SlideElementOptionsContextMenu;
