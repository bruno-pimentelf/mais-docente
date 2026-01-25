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
  getDecorativeImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ICards2SlideFactory } from './slide-factory.interface';

export class Cards2SlideFactory implements ICards2SlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Title at the top
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
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    // Cards area below title
    const cardsStartY = SLIDE_ELEMENT_MIN_Y + titleHeight + 1; // Gap after title
    const cardWidth = Math.floor((slideWidth - 270 - 40) / 2); // Two cards with gap
    const cardPadding = 30;
    const imageSize = 260; // Circular image size

    const createCard = (
      cardImage: string,
      cardTitle: string,
      cardText: string,
      cardIndex: number
    ): (SlideImage | SlideText)[] => {
      const cardX = SLIDE_MARGIN + cardIndex * (cardWidth + 40); // Gap between cards
      const cardY = cardsStartY;

      // Card image (circular) - aligned to left
      const imageX = cardX + cardPadding; // Align to left with padding
      const imageY = cardY + cardPadding;

      const imageElement: SlideImage | null = cardImage
        ? {
            id: v4(),
            type: SlideElementBaseTypes.IMAGE,
            subtype: SlideImageElementsVariants.IMAGE,
            src: cardImage,
            x: imageX,
            y: imageY,
            width: imageSize,
            height: imageSize,
            borderRadius: imageSize / 2, // Make it circular (140px)

            options: { isVisible: true, label: `Card ${cardIndex + 1} Image` },
          }
        : null;

      // Card title
      const titleY = imageY + imageSize + 30; // Gap after image
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

      const elements: (SlideImage | SlideText)[] = [
        cardTitleElement,
        cardTextElement,
      ];
      if (imageElement) {
        elements.unshift(imageElement);
      }
      return elements;
    };

    const card1Elements = createCard(
      card_1_image,
      card_1_title,
      card_1_text,
      0
    );
    const card2Elements = createCard(
      card_2_image,
      card_2_title,
      card_2_text,
      1
    );

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.PEOPLE_1,
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
