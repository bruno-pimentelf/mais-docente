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
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ICoverSlideFactory } from './slide-factory.interface';

/**
 * Factory for creating cover slides
 * Follows Single Responsibility Principle - only creates cover slides
 */
export class CoverSlideFactory implements ICoverSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create({
    title,
    subtitle,
    logo_path,
    slideOrder,
    cover_image_url,
  }: {
    title: string;
    subtitle?: string;
    logo_path: string;
    slideOrder: number;
    cover_image_url?: string;
  }): Slide {
    const initialTitleY = 334;
    const spacing = 48;

    // Dynamically shrink title font if it becomes too tall (more than 3 lines ~ 330px)
    let titleFontSize = 120;
    let titleHeight = 0;

    const titleWidth = cover_image_url ? 930 : 1334;

    const measureTitle = (fs: number) =>
      getTextHeight({
        text: `<span style=\"font-weight:bold;color:${this.colors.titleColor};\">${processMarkdownFormatting(title)}</span>`,
        fontSize: fs,
        fontFamily: 'Quicksand',
        lineHeight: 1.1,
        width: titleWidth,
      });

    titleHeight = measureTitle(titleFontSize);

    // Subtitle height depends on subtitle text (may be undefined)
    const subtitleText = subtitle || '';
    const calcSubtitleHeight = () =>
      getTextHeight({
        text: `<span style=\"color:${this.colors.subtitleColor};\">${processMarkdownFormatting(subtitleText)}</span>`,
        fontSize: 38,
        fontFamily: 'Quicksand',
        lineHeight: 1.1,
        width: 930,
      });

    let subtitleHeight = calcSubtitleHeight();

    // Reposition logic: shift the whole block up if it would overflow bottom safe area (948px divider)
    const safeBottom = 900;
    let titleY = initialTitleY;

    const ensureFits = () => {
      const totalBlockBottom = titleY + titleHeight + spacing + subtitleHeight;
      if (totalBlockBottom > safeBottom) {
        const overflow = totalBlockBottom - safeBottom;
        titleY = Math.max(202, titleY - overflow);
      }
    };

    ensureFits();

    // If after moving up as far as allowed it still overflows, shrink title font
    while (
      titleY === 202 &&
      titleHeight + spacing + subtitleHeight > safeBottom - 202 &&
      titleFontSize > 64
    ) {
      titleFontSize -= 8;
      titleHeight = measureTitle(titleFontSize);
      subtitleHeight = calcSubtitleHeight();
      ensureFits();
    }

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<b><span style=\"color:${this.colors.titleColor};\">${processMarkdownFormatting(title)}</span></b>`,
      x: 202,
      y: titleY,
      width: titleWidth,
      height: titleHeight,

      options: {
        isVisible: true,
        label: 'Title',
      },
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.1,
    };

    // subtitleHeight already calculated above
    const subtitleElement: SlideText | null = subtitle
      ? {
          id: v4(),
          type: SlideElementBaseTypes.TEXT,
          subtype: SlideTextElementsVariants.PARAGRAPH,
          text: `<span style="overflow-wrap: break-word; color: ${this.colors.subtitleColor};">${processMarkdownFormatting(subtitle)}</span>`,
          x: 202,
          y: titleY + titleHeight + spacing,
          width: 930,
          height: subtitleHeight,

          options: {
            isVisible: true,
            label: 'Subtitle',
          },
          fontSize: 38,
          fontFamily: 'Quicksand',
          textAlign: TextAlignment.Left,
          lineHeight: 1.1,
        }
      : null;

    const coverImageElement: SlideImage | null = cover_image_url
      ? {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: cover_image_url,
          x: 1273,
          y: 0,
          width: 647,
          height: 1080,

          options: {
            isVisible: true,
            label: 'Cover Image',
          },
        }
      : null;

    const logoImageElement = getLogoImageElement(logo_path);
    // Select decorative image by index: [0] when no cover image, [1] when cover image exists
    const decorativeImages = Array.isArray((this.colors as any).decorativeImage)
      ? (this.colors as any).decorativeImage
      : (this.colors as any).decorativeImage
        ? [(this.colors as any).decorativeImage]
        : [];
    const selectedDecorative = decorativeImages[cover_image_url ? 1 : 0];
    const decorativeImageElement: SlideImage | null = selectedDecorative
      ? {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: selectedDecorative.src,
          x: selectedDecorative.x,
          y: selectedDecorative.y,
          width: selectedDecorative.width,
          height: selectedDecorative.height,
          borderRadius: 0,
          options: {
            isVisible: true,
            label: 'Decorative Image',
          },
        }
      : null;

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.COVER,
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
        ...(subtitleElement ? [subtitleElement] : []),
        ...(coverImageElement ? [coverImageElement] : []),
        logoImageElement,
        ...(decorativeImageElement ? [decorativeImageElement] : []),
      ],
    };
  }
}
