import { v4 } from 'uuid';
import {
  Slide,
  SlideElementBaseTypes,
  SlideImage,
  SlideImageElementsVariants,
  SlideLayoutVariants,
  SlideShape,
  SlideShapeElementsVariants,
  SlideText,
  SlideTextElementsVariants,
  SlideThemeType,
  SlideVariants,
  TextAlignment,
} from '../../types/index';
import {
  getLogoImageElement,
  getTextHeight,
  getDecorativeImageElement,
  processMarkdownFormatting,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ICoverLaraSlideFactory } from './slide-factory.interface';

/**
 * COVER_LARA: Cover slide with Lara parrot on the left on yellow perch,
 * blue title and gray subtitle on the right.
 */
export class CoverLaraSlideFactory implements ICoverLaraSlideFactory {
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
    // Lara parrot illustration (left side, maintaining original proportions) - 50% larger
    // Original: 478x761, maintaining aspect ratio, increased by 50%
    const laraHeight = 900; // 600 * 1.5 = 900px
    const laraWidth = Math.round((478 / 761) * laraHeight); // Proportional width: ~566px
    const laraParrot: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: '/images/iara/lara.svg', // Using existing Lara illustration
      x: 80,
      y: 180, // Positioned so bottom touches canvas bottom (1080 - 900 = 180)
      width: laraWidth,
      height: laraHeight,

      options: {
        isVisible: true,
        label: 'Lara Parrot',
      },
    };

    // Yellow perch line (horizontal line under Lara)
    const perchLine: SlideShape = {
      id: v4(),
      type: SlideElementBaseTypes.SHAPE,
      subtype: SlideShapeElementsVariants.RECTANGLE,
      x: 50,
      y: 1040, // Positioned near bottom, under Lara (1080 - 40 = 1040)
      width: 560,
      height: 8,

      options: { isVisible: true, label: 'Perch Line' },
      fillColor: this.colors.lineColor,
    } as SlideShape;

    // Title - positioned to the right of Lara, vertically centered in white area
    const titleWidth = 1000;
    const titleX = 700;
    const titleFontSize = 96;
    const titleHeight = getTextHeight({
      text: `<b><span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(title)}</span></b>`,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: titleWidth,
    });
    const titleY = 380;

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<b><span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(title)}</span></b>`,
      x: titleX,
      y: titleY,
      width: titleWidth,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    // Subtitle below title
    const subtitleWidth = 1000;
    const subtitleX = 700;
    const subtitleFontSize = 32;
    const subtitleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color:${this.colors.paragraphColor};">${processMarkdownFormatting(subtitle)}</span>`,
      fontSize: subtitleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: subtitleWidth,
    });
    const subtitleY = titleY + titleHeight + 24;

    const subtitleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color:${this.colors.paragraphColor};">${processMarkdownFormatting(subtitle)}</span>`,
      x: subtitleX,
      y: subtitleY,
      width: subtitleWidth,
      height: subtitleHeight,

      options: { isVisible: true, label: 'Subtitle' },
      fontSize: subtitleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.2,
    };

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.COVER_LARA,
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        laraParrot,
        perchLine,
        titleElement,
        subtitleElement,
        logoImageElement,
      ],
    };
  }
}
