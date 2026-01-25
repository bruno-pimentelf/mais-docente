import { v4 } from 'uuid';
import type { Slide } from '../types';
import type { SlideTheme } from './types/slide-theme.types';
import { DevelopmentTextSlideFactory } from './factories/development-text-slide.factory';
import { DevelopmentBulletSlideFactory } from './factories/development-bullet-slide.factory';
import { MainImageSlideFactory } from './factories/main-image-slide.factory';
import { TitleThreeRowsOneLeftImage1SlideFactory } from './factories/title-three-rows-one-left-image-1-slide.factory';
import { TableSlideFactory } from './factories/table-slide.factory';
import { ThreeStepSlideFactory } from './factories/three-step-slide.factory';
import { InteractiveMultipleChoiceSlideFactory } from './factories/interactive-multiple-choice-slide.factory';
import { QuoteSlideFactory } from './factories/quote-slide.factory';
import { BigNumberSlideFactory } from './factories/big-number-slide.factory';

export type TTemplateGroupId =
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

const PLACEHOLDER_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E`;

export async function createSlideFromTemplate(
  templateId: TTemplateGroupId,
  position: number,
  theme: SlideTheme,
  logo_path: string
): Promise<Slide> {
  switch (templateId) {
    case 'text': {
      const f = new DevelopmentTextSlideFactory(theme.developmentText);
      return f.create('Título', 'Adicione o conteúdo aqui.', logo_path, position);
    }
    case 'text_with_images': {
      const f = new MainImageSlideFactory(theme.mainImage);
      return f.create(null, 'Título', 'Adicione o conteúdo.', logo_path, position);
    }
    case 'topics': {
      const f = new DevelopmentBulletSlideFactory(theme.developmentBullet);
      return f.create(null, 'Título', ['• Item 1', '• Item 2', '• Item 3'], logo_path, position);
    }
    case 'topics_with_images': {
      const f = new TitleThreeRowsOneLeftImage1SlideFactory(theme.mainImage);
      return f.create(
        PLACEHOLDER_IMAGE,
        'Título',
        'Seção 1',
        'Texto 1',
        'Seção 2',
        'Texto 2',
        'Seção 3',
        'Texto 3',
        logo_path,
        position
      );
    }
    case 'table': {
      const f = new TableSlideFactory(theme.developmentText, theme.table);
      return f.create({ logo_path, slideOrder: position, title: 'Título' });
    }
    case 'timeline': {
      const f = new ThreeStepSlideFactory(theme.cards);
      return f.create(
        'Título',
        'Passo 1',
        'Descrição 1',
        'Passo 2',
        'Descrição 2',
        'Passo 3',
        'Descrição 3',
        logo_path,
        position
      );
    }
    case 'question': {
      const f = new InteractiveMultipleChoiceSlideFactory();
      return f.create(
        'Pergunta?',
        [
          { id: v4(), text: 'Opção A', isAnswer: false },
          { id: v4(), text: 'Opção B', isAnswer: true },
          { id: v4(), text: 'Opção C', isAnswer: false },
          { id: v4(), text: 'Opção D', isAnswer: false },
        ],
        position
      );
    }
    case 'quote': {
      const f = new QuoteSlideFactory(theme.conclusion);
      return f.create('Adicione a citação aqui.', 'Autor', logo_path, position);
    }
    case 'data': {
      const f = new BigNumberSlideFactory(theme.developmentText);
      return f.create('0', 'Linha 1', 'Linha 2', logo_path, position);
    }
    case 'crossword':
    case 'word_search': {
      const f = new DevelopmentTextSlideFactory(theme.developmentText);
      const label = templateId === 'crossword' ? 'Palavras cruzadas' : 'Caça-palavras';
      return f.create(label, 'Adicione o conteúdo ou use um template específico.', logo_path, position);
    }
    default: {
      const f = new DevelopmentTextSlideFactory(theme.developmentText);
      return f.create('Título', 'Adicione o conteúdo.', logo_path, position);
    }
  }
}
