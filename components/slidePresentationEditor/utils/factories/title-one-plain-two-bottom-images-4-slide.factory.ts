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
  SLIDE_IMAGES_ROW_GAP,
  processMarkdownFormatting,
  createImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleOnePlainTwoBottomImagesSlideFactory } from './slide-factory.interface';

export class TitleOnePlainTwoBottomImages4SlideFactory implements ITitleOnePlainTwoBottomImagesSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    image_url_1: string,
    image_url_2: string,
    title: string,
    _content_text: string,
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

    // Image layout: first image 1160px wide, second image fills remaining space
    const gap = SLIDE_IMAGES_ROW_GAP;
    const firstImageWidth = 1160;
    const firstImageX = SLIDE_MARGIN;
    const secondImageX = firstImageX + firstImageWidth + gap;
    const secondImageWidth = slideWidth - secondImageX - SLIDE_MARGIN;

    // Images start after title with spacing and fill to bottom margin
    const imageStartY = titleElement.y + titleHeight + 40;
    const imageHeight = SLIDE_ELEMENT_MAX_Y - imageStartY;

    // Create image elements with captions using createImageElement
    const image1Elements = image_url_1
      ? createImageElement({
          image: {
            src: image_url_1,
            x: firstImageX,
            y: imageStartY,
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
            y: imageStartY,
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
      slideType: SlideThemeType.TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_4,
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
        logoImageElement,
      ],
    };
  }
}
