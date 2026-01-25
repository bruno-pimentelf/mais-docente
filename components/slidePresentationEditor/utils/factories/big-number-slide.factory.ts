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
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { IBigNumberSlideFactory } from './slide-factory.interface';

export class BigNumberSlideFactory implements IBigNumberSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    big_number: string,
    line1_text: string,
    line2_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    const bigNumberFontSize = 200;
    const bigNumberColor = this.colors.titleColor || '#4285F4';
    const bigNumberText = `<span style="overflow-wrap: break-word; color: ${bigNumberColor}; font-weight: bold;">${processMarkdownFormatting(big_number)}</span>`;

    const bigNumberHeight = getTextHeight({
      text: bigNumberText,
      fontSize: bigNumberFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: slideWidth - SLIDE_MARGIN * 2,
    });

    const bigNumberY = SLIDE_CONTENT_MIN_Y + 100;

    const bigNumberElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: bigNumberText,
      x: SLIDE_MARGIN,
      y: bigNumberY,
      width: slideWidth - SLIDE_MARGIN * 2,
      height: bigNumberHeight,
      options: {
        isVisible: true,
        label: 'Big Number',
      },
      fontSize: bigNumberFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Center,
      lineHeight: 1.1,
    };

    const textFontSize = 40;
    const textColor = this.colors.paragraphColor || '#343A40';
    const textStartY = bigNumberY + bigNumberHeight + 80;

    const textContent = `<span style="overflow-wrap: break-word; color: ${textColor};">${processMarkdownFormatting(line1_text)}</span>`;
    const textHeight = getTextHeight({
      text: textContent,
      fontSize: textFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: 1383,
    });

    const textElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: textContent,
      x: SLIDE_MARGIN,
      y: textStartY,
      width: slideWidth - SLIDE_MARGIN * 2,
      height: textHeight,
      options: {
        isVisible: true,
        label: 'Text',
      },
      fontSize: textFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Center,
      lineHeight: 1.4,
    };

    const logoImageElement = getLogoImageElement(logo_path);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.BIG_NUMBER,
      themeSettings: {
        baseWidth: slideWidth,
        baseHeight: slideHeight,
        width: slideWidth,
        height: slideHeight,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [bigNumberElement, textElement, logoImageElement],
    };
  }
}
