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
  SlideShape,
  SlideShapeElementsVariants,
} from '../../types/index';
import {
  getLogoImageElement,
  getTextHeight,
  processMarkdownFormatting,
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
  SLIDE_TEXT_Y_SPACING,
  getDecorativeImageElements,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { IImageAndText4SlideFactory } from './slide-factory.interface';

/**
 * Factory for creating image and text 4 slides
 * Features title + content_text on the left and image filling 40% right portion with no margin/padding
 * Follows Single Responsibility Principle - only creates image and text 4 slides
 */
export class ImageAndText4SlideFactory implements IImageAndText4SlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    image_url: string,
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption?: string
  ): Slide {
    // Layout dimensions - image takes 40% of the slide width (right side), no margin/padding
    const slideWidth = 1920;
    const slideHeight = 1080;
    const imageWidth = Math.floor(slideWidth * 0.5); // 40% of slide width
    const imageX = slideWidth - imageWidth; // Position at right edge
    const textWidth = imageX - 135 * 2; // Text area width (left side with margin)

    // Image element - fills 40% right portion with no margin/padding from borders
    let imageElement: SlideImage | null = null;
    if (image_url) {
      imageElement = {
        id: v4(),
        type: SlideElementBaseTypes.IMAGE,
        subtype: SlideImageElementsVariants.IMAGE,
        src: image_url,
        x: imageX, // Start from 60% point
        y: 0, // No margin from top
        width: imageWidth, // 40% of slide width
        height: slideHeight, // Full height, no margin from bottom
        borderRadius: 0, // No border radius for edge-to-edge fill

        options: {
          isVisible: true,
          label: 'Main Image',
        },
      };
    }

    // Text positioning (left side)
    const textX = SLIDE_MARGIN; // Standard left margin
    const yPosition = SLIDE_ELEMENT_MIN_Y; // Standard top position
    const spacing = SLIDE_TEXT_Y_SPACING; // Space between title and content

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

      options: {
        isVisible: true,
        label: 'Title',
      },
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

      options: {
        isVisible: true,
        label: 'Content Text',
      },
      fontSize: 38,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };

    // Caption background pill and text (if caption provided)
    let captionBackground: SlideShape | null = null;
    let captionTextElement: SlideText | null = null;

    if (image_caption) {
      let pillHeight = 45; // baseline height
      const pillX = imageX + 32.5; // 32.5 px from image left edge
      let pillY = slideHeight - 31 - pillHeight; // computed after final height too

      // preliminary width using default margin 160 to estimate line count
      const prelimInnerWidth = Math.max(427, slideWidth - (pillX + 160)) - 32;

      const calculatedTextHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; font-size:32px;font-family:Rubik;line-height:1.4;">${processMarkdownFormatting(image_caption)}</span>`,
        fontSize: 32,
        fontFamily: 'Rubik',
        lineHeight: 1.4,
        width: prelimInnerWidth,
      });

      const isMultiLine = calculatedTextHeight > 40; // heuristically >1 line
      const logoSafeMargin = isMultiLine ? 200 : 160; // add more room when multi-line

      const maxPillWidth = slideWidth - (pillX + logoSafeMargin);
      const pillWidth = Math.max(427, maxPillWidth);

      const innerTextWidth = pillWidth - 32; // padding LR

      pillHeight = Math.max(45, calculatedTextHeight + 16); // 8px padding top+bottom
      pillY = slideHeight - 31 - pillHeight; // adjust Y if height changed

      captionBackground = {
        id: v4(),
        type: SlideElementBaseTypes.SHAPE,
        subtype: SlideShapeElementsVariants.RECTANGLE,
        x: pillX,
        y: pillY,
        width: pillWidth,
        height: pillHeight,
        cornerRadius: 8,

        options: {
          isVisible: true,
          label: 'Caption Background',
        },
        fillColor: this.colors.rectangleColor,
      };

      captionTextElement = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}; font-style: italic; font-family: Rubik; letter-spacing: -0.25px;">${processMarkdownFormatting(image_caption)}</span>`,
        x: pillX + 16, // padding left
        y: pillY + 8, // padding top
        width: pillWidth - 32, // inner width (padding L+R = 16*2)
        height: calculatedTextHeight,

        options: {
          isVisible: true,
          label: 'Caption Text',
        },
        fontSize: 32,
        fontFamily: 'Rubik',
        textAlign: TextAlignment.Left,
        lineHeight: 1.4,
      };
    }

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElements = getDecorativeImageElements(this.colors);
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TEXT_AND_IMAGE_1,
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        titleElement,
        contentTextElement,
        ...(imageElement ? [imageElement] : []),
        ...(captionBackground ? [captionBackground] : []),
        ...(captionTextElement ? [captionTextElement] : []),
        logoImageElement,
        ...decorativeImageElements,
      ],
    };
  }
}
