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
  getImageDimensions,
  processMarkdownFormatting,
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
  SLIDE_TEXT_Y_SPACING,
  SLIDE_IMAGE_BORDER_RADIUS,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleThreeRowsOneLeftImageSlideFactory } from './slide-factory.interface';

export class TitleThreeRowsOneLeftImage2SlideFactory
  implements ITitleThreeRowsOneLeftImageSlideFactory
{
  constructor(private colors: SlideTypeColors) {}

  /**
   * Calculates dimensions that maintain aspect ratio within constraints
   */
  private calculateAspectRatioDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number; x: number; y: number } {
    const aspectRatio = originalWidth / originalHeight;

    let finalWidth = maxWidth;
    let finalHeight = maxWidth / aspectRatio;

    // If height exceeds max height, constrain by height instead
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = maxHeight * aspectRatio;
    }

    // Center the image in the allocated space
    const baseX = SLIDE_MARGIN;
    const baseY = SLIDE_ELEMENT_MIN_Y;
    const x = baseX + (maxWidth - finalWidth) / 2;
    const y = baseY + (maxHeight - finalHeight) / 2;

    return {
      width: Math.round(finalWidth),
      height: Math.round(finalHeight),
      x: Math.round(x),
      y: Math.round(y),
    };
  }

  async create(
    image_url: string,
    main_title: string,
    section_1_title: string,
    section_1_text: string,
    section_2_title: string,
    section_2_text: string,
    section_3_title: string,
    section_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Promise<Slide> {
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Left side: Title at top, then image below
    const leftAreaX = SLIDE_MARGIN;
    const leftAreaWidth = Math.floor(slideWidth / 2) - leftAreaX; // 1/2 of slide width
    const leftAreaY = SLIDE_ELEMENT_MIN_Y;

    // Main title on the left side, above the image
    const mainTitleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(main_title)}</span>`,
      fontSize: 80,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: leftAreaWidth,
    });

    const mainTitleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(main_title)}</span>`,
      x: leftAreaX,
      y: leftAreaY,
      width: leftAreaWidth,
      height: mainTitleHeight,

      options: { isVisible: true, label: 'Main Title' },
      fontSize: 80,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    // Image area below the title
    const imageAreaY = leftAreaY + mainTitleHeight + SLIDE_TEXT_Y_SPACING;
    const imageAreaHeight = slideHeight - imageAreaY - SLIDE_MARGIN;

    let mainImageElement: SlideImage | null = null;
    if (image_url) {
      try {
        const { width: originalWidth, height: originalHeight } =
          await getImageDimensions(image_url);

        const imageDimensions = this.calculateAspectRatioDimensions(
          originalWidth,
          originalHeight,
          leftAreaWidth,
          imageAreaHeight
        );

        // Adjust Y position to account for title above
        mainImageElement = {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: image_url,
          x: imageDimensions.x,
          y: imageAreaY + (imageAreaHeight - imageDimensions.height) / 2,
          width: imageDimensions.width,
          height: imageDimensions.height,
          borderRadius: SLIDE_IMAGE_BORDER_RADIUS,

          options: { isVisible: true, label: 'Main Image' },
        };
      } catch (error) {
        console.warn('Failed to load image dimensions, using fallback:', error);
        mainImageElement = {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: image_url,
          x: leftAreaX,
          y: imageAreaY,
          width: leftAreaWidth,
          height: imageAreaHeight,
          borderRadius: SLIDE_IMAGE_BORDER_RADIUS,

          options: { isVisible: true, label: 'Main Image' },
        };
      }
    }

    // Right side: Three text sections (1/2 of width) - positioned from bottom to top
    const rightAreaX = leftAreaX + leftAreaWidth + 40; // Gap between left and right areas
    const rightAreaWidth = slideWidth - rightAreaX - SLIDE_MARGIN;

    // Calculate actual heights for each section first to determine proper spacing
    const sectionGap = 15; // Gap between title and text within a section

    // Pre-calculate all section heights to determine total content height
    const sectionData = [
      { title: section_1_title, text: section_1_text },
      { title: section_2_title, text: section_2_text },
      { title: section_3_title, text: section_3_text },
    ];

    const sectionHeights = sectionData.map(({ title, text }) => {
      const titleHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
        fontSize: 40,
        fontFamily: 'Quicksand',
        lineHeight: 1.2,
        width: rightAreaWidth,
      });

      const textHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(text)}</span>`,
        fontSize: 28,
        fontFamily: 'Quicksand',
        lineHeight: 1.4,
        width: rightAreaWidth,
      });

      return titleHeight + sectionGap + textHeight;
    });

    const createTextSection = (
      sectionTitle: string,
      sectionText: string,
      sectionIndex: number,
      sectionY: number
    ): SlideText[] => {
      // Section title
      const sectionTitleHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(sectionTitle)}</span>`,
        fontSize: 40,
        fontFamily: 'Quicksand',
        lineHeight: 1.2,
        width: rightAreaWidth,
      });

      const sectionTitleElement: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(sectionTitle)}</span>`,
        x: rightAreaX,
        y: sectionY,
        width: rightAreaWidth,
        height: sectionTitleHeight,

        options: {
          isVisible: true,
          label: `Section ${sectionIndex + 1} Title`,
        },
        fontSize: 40,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: 1.2,
      };

      // Section text
      const sectionTextHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(sectionText)}</span>`,
        fontSize: 28,
        fontFamily: 'Quicksand',
        lineHeight: 1.4,
        width: rightAreaWidth,
      });

      const sectionTextElement: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(sectionText)}</span>`,
        x: rightAreaX,
        y: sectionY + sectionTitleHeight + sectionGap,
        width: rightAreaWidth,
        height: sectionTextHeight,

        options: { isVisible: true, label: `Section ${sectionIndex + 1} Text` },
        fontSize: 28,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: 1.4,
      };

      return [sectionTitleElement, sectionTextElement];
    };

    // Position sections from bottom to top, respecting margins
    // Start from bottom margin and work upwards
    const gapBetweenSections = 50; // Gap between sections
    const bottomY = slideHeight - SLIDE_MARGIN;

    // Calculate positions starting from the last section (bottom)
    // Section 3 (last) starts at the bottom
    let currentY = bottomY - sectionHeights[2]; // Position section 3 at bottom
    const section3Elements = createTextSection(
      section_3_title,
      section_3_text,
      2,
      currentY
    );

    // Section 2 above section 3
    currentY -= sectionHeights[1] + gapBetweenSections;
    const section2Elements = createTextSection(
      section_2_title,
      section_2_text,
      1,
      currentY
    );

    // Section 1 above section 2
    currentY -= sectionHeights[0] + gapBetweenSections;
    const section1Elements = createTextSection(
      section_1_title,
      section_1_text,
      0,
      currentY
    );

    const logoImageElement = getLogoImageElement(logo_path);

    const elements = [
      mainTitleElement,
      ...section1Elements,
      ...section2Elements,
      ...section3Elements,
      logoImageElement,
    ];

    if (mainImageElement) {
      // Insert image after title but before sections
      elements.splice(1, 0, mainImageElement);
    }

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TITLE_THREE_ROWS_ONE_LEFT_IMAGE_2,
      themeSettings: {
        baseWidth: slideWidth,
        baseHeight: slideHeight,
        width: slideWidth,
        height: slideHeight,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements,
    };
  }
}
