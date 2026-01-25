import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useEffect, useRef, useState } from 'react';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { Button } from '@/components/ui/button';

type Props = {
  onBack?: () => void;
  hideHeader?: boolean;
};

function Title() {
  const title = useSlidePresentationEditorStore((s) => s.title);
  const updateTitle = useSlidePresentationEditorStore((s) => s.updateTitle);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);

  useEffect(() => {
    setVal(title);
  }, [title]);

  if (editing) {
    return (
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => {
          updateTitle(val || 'Apresentação');
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            updateTitle(val || 'Apresentação');
            setEditing(false);
          }
        }}
        autoFocus
        className="max-w-[320px] border-b border-blue-500 bg-transparent font-semibold text-ds-gray-900 outline-none"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="max-w-[320px] truncate text-left font-semibold text-ds-gray-900 hover:underline"
    >
      {title || 'Apresentação'}
    </button>
  );
}

export default function Header({ onBack, hideHeader = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const setHeaderBarHeight = useSlideEditorLayoutStore((s) => s.setHeaderBarHeight);

  useEffect(() => {
    if (hideHeader) {
      setHeaderBarHeight(0);
      return;
    }
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setHeaderBarHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [hideHeader, setHeaderBarHeight]);

  if (hideHeader) return null;

  return (
    <div
      ref={ref}
      className="flex items-center gap-3 border-b border-cinza-100 bg-white px-4 py-2"
    >
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeftIcon className="size-5" />
        </Button>
      )}
      <Title />
    </div>
  );
}
