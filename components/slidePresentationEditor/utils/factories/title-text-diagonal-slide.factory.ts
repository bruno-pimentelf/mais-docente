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
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
  getDecorativeImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleTextDiagonalSlideFactory } from './slide-factory.interface';

export class TitleTextDiagonalSlideFactory
  implements ITitleTextDiagonalSlideFactory
{
  constructor(private colors: SlideTypeColors) {}

  create(
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Title at top-left
    const titleX = SLIDE_MARGIN;
    const titleY = SLIDE_ELEMENT_MIN_Y;
    const titleWidth = Math.floor(slideWidth / 2) - SLIDE_MARGIN; // 1/2 of slide width

    const titleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 110,
      fontFamily: 'Quicksand',
      lineHeight: 1.0,
      width: titleWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      x: titleX,
      y: titleY,
      width: titleWidth,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: 110,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.0,
    };

    // Paragraph at bottom-right
    const rightPadding = SLIDE_MARGIN;
    const bottomPadding = SLIDE_MARGIN;
    const textWidth = Math.floor(slideWidth / 2 - SLIDE_MARGIN);
    const textX = slideWidth - rightPadding - textWidth;

    // Place the top of paragraph so that most content sits at lower-right quadrant
    const textY = Math.max(
      titleY + titleHeight + 100,
      Math.floor(slideHeight / 2 - SLIDE_MARGIN)
    );

    const paragraphHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      fontSize: 36,
      fontFamily: 'Quicksand',
      lineHeight: 1.35,
      width: textWidth,
    });

    const paragraphElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      x: textX,
      y: Math.min(textY, slideHeight - bottomPadding - paragraphHeight),
      width: textWidth,
      height: paragraphHeight,

      options: { isVisible: true, label: 'Paragraph' },
      fontSize: 36,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.35,
    };

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TITLE_TEXT_DIAGONAL,
      themeSettings: {
        baseWidth: slideWidth,
        baseHeight: slideHeight,
        width: slideWidth,
        height: slideHeight,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        titleElement,
        paragraphElement,
        logoImageElement,
        ...(decorativeImageElement ? [decorativeImageElement] : []),
      ],
    };
  }
}
