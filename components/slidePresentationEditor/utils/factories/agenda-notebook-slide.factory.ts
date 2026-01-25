import { v4 } from 'uuid';
import {
  Slide,
  SlideElementBaseTypes,
  SlideImage,
  SlideImageElementsVariants,
  SlideLayoutVariants,
  SlideShape,
  SlideShapeElementsVariants,
  SlideText,
  SlideTextElementsVariants,
  SlideThemeType,
  SlideVariants,
  TextAlignment,
} from '../../types/index';
import {
  getLogoImageElement,
  getTextHeight,
  getDecorativeImageElement,
  processMarkdownFormatting,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { IAgendaNotebookSlideFactory } from './slide-factory.interface';

/**
 * AGENDA_NOTEBOOK: School notebook style agenda with grid background,
 * white rounded page with blue border, black rings, centered blue title,
 * and bullet list with yellow bullets.
 */
export class AgendaNotebookSlideFactory implements IAgendaNotebookSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    title: string,
    agenda_items: string[],
    logo_path: string,
    slideOrder: number
  ): Slide {
    // Grid background covering entire canvas
    const gridBackground: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.BACKGROUND_IMAGE,
      src: '/images/backgrounds/BG_COVER_CHESS.svg',
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,

      options: { isVisible: true, label: 'Grid Background' },
    };

    // Notebook page background (white rounded rectangle with blue border)
    const notebookPage: SlideImage = {
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.BACKGROUND_IMAGE,
      src: '/images/backgrounds/NOTEBOOK.svg',
      x: 320,
      y: 80,
      width: 1280,
      height: 1000,

      options: { isVisible: true, label: 'Notebook Page' },
    };

    // Title - centered blue text
    const titleWidth = 1000;
    const titleX = Math.round((1920 - titleWidth) / 2);
    const titleFontSize = 84;
    const titleHeight = getTextHeight({
      text: `<b><span style="overflow-wrap: break-word; color:'#333333';">${processMarkdownFormatting(title)}</span></b>`,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: titleWidth,
    });
    const titleY = 180;

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<b><span style="overflow-wrap: break-word; color:'#333333';">${processMarkdownFormatting(title)}</span></b>`,
      x: titleX,
      y: titleY,
      width: titleWidth,
      height: titleHeight,

      options: { isVisible: true, label: 'Title' },
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Center,
      lineHeight: 1.1,
    };

    // Agenda items configuration
    const itemFontSize = 36;
    const itemColor = '#333333';
    const bulletColor = '#FFD700';
    const itemLineHeight = 1.4;
    const itemSpacing = 60;
    const bulletSize = 12;
    const bulletTextGap = 30;

    // Starting position for agenda items (centered in the notebook page)
    const itemsStartY = titleY + titleHeight + 80;
    const itemsX = 500; // Aligned within notebook page with margin - moved more to the right
    const itemsWidth = 1000; // Width within notebook page with margins

    // Create agenda items with bullets
    const agendaElements: (SlideShape | SlideText)[] = [];

    agenda_items.forEach((item, index) => {
      const itemY =
        itemsStartY + index * (itemFontSize * itemLineHeight + itemSpacing);

      // Bullet point (yellow circle)
      const bullet: SlideShape = {
        id: v4(),
        type: SlideElementBaseTypes.SHAPE,
        subtype: SlideShapeElementsVariants.CIRCLE,
        x: itemsX,
        y: itemY + (itemFontSize * itemLineHeight - bulletSize) / 2, // Center bullet with text
        width: bulletSize,
        height: bulletSize,
        fillColor: bulletColor,

        options: { isVisible: true, label: `Bullet ${index + 1}` },
      };

      // Agenda item text
      const itemText = `<span style="overflow-wrap: break-word; color: ${itemColor};">${processMarkdownFormatting(item)}</span>`;
      const itemTextWidth = itemsWidth - bulletTextGap - 40;

      const itemTextHeight = getTextHeight({
        text: itemText,
        fontSize: itemFontSize,
        fontFamily: 'Quicksand',
        lineHeight: itemLineHeight,
        width: itemTextWidth,
      });

      const agendaItem: SlideText = {
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: itemText,
        x: itemsX + bulletTextGap,
        y: itemY,
        width: itemTextWidth,
        height: itemTextHeight,

        options: { isVisible: true, label: `Agenda Item ${index + 1}` },
        fontSize: itemFontSize,
        fontFamily: 'Quicksand',
        textAlign: TextAlignment.Left,
        lineHeight: itemLineHeight,
      };

      agendaElements.push(bullet, agendaItem);
    });

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElement = getDecorativeImageElement(this.colors);
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.AGENDA_NOTEBOOK,
      themeSettings: {
        baseWidth: 1920,
        baseHeight: 1080,
        width: 1920,
        height: 1080,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [
        gridBackground,
        notebookPage,
        titleElement,
        ...agendaElements,
        logoImageElement,
      ],
    };
  }
}
