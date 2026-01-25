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
  getDecorativeImageElement,
  getTextHeight,
  getImageDimensions,
  processMarkdownFormatting,
  SLIDE_IMAGE_BORDER_RADIUS,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { IBigImageSlideFactory } from './slide-factory.interface';
import { v4 } from 'uuid';

/**
 * Factory for creating big image slides
 * Features a large image taking most of the space with a legend paragraph at the bottom
 * Follows Single Responsibility Principle - only creates big image slides
 */
export class BigImageSlideFactory implements IBigImageSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  /**
   * Calculates dimensions that maintain aspect ratio within constraints for the big image
   */
  private calculateBigImageDimensions(
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

    // Center the image horizontally and position it towards the top
    const baseX = 135; // Left margin
    const baseY = 120; // Top margin
    const x = baseX + (maxWidth - finalWidth) / 2;
    const y = baseY;

    return {
      width: Math.round(finalWidth),
      height: Math.round(finalHeight),
      x: Math.round(x),
      y: Math.round(y),
    };
  }

  async create(
    image_url: string,
    legend_text: string,
    logo_path: string,
    slideOrder: number
  ): Promise<Slide> {
    let imageElement: SlideImage | null = null;
    if (image_url) {
      try {
        // Load image dimensions
        const { width: originalWidth, height: originalHeight } =
          await getImageDimensions(image_url);

        // Define the maximum space available for the big image
        // Leave space for the legend at the bottom (around 150px) and some margin
        const maxWidth = 1650; // Almost full width with margins
        const maxHeight = 750; // Leave space for legend and margins

        // Calculate dimensions maintaining aspect ratio
        const imageDimensions = this.calculateBigImageDimensions(
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
            label: 'Big Image',
          },
        };
      } catch (error) {
        console.warn('Failed to load image dimensions, using fallback:', error);
        // Fallback dimensions if image loading fails
        imageElement = {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: image_url,
          x: 135,
          y: 120,
          width: 1650,
          height: 750,
          borderRadius: SLIDE_IMAGE_BORDER_RADIUS,

          options: {
            isVisible: true,
            label: 'Big Image',
          },
        };
      }
    }

    // Position the legend text at the bottom
    const legendY = 880; // Position near the bottom of the slide

    const legendTextHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(legend_text)}</span>`,
      fontSize: 32,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: 1650,
    });

    const legendTextElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}; font-style: italic;">${processMarkdownFormatting(legend_text)}</span>`,
      x: 135,
      y: legendY,
      width: 1650,
      height: legendTextHeight,

      options: {
        isVisible: true,
        label: 'Legend Text',
      },
      fontSize: 28,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Center,
      lineHeight: 1.4,
    };
    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.BIG_IMAGE_1,
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        ...(imageElement ? [imageElement] : []),
        legendTextElement,
        logoImageElement,
        ...(decorativeImageElement ? [decorativeImageElement] : []),
      ],
    };
  }
}
