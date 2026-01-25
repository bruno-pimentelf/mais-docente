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
import { ITitleThreeCardThreeTopImages2SlideFactory } from './slide-factory.interface';

export class TitleThreeCardThreeTopImages2SlideFactory implements ITitleThreeCardThreeTopImages2SlideFactory {
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

    // Cards area - fills all available vertical space
    const cardsStartY = SLIDE_ELEMENT_MIN_Y;
    const cardsEndY = slideHeight - SLIDE_MARGIN; // Bottom margin
    const cardHeight = cardsEndY - cardsStartY; // Full vertical space minus margins
    const cardWidth = Math.floor((slideWidth - 270 - 80) / 3); // Three cards with gaps
    const cardPadding = 30;
    const imageSize = 456; // Square images

    const card1Elements = createCardElement({
      image: {
        src: card_1_image,
        height: imageSize,
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
        height: imageSize,
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
        x: 135 + cardWidth + 40,
        y: cardsStartY,
        width: cardWidth,
        height: cardHeight,
        padding: cardPadding,
        cardIndex: 1,
      },
      colors: this.colors,
    });

    const card3Elements = createCardElement({
      image: {
        src: card_3_image,
        height: imageSize,
      },
      title: {
        text: card_3_title,
        fontSize: 36,
      },
      text: {
        text: card_3_text,
        fontSize: 28,
      },
      cardInfo: {
        x: 135 + (cardWidth + 40) * 2,
        y: cardsStartY,
        width: cardWidth,
        height: cardHeight,
        padding: cardPadding,
        cardIndex: 2,
      },
      colors: this.colors,
    });

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
      slideType: SlideThemeType.TITLE_THREE_CARD_THREE_TOP_IMAGES_2,
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
        ...equalizedCard3Elements,
        logoImageElement,
      ],
    };
  }
}
