import {
  Slide,
  SlideElementBaseTypes,
  SlideInteractiveElementsVariants,
  SlideLayoutVariants,
  SlideThemeType,
  SlideVariants,
} from '../../types';
import { processMarkdownFormatting } from '../helpers/slide-utils';
import { IInteractiveMultipleChoiceSlideFactory } from './slide-factory.interface';
import { v4 } from 'uuid';

export class InteractiveMultipleChoiceSlideFactory
  implements IInteractiveMultipleChoiceSlideFactory
{
  create(
    question: string,
    alternatives: { id: string; text: string; isAnswer: boolean }[],
    slideOrder: number,
    image_url?: string
  ): Slide {
    const alternativesElement =
      alternatives && alternatives.length > 0
        ? alternatives
        : [
            {
              id: v4(),
              text: '',
              isAnswer: true,
            },
            {
              id: v4(),
              text: '',
              isAnswer: false,
            },
            {
              id: v4(),
              text: '',
              isAnswer: false,
            },
            {
              id: v4(),
              text: '',
              isAnswer: false,
            },
          ];

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.INTERACTIVE_MULTIPLE_CHOICE,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.INTERACTIVE_MULTIPLE_CHOICE,
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: '#FFFFFF',
      },
      elements: [
        {
          id: v4(),
          type: SlideElementBaseTypes.INTERACTIVE,
          subtype: SlideInteractiveElementsVariants.MULTIPLE_CHOICE,
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          question: processMarkdownFormatting(question),
          alternatives: alternativesElement.map((alt) => ({
            ...alt,
            text: processMarkdownFormatting(alt.text),
          })),
          options: {
            isVisible: true,
            label: 'Interactive Multiple Choice',
          },
          image: image_url,
        },
      ],
    };
  }
}
