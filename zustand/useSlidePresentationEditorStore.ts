import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { v4 as uuidv4, v4 } from 'uuid';

import {
  PresentationEditorState,
  Slide,
  SlideElement,
  SlideElementBaseTypes,
  SlideImage,
  SlideImageElementsVariants,
  SlideLayoutVariants,
  SlideLineShape,
  SlideShape,
  SlideShapeElementsVariants,
  SlideText,
  SlideTextElementsVariants,
  SlideThemeType,
  SlideVariants,
  SlideVideo,
  SlideVideoElementsVariants,
  TextAlignment,
  SlideTable,
  SlideTableElementsVariants,
  TableCell,
  VerticalAlignment,
  SlideInteractiveMultipleChoice,
  CustomTheme,
} from '@/components/slidePresentationEditor/types';
import { type SlideTheme } from '@/components/slidePresentationEditor/utils/types/slide-theme.types';
import {
  defaultTheme,
  slideThemes,
} from '@/components/slidePresentationEditor/utils/themes/slide-themes';
import { devLog } from './utils/devLog';
import { shallow } from 'zustand/shallow';
import { useSlideEditorLayoutStore } from './useSlideEditorLayoutStore';

/** ---------- Helpers (unchanged logic) ---------- */
function handleSlideElementPosition(
  state: PresentationEditorState,
  payload: { slideUuid: string; elementUuid: string; x: number; y: number }
) {
  const slide = state.slides.find((s) => s.id === payload.slideUuid);
  if (!slide) return;
  const el = slide.elements?.find((e) => e.id === payload.elementUuid);
  if (!el) return;
  el.x = payload.x;
  el.y = payload.y;
}

function handleSlideElementSizes(
  state: PresentationEditorState,
  payload: {
    slideUuid: string;
    elementUuid: string;
    width: number;
    height: number;
    x?: number;
    y?: number;
    rotation?: number;
    fontSize?: number;
  }
) {
  const slide = state.slides.find((s) => s.id === payload.slideUuid);
  if (!slide) return;
  const el = slide.elements?.find((e) => e.id === payload.elementUuid);
  if (!el) return;

  el.width = payload.width;
  el.height = payload.height;

  if (el.type === SlideElementBaseTypes.TABLE) {
    const table = el as SlideTable;
    const newHeight = payload.height;
    const newWidth = payload.width;
    const rowCount = table.content.rows;
    const colCount = table.content.cols;

    if (rowCount > 0) {
      const newRowHeight = Math.round(newHeight / rowCount);
      table.content.rowHeights = Array(rowCount).fill(newRowHeight);
      table.defaultRowHeight = newRowHeight;
      payload.height = table.content.rowHeights.reduce((a, c) => a + c, 0);
    }
    if (colCount > 0) {
      const newColWidth = Math.round(newWidth / colCount);
      table.content.columnWidths = Array(colCount).fill(newColWidth);
      table.defaultColumnWidth = newColWidth;
      payload.width = table.content.columnWidths.reduce((a, c) => a + c, 0);
    }
  }

  if (payload.x !== undefined) el.x = payload.x;
  if (payload.y !== undefined) el.y = payload.y;
  if (payload.rotation !== undefined) el.rotation = payload.rotation;

  if (el.type === SlideElementBaseTypes.TEXT && payload.fontSize) {
    (el as SlideText).fontSize = payload.fontSize;
  }
}

export const detectCurrentTheme = (
  state: PresentationEditorState
): SlideTheme => {
  for (const slide of state.slides) {
    if (slide.elements) {
      for (const element of slide.elements) {
        if (element.type === SlideElementBaseTypes.TABLE) {
          const table = element as SlideTable;
          if (table.content.data?.length) {
            const headerCell = table.content.data[0]?.[0];
            if (headerCell?.backgroundColor) {
              for (const [, theme] of Object.entries(slideThemes)) {
                if (
                  theme.table.headerBackgroundColor ===
                  headerCell.backgroundColor
                ) {
                  return theme;
                }
              }
            }
          }
        }
      }
    }
  }
  return defaultTheme;
};

export const migrateTableData = (
  data: any[][],
  currentTheme: SlideTheme
): TableCell[][] =>
  data.map((row, rowIndex) =>
    row.map((cell): TableCell => {
      if (typeof cell === 'object' && cell !== null && 'value' in cell) {
        return cell as TableCell;
      }
      const isHeader = rowIndex === 0;
      return {
        value: String(cell ?? ''),
        fontSize: isHeader ? 14 : 12,
        fontFamily: 'Arial',
        fontWeight: isHeader ? 'bold' : 'normal',
        textAlign: isHeader ? TextAlignment.Center : TextAlignment.Left,
        verticalAlign: isHeader
          ? VerticalAlignment.Center
          : VerticalAlignment.Top,
        color: isHeader
          ? currentTheme.table.headerTextColor
          : currentTheme.table.textColor,
        backgroundColor: isHeader
          ? currentTheme.table.headerBackgroundColor
          : currentTheme.table.backgroundColor,
      };
    })
  );

function getNewSlide(
  slideType: SlideThemeType,
  position: number,
  backgroundColor?: string,
  currentTheme?: SlideTheme,
  logo_path: string = '/images/icons/lara-icon-talk.svg',
  customTheme?: CustomTheme
): Slide {
  const uuid = uuidv4();
  let finalBackgroundColor = backgroundColor;

  // First priority: use custom color palette background if available
  if (customTheme?.colorPalette) {
    finalBackgroundColor =
      customTheme.colorPalette.backgroundColor ||
      customTheme.colorPalette.colors.background;
  } else if (currentTheme && !backgroundColor) {
    // Fallback to current theme
    finalBackgroundColor = currentTheme.developmentText.backgroundColor;
  }

  if (!finalBackgroundColor) finalBackgroundColor = '#FFFFFF';

  return {
    id: uuid,
    order: position,
    variant: SlideVariants.CUSTOM,
    slideType,
    elements: [
      {
        id: v4(),
        type: SlideElementBaseTypes.IMAGE,
        subtype: SlideImageElementsVariants.IMAGE,
        src: logo_path,
        x: 1759,
        y: 930,
        width: 80,
        height: 80,
        options: { isVisible: true, label: 'Logo' },
      },
    ],
    layout: SlideLayoutVariants.FULL_CONTENT,
    themeSettings: {
      baseWidth: 1920,
      baseHeight: 1080,
      width: 1920,
      height: 1080,
      backgroundColor: finalBackgroundColor,
    },
  };
}

function getThemeColors(slide: Slide, theme: SlideTheme) {
  switch (slide.slideType) {
    case SlideThemeType.COVER:
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
    case SlideThemeType.TWO_PARAGRAPHS:
    case SlideThemeType.AGENDA_NOTEBOOK:
      return theme.developmentText;
    case SlideThemeType.EXERCISE:
      return theme.exercise;
    case SlideThemeType.IMAGE_AND_TEXT_1:
    case SlideThemeType.IMAGE_AND_TEXT_2:
      return theme.mainImage;
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

/** ---------- Initial State ---------- */
const INITIAL_STATE: PresentationEditorState = {
  uuid: null,
  title: '',
  slides: [],
  logo_path: '/images/icons/lara-icon-talk.svg',
  selectedSlide: null,
  openSidebar: null,
  lastAddedSlideId: null,
  selectedSlideType: null,
  currentTheme: defaultTheme,
  customTheme: undefined,
};

/** ---------- Store shape ---------- */
type Actions = {
  // 1: Presentation-level
  resetPresentation: () => void;
  loadPresentation: (state: PresentationEditorState) => void;
  loadPresentationFromAPI: (payload: any) => void;
  updateTitle: (title: string) => void;
  updatePresentationMetadata: (p: {
    title?: string;
    agenda_header?: string;
    agenda_subtitle?: string;
    agenda?: string[];
    conclusion_header?: string;
    conclusion_subtitle?: string;
    conclusion?: string[];
    uuid?: string | null;
  }) => void;
  initializeEmptyPresentation: (p: {
    title: string;
    uuid?: string | null;
    theme?: string;
    agenda_header?: string;
    agenda_subtitle?: string;
    agenda?: string[];
    conclusion_header?: string;
    conclusion_subtitle?: string;
    conclusion?: string[];
  }) => void;
  selectFirstSlide: () => void;

  // 2: Slides CRUD & order
  addSlide: (variant: SlideVariants) => void;
  addSlideAtPosition: (p: {
    variant?: SlideVariants;
    position: number;
    slide?: Slide;
  }) => void;
  addSlidesToPresentation: (p: { slides: Slide[]; position?: number }) => void;
  addSlideToPresentation: (slide: Slide) => void;
  removeSlide: (slideId: string) => void;
  duplicateSlide: (slideId: string) => void;
  reorderSlides: (p: { fromIndex: number; toIndex: number }) => void;
  moveSlideUpwards: (slideId: string) => void;
  moveSlideDownwards: (slideId: string) => void;
  setSelectedSlide: (slideId: string) => void;
  updateSlideBackground: (p: {
    slideId: string;
    backgroundColor: string;
  }) => void;
  updateAllSlidesBackground: (color: string) => void;
  updateSlideContent: (p: {
    slideId: string;
    title?: string;
    elements?: SlideElement[];
    layout?: SlideLayoutVariants;
    variant?: SlideVariants;
    slideType?: SlideThemeType;
    themeSettings?: Partial<{
      logo_path: string;
      baseWidth: number;
      baseHeight: number;
      width: number;
      height: number;
      previewModeWidth: number;
      previewModeHeight: number;
      backgroundColor: string;
    }>;
  }) => void;

  // 3: Elements & media
  setSlideImageBackground: (src: string) => void;
  deleteSlideImageBackground: () => void;
  updateSlideMedia: (p: {
    slideUuid: string;
    mediaUuid: string;
    src: string;
  }) => void;
  setImageUploading: (p: {
    slideUuid: string;
    elementUuid: string;
    isUploading: boolean;
  }) => void;

  addParagraphElement: (p: { text: string }) => void;
  addImageElement: (p: {
    src: string;
    originalWidth?: number;
    originalHeight?: number;
  }) => void;
  addGifElement: (p: {
    src: string;
    originalWidth?: number;
    originalHeight?: number;
    title?: string;
  }) => void;
  addVideoElement: (p: { src: string }) => void;
  addShapeElement: (p: { type: SlideShapeElementsVariants }) => void;
  addTableElement: (p: {
    rows?: number;
    cols?: number;
    data?: TableCell[][];
  }) => void;

  addElementToSlide: (
    el: SlideElement & { pastePosition?: { x: number; y: number } }
  ) => void;
  removeElement: (p: { slideUuid: string; elementUuid: string }) => void;
  removeElementsBulk: (p: {
    slideUuid: string;
    elementUuids: string[];
  }) => void;
  moveElementLayerUpwards: (p: {
    slideUuid: string;
    elementUuid: string;
  }) => void;
  moveElementLayerDownwards: (p: {
    slideUuid: string;
    elementUuid: string;
  }) => void;
  bringElementToFront: (p: { slideUuid: string; elementUuid: string }) => void;
  sendElementToBack: (p: { slideUuid: string; elementUuid: string }) => void;

  // 4: Element transforms/positions
  setSlideElementPosition: (p: {
    slideUuid: string;
    elementUuid: string;
    x: number;
    y: number;
  }) => void;
  commitSlideElementPosition: (p: {
    slideUuid: string;
    elementUuid: string;
    x: number;
    y: number;
  }) => void;
  commitSlideElementsPositionBulk: (p: {
    slideUuid: string;
    updates: { elementUuid: string; x: number; y: number }[];
  }) => void;

  setSlideElementSizes: (p: {
    slideUuid: string;
    elementUuid: string;
    width: number;
    height: number;
    x?: number;
    y?: number;
    rotation?: number;
    fontSize?: number;
  }) => void;
  commitSlideElementSizes: (p: {
    slideUuid: string;
    elementUuid: string;
    width: number;
    height: number;
    x?: number;
    y?: number;
    rotation?: number;
    fontSize?: number;
  }) => void;

  setSlideElementHeight: (p: {
    slideUuid: string;
    elementUuid: string;
    height: number;
  }) => void;
  setSlideElementWidth: (p: {
    slideUuid: string;
    elementUuid: string;
    width: number;
  }) => void;

  moveElementTowards: (p: {
    slideUuid: string;
    elementUuid: string;
    direction: 'up' | 'down' | 'left' | 'right';
  }) => void;

  // 5: Text & Quiz
  updateText: (p: { slideUuid: string; textId: string; text: string }) => void;
  updateTextFormat: (p: {
    slideUuid: string;
    elementUuid: string;
    format: {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      color?: string;
      textAlign?: TextAlignment;
      headingLevel?: number;
      fontSize?: number;
      fontFamily?: string;
      width?: number;
      height?: number;
    };
  }) => void;
  applyFontsToAllSlides: (p: {
    role: 'title' | 'text';
    fontFamily: string;
  }) => void;

  applyColorModeToAllSlides: (p: {
    colorMode: {
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
    };
  }) => void;

  updateQuiz: (p: {
    slideId: string;
    quizId: string;
    attr: string;
    value: string | { id: string; text: string; isAnswer: boolean }[];
  }) => void;

  // 6: Tables
  updateTableCell: (p: {
    slideUuid: string;
    elementUuid: string;
    rowIndex: number;
    colIndex: number;
    value?: string;
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
  }) => void;
  addTableRow: (p: {
    slideUuid: string;
    elementUuid: string;
    atIndex?: number;
  }) => void;
  removeTableRow: (p: {
    slideUuid: string;
    elementUuid: string;
    rowIndex: number;
  }) => void;
  addTableColumn: (p: {
    slideUuid: string;
    elementUuid: string;
    atIndex?: number;
  }) => void;
  removeTableColumn: (p: {
    slideUuid: string;
    elementUuid: string;
    colIndex: number;
  }) => void;
  updateTableContent: (p: {
    slideUuid: string;
    elementUuid: string;
    content: { rows: number; cols: number; data: TableCell[][] };
  }) => void;
  updateTableStyle: (p: {
    slideUuid: string;
    elementUuid: string;
    borderColor?: string;
    backgroundColor?: string;
    headerStyle?: {
      backgroundColor?: string;
      fontWeight?: string;
      textAlign?: TextAlignment;
      color?: string;
    };
  }) => void;
  updateTableRowHeight: (p: {
    slideUuid: string;
    elementUuid: string;
    rowIndex: number;
    height: number;
  }) => void;
  updateTableColumnWidth: (p: {
    slideUuid: string;
    elementUuid: string;
    columnIndex: number;
    width: number;
  }) => void;

  // 7: Theme & BG & misc
  setBackgroundColor: (color: string) => void;
  applyThemeToAllSlides: (theme: SlideTheme) => void;
  applyColorPaletteToAllSlides: (p: {
    colorPalette: {
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
    };
  }) => void;
  setShapeColor: (p: {
    slideUuid: string;
    elementUuid: string;
    color: string;
  }) => void;

  // 8: UI helpers
  setSelectedSlideType: (t: keyof typeof SlideThemeType) => void;
  resetSelectedSlideType: () => void;
};

type Store = PresentationEditorState & Actions;

/** ---------- Zustand store ---------- */
export const useSlidePresentationEditorStore = create<Store>()(
  devtools(
    temporal(
      immer((set) => ({
        ...INITIAL_STATE,

        /** -------- Presentation -------- */
        resetPresentation: () =>
          set(() => {
            devLog('resetPresentation');
            return INITIAL_STATE;
          }),

        loadPresentation: (payload) =>
          set(() => {
            devLog('loadPresentation');
            return payload;
          }),

        loadPresentationFromAPI: (_presentation) =>
          set(() => {
            devLog('loadPresentationFromAPI (no-op: API not integrated yet)');
          }),

        updateTitle: (title) =>
          set((s) => {
            devLog('updateTitle');
            s.title = title;
          }),

        updatePresentationMetadata: (p) =>
          set((s) => {
            devLog('updatePresentationMetadata');
            if (p.title !== undefined) s.title = p.title;
            if (p.uuid !== undefined) s.uuid = p.uuid;
          }),

        initializeEmptyPresentation: ({ title, uuid, theme }) =>
          set((s) => {
            devLog('initializeEmptyPresentation');
            s.uuid = uuid ?? null;
            s.title = title;
            s.slides = [];
            s.selectedSlide = null;
            s.currentTheme = theme
              ? slideThemes[theme as keyof typeof slideThemes]
              : undefined;
          }),

        selectFirstSlide: () =>
          set((s) => {
            devLog('selectFirstSlide');
            s.selectedSlide = s.slides[0]?.id || null;
          }),

        /** -------- Slides CRUD & order -------- */
        addSlide: (_variant) =>
          set((s) => {
            devLog('addSlide');
            const last = s.slides[s.slides.length - 1];
            const lastLogo = (
              last?.elements?.find(
                (e) =>
                  e.type === SlideElementBaseTypes.IMAGE &&
                  e.options.label === 'Logo'
              ) as any
            )?.src;
            const lastBg = last?.themeSettings?.backgroundColor;
            const newSlide = getNewSlide(
              SlideThemeType.CUSTOM,
              s.slides.length + 1,
              lastBg,
              s.currentTheme as SlideTheme | undefined,
              lastLogo ?? s.logo_path,
              s.customTheme
            );
            s.slides.push(newSlide);
            s.selectedSlide = newSlide.id;
            s.lastAddedSlideId = newSlide.id;
          }),

        addSlideAtPosition: ({ variant: _variant, position, slide }) =>
          set((s) => {
            devLog('addSlideAtPosition');
            const prevLogo = (
              s.slides[position - 1]?.elements?.find(
                (e) =>
                  e.type === SlideElementBaseTypes.IMAGE &&
                  e.options.label === 'Logo'
              ) as any
            )?.src;
            const lastBg =
              s.slides[s.slides.length - 1]?.themeSettings?.backgroundColor;
            const newSlide =
              slide ??
              getNewSlide(
                SlideThemeType.CUSTOM,
                position,
                lastBg,
                s.currentTheme as SlideTheme | undefined,
                prevLogo ?? s.logo_path,
                s.customTheme
              );
            s.slides.splice(position, 0, newSlide);
            s.slides = s.slides.map((sl, idx) => ({ ...sl, order: idx + 1 }));
            s.selectedSlide = newSlide.id;
            s.lastAddedSlideId = newSlide.id;
          }),

        addSlidesToPresentation: ({ slides, position }) =>
          set((s) => {
            devLog('addSlidesToPresentation');
            if (!slides || slides.length === 0) return;

            const insertPosition =
              position !== undefined ? position : s.slides.length;

            // Insert all slides at the specified position
            s.slides.splice(insertPosition, 0, ...slides);

            // Reorder all slides
            s.slides = s.slides.map((sl, idx) => ({ ...sl, order: idx + 1 }));

            // Set selected slide to the first added slide
            s.selectedSlide = slides[0].id;
            s.lastAddedSlideId = slides[0].id;
          }),

        addSlideToPresentation: (slide) =>
          set((s) => {
            devLog('addSlideToPresentation');
            const clash = s.slides.some((sl) => sl.order === slide.order);
            if (clash) {
              s.slides = s.slides
                .sort((a, b) => a.order - b.order)
                .map((sl) => ({ ...sl, order: sl.order + 1 }));
            }
            s.slides.push(slide);
            s.slides = s.slides.sort((a, b) => a.order - b.order);
            s.selectedSlide = slide.id;
          }),

        removeSlide: (slideId) =>
          set((s) => {
            devLog('removeSlide');
            if (s.slides.length === 1) return;
            const idx = s.slides.findIndex((sl) => sl.id === slideId);
            if (idx === -1) return;
            s.slides.splice(idx, 1);
            const prev = idx === 0 ? s.slides[idx] : s.slides[idx - 1];
            s.slides = s.slides.map((sl, i) => ({ ...sl, order: i + 1 }));
            s.selectedSlide = prev?.id ?? s.selectedSlide;
          }),

        duplicateSlide: (slideId) =>
          set((s) => {
            devLog('duplicateSlide');
            const idx = s.slides.findIndex((sl) => sl.id === slideId);
            if (idx === -1) return;
            const original = s.slides[idx];
            const slideUuid = uuidv4();
            const dupElements = original.elements?.map((el) => ({
              ...el,
              id: uuidv4(),
            }));
            const duplicated: Slide = {
              ...original,
              id: slideUuid,
              order: original.order + 1,
              elements: dupElements,
            };
            s.slides.splice(idx + 1, 0, duplicated);
            s.slides = s.slides.map((sl, i) => ({ ...sl, order: i + 1 }));
          }),

        reorderSlides: ({ fromIndex, toIndex }) =>
          set((s) => {
            devLog('reorderSlides');
            if (
              fromIndex === toIndex ||
              fromIndex < 0 ||
              toIndex < 0 ||
              fromIndex >= s.slides.length ||
              toIndex > s.slides.length
            )
              return;
            const moved = s.slides.splice(fromIndex, 1)[0];
            s.slides.splice(toIndex, 0, moved);
            s.slides = s.slides.map((sl, i) => ({ ...sl, order: i + 1 }));
          }),

        moveSlideUpwards: (slideId) =>
          set((s) => {
            devLog('moveSlideUpwards');
            const idx = s.slides.findIndex((sl) => sl.id === slideId);
            if (idx <= 0) return;
            const tmp = s.slides[idx - 1];
            s.slides[idx - 1] = s.slides[idx];
            s.slides[idx] = tmp;
            s.slides = s.slides.map((sl, i) => ({ ...sl, order: i + 1 }));
          }),

        moveSlideDownwards: (slideId) =>
          set((s) => {
            devLog('moveSlideDownwards');
            const idx = s.slides.findIndex((sl) => sl.id === slideId);
            if (idx === -1 || idx === s.slides.length - 1) return;
            const tmp = s.slides[idx + 1];
            s.slides[idx + 1] = s.slides[idx];
            s.slides[idx] = tmp;
            s.slides = s.slides.map((sl, i) => ({ ...sl, order: i + 1 }));
          }),

        setSelectedSlide: (slideId) =>
          set((s) => {
            devLog('setSelectedSlide');
            s.selectedSlide = slideId;
          }),

        updateSlideBackground: ({ slideId, backgroundColor }) =>
          set((s) => {
            devLog('updateSlideBackground');
            const slide = s.slides.find((sl) => sl.id === slideId);
            if (!slide) return;
            slide.themeSettings.backgroundColor = backgroundColor;
          }),

        updateAllSlidesBackground: (color) =>
          set((s) => {
            devLog('updateAllSlidesBackground');
            s.slides.forEach(
              (sl) => (sl.themeSettings.backgroundColor = color)
            );
          }),

        updateSlideContent: (p) =>
          set((s) => {
            devLog('updateSlideContent');
            const idx = s.slides.findIndex((sl) => sl.id === p.slideId);
            if (idx === -1) return;
            const { slideId: _, ...newSlide } = p;
            const slide = s.slides[idx];
            s.slides[idx] = {
              ...slide,
              ...newSlide,
              id: p.slideId,
              themeSettings: {
                ...slide.themeSettings,
                ...newSlide.themeSettings,
              },
            };
          }),

        /** -------- Media / BG -------- */
        setSlideImageBackground: (src) =>
          set((s) => {
            devLog('setSlideImageBackground');
            const slide = s.slides.find((sl) => sl.id === s.selectedSlide);
            if (!slide) return;
            const image = slide.elements?.find(
              (e) => e.subtype === SlideImageElementsVariants.BACKGROUND_IMAGE
            ) as SlideImage;
            if (!image) {
              const newImage: SlideImage = {
                id: uuidv4(),
                x: 0,
                y: 0,
                width: slide.themeSettings?.width ?? 1920,
                height: slide.themeSettings?.height ?? 1080,
                type: SlideElementBaseTypes.IMAGE,
                subtype: SlideImageElementsVariants.BACKGROUND_IMAGE,
                src,
                options: { isVisible: true, label: 'Imagem de fundo' },
              };
              if (!Array.isArray(slide.elements)) slide.elements = [];
              slide.elements.unshift(newImage);
            } else {
              image.src = src;
            }
          }),

        deleteSlideImageBackground: () =>
          set((s) => {
            devLog('deleteSlideImageBackground');
            const slide = s.slides.find((sl) => sl.id === s.selectedSlide);
            if (!slide) return;
            slide.elements = slide.elements?.filter(
              (e) => e.subtype !== SlideImageElementsVariants.BACKGROUND_IMAGE
            );
          }),

        updateSlideMedia: ({ slideUuid, mediaUuid, src }) =>
          set((s) => {
            devLog('updateSlideMedia');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const media = slide.elements?.find((e) => e.id === mediaUuid) as
              | SlideImage
              | SlideVideo;
            if (!media) return;
            media.src = src;
          }),

        /** -------- Add Elements -------- */
        addParagraphElement: ({ text }) =>
          set((s) => {
            devLog('addParagraphElement');
            const slide = s.slides.find((sl) => sl.id === s.selectedSlide);
            if (!slide) return;
            const slideWidth = slide.themeSettings?.width ?? 1920;
            const fontSize = slideWidth > 1264 ? 34 : 16;

            const el: SlideText = {
              id: v4(),
              type: SlideElementBaseTypes.TEXT,
              subtype: SlideTextElementsVariants.PARAGRAPH,
              text,
              x: 100,
              y: 100,
              width: 0,
              height: 0,
              fontFamily: 'Quicksand',
              textAlign: TextAlignment.Left,
              fontSize,
              lineHeight: 1.4,
              options: { isVisible: true, label: '' },
            };
            if (!Array.isArray(slide.elements)) slide.elements = [];
            slide.elements.push(el);
            useSlideEditorLayoutStore
              .getState()
              .setTransformingElementId(el.id);
          }),

        addImageElement: ({ src, originalWidth, originalHeight }) =>
          set((s) => {
            devLog('addImageElement');
            const slide = s.slides.find((sl) => sl.id === s.selectedSlide);
            if (!slide) return;

            const slideW = slide.themeSettings?.width ?? 1920;
            const slideH = slide.themeSettings?.height ?? 1080;

            let imageWidth = 0;
            let imageHeight = 0;
            if (originalWidth && originalHeight) {
              const ar = originalWidth / originalHeight;
              imageWidth = slideW * 0.33;
              imageHeight = imageWidth / ar;
              if (imageHeight > slideH) {
                imageHeight = slideH * 0.9;
                imageWidth = imageHeight * ar;
              }
            } else {
              imageWidth = slideW * 0.33;
              imageHeight = imageWidth * (3 / 4);
              if (imageHeight > slideH) {
                imageHeight = slideH * 0.9;
                imageWidth = imageHeight * (3 / 4);
              }
            }

            const x = (slideW - imageWidth) / 2;
            const y = (slideH - imageHeight) / 2;

            const el: SlideImage = {
              id: v4(),
              type: SlideElementBaseTypes.IMAGE,
              subtype: SlideImageElementsVariants.IMAGE,
              src,
              isUploading: false,
              options: { isVisible: true, label: 'Imagem' },
              width: imageWidth,
              height: imageHeight,
              x,
              y,
            };
            if (!Array.isArray(slide.elements)) slide.elements = [];
            slide.elements.push(el);
            useSlideEditorLayoutStore
              .getState()
              .setTransformingElementId(el.id);
          }),

        setImageUploading: ({ slideUuid, elementUuid, isUploading }) =>
          set((s) => {
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide || !slide.elements) return;
            const el = slide.elements.find((e) => e.id === elementUuid);
            if (!el || el.type !== SlideElementBaseTypes.IMAGE) return;
            (el as SlideImage).isUploading = isUploading;
          }),

        addGifElement: ({ src, originalWidth, originalHeight, title }) =>
          set((s) => {
            devLog('addGifElement');
            const slide = s.slides.find((sl) => sl.id === s.selectedSlide);
            if (!slide) return;

            const slideW = slide.themeSettings?.width ?? 1920;
            const slideH = slide.themeSettings?.height ?? 1080;

            let gifWidth = 0;
            let gifHeight = 0;
            if (originalWidth && originalHeight) {
              const ar = originalWidth / originalHeight;
              gifWidth = slideW * 0.33;
              gifHeight = gifWidth / ar;
              if (gifHeight > slideH) {
                gifHeight = slideH * 0.9;
                gifWidth = gifHeight * ar;
              }
            } else {
              gifWidth = slideW * 0.33;
              gifHeight = gifWidth * (3 / 4);
              if (gifHeight > slideH) {
                gifHeight = slideH * 0.9;
                gifWidth = gifHeight * (3 / 4);
              }
            }

            const x = (slideW - gifWidth) / 2;
            const y = (slideH - gifHeight) / 2;

            const el: SlideImage = {
              id: v4(),
              type: SlideElementBaseTypes.IMAGE,
              subtype: SlideImageElementsVariants.GIF,
              src,
              options: { isVisible: true, label: title || 'GIF' },
              width: gifWidth,
              height: gifHeight,
              x,
              y,
            };
            if (!Array.isArray(slide.elements)) slide.elements = [];
            slide.elements.push(el);
            useSlideEditorLayoutStore
              .getState()
              .setTransformingElementId(el.id);
          }),

        addVideoElement: ({ src }) =>
          set((s) => {
            devLog('addVideoElement');
            const slide = s.slides.find((sl) => sl.id === s.selectedSlide);
            if (!slide) return;

            const slideW = slide.themeSettings?.width ?? 1920;
            const slideH = slide.themeSettings?.height ?? 1080;
            const videoWidth = slideW * 0.33;
            const videoHeight = videoWidth * (9 / 16);
            const x = (slideW - videoWidth) / 2;
            const y = (slideH - videoHeight) / 2;

            const el: SlideVideo = {
              id: v4(),
              type: SlideElementBaseTypes.VIDEO,
              subtype: SlideVideoElementsVariants.VIDEO,
              src,
              options: { isVisible: true, label: 'Video' },
              width: videoWidth,
              height: videoHeight,
              x,
              y,
            };
            if (!Array.isArray(slide.elements)) slide.elements = [];
            slide.elements.push(el);
            useSlideEditorLayoutStore
              .getState()
              .setTransformingElementId(el.id);
          }),

        addShapeElement: ({ type }) =>
          set((s) => {
            devLog('addShapeElement');
            const slide = s.slides.find((sl) => sl.id === s.selectedSlide);
            if (!slide) return;

            const shape: SlideShape | SlideLineShape = {
              id: uuidv4(),
              type: SlideElementBaseTypes.SHAPE,
              ...(type === SlideShapeElementsVariants.LINE && {
                points: [0, 0, 100, 0],
              }),
              subtype: type,
              x: 100,
              y: 100,
              width: 100,
              height: type === SlideShapeElementsVariants.LINE ? 1 : 100,
              fillColor: '#80A1FF',
              options: { isVisible: true, label: type },
            };
            if (!Array.isArray(slide.elements)) slide.elements = [];
            slide.elements.push(shape);
            useSlideEditorLayoutStore
              .getState()
              .setTransformingElementId(shape.id);
          }),

        addTableElement: ({ rows = 3, cols = 3, data }) =>
          set((s) => {
            devLog('addTableElement');
            const slide = s.slides.find((sl) => sl.id === s.selectedSlide);
            if (!slide) return;

            const currentTheme = detectCurrentTheme(s);
            const tableData =
              data ||
              Array(rows)
                .fill(null)
                .map((_, i) =>
                  Array(cols)
                    .fill(null)
                    .map(
                      (_, j): TableCell => ({
                        value:
                          i === 0
                            ? `Header ${j + 1}`
                            : `Cell ${i + 1},${j + 1}`,
                        fontSize: i === 0 ? 24 : 22,
                        fontFamily: 'Quicksand',
                        fontWeight: i === 0 ? 'bold' : 'normal',
                        textAlign: TextAlignment.Center,
                        verticalAlign: VerticalAlignment.Center,
                        color:
                          i === 0
                            ? currentTheme.table.headerTextColor
                            : currentTheme.table.textColor,
                        backgroundColor:
                          i === 0
                            ? currentTheme.table.headerBackgroundColor
                            : currentTheme.table.cellBackgroundColor,
                      })
                    )
                );

            const slideW = slide.themeSettings?.width ?? 1920;
            const slideH = slide.themeSettings?.height ?? 1080;
            const tableWidth = slideW * 0.65;
            const tableHeight = slideH * 0.5;

            const defaultColumnWidth = tableWidth / cols;
            const columnWidths = Array(cols).fill(defaultColumnWidth);

            const defaultRowHeight = tableHeight / rows;
            const rowHeights = Array(rows).fill(defaultRowHeight);

            const x = (slideW - tableWidth) / 2;
            const y = (slideH - tableHeight) / 2;

            const el: SlideTable = {
              id: v4(),
              type: SlideElementBaseTypes.TABLE,
              subtype: SlideTableElementsVariants.TABLE,
              content: {
                rows,
                cols,
                data: tableData,
                rowHeights,
                columnWidths,
              },
              options: { isVisible: true, label: 'Table' },
              width: tableWidth,
              height: tableHeight,
              x,
              y,
              borderColor: currentTheme.table.headerTextColor,
              defaultRowHeight,
              defaultColumnWidth,
              headerStyle: {
                fontWeight: 'bold',
                textAlign: TextAlignment.Center,
                fontSize: 24,
                fontFamily: 'Quicksand',
                color: currentTheme.table.headerTextColor,
              },
              defaultCellStyle: {
                fontSize: 22,
                fontFamily: 'Quicksand',
                color: currentTheme.table.textColor,
              },
            };
            if (!Array.isArray(slide.elements)) slide.elements = [];
            slide.elements.push(el);
            useSlideEditorLayoutStore
              .getState()
              .setTransformingElementId(el.id);
          }),

        addElementToSlide: (payload) =>
          set((s) => {
            devLog('addElementToSlide');
            const slide = s.slides.find((sl) => sl.id === s.selectedSlide);
            if (!slide) return;
            const { pastePosition, ...element } = payload;
            const providedId = (element as any).id as string | undefined;
            const providedIsTransforming = (element as any).isTransforming as
              | boolean
              | undefined;

            const id = providedId || uuidv4();
            if (!Array.isArray(slide.elements)) slide.elements = [];
            slide.elements.unshift({
              ...element,
              id,
              ...(pastePosition && { x: pastePosition.x, y: pastePosition.y }),
            } as SlideElement);

            if (providedIsTransforming) {
              useSlideEditorLayoutStore.getState().setTransformingElementId(id);
            }
          }),

        removeElement: ({ slideUuid, elementUuid }) =>
          set((s) => {
            devLog('removeElement');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            slide.elements = slide.elements?.filter(
              (e) => e.id !== elementUuid
            );
          }),

        removeElementsBulk: ({ slideUuid, elementUuids }) =>
          set((s) => {
            devLog('removeElementsBulk');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const ids = new Set(elementUuids);
            slide.elements = slide.elements?.filter((e) => !ids.has(e.id));
          }),

        moveElementLayerUpwards: ({ slideUuid, elementUuid }) =>
          set((s) => {
            devLog('moveElementLayerUpwards');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide || !slide.elements) return;
            const idx = slide.elements.findIndex((e) => e.id === elementUuid);
            if (idx === -1 || idx === slide.elements.length - 1) return;
            const tmp = slide.elements[idx];
            slide.elements[idx] = slide.elements[idx + 1];
            slide.elements[idx + 1] = tmp;
          }),

        moveElementLayerDownwards: ({ slideUuid, elementUuid }) =>
          set((s) => {
            devLog('moveElementLayerDownwards');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide || !slide.elements) return;
            const idx = slide.elements.findIndex((e) => e.id === elementUuid);
            if (idx <= 0) return;
            const tmp = slide.elements[idx];
            slide.elements[idx] = slide.elements[idx - 1];
            slide.elements[idx - 1] = tmp;
          }),

        bringElementToFront: ({ slideUuid, elementUuid }) =>
          set((s) => {
            devLog('bringElementToFront');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide || !slide.elements) return;
            const idx = slide.elements.findIndex((e) => e.id === elementUuid);
            if (idx === -1) return;
            const el = slide.elements.splice(idx, 1)[0];
            slide.elements.push(el);
          }),

        sendElementToBack: ({ slideUuid, elementUuid }) =>
          set((s) => {
            devLog('sendElementToBack');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide || !slide.elements) return;
            const idx = slide.elements.findIndex((e) => e.id === elementUuid);
            if (idx === -1) return;
            const el = slide.elements.splice(idx, 1)[0];
            slide.elements.unshift(el);
          }),

        /** -------- Element flags / transform / position -------- */
        setSlideElementPosition: (p) =>
          set((s) => {
            devLog('setSlideElementPosition');
            handleSlideElementPosition(s, p);
          }),
        commitSlideElementPosition: (p) =>
          set((s) => {
            devLog('commitSlideElementPosition');
            handleSlideElementPosition(s, p);
          }),

        commitSlideElementsPositionBulk: ({ slideUuid, updates }) =>
          set((s) => {
            devLog('commitSlideElementsPositionBulk');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide || !slide.elements || !updates?.length) return;
            const byId = new Map(updates.map((u) => [u.elementUuid, u]));
            slide.elements.forEach((el) => {
              const upd = byId.get(el.id);
              if (upd) {
                el.x = upd.x;
                el.y = upd.y;
              }
            });
          }),

        setSlideElementSizes: (p) =>
          set((s) => {
            devLog('setSlideElementSizes');
            handleSlideElementSizes(s, p);
          }),
        commitSlideElementSizes: (p) =>
          set((s) => {
            devLog('commitSlideElementSizes');
            handleSlideElementSizes(s, p);
          }),

        setSlideElementHeight: ({ slideUuid, elementUuid, height }) =>
          set((s) => {
            devLog('setSlideElementHeight');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const el = slide.elements?.find((e) => e.id === elementUuid);
            if (!el) return;

            el.height = height;
            if (el.type === SlideElementBaseTypes.TABLE) {
              const table = el as SlideTable;
              const rows = table.content.rows;
              if (rows > 0) {
                const newRowHeight = height / rows;
                table.content.rowHeights = Array(rows).fill(newRowHeight);
                table.defaultRowHeight = newRowHeight;
              }
            }
          }),

        setSlideElementWidth: ({ slideUuid, elementUuid, width }) =>
          set((s) => {
            devLog('setSlideElementWidth');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const el = slide.elements?.find((e) => e.id === elementUuid);
            if (!el) return;

            el.width = width;
            if (el.type === SlideElementBaseTypes.TABLE) {
              const table = el as SlideTable;
              const cols = table.content.cols;
              if (cols > 0) {
                const newColWidth = width / cols;
                table.content.columnWidths = Array(cols).fill(newColWidth);
                table.defaultColumnWidth = newColWidth;
              }
            }
          }),

        moveElementTowards: ({ slideUuid, elementUuid, direction }) =>
          set((s) => {
            devLog('moveElementTowards');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const el = slide.elements?.find((e) => e.id === elementUuid);
            if (!el) return;

            if (direction === 'up') el.y -= 1;
            if (direction === 'down') el.y += 1;
            if (direction === 'left') el.x -= 1;
            if (direction === 'right') el.x += 1;
          }),

        /** -------- Text / Quiz -------- */
        updateText: ({ slideUuid, textId, text }) =>
          set((s) => {
            devLog('updateText');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const t = slide.elements?.find((e) => e.id === textId) as SlideText;
            if (!t) return;
            t.text = text;
          }),

        updateTextFormat: ({ slideUuid, elementUuid, format }) =>
          set((s) => {
            devLog('updateTextFormat');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const t = slide.elements?.find(
              (e) =>
                e.id === elementUuid && e.type === SlideElementBaseTypes.TEXT
            ) as SlideText | undefined;
            if (!t) return;

            if (format.textAlign !== undefined) t.textAlign = format.textAlign;
            if (format.fontSize !== undefined) t.fontSize = format.fontSize;
            if (format.fontFamily !== undefined)
              t.fontFamily = format.fontFamily;
            if (format.width !== undefined) t.width = format.width;
            if (format.height !== undefined) t.height = format.height;
          }),

        updateQuiz: ({ slideId, quizId, attr, value }) =>
          set((s) => {
            devLog('updateQuiz');
            const slide = s.slides.find((sl) => sl.id === slideId);
            if (!slide) return;
            const quiz = slide.elements?.find(
              (e) => e.id === quizId
            ) as SlideInteractiveMultipleChoice;
            if (!quiz) return;
            if (attr in quiz) {
              (quiz as any)[attr] = value as any;
            }
          }),

        /** -------- Tables -------- */
        updateTableCell: (p) =>
          set((s) => {
            devLog('updateTableCell');
            const slide = s.slides.find((sl) => sl.id === p.slideUuid);
            if (!slide) return;
            const table = slide.elements?.find(
              (e) => e.id === p.elementUuid
            ) as SlideTable;
            if (!table || table.type !== SlideElementBaseTypes.TABLE) return;

            const {
              rowIndex,
              colIndex,
              value,
              fontSize,
              fontFamily,
              fontWeight,
              color,
              backgroundColor,
              textAlign,
              verticalAlign,
              bold,
              italic,
              underline,
            } = p;

            if (
              rowIndex >= 0 &&
              rowIndex < table.content.data.length &&
              colIndex >= 0 &&
              colIndex < table.content.data[rowIndex].length
            ) {
              const row = table.content.data[rowIndex];
              const cell = row[colIndex];
              const updated = {
                ...cell,
                ...(value !== undefined ? { value } : {}),
                ...(fontSize !== undefined ? { fontSize } : {}),
                ...(fontFamily !== undefined ? { fontFamily } : {}),
                ...(fontWeight !== undefined ? { fontWeight } : {}),
                ...(color !== undefined ? { color } : {}),
                ...(backgroundColor !== undefined ? { backgroundColor } : {}),
                ...(textAlign !== undefined ? { textAlign } : {}),
                ...(verticalAlign !== undefined ? { verticalAlign } : {}),
                ...(bold !== undefined ? { bold } : {}),
                ...(italic !== undefined ? { italic } : {}),
                ...(underline !== undefined ? { underline } : {}),
              } as TableCell;

              const newRow = [...row];
              newRow[colIndex] = updated;
              const newData = [...table.content.data];
              newData[rowIndex] = newRow;
              table.content.data = newData;
            }
          }),

        addTableRow: ({ slideUuid, elementUuid, atIndex }) =>
          set((s) => {
            devLog('addTableRow');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const table = slide.elements?.find(
              (e) => e.id === elementUuid
            ) as SlideTable;
            if (!table || table.type !== SlideElementBaseTypes.TABLE) return;

            const currentTheme = detectCurrentTheme(s);
            const insertIndex =
              atIndex !== undefined ? atIndex : table.content.data.length;

            const newRow = Array(table.content.cols)
              .fill(null)
              .map(
                (): TableCell => ({
                  value: '',
                  fontSize: table.defaultCellStyle?.fontSize || 12,
                  fontFamily: table.defaultCellStyle?.fontFamily || 'Quicksand',
                  color: currentTheme.table.textColor,
                  backgroundColor: currentTheme.table.backgroundColor,
                  textAlign: TextAlignment.Center,
                  verticalAlign: VerticalAlignment.Center,
                })
              );

            table.content.data.splice(insertIndex, 0, newRow);

            const newRowHeight = table.defaultRowHeight || 40;
            if (!table.content.rowHeights) {
              table.content.rowHeights = Array(table.content.rows).fill(
                newRowHeight
              );
            }
            table.content.rowHeights.splice(insertIndex, 0, newRowHeight);
            table.content.rows = table.content.data.length;

            const totalHeight = table.content.rowHeights.reduce(
              (sum, h) => sum + h,
              0
            );
            table.height = totalHeight;
          }),

        removeTableRow: ({ slideUuid, elementUuid, rowIndex }) =>
          set((s) => {
            devLog('removeTableRow');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const table = slide.elements?.find(
              (e) => e.id === elementUuid
            ) as SlideTable;
            if (!table || table.type !== SlideElementBaseTypes.TABLE) return;

            if (
              table.content.rows > 1 &&
              rowIndex >= 0 &&
              rowIndex < table.content.data.length
            ) {
              table.content.data.splice(rowIndex, 1);
              if (
                table.content.rowHeights &&
                rowIndex < table.content.rowHeights.length
              ) {
                table.content.rowHeights.splice(rowIndex, 1);
              }
              table.content.rows = table.content.data.length;

              if (table.content.rowHeights?.length) {
                const totalHeight = table.content.rowHeights.reduce(
                  (sum, h) => sum + h,
                  0
                );
                table.height = totalHeight;
              }
            }
          }),

        addTableColumn: ({ slideUuid, elementUuid, atIndex }) =>
          set((s) => {
            devLog('addTableColumn');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const table = slide.elements?.find(
              (e) => e.id === elementUuid
            ) as SlideTable;
            if (!table || table.type !== SlideElementBaseTypes.TABLE) return;

            const currentTheme = detectCurrentTheme(s);
            const insertIndex =
              atIndex !== undefined ? atIndex : table.content.cols;

            table.content.data.forEach((row, rIdx) => {
              const isHeader = rIdx === 0;
              const newCell: TableCell = {
                value: '',
                fontSize: isHeader
                  ? 24
                  : table.defaultCellStyle?.fontSize || 12,
                fontFamily: table.defaultCellStyle?.fontFamily || 'Quicksand',
                color: isHeader
                  ? currentTheme.table.headerTextColor
                  : currentTheme.table.textColor,
                backgroundColor: isHeader
                  ? currentTheme.table.headerBackgroundColor
                  : currentTheme.table.backgroundColor,
                textAlign: TextAlignment.Center,
                verticalAlign: VerticalAlignment.Center,
                fontWeight: isHeader ? 'bold' : 'normal',
              };
              row.splice(insertIndex, 0, newCell);
            });

            const newColumnWidth = table.defaultColumnWidth || 100;
            if (!table.content.columnWidths) {
              table.content.columnWidths = Array(table.content.cols).fill(
                newColumnWidth
              );
            }
            table.content.columnWidths.splice(insertIndex, 0, newColumnWidth);

            table.content.cols += 1;
            table.width = table.content.columnWidths.reduce(
              (sum, w) => sum + w,
              0
            );
          }),

        removeTableColumn: ({ slideUuid, elementUuid, colIndex }) =>
          set((s) => {
            devLog('removeTableColumn');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const table = slide.elements?.find(
              (e) => e.id === elementUuid
            ) as SlideTable;
            if (!table || table.type !== SlideElementBaseTypes.TABLE) return;

            if (
              table.content.cols > 1 &&
              colIndex >= 0 &&
              colIndex < table.content.cols
            ) {
              table.content.data.forEach((row) => {
                if (colIndex < row.length) row.splice(colIndex, 1);
              });
              if (
                table.content.columnWidths &&
                colIndex < table.content.columnWidths.length
              ) {
                table.content.columnWidths.splice(colIndex, 1);
              }
              table.content.cols -= 1;

              if (table.content.columnWidths?.length) {
                table.width = table.content.columnWidths.reduce(
                  (sum, w) => sum + w,
                  0
                );
              }
            }
          }),

        updateTableContent: ({ slideUuid, elementUuid, content }) =>
          set((s) => {
            devLog('updateTableContent');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const table = slide.elements?.find(
              (e) => e.id === elementUuid
            ) as SlideTable;
            if (!table || table.type !== SlideElementBaseTypes.TABLE) return;
            table.content = content;
          }),

        updateTableStyle: ({
          slideUuid,
          elementUuid,
          borderColor,
          backgroundColor,
          headerStyle,
        }) =>
          set((s) => {
            devLog('updateTableStyle');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const table = slide.elements?.find(
              (e) => e.id === elementUuid
            ) as SlideTable;
            if (!table || table.type !== SlideElementBaseTypes.TABLE) return;

            if (borderColor !== undefined) table.borderColor = borderColor;
            if (backgroundColor !== undefined)
              (table as any).backgroundColor = backgroundColor;
            if (headerStyle !== undefined)
              table.headerStyle = { ...table.headerStyle, ...headerStyle };
          }),

        updateTableRowHeight: ({ slideUuid, elementUuid, rowIndex, height }) =>
          set((s) => {
            devLog('updateTableRowHeight');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const table = slide.elements?.find(
              (e) => e.id === elementUuid
            ) as SlideTable;
            if (!table || table.type !== SlideElementBaseTypes.TABLE) return;

            if (
              rowIndex >= 0 &&
              rowIndex < table.content.rows &&
              table.content.rowHeights
            ) {
              table.content.rowHeights[rowIndex] = height;
              table.height = table.content.rowHeights.reduce(
                (sum, h) => sum + h,
                0
              );
            }
          }),

        updateTableColumnWidth: ({
          slideUuid,
          elementUuid,
          columnIndex,
          width,
        }) =>
          set((s) => {
            devLog('updateTableColumnWidth');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const table = slide.elements?.find(
              (e) => e.id === elementUuid
            ) as SlideTable;
            if (!table || table.type !== SlideElementBaseTypes.TABLE) return;

            if (
              columnIndex >= 0 &&
              columnIndex < table.content.cols &&
              table.content.columnWidths
            ) {
              table.content.columnWidths[columnIndex] = width;
              table.width = table.content.columnWidths.reduce(
                (sum, w) => sum + w,
                0
              );
            }
          }),

        /** -------- Theme / Color / Misc -------- */
        setBackgroundColor: (color) =>
          set((s) => {
            devLog('setBackgroundColor');
            const slide = s.slides.find((sl) => sl.id === s.selectedSlide);
            if (!slide) return;
            slide.themeSettings.backgroundColor = color;
          }),

        applyThemeToAllSlides: (theme) =>
          set((s) => {
            devLog('applyThemeToAllSlides');
            s.logo_path = theme.logo_path ?? '/images/icons/lara-icon-talk.svg';
            // Update current theme
            s.currentTheme = theme;
            // Clear custom theme when a predefined theme is applied
            s.customTheme = undefined;

            s.slides.forEach((slide) => {
              // Mapear o slideType para as cores correspondentes do tema
              const themeColors = getThemeColors(slide, theme);

              // Aplicar cor de fundo e imagem de fundo
              slide.themeSettings.backgroundColor = themeColors.backgroundColor;
              slide.themeSettings.backgroundImage = themeColors.backgroundImage;

              // Apply colors to text elements
              slide.elements?.forEach((element) => {
                if (element.type === SlideElementBaseTypes.TEXT) {
                  const textElement = element as SlideText;

                  // For Agenda Notebook with default theme, use black text
                  const isAgendaNotebookWithDefaultTheme =
                    slide.slideType === SlideThemeType.AGENDA_NOTEBOOK &&
                    theme.name === defaultTheme.name;

                  let titleColor = themeColors.titleColor;
                  let subtitleColor = themeColors.subtitleColor;
                  let paragraphColor = themeColors.paragraphColor;

                  if (isAgendaNotebookWithDefaultTheme || theme == null) {
                    titleColor = '#000000';
                    subtitleColor = '#000000';
                    paragraphColor = '#000000';
                  }

                  const label = textElement.options?.label ?? '';
                  const hasTitleWord = /\btitle\b/i.test(label);
                  const hasSubtitleWord = /\bsubtitle\b/i.test(label);
                  const isTitle =
                    textElement.subtype === SlideTextElementsVariants.TITLE ||
                    hasTitleWord;
                  const isSubtitle =
                    textElement.subtype ===
                      SlideTextElementsVariants.SUBTITLE || hasSubtitleWord;

                  if (!textElement.text) return;

                  if (isTitle) {
                    textElement.text = textElement.text.replace(
                      /color:\s*[^;"]+/g,
                      `color: ${titleColor}`
                    );
                  } else if (isSubtitle) {
                    textElement.text = textElement.text.replace(
                      /color:\s*[^;"]+/g,
                      `color: ${subtitleColor}`
                    );
                  } else {
                    textElement.text = textElement.text.replace(
                      /color:\s*[^;"]+/g,
                      `color: ${paragraphColor}`
                    );
                  }
                } else if (element.type === SlideElementBaseTypes.SHAPE) {
                  const shapeElement = element as SlideShape;
                  // Aplicar cor do tema aos shapes baseado no tipo e dimensões
                  if (shapeElement.options.label === 'Shape Background') {
                    shapeElement.fillColor = themeColors.backgroundColor;
                  } else if (
                    shapeElement.subtype === SlideShapeElementsVariants.CIRCLE
                  ) {
                    // Círculos usam circleColor
                    shapeElement.fillColor = themeColors.circleColor;
                  } else if (
                    shapeElement.subtype ===
                    SlideShapeElementsVariants.RECTANGLE
                  ) {
                    // Verificar se é uma linha (altura ou largura muito pequena)
                    const isLine =
                      shapeElement.height <= 20 || shapeElement.width <= 20;
                    if (isLine) {
                      // Linhas usam lineColor
                      shapeElement.fillColor = themeColors.lineColor;
                    } else {
                      // Retângulos grandes usam rectangleColor
                      shapeElement.fillColor = themeColors.rectangleColor;
                    }
                  } else {
                    // Fallback para outros tipos de shape
                    shapeElement.fillColor = themeColors.shapeColor;
                  }
                } else if (element.type === SlideElementBaseTypes.TABLE) {
                  const tableElement = element as SlideTable;
                  // Apply theme colors to table cells
                  tableElement.content.data.forEach((row, rowIndex) => {
                    row.forEach((cell) => {
                      const isHeader = rowIndex === 0;
                      // Apply theme colors to cells
                      cell.backgroundColor = isHeader
                        ? theme.table.headerBackgroundColor
                        : theme.table.backgroundColor;
                      cell.color = isHeader
                        ? theme.table.headerTextColor
                        : theme.table.textColor;
                    });
                  });

                  // Update table border color to match header text color
                  tableElement.borderColor = theme.table.headerTextColor;

                  // Update header and default cell styles
                  if (tableElement.headerStyle) {
                    tableElement.headerStyle.color =
                      theme.table.headerTextColor;
                  }
                  if (tableElement.defaultCellStyle) {
                    tableElement.defaultCellStyle.color = theme.table.textColor;
                  }
                } else if (
                  element.type === SlideElementBaseTypes.IMAGE &&
                  element.options.label === 'Logo'
                ) {
                  const imageElement = element as SlideImage;
                  imageElement.src =
                    theme.logo_path ?? '/images/icons/lara-icon-talk.svg';
                } else if (
                  element.type === SlideElementBaseTypes.IMAGE &&
                  element.src?.startsWith('data:image/svg+xml')
                ) {
                  const imageElement = element as SlideImage;
                  const dataUrlPrefix = 'data:image/svg+xml;charset=utf-8,';
                  const encodedSvg = imageElement.src.substring(
                    dataUrlPrefix.length
                  );
                  const decodedSvg = decodeURIComponent(encodedSvg);
                  const updatedSvg = decodedSvg.replace(
                    /fill="[^"]*"/g,
                    `fill="${themeColors.rectangleColor}"`
                  );
                  imageElement.src =
                    dataUrlPrefix + encodeURIComponent(updatedSvg);
                }
              });
            });
          }),

        applyFontsToAllSlides: ({ role, fontFamily }) =>
          set((s) => {
            devLog('applyFontsToAllSlides');

            // Store the custom font for persistence
            s.customTheme = {
              ...s.customTheme,
              fonts: {
                ...s.customTheme?.fonts,
                ...(role === 'title' ? { titleFont: fontFamily } : {}),
                ...(role === 'text' ? { textFont: fontFamily } : {}),
              },
            };

            s.slides.forEach((slide) => {
              slide.elements?.forEach((element) => {
                if (element.type !== SlideElementBaseTypes.TEXT) return;
                const textElement = element as SlideText;

                const label = textElement.options?.label ?? '';
                const hasTitleWord = /\btitle\b/i.test(label);
                const hasSubtitleWord = /\bsubtitle\b/i.test(label);

                const isTitleLike =
                  textElement.subtype === SlideTextElementsVariants.TITLE ||
                  hasTitleWord ||
                  hasSubtitleWord;

                const isBodyLike = !isTitleLike;

                if (role === 'title' && isTitleLike) {
                  textElement.fontFamily = fontFamily;
                }

                if (role === 'text' && isBodyLike) {
                  textElement.fontFamily = fontFamily;
                }
              });
            });
          }),

        applyColorModeToAllSlides: ({ colorMode }) =>
          set((s) => {
            devLog('applyColorModeToAllSlides');
            const bgColor =
              colorMode.backgroundColor || colorMode.colors.background;

            s.slides.forEach((slide) => {
              slide.themeSettings.backgroundColor = bgColor;

              slide.elements?.forEach((element) => {
                if (element.type === SlideElementBaseTypes.TEXT) {
                  const textElement = element as SlideText;

                  const label = textElement.options?.label ?? '';
                  const hasTitleWord = /\btitle\b/i.test(label);
                  const hasSubtitleWord = /\bsubtitle\b/i.test(label);

                  const isTitle =
                    textElement.subtype === SlideTextElementsVariants.TITLE ||
                    hasTitleWord;
                  const isSubtitle =
                    textElement.subtype ===
                      SlideTextElementsVariants.SUBTITLE || hasSubtitleWord;

                  const targetColor = isTitle
                    ? colorMode.colors.title
                    : isSubtitle
                      ? colorMode.colors.title
                      : colorMode.colors.text;

                  if (textElement.text) {
                    textElement.text = textElement.text.replace(
                      /color:\s*[^;"]+/g,
                      `color: ${targetColor}`
                    );
                  }
                } else if (element.type === SlideElementBaseTypes.SHAPE) {
                  const shapeElement = element as SlideShape;

                  if (shapeElement.options.label === 'Shape Background') {
                    shapeElement.fillColor = bgColor;
                  } else if (
                    shapeElement.subtype === SlideShapeElementsVariants.CIRCLE
                  ) {
                    shapeElement.fillColor = colorMode.colors.circle;
                  } else if (
                    shapeElement.subtype ===
                    SlideShapeElementsVariants.RECTANGLE
                  ) {
                    const isLine =
                      shapeElement.height <= 20 || shapeElement.width <= 20;
                    shapeElement.fillColor = isLine
                      ? colorMode.colors.line
                      : colorMode.colors.rectangle;
                  } else {
                    shapeElement.fillColor = colorMode.colors.shape;
                  }
                }
              });
            });
          }),

        applyColorPaletteToAllSlides: ({ colorPalette }) =>
          set((s) => {
            devLog('applyColorPaletteToAllSlides');
            const bgColor =
              colorPalette.backgroundColor || colorPalette.colors.background;

            // Store the custom color palette for persistence
            s.customTheme = {
              ...s.customTheme,
              colorPalette: {
                id: colorPalette.id || 'custom',
                name: colorPalette.name || 'Custom',
                colors: colorPalette.colors,
                backgroundColor: colorPalette.backgroundColor,
              },
            };

            s.slides.forEach((slide) => {
              slide.themeSettings.backgroundColor = bgColor;

              slide.elements?.forEach((element) => {
                if (element.type === SlideElementBaseTypes.TEXT) {
                  const textElement = element as SlideText;

                  const label = textElement.options?.label ?? '';
                  const hasTitleWord = /\btitle\b/i.test(label);
                  const hasSubtitleWord = /\bsubtitle\b/i.test(label);

                  const isTitle =
                    textElement.subtype === SlideTextElementsVariants.TITLE ||
                    hasTitleWord;
                  const isSubtitle =
                    textElement.subtype ===
                      SlideTextElementsVariants.SUBTITLE || hasSubtitleWord;

                  const targetColor = isTitle
                    ? colorPalette.colors.title
                    : isSubtitle
                      ? colorPalette.colors.title
                      : colorPalette.colors.text;

                  if (textElement.text) {
                    textElement.text = textElement.text.replace(
                      /color:\s*[^;"]+/g,
                      `color: ${targetColor}`
                    );
                  }
                } else if (element.type === SlideElementBaseTypes.SHAPE) {
                  const shapeElement = element as SlideShape;

                  if (shapeElement.options.label === 'Shape Background') {
                    shapeElement.fillColor = bgColor;
                  } else if (
                    shapeElement.subtype === SlideShapeElementsVariants.CIRCLE
                  ) {
                    shapeElement.fillColor = colorPalette.colors.circle;
                  } else if (
                    shapeElement.subtype ===
                    SlideShapeElementsVariants.RECTANGLE
                  ) {
                    const isLine =
                      shapeElement.height <= 20 || shapeElement.width <= 20;
                    shapeElement.fillColor = isLine
                      ? colorPalette.colors.line
                      : colorPalette.colors.rectangle;
                  } else {
                    shapeElement.fillColor = colorPalette.colors.shape;
                  }
                }
              });
            });
          }),

        setShapeColor: ({ slideUuid, elementUuid, color }) =>
          set((s) => {
            devLog('setShapeColor');
            const slide = s.slides.find((sl) => sl.id === slideUuid);
            if (!slide) return;
            const shape = slide.elements?.find(
              (e) => e.id === elementUuid
            ) as SlideShape;
            if (!shape) return;
            shape.fillColor = color;
          }),

        /** -------- UI helpers -------- */
        setSelectedSlideType: (t) =>
          set((s) => {
            devLog('setSelectedSlideType');
            s.selectedSlideType = t;
          }),
        resetSelectedSlideType: () =>
          set((s) => {
            devLog('resetSelectedSlideType');
            s.selectedSlideType = null;
          }),
      })),
      {
        equality: (pastState, currentState) => {
          return pastState.uuid === null || shallow(pastState, currentState);
        },
      }
    )
  )
);
