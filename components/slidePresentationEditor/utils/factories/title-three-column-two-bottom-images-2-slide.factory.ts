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
import { ITitleThreeColumnTwoBottomImages2SlideFactory } from './slide-factory.interface';

export class TitleThreeColumnTwoBottomImages2SlideFactory
  implements ITitleThreeColumnTwoBottomImages2SlideFactory
{
  constructor(private colors: SlideTypeColors) {}

  create(
    title: string,
    column_1_title: string,
    column_1_text: string,
    column_2_title: string,
    column_2_text: string,
    column_3_title: string,
    column_3_text: string,
    image_1: string,
    image_2: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Title at the top
    const titleX = 135;
    const titleWidth = slideWidth - titleX * 2;
    const titleY = 135;
    const titleSpacing = 60;

    const titleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      fontSize: 82,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: titleWidth,
    });

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`,
      x: titleX,
      y: titleY,
      width: titleWidth,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: 82,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Center,
      lineHeight: 1.1,
    };

    // Three text columns below title
    const columnsStartY = titleY + titleHeight + titleSpacing;
    const columnsAreaWidth = slideWidth - titleX * 2;
    const columnWidth = Math.floor((columnsAreaWidth - 40) / 3); // 40px total gap between columns
    const columnGap = 20;
    const textSpacing = 20;

    // Calculate column heights first to determine image height dynamically
    const calculateColumnHeight = (
      columnTitle: string,
      columnText: string
    ): number => {
      const columnTitleHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(columnTitle)}</span>`,
        fontSize: 48,
        fontFamily: 'Quicksand',
        lineHeight: 1.2,
        width: columnWidth,
      });

      const columnTextHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(columnText)}</span>`,
        fontSize: 32,
        fontFamily: 'Quicksand',
        lineHeight: 1.4,
        width: columnWidth,
      });

      return columnTitleHeight + textSpacing + columnTextHeight;
    };

    // Find the maximum column height
    const column1Height = calculateColumnHeight(column_1_title, column_1_text);
    const column2Height = calculateColumnHeight(column_2_title, column_2_text);
    const column3Height = calculateColumnHeight(column_3_title, column_3_text);
    const maxColumnHeight = Math.max(
      column1Height,
      column2Height,
      column3Height
    );

    // Calculate available space for images
    const gap = 20; // Small gap between text and images
    const totalContentHeight = columnsStartY + maxColumnHeight;
    const availableSpaceForImages = slideHeight - totalContentHeight - gap;
    const maxImageHeight = 450;

    // Image height is the minimum of available space and max height, but never less than 0
    const imageHeight = Math.max(
      0,
      Math.min(availableSpaceForImages, maxImageHeight)
    );
    const imageWidth = Math.floor(slideWidth / 2); // Each image takes half the slide width
    const imagesStartY = slideHeight - imageHeight; // Align to bottom

    const createColumn = (
      columnTitle: string,
      columnText: string,
      columnIndex: number
    ): SlideText[] => {
      const columnX = titleX + columnIndex * (columnWidth + columnGap);
      const columnY = columnsStartY;

      // Column title
      const columnTitleHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(columnTitle)}</span>`,
        fontSize: 48,
        fontFamily: 'Quicksand',
        lineHeight: 1.2,
        width: columnWidth,
      });

      const columnTitleElement: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(columnTitle)}</span>`,
        x: columnX,
        y: columnY,
        width: columnWidth,
        height: columnTitleHeight,

        options: { isVisible: true, label: `Column ${columnIndex + 1} Title` },
        fontSize: 48,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: 1.2,
      };

      // Column text
      const columnTextHeight = getTextHeight({
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(columnText)}</span>`,
        fontSize: 32,
        fontFamily: 'Quicksand',
        lineHeight: 1.4,
        width: columnWidth,
      });

      const columnTextElement: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: `<span style="overflow-wrap: break-word; color: ${this.colors.paragraphColor};">${processMarkdownFormatting(columnText)}</span>`,
        x: columnX,
        y: columnY + columnTitleHeight + textSpacing,
        width: columnWidth,
        height: columnTextHeight,

        options: { isVisible: true, label: `Column ${columnIndex + 1} Text` },
        fontSize: 32,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: 1.4,
      };

      return [columnTitleElement, columnTextElement];
    };

    const column1Elements = createColumn(column_1_title, column_1_text, 0);
    const column2Elements = createColumn(column_2_title, column_2_text, 1);
    const column3Elements = createColumn(column_3_title, column_3_text, 2);

    const image1: SlideImage | null = image_1
      ? {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: image_1,
          x: 0, // No left margin
          y: imagesStartY,
          width: imageWidth,
          height: imageHeight,
          borderRadius: 0,

          options: { isVisible: true, label: 'Image 1' },
        }
      : null;

    const image2: SlideImage | null = image_2
      ? {
          id: v4(),
          type: SlideElementBaseTypes.IMAGE,
          subtype: SlideImageElementsVariants.IMAGE,
          src: image_2,
          x: imageWidth, // Second image starts where first ends
          y: imagesStartY,
          width: imageWidth,
          height: imageHeight,
          borderRadius: 0,

          options: { isVisible: true, label: 'Image 2' },
        }
      : null;

    const logoImageElement = getLogoImageElement(logo_path);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TITLE_THREE_COLUMN_TWO_BOTTOM_IMAGES_2,
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
        ...column1Elements,
        ...column2Elements,
        ...column3Elements,
        ...(image1 ? [image1] : []),
        ...(image2 ? [image2] : []),
        logoImageElement,
      ],
    };
  }
}
