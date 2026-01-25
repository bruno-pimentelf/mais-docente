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
  SLIDE_HEIGHT,
  SLIDE_MARGIN,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ISummarySlideFactory } from './slide-factory.interface';
import { v4 } from 'uuid';

/**
 * Factory for creating summary slides
 * Follows Single Responsibility Principle - only creates summary slides
 */
export class SummarySlideFactory implements ISummarySlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    title: string,
    category: string,
    subtopic_list: string[],
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;

    const titleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 96,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: 570,
    });

    const leftColumnWidth = Math.floor(slideWidth / 2) - SLIDE_MARGIN;
    const rightColumnWidth = Math.floor(slideWidth / 2) - SLIDE_MARGIN;
    const rightColumnX = SLIDE_MARGIN + leftColumnWidth + 20;

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      x: SLIDE_MARGIN + 10,
      y: SLIDE_CONTENT_MIN_Y,
      width: leftColumnWidth - 40,
      height: titleHeight,

      options: {
        isVisible: true,
        label: 'Summary Title',
      },
      fontSize: 96,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    const logoImageElement = getLogoImageElement(logo_path);

    // Agenda items configuration
    const itemFontSize = 40;
    const bulletColor = this.colors.shapeColor;
    const itemLineHeight = 1.4;
    const bulletTextGap = 25;

    let bulletListElement: SlideText | null = null;
    if (subtopic_list && subtopic_list.length > 0) {
      const itemTextWidth = rightColumnWidth - bulletTextGap - 40;

      // Build the ul/li HTML structure
      // The li inherits bullet color from ul, content wrapped in span with text color
      const listItemsHtml = subtopic_list
        .map(
          (item) =>
            `<li><span style="color: ${this.colors.paragraphColor}; overflow-wrap: break-word;">${processMarkdownFormatting(item)}</span></li>`
        )
        .join('');

      const listHtml = `<ul style="list-style: disc; margin: 0; display: flex; flex-direction: column; gap: 0.625em; color: ${bulletColor};">${listItemsHtml}</ul>`;

      // Calculate the total height of the list
      const listHeight = getTextHeight({
        text: listHtml,
        fontSize: itemFontSize,
        fontFamily: 'Quicksand',
        lineHeight: itemLineHeight,
        width: itemTextWidth,
      });

      // Calculate starting Y position to vertically center the list
      const verticalCenter = SLIDE_HEIGHT / 2;
      const itemsStartY = verticalCenter - listHeight / 2;

      bulletListElement = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: listHtml,
        x: rightColumnX,
        y: itemsStartY,
        width: itemTextWidth,
        height: listHeight,

        options: {
          isVisible: true,
          label: 'Bullet List',
        },
        fontSize: 40,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: 1.4,
      };
    }

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.AGENDA_AND_CONCLUSION,
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
        ...(bulletListElement ? [bulletListElement] : []),
        logoImageElement,
      ],
    };
  }
}
