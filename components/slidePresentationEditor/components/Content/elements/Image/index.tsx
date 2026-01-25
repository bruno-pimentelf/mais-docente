import type { SlideImage as SlideImageType } from '../../../../types';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import Konva from 'konva';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Image, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import { ImageIcon, Loader2, Trash } from 'lucide-react';
import { useImage } from 'react-konva-utils';
import SlideElementOptionsContextMenu from '../../../ContextMenu/ElementOptions';
import useKeyboardActions from '../hooks/useKeyboardActions';
import useMediaQuery from '../../../../hooks/useMediaQuery';
import { borderAsAnchorStyleFunc } from '../../utils';
import { useShallow } from 'zustand/react/shallow';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import CustomTransformer from '../CustomTransformer';
import { Button } from '@/components/ui/button';

type SlideImageProps = {
  slideUuid: string;
  uuid: string;
  src: string;
  isTransforming: boolean;
  isPreview?: boolean;
  isViewOnly?: boolean;
  isGif?: boolean;
  onClick: () => void;
  onDragEnd: (x: number, y: number) => void;
  onResizeEnd: (
    width: number,
    height: number,
    x: number,
    y: number,
    rotation?: number
  ) => void;
  slideDimensions: { width: number; height: number };
  onContextMenu: (x: number, y: number) => void;
  showContextMenu: boolean;
  onChangeImage?: (files: FileList) => void;
};

const useSlideImage = ({
  slideUuid,
  uuid,
  isEditable,
}: {
  slideUuid: string;
  uuid: string;
  isEditable: boolean;
}) => {
  const slideImage = useSlidePresentationEditorStore(
    useShallow(
      (state) =>
        state.slides
          .find((s) => s.id === slideUuid)
          ?.elements?.find((el) => el.id === uuid) as SlideImageType | undefined
    )
  );
  const themeSettings = useSlidePresentationEditorStore(
    useShallow(
      (state) => state.slides.find((s) => s.id === slideUuid)?.themeSettings
    )
  );
  const scalingDelta = useSlideEditorLayoutStore(
    (state) => state.slideScalingDelta
  );

  useKeyboardActions({
    element: slideImage,
    slideUuid,
    editable: isEditable,
  });

  if (!slideImage)
    return {
      x: 0,
      y: 0,
      rotation: 0,
      width: 0,
      height: 0,
      borderRadius: 0 as number | undefined,
      originalX: 0,
      originalY: 0,
      originalWidth: 0,
      originalHeight: 0,
      originalBorderRadius: 0 as number | undefined,
      isUploading: false,
      slideDimensions: { width: 0, height: 0 },
    };

  return {
    x: slideImage.x * scalingDelta,
    y: slideImage.y * scalingDelta,
    rotation: slideImage.rotation ?? 0,
    width: slideImage.width * scalingDelta,
    height: slideImage.height * scalingDelta,
    borderRadius: slideImage.borderRadius,
    isUploading: (slideImage as { isUploading?: boolean }).isUploading || false,
    originalX: slideImage.x,
    originalY: slideImage.y,
    originalWidth: slideImage.width,
    originalHeight: slideImage.height,
    originalBorderRadius: slideImage.borderRadius,
    slideDimensions: {
      width: (themeSettings?.width ?? 0) * scalingDelta,
      height: (themeSettings?.height ?? 0) * scalingDelta,
    },
  };
};

function getCrop(
  image: HTMLImageElement,
  size: { width: number; height: number },
  clipPosition = 'center-middle'
) {
  const { width, height } = size;
  const aspectRatio = width / height;
  const imageRatio = image.width / image.height;
  let newWidth: number;
  let newHeight: number;
  if (aspectRatio >= imageRatio) {
    newWidth = image.width;
    newHeight = image.width / aspectRatio;
  } else {
    newWidth = image.height * aspectRatio;
    newHeight = image.height;
  }
  let x = 0;
  let y = 0;
  if (clipPosition === 'center-middle') {
    x = (image.width - newWidth) / 2;
    y = (image.height - newHeight) / 2;
  }
  return { cropX: x, cropY: y, cropWidth: newWidth, cropHeight: newHeight };
}

const SlideImage = ({
  slideUuid,
  uuid,
  src,
  isTransforming,
  isPreview,
  isGif = false,
  onDragEnd,
  onClick,
  onResizeEnd,
  onContextMenu,
  showContextMenu,
  onChangeImage,
  isViewOnly,
}: SlideImageProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cropPosition] = useState('center-middle');

  const [image, imageStatus] = useImage(src);
  const isImageLoading = imageStatus === 'loading';
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const isEditable = !isViewOnly && !isPreview;
  const removeElement = useSlidePresentationEditorStore(
    (state) => state.removeElement
  );

  const {
    x,
    y,
    rotation,
    width,
    height,
    borderRadius,
    isUploading,
    originalX,
    originalY,
    originalWidth,
    originalHeight,
    originalBorderRadius,
    slideDimensions: computedSlideDimensions,
  } = useSlideImage({ slideUuid, uuid, isEditable });

  const [localDimensions, setLocalDimensions] = useState({ width, height });

  useEffect(() => {
    setLocalDimensions({ width, height });
  }, [width, height]);

  const currentWidth = isTransforming ? localDimensions.width : width;
  const currentHeight = isTransforming ? localDimensions.height : height;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const toolbarOffsetX = isMobile ? 30 : 60;
  const toolbarX = -toolbarOffsetX;
  const toolbarY = 0;

  const handleGroupDragBound = (pos: Konva.Vector2d) => {
    if (!computedSlideDimensions) return pos;
    const { width: sw, height: sh } = computedSlideDimensions;
    let newX = pos.x;
    let newY = pos.y;
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
  };

  const cropValues = useMemo(() => {
    if (!image) return null;
    const size = isPreview
      ? { width: originalWidth, height: originalHeight }
      : { width: currentWidth, height: currentHeight };
    return getCrop(image, size, cropPosition);
  }, [image, currentWidth, currentHeight, originalWidth, originalHeight, cropPosition, isPreview]);

  const handleMouseEnter = () => {
    document.body.style.cursor = 'default';
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    document.body.style.cursor = 'default';
    setIsHovered(false);
  };
  const handleDragStart = () => {
    document.body.style.cursor = 'grabbing';
  };
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    document.body.style.cursor = 'pointer';
    onDragEnd(e.target.x(), e.target.y());
  };

  const handleResize = () => {
    if (!groupRef.current) return;
    const n = groupRef.current;
    const nw = n.width() * n.scaleX();
    const nh = n.height() * n.scaleY();
    n.setAttrs({ scaleX: 1, scaleY: 1 });
    onResizeEnd(nw, nh, n.x(), n.y(), n.rotation());
  };

  const handleTransform = () => {
    if (!groupRef.current) return;
    const n = groupRef.current;
    const nw = n.width() * n.scaleX();
    const nh = n.height() * n.scaleY();
    n.setAttrs({ width: nw, height: nh, scaleX: 1, scaleY: 1 });
    setLocalDimensions({ width: nw, height: nh });
  };

  const handleShowContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    onContextMenu(e.evt.clientX, e.evt.clientY);
  };

  useEffect(() => {
    if (isTransforming && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isTransforming]);

  // Preview
  if (isPreview) {
    if (isGif) {
      return (
        <Group
          x={originalX}
          y={originalY}
          width={originalWidth}
          height={originalHeight}
          rotation={rotation}
        >
          <Html divProps={{ style: { width: originalWidth, height: originalHeight, overflow: 'hidden', borderRadius: originalBorderRadius || 0 } }}>
            {isImageLoading ? (
              <div className="flex items-center justify-center bg-gray-100 rounded" style={{ width: originalWidth, height: originalHeight, borderRadius: originalBorderRadius || 0 }}>
                <Loader2 className="size-4 animate-spin" />
              </div>
            ) : (
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: originalBorderRadius || 0 }} />
            )}
          </Html>
        </Group>
      );
    }
    return (
      <>
        {image && (
          <Image
            image={image}
            x={originalX}
            y={originalY}
            width={originalWidth}
            height={originalHeight}
            rotation={rotation}
            cornerRadius={originalBorderRadius}
            {...(cropValues || {})}
          />
        )}
        {(isUploading || (isImageLoading && !image)) && (
          <Group x={originalX} y={originalY}>
            <Html>
              <div className="flex items-center justify-center bg-gray-100 rounded" style={{ width: originalWidth, height: originalHeight, borderRadius: originalBorderRadius || 0 }}>
                <Loader2 className="size-4 animate-spin" />
              </div>
            </Html>
          </Group>
        )}
      </>
    );
  }

  // Edit: GIF
  if (isGif) {
    return (
      <>
        <Group
          name="selectable-element"
          attrs={{ elementUuid: uuid }}
          x={x}
          y={y}
          width={currentWidth}
          height={currentHeight}
          rotation={rotation}
          draggable={isEditable && (!isMobile || isTransforming)}
          dragBoundFunc={handleGroupDragBound}
          onMouseEnter={isEditable ? handleMouseEnter : undefined}
          onMouseLeave={isEditable ? handleMouseLeave : undefined}
          onDragStart={isEditable ? handleDragStart : undefined}
          onDragEnd={isEditable ? handleDragEnd : undefined}
          onDblTap={isEditable ? onClick : undefined}
          onTap={isEditable ? onClick : undefined}
          onClick={isEditable ? onClick : undefined}
          onTransform={handleTransform}
          onTransformEnd={handleResize}
          ref={groupRef}
        >
          <Html divProps={{ style: { pointerEvents: 'none' } }}>
            {isUploading || isImageLoading ? (
              <div className="flex items-center justify-center bg-gray-100 rounded" style={{ width: currentWidth, height: currentHeight, borderRadius: borderRadius || 0 }}>
                <Loader2 className="size-6 animate-spin" />
              </div>
            ) : (
              <img src={src} alt="" style={{ width: currentWidth, height: currentHeight, borderRadius: borderRadius || 0, objectFit: 'cover', pointerEvents: 'none', display: 'block' }} />
            )}
          </Html>
          <Rect width={currentWidth} height={currentHeight} fill="transparent" listening onContextMenu={isEditable ? handleShowContextMenu : undefined} name="transform-target" />
          {isHovered && <Rect width={currentWidth} height={currentHeight} stroke="#3055BF" strokeWidth={2} listening={false} cornerRadius={borderRadius} />}
          {isEditable && isTransforming && (
            <Html>
              <div className="absolute flex flex-col items-center gap-1 rounded-lg border-2 border-gray-300 bg-white shadow-lg md:p-2" style={{ left: `${toolbarX}px`, top: `${toolbarY}px` }}>
                <button onClick={() => removeElement({ slideUuid, elementUuid: uuid })} className="flex size-5 items-center justify-center rounded-md hover:bg-red-100 md:size-8 text-gray-900" aria-label="Excluir"><Trash className="size-3 md:size-4" /></button>
              </div>
            </Html>
          )}
          {showContextMenu && <SlideElementOptionsContextMenu />}
        </Group>
        {isTransforming && (
          <CustomTransformer
            ref={transformerRef}
            rotateEnabled
            rotationSnaps={[0, 90, 180, 270]}
            rotationSnapTolerance={3}
            flipEnabled={false}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']}
            anchorStyleFunc={(a) => borderAsAnchorStyleFunc(a, currentHeight ?? height)}
          />
        )}
      </>
    );
  }

  // Edit: image
  return (
    <>
      <Group
        name="selectable-element"
        attrs={{ elementUuid: uuid }}
        x={x}
        y={y}
        width={currentWidth}
        height={currentHeight}
        rotation={rotation}
        draggable={isEditable && (!isMobile || isTransforming)}
        dragBoundFunc={handleGroupDragBound}
        onMouseEnter={isEditable ? handleMouseEnter : undefined}
        onMouseLeave={isEditable ? handleMouseLeave : undefined}
        onDragStart={isEditable ? handleDragStart : undefined}
        onDragEnd={isEditable ? handleDragEnd : undefined}
        onDblTap={isEditable ? onClick : undefined}
        onTap={isEditable ? onClick : undefined}
        onClick={isEditable ? onClick : undefined}
        onTransform={handleTransform}
        onTransformEnd={handleResize}
        ref={groupRef}
      >
        {image && (
          <Image
            name="transform-target"
            image={image}
            width={currentWidth}
            height={currentHeight}
            cornerRadius={borderRadius}
            {...(cropValues || {})}
            onContextMenu={isEditable ? handleShowContextMenu : undefined}
          />
        )}
        {(isUploading || (isImageLoading && !image)) && (
          <Rect name="transform-target" width={currentWidth} height={currentHeight} fill="transparent" listening onContextMenu={isEditable ? handleShowContextMenu : undefined} />
        )}
        {(isUploading || (isImageLoading && !image)) && (
          <Html>
            <div className="absolute flex items-center justify-center bg-gray-100 rounded pointer-events-none" style={{ width: currentWidth, height: currentHeight, borderRadius: borderRadius || 0 }}>
              <Loader2 className="size-6 animate-spin" />
            </div>
          </Html>
        )}
        {isEditable && typeof src === 'string' && src.includes('/images/interactive-classes/slide-presentation-editor/') && (
          <Html>
            <div className="absolute select-none -translate-x-1/2 -translate-y-1/2 flex whitespace-nowrap" style={{ left: `${currentWidth / 2}px`, top: `${currentHeight / 2}px` }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && onChangeImage) onChangeImage(files);
                  };
                  input.click();
                }}
              >
                <ImageIcon className="size-4 mr-1" />
                Escolher imagem
              </Button>
            </div>
          </Html>
        )}
        {isHovered && <Rect width={currentWidth} height={currentHeight} stroke="#3055BF" strokeWidth={2} listening={false} cornerRadius={borderRadius} />}
        {isEditable && isTransforming && (
          <Html>
            <div className="absolute flex flex-col items-center gap-1 rounded-lg border-2 border-gray-300 bg-white shadow-lg md:p-2" style={{ left: `${toolbarX}px`, top: `${toolbarY}px` }}>
              <button onClick={() => removeElement({ slideUuid, elementUuid: uuid })} className="flex size-5 items-center justify-center rounded-md hover:bg-red-100 md:size-8 text-gray-900" aria-label="Excluir"><Trash className="size-3 md:size-4" /></button>
            </div>
          </Html>
        )}
        {showContextMenu && <SlideElementOptionsContextMenu />}
      </Group>
      {isTransforming && (
        <CustomTransformer
          ref={transformerRef}
          rotateEnabled
          rotationSnaps={[0, 90, 180, 270]}
          rotationSnapTolerance={3}
          flipEnabled={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']}
          anchorStyleFunc={(a) => borderAsAnchorStyleFunc(a, currentHeight ?? height)}
        />
      )}
    </>
  );
};

export default SlideImage;
