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
  getTextHeight,
  processMarkdownFormatting,
  SLIDE_CONTENT_MIN_Y,
  SLIDE_TEXT_Y_SPACING,
  SLIDE_IMAGE_RATIOS,
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITitleOnePlainTwoFullRightImagesSlideFactory } from './slide-factory.interface';

/**
 * Factory for creating title one plain two full right images 4 slides
 * Layout: Title and text content on the left side, two images stacked vertically on the right side
 * - Top image touches the top and right of the slide (no margin)
 * - Bottom image touches the bottom and right of the slide (no margin)
 * - Both images have fixed width of 633px
 * - Top image has aspect ratio 1.01, bottom image has aspect ratio 1.44
 * - Text width is adjusted to leave a gap between text and images
 * Follows Single Responsibility Principle - only creates title one plain two full right images 4 slides
 */
export class TitleOnePlainTwoFullRightImages4SlideFactory
  implements ITitleOnePlainTwoFullRightImagesSlideFactory
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
    const slideWidth = SLIDE_WIDTH;
    const slideHeight = SLIDE_HEIGHT;

    // Right side (images) - images touch the right edge
    // Both images have fixed width of 633px
    const image1AspectRatio = SLIDE_IMAGE_RATIOS._1_01;
    const image2AspectRatio = SLIDE_IMAGE_RATIOS._1_44;
    const imageWidth = 633; // Fixed width for both images
    const image1Height = imageWidth / image1AspectRatio; // Height calculated from aspect ratio
    const image2Height = imageWidth / image2AspectRatio; // Height calculated from aspect ratio
    const rightSideX = slideWidth - imageWidth; // Both images touch the right edge

    // Left side (text content) - with gap between text and images
    const gapBetweenTextAndImage = 32;
    const leftSideX = 135;
    const leftSideWidth = rightSideX - gapBetweenTextAndImage - leftSideX;

    // First image (top) - touches top and right
    const imageElement1: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: image_url_1,
      x: rightSideX,
      y: 0, // Touches top
      width: imageWidth,
      height: image1Height,

      options: {
        isVisible: true,
        label: 'Image 1',
      },
    };

    // Second image (bottom) - touches bottom and right
    const imageElement2: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: image_url_2,
      x: rightSideX,
      y: slideHeight - image2Height, // Touches bottom
      width: imageWidth,
      height: image2Height,

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
      text: `<span style="color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 72,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: leftSideWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
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
      text: `<span style="color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      fontSize: 38,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: leftSideWidth,
    });

    const contentTextElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      x: leftSideX,
      y: textStartY + titleHeight + textSpacing,
      width: leftSideWidth,
      height: contentTextHeight,

      options: {
        isVisible: true,
        label: 'Content Text',
      },
      fontSize: 38,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TITLE_ONE_PLAIN_TWO_FULL_RIGHT_IMAGES_4,
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
      ],
    };
  }
}
