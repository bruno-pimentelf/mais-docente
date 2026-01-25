'use client';

import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import Konva from 'konva';
import { Box } from 'konva/lib/shapes/Transformer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Image as KonvaImage, Rect, Text } from 'react-konva';
import SlideElementOptionsContextMenu from '../../../ContextMenu/ElementOptions';
import { Html } from 'react-konva-utils';
import { Trash } from 'lucide-react';
import useKeyboardActions from '../hooks/useKeyboardActions';
import useMediaQuery from '../../../../hooks/useMediaQuery';
import { useShallow } from 'zustand/react/shallow';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import CustomTransformer from '../CustomTransformer';

const useSlideVideo = ({
  slideUuid,
  uuid,
  isEditable,
}: {
  slideUuid: string;
  uuid: string;
  isEditable: boolean;
}) => {
  const slideVideo = useSlidePresentationEditorStore(
    useShallow((state) =>
      state.slides
        .find((s) => s.id === slideUuid)
        ?.elements?.find((el) => el.id === uuid)
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

  useKeyboardActions({ element: slideVideo, slideUuid, editable: isEditable });

  if (!slideVideo)
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      originalX: 0,
      originalY: 0,
      originalWidth: 0,
      originalHeight: 0,
      slideDimensions: { width: 0, height: 0 },
    };

  return {
    x: slideVideo.x * slideScalingDelta,
    y: slideVideo.y * slideScalingDelta,
    width: slideVideo.width * slideScalingDelta,
    height: slideVideo.height * slideScalingDelta,
    originalX: slideVideo.x,
    originalY: slideVideo.y,
    originalWidth: slideVideo.width,
    originalHeight: slideVideo.height,
    slideDimensions: {
      width: (themeSettings?.width ?? 0) * slideScalingDelta,
      height: (themeSettings?.height ?? 0) * slideScalingDelta,
    },
  };
};

type Props = {
  slideUuid: string;
  uuid: string;
  src: string;
  isTransforming: boolean;
  isPreview?: boolean;
  isPresenting?: boolean;
  onClick: () => void;
  onExit: () => void;
  onDrag: (x: number, y: number) => void;
  onResize: (width: number, height: number, x: number, y: number) => void;
  onContextMenu: (x: number, y: number) => void;
  showContextMenu: boolean;
  isViewOnly?: boolean;
  onChangeVideo?: (files: FileList) => void;
};

const SlideVideo = ({
  slideUuid,
  uuid,
  src,
  isTransforming,
  isPreview,
  onClick,
  onExit,
  onDrag,
  onResize,
  onContextMenu,
  showContextMenu,
  isViewOnly,
  onChangeVideo: _onChangeVideo,
  isPresenting,
}: Props) => {
  const isEditable = !isViewOnly;
  const removeElement = useSlidePresentationEditorStore(
    (state) => state.removeElement
  );

  const {
    x,
    y,
    width,
    height,
    originalX,
    originalY,
    originalWidth,
    originalHeight,
    slideDimensions,
  } = useSlideVideo({ slideUuid, uuid, isEditable });

  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const konvaImageRef = useRef<Konva.Image | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const groupRef = useRef<Konva.Group>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const toolbarOffsetX = isMobile ? 30 : 60;

  const isVideoFinished = useMemo(
    () => videoRef.current?.currentTime === videoRef.current?.duration,
    []
  );

  const handlePlay = () => {
    if (!isEditable) return;
    if (videoRef.current) {
      videoRef.current.play();
      setVideoPlaying(true);
    }
  };

  const handlePause = () => {
    if (!isEditable) return;
    if (videoRef.current) {
      videoRef.current.pause();
      setVideoPlaying(false);
    }
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!isEditable) return;
    onDrag(e.target.x(), e.target.y());
  };

  const handleDragStart = () => {
    if (!isEditable) return;
    document.body.style.cursor = 'grabbing';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    if (!isEditable) return;
    setIsDragging(false);
    document.body.style.cursor = 'pointer';
  };

  const handleDragBoundFunc = (pos: Konva.Vector2d) => {
    if (!isEditable) return pos;
    const { width: sw, height: sh } = slideDimensions;
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

  const handleBoundBoxFunc = (oldBox: Box, newBox: Box) => {
    if (!isEditable) return oldBox;
    const { width: sw, height: sh } = slideDimensions;
    const right = newBox.x + newBox.width;
    const bottom = newBox.y + newBox.height;
    if (newBox.x < 0 || newBox.y < 0 || right > sw || bottom > sh) return oldBox;
    return newBox;
  };

  const [localDimensions, setLocalDimensions] = useState({ width, height });

  useEffect(() => {
    setLocalDimensions({ width, height });
  }, [width, height]);

  const handleResize = () => {
    if (!isEditable || !konvaImageRef.current) return;
    const n = konvaImageRef.current;
    let nw = n.width() * n.scaleX();
    nw = Math.min(nw, slideDimensions.width - Math.abs(x));
    let nh = n.height() * n.scaleY();
    nh = Math.min(nh, slideDimensions.height - Math.abs(y));
    n.setAttrs({ width: nw, height: nh, scaleX: 1, scaleY: 1 });
    const nx = n.x() > 0 ? n.x() : 0;
    const ny = n.y() > 0 ? n.y() : 0;
    n.position({ x: nx, y: ny });
    onResize(nw, nh, nx, ny);
    setLocalDimensions({ width: nw, height: nh });
  };

  const handleMouseEnter = () => {
    if (!isEditable) return;
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isEditable) return;
    document.body.style.cursor = 'default';
    setIsHovered(false);
  };

  const togglePlayPause = () => {
    if (videoPlaying) handlePause();
    else handlePlay();
  };

  const handleRestart = () => {
    if (!isEditable) return;
    if (videoRef.current) {
      setProgress(0);
      videoRef.current.currentTime = 0;
      handlePlay();
    }
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isEditable) return;
    e.evt.preventDefault();
    onContextMenu(e.evt.clientX, e.evt.clientY);
  };

  const handleProgressClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isEditable) return;
    const stage = e.target.getStage();
    if (!stage || !videoRef.current) return;
    const { x: stageXClick } = stage.getPointerPosition()!;
    const barW = width;
    const barX = x;
    const clickX = stageXClick - barX;
    const newTime = (clickX / barW) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(newTime / videoRef.current.duration);
  };

  useEffect(() => {
    let id: number;
    const tick = () => {
      if (videoRef.current) setProgress(videoRef.current.currentTime / videoRef.current.duration);
      id = requestAnimationFrame(tick);
    };
    if (videoPlaying) id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [videoPlaying]);

  useEffect(() => {
    const el = document.createElement('video');
    el.src = src;
    el.crossOrigin = 'anonymous';
    el.preload = 'metadata';
    videoRef.current = el;
  }, [src]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        setVideoLoaded(true);
        videoRef.current?.play();
        setVideoPlaying(true);
        t = setTimeout(() => {
          videoRef.current?.pause();
          setVideoPlaying(false);
        }, 10);
      });
    }
    return () => clearTimeout(t);
  }, [slideDimensions]);

  useEffect(() => {
    const anim = new Konva.Animation(() => {}, konvaImageRef.current?.getLayer());
    if (videoPlaying) anim.start();
    else anim.stop();
    return () => {
      anim.stop();
    };
  }, [videoPlaying]);

  useEffect(() => {
    if (isTransforming && transformerRef.current && konvaImageRef.current) {
      transformerRef.current.nodes([konvaImageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isTransforming]);

  if (isPreview && videoLoaded && videoRef.current) {
    return (
      <KonvaImage
        ref={konvaImageRef}
        image={videoRef.current}
        x={originalX}
        y={originalY}
        width={originalWidth}
        height={originalHeight}
      />
    );
  }

  const controlButtonRadius = width / 15;

  return (
    <Group
      name="selectable-element"
      attrs={{ elementUuid: uuid }}
      ref={groupRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {videoLoaded && videoRef.current && (
        <KonvaImage
          ref={konvaImageRef}
          name="transform-target"
          image={videoRef.current}
          draggable={!isPresenting && isEditable && (!isMobile || isTransforming)}
          x={x}
          y={y}
          width={isTransforming ? localDimensions.width : width}
          height={isTransforming ? localDimensions.height : height}
          opacity={isLoading ? 0.5 : 1}
          onClick={!isPresenting ? onClick : undefined}
          onTap={!isPresenting ? onClick : undefined}
          onTransform={handleResize}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          dragBoundFunc={handleDragBoundFunc}
          onContextMenu={handleContextMenu}
        />
      )}

      {isHovered && !isDragging && !isTransforming && (
        <>
          <Rect x={x} y={y} width={width} height={height} stroke="#3055BF" strokeWidth={2} listening={false} />
          <Group
            x={x + width / 2}
            y={y + height / 2}
            onClick={isVideoFinished ? handleRestart : togglePlayPause}
            onTap={isVideoFinished ? handleRestart : togglePlayPause}
          >
            <Circle x={0} y={0} radius={controlButtonRadius} fill="black" listening opacity={0.5} />
            <Text
              text={isVideoFinished ? '⟲' : videoPlaying ? '⏸' : '▶'}
              fontSize={controlButtonRadius}
              lineHeight={1}
              fill="#fff"
              align="center"
              fontFamily="Arial"
              offsetX={controlButtonRadius / 3}
              offsetY={controlButtonRadius / 2.5}
            />
          </Group>
          <Rect x={x} y={y + height - 20} width={width} height={10} fill="#ddd" listening onClick={handleProgressClick} />
          <Rect x={x} y={y + height - 20} width={progress * width} height={10} fill="#00A1FF" listening={false} />
        </>
      )}

      {isTransforming && !isPresenting && (
        <CustomTransformer
          ref={transformerRef}
          rotateEnabled={false}
          flipEnabled={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={handleBoundBoxFunc}
        />
      )}

      {isEditable && isTransforming && !isPresenting && (
        <Html groupProps={{ x: x - toolbarOffsetX, y }}>
          <div className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white shadow-lg md:p-2">
            <button
              onClick={() => removeElement({ slideUuid, elementUuid: uuid })}
              className="flex size-5 items-center justify-center rounded-md hover:bg-red-100 md:size-8"
              aria-label="Excluir"
              title="Excluir"
            >
              <Trash className="size-3 md:size-4 text-ds-gray-900" />
            </button>
          </div>
        </Html>
      )}

      {showContextMenu && <SlideElementOptionsContextMenu />}
    </Group>
  );
};

export default SlideVideo;
