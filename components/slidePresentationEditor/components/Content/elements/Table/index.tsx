'use client';

import type { ReactElement } from 'react';
import type { SlideTable as SlideTableType } from '../../../../types';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import Konva from 'konva';
import { Box } from 'konva/lib/shapes/Transformer';
import { useEffect, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Trash } from 'lucide-react';
import SlideElementOptionsContextMenu from '../../../ContextMenu/ElementOptions';
import useKeyboardActions from '../hooks/useKeyboardActions';
import { useShallow } from 'zustand/react/shallow';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import CustomTransformer from '../CustomTransformer';

const useSlideTable = ({
  slideUuid,
  uuid,
  isEditable,
}: {
  slideUuid: string;
  uuid: string;
  isEditable: boolean;
}) => {
  const slideTable = useSlidePresentationEditorStore(
    useShallow(
      (state) =>
        state.slides
          .find((s) => s.id === slideUuid)
          ?.elements?.find((el) => el.id === uuid) as SlideTableType | undefined
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

  useKeyboardActions({
    element: slideTable,
    slideUuid,
    editable: isEditable,
  });

  if (!slideTable)
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
    };

  return {
    x: slideTable.x * slideScalingDelta,
    y: slideTable.y * slideScalingDelta,
    rotation: slideTable.rotation ?? 0,
    width: slideTable.width * slideScalingDelta,
    height: slideTable.height * slideScalingDelta,
    originalX: slideTable.x,
    originalY: slideTable.y,
    originalWidth: slideTable.width,
    originalHeight: slideTable.height,
    slideDimensions: {
      width: (themeSettings?.width ?? 0) * slideScalingDelta,
      height: (themeSettings?.height ?? 0) * slideScalingDelta,
    },
  };
};

type SlideTableProps = {
  slideUuid: string;
  uuid: string;
  isTransforming: boolean;
  isPreview?: boolean;
  onDrag: (x: number, y: number) => void;
  onClick: () => void;
  onResize: (
    width: number,
    height: number,
    x: number,
    y: number,
    rotation?: number
  ) => void;
  onContextMenu: (x: number, y: number) => void;
  showContextMenu: boolean;
  isViewOnly?: boolean;
  onTableChange?: (content: SlideTableType['content']) => void;
};

const SlideTable = ({
  slideUuid,
  uuid,
  isTransforming,
  isPreview,
  onDrag,
  onClick,
  onResize,
  onContextMenu,
  showContextMenu,
  isViewOnly,
  onTableChange,
}: SlideTableProps) => {
  const isEditable = !isViewOnly;
  const removeElement = useSlidePresentationEditorStore(
    (state) => state.removeElement
  );
  const { x, y, rotation, width, height } = useSlideTable({
    slideUuid,
    uuid,
    isEditable,
  });

  const slideTable = useSlidePresentationEditorStore(
    useShallow(
      (state) =>
        state.slides
          .find((s) => s.id === slideUuid)
          ?.elements?.find((el) => el.id === uuid) as SlideTableType | undefined
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

  const transformerRef = useRef<Konva.Transformer>(null);
  const groupRef = useRef<Konva.Group>(null);

  useEffect(() => {
    if (isTransforming && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [isTransforming]);

  const handleTransformEnd = () => {
    if (!groupRef.current) return;
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const newWidth = Math.max(5, node.width() * scaleX);
    const newHeight = Math.max(5, node.height() * scaleY);
    const newX = node.x();
    const newY = node.y();
    const newRotation = node.rotation();
    // Pass raw stage coords; parent does / slideScalingDelta
    onResize(newWidth, newHeight, newX, newY, newRotation);
  };

  const handleDragEnd = () => {
    if (!groupRef.current) return;
    const newX = groupRef.current.x();
    const newY = groupRef.current.y();
    // Pass raw stage coords; parent does / slideScalingDelta
    onDrag(newX, newY);
  };

  const handleDragBoundFunc = (pos: Konva.Vector2d) => {
    if (!isEditable) return pos;
    const slideDims = {
      width: (themeSettings?.width ?? 0) * slideScalingDelta,
      height: (themeSettings?.height ?? 0) * slideScalingDelta,
    };
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
      const scx = slideDims.width / 2;
      const scy = slideDims.height / 2;
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

  const renderTableCells = (): ReactElement[] => {
    if (!slideTable?.content) return [];
    const { rows, cols, data } = slideTable.content;
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const elements: ReactElement[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellX = col * cellWidth;
        const cellY = row * cellHeight;
        const cellData = data[row]?.[col];
        const val = typeof cellData === 'object' && cellData && 'value' in cellData ? (cellData as { value: string }).value : String(cellData ?? '');
        const isHeader = row === 0;
        elements.push(
          <Rect
            key={`cell-bg-${row}-${col}`}
            x={cellX}
            y={cellY}
            width={cellWidth}
            height={cellHeight}
            fill={
              isHeader
                ? slideTable.headerStyle?.backgroundColor || '#f0f0f0'
                : slideTable.backgroundColor || '#ffffff'
            }
            stroke={slideTable.borderColor || '#000000'}
            strokeWidth={1}
          />
        );
        elements.push(
          <Text
            key={`cell-text-${row}-${col}`}
            x={cellX + 8}
            y={cellY + cellHeight / 2}
            width={cellWidth - 16}
            height={cellHeight}
            text={val}
            fontSize={14 * slideScalingDelta}
            fontFamily="Arial"
            fill="#000000"
            align={isHeader ? 'center' : 'left'}
            verticalAlign="middle"
            fontStyle={isHeader ? 'bold' : 'normal'}
          />
        );
      }
    }
    return elements;
  };

  if (!slideTable) return null;

  const boundBoxFunc = (oldBox: Box, newBox: Box) => {
    newBox.width = Math.max(100, newBox.width);
    newBox.height = Math.max(50, newBox.height);
    return newBox;
  };

  return (
    <>
      <Group
        name="selectable-element"
        attrs={{ elementUuid: uuid }}
        onClick={(e) => {
          e.cancelBubble = true;
          if (isEditable && !isPreview) onClick();
        }}
        onDblClick={(e) => {
          e.cancelBubble = true;
          if (isEditable && !isPreview && onTableChange) onTableChange(slideTable.content);
        }}
        onDblTap={(e) => {
          e.cancelBubble = true;
          if (isEditable && !isPreview && onTableChange) onTableChange(slideTable.content);
        }}
      >
        <Group
          ref={groupRef}
          x={x}
          y={y}
          width={width}
          height={height}
          rotation={rotation}
          draggable={isEditable && !isPreview}
          dragBoundFunc={handleDragBoundFunc}
          onDragEnd={handleDragEnd}
        >
          {renderTableCells()}
        </Group>
        <Rect
          x={x}
          y={y}
          rotation={rotation}
          width={width}
          height={height}
          fill="transparent"
          cursor="pointer"
          name="transform-target"
          draggable={isEditable && !isPreview}
          dragBoundFunc={handleDragBoundFunc}
          onDragEnd={handleDragEnd}
          onContextMenu={(e) => {
            e.evt.preventDefault();
            if (isEditable && !isPreview) {
              const pos = e.target.getStage()?.getPointerPosition();
              onContextMenu(pos?.x ?? 0, pos?.y ?? 0);
            }
          }}
        />
      </Group>

      {isEditable && !isPreview && isTransforming && (
        <CustomTransformer
          ref={transformerRef}
          rotateEnabled={false}
          resizeEnabled={true}
          boundBoxFunc={boundBoxFunc}
          onTransformEnd={handleTransformEnd}
          anchorCornerRadius={10}
          anchorStroke="#4F46E5"
          anchorFill="#ffffff"
          anchorStrokeWidth={2}
          borderStroke="#4F46E5"
          borderStrokeWidth={2}
          borderDash={[5, 5]}
        />
      )}

      {isEditable && !isPreview && isTransforming && (
        <Html groupProps={{ x: x - 60, y }}>
          <div className="flex flex-col items-center gap-1 rounded-lg border-2 border-gray-300 bg-white shadow-lg md:p-2">
            <button
              onClick={() => removeElement({ slideUuid, elementUuid: uuid })}
              className="flex size-5 items-center justify-center rounded-md hover:bg-red-100 md:size-8 text-gray-900"
              aria-label="Excluir"
              title="Excluir"
            >
              <Trash className="size-3 md:size-4" />
            </button>
          </div>
        </Html>
      )}

      {isEditable && !isPreview && showContextMenu && (
        <Html>
          <SlideElementOptionsContextMenu />
        </Html>
      )}
    </>
  );
};

export default SlideTable;
