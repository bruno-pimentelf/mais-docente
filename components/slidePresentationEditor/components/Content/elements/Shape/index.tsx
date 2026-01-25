import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import { Circle, Group, Line, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Palette, Trash } from 'lucide-react';
import {
  SlideShape as SlideShapeType,
  SlideShapeElementsVariants,
} from '../../../../types';
import SlideElementOptionsContextMenu from '../../../ContextMenu/ElementOptions';
import { useSlideTheme } from '../../../../hooks/useSlideTheme';
import useKeyboardActions from '../hooks/useKeyboardActions';
import useMediaQuery from '../../../../hooks/useMediaQuery';
import { borderAsAnchorStyleFunc } from '../../utils';
import { useShallow } from 'zustand/react/shallow';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import CustomTransformer from '../CustomTransformer';

const useSlideShape = ({
  slideUuid,
  uuid,
  isEditable,
}: {
  slideUuid: string;
  uuid: string;
  isEditable: boolean;
}) => {
  const slideShape = useSlidePresentationEditorStore(
    useShallow(
      (state) =>
        state.slides
          .find((s) => s.id === slideUuid)
          ?.elements?.find((el) => el.id === uuid) as SlideShapeType | undefined
    )
  );
  const themeSettings = useSlidePresentationEditorStore(
    useShallow(
      (state) => state.slides.find((s) => s.id === slideUuid)?.themeSettings
    )
  );
  const slideScalingDelta = useSlideEditorLayoutStore(
    (state) => state.slideScalingDelta
  );

  useKeyboardActions({ element: slideShape, slideUuid, editable: isEditable });

  if (!slideShape)
    return {
      x: 0,
      y: 0,
      rotation: 0,
      width: 0,
      height: 0,
      originalX: 0,
      originalY: 0,
      originalWidth: 0,
      originalHeight: 0,
      slideDimensions: { width: 0, height: 0 },
      listening: false,
      opacity: 0,
    };

  return {
    x: slideShape.x * slideScalingDelta,
    y: slideShape.y * slideScalingDelta,
    rotation: slideShape.rotation ?? 0,
    width: slideShape.width * slideScalingDelta,
    height: slideShape.height * slideScalingDelta,
    cornerRadius: slideShape.cornerRadius ?? 0,
    originalX: slideShape.x,
    originalY: slideShape.y,
    originalWidth: slideShape.width,
    originalHeight: slideShape.height,
    slideDimensions: {
      width: (themeSettings?.width ?? 0) * slideScalingDelta,
      height: (themeSettings?.height ?? 0) * slideScalingDelta,
    },
    listening: slideShape.options?.label !== 'Shape Background',
    opacity: slideShape.opacity ?? 1,
  };
};

function getTransformerAnchors(type: SlideShapeElementsVariants) {
  if (type === SlideShapeElementsVariants.LINE)
    return ['middle-left', 'middle-right'];
  if (type === SlideShapeElementsVariants.RECTANGLE)
    return [
      'top-left', 'top-right', 'top-center', 'bottom-center',
      'bottom-left', 'bottom-right', 'middle-left', 'middle-right',
    ];
  if (type === SlideShapeElementsVariants.CIRCLE)
    return ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  return [
    'top-left', 'top-right', 'top-center', 'bottom-center',
    'bottom-left', 'bottom-right', 'middle-left', 'middle-right',
  ];
}

type SlideShapeProps = {
  type: SlideShapeElementsVariants;
  slideUuid: string;
  uuid: string;
  points?: [number, number, number, number];
  color: string;
  isTransforming: boolean;
  isPreview?: boolean;
  onDragEnd: (x: number, y: number) => void;
  onClick: () => void;
  onResizeEnd: (
    width: number,
    height: number,
    x: number,
    y: number,
    rotation?: number
  ) => void;
  onContextMenu: (x: number, y: number) => void;
  showContextMenu: boolean;
  onColorChange?: (color: string) => void;
  isViewOnly?: boolean;
};

const SlideShape = ({
  type,
  slideUuid,
  uuid,
  points,
  color,
  isTransforming,
  isPreview,
  onDragEnd,
  onClick,
  onResizeEnd,
  onContextMenu,
  showContextMenu,
  onColorChange,
  isViewOnly,
}: SlideShapeProps) => {
  const isEditable = !isViewOnly;
  const removeElement = useSlidePresentationEditorStore(
    (state) => state.removeElement
  );

  const {
    x,
    y,
    rotation,
    width,
    height,
    cornerRadius,
    originalX,
    originalY,
    originalWidth,
    originalHeight,
    slideDimensions,
    listening,
    opacity,
  } = useSlideShape({ slideUuid, uuid, isEditable });

  const [isHovered, setIsHovered] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const groupRef = useRef<Konva.Group>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const toolbarOffsetX = isMobile ? 30 : 60;
  const isCircle = type === SlideShapeElementsVariants.CIRCLE;
  const [localDimensions, setLocalDimensions] = useState({ width, height });

  useEffect(() => {
    setLocalDimensions({ width, height });
  }, [width, height]);

  const currentWidth = isTransforming ? localDimensions.width : width;
  const currentHeight = isTransforming ? localDimensions.height : height;
  const boundsLeft = isCircle ? -currentWidth / 2 : 0;
  const boundsTop = isCircle ? -currentHeight / 2 : 0;
  const toolbarX = boundsLeft - toolbarOffsetX;
  const toolbarY = boundsTop;

  function handleMouseEnter() {
    if (!isEditable) return;
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
  }

  function handleMouseLeave() {
    if (!isEditable) return;
    document.body.style.cursor = 'default';
    setIsHovered(false);
  }

  function handleDragStart() {
    if (!isEditable) return;
    document.body.style.cursor = 'grabbing';
  }

  function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    if (!isEditable) return;
    document.body.style.cursor = 'pointer';
    onDragEnd(e.target.x(), e.target.y());
  }

  function handleResizeEnd() {
    if (!isEditable) return;
    if (groupRef.current) {
      const n = groupRef.current;
      const nw = n.width() * n.scaleX();
      const nh = n.height() * n.scaleY();
      n.setAttrs({ scaleX: 1, scaleY: 1 });
      onResizeEnd(nw, nh, n.x(), n.y(), n.rotation());
      setLocalDimensions({ width: nw, height: nh });
    }
  }

  function handleTransform() {
    if (!isEditable || !groupRef.current) return;
    const n = groupRef.current;
    const nw = n.width() * n.scaleX();
    const nh = n.height() * n.scaleY();
    n.setAttrs({ width: nw, height: nh, scaleX: 1, scaleY: 1 });
    setLocalDimensions({ width: nw, height: nh });
  }

  const handleDragBoundFunc = (pos: Konva.Vector2d) => {
    if (!isEditable) return pos;
    const { width: sw, height: sh } = slideDimensions;
    let newX = pos.x;
    let newY = pos.y;
    const tolerance = 6;
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
      if (Math.abs(cx - scx) <= tolerance) {
        groupRef.current.setAttrs({ x: newX, y: newY });
        const tr = groupRef.current.getClientRect();
        newX = newX - (tr.x + tr.width / 2 - scx);
        groupRef.current.setAttrs({ x: ox, y: oy });
      }
      if (Math.abs(cy - scy) <= tolerance) {
        groupRef.current.setAttrs({ x: newX, y: newY });
        const tr = groupRef.current.getClientRect();
        newY = newY - (tr.y + tr.height / 2 - scy);
        groupRef.current.setAttrs({ x: ox, y: oy });
      }
    }
    return { x: newX, y: newY };
  };

  const handleCircleDragBoundFunc = (pos: Konva.Vector2d) => {
    if (!isEditable) return pos;
    const { width: sw, height: sh } = slideDimensions;
    let newX = pos.x;
    let newY = pos.y;
    const tolerance = 6;
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
      if (Math.abs(cx - scx) <= tolerance) {
        groupRef.current.setAttrs({ x: newX, y: newY });
        const tr = groupRef.current.getClientRect();
        newX = newX - (tr.x + tr.width / 2 - scx);
        groupRef.current.setAttrs({ x: ox, y: oy });
      }
      if (Math.abs(cy - scy) <= tolerance) {
        groupRef.current.setAttrs({ x: newX, y: newY });
        const tr = groupRef.current.getClientRect();
        newY = newY - (tr.y + tr.height / 2 - scy);
        groupRef.current.setAttrs({ x: ox, y: oy });
      }
    }
    return { x: newX, y: newY };
  };

  const handleShowContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isEditable) return;
    e.evt.preventDefault();
    onContextMenu(e.evt.clientX, e.evt.clientY);
  };

  const handleColorButtonClick = () => {
    if (!isEditable) return;
    setShowColorPicker((p) => !p);
  };

  const handleColorChangeComplete = (c: { hex: string }) => {
    if (!isEditable) return;
    onColorChange?.(c.hex);
  };

  const { quickColors: themeQuickColors } = useSlideTheme(slideUuid);
  const quickColors = themeQuickColors.shape;

  useEffect(() => {
    if (
      isTransforming &&
      transformerRef.current &&
      groupRef.current
    ) {
      transformerRef.current.nodes([groupRef.current]);
      if (type === SlideShapeElementsVariants.CIRCLE) {
        transformerRef.current.setAttrs({
          enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        });
      } else if (type === SlideShapeElementsVariants.LINE) {
        transformerRef.current.setAttrs({
          enabledAnchors: ['middle-left', 'middle-right'],
          resizeEnabled: true,
        });
      } else {
        transformerRef.current.setAttrs({
          enabledAnchors: [
            'top-left', 'top-right', 'top-center', 'bottom-center',
            'bottom-left', 'bottom-right', 'middle-left', 'middle-right',
          ],
        });
      }
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isTransforming, type]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!showColorPicker) return;
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node))
        setShowColorPicker(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showColorPicker]);

  if (isPreview) {
    switch (type) {
      case SlideShapeElementsVariants.RECTANGLE:
        return (
          <Rect
            x={originalX}
            y={originalY}
            rotation={rotation}
            width={originalWidth}
            height={originalHeight}
            fill={color}
            shadowForStrokeEnabled={false}
          />
        );
      case SlideShapeElementsVariants.LINE:
        return (
          <Line
            x={originalX}
            y={originalY}
            rotation={rotation}
            points={[0, 0, originalWidth ?? 0, 0]}
            stroke={color}
            strokeWidth={2}
            shadowForStrokeEnabled={false}
          />
        );
      case SlideShapeElementsVariants.CIRCLE:
        return (
          <Circle
            x={(originalX ?? 0) + (originalWidth ?? 0) / 2}
            y={(originalY ?? 0) + (originalHeight ?? 0) / 2}
            rotation={rotation}
            radius={Math.min(originalWidth ?? 0, originalHeight ?? 0) / 2}
            fill={color}
            shadowForStrokeEnabled={false}
          />
        );
      default:
        return null;
    }
  }

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isEditable) return;
    e.cancelBubble = true;
    onClick();
  };

  const renderShape = () => {
    switch (type) {
      case SlideShapeElementsVariants.RECTANGLE:
        return (
          <Rect
            name="transform-target"
            width={currentWidth}
            height={currentHeight}
            cornerRadius={cornerRadius}
            fill={color}
            opacity={opacity}
            dragBoundFunc={handleDragBoundFunc}
            onContextMenu={handleShowContextMenu}
            shadowForStrokeEnabled={false}
          />
        );
      case SlideShapeElementsVariants.LINE:
        return (
          <Line
            name="transform-target"
            width={currentWidth}
            height={currentHeight}
            points={points ?? [0, 0, currentWidth, 0]}
            stroke={color}
            strokeWidth={2}
            dragBoundFunc={handleDragBoundFunc}
            onContextMenu={handleShowContextMenu}
            shadowForStrokeEnabled={false}
            opacity={opacity}
          />
        );
      case SlideShapeElementsVariants.CIRCLE:
        return (
          <Circle
            name="transform-target"
            radius={currentWidth / 2}
            fill={color}
            dragBoundFunc={handleCircleDragBoundFunc}
            onContextMenu={handleShowContextMenu}
            shadowForStrokeEnabled={false}
            opacity={opacity}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Group
        listening={listening}
        name={listening ? 'selectable-element' : 'non-selectable-element'}
        attrs={{ elementUuid: uuid }}
        x={x}
        y={y}
        rotation={rotation}
        width={currentWidth}
        height={currentHeight}
        draggable={isEditable && (!isMobile || isTransforming)}
        dragBoundFunc={isCircle ? handleCircleDragBoundFunc : handleDragBoundFunc}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onTap={handleClick}
        onTransform={handleTransform}
        ref={groupRef}
      >
        {isHovered &&
          (type === SlideShapeElementsVariants.RECTANGLE ? (
            <Rect
              width={currentWidth}
              height={currentHeight}
              stroke="#3055BF"
              strokeWidth={2}
              listening={false}
              shadowForStrokeEnabled={false}
            />
          ) : type === SlideShapeElementsVariants.LINE ? (
            <Line
              points={points ?? [0, 0, currentWidth, 0]}
              stroke="#3055BF"
              strokeWidth={2}
              listening={false}
              shadowForStrokeEnabled={false}
            />
          ) : (
            <Circle
              radius={currentWidth / 2}
              stroke="#3055BF"
              strokeWidth={2}
              listening={false}
              shadowForStrokeEnabled={false}
            />
          ))}
        {renderShape()}
        {isTransforming && isEditable && !isPreview && (
          <Html>
            <div
              ref={toolbarRef}
              className="absolute flex flex-col items-center gap-1 rounded-lg border-2 border-gray-300 bg-white shadow-lg md:p-2"
              style={{ left: `${toolbarX}px`, top: `${toolbarY}px` }}
            >
              <button
                onClick={handleColorButtonClick}
                className="relative flex size-5 items-center justify-center rounded-md border-2 border-gray-300 hover:bg-gray-100 md:size-8"
                title="Cor"
                aria-label="Cor"
              >
                <span
                  className="absolute inset-0 rounded-md"
                  style={{ backgroundColor: color }}
                />
                <Palette size={14} className="relative z-10 text-white drop-shadow" />
              </button>
              <button
                onClick={() => removeElement({ slideUuid, elementUuid: uuid })}
                className="flex size-5 items-center justify-center rounded-md transition-colors hover:bg-red-100 md:size-8 text-gray-900"
                aria-label="Excluir"
                title="Excluir"
              >
                <Trash className="size-3 md:size-4" />
              </button>
              {showColorPicker && (
                <div className="absolute left-full top-0 z-50 ml-2 rounded-md border-2 border-gray-300 bg-white p-2 shadow-lg">
                  {quickColors.length > 0 && (
                    <div className="mb-2 flex gap-1">
                      {quickColors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleColorChangeComplete({ hex: c })}
                          className="h-5 w-5 rounded border"
                          style={{ backgroundColor: c }}
                          aria-label={c}
                          title={c}
                        />
                      ))}
                    </div>
                  )}
                  <SketchPicker color={color} onChange={handleColorChangeComplete} />
                </div>
              )}
            </div>
          </Html>
        )}
        {showContextMenu && <SlideElementOptionsContextMenu />}
      </Group>
      {isTransforming && (
        <CustomTransformer
          ref={transformerRef}
          rotateEnabled={type !== SlideShapeElementsVariants.CIRCLE}
          rotationSnaps={[0, 90, 180, 270]}
          rotationSnapTolerance={3}
          flipEnabled={false}
          onTransformEnd={handleResizeEnd}
          enabledAnchors={getTransformerAnchors(type)}
          anchorStyleFunc={(anchor) => {
            if (type === SlideShapeElementsVariants.LINE) return;
            borderAsAnchorStyleFunc(anchor, currentHeight ?? height);
          }}
        />
      )}
    </>
  );
};

export default SlideShape;
