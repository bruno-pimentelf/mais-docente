import { v4 } from 'uuid';
import {
  SlideElementBaseTypes,
  SlideImage,
  SlideImageElementsVariants,
  SlideShape,
  SlideShapeElementsVariants,
  SlideText,
  SlideTextElementsVariants,
  SlideThemeType,
  TextAlignment,
} from '../../types/index';
import { SlideTypeColors } from '../types/slide-theme.types';

/**
 * Prefix marker used to identify internal slide elements in clipboard text/plain data
 */
export const INTERNAL_ELEMENT_PREFIX = 'TEACHY_INTERNAL_ELEMENT:';

/**
 * Slide base width
 */
export const SLIDE_WIDTH = 1920;

/**
 * Slide base height
 */
export const SLIDE_HEIGHT = 1080;

/**
 * Default slide margin where there shouldn't be content
 */
export const SLIDE_MARGIN = 134;

/**
 * Minimum y-value for a slide element
 */
export const SLIDE_ELEMENT_MIN_Y = SLIDE_MARGIN;

/**
 * Maximum y-value for a slide element
 */
export const SLIDE_ELEMENT_MAX_Y = 1080 - SLIDE_MARGIN;

/**
 * Minimum y-value for "real" slide content, like text, images, etc.
 */
export const SLIDE_CONTENT_MIN_Y = SLIDE_ELEMENT_MIN_Y + 44;

/**
 * Maximum y-value for "real" slide content, like text, images, etc.
 */
export const SLIDE_CONTENT_MAX_Y = SLIDE_ELEMENT_MAX_Y - 44;

export const SLIDE_TEXT_Y_SPACING = 32;

/**
 * Gap between images in a row
 */
export const SLIDE_IMAGES_ROW_GAP = 36;

/**
 * Default border radius for images that don't touch slide borders
 */
export const SLIDE_IMAGE_BORDER_RADIUS = 8;

/**
 * Slide image ratio clusters
 */
export const SLIDE_IMAGE_RATIOS = {
  _0_74: 0.74,
  _1_01: 1.01,
  _1_44: 1.44,
  _1_79: 1.79,
};

export function getColoredStrokeSvg(svg: string, color: string): string {
  return svg.replace(/stroke=".*?"/g, `stroke="${color}"`);
}

export function getColoredFillSvg(svg: string, color: string): string {
  // Replace every fill="" except those set to 'none'
  return svg.replace(/fill="(?!none")[^"]*"/g, `fill="${color}"`);
}

function safeNumber(value: number | undefined): number {
  return value ?? 0;
}

/**
 * Loads an image and returns its natural dimensions
 */
export function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
}

/**
 * Calculates the height of text based on its properties
 */
export const getTextHeight = ({
  text,
  fontSize,
  fontFamily,
  lineHeight,
  width,
}: {
  text: string;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  width: number;
}): number => {
  const fakeDomElement = document.createElement('div');
  fakeDomElement.innerHTML = text;
  fakeDomElement.style.fontSize = `${fontSize}px`;
  fakeDomElement.style.fontFamily = fontFamily;
  fakeDomElement.style.lineHeight = `${lineHeight}`;
  fakeDomElement.style.position = 'absolute';
  fakeDomElement.style.top = '-9999px';
  fakeDomElement.style.left = '-9999px';
  fakeDomElement.style.textAlign = 'left';
  fakeDomElement.style.display = 'inline-block';
  fakeDomElement.style.width = `${width}px`;
  document.body.appendChild(fakeDomElement);
  const height = fakeDomElement.getBoundingClientRect().height;
  fakeDomElement.remove();

  return height;
};

/**
 * Creates a logo image element for slides
 */
export const getLogoImageElement = (logo_path: string): SlideImage => ({
  id: v4(),
  type: SlideElementBaseTypes.IMAGE,
  subtype: SlideImageElementsVariants.IMAGE,
  src: logo_path,
  x: 1759,
  y: 930,
  width: 80,
  height: 80,
  options: {
    isVisible: true,
    label: 'Logo',
  },
});

/**
 * Slide template categories for the slide type selector
 */
export const slideTemplateCategories: Record<
  string,
  (keyof typeof SlideThemeType)[]
> = {
  illustratedExplanation: [
    'IMAGE_AND_TEXT_1',
    'TITLE_ONE_PLAIN_TWO_RIGHT_IMAGES_1',
    'TEXT_AND_IMAGE_1',
    'IMAGE_AND_TEXT_2',
    'TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_1',
    'NO_TITLE_ONE_PLAIN_TWO_TOP_IMAGES_1',
    'TITLE_THREE_CARD_THREE_TOP_IMAGES_1',
    'TITLE_TWO_CARD_TWO_TOP_IMAGES_1',
    'TITLE_THREE_COLUMN_TWO_BOTTOM_IMAGES_1',
    'TITLE_THREE_ROWS_ONE_LEFT_IMAGE_1',
    'TITLE_ONE_PLAIN_THREE_BOTTOM_IMAGES_1',
  ],
  content: [
    'TWO_PARAGRAPHS',
    // 'THREE_STEP',
    // 'FOUR_STEP',
    'PARAGRAPH_1',
    'PEOPLE_1',
    'TITLE_THREE_COLUMN_THREE_TOP_IMAGES_1',
    'CARDS_1',
    'CARDS_2',
    'CARDS_3_2',
    'TOPICS',
    'TITLE_TEXT_DIAGONAL',
    'AGENDA_TEXT',
    'AGENDA_CARDS',
    'AGENDA_NOTEBOOK',
    'CONCLUSION',
    // 'QUOTE',
    'TABLE',
    // 'BIG_NUMBER',
  ],
  images: ['BIG_IMAGE_1'],
  covers: [
    'COVER_1',
    'COVER_2',
    'COVER_LARA_READING',
    'COVER_ARTISTIC',
    'COVER_NOTEBOOK',
    'COVER_LARA',
    'COVER',
  ],
};

/**
 * Creates a decorative image element for slides based on theme decorative images
 * Returns a single decorative image or null if none available
 */
export const getDecorativeImageElement = (
  slideColors: SlideTypeColors
): SlideImage | null => {
  const decorativeImages = Array.isArray((slideColors as any).decorativeImage)
    ? (slideColors as any).decorativeImage
    : (slideColors as any).decorativeImage
      ? [(slideColors as any).decorativeImage]
      : [];

  if (decorativeImages.length === 0) return null;

  const selectedDecorative = decorativeImages[0];
  return {
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
  };
};

/**
 * Creates decorative image elements for slides based on theme decorative images
 * Returns an array of all decorative images available
 */
export const getDecorativeImageElements = (
  slideColors: SlideTypeColors
): SlideImage[] => {
  const decorativeImages = Array.isArray((slideColors as any).decorativeImage)
    ? (slideColors as any).decorativeImage
    : (slideColors as any).decorativeImage
      ? [(slideColors as any).decorativeImage]
      : [];

  return decorativeImages.map((decorative: any) => ({
    id: v4(),
    type: SlideElementBaseTypes.IMAGE,
    subtype: SlideImageElementsVariants.IMAGE,
    src: decorative.src,
    x: decorative.x,
    y: decorative.y,
    width: decorative.width,
    height: decorative.height,
    borderRadius: 0,
    options: {
      isVisible: true,
      label: 'Decorative Image',
    },
  }));
};

/**
 * Checks if a slide type is a cover slide
 */
export const isCoverSlideType = (
  slideType: keyof typeof SlideThemeType | null | undefined
): boolean => {
  if (!slideType) return false;

  return slideTemplateCategories.covers.includes(slideType);
};

/**
 * Processes markdown-style formatting (asterisks) in text and returns HTML string
 * - *text* becomes italic (<em>)
 * - **text** becomes bold (<strong>)
 * - ***text*** becomes bold and italic (<strong><em>)
 */
export const processMarkdownFormatting = (text: string): string => {
  if (!text) return text;

  // Process bold+italic first (***text***)
  let processed = text.replace(
    /\*\*\*(.+?)\*\*\*/g,
    '<strong><em>$1</em></strong>'
  );

  // Process bold (**text**)
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Process italic (*text*)
  processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');

  return processed;
};

export function createCardElement({
  image,
  title,
  text,
  cardInfo,
  colors,
}: {
  image?: {
    src: string;
    height: number;
    width?: number;
    centered?: boolean;
    label?: string;
  };
  title?: {
    text: string;
    fontSize?: number;
    label?: string;
  };
  text?: {
    text: string;
    fontSize?: number;
    label?: string;
  };
  cardInfo: {
    x: number;
    y: number;
    width: number;
    height: number;
    padding: number;
    cardIndex: number;
    label?: string;
  };
  colors: SlideTypeColors;
}) {
  const cardBackground: SlideShape = {
    id: v4(),
    type: SlideElementBaseTypes.SHAPE,
    subtype: SlideShapeElementsVariants.RECTANGLE,
    x: cardInfo.x,
    y: cardInfo.y,
    width: cardInfo.width,
    height: cardInfo.height,
    fillColor: colors.rectangleColor,
    cornerRadius: 16,
    options: {
      isVisible: true,
      label: cardInfo.label || `Card ${cardInfo.cardIndex + 1} Background`,
    },
  };

  const elements: (SlideShape | SlideImage | SlideText)[] = [cardBackground];

  const cardImage: SlideImage | null = image
    ? {
        id: v4(),
        type: SlideElementBaseTypes.IMAGE,
        subtype: SlideImageElementsVariants.IMAGE,
        src: image.src,
        x:
          image.centered && image.width
            ? cardInfo.x +
              cardInfo.padding +
              (cardInfo.width - cardInfo.padding * 2 - image.width) / 2
            : cardInfo.x + cardInfo.padding,
        y: cardInfo.y + cardInfo.padding,
        width: image.width ?? cardInfo.width - cardInfo.padding * 2,
        height: image.height,
        borderRadius: SLIDE_IMAGE_BORDER_RADIUS,
        options: {
          isVisible: true,
          label: image.label || `Card ${cardInfo.cardIndex + 1} Image`,
        },
      }
    : null;

  if (cardImage) {
    elements.push(cardImage);
  }

  let cardTitleElement: SlideText | null = null;
  let cardTextElement: SlideText | null = null;

  if (title) {
    const titleY =
      cardInfo.y + cardInfo.padding + safeNumber(image?.height) + 20; // Gap after image

    const cardTitleHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title.text)}</span>`,
      fontSize: title.fontSize || 36,
      fontFamily: 'Quicksand',
      lineHeight: 1.2,
      width: cardInfo.width - cardInfo.padding * 2,
    });

    cardTitleElement = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${colors.titleColor}; font-weight: bold;">${processMarkdownFormatting(title.text)}</span>`,
      x: cardInfo.x + cardInfo.padding,
      y: titleY,
      width: cardInfo.width - cardInfo.padding * 2,
      height: cardTitleHeight,
      options: {
        isVisible: true,
        label: title.label || `Card ${cardInfo.cardIndex + 1} Title`,
      },
      fontSize: title.fontSize || 36,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.2,
    };

    elements.push(cardTitleElement);
  }

  if (text) {
    const textY =
      safeNumber(cardTitleElement?.y) +
      safeNumber(cardTitleElement?.height) +
      15; // Gap after title
    const cardTextHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${colors.paragraphColor};">${processMarkdownFormatting(text.text)}</span>`,
      fontSize: text.fontSize || 28,
      fontFamily: 'Quicksand',
      lineHeight: 1.4,
      width: cardInfo.width - cardInfo.padding * 2,
    });

    cardTextElement = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${colors.paragraphColor};">${processMarkdownFormatting(text.text)}</span>`,
      x: cardInfo.x + cardInfo.padding,
      y: textY,
      width: cardInfo.width - cardInfo.padding * 2,
      height: cardTextHeight,
      options: {
        isVisible: true,
        label: text.label || `Card ${cardInfo.cardIndex + 1} Text`,
      },
      fontSize: text.fontSize || 28,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.4,
    };

    elements.push(cardTextElement);

    // Check if text extends beyond the card and adjust card height if needed
    const textBottom = textY + cardTextHeight;
    const requiredCardHeight = textBottom + cardInfo.padding - cardInfo.y;
    const maxCardHeight = SLIDE_HEIGHT - cardInfo.y;

    // Use Math.max to ensure card height is at least the original height,
    // but stretch it if text extends beyond. Use Math.min to cap at slide height.
    cardBackground.height = Math.min(
      maxCardHeight,
      Math.max(cardInfo.height, requiredCardHeight)
    );
  }

  return elements;
}

/**
 * Ensures all provided card element groups share the same background height.
 * Expects each card's background to be the first element in its array.
 * Mutates the given arrays in-place and also returns them for convenience.
 */
export function ensureEqualHeights(
  cards: (SlideShape | SlideImage | SlideText)[][]
): (SlideShape | SlideImage | SlideText)[][] {
  if (!cards.length) return cards;

  // Background shapes are always the first element of each card array
  const backgrounds: SlideShape[] = cards
    .map((elements) => elements[0] as SlideShape | undefined)
    .filter((bg): bg is SlideShape => Boolean(bg));

  if (!backgrounds.length) return cards;

  const maxHeight = Math.max(...backgrounds.map((bg) => bg.height));

  backgrounds.forEach((bg) => {
    bg.height = maxHeight;
  });

  return cards;
}

/**
 * Creates an image element with optional caption
 * Returns an array containing the image and caption elements (with optional background)
 */
export function createImageElement({
  image,
  caption,
  colors,
}: {
  image: {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
    label?: string;
  };
  caption?: {
    text: string;
    backgroundColor?: string;
    fontSize?: number;
    captionGap?: number;
    padding?: number;
    label?: string;
  };
  colors: SlideTypeColors;
}): (SlideImage | SlideShape | SlideText)[] {
  const elements: (SlideImage | SlideShape | SlideText)[] = [];

  // Create the image element
  const imageElement: SlideImage = {
    id: v4(),
    type: SlideElementBaseTypes.IMAGE,
    subtype: SlideImageElementsVariants.IMAGE,
    src: image.src,
    x: image.x,
    y: image.y,
    width: image.width,
    height: image.height,
    borderRadius: image.borderRadius ?? 0,
    options: {
      isVisible: true,
      label: image.label || 'Image',
    },
  };

  elements.push(imageElement);

  // Create caption if provided
  if (caption && caption.text) {
    const captionGap = caption.captionGap ?? 8;
    const captionFontSize = caption.fontSize ?? 30;
    const captionPadding = caption.padding ?? 12;
    const captionY = image.y + image.height + captionGap;

    // Calculate caption height
    const captionTextHeight = getTextHeight({
      text: `<span style="overflow-wrap: break-word; color: ${colors.paragraphColor}; font-style: italic;">${processMarkdownFormatting(caption.text)}</span>`,
      fontSize: captionFontSize,
      fontFamily: 'Quicksand',
      lineHeight: 1.3,
      width: image.width - (caption.backgroundColor ? captionPadding * 2 : 0),
    });

    // Create background rectangle if backgroundColor is provided
    if (caption.backgroundColor) {
      const backgroundHeight = captionTextHeight + captionPadding * 2;
      const captionBackground: SlideShape = {
        id: v4(),
        type: SlideElementBaseTypes.SHAPE,
        subtype: SlideShapeElementsVariants.RECTANGLE,
        x: image.x,
        y: captionY,
        width: image.width,
        height: backgroundHeight,
        fillColor: caption.backgroundColor,
        cornerRadius: 8,
        options: {
          isVisible: true,
          label: caption.label
            ? `${caption.label} Background`
            : 'Caption Background',
        },
      };
      elements.push(captionBackground);
    }

    // Create caption text element
    const captionElement: SlideText = {
      id: v4(),
      type: SlideElementBaseTypes.TEXT,
      subtype: SlideTextElementsVariants.PARAGRAPH,
      text: `<span style="overflow-wrap: break-word; color: ${colors.paragraphColor}; font-style: italic;">${processMarkdownFormatting(caption.text)}</span>`,
      x: image.x + (caption.backgroundColor ? captionPadding : 0),
      y: captionY + (caption.backgroundColor ? captionPadding : 0),
      width: image.width - (caption.backgroundColor ? captionPadding * 2 : 0),
      height: captionTextHeight,
      options: {
        isVisible: true,
        label: caption.label || 'Caption',
      },
      fontSize: captionFontSize,
      fontFamily: 'Quicksand',
      textAlign: TextAlignment.Left,
      lineHeight: 1.3,
    };

    elements.push(captionElement);
  }

  return elements;
}
