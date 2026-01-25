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
  SLIDE_IMAGE_RATIOS,
  SLIDE_MARGIN,
  SLIDE_TEXT_Y_SPACING,
  createImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleOnePlainThreeBottomImagesSlideFactory } from './slide-factory.interface';

export class TitleOnePlainThreeBottomImages6SlideFactory implements ITitleOnePlainThreeBottomImagesSlideFactory {
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
    const spacing = SLIDE_TEXT_Y_SPACING;

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

    // Same column: three images in a single row occupying full width
    const gap = 64;
    const imagesAreaX = textX;
    const baseY = contentTextElement.y + contentTextElement.height + 60;
    const imageHeight = 384;

    // Calculate widths based on aspect ratios
    const image1Width = Math.floor(imageHeight * SLIDE_IMAGE_RATIOS._0_74);
    const image2Width = Math.floor(imageHeight * SLIDE_IMAGE_RATIOS._1_44);
    const image3Width = Math.floor(imageHeight * SLIDE_IMAGE_RATIOS._1_79);

    // Calculate x positions for each image
    let currentX = imagesAreaX;
    const img1X = currentX;
    currentX += image1Width + gap;
    const img2X = currentX;
    currentX += image2Width + gap;
    const img3X = currentX;

    // Create image elements with captions using createImageElement
    const image1Elements = image_url_1
      ? createImageElement({
          image: {
            src: image_url_1,
            x: img1X,
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
            x: img2X,
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

    const image3Elements = image_url_3
      ? createImageElement({
          image: {
            src: image_url_3,
            x: img3X,
            y: baseY,
            width: image3Width,
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
      slideType: SlideThemeType.TITLE_ONE_PLAIN_THREE_BOTTOM_IMAGES_6,
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
