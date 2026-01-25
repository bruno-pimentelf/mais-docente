export enum SlideElementBaseTypes {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  SHAPE = 'shape',
  TABLE = 'table',
  INTERACTIVE = 'interactive',
}

export enum SlideTextElementsVariants {
  TITLE = 'title',
  SUBTITLE = 'subtitle',
  PARAGRAPH = 'paragraph',
  TOPIC = 'topic',
  QUOTE = 'quote',
}

export enum SlideImageElementsVariants {
  IMAGE = 'image',
  GIF = 'gif',
  BACKGROUND_IMAGE = 'background-image',
}

export enum SlideVideoElementsVariants {
  VIDEO = 'video',
}

export enum SlideTableElementsVariants {
  TABLE = 'table',
}

export enum SlideInteractiveElementsVariants {
  MULTIPLE_CHOICE = 'multiple-choice',
}

export type SlideElementSubTypes =
  | SlideTextElementsVariants
  | SlideImageElementsVariants
  | SlideVideoElementsVariants
  | SlideShapeElementsVariants
  | SlideTableElementsVariants
  | SlideInteractiveElementsVariants;

export enum SlideVariants {
  CUSTOM = 'CUSTOM',
  TITLE = 'TITLE',
  PARAGRAPH = 'PARAGRAPH',
  TOPICS = 'TOPICS',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  QUOTE = 'QUOTE',
  INTERACTIVE_MULTIPLE_CHOICE = 'INTERACTIVE_MULTIPLE_CHOICE',
}

export enum SlideLayoutVariants {
  FULL_CONTENT = 'FULL_CONTENT',
  CONTENT_RIGHT = 'CONTENT_RIGHT',
  CONTENT_LEFT = 'CONTENT_LEFT',
  CONTENT_BOTTOM = 'CONTENT_BOTTOM',
  CONTENT_TOP = 'CONTENT_TOP',
  IMAGE_BACKGROUND = 'IMAGE_BACKGROUND',
}

export enum SlideThemeType {
  COVER = 'cover',
  COVER_1 = 'cover1',
  COVER_2 = 'cover2',
  COVER_LARA_READING = 'coverLaraReading',
  COVER_ARTISTIC = 'coverArtistic',
  COVER_NOTEBOOK = 'coverNotebook',
  COVER_LARA = 'coverLara',
  AGENDA_AND_CONCLUSION = 'agendaAndConclusion',
  TOPICS = 'topics',
  PARAGRAPH_1 = 'paragraph1',
  EXERCISE = 'exercise',
  IMAGE_AND_TEXT_1 = 'imageAndText1',
  IMAGE_AND_TEXT_2 = 'imageAndText2',
  TWO_PARAGRAPHS = 'twoParagraphs',
  BIG_IMAGE_1 = 'bigImage1',
  TEXT_AND_IMAGE_1 = 'textAndImage1',
  TEXT_WITH_TWO_IMAGES_3 = 'textWithTwoImages3',
  PEOPLE_1 = 'people1',
  CARDS_3_2 = 'cards3_2',
  CARDS_2 = 'cards2',
  CARDS_1 = 'cards1',
  THREE_COLUMNS_WITH_IMAGES_1 = 'threeColumnsWithImages1',
  TITLE_TEXT_DIAGONAL = 'titleTextDiagonal',
  AGENDA_TEXT = 'agendaText',
  AGENDA_CARDS = 'agendaCards',
  AGENDA_NOTEBOOK = 'agendaNotebook',
  CONCLUSION = 'conclusion',
  QUOTE = 'quote',
  BIG_NUMBER = 'bigNumber',
  INTERACTIVE_MULTIPLE_CHOICE = 'interactiveMultipleChoice',
  CUSTOM = 'custom',
  TABLE = 'table',
  TITLE_ONE_PLAIN_THREE_BOTTOM_IMAGES_1 = 'titleOnePlainThreeBottomImages1',
  TITLE_ONE_PLAIN_THREE_BOTTOM_IMAGES_2 = 'titleOnePlainThreeBottomImages2',
  TITLE_ONE_PLAIN_THREE_BOTTOM_IMAGES_3 = 'titleOnePlainThreeBottomImages3',
  TITLE_ONE_PLAIN_THREE_BOTTOM_IMAGES_4 = 'titleOnePlainThreeBottomImages4',
  TITLE_ONE_PLAIN_THREE_BOTTOM_IMAGES_5 = 'titleOnePlainThreeBottomImages5',
  TITLE_ONE_PLAIN_THREE_BOTTOM_IMAGES_6 = 'titleOnePlainThreeBottomImages6',
  TITLE_ONE_PLAIN_THREE_BOTTOM_IMAGES_7 = 'titleOnePlainThreeBottomImages7',
  TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_1 = 'titleOnePlainTwoBottomImages1',
  TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_2 = 'titleOnePlainTwoBottomImages2',
  TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_3 = 'titleOnePlainTwoBottomImages3',
  TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_4 = 'titleOnePlainTwoBottomImages4',
  TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_5 = 'titleOnePlainTwoBottomImages5',
  TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_6 = 'titleOnePlainTwoBottomImages6',
  TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_7 = 'titleOnePlainTwoBottomImages7',
  TITLE_ONE_PLAIN_TWO_BOTTOM_IMAGES_8 = 'titleOnePlainTwoBottomImages8',
  NO_TITLE_ONE_PLAIN_TWO_TOP_IMAGES_1 = 'noTitleOnePlainTwoTopImages1',
  NO_TITLE_ONE_PLAIN_TWO_TOP_IMAGES_2 = 'noTitleOnePlainTwoTopImages2',
  NO_TITLE_ONE_PLAIN_TWO_TOP_IMAGES_3 = 'noTitleOnePlainTwoTopImages3',
  NO_TITLE_ONE_PLAIN_TWO_TOP_IMAGES_4 = 'noTitleOnePlainTwoTopImages4',
  TITLE_ONE_PLAIN_TWO_FULL_RIGHT_IMAGES_1 = 'titleOnePlainTwoFullRightImages1',
  TITLE_ONE_PLAIN_TWO_FULL_RIGHT_IMAGES_2 = 'titleOnePlainTwoFullRightImages2',
  TITLE_ONE_PLAIN_TWO_FULL_RIGHT_IMAGES_3 = 'titleOnePlainTwoFullRightImages3',
  TITLE_ONE_PLAIN_TWO_FULL_RIGHT_IMAGES_4 = 'titleOnePlainTwoFullRightImages4',
  TITLE_ONE_PLAIN_TWO_FULL_RIGHT_IMAGES_5 = 'titleOnePlainTwoFullRightImages5',
  TITLE_THREE_COLUMN_THREE_TOP_IMAGES_1 = 'titleThreeColumnThreeTopImages1',
  TITLE_THREE_COLUMN_THREE_TOP_IMAGES_2 = 'titleThreeColumnThreeTopImages2',
  TITLE_THREE_COLUMN_THREE_TOP_IMAGES_3 = 'titleThreeColumnThreeTopImages3',
  TITLE_THREE_COLUMN_THREE_TOP_IMAGES_4 = 'titleThreeColumnThreeTopImages4',
  TITLE_THREE_COLUMN_THREE_TOP_IMAGES_5 = 'titleThreeColumnThreeTopImages5',
  TITLE_THREE_COLUMN_THREE_TOP_IMAGES_6 = 'titleThreeColumnThreeTopImages6',
  TITLE_THREE_COLUMN_THREE_TOP_IMAGES_7 = 'titleThreeColumnThreeTopImages7',
  TITLE_THREE_COLUMN_TWO_BOTTOM_IMAGES_1 = 'titleThreeColumnTwoBottomImages1',
  TITLE_THREE_COLUMN_TWO_BOTTOM_IMAGES_2 = 'titleThreeColumnTwoBottomImages2',
  TITLE_THREE_ROWS_ONE_LEFT_IMAGE_1 = 'titleThreeRowsOneLeftImage1',
  TITLE_THREE_ROWS_ONE_LEFT_IMAGE_2 = 'titleThreeRowsOneLeftImage2',
  TITLE_THREE_ROWS_ONE_LEFT_IMAGE_3 = 'titleThreeRowsOneLeftImage3',
  TITLE_THREE_ROWS_ONE_LEFT_IMAGE_4 = 'titleThreeRowsOneLeftImage4',
  TITLE_THREE_ROWS_ONE_LEFT_IMAGE_5 = 'titleThreeRowsOneLeftImage5',
  TITLE_THREE_ROWS_ONE_LEFT_IMAGE_6 = 'titleThreeRowsOneLeftImage6',
  TITLE_TWO_CARD_TWO_TOP_IMAGES_1 = 'titleTwoCardTwoTopImages1',
  TITLE_TWO_CARD_TWO_TOP_IMAGES_2 = 'titleTwoCardTwoTopImages2',
  TITLE_TWO_CARD_TWO_TOP_IMAGES_3 = 'titleTwoCardTwoTopImages3',
  TITLE_TWO_CARD_TWO_TOP_IMAGES_4 = 'titleTwoCardTwoTopImages4',
  TITLE_TWO_CARD_TWO_TOP_IMAGES_5 = 'titleTwoCardTwoTopImages5',
  TITLE_TWO_CARD_TWO_TOP_IMAGES_6 = 'titleTwoCardTwoTopImages6',
  TITLE_TWO_CARD_TWO_TOP_IMAGES_7 = 'titleTwoCardTwoTopImages7',
  TITLE_THREE_CARD_THREE_TOP_IMAGES_1 = 'titleThreeCardThreeTopImages1',
  TITLE_THREE_CARD_THREE_TOP_IMAGES_2 = 'titleThreeCardThreeTopImages2',
  TITLE_THREE_CARD_THREE_TOP_IMAGES_3 = 'titleThreeCardThreeTopImages3',
  TITLE_THREE_CARD_THREE_TOP_IMAGES_4 = 'titleThreeCardThreeTopImages4',
  TITLE_THREE_CARD_THREE_TOP_IMAGES_5 = 'titleThreeCardThreeTopImages5',
  TITLE_THREE_CARD_THREE_TOP_IMAGES_6 = 'titleThreeCardThreeTopImages6',
  TITLE_THREE_CARD_THREE_TOP_IMAGES_7 = 'titleThreeCardThreeTopImages7',
  TITLE_ONE_PLAIN_TWO_RIGHT_IMAGES_1 = 'titleOnePlainTwoRightImages1',
  TITLE_ONE_PLAIN_TWO_RIGHT_IMAGES_2 = 'titleOnePlainTwoRightImages2',
  TITLE_ONE_PLAIN_TWO_RIGHT_IMAGES_3 = 'titleOnePlainTwoRightImages3',
  TITLE_ONE_PLAIN_TWO_RIGHT_IMAGES_4 = 'titleOnePlainTwoRightImages4',
  TITLE_ONE_PLAIN_TWO_RIGHT_IMAGES_5 = 'titleOnePlainTwoRightImages5',
  THREE_STEP = 'threeStep',
  FOUR_STEP = 'fourStep',
}

export type BaseSlideElementDimensions = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type BaseSlideElement = BaseSlideElementDimensions & {
  id: string;
  type: SlideElementBaseTypes;
  subtype: SlideElementSubTypes;
  options: {
    isVisible: boolean;
    label: string;
  };
};

export type BaseSlideTextElementSpecificDimensions = {
  fontSize: number;
  lineHeight: number;
};

export type BaseSlideTextElementDimensions = BaseSlideElementDimensions &
  BaseSlideTextElementSpecificDimensions;

export enum TextAlignment {
  Center = 'center',
  Left = 'left',
  Right = 'right',
  Justified = 'justify',
}

export enum VerticalAlignment {
  Center = 'center',
  Top = 'top',
  Bottom = 'bottom',
}

export type SlideText = BaseSlideElement &
  BaseSlideTextElementSpecificDimensions & {
    type: SlideElementBaseTypes.TEXT;
    subtype: SlideTextElementsVariants;
    text: string;
    fontFamily: string;
    textAlign: TextAlignment;
  };

export type SlideElementDimensions =
  | BaseSlideElementDimensions
  | BaseSlideTextElementDimensions;

export type SlideImage = BaseSlideElement & {
  type: SlideElementBaseTypes.IMAGE;
  subtype: SlideImageElementsVariants;
  src: string;
  isUploading?: boolean;
  borderRadius?: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type SlideVideo = BaseSlideElement & {
  type: SlideElementBaseTypes.VIDEO;
  subtype: SlideVideoElementsVariants;
  src: string;
};

export enum SlideShapeElementsVariants {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  LINE = 'line',
}

export type SlideShape = BaseSlideElement & {
  type: SlideElementBaseTypes.SHAPE;
  subtype: SlideShapeElementsVariants;
  fillColor: string;
  cornerRadius?: number;
  opacity?: number;
};

export type SlideLineShape = SlideShape & {
  subtype: SlideShapeElementsVariants.LINE;
  points: [number, number, number, number];
};

export interface TableCell {
  value: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: TextAlignment;
  verticalAlign?: VerticalAlignment;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export type SlideTable = BaseSlideElement & {
  type: SlideElementBaseTypes.TABLE;
  subtype: SlideTableElementsVariants;
  content: {
    rows: number;
    cols: number;
    data: TableCell[][];
    rowHeights?: number[];
    columnWidths?: number[];
  };
  borderColor?: string;
  backgroundColor?: string;
  defaultRowHeight?: number;
  defaultColumnWidth?: number;
  headerStyle?: {
    backgroundColor?: string;
    fontWeight?: string;
    textAlign?: TextAlignment;
    verticalAlign?: VerticalAlignment;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
  };
  defaultCellStyle?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: TextAlignment;
    verticalAlign?: VerticalAlignment;
  };
};

export type SlideInteractiveMultipleChoice = BaseSlideElement & {
  type: SlideElementBaseTypes.INTERACTIVE;
  subtype: SlideInteractiveElementsVariants;
  question: string;
  alternatives: {
    id: string;
    text: string;
    isAnswer: boolean;
  }[];
  image?: string;
};

export type SlideElement =
  | SlideText
  | SlideImage
  | SlideVideo
  | SlideShape
  | SlideLineShape
  | SlideTable
  | SlideInteractiveMultipleChoice;

export type SlideDimensions = {
  width: number;
  height: number;
};

export interface Slide {
  id: string;
  order: number;
  variant: SlideVariants;
  layout: SlideLayoutVariants;
  slideType: SlideThemeType;
  elements?: SlideElement[];
  themeSettings: {
    baseWidth: number;
    baseHeight: number;
    width: number;
    height: number;
    backgroundColor: string;
    backgroundImage?: string;
  };
}

export interface CustomColorPalette {
  id: string;
  name: string;
  colors: {
    title: string;
    text: string;
    shape: string;
    rectangle: string;
    circle: string;
    line: string;
    background: string;
  };
  backgroundColor?: string;
}

export interface CustomFonts {
  titleFont?: string;
  textFont?: string;
}

export interface CustomTheme {
  colorPalette?: CustomColorPalette;
  fonts?: CustomFonts;
}

export interface PresentationEditorState {
  uuid: string | null;
  title: string;
  slides: Slide[];
  logo_path: string;
  selectedSlide: string | null;
  lastAddedSlideId: string | null;
  selectedSlideType?: keyof typeof SlideThemeType | null;
  currentTheme?: unknown;
  customTheme?: CustomTheme;
  openSidebar?: 'theme' | 'fillWithAi' | 'gif' | 'image' | null;
}
