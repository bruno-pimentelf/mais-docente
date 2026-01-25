import {
  SlideElement,
  SlideElementBaseTypes,
} from '@/components/slidePresentationEditor/types';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useCallback, useEffect } from 'react';
import useKeyboardMovement from './useKeyboardMovement';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';

type KeyboardActionsProps = {
  element: SlideElement | undefined;
  slideUuid: string;
  editable: boolean;
};

const useKeyboardActions = ({
  element,
  slideUuid,
  editable,
}: KeyboardActionsProps) => {
  const removeElement = useSlidePresentationEditorStore(
    (state) => state.removeElement
  );
  const setTransformingElementId = useSlideEditorLayoutStore(
    (state) => state.setTransformingElementId
  );
  const setEditingElementId = useSlideEditorLayoutStore(
    (state) => state.setEditingElementId
  );
  const copyElementToClipboard = useSlideEditorLayoutStore(
    (state) => state.copyElementToClipboard
  );

  const isTransforming = useSlideEditorLayoutStore(
    (state) => state.transformingElementId === element?.id
  );
  const isEditing = useSlideEditorLayoutStore(
    (state) => state.editingElementId
  );
  const isCreateWithAiOpen = useSlideEditorLayoutStore(
    (state) => state.createWithAi.isOpen
  );
  const shouldActivateKeyboardActions =
    editable && isTransforming && !isCreateWithAiOpen;

  const { moveElement } = useKeyboardMovement({
    element: element!,
    slideUuid,
    enabled: !!shouldActivateKeyboardActions,
  });

  const handleArrowKeys = useCallback(
    (e: KeyboardEvent) => {
      if (!shouldActivateKeyboardActions) return;

      e.preventDefault();
      const direction =
        e.key === 'ArrowUp'
          ? 'up'
          : e.key === 'ArrowDown'
            ? 'down'
            : e.key === 'ArrowLeft'
              ? 'left'
              : 'right';

      if (direction) {
        moveElement(direction);
      }
    },
    [shouldActivateKeyboardActions, moveElement]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!shouldActivateKeyboardActions || !element) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeElement({ slideUuid, elementUuid: element.id });
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setTransformingElementId(null);
        setEditingElementId(null);
        return;
      }

      if (
        !(element.type === SlideElementBaseTypes.TEXT && isEditing) &&
        (e.ctrlKey || e.metaKey)
      ) {
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          copyElementToClipboard(element);
          return;
        }

        if (e.key === 'x' || e.key === 'X') {
          e.preventDefault();
          copyElementToClipboard(element);
          removeElement({ slideUuid, elementUuid: element.id });
          return;
        }
      }

      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        handleArrowKeys(e);
      }
    },
    [
      shouldActivateKeyboardActions,
      slideUuid,
      element,
      handleArrowKeys,
      removeElement,
      setTransformingElementId,
      setEditingElementId,
      copyElementToClipboard,
      isEditing,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboardActions;
