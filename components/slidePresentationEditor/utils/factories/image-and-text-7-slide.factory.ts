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
  processMarkdownFormatting,
  SLIDE_CONTENT_MIN_Y,
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_TEXT_Y_SPACING,
  SLIDE_IMAGE_BORDER_RADIUS,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleOnePlainTwoRightImagesSlideFactory } from './slide-factory.interface';

/**
 * Factory for creating image and text 7 slides
 * Layout: Title and text content on the left side, two images stacked vertically on the right side
 * Follows Single Responsibility Principle - only creates image and text 7 slides
 */
export class TitleOnePlainTwoRightImages1SlideFactory
  implements ITitleOnePlainTwoRightImagesSlideFactory
{
  constructor(private colors: SlideTypeColors) {}

  create(
    image_url_1: string,
    image_url_2: string,
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    _image_caption_1?: string,
    _image_caption_2?: string
  ): Slide {
    // Layout constants - slide dimensions
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Left side (text content)
    const leftSideX = 135;
    const leftSideWidth = 773;

    // Right side (images)
    const rightSideX = 960; // Start right side closer to center
    const rightSideWidth = 825; // Width for images
    const imageGap = 20; // Gap between the two images
    const topMargin = SLIDE_ELEMENT_MIN_Y; // Top margin for images
    const availableImageHeight = slideHeight - topMargin - 135; // Bottom margin
    const imageHeight = (availableImageHeight - imageGap) / 2; // Equal height for both images

    // First image (top)
    const imageElement1: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: image_url_1,
      x: rightSideX,
      y: topMargin,
      width: rightSideWidth,
      height: imageHeight,
      borderRadius: SLIDE_IMAGE_BORDER_RADIUS,

      options: {
        isVisible: true,
        label: 'Image 1',
      },
    };

    // Second image (bottom)
    const imageElement2: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: image_url_2,
      x: rightSideX,
      y: topMargin + imageHeight + imageGap,
      width: rightSideWidth,
      height: imageHeight,
      borderRadius: SLIDE_IMAGE_BORDER_RADIUS,

      options: {
        isVisible: true,
        label: 'Image 2',
      },
    };

    // Text positioning (left side)
    const textStartY = SLIDE_CONTENT_MIN_Y;
    const textSpacing = SLIDE_TEXT_Y_SPACING;

    // Title element (left side)
    const titleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 72,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: leftSideWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      x: leftSideX,
      y: textStartY,
      width: leftSideWidth,
      height: titleHeight,

      options: {
        isVisible: true,
        label: 'Title',
      },
      fontSize: 72,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    // Content text element (left side)
    const contentTextHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      fontSize: 32,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: leftSideWidth,
    });

    const contentTextElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      x: leftSideX,
      y: textStartY + titleHeight + textSpacing,
      width: leftSideWidth,
      height: contentTextHeight,

      options: {
        isVisible: true,
        label: 'Content Text',
      },
      fontSize: 32,
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
      slideType: SlideThemeType.TITLE_ONE_PLAIN_TWO_RIGHT_IMAGES_1,
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
        imageElement1,
        imageElement2,
        logoImageElement,
      ],
    };
  }
}
