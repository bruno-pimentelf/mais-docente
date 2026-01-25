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

export class TitleThreeColumnThreeTopImages7SlideFactory
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

    const titleX = SLIDE_MARGIN;
    const titleY = SLIDE_ELEMENT_MIN_Y;
    const titleSpacing = SLIDE_TEXT_Y_SPACING;
    const cardGap = SLIDE_IMAGES_ROW_GAP;

    // Left and middle images have 510px width
    const imageWidth = 510;

    // Right image has 350px width
    const rightImageWidth = 350;

    // Left image: 1.79 aspect ratio
    const leftAspectRatio = SLIDE_IMAGE_RATIOS._1_79;
    const leftImageHeight = imageWidth / leftAspectRatio;

    // Middle image: 1.44 aspect ratio (reference for placement)
    const middleAspectRatio = SLIDE_IMAGE_RATIOS._1_44;
    const middleImageHeight = imageWidth / middleAspectRatio;

    // Right image: 0.74 aspect ratio
    const rightAspectRatio = SLIDE_IMAGE_RATIOS._0_74;
    const rightImageHeight = rightImageWidth / rightAspectRatio;

    // Title width = space for first two columns (left + gap + middle)
    const titleWidth = imageWidth + cardGap + imageWidth;

    // Right image X position (after title + gap)
    const rightImageX = titleX + titleWidth + cardGap;

    // Calculate title height with new width
    const titleHeight = getTextHeight({
      text: `<span style="color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 82,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: titleWidth,
    });

    // Middle image is the reference - positioned just below the title
    const middleImageY = titleY + titleHeight + titleSpacing;
    const middleImageBottomY = middleImageY + middleImageHeight;

    // All images are bottom-aligned with the middle image
    const imagesBottomY = middleImageBottomY;

    // Title element
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

    // Right image (bottom-aligned with all images)
    const rightImageY = imagesBottomY - rightImageHeight;
    const rightImageElement: SlideImage | null = card_3_image
      ? {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: card_3_image,
          x: rightImageX,
          y: rightImageY,
          width: rightImageWidth,
          height: rightImageHeight,
          borderRadius: SLIDE_IMAGE_BORDER_RADIUS,
          options: { isVisible: true, label: 'Card 3 Image' },
        }
      : null;

    const createCard = (
      cardImage: string,
      cardTitle: string,
      cardText: string,
      cardIndex: number
    ): (SlideImage | SlideText)[] => {
      // Both left and middle cards have 510px width
      const cardWidth = imageWidth;

      // Calculate card X position and image height based on card index
      let cardX: number;
      let imageHeight: number;
      if (cardIndex === 0) {
        // Left card: 1.79 aspect ratio
        cardX = titleX;
        imageHeight = leftImageHeight;
      } else {
        // Middle card: 1.44 aspect ratio
        cardX = titleX + imageWidth + cardGap;
        imageHeight = middleImageHeight;
      }

      // Left and middle images bottom-aligned with all images
      const imageY = imagesBottomY - imageHeight;
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
          y: imageY,
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
        fontSize: 48,
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
        y: imagesBottomY + textSpacing,
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
        text: `<span style="color: ${this.colors.paragraphColor};">${processMarkdownFormatting(cardText)}</span>`,
        fontSize: 36,
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
        y: imagesBottomY + textSpacing + cardTitleHeight + textSpacing,
        width: cardWidth,
        height: cardTextHeight,

        options: { isVisible: true, label: `Card ${cardIndex + 1} Text` },
        fontSize: 36,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: 1.4,
      };
      elements.push(cardTextElement);

      return elements;
    };

    // Create cards for left (card 1) and middle (card 2)
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

    // Card 3 title and text (image is handled separately in title area)
    // Column width is 510px, but image is only 350px wide
    const textSpacing = 20;
    const card3TitleHeight = getTextHeight({
      text: `<span style="color: ${this.colors.subtitleColor}; font-weight: bold;">${processMarkdownFormatting(card_3_title)}</span>`,
      fontSize: 48,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: imageWidth,
    });

    const card3TitleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="color: ${this.colors.subtitleColor}; font-weight: bold;">${processMarkdownFormatting(card_3_title)}</span>`,
      x: rightImageX,
      y: imagesBottomY + textSpacing,
      width: imageWidth,
      height: card3TitleHeight,
      options: { isVisible: true, label: 'Card 3 Title' },
      fontSize: 48,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.2,
    };

    const card3TextHeight = getTextHeight({
      text: `<span style="color: ${this.colors.paragraphColor};">${processMarkdownFormatting(card_3_text)}</span>`,
      fontSize: 36,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: imageWidth,
    });

    const card3TextElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="color: ${this.colors.paragraphColor};">${processMarkdownFormatting(card_3_text)}</span>`,
      x: rightImageX,
      y: imagesBottomY + textSpacing + card3TitleHeight + textSpacing,
      width: imageWidth,
      height: card3TextHeight,
      options: { isVisible: true, label: 'Card 3 Text' },
      fontSize: 36,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };

    const logoImageElement = getLogoImageElement(logo_path);

    const elements: (SlideImage | SlideText)[] = [
      titleElement,
      ...card1Elements,
      ...card2Elements,
      card3TitleElement,
      card3TextElement,
      logoImageElement,
    ];

    // Add right image if it exists
    if (rightImageElement) {
      elements.push(rightImageElement);
    }

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TITLE_THREE_COLUMN_THREE_TOP_IMAGES_7,
      themeSettings: {
        baseWidth: slideWidth,
        baseHeight: slideHeight,
        width: slideWidth,
        height: slideHeight,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements,
    };
  }
}
