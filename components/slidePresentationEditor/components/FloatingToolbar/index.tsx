'use client';

import { useRef } from 'react';
import {
  ImageIcon,
  RectangleHorizontal,
  Circle,
  Minus,
  Table as TableIcon,
  Type,
  Video,
  Undo2,
  Redo2,
  Palette,
} from 'lucide-react';
import { SlideShapeElementsVariants } from '../../types';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ToolButtonProps = {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
};

function ToolButton({ onClick, icon, label, isActive, disabled }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`
            flex size-12 items-center justify-center rounded-full
            bg-white shadow-lg border border-gray-100
            transition-all duration-200 ease-out
            hover:scale-110 hover:shadow-xl hover:bg-gray-50
            active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
            ${isActive ? 'bg-blue-50 border-blue-200 text-blue-600' : 'text-gray-700'}
          `}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

type Props = {
  isViewOnly?: boolean;
};

export default function FloatingToolbar({ isViewOnly }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const selectedSlideId = useSlidePresentationEditorStore((s) => s.selectedSlide);
  const addParagraphElement = useSlidePresentationEditorStore((s) => s.addParagraphElement);
  const addShapeElement = useSlidePresentationEditorStore((s) => s.addShapeElement);
  const addImageElement = useSlidePresentationEditorStore((s) => s.addImageElement);
  const addTableElement = useSlidePresentationEditorStore((s) => s.addTableElement);
  const addVideoElement = useSlidePresentationEditorStore((s) => s.addVideoElement);

  const setSlideSidebar = useSlideEditorLayoutStore((s) => s.setSlideSidebar);
  const openSidebar = useSlideEditorLayoutStore((s) => s.openSidebar);

  const { undo, redo, pastStates, futureStates } =
    useSlidePresentationEditorStore.temporal.getState();
  const isUndoEnabled = pastStates.length > 0;
  const isRedoEnabled = futureStates.length > 0;

  const addText = () => {
    if (!selectedSlideId) return;
    addParagraphElement({ text: 'Texto' });
  };

  const addShape = (type: SlideShapeElementsVariants) => {
    if (!selectedSlideId) return;
    addShapeElement({ type });
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

  if (isViewOnly) return null;

  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full bg-white/80 backdrop-blur-xl px-4 py-3 shadow-2xl border border-gray-200/50">
        {/* Undo/Redo */}
        <div className="flex items-center gap-2">
          <ToolButton
            onClick={() => undo()}
            icon={<Undo2 className="size-5" />}
            label="Desfazer"
            disabled={!isUndoEnabled}
          />
          <ToolButton
            onClick={() => redo()}
            icon={<Redo2 className="size-5" />}
            label="Refazer"
            disabled={!isRedoEnabled}
          />
        </div>

        <div className="h-8 w-px bg-gray-200" />

        {/* Theme */}
        <ToolButton
          onClick={() => setSlideSidebar(openSidebar === 'theme' ? null : 'theme')}
          icon={<Palette className="size-5" />}
          label="Temas"
          isActive={openSidebar === 'theme'}
        />

        <div className="h-8 w-px bg-gray-200" />

        {/* Elements */}
        <div className="flex items-center gap-2">
          <ToolButton
            onClick={addText}
            icon={<Type className="size-5" />}
            label="Texto"
          />
          <ToolButton
            onClick={() => addShape(SlideShapeElementsVariants.RECTANGLE)}
            icon={<RectangleHorizontal className="size-5" />}
            label="Retangulo"
          />
          <ToolButton
            onClick={() => addShape(SlideShapeElementsVariants.CIRCLE)}
            icon={<Circle className="size-5" />}
            label="Circulo"
          />
          <ToolButton
            onClick={() => addShape(SlideShapeElementsVariants.LINE)}
            icon={<Minus className="size-5" />}
            label="Linha"
          />
          <ToolButton
            onClick={() => imageInputRef.current?.click()}
            icon={<ImageIcon className="size-5" />}
            label="Imagem"
          />
          <ToolButton
            onClick={addTable}
            icon={<TableIcon className="size-5" />}
            label="Tabela"
          />
          <ToolButton
            onClick={() => videoInputRef.current?.click()}
            icon={<Video className="size-5" />}
            label="Video"
          />
        </div>

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
      </div>
    </div>
  );
}
