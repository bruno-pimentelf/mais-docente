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
  createCardElement,
  ensureEqualHeights,
  getLogoImageElement,
  getTextHeight,
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
  SLIDE_TEXT_Y_SPACING,
  processMarkdownFormatting,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleThreeCardThreeTopImages5SlideFactory } from './slide-factory.interface';

export class TitleThreeCardThreeTopImages5SlideFactory implements ITitleThreeCardThreeTopImages5SlideFactory {
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
    const cardsStartY =
      SLIDE_ELEMENT_MIN_Y + titleHeight + SLIDE_TEXT_Y_SPACING; // Gap after title
    const cardWidth = Math.floor((slideWidth - 270 - 80) / 3); // Three cards with gaps
    // Calculate maximum card height respecting bottom margin
    const cardHeight = slideHeight - cardsStartY - SLIDE_MARGIN;
    const cardPadding = 30;
    const gapBetweenImageAndTitle = 20; // Gap between image and title

    const createCardElements = (
      cardImage: string,
      cardTitle: string,
      cardIndex: number
    ) => {
      const cardX = 135 + cardIndex * (cardWidth + 40); // Gap between cards

      const cardTitleHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(cardTitle)}</span>`,
        fontSize: 36,
        fontFamily: 'Quicksand',
        lineHeight: 1.2,
        width: cardWidth - cardPadding * 2,
      });

      const imageHeight =
        cardHeight -
        cardPadding * 2 -
        cardTitleHeight -
        gapBetweenImageAndTitle;

      return createCardElement({
        image: {
          src: cardImage,
          height: imageHeight,
        },
        title: {
          text: cardTitle,
          fontSize: 36,
        },
        cardInfo: {
          x: cardX,
          y: cardsStartY,
          width: cardWidth,
          height: cardHeight,
          padding: cardPadding,
          cardIndex,
        },
        colors: this.colors,
      });
    };

    const card1Elements = createCardElements(card_1_image, card_1_title, 0);
    const card2Elements = createCardElements(card_2_image, card_2_title, 1);
    const card3Elements = createCardElements(card_3_image, card_3_title, 2);

    const [
      equalizedCard1Elements,
      equalizedCard2Elements,
      equalizedCard3Elements,
    ] = ensureEqualHeights([card1Elements, card2Elements, card3Elements]);

    const logoImageElement = getLogoImageElement(logo_path);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TITLE_THREE_CARD_THREE_TOP_IMAGES_5,
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
        ...equalizedCard1Elements,
        ...equalizedCard2Elements,
        ...equalizedCard3Elements,
        logoImageElement,
      ],
    };
  }
}
