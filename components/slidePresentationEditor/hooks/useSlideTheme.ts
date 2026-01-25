import { useMemo } from 'react';
import { SlideThemeType } from '../types';
import type {
  SlideTheme,
  SlideTypeColors,
} from '../utils/types/slide-theme.types';
import {
  detectCurrentTheme,
  useSlidePresentationEditorStore,
} from '@/zustand/useSlidePresentationEditorStore';
import { useShallow } from 'zustand/react/shallow';

function mapSlideTypeToVariant(
  theme: SlideTheme,
  slideType?: SlideThemeType
): SlideTypeColors {
  switch (slideType) {
    case SlideThemeType.COVER:
    case SlideThemeType.COVER_1:
    case SlideThemeType.COVER_2:
    case SlideThemeType.COVER_LARA_READING:
    case SlideThemeType.COVER_ARTISTIC:
    case SlideThemeType.COVER_NOTEBOOK:
    case SlideThemeType.COVER_LARA:
      return theme.cover;
    case SlideThemeType.AGENDA_AND_CONCLUSION:
      return theme.summary;
    case SlideThemeType.TOPICS:
      return theme.developmentBullet;
    case SlideThemeType.PARAGRAPH_1:
    case SlideThemeType.BIG_NUMBER:
      return theme.developmentText;
    case SlideThemeType.EXERCISE:
      return theme.exercise;
    case SlideThemeType.IMAGE_AND_TEXT_1:
    case SlideThemeType.IMAGE_AND_TEXT_2:
      return theme.mainImage;
    case SlideThemeType.TWO_PARAGRAPHS:
      return theme.developmentText;
    case SlideThemeType.CONCLUSION:
      return theme.conclusion;
    case SlideThemeType.CARDS_1:
    case SlideThemeType.CARDS_2:
    case SlideThemeType.CARDS_3_2:
    case SlideThemeType.TITLE_THREE_CARD_THREE_TOP_IMAGES_1:
    case SlideThemeType.TITLE_TWO_CARD_TWO_TOP_IMAGES_1:
    case SlideThemeType.THREE_STEP:
    case SlideThemeType.FOUR_STEP:
      return theme.cards;
    case SlideThemeType.CUSTOM:
    default:
      return theme.developmentText;
  }
}

export function useSlideTheme(slideId?: string) {
  const presentation = useSlidePresentationEditorStore(
    useShallow((state) => state)
  );
  const currentSlide = useSlidePresentationEditorStore(
    useShallow(
      (state) => state.slides.find((s) => s.id === slideId) || undefined
    )
  );

  const theme: SlideTheme = useMemo(() => {
    if (presentation.currentTheme) return presentation.currentTheme as SlideTheme;
    return detectCurrentTheme(presentation);
  }, [presentation]);

  const slideType = currentSlide?.slideType as SlideThemeType | undefined;

  const variantColors = useMemo<SlideTypeColors>(() => {
    return mapSlideTypeToVariant(theme, slideType);
  }, [theme, slideType]);

  const quickColors = useMemo(() => {
    const themeColors = new Set<string>();
    if (theme) {
      const variants = [
        theme.cover,
        theme.summary,
        theme.developmentBullet,
        theme.developmentText,
        theme.exercise,
        theme.mainImage,
        theme.bigImage,
        theme.conclusion,
        theme.cards,
      ];
      variants.forEach((v) => {
        themeColors.add(v.backgroundColor);
        themeColors.add(v.titleColor);
        themeColors.add(v.subtitleColor);
        themeColors.add(v.paragraphColor);
        themeColors.add(v.shapeColor);
        themeColors.add(v.accentColor);
        if (v.rectangleColor) themeColors.add(v.rectangleColor);
        if (v.circleColor) themeColors.add(v.circleColor);
        if (v.lineColor) themeColors.add(v.lineColor);
      });
    }
    const unique = Array.from(themeColors);
    return { shape: unique, text: unique, background: unique };
  }, [theme]);

  return { theme, slideType, variantColors, quickColors };
}

export { mapSlideTypeToVariant };
