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
  getDecorativeImageElement,
  getTextHeight,
  processMarkdownFormatting,
  SLIDE_CONTENT_MIN_Y,
  SLIDE_HEIGHT,
  SLIDE_MARGIN,
  SLIDE_WIDTH,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { IConclusionSlideFactory } from './slide-factory.interface';
import { v4 } from 'uuid';

/**
 * Factory for creating conclusion slides
 * Follows Single Responsibility Principle - only creates conclusion slides
 */
export class ConclusionSlideFactory implements IConclusionSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    title: string,
    subtitle: string,
    content_bullet_points: string[],
    logo_path: string,
    slideOrder: number
  ): Slide {
    const leftColumnWidth = Math.floor(SLIDE_WIDTH / 2) - SLIDE_MARGIN;

    const titleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 96,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: leftColumnWidth - 40,
    });

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

    let bulletListElement: SlideText | null = null;
    if (content_bullet_points && content_bullet_points.length > 0) {
      const itemTextWidth = 891;
      const itemFontSize = 40;
      const itemLineHeight = 1.4;
      const bulletColor = this.colors.shapeColor;

      // Build the ul/li HTML structure
      // The li inherits bullet color from ul, content wrapped in span with text color
      const listItemsHtml = content_bullet_points
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
        x: 891,
        y: itemsStartY,
        width: 895,
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

    const decorativeImageElement = getDecorativeImageElement(this.colors);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.CONCLUSION,
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
        ...(decorativeImageElement ? [decorativeImageElement] : []),
      ],
    };
  }
}
