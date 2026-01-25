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
import {
  getLogoImageElement,
  getTextHeight,
  getDecorativeImageElement,
  processMarkdownFormatting,
  SLIDE_IMAGE_BORDER_RADIUS,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ICoverNotebookSlideFactory } from './slide-factory.interface';

/**
 * COVER_NOTEBOOK: School notebook style cover with grid background,
 * white rounded page with blue border, black rings, centered blue title,
 * and Monet's bridge painting with yellow tape effect.
 */
export class CoverNotebookSlideFactory implements ICoverNotebookSlideFactory {
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
    // Grid background covering entire canvas
    const gridBackground: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.BACKGROUND_IMAGE,
      src: '/images/backgrounds/BG_COVER_CHESS.svg',
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,

      options: { isVisible: true, label: 'Grid Background' },
    };

    // Notebook page background (white rounded rectangle with blue border) - base aligned with canvas
    const notebookPage: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.BACKGROUND_IMAGE,
      src: '/images/backgrounds/NOTEBOOK.svg',
      x: 320,
      y: 80,
      width: 1280,
      height: 1000, // Extended to reach canvas bottom (1080 - 80 = 1000)

      options: { isVisible: true, label: 'Notebook Page' },
    };

    // Title - centered blue text
    const titleWidth = 1000;
    const titleX = Math.round((1920 - titleWidth) / 2);
    const titleFontSize = 84;
    const titleHeight = getTextHeight({
      text: `<b><span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(title)}</span></b>`,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: titleWidth,
    });
    const titleY = 180;

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
      lineHeight: 1.1,
    };

    // Image placeholder for user to add their own image
    const imageElement: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: '/images/interactive-classes/slide-presentation-editor/placeholder-img.jpg',
      x: 660,
      y: 400,
      width: 600,
      height: 400,
      borderRadius: SLIDE_IMAGE_BORDER_RADIUS,

      options: { isVisible: true, label: 'Image' },
    };

    // Subtitle below the image
    const subtitleWidth = 800;
    const subtitleX = Math.round((1920 - subtitleWidth) / 2);
    const subtitleFontSize = 28;
    const subtitleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color:${this.colors.paragraphColor};">${processMarkdownFormatting(subtitle)}</span>`,
      fontSize: subtitleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: subtitleWidth,
    });
    const subtitleY = 820;

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
      textAlign: TextAlignment.Center,
      lineHeight: 1.2,
    };

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.COVER_NOTEBOOK,
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        gridBackground,
        notebookPage,
        titleElement,
        imageElement,
        subtitleElement,
        logoImageElement,
      ],
    };
  }
}
