import { v4 } from 'uuid';
import {
  Slide,
  SlideLayoutVariants,
  SlideThemeType,
  SlideVariants,
} from '../../types/index';
import {
  createCardElement,
  ensureEqualHeights,
  getLogoImageElement,
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleTwoCardTwoTopImages1SlideFactory } from './slide-factory.interface';

export class TitleTwoCardTwoTopImages2SlideFactory implements ITitleTwoCardTwoTopImages1SlideFactory {
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

    // Cards area starts at the top (title removed)
    const cardsStartY = SLIDE_ELEMENT_MIN_Y; // Start from top since title is removed
    const cardWidth = Math.floor((slideWidth - 270 - 40) / 2); // Two cards with gap
    const cardHeight = slideHeight - SLIDE_MARGIN * 2; // Slide height minus top and bottom margins
    const cardPadding = 40;
    const imageHeight = 505; // Image height

    const card1Elements = createCardElement({
      image: {
        src: card_1_image,
        height: imageHeight,
      },
      title: {
        text: card_1_title,
        fontSize: 36,
      },
      text: {
        text: card_1_text,
        fontSize: 28,
      },
      cardInfo: {
        x: 135,
        y: cardsStartY,
        width: cardWidth,
        height: cardHeight,
        padding: cardPadding,
        cardIndex: 0,
      },
      colors: this.colors,
    });

    const card2Elements = createCardElement({
      image: {
        src: card_2_image,
        height: imageHeight,
      },
      title: {
        text: card_2_title,
        fontSize: 36,
      },
      text: {
        text: card_2_text,
        fontSize: 28,
      },
      cardInfo: {
        x: 135 + cardWidth + 40, // Gap between cards
        y: cardsStartY,
        width: cardWidth,
        height: cardHeight,
        padding: cardPadding,
        cardIndex: 1,
      },
      colors: this.colors,
    });

    const [equalizedCard1Elements, equalizedCard2Elements] = ensureEqualHeights(
      [card1Elements, card2Elements]
    );

    const logoImageElement = getLogoImageElement(logo_path);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TITLE_TWO_CARD_TWO_TOP_IMAGES_2,
      themeSettings: {
        baseWidth: slideWidth,
        baseHeight: slideHeight,
        width: slideWidth,
        height: slideHeight,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        ...equalizedCard1Elements,
        ...equalizedCard2Elements,
        logoImageElement,
      ],
    };
  }
}
