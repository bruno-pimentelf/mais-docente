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
  SLIDE_IMAGE_BORDER_RADIUS,
  SLIDE_IMAGE_RATIOS,
  createImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { INoTitleOnePlainTwoTopImagesSlideFactory } from './slide-factory.interface';

export class NoTitleOnePlainTwoTopImages4SlideFactory implements INoTitleOnePlainTwoTopImagesSlideFactory {
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

    // Left side: Large image with aspect ratio 1.01, width 735px
    const leftImageX = 135;
    const leftImageWidth = 735;
    const leftImageHeight = leftImageWidth / SLIDE_IMAGE_RATIOS._1_01;
    const leftImageY = 135;

    // Create left image element with caption using createImageElement
    const leftImageElements = image_url_1
      ? createImageElement({
          image: {
            src: image_url_1,
            x: leftImageX,
            y: leftImageY,
            width: leftImageWidth,
            height: leftImageHeight,
            borderRadius: SLIDE_IMAGE_BORDER_RADIUS,
            label: 'Main Image',
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

    // Right side: Small image at top + text below
    const rightAreaX = leftImageX + leftImageWidth + 60; // 60px gap
    const rightAreaWidth = slideWidth - rightAreaX - 135;
    const rightAreaY = leftImageY; // Align with left image top
    const spacing = 20;

    // Small image on the right with aspect ratio 1.79, height 440px
    const smallImageHeight = 440;
    const smallImageWidth = smallImageHeight * SLIDE_IMAGE_RATIOS._1_79;

    // Calculate caption height for right image if caption exists
    const captionGap = 8;
    const captionHeight = image_caption_2
      ? getTextHeight({
          text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}; font-style: italic;">${processMarkdownFormatting(image_caption_2)}</span>`,
          fontSize: 30,
          fontFamily: 'Quicksand',
          lineHeight: 1.3,
          width: smallImageWidth,
        })
      : 0;
    const captionSpace = image_caption_2 ? captionGap + captionHeight : 0;

    // Create right image element with caption using createImageElement
    const rightImageElements = image_url_2
      ? createImageElement({
          image: {
            src: image_url_2,
            x: rightAreaX,
            y: rightAreaY,
            width: smallImageWidth,
            height: smallImageHeight,
            borderRadius: SLIDE_IMAGE_BORDER_RADIUS,
            label: 'Small Image',
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

    // Title below the small image (and caption if it exists)
    const titleY = rightAreaY + smallImageHeight + captionSpace + spacing;
    const titleWidth = rightAreaWidth;
    const titleGap = 16; // Gap between title and paragraph text

    const titleHeight = getTextHeight({
      text: `<span style="color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 48,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: titleWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      x: rightAreaX,
      y: titleY,
      width: titleWidth,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: 48,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.2,
    };

    // Text below the title
    const textY = titleY + titleHeight + titleGap;
    const textWidth = rightAreaWidth;

    const contentTextHeight = getTextHeight({
      text: `<span style="color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      fontSize: 38,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: textWidth,
    });

    const contentTextElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      x: rightAreaX,
      y: textY,
      width: textWidth,
      height: contentTextHeight,

      options: { isVisible: true, label: 'Content Text' },
      fontSize: 38,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };

    const logoImageElement = getLogoImageElement(logo_path);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.NO_TITLE_ONE_PLAIN_TWO_TOP_IMAGES_4,
      themeSettings: {
        baseWidth: slideWidth,
        baseHeight: slideHeight,
        width: slideWidth,
        height: slideHeight,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        ...leftImageElements,
        ...rightImageElements,
        titleElement,
        contentTextElement,
        logoImageElement,
      ],
    };
  }
}
