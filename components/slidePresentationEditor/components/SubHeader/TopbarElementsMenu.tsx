'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageIcon, RectangleHorizontal, Square, Table as TableIcon, Type, Video } from 'lucide-react';
import { SlideShapeElementsVariants } from '../../types';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';

type Props = {
  isPreview: boolean;
  isViewOnly?: boolean;
  handleMobileShapeClick?: () => void;
};

export default function TopbarElementsMenu({
  isPreview,
  isViewOnly,
  handleMobileShapeClick: _handleMobileShapeClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const selectedSlideId = useSlidePresentationEditorStore((s) => s.selectedSlide);
  const addParagraphElement = useSlidePresentationEditorStore((s) => s.addParagraphElement);
  const addShapeElement = useSlidePresentationEditorStore((s) => s.addShapeElement);
  const addImageElement = useSlidePresentationEditorStore((s) => s.addImageElement);
  const addTableElement = useSlidePresentationEditorStore((s) => s.addTableElement);
  const addVideoElement = useSlidePresentationEditorStore((s) => s.addVideoElement);
  const setTopbarElementsMenuHeight = useSlideEditorLayoutStore((s) => s.setTopbarElementsMenuHeight);

  const [shapeOpen, setShapeOpen] = useState(false);

  useEffect(() => {
    if (ref.current) setTopbarElementsMenuHeight(ref.current.offsetHeight || 0);
  }, [setTopbarElementsMenuHeight]);

  const addText = () => {
    if (!selectedSlideId) return;
    addParagraphElement({ text: 'Texto' });
  };

  const addShape = (type: SlideShapeElementsVariants) => {
    if (!selectedSlideId) return;
    addShapeElement({ type });
    setShapeOpen(false);
  };

  const onImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selectedSlideId) return;
    const fd = new FormData();
    fd.append('picture', file);
    try {
      const res = await fetch('/api/slide-editor/upload-picture', { method: 'POST', body: fd });
      if (res.ok) {
        const url = await res.json();
        const src = typeof url === 'string' ? url : url?.url ?? url?.src;
        if (src) addImageElement({ src, originalWidth: 400, originalHeight: 300 });
      }
    } catch (err) {
      console.error('Upload image:', err);
    }
  };

  const onVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selectedSlideId) return;
    const fd = new FormData();
    fd.append('video', file);
    try {
      const res = await fetch('/api/slide-editor/upload-picture', { method: 'POST', body: fd });
      if (res.ok) {
        const url = await res.json();
        const src = typeof url === 'string' ? url : url?.url ?? url?.src;
        if (src) addVideoElement({ src });
      } else {
        addVideoElement({ src: URL.createObjectURL(file) });
      }
    } catch {
      addVideoElement({ src: URL.createObjectURL(file) });
    }
  };

  const addTable = () => {
    if (!selectedSlideId) return;
    addTableElement({ rows: 3, cols: 3 });
  };

  if (isPreview || isViewOnly) return null;

  return (
    <div ref={ref} className="flex items-center gap-1">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageFile}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onVideoFile}
      />

      <button
        type="button"
        onClick={addText}
        className="flex size-8 items-center justify-center rounded transition-colors hover:bg-gray-100"
        title="Adicionar texto"
      >
        <Type className="size-4" />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShapeOpen((o) => !o)}
          className="flex size-8 items-center justify-center rounded transition-colors hover:bg-gray-100"
          title="Adicionar forma"
        >
          <RectangleHorizontal className="size-4" />
        </button>
        {shapeOpen && (
          <div className="absolute top-full left-0 z-20 mt-1 flex rounded border border-gray-200 bg-white py-1 shadow">
            <button
              type="button"
              onClick={() => addShape(SlideShapeElementsVariants.RECTANGLE)}
              className="flex px-3 py-1 hover:bg-gray-100"
              title="Retângulo"
            >
              <RectangleHorizontal className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => addShape(SlideShapeElementsVariants.CIRCLE)}
              className="flex px-3 py-1 hover:bg-gray-100"
              title="Círculo"
            >
              <Square className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => addShape(SlideShapeElementsVariants.LINE)}
              className="flex px-3 py-1 hover:bg-gray-100"
              title="Linha"
            >
              <span className="text-xs font-bold">—</span>
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        className="flex size-8 items-center justify-center rounded transition-colors hover:bg-gray-100"
        title="Adicionar imagem"
      >
        <ImageIcon className="size-4" />
      </button>

      <button
        type="button"
        onClick={addTable}
        className="flex size-8 items-center justify-center rounded transition-colors hover:bg-gray-100"
        title="Adicionar tabela"
      >
        <TableIcon className="size-4" />
      </button>

      <button
        type="button"
        onClick={() => videoInputRef.current?.click()}
        className="flex size-8 items-center justify-center rounded transition-colors hover:bg-gray-100"
        title="Adicionar vídeo"
      >
        <Video className="size-4" />
      </button>
    </div>
  );
}
