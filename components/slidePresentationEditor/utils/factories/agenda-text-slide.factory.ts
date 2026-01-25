import { v4 } from 'uuid';
import {
  Slide,
  SlideElementBaseTypes,
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
  processMarkdownFormatting,
  SLIDE_CONTENT_MIN_Y,
  SLIDE_MARGIN,
  getDecorativeImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { IAgendaTextSlideFactory } from './slide-factory.interface';

export class AgendaTextSlideFactory implements IAgendaTextSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    title: string,
    agenda_items: string[],
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Layout configuration
    const leftColumnWidth = Math.floor(slideWidth / 2) - SLIDE_MARGIN;
    const rightColumnWidth = Math.floor(slideWidth / 2) - SLIDE_MARGIN;
    const columnGap = 20;
    const margins = SLIDE_MARGIN;

    // Left column (Title)
    const leftColumnX = margins + 10;
    const rightColumnX = leftColumnX + leftColumnWidth + columnGap;

    // Title configuration
    const titleFontSize = 120;
    const titleText = `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`;

    const titleHeight = getTextHeight({
      text: titleText,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: leftColumnWidth - 40,
    });

    // Center title vertically
    const titleY = SLIDE_CONTENT_MIN_Y;

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: titleText,
      x: leftColumnX,
      y: titleY,
      width: leftColumnWidth - 40,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    const decorativeLineColor = this.colors.lineColor; // Yellow color

    // Agenda items configuration
    const itemFontSize = 36;
    const itemColor = this.colors.paragraphColor; // Dark gray/black
    const bulletColor = decorativeLineColor; // Yellow bullets
    const itemLineHeight = 1.4;
    const itemSpacing = 45;
    const bulletSize = 12;
    const bulletTextGap = 25;

    const itemsStartY = SLIDE_CONTENT_MIN_Y + 160;

    // Create agenda items with bullets
    const agendaElements: (SlideShape | SlideText)[] = [];
    let currentY = itemsStartY;

    agenda_items.forEach((item, index) => {
      // Agenda item text
      const itemText = `<span style="overflow-wrap: break-word; color: ${itemColor};">${processMarkdownFormatting(item)}</span>`;
      const itemTextWidth = rightColumnWidth - bulletTextGap - 40;

      const itemTextHeight = getTextHeight({
        text: itemText,
        fontSize: itemFontSize,
        fontFamily: 'Quicksand',
        lineHeight: itemLineHeight,
        width: itemTextWidth,
      });

      // Use currentY for this item
      const itemY = currentY;

      // Bullet point (yellow circle) - center it with the first line of text
      const bullet: SlideShape = {
        id: v4(),
        type: SlideElementBaseTypes.SHAPE,
        subtype: SlideShapeElementsVariants.CIRCLE,
        x: rightColumnX,
        y: itemY + (itemFontSize * itemLineHeight - bulletSize) / 2, // Center bullet with first line of text
        width: bulletSize,
        height: bulletSize,
        fillColor: bulletColor,

        options: { isVisible: true, label: `Bullet ${index + 1}` },
      };

      const agendaItem: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: itemText,
        x: rightColumnX + bulletTextGap,
        y: itemY,
        width: itemTextWidth,
        height: itemTextHeight,

        options: { isVisible: true, label: `Agenda Item ${index + 1}` },
        fontSize: itemFontSize,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: itemLineHeight,
      };

      agendaElements.push(bullet, agendaItem);

      // Update currentY for the next item based on the actual height of this item plus spacing
      currentY += itemTextHeight + itemSpacing;
    });

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.AGENDA_TEXT,
      themeSettings: {
        baseWidth: slideWidth,
        baseHeight: slideHeight,
        width: slideWidth,
        height: slideHeight,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        titleElement,
        ...agendaElements,
        logoImageElement,
        ...(decorativeImageElement ? [decorativeImageElement] : []),
      ],
    };
  }
}
