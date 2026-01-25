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
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
  SLIDE_TEXT_Y_SPACING,
  getDecorativeImageElement,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ITextWithTwoImages3SlideFactory } from './slide-factory.interface';

export class TextWithTwoImages3SlideFactory
  implements ITextWithTwoImages3SlideFactory
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
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Layout: Text at top, two images side by side at bottom
    const titleX = SLIDE_MARGIN;
    const titleY = SLIDE_ELEMENT_MIN_Y;
    const titleWidth = slideWidth - 160;
    const titleFontSize = 64;

    const titleHeight = getTextHeight({
      text: `<b><span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(title)}</span></b>`,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: titleWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<b><span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(title)}</span></b>`,
      x: titleX,
      y: titleY,
      width: titleWidth,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.2,
    };

    // Content text below title
    const contentY = titleY + titleHeight + SLIDE_TEXT_Y_SPACING;
    const contentWidth = slideWidth - 160;
    const contentFontSize = 32;

    const contentHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color:${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      fontSize: contentFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: contentWidth,
    });

    const contentElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color:${this.colors.paragraphColor};">${processMarkdownFormatting(content_text)}</span>`,
      x: titleX,
      y: contentY,
      width: contentWidth,
      height: contentHeight,

      options: { isVisible: true, label: 'Content' },
      fontSize: contentFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };

    // Two images side by side at bottom
    const imagesY = contentY + contentHeight + 60;
    const imageWidth = 580;
    const imageHeight = 320;
    const imageSpacing = 40;
    const totalImagesWidth = imageWidth * 2 + imageSpacing;
    const imagesStartX = (slideWidth - totalImagesWidth) / 2;

    const imageElement1: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: image_url_1,
      x: imagesStartX,
      y: imagesY,
      width: imageWidth,
      height: imageHeight,

      options: { isVisible: true, label: 'Image 1' },
    };

    const imageElement2: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: image_url_2,
      x: imagesStartX + imageWidth + imageSpacing,
      y: imagesY,
      width: imageWidth,
      height: imageHeight,

      options: { isVisible: true, label: 'Image 2' },
    };

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TEXT_WITH_TWO_IMAGES_3,
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
        contentElement,
        imageElement1,
        imageElement2,
        logoImageElement,
      ],
    };
  }
}
