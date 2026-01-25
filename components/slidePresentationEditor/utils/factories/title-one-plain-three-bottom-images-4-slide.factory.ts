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
  SLIDE_MARGIN,
  processMarkdownFormatting,
  createImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleOnePlainThreeBottomImagesSlideFactory } from './slide-factory.interface';

export class TitleOnePlainThreeBottomImages4SlideFactory implements ITitleOnePlainThreeBottomImagesSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    image_url_1: string,
    image_url_2: string,
    image_url_3: string,
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption_1?: string,
    image_caption_2?: string,
    image_caption_3?: string
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Text area - same width as images
    const textX = SLIDE_MARGIN;
    const textWidth = slideWidth - textX * 2; // Same width as images area
    const yPosition = SLIDE_ELEMENT_MIN_Y;

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

    // Three images in a single row, each with width 526px
    const gap = 36;
    const imagesAreaX = textX;
    const imageWidth = 526;
    const spacingAfterTitle = 60;
    const baseY = titleElement.y + titleHeight + spacingAfterTitle;
    // Height fills from below title to available margin
    const imageHeight = SLIDE_ELEMENT_MAX_Y - baseY;

    // Create image elements with captions using createImageElement
    const image1Elements = image_url_1
      ? createImageElement({
          image: {
            src: image_url_1,
            x: imagesAreaX,
            y: baseY,
            width: imageWidth,
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
            x: imagesAreaX + imageWidth + gap,
            y: baseY,
            width: imageWidth,
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

    const image3Elements = image_url_3
      ? createImageElement({
          image: {
            src: image_url_3,
            x: imagesAreaX + (imageWidth + gap) * 2,
            y: baseY,
            width: imageWidth,
            height: imageHeight,
            borderRadius: 0,
            label: 'Image 3',
          },
          caption: image_caption_3
            ? {
                text: image_caption_3,
                fontSize: 30,
                label: 'Caption 3',
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
      slideType: SlideThemeType.TITLE_ONE_PLAIN_THREE_BOTTOM_IMAGES_4,
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
        ...image1Elements,
        ...image2Elements,
        ...image3Elements,
        logoImageElement,
      ],
    };
  }
}
