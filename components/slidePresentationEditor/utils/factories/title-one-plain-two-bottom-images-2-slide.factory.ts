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
  SLIDE_TEXT_Y_SPACING,
  processMarkdownFormatting,
  createImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleOnePlainTwoBottomImagesSlideFactory } from './slide-factory.interface';

export class TitleOnePlainTwoBottomImages2SlideFactory implements ITitleOnePlainTwoBottomImagesSlideFactory {
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

    // Image layout: first image 970px wide, second image full height with gap
    const firstImageWidth = 970;
    const gap = SLIDE_IMAGES_ROW_GAP;

    // Images start at margin, in a row
    const firstImageX = SLIDE_MARGIN;
    const secondImageX = firstImageX + firstImageWidth + gap;
    const secondImageWidth = slideWidth - secondImageX - SLIDE_MARGIN;

    // Text width: should respect the gap - text area ends before images start
    const textX = SLIDE_MARGIN;
    const textWidth = firstImageWidth - gap;
    const yPosition = SLIDE_ELEMENT_MIN_Y;
    const spacing = SLIDE_TEXT_Y_SPACING;

    // Title and content text have the same width
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

    // Second image starts at the same y as title (uses title height space)
    const secondImageStartY = yPosition;
    const secondImageHeight = SLIDE_ELEMENT_MAX_Y - secondImageStartY;

    // Content text starts below title
    const contentTextStartY = titleElement.y + titleHeight + spacing;
    // Text height should respect second image height (but starts lower)
    const availableTextHeight =
      secondImageHeight - (contentTextStartY - secondImageStartY);
    const contentTextHeight = Math.min(
      getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
        fontSize: 38,
        fontFamily: 'Quicksand',
        lineHeight: 1.4,
        width: textWidth,
      }),
      availableTextHeight
    );

    const contentTextElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      x: textX,
      y: contentTextStartY,
      width: textWidth,
      height: contentTextHeight,

      options: { isVisible: true, label: 'Content Text' },
      fontSize: 38,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };

    // First image: starts below content text, doesn't use title/content space
    const firstImageStartY =
      contentTextElement.y + contentTextElement.height + spacing;
    const firstImageHeight = SLIDE_ELEMENT_MAX_Y - firstImageStartY;

    // Create image elements with captions using createImageElement
    // First image: 970px wide, starts below content text
    const image1Elements = image_url_1
      ? createImageElement({
          image: {
            src: image_url_1,
            x: firstImageX,
            y: firstImageStartY,
            width: firstImageWidth,
            height: firstImageHeight,
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

    // Second image: full height (including title space), remaining width
    const image2Elements = image_url_2
      ? createImageElement({
          image: {
            src: image_url_2,
            x: secondImageX,
            y: secondImageStartY,
            width: secondImageWidth,
            height: secondImageHeight,
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
      slideType: SlideThemeType.TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_2,
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
