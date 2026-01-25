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
  getDecorativeImageElements,
  getTextHeight,
  getImageDimensions,
  processMarkdownFormatting,
  SLIDE_CONTENT_MIN_Y,
  SLIDE_MARGIN,
  SLIDE_TEXT_Y_SPACING,
  SLIDE_IMAGE_BORDER_RADIUS,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { IDevelopmentBulletSlideFactory } from './slide-factory.interface';

/**
 * Factory for creating development bullet slides
 * Follows Single Responsibility Principle - only creates development bullet slides
 */
export class DevelopmentBulletSlideFactory implements IDevelopmentBulletSlideFactory {
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

    // Center the image in the allocated space
    const baseX = 135;
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
    title: string,
    content_bullet_points: string[],
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
        // Fallback to original square dimensions if image loading fails
        imageElement = {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: image_url,
          x: 135,
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

    const captionElement: SlideText | null =
      imageElement && image_caption
        ? {
            id: v4(),
            type: SlideElementBaseTypes.TEXT,
            subtype: SlideTextElementsVariants.PARAGRAPH,
            text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor}; font-style: italic; font-family: Rubik; letter-spacing: -0.25px;">${processMarkdownFormatting(image_caption)}</span>`,
            x: 135,
            y: imageElement.y + imageElement.height + 20,
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
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 82,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: 773,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      x: image_url ? 1012 : SLIDE_MARGIN,
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

    const bulletInitialY = yPosition + titleHeight + spacing;
    const bulletColor = this.colors.shapeColor;
    const bulletWidth = image_url ? 773 : 1383;

    let bulletListElement: SlideText | null = null;
    if (content_bullet_points && content_bullet_points.length > 0) {
      // Build the ul/li HTML structure
      // The li inherits bullet color from ul, content wrapped in span with text color
      const listItemsHtml = content_bullet_points
        .map(
          (item) =>
            `<li><span style="color: ${this.colors.paragraphColor}; overflow-wrap: break-word;">${processMarkdownFormatting(item)}</span></li>`
        )
        .join('');

      const listHtml = `<ul style="list-style: disc; margin: 0; display: flex; flex-direction: column; gap: 0.625em; color: ${bulletColor};">${listItemsHtml}</ul>`;

      // Calculate the total height of the list
      const listHeight = getTextHeight({
        text: listHtml,
        fontSize: 40,
        fontFamily: 'Quicksand',
        lineHeight: 1.4,
        width: bulletWidth,
      });

      bulletListElement = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: listHtml,
        x: image_url ? 1012 : SLIDE_MARGIN,
        y: bulletInitialY,
        width: bulletWidth,
        height: listHeight,

        options: {
          isVisible: true,
          label: 'Bullet List',
        },
        fontSize: 40,
        fontFamily: 'Quicksand',
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
      slideType: SlideThemeType.TOPICS,
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
        ...(captionElement ? [captionElement] : []),
        titleElement,
        ...(bulletListElement ? [bulletListElement] : []),
        logoImageElement,
        ...decorativeImageElements,
      ],
    };
  }
}
