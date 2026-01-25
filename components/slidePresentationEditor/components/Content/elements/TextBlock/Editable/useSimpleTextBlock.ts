import Konva from 'konva';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { SlideText } from '../../../../../types';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useShallow } from 'zustand/react/shallow';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import useKeyboardActions from '../../hooks/useKeyboardActions';
import useMediaQuery from '../../../../../hooks/useMediaQuery';

type Props = {
  slideUuid: string;
  elementUuid: string;
  isViewOnly?: boolean;
};

export function useSimpleTextBlock({ slideUuid, elementUuid, isViewOnly }: Props) {
  const element = useSlidePresentationEditorStore(
    useShallow((state) =>
      state.slides
        .find((s) => s.id === slideUuid)
        ?.elements?.find((el) => el.id === elementUuid) as SlideText | undefined
    )
  );
  const themeSettings = useSlidePresentationEditorStore(
    useShallow((state) => state.slides.find((s) => s.id === slideUuid)?.themeSettings)
  );
  const slideScalingDelta = useSlideEditorLayoutStore((s) => s.slideScalingDelta);
  const transformingElementId = useSlideEditorLayoutStore((s) => s.transformingElementId);
  const editingElementId = useSlideEditorLayoutStore((s) => s.editingElementId);
  const setTransformingElementId = useSlideEditorLayoutStore((s) => s.setTransformingElementId);
  const setEditingElementId = useSlideEditorLayoutStore((s) => s.setEditingElementId);
  const setSlideElementPosition = useSlidePresentationEditorStore((s) => s.setSlideElementPosition);
  const commitSlideElementPosition = useSlidePresentationEditorStore((s) => s.commitSlideElementPosition);
  const setSlideElementSizes = useSlidePresentationEditorStore((s) => s.setSlideElementSizes);
  const commitSlideElementSizes = useSlidePresentationEditorStore((s) => s.commitSlideElementSizes);
  const updateText = useSlidePresentationEditorStore((s) => s.updateText);
  const openContextMenu = useSlideEditorLayoutStore((s) => s.openContextMenu);
  const contextMenu = useSlideEditorLayoutStore((s) => s.contextMenu);

  useKeyboardActions({ element, slideUuid, editable: !isViewOnly });

  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const scaled = useMemo(() => {
    if (!element) return { x: 0, y: 0, width: 0, height: 0, rotation: 0, fontSize: 0, slideDimensions: { width: 0, height: 0 } };
    return {
      x: element.x * slideScalingDelta,
      y: element.y * slideScalingDelta,
      width: element.width * slideScalingDelta,
      height: element.height * slideScalingDelta,
      rotation: element.rotation ?? 0,
      fontSize: element.fontSize * slideScalingDelta,
      slideDimensions: {
        width: (themeSettings?.width ?? 0) * slideScalingDelta,
        height: (themeSettings?.height ?? 0) * slideScalingDelta,
      },
    };
  }, [element, slideScalingDelta, themeSettings]);

  const isTransforming = transformingElementId === element?.id;
  const isEditing = editingElementId === element?.id;
  const isDraggable = !isViewOnly && (!isMobile || isTransforming);
  const showContextMenu = (contextMenu?.visible && contextMenu?.activeElementUuid === elementUuid) ?? false;

  const w = (currentWidth || scaled.width) || element?.width || 1;
  const h = (currentHeight || scaled.height) || element?.height || 1;

  const handleClick = useCallback(() => {
    if (isViewOnly) return;
    setTransformingElementId(elementUuid);
  }, [isViewOnly, elementUuid, setTransformingElementId]);

  const handleDoubleClick = useCallback(() => {
    if (isViewOnly) return;
    setEditingElementId(elementUuid);
  }, [isViewOnly, elementUuid, setEditingElementId]);

  const handleDragBoundFunc = useCallback(
    (pos: { x: number; y: number }) => {
      if (isViewOnly) return pos;
      const { width: sw, height: sh } = scaled.slideDimensions;
      let { x: newX, y: newY } = pos;
      const tol = 6;
      if (groupRef.current) {
        const ox = groupRef.current.x();
        const oy = groupRef.current.y();
        groupRef.current.setAttrs({ x: newX, y: newY });
        const cr = groupRef.current.getClientRect();
        const cx = cr.x + cr.width / 2;
        const cy = cr.y + cr.height / 2;
        groupRef.current.setAttrs({ x: ox, y: oy });
        const scx = sw / 2;
        const scy = sh / 2;
        if (Math.abs(cx - scx) <= tol) {
          groupRef.current.setAttrs({ x: newX, y: newY });
          const tr = groupRef.current.getClientRect();
          newX = newX - (tr.x + tr.width / 2 - scx);
          groupRef.current.setAttrs({ x: ox, y: oy });
        }
        if (Math.abs(cy - scy) <= tol) {
          groupRef.current.setAttrs({ x: newX, y: newY });
          const tr = groupRef.current.getClientRect();
          newY = newY - (tr.y + tr.height / 2 - scy);
          groupRef.current.setAttrs({ x: ox, y: oy });
        }
      }
      return { x: newX, y: newY };
    },
    [isViewOnly, scaled.slideDimensions]
  );

  const handleDragEnd = useCallback(() => {
    if (isViewOnly || !groupRef.current) return;
    const nx = groupRef.current.x();
    const ny = groupRef.current.y();
    commitSlideElementPosition({
      slideUuid,
      elementUuid,
      x: nx / slideScalingDelta,
      y: ny / slideScalingDelta,
    });
  }, [isViewOnly, slideUuid, elementUuid, slideScalingDelta, commitSlideElementPosition]);

  const handleDragStart = useCallback(() => {
    document.body.style.cursor = 'grabbing';
  }, []);

  const handleTransform = useCallback(() => {
    if (!groupRef.current) return;
    const n = groupRef.current;
    const nw = n.width() * n.scaleX();
    const nh = n.height() * n.scaleY();
    n.setAttrs({ width: nw, height: nh, scaleX: 1, scaleY: 1 });
    setCurrentWidth(nw);
    setCurrentHeight(nh);
  }, []);

  const handleTransformEnd = useCallback(() => {
    if (!groupRef.current) return;
    const n = groupRef.current;
    n.scaleX(1);
    n.scaleY(1);
    const nw = n.width();
    const nh = n.height();
    setCurrentWidth(nw);
    setCurrentHeight(nh);
    commitSlideElementSizes({
      slideUuid,
      elementUuid,
      width: nw / slideScalingDelta,
      height: nh / slideScalingDelta,
      x: n.x() / slideScalingDelta,
      y: n.y() / slideScalingDelta,
      rotation: n.rotation() ?? 0,
    });
  }, [slideUuid, elementUuid, slideScalingDelta, commitSlideElementSizes]);

  const handleMouseEnter = useCallback(() => {
    if (isViewOnly) return;
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
  }, [isViewOnly]);

  const handleMouseLeave = useCallback(() => {
    document.body.style.cursor = 'default';
    setIsHovered(false);
  }, []);

  const handleContextMenu = useCallback(
    (e: { evt: { preventDefault: () => void; clientX: number; clientY: number } }) => {
      if (isViewOnly) return;
      e.evt.preventDefault();
      openContextMenu({ x: e.evt.clientX, y: e.evt.clientY, activeElementUuid: elementUuid });
    },
    [isViewOnly, elementUuid, openContextMenu]
  );

  const handleUpdateText = useCallback(
    (text: string) => {
      updateText({ slideUuid, textId: elementUuid, text });
      setEditingElementId(null);
    },
    [slideUuid, elementUuid, updateText, setEditingElementId]
  );

  return {
    ...scaled,
    text: element?.text ?? '',
    fontFamily: element?.fontFamily ?? 'Arial',
    textAlign: element?.textAlign ?? 'left',
    lineHeight: element?.lineHeight ?? 1.2,
    currentWidth: w,
    currentHeight: h,
    isTransforming,
    isEditing,
    isHovered,
    isDraggable,
    groupRef,
    transformerRef,
    handleClick,
    handleDoubleClick,
    handleDragBoundFunc,
    handleDragStart,
    handleDragEnd,
    handleTransform,
    handleTransformEnd,
    handleMouseEnter,
    handleMouseLeave,
    handleContextMenu,
    showContextMenu,
    handleUpdateText,
  };
}
