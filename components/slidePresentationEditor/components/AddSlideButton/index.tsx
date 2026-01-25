import { PlusCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { memo } from 'react';
import useMediaQuery from '../../hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';

const t = (k: string) => ({ 'leftSidebar.new': 'Novo slide' })[k] ?? k;

function AddSlideButton({ position }: { position?: number }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const openCreateWithAi = useSlideEditorLayoutStore(
    (state) => state.openCreateWithAi
  );

  const handleClick = () => {
    openCreateWithAi(position !== undefined ? { position } : undefined);
  };

  if (isMobile) {
    return (
      <button
        onClick={handleClick}
        className="z-10 rounded-full border border-cinza-200 bg-white stroke-cinza-900 shadow-sm"
      >
        <PlusCircleIcon className="size-10 p-2" />
      </button>
    );
  }

  return (
    <Button
      variant="default"
      onClick={handleClick}
      className="w-full gap-2"
    >
      <SparklesIcon className="size-5 stroke-ds-gray-900" />
      {t('leftSidebar.new')}
    </Button>
  );
}

export default memo(AddSlideButton);
