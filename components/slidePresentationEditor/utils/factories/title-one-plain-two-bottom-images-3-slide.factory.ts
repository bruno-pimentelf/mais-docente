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
  getLogoImageElement,
  getTextHeight,
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_ELEMENT_MAX_Y,
  SLIDE_IMAGES_ROW_GAP,
  SLIDE_MARGIN,
  SLIDE_TEXT_Y_SPACING,
  processMarkdownFormatting,
  createImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleOnePlainTwoBottomImagesSlideFactory } from './slide-factory.interface';

export class TitleOnePlainTwoBottomImages3SlideFactory implements ITitleOnePlainTwoBottomImagesSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    image_url_1: string,
    image_url_2: string,
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption_1?: string,
    image_caption_2?: string
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    const textX = SLIDE_MARGIN;
    const textWidth = slideWidth - 270;
    const yPosition = SLIDE_ELEMENT_MIN_Y;
    const spacing = SLIDE_TEXT_Y_SPACING;

    const titleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 82,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: textWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      x: textX,
      y: yPosition,
      width: textWidth,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: 82,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    const contentTextHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      fontSize: 38,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: textWidth,
    });

    const contentTextElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      x: textX,
      y: yPosition + titleHeight + spacing,
      width: textWidth,
      height: contentTextHeight,

      options: { isVisible: true, label: 'Content Text' },
      fontSize: 38,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };

    // Row with two images occupying the full width beneath text
    const gap = SLIDE_IMAGES_ROW_GAP;
    const imagesAreaX = SLIDE_MARGIN;
    const baseY = contentTextElement.y + contentTextElement.height + 40;

    // First image: 1000px width
    const firstImageWidth = 1000;
    const firstImageX = imagesAreaX;

    // Second image: remaining space respecting gap and slide margin
    const secondImageX = firstImageX + firstImageWidth + gap;
    const secondImageWidth = slideWidth - secondImageX - SLIDE_MARGIN;

    // Image height fills all available space from baseY to bottom margin
    const imageHeight = SLIDE_ELEMENT_MAX_Y - baseY;

    // Create image elements with captions using createImageElement
    const image1Elements = image_url_1
      ? createImageElement({
          image: {
            src: image_url_1,
            x: firstImageX,
            y: baseY,
            width: firstImageWidth,
            height: imageHeight,
            borderRadius: 0,
            label: 'Image 1',
          },
          caption: image_caption_1
            ? {
                text: image_caption_1,
                fontSize: 30,
                label: 'Caption 1',
              }
            : undefined,
          colors: this.colors,
        })
      : [];

    const image2Elements = image_url_2
      ? createImageElement({
          image: {
            src: image_url_2,
            x: secondImageX,
            y: baseY,
            width: secondImageWidth,
            height: imageHeight,
            borderRadius: 0,
            label: 'Image 2',
          },
          caption: image_caption_2
            ? {
                text: image_caption_2,
                fontSize: 30,
                label: 'Caption 2',
              }
            : undefined,
          colors: this.colors,
        })
      : [];

    const logoImageElement = getLogoImageElement(logo_path);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_3,
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
        contentTextElement,
        ...image1Elements,
        ...image2Elements,
        logoImageElement,
      ],
    };
  }
}
