import {
  Slide,
  SlideElementBaseTypes,
  SlideImageElementsVariants,
  SlideLayoutVariants,
  SlideTextElementsVariants,
  SlideThemeType,
  SlideVariants,
  TextAlignment,
} from '../../types/index';
import { SlideTypeColors } from '../types/slide-theme.types';
import { processMarkdownFormatting } from '../helpers/slide-utils';
import { IExerciseSlideFactory } from './slide-factory.interface';
import { v4 } from 'uuid';
import { getDecorativeImageElement } from '../helpers/slide-utils';

/**
 * Factory for creating exercise slides
 * Follows Single Responsibility Principle - only creates exercise slides
 */
export class ExerciseSlideFactory implements IExerciseSlideFactory {
  constructor(private colors: SlideTypeColors) {}

  create(
    exercise_list: string[],
    exercises_title: string,
    logo_path: string,
    slideOrder: number
  ): Slide {
    // Create elements array
    const elements: any[] = [];

    // Add title element
    elements.push({
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${this.colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(exercises_title)}</span>`,
      x: 92, // Adjusted for smaller dimensions
      y: 38, // Adjusted for smaller dimensions
      width: 850, // Adjusted for smaller dimensions
      height: 80, // Increased height for multi-line titles (was 36)

      options: {
        isVisible: true,
        label: 'Exercises Title',
      },
      fontSize: 36,
      fontFamily: 'Arial',
      textAlign: TextAlignment.Left,
    });

    // Add exercise questions - distribute vertically
    const numQuestions = exercise_list.length;
    exercise_list.forEach((exercise, index) => {
      const yPosition = 80 + index * (350 / numQuestions); // Distribute vertically, adjusted for smaller dimensions

      elements.push({
        id: v4(),
        type: SlideElementBaseTypes.TEXT,
        subtype: SlideTextElementsVariants.PARAGRAPH,
        text: processMarkdownFormatting(exercise),
        x: 92, // Adjusted for smaller dimensions
        y: yPosition, // Positioned based on index
        width: 756, // Adjusted for smaller dimensions
        height: 150, // Adjusted for smaller dimensions

        options: {
          isVisible: true,
          label: `Exercise ${index + 1}`,
        },
        fontSize: 25,
        fontColor: this.colors.paragraphColor,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        textAlign: TextAlignment.Left,
      });
    });

    //TODO: add logo_path to the slide

    // Add logo image
    elements.push({
      id: v4(),
      type: SlideElementBaseTypes.IMAGE,
      subtype: SlideImageElementsVariants.IMAGE,
      src: logo_path,
      x: 838, // Adjusted for smaller dimensions
      y: 490, // Adjusted for smaller dimensions
      width: 28, // Adjusted for smaller dimensions
      height: 28, // Adjusted for smaller dimensions

      options: {
        isVisible: true,
        label: 'Logo',
      },
    });

    // Add decorative image if available
    const decorativeImageElement = getDecorativeImageElement(this.colors);
    if (decorativeImageElement) {
      elements.push(decorativeImageElement);
    }

    // Create and push the slide
    return {
      id: v4(),
      order: slideOrder,
      variant: SlideVariants.CUSTOM,
      layout: SlideLayoutVariants.FULL_CONTENT,
      slideType: SlideThemeType.EXERCISE,
      themeSettings: {
        baseWidth: 954,
        baseHeight: 539,
        width: 954,
        height: 539,
        backgroundColor: this.colors.backgroundColor,
        backgroundImage: this.colors.backgroundImage,
      },
      elements: elements,
    };
  }
}
