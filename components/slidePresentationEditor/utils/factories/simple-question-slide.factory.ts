import {
  Slide,
  SlideElementBaseTypes,
  SlideLayoutVariants,
  SlideText,
  SlideTextElementsVariants,
  SlideThemeType,
  SlideVariants,
  TextAlignment,
  SlideImageElementsVariants,
  SlideImage,
} from '../../types/index';
import {
  getLogoImageElement,
  getTextHeight,
  processMarkdownFormatting,
  SLIDE_IMAGE_BORDER_RADIUS,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ISimpleQuestionSlideFactory } from './slide-factory.interface';
import { v4 } from 'uuid';

/**
 * Factory for creating simple question slides
 * Follows Single Responsibility Principle - only creates simple question slides
 */
export class SimpleQuestionSlideFactory implements ISimpleQuestionSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    question: string,
    content_text: string,
    lara_img_path: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    // Calculate the centered position for the question
    const slideWidth = 1920;
    const questionWidth = 1400; // Generous width for the question
    const questionX = (slideWidth - questionWidth) / 2;

    // Lara image element
    const width = 250;
    const height = 386;
    const x = 193;
    const y = 693;

    // Calculate question height to center it vertically
    const questionHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(question)}</span>`,
      fontSize: 72,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: questionWidth,
    });

    const questionY = 200;
    const spacing = 20; // Space between question and content text

    const questionElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}; font-weight: bold;">${processMarkdownFormatting(question)}</span>`,
      x: questionX,
      y: questionY,
      width: questionWidth,
      height: questionHeight,

      options: {
        isVisible: true,
        label: 'Question Text',
      },
      fontSize: 72,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.2,
    };

    // Calculate content text height and position it below the question
    const contentTextHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}">${processMarkdownFormatting(content_text)}</span>`,
      fontSize: 40,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: questionWidth,
    });

    const contentTextElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}">${processMarkdownFormatting(content_text)}</span>`,
      x: questionX,
      y: questionY + questionHeight + spacing,
      width: questionWidth,
      height: contentTextHeight,

      options: {
        isVisible: true,
        label: 'Content Text',
      },
      fontSize: 40,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };

    const logoImageElement = getLogoImageElement(logo_path);

    const laraImageElement: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: lara_img_path,
      x: x,
      y: y,
      width: width,
      height: height,
      borderRadius: SLIDE_IMAGE_BORDER_RADIUS,

      options: {
        isVisible: true,
        label: 'Lara Image',
      },
    };

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.PARAGRAPH_1, // Reusing existing theme type
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        questionElement,
        contentTextElement,
        laraImageElement,
        logoImageElement,
      ],
    };
  }
}
