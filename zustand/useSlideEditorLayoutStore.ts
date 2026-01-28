import { SlideElement } from '@/components/slidePresentationEditor/types';
import { INTERNAL_ELEMENT_PREFIX } from '@/components/slidePresentationEditor/utils/helpers/slide-utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type SlideEditorLayoutState = {
  headerBarHeight: number;
  subHeaderHeight: number;
  bottomMenuHeight: number;
  floatingElementsMenuHeight: number;
  topbarElementsMenuHeight: number;
  slideScalingDelta: number;
  isPresenting: boolean;
  presentationSlideIndex: number;
  isLoading: boolean;
  loadingMessage: string;
  lastAddedSlideId?: string | null;
  isGenerating: boolean;
  isStreamingFinished: boolean;
  slidesToBeGenerated: number;
  openSidebar: 'theme' | 'fillWithAi' | 'gif' | 'image' | 'quiz' | null;
  contextMenu: {
    visible: boolean;
    position: { x: number; y: number };
    activeElementUuid?: string | null;
    width?: number | null;
  };
  clipboard: {
    element: SlideElement | null;
    elements: SlideElement[];
  };
  lastClickPosition: { x: number; y: number } | null;
  selectedElementUuids: string[];
  editingElementId: string | null;
  transformingElementId: string | null;
  createWithAi: {
    isOpen: boolean;
    position: number | null;
  };
  quizSidebarActiveTab: 'editar' | 'respostas' | 'qrcode';
  quizQrCodeUrl: string;
};

const INITIAL_STATE: SlideEditorLayoutState = {
  headerBarHeight: 0,
  subHeaderHeight: 0,
  bottomMenuHeight: 0,
  floatingElementsMenuHeight: 0,
  topbarElementsMenuHeight: 0,
  slideScalingDelta: 1,
  isPresenting: false,
  presentationSlideIndex: 0,
  isLoading: false,
  loadingMessage: '',
  isGenerating: false,
  isStreamingFinished: false,
  slidesToBeGenerated: 0,
  openSidebar: null,
  contextMenu: {
    visible: false,
    position: { x: 0, y: 0 },
  },
  clipboard: {
    element: null,
    elements: [],
  },
  lastClickPosition: null,
  selectedElementUuids: [],
  editingElementId: null,
  transformingElementId: null,
  createWithAi: {
    isOpen: false,
    position: null,
  },
  quizSidebarActiveTab: 'editar',
  quizQrCodeUrl: '',
};

type Actions = {
  setHeaderBarHeight: (v: number) => void;
  setSubHeaderHeight: (v: number) => void;
  setFloatingElementsMenuHeight: (v: number) => void;
  setTopbarElementsMenuHeight: (v: number) => void;
  setSlideScalingDelta: (v: number) => void;
  openContextMenu: (p: {
    x: number;
    y: number;
    activeElementUuid?: string;
    width?: number;
  }) => void;
  closeContextMenu: () => void;
  startPresentation: (p: {
    selectedSlideId?: string | null;
    slides?: Array<{ id: string }>;
  }) => void;
  exitPresentation: () => void;
  nextSlide: (p: { totalSlides: number }) => void;
  prevSlide: () => void;
  setLoading: (p: { isLoading: boolean; message?: string }) => void;
  setIsGenerating: (v: boolean) => void;
  setIsStreamingFinished: (v: boolean) => void;
  setSlidesToBeGenerated: (v: number) => void;
  copyElementToClipboard: (el: SlideElement) => Promise<void>;
  copyElementsToClipboard: (els: SlideElement[]) => Promise<void>;
  setLastClickPosition: (p: { x: number; y: number }) => void;
  setSelectedElementUuids: (ids: string[]) => void;
  clearSelectedElementUuids: () => void;
  setBottomMenuHeight: (v: number) => void;
  setSlideSidebar: (v: 'theme' | 'fillWithAi' | 'gif' | 'image' | 'quiz' | null) => void;
  closeSlideSidebar: () => void;
  setEditingElementId: (id: string | null) => void;
  setTransformingElementId: (id: string | null) => void;
  unselectAllElements: () => void;
  openCreateWithAi: (payload?: { position: number }) => void;
  closeCreateWithAi: () => void;
  setQuizSidebarActiveTab: (v: 'editar' | 'respostas' | 'qrcode') => void;
  setQuizQrCodeUrl: (v: string) => void;
  resetSlideEditorLayout: () => void;
};

type Store = SlideEditorLayoutState & Actions;

export const useSlideEditorLayoutStore = create<Store>()(
  devtools(
    immer((set) => ({
      ...INITIAL_STATE,
      setHeaderBarHeight: (v) =>
        set((s) => {
          s.headerBarHeight = v;
        }),
      setSubHeaderHeight: (v) =>
        set((s) => {
          s.subHeaderHeight = v;
        }),
      setFloatingElementsMenuHeight: (v) =>
        set((s) => {
          s.floatingElementsMenuHeight = v;
        }),
      setTopbarElementsMenuHeight: (v) =>
        set((s) => {
          s.topbarElementsMenuHeight = v;
        }),
      setSlideScalingDelta: (v) =>
        set((s) => {
          s.slideScalingDelta = v;
        }),
      openContextMenu: ({ x, y, activeElementUuid, width }) =>
        set((s) => {
          s.contextMenu = {
            visible: true,
            position: { x, y },
            activeElementUuid,
            width,
          };
        }),
      closeContextMenu: () =>
        set((s) => {
          s.contextMenu = {
            visible: false,
            position: { x: 0, y: 0 },
            activeElementUuid: null,
            width: null,
          };
        }),
      startPresentation: ({ selectedSlideId, slides }) =>
        set((s) => {
          s.isPresenting = true;
          if (selectedSlideId && slides) {
            const idx = slides.findIndex((sl) => sl.id === selectedSlideId);
            s.presentationSlideIndex = idx >= 0 ? idx : 0;
          } else {
            s.presentationSlideIndex = 0;
          }
        }),
      exitPresentation: () =>
        set((s) => {
          s.isPresenting = false;
        }),
      nextSlide: ({ totalSlides }) =>
        set((s) => {
          if (s.presentationSlideIndex < totalSlides - 1) {
            s.presentationSlideIndex += 1;
          }
        }),
      prevSlide: () =>
        set((s) => {
          if (s.presentationSlideIndex > 0) {
            s.presentationSlideIndex -= 1;
          }
        }),
      setLoading: ({ isLoading, message }) =>
        set((s) => {
          s.isLoading = isLoading;
          s.loadingMessage = message || '';
        }),
      setIsGenerating: (v) =>
        set((s) => {
          s.isGenerating = v;
        }),
      setIsStreamingFinished: (v) =>
        set((s) => {
          s.isStreamingFinished = v;
        }),
      setSlidesToBeGenerated: (v) =>
        set((s) => {
          s.slidesToBeGenerated = v;
        }),
      copyElementToClipboard: async (el) => {
        try {
          const elementsArray = el ? [el] : [];
          const elementsJson = JSON.stringify(elementsArray);
          const clipboardText = INTERNAL_ELEMENT_PREFIX + elementsJson;
          await navigator.clipboard.writeText(clipboardText);
        } catch (err) {
          console.error('Failed to copy element to clipboard:', err);
        }
        set((s) => {
          s.clipboard.element = el;
          s.clipboard.elements = el ? [el] : [];
        });
      },
      copyElementsToClipboard: async (els) => {
        try {
          const elementsArray = els || [];
          const elementsJson = JSON.stringify(elementsArray);
          const clipboardText = INTERNAL_ELEMENT_PREFIX + elementsJson;
          await navigator.clipboard.writeText(clipboardText);
        } catch (err) {
          console.error('Failed to copy elements to clipboard:', err);
        }
        set((s) => {
          s.clipboard.elements = els || [];
          s.clipboard.element = els?.[0] || null;
        });
      },
      setLastClickPosition: ({ x, y }) =>
        set((s) => {
          s.lastClickPosition = { x, y };
        }),
      setSelectedElementUuids: (ids) =>
        set((s) => {
          s.selectedElementUuids = ids || [];
        }),
      clearSelectedElementUuids: () =>
        set((s) => {
          s.selectedElementUuids = [];
        }),
      setBottomMenuHeight: (v) =>
        set((s) => {
          s.bottomMenuHeight = v;
        }),
      setSlideSidebar: (v) =>
        set((s) => {
          s.openSidebar = v;
        }),
      closeSlideSidebar: () =>
        set((s) => {
          s.openSidebar = null;
          s.quizSidebarActiveTab = 'editar';
        }),
      setEditingElementId: (id) =>
        set((s) => {
          s.editingElementId = id;
        }),
      setTransformingElementId: (id) =>
        set((s) => {
          s.transformingElementId = id;
        }),
      unselectAllElements: () =>
        set((s) => {
          s.editingElementId = null;
          s.transformingElementId = null;
        }),
      openCreateWithAi: (payload?: { position: number }) =>
        set((s) => {
          s.createWithAi.isOpen = true;
          s.createWithAi.position = payload?.position || null;
        }),
      closeCreateWithAi: () =>
        set((s) => {
          s.createWithAi.isOpen = false;
          s.createWithAi.position = null;
        }),
      setQuizSidebarActiveTab: (v) =>
        set((s) => {
          s.quizSidebarActiveTab = v;
        }),
      setQuizQrCodeUrl: (v) =>
        set((s) => {
          s.quizQrCodeUrl = v;
        }),
      resetSlideEditorLayout: () => set(() => INITIAL_STATE),
    }))
  )
);
