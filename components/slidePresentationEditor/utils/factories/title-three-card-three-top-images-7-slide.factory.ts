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
import { ITitleThreeCardThreeTopImages7SlideFactory } from './slide-factory.interface';

export class TitleThreeCardThreeTopImages7SlideFactory implements ITitleThreeCardThreeTopImages7SlideFactory {
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
    const cardsAreaWidth = slideWidth - 270; // Total width available for cards area
    const gapBetweenCards = 24; // Gap between cards
    const centerCardWidth = 650; // Middle card width (wider)
    const sideCardWidth = Math.floor(
      (cardsAreaWidth - centerCardWidth - gapBetweenCards * 2) / 2
    ); // Left and right cards (narrower)
    // Calculate maximum card height respecting bottom margin
    const cardHeight = slideHeight - cardsStartY - SLIDE_MARGIN;
    const cardPadding = 30;
    const gapBetweenImageAndTitle = 20; // Gap between image and title
    const centerImageWidth = 590; // Center image width

    // Calculate card positions
    const card1X = SLIDE_MARGIN;
    const card2X = card1X + sideCardWidth + gapBetweenCards;
    const card3X = card2X + centerCardWidth + gapBetweenCards;

    // Calculate title heights to determine image heights
    const card1TitleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(card_1_title)}</span>`,
      fontSize: 36,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: sideCardWidth - cardPadding * 2,
    });
    const card2TitleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(card_2_title)}</span>`,
      fontSize: 36,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: centerCardWidth - cardPadding * 2,
    });
    const card3TitleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(card_3_title)}</span>`,
      fontSize: 36,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: sideCardWidth - cardPadding * 2,
    });

    // Image heights: takes up all available height excluding title height, padding, and gap
    const card1ImageHeight =
      cardHeight - cardPadding * 2 - card1TitleHeight - gapBetweenImageAndTitle;
    const card2ImageHeight =
      cardHeight - cardPadding * 2 - card2TitleHeight - gapBetweenImageAndTitle;
    const card3ImageHeight =
      cardHeight - cardPadding * 2 - card3TitleHeight - gapBetweenImageAndTitle;

    const card1Elements = createCardElement({
      image: {
        src: card_1_image,
        height: card1ImageHeight,
      },
      title: {
        text: card_1_title,
        fontSize: 36,
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
        height: card2ImageHeight,
        width: centerImageWidth,
        centered: true,
      },
      title: {
        text: card_2_title,
        fontSize: 36,
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
        height: card3ImageHeight,
      },
      title: {
        text: card_3_title,
        fontSize: 36,
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
      slideType: SlideThemeType.TITLE_THREE_CARD_THREE_TOP_IMAGES_7,
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
