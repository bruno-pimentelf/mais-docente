import { v4 } from 'uuid';
import {
  Slide,
  SlideElementBaseTypes,
  SlideLayoutVariants,
  SlideImage,
  SlideImageElementsVariants,
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
import { ITwoColumnsSlideFactory } from './slide-factory.interface';

/**
 * Factory for creating two-column slides
 * Follows Single Responsibility Principle - only creates two-column slides
 */
export class TwoColumnsSlideFactory implements ITwoColumnsSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    title_A: string,
    title_B: string,
    content_text_A: string,
    content_text_B: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    const startY = SLIDE_CONTENT_MIN_Y; // Match main-image layout positioning
    const columnWidth = 780; // Match main-image text width
    const leftColumnX = SLIDE_MARGIN; // Match main-image left positioning
    const rightColumnX = 1012; // Match main-image right text positioning
    const titleContentSpacing = SLIDE_TEXT_Y_SPACING; // Space between title and content within each column

    // Left column title
    const titleAHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title_A)}</span>`,
      fontSize: 64, // Match main-image title font size
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: columnWidth,
    });

    const titleA: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title_A)}</span>`,
      x: leftColumnX,
      y: startY,
      width: columnWidth,
      height: titleAHeight,

      options: {
        isVisible: true,
        label: 'Title A',
      },
      fontSize: 64, // Match main-image title font size
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    // Right column title
    const titleBHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title_B)}</span>`,
      fontSize: 64, // Match main-image title font size
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: columnWidth,
    });

    const titleB: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title_B)}</span>`,
      x: rightColumnX,
      y: startY,
      width: columnWidth,
      height: titleBHeight,

      options: {
        isVisible: true,
        label: 'Title B',
      },
      fontSize: 64, // Match main-image title font size
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    // Optional title background image (frame) just behind titles
    // Render only when colors.titleBackgroundImage is set
    const titleFrameSrc = this.colors.titleBackgroundImage;
    const titleFramePaddingX = 24; // a bit wider than text
    const titleFramePaddingY = 18; // a bit taller than text

    const titleAFrame: SlideImage | null = titleFrameSrc
      ? {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: titleFrameSrc,
          x: leftColumnX - titleFramePaddingX,
          y: startY - titleFramePaddingY,
          width: columnWidth + titleFramePaddingX * 2,
          height: titleAHeight + titleFramePaddingY * 2,
          borderRadius: 0,
          options: { isVisible: true, label: 'Title A Background' },
        }
      : null;

    const titleBFrame: SlideImage | null = titleFrameSrc
      ? {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: titleFrameSrc,
          x: rightColumnX - titleFramePaddingX,
          y: startY - titleFramePaddingY,
          width: columnWidth + titleFramePaddingX * 2,
          height: titleBHeight + titleFramePaddingY * 2,
          borderRadius: 0,
          options: { isVisible: true, label: 'Title B Background' },
        }
      : null;

    // Calculate the maximum title height to align content at the same Y position
    const maxTitleHeight = Math.max(titleAHeight, titleBHeight);

    // Left column content
    const contentAHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text_A)}</span>`,
      fontSize: 38, // Match main-image content font size
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: columnWidth,
    });

    const contentA: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text_A)}</span>`,
      x: leftColumnX,
      y: startY + maxTitleHeight + titleContentSpacing,
      width: columnWidth,
      height: contentAHeight,

      options: {
        isVisible: true,
        label: 'Content A',
      },
      fontSize: 38, // Match main-image content font size
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };

    // Right column content
    const contentBHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text_B)}</span>`,
      fontSize: 38, // Match main-image content font size
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: columnWidth,
    });

    const contentB: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text_B)}</span>`,
      x: rightColumnX,
      y: startY + maxTitleHeight + titleContentSpacing,
      width: columnWidth,
      height: contentBHeight,

      options: {
        isVisible: true,
        label: 'Content B',
      },
      fontSize: 38, // Match main-image content font size
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
      slideType: SlideThemeType.TWO_PARAGRAPHS,
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        // Background frames must be behind text, so add before titles
        ...(titleAFrame ? [titleAFrame] : []),
        ...(titleBFrame ? [titleBFrame] : []),
        titleA,
        titleB,
        contentA,
        contentB,
        logoImageElement,
        ...decorativeImageElements,
      ],
    };
  }
}
