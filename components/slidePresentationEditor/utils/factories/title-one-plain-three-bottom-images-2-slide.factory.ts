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
  processMarkdownFormatting,
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
  SLIDE_TEXT_Y_SPACING,
  createImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleOnePlainThreeBottomImagesSlideFactory } from './slide-factory.interface';

export class TitleOnePlainThreeBottomImages2SlideFactory implements ITitleOnePlainThreeBottomImagesSlideFactory {
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

    const yPosition = SLIDE_ELEMENT_MIN_Y;
    const spacing = SLIDE_TEXT_Y_SPACING;
    const gap = 36;

    // Third image: positioned on the right, full height, starting at title y
    const image3Width = 630; // Width for the third image
    const image3X = slideWidth - SLIDE_MARGIN - image3Width;
    const image3Y = yPosition;
    const image3Height = slideHeight - image3Y - SLIDE_MARGIN; // Full available height minus bottom margin

    // Text area: adjusted width to avoid overlapping with third image
    const textX = SLIDE_MARGIN;
    const textWidth = image3X - textX - gap; // Width reduced to avoid touching image 3

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

    // Images 1 and 2: positioned below text in a row, using only the left area
    const imagesAreaX = textX;
    const baseY = contentTextElement.y + contentTextElement.height + 60;
    const imageHeight = 400;
    const image1Width = 325;
    const image2Width = image3Width;

    // Create image elements with captions using createImageElement
    const image1Elements = image_url_1
      ? createImageElement({
          image: {
            src: image_url_1,
            x: imagesAreaX,
            y: baseY,
            width: image1Width,
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
            x: imagesAreaX + image1Width + gap,
            y: baseY,
            width: image2Width,
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

    // Third image: full height on the right
    const image3Elements = image_url_3
      ? createImageElement({
          image: {
            src: image_url_3,
            x: image3X,
            y: image3Y,
            width: image3Width,
            height: image3Height,
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
      slideType: SlideThemeType.TITLE_ONE_PLAIN_THREE_BOTTOM_IMAGES_2,
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
        ...image3Elements,
        logoImageElement,
      ],
    };
  }
}
