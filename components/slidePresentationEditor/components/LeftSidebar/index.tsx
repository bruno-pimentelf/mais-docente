import { AnimatePresence, motion } from 'motion/react';
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type React from 'react';
import { SlidePreview } from './SlidePreview';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import AddSlideButton from '../AddSlideButton';
import { useShallow } from 'zustand/react/shallow';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';

function DropZone({
  isActive,
  onDragOver,
  onDrop,
}: {
  isActive: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`my-1 h-2 w-full rounded-sm transition-colors ${
        isActive ? 'bg-azul/60' : 'bg-transparent'
      }`}
      aria-hidden
    />
  );
}

function LeftSidebar({
  isViewOnly,
  hideHeader,
}: {
  isViewOnly?: boolean;
  hideHeader?: boolean;
}) {
  const reorderSlides = useSlidePresentationEditorStore(
    (state) => state.reorderSlides
  );
  const numSlides = useSlidePresentationEditorStore(
    (state) => state.slides.length
  );
  const slideIds = useSlidePresentationEditorStore(
    useShallow((state) => state.slides.map((slide) => slide.id))
  );

  const headerBarHeight = useSlideEditorLayoutStore(
    (state) => state.headerBarHeight
  );

  const isGenerating = useSlideEditorLayoutStore((state) => state.isGenerating);

  const [dragState, setDragState] = useState<{
    activeIndex: number | null;
    overIndex: number | null;
    isDragging: boolean;
    usingHandle: boolean;
    insertIndex: number | null;
    placeholderTop: number | null;
    fixedInsertIndex: number | null;
  }>({
    activeIndex: null,
    overIndex: null,
    isDragging: false,
    usingHandle: false,
    insertIndex: null,
    placeholderTop: null,
    fixedInsertIndex: null,
  });

  const listRef = useRef<HTMLUListElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const virtualizer = useVirtualizer({
    count: slideIds.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 140,
    overscan: 2,
    getItemKey: (index) => slideIds[index],
  });

  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const handleKeyMove = useCallback(
    (currentIndex: number, direction: -1 | 1) => {
      const toIndex = Math.max(
        0,
        Math.min(numSlides - 1, currentIndex + direction)
      );
      if (toIndex === currentIndex) return;
      reorderSlides({ fromIndex: currentIndex, toIndex });
    },
    [reorderSlides, numSlides]
  );

  const onDragStart = useCallback((ev: React.DragEvent<HTMLLIElement>) => {
    const li = ev.currentTarget;
    const index = Number(li.dataset.index);
    setDragState((s) => ({
      ...s,
      activeIndex: index,
      isDragging: true,
      usingHandle: true,
    }));
    li.classList.add('dragging');
    ev.dataTransfer.effectAllowed = 'move';
    try {
      ev.dataTransfer.setData('text/plain', String(index));
    } catch {}
    const ghost = document.createElement('div');
    ghost.style.position = 'absolute';
    ghost.style.top = '-9999px';
    ghost.style.left = '-9999px';
    ghost.style.width = '80px';
    ghost.style.height = '24px';
    ghost.style.borderRadius = '6px';
    ghost.style.background = 'rgba(0,0,0,0.06)';
    ghost.style.display = 'flex';
    ghost.style.alignItems = 'center';
    ghost.style.justifyContent = 'center';
    ghost.style.fontSize = '12px';
    ghost.style.color = '#111827';
    ghost.textContent = `Slide ${index + 1}`;
    document.body.appendChild(ghost);
    ev.dataTransfer.setDragImage(ghost, 10, 12);
    setTimeout(() => document.body.removeChild(ghost), 0);
    li.setAttribute('aria-grabbed', 'true');
  }, []);

  const findClosestIndex = useCallback(
    (target: EventTarget | null): number | null => {
      if (!listRef.current) return null;
      const li = (target as HTMLElement)?.closest(
        'li[data-index]'
      ) as HTMLLIElement | null;
      if (!li) return null;
      return Number(li.dataset.index);
    },
    []
  );

  const findInsertIndexFromPoint = useCallback(
    (
      clientY: number
    ): { insertIndex: number; placeholderTop: number } | null => {
      if (!listRef.current) return null;
      const items = Array.from(
        listRef.current.querySelectorAll('li[data-index]')
      ) as HTMLLIElement[];
      if (items.length === 0) return { insertIndex: 0, placeholderTop: 0 };

      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        if (clientY < rect.top) {
          return { insertIndex: i, placeholderTop: items[i].offsetTop };
        }
        if (clientY >= rect.top && clientY < midpoint) {
          return { insertIndex: i, placeholderTop: items[i].offsetTop };
        }
        if (clientY >= midpoint && clientY < rect.bottom) {
          return {
            insertIndex: i + 1,
            placeholderTop: items[i].offsetTop + items[i].offsetHeight,
          };
        }
      }
      const last = items[items.length - 1];
      return {
        insertIndex: items.length,
        placeholderTop: last.offsetTop + last.offsetHeight,
      };
    },
    []
  );

  const onDragOver = useCallback(
    (ev: React.DragEvent<HTMLUListElement>) => {
      ev.preventDefault();
      try {
        ev.dataTransfer.dropEffect = 'move';
      } catch {}
      if (!dragState.isDragging) return;
      const schedule = () => {
        if (dragState.fixedInsertIndex !== null) {
          if (!listRef.current) return;
          const items = Array.from(
            listRef.current.querySelectorAll('li[data-index]')
          ) as HTMLLIElement[];
          let placeholderTop = 0;
          if (items.length === 0) placeholderTop = 0;
          else if (dragState.fixedInsertIndex <= 0)
            placeholderTop = items[0].offsetTop;
          else if (dragState.fixedInsertIndex >= items.length) {
            const last = items[items.length - 1];
            placeholderTop = last.offsetTop + last.offsetHeight;
          } else {
            const li = items[dragState.fixedInsertIndex] as HTMLLIElement;
            placeholderTop = li.offsetTop;
          }
          if (
            dragState.insertIndex !== dragState.fixedInsertIndex ||
            dragState.placeholderTop !== placeholderTop
          ) {
            setDragState((s) => ({
              ...s,
              insertIndex: dragState.fixedInsertIndex,
              placeholderTop,
            }));
          }
          return;
        }

        const idx = findClosestIndex(ev.target);
        if (!listRef.current) return;

        let nextInsertIndex: number | null = null;
        let nextPlaceholderTop: number | null = null;
        let overIndex: number | null = null;

        if (idx !== null) {
          const li = listRef.current.querySelector(
            `li[data-index="${idx}"]`
          ) as HTMLLIElement | null;
          if (li) {
            const rect = li.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (ev.clientY < midpoint) {
              nextInsertIndex = idx;
              nextPlaceholderTop = li.offsetTop;
            } else {
              nextInsertIndex = idx + 1;
              nextPlaceholderTop = li.offsetTop + li.offsetHeight;
            }
            overIndex = idx;
          }
        } else {
          const res = findInsertIndexFromPoint(ev.clientY);
          if (res) {
            nextInsertIndex = res.insertIndex;
            nextPlaceholderTop = res.placeholderTop;
            overIndex = Math.min(
              res.insertIndex - 1,
              (listRef.current.querySelectorAll('li[data-index]').length || 1) -
                1
            );
          }
        }

        if (nextInsertIndex !== null && nextPlaceholderTop !== null) {
          if (
            nextInsertIndex !== dragState.insertIndex ||
            nextPlaceholderTop !== dragState.placeholderTop ||
            overIndex !== dragState.overIndex
          ) {
            setDragState((s) => ({
              ...s,
              overIndex: overIndex,
              insertIndex: nextInsertIndex!,
              placeholderTop: nextPlaceholderTop!,
            }));
          }
        }
      };
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(schedule);
    },
    [
      dragState.isDragging,
      dragState.fixedInsertIndex,
      dragState.overIndex,
      dragState.insertIndex,
      dragState.placeholderTop,
      findClosestIndex,
      findInsertIndexFromPoint,
    ]
  );

  const onDrop = useCallback(
    (ev: React.DragEvent<HTMLUListElement>) => {
      ev.preventDefault();
      if (dragState.activeIndex == null) return;
      let toIndex =
        dragState.fixedInsertIndex ??
        dragState.insertIndex ??
        dragState.activeIndex;
      if (dragState.activeIndex != null && toIndex > dragState.activeIndex) {
        toIndex -= 1;
      }
      if (toIndex !== dragState.activeIndex) {
        reorderSlides({ fromIndex: dragState.activeIndex, toIndex });
      }
      setDragState({
        activeIndex: null,
        overIndex: null,
        isDragging: false,
        usingHandle: false,
        insertIndex: null,
        placeholderTop: null,
        fixedInsertIndex: null,
      });
    },
    [
      reorderSlides,
      dragState.activeIndex,
      dragState.fixedInsertIndex,
      dragState.insertIndex,
    ]
  );

  const onDragEnd = useCallback((ev: React.DragEvent<HTMLLIElement>) => {
    const li = ev.currentTarget;
    li.classList.remove('dragging');
    li.setAttribute('aria-grabbed', 'false');
    setDragState({
      activeIndex: null,
      overIndex: null,
      isDragging: false,
      usingHandle: false,
      insertIndex: null,
      placeholderTop: null,
      fixedInsertIndex: null,
    });
  }, []);

  const keyHandlers = useCallback(
    (index: number) => (e: React.KeyboardEvent<HTMLLIElement>) => {
      if (e.key === 'Enter') {
        setDragState((s) => {
          const next = { ...s };
          if (!s.isDragging) {
            next.activeIndex = index;
            next.isDragging = true;
          } else {
            next.isDragging = false;
            next.activeIndex = null;
            next.overIndex = null;
          }
          return next;
        });
        return;
      }
      if (dragState.isDragging) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          handleKeyMove(index, -1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          handleKeyMove(index, 1);
        } else if (e.key === 'Escape') {
          setDragState({
            activeIndex: null,
            overIndex: null,
            isDragging: false,
            usingHandle: false,
            insertIndex: null,
            placeholderTop: null,
            fixedInsertIndex: null,
          });
        }
      }
    },
    [dragState.isDragging, handleKeyMove]
  );

  return (
    <aside
      className="hidden min-w-72 max-w-72 flex-col overflow-y-auto border-r border-cinza-100 bg-white md:flex"
      style={{
        height: `calc(100vh - ${headerBarHeight}px - 58px)`,
      }}
    >
      {!isGenerating && !isViewOnly && !hideHeader && (
        <div
          className="sticky top-0 z-10 min-h-[65px] bg-white p-3"
          id="new-slide-button"
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <AddSlideButton />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <ul
        ref={listRef}
        className={`slides relative flex flex-col gap-0 px-4 pb-4 ${isGenerating || isViewOnly ? 'mt-4' : ''}`}
        role="list"
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          height: '100%',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <li aria-hidden>
            <DropZone
              isActive={dragState.isDragging && dragState.insertIndex === 0}
              onDragOver={(e) => {
                if (!dragState.isDragging) return;
                e.preventDefault();
                e.stopPropagation();
                setDragState((s) => ({
                  ...s,
                  insertIndex: 0,
                  fixedInsertIndex: 0,
                }));
              }}
              onDrop={(e) => {
                if (dragState.activeIndex == null) return;
                e.preventDefault();
                e.stopPropagation();
                let toIndex = 0;
                if (
                  dragState.activeIndex != null &&
                  toIndex > dragState.activeIndex
                ) {
                  toIndex -= 1;
                }
                if (toIndex !== dragState.activeIndex) {
                  reorderSlides({ fromIndex: dragState.activeIndex, toIndex });
                }
                setDragState({
                  activeIndex: null,
                  overIndex: null,
                  isDragging: false,
                  usingHandle: false,
                  insertIndex: null,
                  placeholderTop: null,
                  fixedInsertIndex: null,
                });
              }}
            />
          </li>

          {virtualizer.getVirtualItems().map((virtualItem) => (
            <Fragment key={virtualItem.key}>
              <li
                data-index={virtualItem.index}
                data-index-virtual={virtualItem.index}
                className="slide group relative rounded-xl outline-none focus:ring-2 focus:ring-azul cursor-grab active:cursor-grabbing"
                role="listitem"
                aria-grabbed="false"
                aria-dropeffect="move"
                draggable={!isGenerating && !isViewOnly}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onKeyDown={keyHandlers(virtualItem.index)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  minHeight: '160px',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                onDragOver={(e) => {
                  if (!dragState.isDragging) return;
                  e.preventDefault();
                  e.stopPropagation();
                  const li = e.currentTarget as HTMLLIElement;
                  const rect = li.getBoundingClientRect();
                  const midpoint = rect.top + rect.height / 2;
                  const dropBefore = e.clientY < midpoint;
                  const nextInsertIndex = dropBefore
                    ? virtualItem.index
                    : virtualItem.index + 1;
                  const placeholderTop = dropBefore
                    ? li.offsetTop
                    : li.offsetTop + li.offsetHeight;
                  setDragState((s) => ({
                    ...s,
                    fixedInsertIndex: null,
                    insertIndex: nextInsertIndex,
                    placeholderTop,
                  }));
                }}
                onDrop={(e) => {
                  if (dragState.activeIndex == null) return;
                  e.preventDefault();
                  e.stopPropagation();
                  const li = e.currentTarget as HTMLLIElement;
                  const rect = li.getBoundingClientRect();
                  const midpoint = rect.top + rect.height / 2;
                  const dropBefore = e.clientY < midpoint;
                  let toIndex = dropBefore
                    ? virtualItem.index
                    : virtualItem.index + 1;
                  if (
                    dragState.activeIndex != null &&
                    toIndex > dragState.activeIndex
                  ) {
                    toIndex -= 1;
                  }
                  if (toIndex !== dragState.activeIndex) {
                    reorderSlides({
                      fromIndex: dragState.activeIndex,
                      toIndex,
                    });
                  }
                  setDragState({
                    activeIndex: null,
                    overIndex: null,
                    isDragging: false,
                    usingHandle: false,
                    insertIndex: null,
                    placeholderTop: null,
                    fixedInsertIndex: null,
                  });
                }}
                tabIndex={0}
              >
                <div className="flex-1">
                  <SlidePreview
                    disableContextMenu={isViewOnly || isGenerating}
                    disableClick={isGenerating}
                    slideUuid={slideIds[virtualItem.index]}
                  />
                </div>
              </li>
              <li
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start + virtualItem.size}px)`,
                }}
              >
                <DropZone
                  isActive={
                    dragState.isDragging &&
                    dragState.insertIndex === virtualItem.index + 1
                  }
                  onDragOver={(e) => {
                    if (!dragState.isDragging) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setDragState((s) => ({
                      ...s,
                      insertIndex: virtualItem.index + 1,
                      fixedInsertIndex: virtualItem.index + 1,
                    }));
                  }}
                  onDrop={(e) => {
                    if (dragState.activeIndex == null) return;
                    e.preventDefault();
                    e.stopPropagation();
                    let toIndex = virtualItem.index + 1;
                    if (
                      dragState.activeIndex != null &&
                      toIndex > dragState.activeIndex
                    ) {
                      toIndex -= 1;
                    }
                    if (toIndex !== dragState.activeIndex) {
                      reorderSlides({
                        fromIndex: dragState.activeIndex,
                        toIndex,
                      });
                    }
                    setDragState({
                      activeIndex: null,
                      overIndex: null,
                      isDragging: false,
                      usingHandle: false,
                      insertIndex: null,
                      placeholderTop: null,
                      fixedInsertIndex: null,
                    });
                  }}
                />
              </li>
            </Fragment>
          ))}
        </div>
      </ul>
    </aside>
  );
}

export default memo(LeftSidebar);
