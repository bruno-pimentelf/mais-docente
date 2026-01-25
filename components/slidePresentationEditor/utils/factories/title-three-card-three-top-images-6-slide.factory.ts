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
  SLIDE_IMAGE_RATIOS,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleThreeCardThreeTopImages6SlideFactory } from './slide-factory.interface';

export class TitleThreeCardThreeTopImages6SlideFactory implements ITitleThreeCardThreeTopImages6SlideFactory {
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

    // Cards area - no main title, cards start at top
    const cardsStartY = SLIDE_ELEMENT_MIN_Y;
    const cardsAreaWidth = slideWidth - 270; // Total width available for cards area
    const gapBetweenCards = 24; // Gap between cards
    const centerCardWidth = 650; // Middle card width (wider)
    const sideCardWidth = Math.floor(
      (cardsAreaWidth - centerCardWidth - gapBetweenCards * 2) / 2
    ); // Left and right cards (narrower)
    // Calculate maximum card height respecting bottom margin
    const cardHeight = slideHeight - cardsStartY - SLIDE_MARGIN;
    const cardPadding = 32;

    // Aspect ratios for images
    const sideImageAspectRatio = SLIDE_IMAGE_RATIOS._0_74; // 0.74 for left and right
    const centerImageAspectRatio = SLIDE_IMAGE_RATIOS._1_01; // 1.01 for middle

    // Center image has fixed width of 563px
    const centerImageWidth = 563;
    // Calculate common image height from center image width and aspect ratio
    const commonImageHeight = centerImageWidth / centerImageAspectRatio;
    // Calculate side image widths based on common height and aspect ratio
    const sideImageWidth = commonImageHeight * sideImageAspectRatio;

    // Calculate card positions
    const card1X = SLIDE_MARGIN;
    const card2X = card1X + sideCardWidth + gapBetweenCards;
    const card3X = card2X + centerCardWidth + gapBetweenCards;

    const card1Elements = createCardElement({
      image: {
        src: card_1_image,
        height: commonImageHeight,
        width: sideImageWidth,
        centered: true,
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
        x: card1X,
        y: cardsStartY,
        width: sideCardWidth,
        height: cardHeight,
        padding: cardPadding,
        cardIndex: 0,
      },
      colors: this.colors,
    });

    const card2Elements = createCardElement({
      image: {
        src: card_2_image,
        height: commonImageHeight,
        width: centerImageWidth,
        centered: true,
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
        x: card2X,
        y: cardsStartY,
        width: centerCardWidth,
        height: cardHeight,
        padding: cardPadding,
        cardIndex: 1,
      },
      colors: this.colors,
    });

    const card3Elements = createCardElement({
      image: {
        src: card_3_image,
        height: commonImageHeight,
        width: sideImageWidth,
        centered: true,
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
        x: card3X,
        y: cardsStartY,
        width: sideCardWidth,
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
      slideType: SlideThemeType.TITLE_THREE_CARD_THREE_TOP_IMAGES_6,
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
