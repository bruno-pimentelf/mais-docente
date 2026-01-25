export interface SlideTypeColors {
  backgroundColor: string;
  backgroundImage?: string;
  titleColor: string;
  subtitleColor: string;
  paragraphColor: string;
  shapeColor: string;
  accentColor: string;
  rectangleColor: string;
  circleColor: string;
  lineColor: string;
  titleBackgroundImage?: string;
  decorativeImage?: {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

export interface SlideTableColors {
  backgroundColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  textColor: string;
  cellBackgroundColor: string;
}

export interface CoverSlideColors extends SlideTypeColors {
  decorativeImageWithCover?: {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SlideTheme {
  name: string;
  isPremium?: boolean;
  cover: CoverSlideColors;
  summary: SlideTypeColors;
  developmentBullet: SlideTypeColors;
  developmentText: SlideTypeColors;
  twoColumns: SlideTypeColors;
  imageDown?: SlideTypeColors;
  imageAndText?: SlideTypeColors;
  textAndImage?: SlideTypeColors;
  exercise: SlideTypeColors;
  mainImage: SlideTypeColors;
  bigImage: SlideTypeColors;
  conclusion: SlideTypeColors;
  table: SlideTableColors;
  cards: SlideTypeColors;
  logo_path?: string;
}
