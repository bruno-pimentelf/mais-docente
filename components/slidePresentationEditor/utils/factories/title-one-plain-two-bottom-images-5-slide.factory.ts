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
  SLIDE_IMAGE_RATIOS,
  processMarkdownFormatting,
  createImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleOnePlainTwoBottomImagesSlideFactory } from './slide-factory.interface';

export class TitleOnePlainTwoBottomImages5SlideFactory implements ITitleOnePlainTwoBottomImagesSlideFactory {
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
      text: `<span style="color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 82,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: textWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
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

    // Images start after title with spacing and fill to bottom margin
    const imageStartY = titleElement.y + titleHeight + 40;
    const imageHeight = SLIDE_ELEMENT_MAX_Y - imageStartY;

    // Image layout: widths calculated based on aspect ratio and height
    const gap = 71;
    const firstImageAspectRatio = SLIDE_IMAGE_RATIOS._0_74;
    const secondImageAspectRatio = SLIDE_IMAGE_RATIOS._1_44;
    const firstImageWidth = imageHeight * firstImageAspectRatio;
    const secondImageWidth = imageHeight * secondImageAspectRatio;
    const totalImagesWidth = firstImageWidth + gap + secondImageWidth;
    const firstImageX = (slideWidth - totalImagesWidth) / 2;
    const secondImageX = firstImageX + firstImageWidth + gap;

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
      slideType: SlideThemeType.TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_5,
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
