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
  processMarkdownFormatting,
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
  SLIDE_TEXT_Y_SPACING,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleThreeRowsOneLeftImageSlideFactory } from './slide-factory.interface';

export class TitleThreeRowsOneLeftImage3SlideFactory
  implements ITitleThreeRowsOneLeftImageSlideFactory
{
  constructor(private colors: SlideTypeColors) {}

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

    // Left side: Large image with fixed dimensions
    const imageWidth = 830;
    const imageX = 0;
    const imageY = 0;
    const imageHeight = 1080;

    let mainImageElement: SlideImage | null = null;
    if (image_url) {
      mainImageElement = {
        id: v4(),
        type: SlideElementBaseTypes.IMAGE,
        subtype: SlideImageElementsVariants.IMAGE,
        src: image_url,
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,

        options: { isVisible: true, label: 'Main Image' },
      };
    }

    // Right side: Main title + Three text sections - distributed vertically
    const rightAreaX = imageX + imageWidth + 40; // Gap between left and right areas
    const rightAreaWidth = slideWidth - rightAreaX - SLIDE_MARGIN;
    const rightAreaY = SLIDE_ELEMENT_MIN_Y;

    // Main title at the top
    const mainTitleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(main_title)}</span>`,
      fontSize: 80,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: rightAreaWidth,
    });

    const mainTitleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(main_title)}</span>`,
      x: rightAreaX,
      y: rightAreaY,
      width: rightAreaWidth,
      height: mainTitleHeight,

      options: { isVisible: true, label: 'Main Title' },
      fontSize: 80,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    // Calculate sections from bottom to top
    const sectionGap = 15; // Gap between title and text within a section
    const spaceBetweenSections = 50; // Minimum gap between sections
    const sectionsBottomY = slideHeight - SLIDE_MARGIN; // Start from bottom margin

    // Helper to calculate section height
    const getSectionHeight = (title: string, text: string): number => {
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
    };

    // Helper to create a section
    const createTextSection = (
      sectionTitle: string,
      sectionText: string,
      sectionIndex: number,
      sectionY: number
    ): SlideText[] => {
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

    // Calculate from bottom to top: section 3, then 2, then 1
    // Section 3 (last section, at the bottom)
    const section3Height = getSectionHeight(section_3_title, section_3_text);
    let section3Y = sectionsBottomY - section3Height;
    const section3Elements = createTextSection(
      section_3_title,
      section_3_text,
      2,
      section3Y
    );

    // Section 2
    const section2Height = getSectionHeight(section_2_title, section_2_text);
    let section2Y = section3Y - section2Height - spaceBetweenSections;
    const section2Elements = createTextSection(
      section_2_title,
      section_2_text,
      1,
      section2Y
    );

    // Section 1 (first section)
    const section1Height = getSectionHeight(section_1_title, section_1_text);
    let section1Y = section2Y - section1Height - spaceBetweenSections;
    const section1Elements = createTextSection(
      section_1_title,
      section_1_text,
      0,
      section1Y
    );

    // Ensure section 1 doesn't overlap with main title
    const minSection1Y = rightAreaY + mainTitleHeight + SLIDE_TEXT_Y_SPACING;
    if (section1Y < minSection1Y) {
      // If sections don't fit, reduce spacing proportionally
      const totalSectionsHeight =
        section1Height + section2Height + section3Height;
      const availableHeight = sectionsBottomY - minSection1Y;
      const spacingNeeded = availableHeight - totalSectionsHeight;

      if (spacingNeeded > 0) {
        // Redistribute spacing between sections
        // Use at least 50px spacing if there's enough room, otherwise use available space
        const minRequiredSpacing = spaceBetweenSections * 2; // 2 gaps need at least 100px total
        const adjustedSpaceBetween =
          spacingNeeded >= minRequiredSpacing
            ? spaceBetweenSections
            : spacingNeeded / 2; // Divide available space if not enough for 50px gaps

        // Recalculate positions from bottom
        section3Y = sectionsBottomY - section3Height;
        section2Y = section3Y - section2Height - adjustedSpaceBetween;
        section1Y = section2Y - section1Height - adjustedSpaceBetween;

        // Recreate elements with new positions
        section3Elements[0].y = section3Y;
        section3Elements[1].y =
          section3Y + section3Elements[0].height + sectionGap;

        section2Elements[0].y = section2Y;
        section2Elements[1].y =
          section2Y + section2Elements[0].height + sectionGap;

        section1Elements[0].y = section1Y;
        section1Elements[1].y =
          section1Y + section1Elements[0].height + sectionGap;
      }
    }

    const logoImageElement = getLogoImageElement(logo_path);

    const elements = [
      mainTitleElement,
      ...section1Elements,
      ...section2Elements,
      ...section3Elements,
      logoImageElement,
    ];

    if (mainImageElement) {
      elements.unshift(mainImageElement);
    }

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TITLE_THREE_ROWS_ONE_LEFT_IMAGE_3,
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
