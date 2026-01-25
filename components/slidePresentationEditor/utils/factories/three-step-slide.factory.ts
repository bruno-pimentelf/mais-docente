import { v4 } from 'uuid';
import {
  Slide,
  SlideElementBaseTypes,
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
  processMarkdownFormatting,
  SLIDE_ELEMENT_MIN_Y,
  SLIDE_MARGIN,
} from '../helpers/slide-utils';
import { SlideTypeColors } from '../types/slide-theme.types';
import { ISlideFactory } from './slide-factory.interface';

export class ThreeStepSlideFactory implements ISlideFactory {
  constructor(private colors: SlideTypeColors) {}

  /**
   * Creates a number element (circle background + number text)
   */
  private createNumberElement(
    stepNumber: number,
    circleX: number,
    circleY: number,
    circleRadius: number
  ): { circle: SlideShape; numberText: SlideText } {
    const circleDiameter = circleRadius * 2;
    const numberFontSize = 48;
    const numberTextWidth = circleRadius / 2;
    const numberTextHeight = getTextHeight({
      text: String(stepNumber),
      fontSize: numberFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1,
      width: numberTextWidth,
    });

    const circle: SlideShape = {
      id: v4(),
      type: SlideElementBaseTypes.SHAPE,
      subtype: SlideShapeElementsVariants.CIRCLE,
      x: circleX,
      y: circleY,
      width: circleDiameter,
      height: circleDiameter,
      fillColor: this.colors.circleColor,
      options: { isVisible: true, label: `Step ${stepNumber} Circle` },
    };

    const numberText: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="color: ${this.colors.backgroundColor}; font-weight: bold;">${stepNumber}</span>`,
      x: circleX - numberTextWidth / 2,
      y: circleY - numberTextHeight / 2,
      width: numberTextWidth,
      height: numberTextHeight,
      options: { isVisible: true, label: `Step ${stepNumber} Number` },
      fontSize: numberFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1,
    };

    return { circle, numberText };
  }

  /**
   * Creates a step subtitle element
   */
  private createStepSubtitleElement(
    title: string,
    x: number,
    y: number,
    width: number,
    stepNumber: number
  ): SlideText {
    const titleFontSize = 48;
    const formattedTitle = `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`;
    const titleHeight = getTextHeight({
      text: formattedTitle,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width,
    });

    return {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: formattedTitle,
      x,
      y,
      width,
      height: titleHeight,
      options: { isVisible: true, label: `Step ${stepNumber} Subtitle` },
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.2,
    };
  }

  /**
   * Creates a step text element
   */
  private createStepTextElement(
    text: string,
    x: number,
    y: number,
    width: number,
    stepNumber: number
  ): SlideText {
    const stepTextFontSize = 38;
    const formattedText = `<span style="overflow-wrap: break-word; color: ${this.colors.subtitleColor};">${processMarkdownFormatting(text)}</span>`;
    const textHeight = getTextHeight({
      text: formattedText,
      fontSize: stepTextFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width,
    });

    return {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: formattedText,
      x,
      y,
      width,
      height: textHeight,
      options: { isVisible: true, label: `Step ${stepNumber} Text` },
      fontSize: stepTextFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };
  }

  /**
   * Creates a complete step column (number element + step title + step text)
   */
  private createStepColumn(
    stepNumber: number,
    stepTitle: string,
    stepText: string,
    columnX: number,
    titleY: number,
    textY: number,
    columnWidth: number,
    circleX: number,
    circleY: number,
    circleRadius: number
  ): {
    circle: SlideShape;
    numberText: SlideText;
    stepSubtitleElement: SlideText;
    stepTextElement: SlideText;
  } {
    const { circle, numberText } = this.createNumberElement(
      stepNumber,
      circleX,
      circleY,
      circleRadius
    );

    const stepSubtitleElement = this.createStepSubtitleElement(
      stepTitle,
      columnX,
      titleY,
      columnWidth,
      stepNumber
    );

    const stepTextElement = this.createStepTextElement(
      stepText,
      columnX,
      textY,
      columnWidth,
      stepNumber
    );

    return { circle, numberText, stepSubtitleElement, stepTextElement };
  }

  create(
    title: string,
    step_1_title: string,
    step_1_text: string,
    step_2_title: string,
    step_2_text: string,
    step_3_title: string,
    step_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    const slideWidth = 1920;
    const slideHeight = 1080;

    // Title configuration - centered horizontally
    const titleFontSize = 82;
    const titleText = `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title)}</span>`;
    const titleWidth = slideWidth - SLIDE_MARGIN * 2;
    const titleHeight = getTextHeight({
      text: titleText,
      fontSize: titleFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.1,
      width: titleWidth,
    });

    const titleX = SLIDE_MARGIN;
    const titleY = SLIDE_ELEMENT_MIN_Y;

    const titleElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: titleText,
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

    // Timeline configuration
    const timelineStartX = SLIDE_MARGIN;
    const timelineEndX = slideWidth - SLIDE_MARGIN;
    const timelineY = titleY + titleHeight + 100; // Position below title
    const circleRadius = 50;
    const circleY = timelineY;

    // Calculate column positions with 40px gaps
    const availableWidth = timelineEndX - timelineStartX;
    const columnGap = 40;
    const totalGaps = columnGap * 2; // Two gaps between three columns
    const columnWidth = (availableWidth - totalGaps) / 3;

    // Column start positions
    const column1X = timelineStartX;
    const column2X = timelineStartX + columnWidth + columnGap;
    const column3X = timelineStartX + columnWidth * 2 + totalGaps;

    // Calculate circle positions (circleX is the center position)
    const circle1X = column1X + circleRadius;
    const circle2X = column2X + circleRadius;
    const circle3X = column3X + circleRadius;

    // Create lines connecting circles
    const lineY = circleY;
    const line1StartX = circle1X + circleRadius;
    const line1EndX = circle2X - circleRadius;

    const line1: SlideShape = {
      id: v4(),
      type: SlideElementBaseTypes.SHAPE,
      subtype: SlideShapeElementsVariants.RECTANGLE,
      x: line1StartX,
      y: lineY,
      width: line1EndX - line1StartX,
      height: 4,
      fillColor: this.colors.lineColor,
      options: { isVisible: true, label: 'Line 1-2' },
    };

    const line2StartX = circle2X + circleRadius;
    const line2EndX = circle3X - circleRadius;
    const line2: SlideShape = {
      id: v4(),
      type: SlideElementBaseTypes.SHAPE,
      subtype: SlideShapeElementsVariants.RECTANGLE,
      x: line2StartX,
      y: lineY,
      width: line2EndX - line2StartX,
      height: 4,
      fillColor: this.colors.lineColor,
      options: { isVisible: true, label: 'Line 2-3' },
    };

    // Create three columns with 40px gaps
    const titleStartY = circleY + circleRadius + 40; // Position below circles
    const titleSpacing = 20; // Space between title and text

    // Create step columns (text Y will be adjusted after titles are created)
    const step1 = this.createStepColumn(
      1,
      step_1_title,
      step_1_text,
      column1X,
      titleStartY,
      titleStartY, // Temporary, will be adjusted
      columnWidth,
      circle1X,
      circleY,
      circleRadius
    );

    const step2 = this.createStepColumn(
      2,
      step_2_title,
      step_2_text,
      column2X,
      titleStartY,
      titleStartY, // Temporary, will be adjusted
      columnWidth,
      circle2X,
      circleY,
      circleRadius
    );

    const step3 = this.createStepColumn(
      3,
      step_3_title,
      step_3_text,
      column3X,
      titleStartY,
      titleStartY, // Temporary, will be adjusted
      columnWidth,
      circle3X,
      circleY,
      circleRadius
    );

    // Adjust text positions based on actual title heights
    const maxTitleHeight = Math.max(
      step1.stepSubtitleElement.height,
      step2.stepSubtitleElement.height,
      step3.stepSubtitleElement.height
    );
    const adjustedTextY = titleStartY + maxTitleHeight + titleSpacing;

    step1.stepTextElement.y = adjustedTextY;
    step2.stepTextElement.y = adjustedTextY;
    step3.stepTextElement.y = adjustedTextY;

    const logoImageElement = getLogoImageElement(logo_path);

    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.THREE_STEP,
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
        step1.circle,
        step2.circle,
        step3.circle,
        step1.numberText,
        step2.numberText,
        step3.numberText,
        line1,
        line2,
        step1.stepSubtitleElement,
        step2.stepSubtitleElement,
        step3.stepSubtitleElement,
        step1.stepTextElement,
        step2.stepTextElement,
        step3.stepTextElement,
        logoImageElement,
      ],
    };
  }
}
