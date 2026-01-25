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
  getImageDimensions,
  processMarkdownFormatting,
  SLIDE_CONTENT_MIN_Y,
  SLIDE_TEXT_Y_SPACING,
  SLIDE_IMAGE_BORDER_RADIUS,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { IMainImageMirroredSlideFactory } from './slide-factory.interface';

/**
 * Factory for creating main image slides with mirrored layout (text on left, image on right)
 * Follows Single Responsibility Principle - only creates mirrored main image slides
 */
export class MainImageMirroredSlideFactory implements IMainImageMirroredSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  /**
   * Calculates dimensions that maintain aspect ratio within constraints
   */
  private calculateAspectRatioDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number; x: number; y: number } {
    const aspectRatio = originalWidth / originalHeight;

    let finalWidth = maxWidth;
    let finalHeight = maxWidth / aspectRatio;

    // If height exceeds max height, constrain by height instead
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = maxHeight * aspectRatio;
    }

    // Center the image in the allocated space (positioned on the right side)
    const baseX = 1012; // Right side position (mirrored from original)
    const baseY = 172;
    const x = baseX + (maxWidth - finalWidth) / 2;
    const y = baseY + (maxHeight - finalHeight) / 2;

    return {
      width: Math.round(finalWidth),
      height: Math.round(finalHeight),
      x: Math.round(x),
      y: Math.round(y),
    };
  }

  async create(
    image_url: string | null,
    category: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption?: string
  ): Promise<Slide> {
    let imageElement: SlideImage | null = null;
    if (image_url) {
      try {
        // Load image dimensions
        const { width: originalWidth, height: originalHeight } =
          await getImageDimensions(image_url);

        // Define the maximum space available for the image
        const maxWidth = 735;
        const maxHeight = 735;

        // Calculate dimensions maintaining aspect ratio
        const imageDimensions = this.calculateAspectRatioDimensions(
          originalWidth,
          originalHeight,
          maxWidth,
          maxHeight
        );

        imageElement = {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: image_url,
          x: imageDimensions.x,
          y: imageDimensions.y,
          width: imageDimensions.width,
          height: imageDimensions.height,
          borderRadius: SLIDE_IMAGE_BORDER_RADIUS,

          options: {
            isVisible: true,
            label: 'Main Image',
          },
        };
      } catch (error) {
        console.warn('Failed to load image dimensions, using fallback:', error);
        // Fallback to original square dimensions if image loading fails (positioned on right)
        imageElement = {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: image_url,
          x: 1012, // Right side position
          y: 172,
          width: 735,
          height: 735,
          borderRadius: SLIDE_IMAGE_BORDER_RADIUS,

          options: {
            isVisible: true,
            label: 'Main Image',
          },
        };
      }
    }

    const captionElement: SlideText | null = image_caption
      ? {
          id: v4(),
          type: SlideElementBaseTypes.TEXT,
          subtype: SlideTextElementsVariants.PARAGRAPH,
          text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}; font-style: italic; font-family: Rubik; letter-spacing: -0.25px;">${processMarkdownFormatting(image_caption)}</span>`,
          x: 1012,
          y: (imageElement?.y ?? 172) + (imageElement?.height ?? 735) + 20,
          width: 773.5,
          height: 45,

          options: {
            isVisible: true,
            label: 'Caption',
          },
          fontSize: 28,
          fontFamily: 'Rubik',
          textAlign: TextAlignment.Left,
          lineHeight: 1.4,
        }
      : null;

    const yPosition = image_url
      ? SLIDE_CONTENT_MIN_Y + 10
      : SLIDE_CONTENT_MIN_Y;
    const spacing = SLIDE_TEXT_Y_SPACING;

    const titleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(category)}</span>`,
      fontSize: 82,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: 773,
    });

    const title: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(category)}</span>`,
      x: image_url ? 135 : 269, // Left side position (mirrored from original)
      y: yPosition,
      width: image_url ? 773 : 1383,
      height: titleHeight,

      options: {
        isVisible: true,
        label: 'Category Title',
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
      width: 773,
    });

    const contentText: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      x: image_url ? 135 : 269, // Left side position (mirrored from original)
      y: yPosition + titleHeight + spacing,
      width: image_url ? 773 : 1383,
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

    const logoImageElement = getLogoImageElement(logo_path);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.IMAGE_AND_TEXT_2,
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        title,
        contentText,
        ...(imageElement ? [imageElement] : []),
        ...(captionElement ? [captionElement] : []),
        logoImageElement,
      ],
    };
  }
}
