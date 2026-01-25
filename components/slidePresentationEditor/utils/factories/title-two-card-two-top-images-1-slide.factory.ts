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
  processMarkdownFormatting,
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleTwoCardTwoTopImages1SlideFactory } from './slide-factory.interface';

export class TitleTwoCardTwoTopImages1SlideFactory implements ITitleTwoCardTwoTopImages1SlideFactory {
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
    const cardsStartY = SLIDE_ELEMENT_MIN_Y + titleHeight + 40; // Gap after title
    const cardWidth = Math.floor((slideWidth - 270 - 40) / 2); // Two cards with gap
    // Calculate maximum card height respecting bottom margin
    const cardHeight = slideHeight - cardsStartY - SLIDE_MARGIN;
    const cardPadding = 40;
    const imageHeight = 360; // Height for the image area

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
      slideType: SlideThemeType.TITLE_TWO_CARD_TWO_TOP_IMAGES_1,
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
        logoImageElement,
      ],
    };
  }
}
