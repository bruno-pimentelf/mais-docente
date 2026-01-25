import { SlideElement } from '@/components/slidePresentationEditor/types';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useCallback, useRef } from 'react';

type UseKeyboardMovementProps = {
  element: SlideElement;
  slideUuid: string;
  enabled: boolean;
};

const useKeyboardMovement = ({
  element,
  slideUuid,
  enabled,
}: UseKeyboardMovementProps) => {
  const setSlideElementPosition = useSlidePresentationEditorStore(
    (state) => state.setSlideElementPosition
  );
  const commitSlideElementPosition = useSlidePresentationEditorStore(
    (state) => state.commitSlideElementPosition
  );
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialPositionRef = useRef<{ x: number; y: number } | null>(null);

  const moveElement = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (!enabled) return;

      if (!initialPositionRef.current) {
        initialPositionRef.current = { x: element.x, y: element.y };
      }

      let newX = element.x;
      let newY = element.y;

      switch (direction) {
        case 'up':
          newY -= 5;
          break;
        case 'down':
          newY += 5;
          break;
        case 'left':
          newX -= 5;
          break;
        case 'right':
          newX += 5;
          break;
      }

      setSlideElementPosition({
        slideUuid,
        elementUuid: element.id,
        x: newX,
        y: newY,
      });

      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }

      moveTimeoutRef.current = setTimeout(() => {
        commitSlideElementPosition({
          slideUuid,
          elementUuid: element.id,
          x: newX,
          y: newY,
        });
        initialPositionRef.current = null;
      }, 500);
    },
    [
      enabled,
      element,
      slideUuid,
      setSlideElementPosition,
      commitSlideElementPosition,
    ]
  );

  return { moveElement };
};

export default useKeyboardMovement;
