import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import Konva from 'konva';
import React, { useCallback, useRef, useState } from 'react';

import 'tippy.js/dist/tippy.css';

import { Image, Layer, Rect, Stage } from 'react-konva';
import { useImage } from 'react-konva-utils';
import { Html } from 'react-konva-utils';
import { Loader2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import { isCoverSlideType } from '../../../utils/helpers/slide-utils';
import CustomTransformer from '../elements/CustomTransformer';
import type { SlideElement } from '../../../types';

const BackgroundImageComponent = ({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) => {
  const [image, imageStatus] = useImage(src);
  const isImageLoading = imageStatus === 'loading';

  if (isImageLoading && !image) {
    return (
      <Html>
        <div
          className="absolute flex items-center justify-center bg-gray-200"
          style={{ left: 0, top: 0, width, height }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <Loader2 className="size-8 animate-spin" />
            <span className="text-base font-medium">Carregando...</span>
          </div>
        </div>
      </Html>
    );
  }

  if (!image) return null;

  return (
    <Image
      image={image}
      x={0}
      y={0}
      width={width}
      height={height}
      listening={false}
    />
  );
};

const useBaseSlide = (props: SlideProps) => {
  const { slideUuid, isPreview } = props;
  const [isHovered, setIsHovered] = useState(false);
  const slide = useSlidePresentationEditorStore(
    useShallow((state) => state.slides.find((s) => s.id === slideUuid))
  );
  const editingElementId = useSlideEditorLayoutStore(
    (state) => state.editingElementId
  );
  const transformingElementId = useSlideEditorLayoutStore(
    (state) => state.transformingElementId
  );
  const isThereElementsSelected = useSlidePresentationEditorStore((state) =>
    state.slides
      .find((s) => s.id === slideUuid)
      ?.elements?.some(
        (el: SlideElement) =>
          el.id === editingElementId || el.id === transformingElementId
      )
  );
  const isSlideSelected = useSlidePresentationEditorStore(
    (state) => state.selectedSlide === slideUuid
  );
  const scalingDelta = useSlideEditorLayoutStore(
    (state) => state.slideScalingDelta
  );
  const unselectAllElements = useSlideEditorLayoutStore(
    (state) => state.unselectAllElements
  );
  const setSelectedSlide = useSlidePresentationEditorStore(
    (state) => state.setSelectedSlide
  );
  const setLastClickPosition = useSlideEditorLayoutStore(
    (state) => state.setLastClickPosition
  );

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      unselectAllElements();
      setSelectedSlide(slideUuid);
      try {
        window.getSelection()?.removeAllRanges();
      } catch {
        // ignore
      }
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (pos) {
        setLastClickPosition({
          x: pos.x / scalingDelta,
          y: pos.y / scalingDelta,
        });
      }
    }
  };

  const handleMouseEnter = () => {
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    document.body.style.cursor = 'default';
    setIsHovered(false);
  };

  const showBorder = isHovered && !isThereElementsSelected && !isPreview;

  if (!slide)
    return {
      width: 0,
      height: 0,
      originalWidth: 0,
      originalHeight: 0,
      isSlideSelected: false,
      isHovered,
      showBorder,
      backgroundColor: '#FFFFFF',
      handleStageClick,
      handleMouseEnter,
      handleMouseLeave,
    };

  return {
    width: (slide?.themeSettings?.width ?? 0) * scalingDelta,
    height: (slide?.themeSettings?.height ?? 0) * scalingDelta,
    originalWidth: slide?.themeSettings?.width ?? 0,
    originalHeight: slide?.themeSettings?.height ?? 0,
    backgroundColor: slide.themeSettings.backgroundColor,
    backgroundImage: slide.themeSettings.backgroundImage,
    isSlideSelected,
    isHovered,
    showBorder,
    handleStageClick,
    handleMouseEnter,
    handleMouseLeave,
  };
};

export interface SlideProps {
  slideUuid: string;
  children?: React.ReactNode;
  isPreview?: boolean;
}

const Slide = ({ slideUuid, children, isPreview }: SlideProps) => {
  const {
    width,
    height,
    originalWidth,
    originalHeight,
    isSlideSelected,
    backgroundColor,
    backgroundImage,
    handleStageClick: baseHandleStageClick,
    handleMouseEnter,
    handleMouseLeave,
    showBorder,
  } = useBaseSlide({ slideUuid, isPreview });

  const commitSlideElementsPositionBulk = useSlidePresentationEditorStore(
    (state) => state.commitSlideElementsPositionBulk
  );
  const removeElementsBulk = useSlidePresentationEditorStore(
    (state) => state.removeElementsBulk
  );
  const currentSlideElements = useSlidePresentationEditorStore(
    useShallow(
      (state) => state.slides.find((s) => s.id === slideUuid)?.elements
    )
  );
  const selectedSlideType = useSlidePresentationEditorStore(
    (state) => state.selectedSlideType
  );
  const slideScalingDelta = useSlideEditorLayoutStore(
    (state) => state.slideScalingDelta
  );
  const setSelectedElementUuids = useSlideEditorLayoutStore(
    (state) => state.setSelectedElementUuids
  );
  const clearSelectedElementUuids = useSlideEditorLayoutStore(
    (state) => state.clearSelectedElementUuids
  );
  const setSlideSidebar = useSlideEditorLayoutStore(
    (state) => state.setSlideSidebar
  );
  const copyElementsToClipboard = useSlideEditorLayoutStore(
    (state) => state.copyElementsToClipboard
  );

  const selectionRectRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const isSelectingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);
  const rafScheduledRef = useRef(false);
  const transformCleanupRef = useRef<(() => void) | null>(null);
  const [nodesVersion, setNodesVersion] = useState(0);
  const [livePreviewRects, setLivePreviewRects] = useState<
    { x: number; y: number; width: number; height: number }[]
  >([]);
  const [selectedRects, setSelectedRects] = useState<
    { x: number; y: number; width: number; height: number }[]
  >([]);
  const [showCenterXGuide, setShowCenterXGuide] = useState(false);
  const [showCenterYGuide, setShowCenterYGuide] = useState(false);

  const unionSelectedRect =
    selectedRects.length > 0
      ? (() => {
          const minX = Math.min(...selectedRects.map((r) => r.x));
          const minY = Math.min(...selectedRects.map((r) => r.y));
          const maxX = Math.max(...selectedRects.map((r) => r.x + r.width));
          const maxY = Math.max(...selectedRects.map((r) => r.y + r.height));
          return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        })()
      : null;

  const clearMarquee = useCallback(() => {
    const sel = selectionRectRef.current;
    if (sel) {
      sel.visible(false);
      sel.width(0);
      sel.height(0);
      sel.getLayer()?.batchDraw();
    }
    isSelectingRef.current = false;
    startPosRef.current = null;
    didDragRef.current = false;
    setLivePreviewRects([]);
  }, []);

  const onStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (isPreview) return;
      const stage = e.target.getStage();
      if (!stage || e.target !== stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      isSelectingRef.current = true;
      didDragRef.current = false;
      startPosRef.current = { x: pos.x, y: pos.y };
      setSelectedRects([]);
      const sel = selectionRectRef.current;
      if (sel) {
        sel.visible(true);
        sel.width(0);
        sel.height(0);
        sel.x(pos.x);
        sel.y(pos.y);
        sel.getLayer()?.batchDraw();
      }
    },
    [isPreview]
  );

  const onStageDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      const tolerance = 6;
      const target = e.target as Konva.Node & { name?: () => string; hasName?: (n: string) => boolean; className?: string; findAncestors?: (n: string) => Konva.Node[]; findOne?: (n: string) => Konva.Node | null };
      let rect: Konva.Rect | null = null;
      if (target?.name?.() === 'multi-transform-hit') {
        rect = target as unknown as Konva.Rect;
      } else {
        const group =
          target?.className === 'Group' && target?.hasName?.('selectable-element')
            ? (target as unknown as Konva.Group)
            : (target.findAncestors?.('.selectable-element')?.[0] as Konva.Group | undefined) ?? null;
        if (group) {
          const nodeForRect = (group.findOne?.('.transform-target') as Konva.Node) ?? group;
          const cr = nodeForRect.getClientRect();
          const cx = cr.x + cr.width / 2;
          const cy = cr.y + cr.height / 2;
          setShowCenterXGuide(Math.abs(cx - width / 2) <= tolerance);
          setShowCenterYGuide(Math.abs(cy - height / 2) <= tolerance);
          return;
        }
        if (
          (target?.hasName?.('transform-target')) ||
          (target?.name?.() === 'transform-target')
        ) {
          const cr = (target as Konva.Node).getClientRect();
          setShowCenterXGuide(Math.abs(cr.x + cr.width / 2 - width / 2) <= tolerance);
          setShowCenterYGuide(Math.abs(cr.y + cr.height / 2 - height / 2) <= tolerance);
          return;
        }
      }
      if (rect) {
        const cr = rect.getClientRect();
        setShowCenterXGuide(Math.abs(cr.x + cr.width / 2 - width / 2) <= tolerance);
        setShowCenterYGuide(Math.abs(cr.y + cr.height / 2 - height / 2) <= tolerance);
      }
    },
    [width, height]
  );

  const onStageDragEnd = useCallback(() => {
    setShowCenterXGuide(false);
    setShowCenterYGuide(false);
  }, []);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const tolerance = 6;
    const dragMoveHandler = (e: Konva.KonvaEventObject<DragEvent>) => {
      const t = e.target as Konva.Node & { name?: () => string; hasName?: (n: string) => boolean; className?: string; findAncestors?: (n: string) => Konva.Node[]; findOne?: (n: string) => Konva.Node | null };
      if (t?.name?.() === 'multi-transform-hit') {
        const cr = (t as Konva.Node).getClientRect();
        setShowCenterXGuide(Math.abs(cr.x + cr.width / 2 - width / 2) <= tolerance);
        setShowCenterYGuide(Math.abs(cr.y + cr.height / 2 - height / 2) <= tolerance);
        return;
      }
      let group: Konva.Group | null = null;
      if (t?.className === 'Transformer') {
        const nodes = (t as unknown as Konva.Transformer).nodes();
        if (nodes?.length) {
          const anc = nodes[0].findAncestors?.('.selectable-element')?.[0] as Konva.Group | undefined;
          if (anc) group = anc;
        }
      } else if (t?.hasName?.('selectable-element')) {
        group = t as unknown as Konva.Group;
      } else {
        const anc = t.findAncestors?.('.selectable-element')?.[0] as Konva.Group | undefined;
        if (anc) group = anc;
      }
      if (group) {
        const nodeForRect = (group.findOne?.('.transform-target') as Konva.Node) ?? group;
        const cr = nodeForRect.getClientRect();
        setShowCenterXGuide(Math.abs(cr.x + cr.width / 2 - width / 2) <= tolerance);
        setShowCenterYGuide(Math.abs(cr.y + cr.height / 2 - height / 2) <= tolerance);
      }
    };
    const dragEndHandler = () => {
      setShowCenterXGuide(false);
      setShowCenterYGuide(false);
    };
    stage.on('dragmove', dragMoveHandler);
    stage.on('dragend', dragEndHandler);
    return () => {
      stage.off('dragmove', dragMoveHandler);
      stage.off('dragend', dragEndHandler);
    };
  }, [width, height]);

  const selectedElementUuids = useSlideEditorLayoutStore(
    (state) => state.selectedElementUuids
  );

  React.useEffect(() => {
    const stage = transformerRef.current?.getStage();
    if (!stage || !transformerRef.current || !selectedElementUuids?.length) return;
    const groups = stage.find('.selectable-element') as unknown as Konva.Group[];
    const nodes = groups
      .filter((g) => {
        const id = (g.attrs as { elementUuid?: string })?.elementUuid;
        return typeof id === 'string' && selectedElementUuids.includes(id);
      })
      .map((g) => g.findOne('.transform-target'))
      .filter((n): n is Konva.Node => Boolean(n));
    if (nodes.length > 0) {
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
      setSelectedRects(nodes.map((n) => {
        const r = n.getClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }));
      setNodesVersion((v) => v + 1);
    }
  }, [selectedElementUuids]);

  const onStageMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isSelectingRef.current) return;
      const stage = e.target.getStage();
      const sel = selectionRectRef.current;
      if (!stage || !sel || !startPosRef.current) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      didDragRef.current = true;
      const x = Math.min(pos.x, startPosRef.current.x);
      const y = Math.min(pos.y, startPosRef.current.y);
      const w = Math.abs(pos.x - startPosRef.current.x);
      const h = Math.abs(pos.y - startPosRef.current.y);
      sel.setAttrs({ x, y, width: w, height: h });
      sel.getLayer()?.batchDraw();
      if (!rafScheduledRef.current) {
        rafScheduledRef.current = true;
        requestAnimationFrame(() => {
          try {
            const box = sel.getClientRect();
            const targets = stage.find('.transform-target');
            const selected = targets.filter((node) =>
              Konva.Util.haveIntersection(box, node.getClientRect())
            );
            setLivePreviewRects(
              selected.map((node) => {
                const r = node.getClientRect();
                return { x: r.x, y: r.y, width: r.width, height: r.height };
              })
            );
          } finally {
            rafScheduledRef.current = false;
          }
        });
      }
    },
    []
  );

  const onStageMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isSelectingRef.current) return;
      const stage = e.target.getStage();
      const sel = selectionRectRef.current;
      if (!stage || !sel) {
        clearMarquee();
        return;
      }
      const box = sel.getClientRect();
      const selectableNodes = stage.find('.selectable-element');
      const selectedNodes = selectableNodes.filter((node) =>
        Konva.Util.haveIntersection(box, node.getClientRect())
      );
      const tr = transformerRef.current;
      if (tr) {
        const targetNodes = (selectedNodes as unknown as Konva.Group[])
          .map((g) => g.findOne('.transform-target'))
          .filter((n): n is Konva.Node => Boolean(n));
        tr.nodes(targetNodes);
        tr.getLayer()?.batchDraw();
        setNodesVersion((v) => v + 1);
      }
      setSelectedRects(
        (selectedNodes as Konva.Node[]).map((n) => {
          const r = n.getClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        })
      );
      const uuids = (selectedNodes as unknown as { attrs?: { elementUuid?: string } }[])
        .map((g) => g?.attrs?.elementUuid)
        .filter((id): id is string => Boolean(id));
      if (uuids.length > 0) setSelectedElementUuids(uuids);
      setTimeout(() => clearMarquee(), 0);
      setLivePreviewRects([]);
    },
    [clearMarquee, setSelectedElementUuids]
  );

  React.useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    const nodes = tr.nodes() as Konva.Node[];
    if (!nodes?.length) return;
    const updateRects = () => {
      const rects = nodes.map((n) => n.getClientRect());
      setSelectedRects(rects.map((r) => ({ x: r.x, y: r.y, width: r.width, height: r.height })));
      tr?.getLayer()?.batchDraw();
    };
    nodes.forEach((n) => {
      n.on('transform', updateRects);
      n.on('transformend', updateRects);
      n.on('dragmove', updateRects);
      n.on('dragend', updateRects);
    });
    transformCleanupRef.current = () => {
      nodes.forEach((n) => {
        n.off('transform', updateRects);
        n.off('transformend', updateRects);
        n.off('dragmove', updateRects);
        n.off('dragend', updateRects);
      });
    };
    return () => {
      transformCleanupRef.current?.();
      transformCleanupRef.current = null;
    };
  }, [nodesVersion]);

  React.useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    const nodes = tr.nodes() as Konva.Node[];
    if (!nodes?.length) return;
    const existingIds = new Set((currentSlideElements || []).map((el) => el.id));
    const filtered = nodes.filter((node) => {
      const group = node.findAncestors?.('.selectable-element')?.[0] as { attrs?: { elementUuid?: string } } | undefined;
      const uuid = group?.attrs?.elementUuid;
      return Boolean(uuid && existingIds.has(uuid));
    });
    if (filtered.length !== nodes.length) {
      tr.nodes(filtered);
      tr.getLayer()?.batchDraw();
      setNodesVersion((v) => v + 1);
      setSelectedRects(filtered.map((n) => {
        const r = n.getClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }));
    }
    if (filtered.length === 0) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      setSelectedRects([]);
    }
  }, [currentSlideElements]);

  const dragStartPositionsRef = useRef<
    { node: Konva.Node; group: Konva.Group | null; nodeStartX: number; nodeStartY: number; groupStartX: number; groupStartY: number; elementUuid?: string }[]
  >([]);
  const startUnionRectRef = useRef<{ x: number; y: number } | null>(null);
  const startSelectedRectsRef = useRef<{ x: number; y: number; width: number; height: number }[]>([]);

  const handleUnionDragStart = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const stage = e.target.getStage();
      if (!stage || !transformerRef.current) return;
      const nodes = transformerRef.current.nodes();
      dragStartPositionsRef.current = nodes.map((node) => {
        const group = (node.findAncestors?.('.selectable-element')?.[0] as Konva.Group) ?? null;
        const uuid = (group?.attrs as { elementUuid?: string })?.elementUuid;
        return {
          node,
          group,
          nodeStartX: node.x(),
          nodeStartY: node.y(),
          groupStartX: group ? group.x() : node.x(),
          groupStartY: group ? group.y() : node.y(),
          elementUuid: uuid,
        };
      });
      startUnionRectRef.current = unionSelectedRect ? { x: unionSelectedRect.x, y: unionSelectedRect.y } : null;
      startSelectedRectsRef.current = selectedRects;
    },
    [unionSelectedRect, selectedRects]
  );

  const handleUnionDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const base = startUnionRectRef.current ?? unionSelectedRect;
      const dx = e.target.x() - (base?.x ?? 0);
      const dy = e.target.y() - (base?.y ?? 0);
      if (!dragStartPositionsRef.current.length) return;
      dragStartPositionsRef.current.forEach(
        ({ node, group, nodeStartX, nodeStartY, groupStartX, groupStartY }) => {
          const bx = group ? groupStartX : nodeStartX;
          const by = group ? groupStartY : nodeStartY;
          if (group) {
            group.x(bx + dx);
            group.y(by + dy);
          } else {
            node.x(bx + dx);
            node.y(by + dy);
          }
        }
      );
      const baseRects = startSelectedRectsRef.current.length ? startSelectedRectsRef.current : selectedRects;
      setSelectedRects(baseRects.map((r) => ({ ...r, x: r.x + dx, y: r.y + dy })));
      transformerRef.current?.getLayer()?.batchDraw();
    },
    [unionSelectedRect, selectedRects]
  );

  const handleUnionDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const base = startUnionRectRef.current ?? unionSelectedRect;
      const dx = e.target.x() - (base?.x ?? 0);
      const dy = e.target.y() - (base?.y ?? 0);
      const updates: { elementUuid: string; x: number; y: number }[] = [];
      dragStartPositionsRef.current.forEach(
        ({ group, nodeStartX, nodeStartY, groupStartX, groupStartY, elementUuid }) => {
          const bx = group ? groupStartX : nodeStartX;
          const by = group ? groupStartY : nodeStartY;
          const id = elementUuid ?? (group?.attrs as { elementUuid?: string })?.elementUuid ?? (e.target.findAncestors?.('.selectable-element')?.[0] as { attrs?: { elementUuid?: string } })?.attrs?.elementUuid;
          if (id) updates.push({ elementUuid: id, x: (bx + dx) / slideScalingDelta, y: (by + dy) / slideScalingDelta });
        }
      );
      if (updates.length) commitSlideElementsPositionBulk({ slideUuid, updates });
      dragStartPositionsRef.current = [];
      startUnionRectRef.current = null;
      startSelectedRectsRef.current = [];
    },
    [unionSelectedRect, slideScalingDelta, slideUuid, commitSlideElementsPositionBulk]
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (didDragRef.current) return;
      const stage = e.target.getStage();
      if (stage && e.target === stage) {
        if (transformerRef.current) {
          transformerRef.current.nodes([]);
          transformerRef.current.getLayer()?.batchDraw();
        }
        setSelectedRects([]);
        clearSelectedElementUuids();
        baseHandleStageClick(e);
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
        if (isMobile && selectedSlideType && !isCoverSlideType(selectedSlideType)) {
          setSlideSidebar('fillWithAi');
        }
      }
    },
    [baseHandleStageClick, clearSelectedElementUuids, selectedSlideType, setSlideSidebar]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isSlideSelected) return;
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || (document.activeElement as HTMLElement | null)?.isContentEditable;
      if (isTyping) return;
      const tr = transformerRef.current;
      const nodes = tr?.nodes?.() || [];
      if (!nodes.length) return;
      const elementUuids = Array.from(
        new Set(
          nodes
            .map((node) => {
              const id = (node as { attrs?: { elementUuid?: string } })?.attrs?.elementUuid;
              if (id) return id;
              const g = node.findAncestors?.('.selectable-element')?.[0] as { attrs?: { elementUuid?: string } } | undefined;
              return g?.attrs?.elementUuid;
            })
            .filter((id): id is string => Boolean(id))
        )
      );
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (elementUuids.length > 0) removeElementsBulk({ slideUuid, elementUuids });
        if (transformerRef.current) {
          transformerRef.current.nodes([]);
          transformerRef.current.getLayer()?.batchDraw();
        }
        setSelectedRects([]);
        clearSelectedElementUuids();
        return;
      }
      if (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!currentSlideElements?.length) return;
        const toCopy = elementUuids
          .map((id) => currentSlideElements!.find((el) => el.id === id))
          .filter((el): el is NonNullable<typeof el> => Boolean(el));
        if (toCopy.length > 0) copyElementsToClipboard(toCopy);
      }
    },
    [isSlideSelected, slideUuid, copyElementsToClipboard, clearSelectedElementUuids, currentSlideElements, removeElementsBulk]
  );

  React.useEffect(() => {
    if (!isSlideSelected) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlideSelected, handleKeyDown]);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0));

  if (isPreview) {
    return (
      <Stage width={originalWidth} height={originalHeight} listening={false} style={{ overflow: 'hidden' }}>
        <Layer>
          <Rect x={0} y={0} width={originalWidth} height={originalHeight} fill={backgroundColor} />
          {backgroundImage && (
            <BackgroundImageComponent src={backgroundImage} width={originalWidth} height={originalHeight} />
          )}
        </Layer>
        <Layer>{children}</Layer>
      </Stage>
    );
  }

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onClick={!isPreview ? handleStageClick : undefined}
      onMouseDown={onStageMouseDown}
      onMouseMove={onStageMouseMove}
      onMouseUp={onStageMouseUp}
      onDragMove={onStageDragMove}
      onDragEnd={onStageDragEnd}
      style={{ borderRadius: '0', overflow: 'hidden' }}
    >
      <Layer onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Rect x={0} y={0} width={width} height={height} fill={backgroundColor} listening={false} />
        {backgroundImage && <BackgroundImageComponent src={backgroundImage} width={width} height={height} />}
        {showBorder && (
          <Rect x={0} y={0} width={width} height={height} stroke="#00A1FF" strokeWidth={2} listening={false} />
        )}
      </Layer>
      <Layer>{children}</Layer>
      <Layer>
        {showCenterXGuide && (
          <Rect x={width / 2} y={0} width={1} height={height} fill="#EF4444" listening={false} opacity={1} />
        )}
        {showCenterYGuide && (
          <Rect x={0} y={height / 2} width={width} height={1} fill="#EF4444" listening={false} opacity={1} />
        )}
        <Rect
          ref={selectionRectRef}
          visible={false}
          listening={false}
          fill="rgba(0, 161, 255, 0.15)"
          stroke="#00A1FF"
          strokeWidth={1}
        />
        {!isTouchDevice && livePreviewRects.map((r, i) => (
          <Rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} listening={false} stroke="#00A1FF" strokeWidth={1} dash={[4, 4]} />
        ))}
        {!isTouchDevice && selectedRects.map((r, i) => (
          <Rect key={`sel-${i}`} x={r.x} y={r.y} width={r.width} height={r.height} listening={false} stroke="#00A1FF" strokeWidth={1} />
        ))}
        {unionSelectedRect && !isTouchDevice && (
          <Rect
            name="multi-transform-hit"
            x={unionSelectedRect.x}
            y={unionSelectedRect.y}
            width={unionSelectedRect.width}
            height={unionSelectedRect.height}
            fill="rgba(0,0,0,0.0001)"
            draggable
            dragBoundFunc={(pos) => {
              const W = unionSelectedRect?.width ?? 0;
              const H = unionSelectedRect?.height ?? 0;
              const cx = Math.max(0, Math.min(pos.x, width - W)) + W / 2;
              const cy = Math.max(0, Math.min(pos.y, height - H)) + H / 2;
              const snapX = Math.abs(cx - width / 2) <= 6;
              const snapY = Math.abs(cy - height / 2) <= 6;
              return {
                x: snapX ? width / 2 - W / 2 : Math.max(0, Math.min(pos.x, width - W)),
                y: snapY ? height / 2 - H / 2 : Math.max(0, Math.min(pos.y, height - H)),
              };
            }}
            onDragStart={handleUnionDragStart}
            onDragMove={handleUnionDragMove}
            onDragEnd={handleUnionDragEnd}
            onMouseDown={(e) => { e.cancelBubble = true; }}
            onClick={(e) => { e.cancelBubble = true; }}
          />
        )}
        <CustomTransformer ref={transformerRef} rotateEnabled={false} />
      </Layer>
    </Stage>
  );
};

export default Slide;
