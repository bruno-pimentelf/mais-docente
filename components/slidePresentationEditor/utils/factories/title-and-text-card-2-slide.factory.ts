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
import { ITitleAndTextCard2SlideFactory } from './slide-factory.interface';

export class TitleAndTextCard2SlideFactory
  implements ITitleAndTextCard2SlideFactory
{
  constructor(private colors: SlideTypeColors) {}

  create(
    title: string,
    card_1_title: string,
    card_1_text: string,
    card_2_title: string,
    card_2_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Title at the top (centered)
    const titleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 80,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: slideWidth - 270, // Full width minus margins
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      x: SLIDE_MARGIN,
      y: SLIDE_ELEMENT_MIN_Y,
      width: slideWidth - 270,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: 80,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Center,
      lineHeight: 1.1,
    };

    // Cards area below title
    const cardsStartY = SLIDE_ELEMENT_MIN_Y + titleHeight + 80; // Gap after title
    const cardWidth = Math.floor((slideWidth - 270 - 40) / 2); // Two cards with gap
    const cardHeight = 650;
    const cardPadding = 40;

    const createTextCard = (
      cardTitle: string,
      cardText: string,
      cardIndex: number
    ): (SlideShape | SlideText)[] => {
      const cardX = SLIDE_MARGIN + cardIndex * (cardWidth + 40); // Gap between cards
      const cardY = cardsStartY;

      // Card background rectangle
      const cardBackground: SlideShape = {
        id: v4(),
        type: SlideElementBaseTypes.SHAPE,
        subtype: SlideShapeElementsVariants.RECTANGLE,
        x: cardX,
        y: cardY,
        width: cardWidth,
        height: cardHeight,
        fillColor: this.colors.rectangleColor,
        cornerRadius: 16,

        options: { isVisible: true, label: `Card ${cardIndex + 1} Background` },
      };

      // Card title
      const titleY = cardY + cardPadding;
      const cardTitleHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(cardTitle)}</span>`,
        fontSize: 40,
        fontFamily: 'Quicksand',
        lineHeight: 1.2,
        width: cardWidth - cardPadding * 2,
      });

      const cardTitleElement: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(cardTitle)}</span>`,
        x: cardX + cardPadding,
        y: titleY,
        width: cardWidth - cardPadding * 2,
        height: cardTitleHeight,

        options: { isVisible: true, label: `Card ${cardIndex + 1} Title` },
        fontSize: 40,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: 1.2,
      };

      // Card text
      const textY = titleY + cardTitleHeight + 20; // Gap after title
      const cardTextHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(cardText)}</span>`,
        fontSize: 32,
        fontFamily: 'Quicksand',
        lineHeight: 1.4,
        width: cardWidth - cardPadding * 2,
      });

      const cardTextElement: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(cardText)}</span>`,
        x: cardX + cardPadding,
        y: textY,
        width: cardWidth - cardPadding * 2,
        height: cardTextHeight,

        options: { isVisible: true, label: `Card ${cardIndex + 1} Text` },
        fontSize: 32,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: 1.4,
      };

      return [cardBackground, cardTitleElement, cardTextElement];
    };

    const card1Elements = createTextCard(card_1_title, card_1_text, 0);
    const card2Elements = createTextCard(card_2_title, card_2_text, 1);

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.CARDS_2,
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
        ...card1Elements,
        ...card2Elements,
        logoImageElement,
        ...(decorativeImageElement ? [decorativeImageElement] : []),
      ],
    };
  }
}
