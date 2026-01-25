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
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
  getDecorativeImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { IAgendaCardsSlideFactory } from './slide-factory.interface';

export class AgendaCardsSlideFactory implements IAgendaCardsSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    title: string,
    agenda_items: string[],
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Colors configuration
    const titleColor = this.colors.titleColor;
    const cardBackgroundColor = this.colors.rectangleColor;
    const cardTextColor = this.colors.paragraphColor;

    // Title configuration
    const titleFontSize = 100;
    const titleText = `<span style="overflow-wrap: break-word; color: ${titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`;

    const titleHeight = getTextHeight({
      text: titleText,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: slideWidth - 270,
    });

    // Position title in upper third of slide
    const titleY = SLIDE_ELEMENT_MIN_Y;
    const titleX = SLIDE_MARGIN;

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: titleText,
      x: titleX,
      y: titleY,
      width: slideWidth - 270,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Center,
      lineHeight: 1.1,
    };

    // Cards configuration
    const cardsStartY = titleY + titleHeight + 80;
    const cardWidth = 520;
    const cardHeight = 220;
    const cardRadius = 0;
    const cardFontSize = 32;

    // Grid layout: 3 cards on top row, 2 cards on bottom row (centered)
    const rowGap = 60;
    const colGap = 40;

    // First row: 3 cards
    const firstRowY = cardsStartY;
    const firstRowTotalWidth = 3 * cardWidth + 2 * colGap;
    const firstRowStartX = (slideWidth - firstRowTotalWidth) / 2;

    // Second row: 2 cards (centered)
    const secondRowY = firstRowY + cardHeight + rowGap;
    const secondRowTotalWidth = 2 * cardWidth + colGap;
    const secondRowStartX = (slideWidth - secondRowTotalWidth) / 2;

    // Create cards
    const cardElements: (SlideShape | SlideText)[] = [];

    agenda_items.forEach((item, index) => {
      if (index >= 5) return; // Maximum 5 cards (3 + 2)

      let cardX: number;
      let cardY: number;

      if (index < 3) {
        // First row
        cardX = firstRowStartX + index * (cardWidth + colGap);
        cardY = firstRowY;
      } else {
        // Second row
        cardX = secondRowStartX + (index - 3) * (cardWidth + colGap);
        cardY = secondRowY;
      }

      // Card background
      const cardBackground: SlideShape = {
        id: v4(),
        type: SlideElementBaseTypes.SHAPE,
        subtype: SlideShapeElementsVariants.RECTANGLE,
        x: cardX,
        y: cardY,
        width: cardWidth,
        height: cardHeight,
        fillColor: cardBackgroundColor,
        cornerRadius: cardRadius,

        options: { isVisible: true, label: `Card ${index + 1} Background` },
      };

      // Card text
      const cardTextPadding = 20;
      const cardTextWidth = cardWidth - cardTextPadding * 2;
      const cardText = `<span style="overflow-wrap: break-word; color: ${cardTextColor};">${processMarkdownFormatting(item)}</span>`;

      const cardTextHeight = getTextHeight({
        text: cardText,
        fontSize: cardFontSize,
        fontFamily: 'Quicksand',
        lineHeight: 1.3,
        width: cardTextWidth,
      });

      const cardTextElement: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: cardText,
        x: cardX + cardTextPadding,
        y: cardY + (cardHeight - cardTextHeight) / 2, // Center vertically
        width: cardTextWidth,
        height: cardTextHeight,

        options: { isVisible: true, label: `Card ${index + 1} Text` },
        fontSize: cardFontSize,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Center,
        lineHeight: 1.3,
      };

      cardElements.push(cardBackground, cardTextElement);
    });

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.AGENDA_CARDS,
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
        ...cardElements,
        logoImageElement,
        ...(decorativeImageElement ? [decorativeImageElement] : []),
      ],
    };
  }
}
