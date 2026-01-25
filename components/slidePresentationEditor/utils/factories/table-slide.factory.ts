import { v4 } from 'uuid';
import {
  Slide,
  SlideElementBaseTypes,
  SlideLayoutVariants,
  SlideTable,
  SlideTableElementsVariants,
  SlideThemeType,
  SlideVariants,
  TableCell,
  TextAlignment,
  VerticalAlignment,
} from '../../types';
import {
  getLogoImageElement,
  getDecorativeImageElements,
} from '../helpers/slide-utils';
import { SlideTableColors, SlideTypeColors } from '../types/slide-theme.types';
import { ITableSlideFactory } from './slide-factory.interface';

export class TableSlideFactory implements ITableSlideFactory {
  constructor(
    private colors: SlideTypeColors,
    private tableColors: SlideTableColors
  ) {}

  create(params: {
    logo_path: string;
    slideOrder: number;
    data?: string[][];
    title?: string;
  }): Slide {
    const { logo_path, slideOrder, data: rawData, title } = params;

    // Defaults
    const rows = Math.max(rawData?.length || 3, 2);
    const cols = Math.max(rawData?.[0]?.length || 3, 2);

    // Build TableCell[][] using theme colors
    const data: TableCell[][] = Array.from({ length: rows }).map((_, rIdx) =>
      Array.from({ length: cols }).map((_, cIdx) => {
        const isHeader = rIdx === 0;
        const value =
          rawData?.[rIdx]?.[cIdx] ??
          (isHeader && cIdx === 0 && title ? title : '');
        return {
          value,
          fontSize: isHeader ? 40 : 30,
          fontFamily: 'Quicksand',
          fontWeight: isHeader ? 'bold' : 'normal',
          textAlign: isHeader ? TextAlignment.Center : TextAlignment.Left,
          verticalAlign: VerticalAlignment.Center,
          color: isHeader
            ? this.tableColors.headerTextColor
            : this.tableColors.textColor,
          backgroundColor: isHeader
            ? this.tableColors.headerBackgroundColor
            : this.tableColors.cellBackgroundColor,
        } as TableCell;
      })
    );

    // Slide dimensions
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Table dimensions and positioning (larger footprint)
    const tableWidth = slideWidth * 0.85;
    const tableHeight = slideHeight * 0.7;
    const defaultColumnWidth = tableWidth / cols;
    const defaultRowHeight = tableHeight / rows;
    const columnWidths = Array(cols).fill(defaultColumnWidth);
    const rowHeights = Array(rows).fill(defaultRowHeight);
    const x = (slideWidth - tableWidth) / 2;
    const y = (slideHeight - tableHeight) / 2;

    const tableElement: SlideTable = {
      id: v4(),
      type: SlideElementBaseTypes.TABLE,
      subtype: SlideTableElementsVariants.TABLE,
      content: {
        rows,
        cols,
        data,
        rowHeights,
        columnWidths,
      },

      options: {
        isVisible: true,
        label: 'Table',
      },
      width: tableWidth,
      height: tableHeight,
      x,
      y,
      borderColor: this.tableColors.headerTextColor,
      defaultRowHeight,
      defaultColumnWidth,
      headerStyle: {
        fontWeight: 'bold',
        textAlign: TextAlignment.Center,
        verticalAlign: VerticalAlignment.Center,
        fontSize: 40,
        fontFamily: 'Quicksand',
        color: this.tableColors.headerTextColor,
        backgroundColor: this.tableColors.headerBackgroundColor,
      },
      defaultCellStyle: {
        fontSize: 40,
        fontFamily: 'Quicksand',
        color: this.tableColors.textColor,
        textAlign: TextAlignment.Left,
        verticalAlign: VerticalAlignment.Center,
      },
    };

    const logoImageElement = getLogoImageElement(logo_path);
    const decorativeImageElements = getDecorativeImageElements(this.colors);
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.TABLE,
      themeSettings: {
        baseWidth: slideWidth,
        baseHeight: slideHeight,
        width: slideWidth,
        height: slideHeight,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: [tableElement, logoImageElement, ...decorativeImageElements],
    };
  }
}
