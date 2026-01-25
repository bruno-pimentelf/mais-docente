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
import { v4 } from 'uuid';
import { SlideTypeColors } from '../types/slide-theme.types';
import {
  getLogoImageElement,
  getTextHeight,
  getDecorativeImageElements,
  processMarkdownFormatting,
} from '../helpers/slide-utils';

/**
 * Factory for creating COVER_1 slides (title on top + big image below)
 */
export class Cover1SlideFactory {
  constructor(private colors: SlideTypeColors) {}

  async create(
    image_url: string,
    title_text: string,
    logo_path: string,
    slideOrder: number
  ): Promise<Slide> {
    // Title on top, centered
    const titleFontSize = 72;
    const titleWidth = 1650;
    const titleX = 135;
    const titleY = 40;
    const titleHeight = getTextHeight({
      text: `<b><span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(title_text)}</span></b>`,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: titleWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<b><span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(title_text)}</span></b>`,
      x: titleX,
      y: titleY,
      width: titleWidth,
      height: titleHeight,

      options: {
        isVisible: true,
        label: 'Title',
      },
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Center,
      lineHeight: 1.1,
    };

    // Image fills the remaining space below the title
    const topOffset = titleY + titleHeight + 24;
    const sideMargin = 0;
    const maxWidth = 1920; // Full slide width
    const maxHeight = 1080 - topOffset; // Fill to the bottom with no margin

    let imageElement: SlideImage | null = null;
    if (image_url) {
      imageElement = {
        id: v4(),
        type: SlideElementBaseTypes.IMAGE,
        subtype: SlideImageElementsVariants.IMAGE,
        src: image_url,
        x: 0,
        y: topOffset,
        width: maxWidth,
        height: maxHeight,
        borderRadius: 0,

        options: {
          isVisible: true,
          label: 'Cover Image',
        },
      };
    }

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElements = getDecorativeImageElements(this.colors);
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.COVER_1 as any,
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
        ...(imageElement ? [imageElement] : []),
        logoImageElement,
        ...decorativeImageElements,
      ],
    };
  }
}
