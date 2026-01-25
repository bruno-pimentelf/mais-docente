import { v4 } from 'uuid';
import {
  Slide,
  SlideElementBaseTypes,
  SlideLayoutVariants,
  SlideText,
  SlideTextElementsVariants,
  SlideThemeType,
  SlideVariants,
  TextAlignment,
} from '../../types/index';
import {
  getLogoImageElement,
  getTextHeight,
  processMarkdownFormatting,
  SLIDE_CONTENT_MIN_Y,
  SLIDE_MARGIN,
  SLIDE_TEXT_Y_SPACING,
  getDecorativeImageElements,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { IDevelopmentTextSlideFactory } from './slide-factory.interface';

/**
 * Factory for creating development text slides
 * Follows Single Responsibility Principle - only creates development text slides
 */
export class DevelopmentTextSlideFactory implements IDevelopmentTextSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    const yPosition = SLIDE_CONTENT_MIN_Y;
    const spacing = SLIDE_TEXT_Y_SPACING;
    const titleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 96,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: 1383,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      x: SLIDE_MARGIN,
      y: yPosition,
      width: 1383,
      height: titleHeight,

      options: {
        isVisible: true,
        label: 'Summary Title',
      },
      fontSize: 96,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    const contentTextHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}">${processMarkdownFormatting(content_text)}</span>`,
      fontSize: 40,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: 1383,
    });

    const contentTextElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}">${processMarkdownFormatting(content_text)}</span>`,
      x: SLIDE_MARGIN,
      y: yPosition + titleHeight + spacing,
      width: 1383,
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
    const decorativeImageElements = getDecorativeImageElements(this.colors);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.PARAGRAPH_1,
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        titleElement,
        contentTextElement,
        logoImageElement,
        ...decorativeImageElements,
      ],
    };
  }
}
