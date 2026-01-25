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
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
  SLIDE_TEXT_Y_SPACING,
  SLIDE_IMAGE_BORDER_RADIUS,
  SLIDE_IMAGE_RATIOS,
  processMarkdownFormatting,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleThreeColumnThreeTopImagesSlideFactory } from './slide-factory.interface';

export class TitleThreeColumnThreeTopImages4SlideFactory
  implements ITitleThreeColumnThreeTopImagesSlideFactory
{
  constructor(private colors: SlideTypeColors) {}

  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    card_3_image: string,
    card_3_title: string,
    card_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Title at the top
    const titleX = SLIDE_MARGIN;
    const titleWidth = slideWidth - titleX * 2;
    const titleY = SLIDE_ELEMENT_MIN_Y;
    const titleSpacing = SLIDE_TEXT_Y_SPACING;

    const titleHeight = getTextHeight({
      text: `<span style="color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 82,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: titleWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      x: titleX,
      y: titleY,
      width: titleWidth,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: 82,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    // Cards area below title
    const cardsStartY = titleY + titleHeight + titleSpacing;
    const cardsAreaWidth = slideWidth - titleX * 2;

    // Aspect ratios
    const leftAspectRatio = SLIDE_IMAGE_RATIOS._0_74; // 0.74 (for left and right images)
    const middleAspectRatio = SLIDE_IMAGE_RATIOS._1_44; // 1.44 (for middle image)

    // Middle card has fixed width of 720px
    const middleCardWidth = 720;
    const middleImageHeight = middleCardWidth / middleAspectRatio;

    // All images have the same height (equal to middle image height)
    const uniformImageHeight = middleImageHeight;

    // Left and right card widths calculated from uniform height and aspect ratio
    const sideCardWidth = Math.floor(uniformImageHeight * leftAspectRatio);

    // Column gap between images
    const columnGap = 40;

    // Calculate total width needed for all cards and gaps
    const totalCardsWidth =
      sideCardWidth + columnGap + middleCardWidth + columnGap + sideCardWidth;

    // Center the cards group within the available space
    const cardsGroupStartX = titleX + (cardsAreaWidth - totalCardsWidth) / 2;

    const createCard = (
      cardImage: string,
      cardTitle: string,
      cardText: string,
      cardIndex: number
    ): (SlideImage | SlideText)[] => {
      // Calculate card width based on position
      const cardWidth = cardIndex === 1 ? middleCardWidth : sideCardWidth;

      // All images have the same height
      const imageHeight = uniformImageHeight;

      // Calculate card X position with 40px gaps between columns
      let cardX: number;
      if (cardIndex === 0) {
        // Left card
        cardX = cardsGroupStartX;
      } else if (cardIndex === 1) {
        // Middle card
        cardX = cardsGroupStartX + sideCardWidth + columnGap;
      } else {
        // Right card
        cardX =
          cardsGroupStartX +
          sideCardWidth +
          columnGap +
          middleCardWidth +
          columnGap;
      }

      const cardY = cardsStartY;
      const textSpacing = 20;

      const elements: (SlideImage | SlideText)[] = [];

      // Card image
      if (cardImage) {
        const cardImageElement: SlideImage = {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: cardImage,
          x: cardX,
          y: cardY,
          width: cardWidth,
          height: imageHeight,
          borderRadius: SLIDE_IMAGE_BORDER_RADIUS,

          options: { isVisible: true, label: `Card ${cardIndex + 1} Image` },
        };
        elements.push(cardImageElement);
      }

      // Card title
      const cardTitleHeight = getTextHeight({
        text: `<span style="color: ${this.colors.subtitleColor}; font-weight: bold;">${processMarkdownFormatting(cardTitle)}</span>`,
        fontSize: 40,
        fontFamily: 'Quicksand',
        lineHeight: 1.2,
        width: cardWidth,
      });

      const cardTitleElement: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: `<span style="color: ${this.colors.subtitleColor}; font-weight: bold;">${processMarkdownFormatting(cardTitle)}</span>`,
        x: cardX,
        y: cardY + imageHeight + textSpacing,
        width: cardWidth,
        height: cardTitleHeight,

        options: { isVisible: true, label: `Card ${cardIndex + 1} Title` },
        fontSize: 40,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: 1.2,
      };
      elements.push(cardTitleElement);

      // Card text
      const cardTextHeight = getTextHeight({
        text: `<span style="color: ${this.colors.paragraphColor};">${processMarkdownFormatting(cardText)}</span>`,
        fontSize: 32,
        fontFamily: 'Quicksand',
        lineHeight: 1.4,
        width: cardWidth,
      });

      const cardTextElement: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: `<span style="color: ${this.colors.paragraphColor};">${processMarkdownFormatting(cardText)}</span>`,
        x: cardX,
        y: cardY + imageHeight + textSpacing + cardTitleHeight + textSpacing,
        width: cardWidth,
        height: cardTextHeight,

        options: { isVisible: true, label: `Card ${cardIndex + 1} Text` },
        fontSize: 32,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: 1.4,
      };
      elements.push(cardTextElement);

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
    const card3Elements = createCard(
      card_3_image,
      card_3_title,
      card_3_text,
      2
    );

    const logoImageElement = getLogoImageElement(logo_path);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TITLE_THREE_COLUMN_THREE_TOP_IMAGES_4,
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
        ...card3Elements,
        logoImageElement,
      ],
    };
  }
}
