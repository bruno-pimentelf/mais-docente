import { Slide } from '../../types/index';

/**
 * Base interface for slide factories
 * Following Single Responsibility Principle - each factory creates one type of slide
 */
export interface ISlideFactory {
  create(...args: any[]): Slide | Slide[];
}

/**
 * Base interface for async slide factories
 * For factories that need to load external resources (like images)
 */
export interface IAsyncSlideFactory {
  create(...args: any[]): Promise<Slide | Slide[]>;
}

/**
 * Interface for cover slide factory
 */
export interface ICoverSlideFactory extends ISlideFactory {
  create(params: {
    title: string;
    subtitle?: string;
    logo_path: string;
    slideOrder: number;
    cover_image_url?: string;
  }): Slide;
}

export interface ICover1SlideFactory extends IAsyncSlideFactory {
  create(
    image_url: string,
    title_text: string,
    logo_path: string,
    slideOrder: number
  ): Promise<Slide>;
}

export interface ICover2SlideFactory extends ISlideFactory {
  create(params: {
    title: string;
    subtitle: string;
    logo_path: string;
    slideOrder: number;
  }): Slide;
}

export interface ICoverLaraReadingSlideFactory extends ISlideFactory {
  create(params: {
    title: string;
    subtitle: string;
    logo_path: string;
    slideOrder: number;
  }): Slide;
}

export interface ICoverArtisticSlideFactory extends ISlideFactory {
  create(params: {
    title: string;
    subtitle: string;
    logo_path: string;
    slideOrder: number;
    cover_image_url?: string;
  }): Slide;
}

export interface ICoverNotebookSlideFactory extends ISlideFactory {
  create(params: {
    title: string;
    subtitle: string;
    logo_path: string;
    slideOrder: number;
  }): Slide;
}

export interface ICoverLaraSlideFactory extends ISlideFactory {
  create(params: {
    title: string;
    subtitle: string;
    logo_path: string;
    slideOrder: number;
  }): Slide;
}

/**
 * Interface for summary slide factory
 */
export interface ISummarySlideFactory extends ISlideFactory {
  create(
    title: string,
    category: string,
    subtopic_list: string[],
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for development bullet slide factory
 */
export interface IDevelopmentBulletSlideFactory extends IAsyncSlideFactory {
  create(
    image_url: string | null,
    title: string,
    content_bullet_points: string[],
    logo_path: string,
    slideOrder: number,
    image_caption?: string
  ): Promise<Slide>;
}

/**
 * Interface for development text slide factory
 */
export interface IDevelopmentTextSlideFactory extends ISlideFactory {
  create(
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for exercise slide factory
 */
export interface IExerciseSlideFactory extends ISlideFactory {
  create(
    exercise_list: string[],
    exercises_title: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for main image slide factory
 */
export interface IMainImageSlideFactory extends IAsyncSlideFactory {
  create(
    image_url: string | null,
    category: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption?: string
  ): Promise<Slide>;
}

/**
 * Interface for main image mirrored slide factory
 */
export interface IMainImageMirroredSlideFactory extends IAsyncSlideFactory {
  create(
    image_url: string | null,
    category: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption?: string
  ): Promise<Slide>;
}

/**
 * Interface for two-column slide factory
 */
export interface ITwoColumnsSlideFactory extends ISlideFactory {
  create(
    title_A: string,
    title_B: string,
    content_text_A: string,
    content_text_B: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for big image slide factory
 */
export interface IBigImageSlideFactory extends IAsyncSlideFactory {
  create(
    image_url: string,
    legend_text: string,
    logo_path: string,
    slideOrder: number
  ): Promise<Slide>;
}

/**
 * Interface for image and text 7 / title one plain two right images slide factory
 */
export interface ITitleOnePlainTwoRightImagesSlideFactory extends ISlideFactory {
  create(
    image_url_1: string,
    image_url_2: string,
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption_1?: string,
    image_caption_2?: string
  ): Slide;
}

/**
 * Interface for title one plain three bottom images 1 slide factory (title + text + three images)
 */
export interface ITitleOnePlainThreeBottomImagesSlideFactory extends ISlideFactory {
  create(
    image_url_1: string,
    image_url_2: string,
    image_url_3: string,
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption_1?: string,
    image_caption_2?: string,
    image_caption_3?: string
  ): Slide;
}

/**
 * Interface for title one plain two bottom images 1 slide factory (title + text + two images)
 */
export interface ITitleOnePlainTwoBottomImagesSlideFactory extends ISlideFactory {
  create(
    image_url_1: string,
    image_url_2: string,
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption_1?: string,
    image_caption_2?: string
  ): Slide;
}

/**
 * Interface for no title one plain two top images 1 slide factory (text left + two images stacked right)
 */
export interface INoTitleOnePlainTwoTopImagesSlideFactory extends ISlideFactory {
  create(
    image_url_1: string,
    image_url_2: string,
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption_1?: string,
    image_caption_2?: string
  ): Slide;
}

/**
 * Interface for title one plain two full right images slide factory (title + text left + two images stacked right, images touch edges)
 */
export interface ITitleOnePlainTwoFullRightImagesSlideFactory extends ISlideFactory {
  create(
    image_url_1: string,
    image_url_2: string,
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption_1?: string,
    image_caption_2?: string
  ): Slide;
}

export interface ITextWithTwoImages3SlideFactory extends ISlideFactory {
  create(
    image_url_1: string,
    image_url_2: string,
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption_1?: string,
    image_caption_2?: string
  ): Slide;
}

/**
 * Interface for title three column three top images 1 slide factory (title + three cards horizontally aligned)
 */
export interface ITitleThreeColumnThreeTopImagesSlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    card_3_image: string,
    card_3_title: string,
    card_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for cards 2 slide factory (title + two cards horizontally aligned with circular images)
 */
export interface ICards2SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for cards 3_2 slide factory (title + three cards horizontally aligned with circular images)
 */
export interface ICards3_2SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    card_3_image: string,
    card_3_title: string,
    card_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title and text card 2 slide factory (title + two text cards with background)
 */
export interface ITitleAndTextCard2SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_title: string,
    card_1_text: string,
    card_2_title: string,
    card_2_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title and text card 3 slide factory (title + three text cards with background)
 */
export interface ITitleAndTextCard3SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_title: string,
    card_1_text: string,
    card_2_title: string,
    card_2_text: string,
    card_3_title: string,
    card_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title two card two top images 1 slide factory (title + two image cards with text)
 */
export interface ITitleTwoCardTwoTopImages1SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title two card two top images 2 slide factory (title + two image cards with text)
 */
export interface ITitleTwoCardTwoTopImages2SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title two card two top images 3 slide factory (title + two image cards with text)
 */
export interface ITitleTwoCardTwoTopImages3SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title two card two top images 4 slide factory (title + two image cards with text)
 */
export interface ITitleTwoCardTwoTopImages4SlideFactory extends ISlideFactory {
  create(
    title: string,
    paragraph_title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title three card three top images 1 slide factory (title + three image cards with text)
 */
export interface ITitleThreeCardThreeTopImages1SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    card_3_image: string,
    card_3_title: string,
    card_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title three card three top images 2 slide factory (title + three image cards with text)
 */
export interface ITitleThreeCardThreeTopImages2SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    card_3_image: string,
    card_3_title: string,
    card_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title three card three top images 3 slide factory (title + three image cards with text)
 */
export interface ITitleThreeCardThreeTopImages3SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    card_3_image: string,
    card_3_title: string,
    card_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title three card three top images 4 slide factory (title + three image cards with text)
 */
export interface ITitleThreeCardThreeTopImages4SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    card_3_image: string,
    card_3_title: string,
    card_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title three card three top images 5 slide factory (title + three image cards with text)
 */
export interface ITitleThreeCardThreeTopImages5SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    card_3_image: string,
    card_3_title: string,
    card_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title three card three top images 6 slide factory (title + three image cards with text)
 */
export interface ITitleThreeCardThreeTopImages6SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    card_3_image: string,
    card_3_title: string,
    card_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title three card three top images 7 slide factory (title + three image cards with text)
 */
export interface ITitleThreeCardThreeTopImages7SlideFactory extends ISlideFactory {
  create(
    title: string,
    card_1_image: string,
    card_1_title: string,
    card_1_text: string,
    card_2_image: string,
    card_2_title: string,
    card_2_text: string,
    card_3_image: string,
    card_3_title: string,
    card_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title three column two bottom images 1 slide factory (title + three text columns + two images below)
 */
export interface ITitleThreeColumnTwoBottomImages1SlideFactory extends ISlideFactory {
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
  ): Slide;
}

/**
 * Interface for title three column two bottom images 2 slide factory (title + three text columns + two images below)
 */
export interface ITitleThreeColumnTwoBottomImages2SlideFactory extends ISlideFactory {
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
  ): Slide;
}

/**
 * Interface for title text 3 slide factory (large title left + three text sections right)
 */
export interface ITitleText3SlideFactory extends ISlideFactory {
  create(
    main_title: string,
    section_1_title: string,
    section_1_text: string,
    section_2_title: string,
    section_2_text: string,
    section_3_title: string,
    section_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

export interface ITitleTextDiagonalSlideFactory extends ISlideFactory {
  create(
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for title three rows one left image 1 slide factory (large image left + main title + three text sections right)
 */
export interface ITitleThreeRowsOneLeftImageSlideFactory extends IAsyncSlideFactory {
  create(
    image_url: string,
    main_title: string,
    section_1_title: string,
    section_1_text: string,
    section_2_title: string,
    section_2_text: string,
    section_3_title: string,
    section_3_text: string,
    logo_path: string,
    slideOrder: number
  ): Promise<Slide>;
}

/**
 * Interface for image and text 4 slide factory
 */
export interface IImageAndText4SlideFactory extends ISlideFactory {
  create(
    image_url: string,
    title: string,
    content_text: string,
    logo_path: string,
    slideOrder: number,
    image_caption?: string
  ): Slide;
}

/**
 * Interface for conclusion slide factory
 */
export interface IConclusionSlideFactory extends ISlideFactory {
  create(
    title: string,
    subtitle: string,
    content_bullet_points: string[],
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for simple question slide factory
 */
export interface ISimpleQuestionSlideFactory extends ISlideFactory {
  create(
    question: string,
    content_text: string,
    lara_img_path: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for interactive multiple choice slide factory
 */
export interface IInteractiveMultipleChoiceSlideFactory extends ISlideFactory {
  create(
    question: string,
    alternatives: { id: string; text: string; isAnswer: boolean }[],
    slideOrder: number,
    image_url?: string
  ): Slide;
}

/**
 * Interface for agenda text slide factory
 */
export interface IAgendaTextSlideFactory extends ISlideFactory {
  create(
    title: string,
    agenda_items: string[],
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for agenda cards slide factory
 */
export interface IAgendaCardsSlideFactory extends ISlideFactory {
  create(
    title: string,
    agenda_items: string[],
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for agenda notebook slide factory
 */
export interface IAgendaNotebookSlideFactory extends ISlideFactory {
  create(
    title: string,
    agenda_items: string[],
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for table slide factory
 */
export interface ITableSlideFactory extends ISlideFactory {
  create(params: {
    logo_path: string;
    slideOrder: number;
    data?: string[][];
    title?: string;
  }): Slide;
}

/**
 * Interface for crossword slide factory
 * Returns an array of two slides instead of a single slide
 */
export interface ICrosswordSlideFactory extends IAsyncSlideFactory {
  create(
    title: string,
    image_url_1: string,
    image_url_2: string,
    logo_path: string,
    slideOrder: number
  ): Promise<Slide[]>;
}

/**
 * Interface for word search slide factory
 * Returns an array of two slides instead of a single slide
 */
export interface IWordSearchSlideFactory extends IAsyncSlideFactory {
  create(
    title: string,
    image_url_1: string,
    image_url_2: string,
    logo_path: string,
    slideOrder: number
  ): Promise<Slide[]>;
}

/**
 * Interface for big number slide factory (big number + two lines of text)
 */
export interface IBigNumberSlideFactory extends ISlideFactory {
  create(
    big_number: string,
    line1_text: string,
    line2_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for three step slide factory
 */
export interface IThreeStepSlideFactory extends ISlideFactory {
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
  ): Slide;
}

/**
 * Interface for four step slide factory
 */
export interface IFourStepSlideFactory extends ISlideFactory {
  create(
    title: string,
    step_1_title: string,
    step_1_text: string,
    step_2_title: string,
    step_2_text: string,
    step_3_title: string,
    step_3_text: string,
    step_4_title: string,
    step_4_text: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}

/**
 * Interface for quote slide factory
 */
export interface IQuoteSlideFactory extends ISlideFactory {
  create(
    quote_text: string,
    author: string,
    logo_path: string,
    slideOrder: number
  ): Slide;
}
