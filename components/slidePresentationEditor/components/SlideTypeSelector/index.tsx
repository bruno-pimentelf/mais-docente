import { useState } from 'react';
import { motion } from 'motion/react';
import useMediaQuery from '../../hooks/useMediaQuery';
import {
  detectCurrentTheme,
  useSlidePresentationEditorStore,
} from '@/zustand/useSlidePresentationEditorStore';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import { Button } from '@/components/ui/button';
import { createSlideFromTemplate } from '@/components/slidePresentationEditor/utils/createSlideFromTemplate';
import type { SlideTheme } from '@/components/slidePresentationEditor/utils/types/slide-theme.types';

type TTemplateGroupId =
  | 'text'
  | 'text_with_images'
  | 'topics'
  | 'topics_with_images'
  | 'table'
  | 'timeline'
  | 'question'
  | 'quote'
  | 'data'
  | 'crossword'
  | 'word_search';

const templateGroups: {
  id: TTemplateGroupId;
  multiple: boolean;
  icon: string;
  isInteractive?: boolean;
}[] = [
  {
    id: 'text',
    multiple: true,
    icon: '/images/interactive-classes/slide-presentation-editor/templates/DEVELOPMENT_TEXT.svg',
  },
  {
    id: 'text_with_images',
    multiple: true,
    icon: '/images/interactive-classes/slide-presentation-editor/templates/MAIN_IMAGE.svg',
  },
  {
    id: 'topics',
    multiple: true,
    icon: '/images/interactive-classes/slide-presentation-editor/templates/TOPICS.svg',
  },
  {
    id: 'topics_with_images',
    multiple: true,
    icon: '/images/interactive-classes/slide-presentation-editor/templates/TITLE_THREE_ROWS_ONE_LEFT_IMAGE_1.svg',
  },
  {
    id: 'table',
    multiple: false,
    icon: '/images/interactive-classes/slide-presentation-editor/templates/TABLE.svg',
  },
  {
    id: 'timeline',
    multiple: true,
    icon: '/images/interactive-classes/slide-presentation-editor/templates/THREE_STEP.svg',
  },
  {
    id: 'question',
    multiple: false,
    isInteractive: true,
    icon: '/images/interactive-classes/slide-presentation-editor/templates/INTERACTIVE_QUIZ.svg',
  },
  {
    id: 'crossword',
    multiple: false,
    icon: '/images/interactive-classes/slide-presentation-editor/templates/CROSSWORD.svg',
  },
  {
    id: 'word_search',
    multiple: false,
    icon: '/images/interactive-classes/slide-presentation-editor/templates/WORD_SEARCH.svg',
  },
  {
    id: 'quote',
    multiple: false,
    icon: '/images/interactive-classes/slide-presentation-editor/templates/QUOTE.svg',
  },
  {
    id: 'data',
    multiple: false,
    icon: '/images/interactive-classes/slide-presentation-editor/templates/BIG_NUMBER.svg',
  },
];

const t = (k: string) =>
  ({
    'slideTypeSelector.title': 'Escolha o tipo de slide',
    'slideTypeSelector.createBlank': 'Criar em branco',
    'slideTypeSelector.describe': 'Descreva o conteúdo',
    'slideTypeSelector.chooseType': 'Escolha o tipo',
    'slideTypeSelector.create': 'Criar',
    'slideTypeSelector.interactive': 'Interativo',
    'slideTypeSelector.templateGroups.text': 'Texto',
    'slideTypeSelector.templateGroups.text_with_images': 'Texto com imagens',
    'slideTypeSelector.templateGroups.topics': 'Tópicos',
    'slideTypeSelector.templateGroups.topics_with_images': 'Tópicos com imagens',
    'slideTypeSelector.templateGroups.table': 'Tabela',
    'slideTypeSelector.templateGroups.timeline': 'Linha do tempo',
    'slideTypeSelector.templateGroups.question': 'Pergunta',
    'slideTypeSelector.templateGroups.crossword': 'Palavras cruzadas',
    'slideTypeSelector.templateGroups.word_search': 'Caça-palavras',
    'slideTypeSelector.templateGroups.quote': 'Citação',
    'slideTypeSelector.templateGroups.data': 'Dado',
    'fillWithAi.placeholder': 'Ex: explique o ciclo da água',
  })[k] ?? k;

function SlideTypeSelectorItem({
  name,
  icon,
  isSelected,
  tag,
  onClick,
}: {
  name: string;
  icon: string;
  isSelected: boolean;
  tag?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col p-2 gap-2 rounded-lg ${isSelected ? 'bg-[#EDF2FF]' : 'hover:bg-ds-gray-100 active:bg-[#EDF2FF]'} transition duration-200 ease-out`}
    >
      {isSelected && (
        <motion.span
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, type: 'tween', ease: 'easeOut' }}
          className="absolute top-1 right-1 rounded-full p-1 bg-ds-blue-normal z-20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="white"
            className="size-4"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2, type: 'tween', ease: 'easeInOut' }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </motion.span>
      )}
      <div className="relative">
        <img
          src={icon}
          alt={name}
          className={`relative w-52 transition duration-300 ease-out z-10 ${isSelected ? 'rotate-0' : 'group-hover:rotate-3 group-hover:scale-[1.03]'}`}
          onError={(e) => {
            e.currentTarget.src =
              '/images/interactive-classes/slide-presentation-editor/templates/DEFAULT.svg';
          }}
        />
        <div
          style={{ transform: 'rotate(-4deg)' }}
          className="absolute inset-0 rounded-lg bg-ds-tag-blue"
        />
      </div>
      <div className="flex items-center justify-between gap-1 px-0.5">
        <span className="font-rubik text-sm text-ds-gray-900">{name}</span>
        {tag && (
          <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-ds-tag-blue text-ds-gray-900">
            {tag}
          </span>
        )}
      </div>
    </button>
  );
}

export default function SlideTypeSelector() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const addSlideAtPosition = useSlidePresentationEditorStore(
    (state) => state.addSlideAtPosition
  );
  const currentSlidePosition = useSlidePresentationEditorStore((state) =>
    state.slides.findIndex((slide) => slide.id === state.selectedSlide)
  );
  const closeCreateWithAi = useSlideEditorLayoutStore(
    (state) => state.closeCreateWithAi
  );
  const isCreateWithAiOpen = useSlideEditorLayoutStore(
    (state) => state.createWithAi.isOpen
  );
  const position = useSlideEditorLayoutStore(
    (state) => state.createWithAi.position
  );
  const bottomMenuHeight = useSlideEditorLayoutStore(
    (state) => state.bottomMenuHeight
  );

  const finalPosition = position ?? currentSlidePosition + 1;

  const [selectedSlideType, setSelectedSlideType] =
    useState<TTemplateGroupId>('text');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateBlankSlide = () => {
    addSlideAtPosition({ position: finalPosition });
    closeCreateWithAi();
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      const state = useSlidePresentationEditorStore.getState();
      const theme = (state.currentTheme ||
        detectCurrentTheme(state)) as SlideTheme;
      const logo =
        state.logo_path ?? '/images/icons/lara-icon-talk.svg';
      const slide = await createSlideFromTemplate(
        selectedSlideType,
        finalPosition,
        theme,
        logo
      );
      addSlideAtPosition({ position: finalPosition, slide });
      closeCreateWithAi();
    } catch (err) {
      console.error('createSlideFromTemplate failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isCreateWithAiOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30"
      onClick={() => closeCreateWithAi()}
      onKeyDown={(e) => e.key === 'Escape' && closeCreateWithAi()}
    >
      <div
        className="relative flex flex-col bg-[#F7F9FC] rounded-lg shadow-xl max-w-5xl w-[95vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            maxHeight: isMobile ? `calc(80dvh - ${bottomMenuHeight}px)` : 'none',
          }}
          className="relative flex flex-col gap-6 md:gap-10 px-4 py-8 md:px-8 overflow-y-auto"
        >
          <div className="relative flex flex-col md:items-center gap-4 md:gap-6 w-full">
            <span className="font-quicksand text-xl md:text-3xl font-bold text-ds-gray-900">
              {t('slideTypeSelector.title')}
            </span>
            <button
              type="button"
              onClick={handleCreateBlankSlide}
              className="absolute top-3 right-0 underline font-quicksand text-xxs md:text-xs font-bold text-ds-gray-500"
            >
              {t('slideTypeSelector.createBlank')}
            </button>
            <div className="flex flex-col gap-2 w-full">
              <div className="font-quicksand text-sm md:text-base font-bold text-ds-gray-900">
                <span>{t('slideTypeSelector.describe')}</span>
                <span className="text-base leading-4 font-bold text-ds-danger-normal">
                  {' '}
                  *
                </span>
              </div>
              <textarea
                placeholder={t('fillWithAi.placeholder')}
                rows={6}
                className="resize-none border border-ds-gray-200 bg-white rounded-lg px-3 py-2 shadow-md"
                readOnly
                disabled
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-quicksand text-sm md:text-base font-bold text-ds-gray-900">
              {t('slideTypeSelector.chooseType')}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
              {templateGroups.map((group) => (
                <SlideTypeSelectorItem
                  key={group.id}
                  name={t(`slideTypeSelector.templateGroups.${group.id}`)}
                  icon={group.icon}
                  isSelected={selectedSlideType === group.id}
                  onClick={() => setSelectedSlideType(group.id)}
                  tag={
                    group.isInteractive
                      ? t('slideTypeSelector.interactive')
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white p-2 border-t border-ds-gray-100 z-30 rounded-b-lg">
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? 'A criar...' : t('slideTypeSelector.create')}
          </Button>
        </div>
      </div>
    </div>
  );
}
