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
import { ICoverArtisticSlideFactory } from './slide-factory.interface';

/**
 * COVER_ARTISTIC: Artistic cover slide with impressionist-style background,
 * centered white title and blue subtitle.
 */
export class CoverArtisticSlideFactory implements ICoverArtisticSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create({
    title,
    subtitle,
    logo_path,
    slideOrder,
    cover_image_url,
  }: {
    title: string;
    subtitle: string;
    logo_path: string;
    slideOrder: number;
    cover_image_url?: string;
  }): Slide {
    const background: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.BACKGROUND_IMAGE,
      src: cover_image_url || '/images/backgrounds/COVER_BACKGROUND.png',
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,

      options: { isVisible: true, label: 'Artistic Background' },
    };

    const shapeBackground: SlideShape = {
      id: v4(),
      type: SlideElementBaseTypes.SHAPE,
      subtype: SlideShapeElementsVariants.RECTANGLE,
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,

      options: { isVisible: true, label: 'Shape Background' },
      fillColor: this.colors.backgroundColor,
      opacity: 0.7,
    };

    const titleWidth = 1400;
    const titleX = Math.round((1920 - titleWidth) / 2);
    const titleFontSize = 120;
    const titleHeight = getTextHeight({
      text: `<b><span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(title)}</span></b>`,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.0,
      width: titleWidth,
    });
    const titleY = 420 - Math.round(titleHeight / 2);

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
      textAlign: TextAlignment.Center,
      lineHeight: 1.0,
    };

    const subtitleWidth = 1500;
    const subtitleX = Math.round((1920 - subtitleWidth) / 2);
    const subtitleFontSize = 36;
    const subtitleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(subtitle)}</span>`,
      fontSize: subtitleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: subtitleWidth,
    });

    const subtitleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(subtitle)}</span>`,
      x: subtitleX,
      y: titleY + titleHeight + 28,
      width: subtitleWidth,
      height: subtitleHeight,

      options: { isVisible: true, label: 'Subtitle' },
      fontSize: subtitleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Center,
      lineHeight: 1.2,
    };

    const logo = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.COVER_ARTISTIC,
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        background,
        shapeBackground,
        titleElement,
        subtitleElement,
        logo,
        ...(decorativeImageElement ? [decorativeImageElement] : []),
      ],
    };
  }
}
