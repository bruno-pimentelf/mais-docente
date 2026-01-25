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
  SlideShape,
  SlideShapeElementsVariants,
} from '../../types/index';
import { SlideTypeColors } from '../types/slide-theme.types';
import {
  getLogoImageElement,
  getTextHeight,
  getDecorativeImageElement,
  processMarkdownFormatting,
} from '../helpers/slide-utils';
import { ICover2SlideFactory } from './slide-factory.interface';

/**
 * COVER_2: Big blue rectangle on the right with overlapping mint circle and a thin yellow line,
 * large blue title on the left with black subtitle below.
 */
export class Cover2SlideFactory implements ICover2SlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create({
    title,
    subtitle,
    logo_path,
    slideOrder,
  }: {
    title: string;
    subtitle: string;
    logo_path: string;
    slideOrder: number;
  }): Slide {
    // Title block dimensions (left side)
    const titleX = 152;
    const titleWidth = 980;
    const titleFontSize = 120;
    const titleHeight = getTextHeight({
      text: `<b><span style="overflow-wrap: break-word; color:${this.colors.titleColor};">${processMarkdownFormatting(title)}</span></b>`,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: titleWidth,
    });
    const spacing = 24;
    // Vertically center the block (title + subtitle)
    const subtitleFontSize = 28;
    const subtitleWidth = titleWidth;
    const subtitleHeightTemp = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color:${this.colors.paragraphColor};">${processMarkdownFormatting(subtitle)}</span>`,
      fontSize: subtitleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: subtitleWidth,
    });
    const blockHeight = titleHeight + spacing + subtitleHeightTemp;
    const titleY = Math.round((1080 - blockHeight) / 2);

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
      lineHeight: 1.1,
    };

    const subtitleHeight = subtitleHeightTemp;

    const subtitleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color:${this.colors.paragraphColor};">${processMarkdownFormatting(subtitle)}</span>`,
      x: titleX,
      y: titleY + titleHeight + spacing,
      width: subtitleWidth,
      height: subtitleHeight,

      options: { isVisible: true, label: 'Subtitle' },
      fontSize: subtitleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.2,
    };

    // Right-side shapes
    const rectangle: SlideShape = {
      id: v4(),
      fillColor: this.colors.rectangleColor,

      type: SlideElementBaseTypes.SHAPE,
      subtype: SlideShapeElementsVariants.RECTANGLE,
      x: 1350,
      y: 150,
      width: 440,
      height: 700,

      options: { isVisible: true, label: 'Right Rectangle' },
      cornerRadius: 0,
    } as SlideShape;

    const circle: SlideShape = {
      id: v4(),
      fillColor: '#000000',
      type: SlideElementBaseTypes.SHAPE,
      subtype: SlideShapeElementsVariants.CIRCLE,
      x: 1350,
      y: 200,
      width: 340,
      height: 340,

      options: { isVisible: false, label: 'Top Circle' },
      backgroundColor: '#000000',
    } as SlideShape;

    const yellowLine: SlideShape = {
      id: v4(),
      fillColor: this.colors.lineColor,
      type: SlideElementBaseTypes.SHAPE,
      subtype: SlideShapeElementsVariants.RECTANGLE,
      x: 1260,
      y: 620,
      width: 600,
      height: 10,

      options: { isVisible: true, label: 'Accent Line' },
    } as unknown as SlideShape;

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.COVER_2,
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
        subtitleElement,
        rectangle,
        circle,
        yellowLine,
        logoImageElement,
      ],
    };
  }
}
