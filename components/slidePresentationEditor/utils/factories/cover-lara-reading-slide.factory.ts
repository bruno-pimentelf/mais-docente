import { v4 } from 'uuid';
import {
  Slide,
  SlideElementBaseTypes,
  SlideImage,
  SlideImageElementsVariants,
  SlideLayoutVariants,
  SlideText,
  SlideTextElementsVariants,
  SlideThemeType,
  SlideVariants,
  TextAlignment,
} from '../../types/index';
import { SlideTypeColors } from '../types/slide-theme.types';
import {
  getLogoImageElement,
  getTextHeight,
  getDecorativeImageElement,
  processMarkdownFormatting,
} from '../helpers/slide-utils';
import { ICoverLaraReadingSlideFactory } from './slide-factory.interface';

/**
 * COVER_LARA_READING: Educational cover slide with full background image BG_LARA_READING.svg,
 * featuring a white framed content area with blue title, gray subtitle, and Lara parrot
 * illustration with school elements.
 */
export class CoverLaraReadingSlideFactory
  implements ICoverLaraReadingSlideFactory
{
  constructor(private colors: SlideTypeColors) {}

  create({
    title,
    subtitle,
    logo_path,
    slideOrder,
  }: {
    title: string;
    subtitle: string;
    logo_path: string;
    slideOrder: number;
  }): Slide {
    // Full background image covering entire canvas - fixed, non-editable
    const backgroundImage: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.BACKGROUND_IMAGE,
      src: '/images/interactive-classes/slide-presentation-editor/templates/BG_LARA_READING.svg',
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,

      options: {
        isVisible: true,
        label: 'Background Lara Reading',
      },
    };

    // Text content area - positioned more to the right and lower within the white framed area
    const textAreaX = 900;
    const textAreaWidth = 750;
    const titleY = 380;

    // Title dimensions and positioning - blue color as described
    const titleFontSize = 80;
    const titleHeight = getTextHeight({
      text: `<b><span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(title)}</span></b>`,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: textAreaWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<b><span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(title)}</span></b>`,
      x: textAreaX,
      y: titleY,
      width: textAreaWidth,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    // Subtitle positioning - gray color as described
    const subtitleY = titleY + titleHeight + 20;
    const subtitleFontSize = 36;
    const subtitleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color:${this.colors.paragraphColor};">${processMarkdownFormatting(subtitle)}</span>`,
      fontSize: subtitleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: textAreaWidth,
    });

    const subtitleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color:${this.colors.paragraphColor};">${processMarkdownFormatting(subtitle)}</span>`,
      x: textAreaX,
      y: subtitleY,
      width: textAreaWidth,
      height: subtitleHeight,

      options: { isVisible: true, label: 'Subtitle' },
      fontSize: subtitleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.2,
    };

    // Big Lara writing illustration at the bottom - 3x larger and touching bottom
    const laraWritingImage: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: '/images/iara/big-lara-writing.svg',
      x: 0,
      y: 435, // Positioned so bottom touches slide bottom (1080 - 645 = 435)
      width: 1200, // 3x larger (400 * 3)
      height: 645, // 3x larger (215 * 3)

      options: {
        isVisible: true,
        label: 'Lara Writing Illustration',
      },
    };

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.COVER_LARA_READING,
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: this.colors.backgroundColor,
      },
      elements: [
        backgroundImage,
        laraWritingImage,
        titleElement,
        subtitleElement,
        logoImageElement,
      ],
    };
  }
}
