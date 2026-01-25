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
  SLIDE_IMAGES_ROW_GAP,
  SLIDE_IMAGE_RATIOS,
  processMarkdownFormatting,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleThreeColumnThreeTopImagesSlideFactory } from './slide-factory.interface';

export class TitleThreeColumnThreeTopImages1SlideFactory
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
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 82,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: titleWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
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
    const cardGap = SLIDE_IMAGES_ROW_GAP;

    // All images have equal width and are evenly spaced
    const imageWidth = Math.floor((cardsAreaWidth - cardGap * 2) / 3);
    // Calculate image height using aspect ratio 1.79
    const imageHeight = Math.floor(imageWidth / SLIDE_IMAGE_RATIOS._1_79);

    const createCard = (
      cardImage: string,
      cardTitle: string,
      cardText: string,
      cardIndex: number
    ): (SlideImage | SlideText)[] => {
      // All cards have equal width
      const cardWidth = imageWidth;

      // Calculate card X position - evenly spaced
      const cardX = titleX + cardIndex * (imageWidth + cardGap);

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
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.subtitleColor}; font-weight: bold;">${processMarkdownFormatting(cardTitle)}</span>`,
        fontSize: 48,
        fontFamily: 'Quicksand',
        lineHeight: 1.2,
        width: cardWidth,
      });

      const cardTitleElement: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.subtitleColor}; font-weight: bold;">${processMarkdownFormatting(cardTitle)}</span>`,
        x: cardX,
        y: cardY + imageHeight + textSpacing,
        width: cardWidth,
        height: cardTitleHeight,

        options: { isVisible: true, label: `Card ${cardIndex + 1} Title` },
        fontSize: 48,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: 1.2,
      };
      elements.push(cardTitleElement);

      // Card text
      const cardTextHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(cardText)}</span>`,
        fontSize: 32,
        fontFamily: 'Quicksand',
        lineHeight: 1.4,
        width: cardWidth,
      });

      const cardTextElement: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(cardText)}</span>`,
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
      slideType: SlideThemeType.TITLE_THREE_COLUMN_THREE_TOP_IMAGES_1,
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
