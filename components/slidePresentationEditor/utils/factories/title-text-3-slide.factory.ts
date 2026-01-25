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
import { ITitleText3SlideFactory } from './slide-factory.interface';

export class TitleText3SlideFactory implements ITitleText3SlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    main_title: string,
    section_1_title: string,
    section_1_text: string,
    section_2_title: string,
    section_2_text: string,
    section_3_title: string,
    section_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Left side: Large title (1/2 of width)
    const leftAreaX = SLIDE_MARGIN;
    const leftAreaWidth = Math.floor(slideWidth / 2) - SLIDE_MARGIN; // 1/2 of slide width
    const leftAreaY = SLIDE_ELEMENT_MIN_Y;

    const mainTitleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(main_title)}</span>`,
      fontSize: 120,
      fontFamily: 'Quicksand',
      lineHeight: 1.0,
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
      fontSize: 120,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.0,
    };

    // Right side: Three text sections (1/2 of width) - distributed vertically
    const rightAreaX = leftAreaX + leftAreaWidth + 40; // Gap between left and right areas
    const rightAreaWidth = slideWidth - rightAreaX - SLIDE_MARGIN;
    const rightAreaY = leftAreaY;
    const rightAreaHeight = slideHeight - rightAreaY - SLIDE_MARGIN; // Available height for text sections

    // Calculate actual heights for each section first to determine proper spacing
    const sectionsStartY = rightAreaY;
    const sectionsAreaHeight = rightAreaHeight;
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

    const totalContentHeight = sectionHeights.reduce(
      (sum, height) => sum + height,
      0
    );

    const availableSpace = sectionsAreaHeight - totalContentHeight;

    const spaceBetween = Math.max(
      20,
      availableSpace / (sectionData.length - 1)
    ); // Minimum 20px between sections

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

    // Calculate Y positions dynamically based on actual content heights
    let currentY = sectionsStartY;

    const section1Elements = createTextSection(
      section_1_title,
      section_1_text,
      0,
      currentY
    );
    currentY += sectionHeights[0] + spaceBetween;

    const section2Elements = createTextSection(
      section_2_title,
      section_2_text,
      1,
      currentY
    );
    currentY += sectionHeights[1] + spaceBetween;

    const section3Elements = createTextSection(
      section_3_title,
      section_3_text,
      2,
      currentY
    );

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TOPICS,
      themeSettings: {
        baseWidth: slideWidth,
        baseHeight: slideHeight,
        width: slideWidth,
        height: slideHeight,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        mainTitleElement,
        ...section1Elements,
        ...section2Elements,
        ...section3Elements,
        logoImageElement,
      ],
    };
  }
}
