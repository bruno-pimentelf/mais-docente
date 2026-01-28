import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import { Trash } from 'lucide-react';
import React, { useCallback, useEffect, useRef } from 'react';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import useMediaQuery from '../../../../../hooks/useMediaQuery';
import { borderAsAnchorStyleFunc } from '../../../utils';
import CustomTransformer from '../../CustomTransformer';
import SlideElementOptionsContextMenu from '../../../../ContextMenu/ElementOptions';
import { useSimpleTextBlock } from './useSimpleTextBlock';

const LINE_BREAK_CORRECTION = 13;

type Props = {
  slideUuid: string;
  elementUuid: string;
  isViewOnly?: boolean;
};

const EditableTextBlock = (props: Props) => {
  const tb = useSimpleTextBlock(props);
  const removeElement = useSlidePresentationEditorStore((s) => s.removeElement);
  const setSlideElementWidth = useSlidePresentationEditorStore((s) => s.setSlideElementWidth);
  const setSlideElementHeight = useSlidePresentationEditorStore((s) => s.setSlideElementHeight);
  const slideScalingDelta = useSlideEditorLayoutStore((s) => s.slideScalingDelta);
  const editRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const measureAndUpdateSize = useCallback(
    (el: HTMLElement | null) => {
      if (!el || !slideScalingDelta) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      setSlideElementWidth({
        slideUuid: props.slideUuid,
        elementUuid: props.elementUuid,
        width: rect.width / slideScalingDelta,
      });
      setSlideElementHeight({
        slideUuid: props.slideUuid,
        elementUuid: props.elementUuid,
        height: rect.height / slideScalingDelta,
      });
    },
    [props.slideUuid, props.elementUuid, slideScalingDelta, setSlideElementWidth, setSlideElementHeight]
  );

  useEffect(() => {
    if (tb.isTransforming && tb.transformerRef.current && tb.groupRef.current) {
      tb.transformerRef.current.nodes([tb.groupRef.current]);
      tb.transformerRef.current.getLayer()?.batchDraw();
    }
  // currentWidth/currentHeight para o transformer acompanhar após medida do conteúdo; refs estáveis
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tb.isTransforming, tb.currentWidth, tb.currentHeight]);

  // Medir conteúdo e atualizar width/height quando estão 0 (texto recém-criado) para o transformer ficar no tamanho do texto
  useEffect(() => {
    const needsMeasure =
      tb.element &&
      (tb.element.width === 0 || tb.element.height === 0);
    if (!needsMeasure) return;
    const el = tb.isEditing ? editRef.current : previewRef.current;
    if (!el) return;
    const t = setTimeout(() => measureAndUpdateSize(el), 80);
    return () => clearTimeout(t);
  }, [
    tb.element,
    tb.element?.id,
    tb.element?.width,
    tb.element?.height,
    tb.isEditing,
    measureAndUpdateSize,
  ]);

  // Só preenche ao entrar em edição; tb.text de propósito fora de deps para não sobrescrever enquanto o utilizador edita
  useEffect(() => {
    if (tb.isEditing && editRef.current) {
      editRef.current.innerHTML = tb.text ?? '';
      editRef.current.focus();
      const r = document.createRange();
      r.selectNodeContents(editRef.current);
      const s = window.getSelection();
      s?.removeAllRanges();
      s?.addRange(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when entering edit mode
  }, [tb.isEditing]);

  const handleBlur = () => {
    if (editRef.current) {
      tb.handleUpdateText(editRef.current.innerHTML || '');
      // Atualizar altura (e largura) para o transformer acompanhar o tamanho do texto após edição
      measureAndUpdateSize(editRef.current);
    }
  };

  const showFloatingToolbar = tb.isTransforming && !props.isViewOnly;

  return (
    <>
      <Group
        name="selectable-element"
        ref={tb.groupRef}
        attrs={{ elementUuid: props.elementUuid }}
        x={tb.x}
        y={tb.y}
        width={tb.currentWidth}
        height={tb.currentHeight}
        rotation={tb.rotation}
        draggable={tb.isDraggable}
        dragBoundFunc={tb.handleDragBoundFunc}
        onDblClick={tb.handleDoubleClick}
        onDblTap={tb.handleDoubleClick}
        onClick={tb.handleClick}
        onTap={tb.handleClick}
        onMouseEnter={tb.handleMouseEnter}
        onMouseLeave={tb.handleMouseLeave}
        onTransform={tb.handleTransform}
        onTransformEnd={tb.handleTransformEnd}
        onDragStart={tb.handleDragStart}
        onDragEnd={tb.handleDragEnd}
      >
        {showFloatingToolbar && (
          <Html groupProps={{ x: isMobile ? -30 : -60, y: 0 }}>
            <div className="flex flex-col items-center gap-1 rounded-lg border-2 border-gray-300 bg-white shadow-lg md:p-2">
              <button
                onClick={() => removeElement({ slideUuid: props.slideUuid, elementUuid: props.elementUuid })}
                className="flex size-5 items-center justify-center rounded-md hover:bg-red-100 md:size-8 text-gray-900"
                title="Excluir"
              >
                <Trash className="size-3 md:size-4" />
              </button>
            </div>
          </Html>
        )}
        <Html
          divProps={{
            style: { pointerEvents: tb.isEditing ? 'all' : 'none' },
          }}
        >
          {tb.isEditing ? (
            <div
              ref={editRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleBlur}
              className="outline-none"
              style={{
                fontSize: tb.fontSize,
                fontFamily: tb.fontFamily,
                textAlign: tb.textAlign as React.CSSProperties['textAlign'],
                lineHeight: tb.lineHeight,
                width: tb.currentWidth > 0 ? tb.currentWidth + LINE_BREAK_CORRECTION : 'auto',
                minHeight: tb.currentHeight,
              }}
            />
          ) : (
            <div
              ref={previewRef}
              style={{
                fontSize: tb.fontSize,
                fontFamily: tb.fontFamily,
                textAlign: tb.textAlign as React.CSSProperties['textAlign'],
                lineHeight: tb.lineHeight,
                width:
                  tb.element?.width === 0 && tb.element?.height === 0
                    ? 'auto'
                    : tb.currentWidth > 0
                      ? tb.currentWidth + LINE_BREAK_CORRECTION
                      : 'auto',
                minHeight: tb.currentHeight > 0 ? tb.currentHeight : undefined,
              }}
              dangerouslySetInnerHTML={{ __html: tb.text ?? '' }}
            />
          )}
        </Html>

        <Rect
          width={tb.currentWidth}
          height={tb.currentHeight}
          fill="transparent"
          cursor="pointer"
          name="transform-target"
          stroke="#3055BF"
          strokeWidth={tb.isHovered ? 2 : 0}
          onContextMenu={tb.handleContextMenu}
        />

        {tb.showContextMenu && <SlideElementOptionsContextMenu />}
      </Group>
      {tb.isTransforming && (
        <CustomTransformer
          ref={tb.transformerRef}
          rotateEnabled
          rotationSnaps={[0, 90, 180, 270]}
          rotationSnapTolerance={3}
          flipEnabled={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']}
          anchorStyleFunc={(a) => borderAsAnchorStyleFunc(a, tb.currentHeight)}
          onTransformEnd={tb.handleTransformEnd}
        />
      )}
    </>
  );
};

export default EditableTextBlock;
