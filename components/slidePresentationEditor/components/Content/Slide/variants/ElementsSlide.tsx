import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { slideEditorImageLoader } from '@/misc-utils';
import { memo, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Slide, { SlideProps } from '..';
import {
  SlideElement,
  SlideElementBaseTypes,
  SlideImageElementsVariants,
  SlideInteractiveMultipleChoice,
  SlideLineShape,
  SlideTextElementsVariants,
  SlideVariants,
} from '../../../../types';
import SlideImage from '../../elements/Image';
import BackgroundImage from '../../elements/Image/BackgroundImage';
import SlideShape from '../../elements/Shape';
import TextBlock from '../../elements/TextBlock';
import SlideVideo from '../../elements/Video';
import SlideTable from '../../elements/Table';
import InteractiveMultipleChoice from '../../elements/interactive/InteractiveMultipleChoice';
import { useShallow } from 'zustand/react/shallow';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import {
  hasInternalElementInClipboard,
  getInternalElementFromClipboard,
} from '../../../../hooks/useSlidePaste';
import { INTERNAL_ELEMENT_PREFIX } from '../../../../utils/helpers/slide-utils';

type ElementsSlideProps = SlideProps & {
  isViewOnly?: boolean;
};

const useElementsSlide = (props: ElementsSlideProps) => {
  const { slideUuid, isPreview, isViewOnly } = props;

  const addElementToSlide = useSlidePresentationEditorStore(
    (state) => state.addElementToSlide
  );
  const isSlideSelected = useSlidePresentationEditorStore(
    (state) => state.selectedSlide === slideUuid
  );
  const editingElementId = useSlideEditorLayoutStore(
    (state) => state.editingElementId
  );
  const isTextElementBeingEdited = useSlidePresentationEditorStore((state) =>
    state.slides
      .find((slide) => slide.id === slideUuid)
      ?.elements?.some(
        (element) =>
          element.type === SlideElementBaseTypes.TEXT &&
          element.id === editingElementId
      )
  );

  const { undo, redo, pastStates, futureStates } =
    useSlidePresentationEditorStore.temporal.getState();
  const isUndoEnabled = pastStates.length > 0;
  const isRedoEnabled = futureStates.length > 0;

  const shouldActivateKeyboardActions =
    isSlideSelected && !isPreview && !isViewOnly;

  const lastClickPosition = useSlideEditorLayoutStore(
    (state) => state.lastClickPosition
  );
  const setSelectedElementUuids = useSlideEditorLayoutStore(
    (state) => state.setSelectedElementUuids
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!shouldActivateKeyboardActions) return;

      const isCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isCmd && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (isRedoEnabled) redo();
        } else {
          if (isUndoEnabled) undo();
        }
        return;
      }

      if (isCmd && key === 'y') {
        e.preventDefault();
        if (isRedoEnabled) redo();
        return;
      }
    },
    [shouldActivateKeyboardActions, isUndoEnabled, isRedoEnabled, undo, redo]
  );

  useEffect(() => {
    if (!shouldActivateKeyboardActions) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldActivateKeyboardActions, handleKeyDown]);

  useEffect(() => {
    if (!shouldActivateKeyboardActions) return;

    const onPaste = async (e: ClipboardEvent) => {
      if (isTextElementBeingEdited) return;

      const cd = e.clipboardData;
      if (!cd) return;

      const hasInternalElement = hasInternalElementInClipboard(e);
      if (!hasInternalElement) return;

      let clipboardData: SlideElement | SlideElement[] | null =
        await getInternalElementFromClipboard();
      if (!clipboardData) {
        const text = cd.getData('text/plain');
        if (text?.startsWith(INTERNAL_ELEMENT_PREFIX)) {
          const jsonText = text.slice(INTERNAL_ELEMENT_PREFIX.length);
          try {
            const parsed = JSON.parse(jsonText);
            clipboardData = Array.isArray(parsed)
              ? (parsed as SlideElement[])
              : (parsed as SlideElement);
          } catch {
            return;
          }
        } else {
          return;
        }
      }

      e.preventDefault();

      if (Array.isArray(clipboardData) && clipboardData.length > 0) {
        const anchor = clipboardData[0];
        const baseX = anchor.x;
        const baseY = anchor.y;
        const anchorPasteX = lastClickPosition?.x ?? baseX;
        const anchorPasteY = lastClickPosition?.y ?? baseY;
        const dx = anchorPasteX - baseX;
        const dy = anchorPasteY - baseY;

        const newIds: string[] = [];
        clipboardData.forEach((el) => {
          const pastePosition = { x: el.x + dx, y: el.y + dy };
          const newId = uuidv4();
          newIds.push(newId);
          addElementToSlide({
            ...el,
            id: newId,
            pastePosition,
          } as Parameters<typeof addElementToSlide>[0]);
        });
        if (newIds.length > 0) setSelectedElementUuids(newIds);
        return;
      }

      if (clipboardData && !Array.isArray(clipboardData)) {
        const newId = uuidv4();
        addElementToSlide({
          ...clipboardData,
          id: newId,
          ...(lastClickPosition && { pastePosition: lastClickPosition }),
        } as Parameters<typeof addElementToSlide>[0]);
        setSelectedElementUuids([newId]);
      }
    };

    window.addEventListener('paste', onPaste as unknown as EventListener);
    return () =>
      window.removeEventListener('paste', onPaste as unknown as EventListener);
  }, [
    shouldActivateKeyboardActions,
    isTextElementBeingEdited,
    lastClickPosition,
    addElementToSlide,
    setSelectedElementUuids,
  ]);
};

const ElementsSlide = ({
  slideUuid,
  isPreview,
  isViewOnly = false,
}: ElementsSlideProps) => {
  const setTransformingElementId = useSlideEditorLayoutStore(
    (state) => state.setTransformingElementId
  );
  const unselectAllElements = useSlideEditorLayoutStore(
    (state) => state.unselectAllElements
  );
  const setShapeColor = useSlidePresentationEditorStore(
    (state) => state.setShapeColor
  );
  const setSlideElementPosition = useSlidePresentationEditorStore(
    (state) => state.setSlideElementPosition
  );
  const commitSlideElementPosition = useSlidePresentationEditorStore(
    (state) => state.commitSlideElementPosition
  );
  const setSlideElementSizes = useSlidePresentationEditorStore(
    (state) => state.setSlideElementSizes
  );
  const commitSlideElementSizes = useSlidePresentationEditorStore(
    (state) => state.commitSlideElementSizes
  );
  const updateSlideMedia = useSlidePresentationEditorStore(
    (state) => state.updateSlideMedia
  );
  const resetSelectedSlideType = useSlidePresentationEditorStore(
    (state) => state.resetSelectedSlideType
  );
  const slide = useSlidePresentationEditorStore(
    useShallow((state) => state.slides.find((s) => s.id === slideUuid))
  );

  useElementsSlide({ slideUuid, isPreview, isViewOnly });

  useEffect(() => {
    return () => {
      resetSelectedSlideType();
    };
  }, [resetSelectedSlideType]);

  const slideScalingDelta = useSlideEditorLayoutStore(
    (state) => state.slideScalingDelta
  );
  const isPresentationMode = useSlideEditorLayoutStore(
    (state) => state.isPresenting
  );
  const contextMenu = useSlideEditorLayoutStore((state) => state.contextMenu);
  const openContextMenu = useSlideEditorLayoutStore(
    (state) => state.openContextMenu
  );
  const transformingElementId = useSlideEditorLayoutStore(
    (state) => state.transformingElementId
  );

  const handleClick = (elementUuid: string) => {
    setTransformingElementId(elementUuid);
  };

  const handleExit = (elementUuid: string) => {
    unselectAllElements();
  };

  const handleDrag = (elementUuid: string, px: number, py: number) => {
    setSlideElementPosition({
      slideUuid,
      elementUuid,
      x: px / slideScalingDelta,
      y: py / slideScalingDelta,
    });
  };

  const handleDragEnd = (elementUuid: string, px: number, py: number) => {
    commitSlideElementPosition({
      slideUuid,
      elementUuid,
      x: px / slideScalingDelta,
      y: py / slideScalingDelta,
    });
  };

  const handleResize = (
    elementUuid: string,
    width: number,
    height: number,
    x: number,
    y: number,
    rotation?: number,
    fontSize?: number
  ) => {
    setSlideElementSizes({
      slideUuid,
      elementUuid,
      width: width / slideScalingDelta,
      height: height / slideScalingDelta,
      x: x / slideScalingDelta,
      y: y / slideScalingDelta,
      rotation: rotation ?? 0,
      ...(fontSize != null && { fontSize: fontSize / slideScalingDelta }),
    });
  };

  const handleResizeEnd = (
    elementUuid: string,
    width: number,
    height: number,
    x: number,
    y: number,
    rotation?: number,
    fontSize?: number
  ) => {
    commitSlideElementSizes({
      slideUuid,
      elementUuid,
      width: width / slideScalingDelta,
      height: height / slideScalingDelta,
      x: x / slideScalingDelta,
      y: y / slideScalingDelta,
      rotation: rotation ?? 0,
      ...(fontSize != null && { fontSize: fontSize / slideScalingDelta }),
    });
  };

  const handleContextMenu = (elementUuid: string, px: number, py: number) => {
    openContextMenu({ activeElementUuid: elementUuid, x: px, y: py });
  };

  const handleMediaUpload = async (
    filesList: FileList | null,
    mediaUuid: string
  ) => {
    const file = filesList?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('picture', file);

    try {
      const response = await fetch('/api/slide-editor/upload-picture', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const mediaInBucketUrl = await response.json();
        if (mediaInBucketUrl && typeof mediaInBucketUrl === 'string') {
          const mediaUrl = slideEditorImageLoader({ src: mediaInBucketUrl });
          if (mediaUrl) {
            updateSlideMedia({ slideUuid, mediaUuid, src: mediaUrl });
          }
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleColorChange = (elementUuid: string, color: string) => {
    setShapeColor({ slideUuid, elementUuid, color });
  };

  if (!slide) return null;

  const getSlideElement = (element: SlideElement) => {
    if (element.subtype === SlideImageElementsVariants.BACKGROUND_IMAGE) {
      const img = element as { id: string; src: string };
      return (
        <BackgroundImage
          key={img.id}
          src={img.src}
          slideUuid={slideUuid}
          uuid={img.id}
          isPreview={isPreview || isPresentationMode}
        />
      );
    }

    if (element.subtype === SlideImageElementsVariants.IMAGE) {
      const img = element as { id: string; src: string };
      return (
        <SlideImage
          slideUuid={slideUuid}
          uuid={img.id}
          key={img.id}
          src={img.src}
          isViewOnly={isViewOnly}
          isPreview={isPreview || isPresentationMode}
          onDragEnd={(nx, ny) => handleDragEnd(img.id, nx, ny)}
          onClick={() => handleClick(img.id)}
          isTransforming={img.id === transformingElementId}
          onResizeEnd={(nw, nh, nx, ny, rot) =>
            handleResizeEnd(img.id, nw, nh, nx, ny, rot)
          }
          slideDimensions={{
            width: slide.themeSettings.width,
            height: slide.themeSettings.height,
          }}
          onContextMenu={(px, py) => handleContextMenu(img.id, px, py)}
          showContextMenu={
            (contextMenu?.visible && contextMenu?.activeElementUuid === img.id) ||
            false
          }
          onChangeImage={(files) => handleMediaUpload(files, img.id)}
        />
      );
    }

    if (element.subtype === SlideImageElementsVariants.GIF) {
      const gif = element as { id: string; src: string };
      return (
        <SlideImage
          slideUuid={slideUuid}
          uuid={gif.id}
          key={gif.id}
          src={gif.src}
          isViewOnly={isViewOnly}
          isPreview={isPreview || isPresentationMode}
          onDragEnd={(nx, ny) => handleDragEnd(gif.id, nx, ny)}
          onClick={() => handleClick(gif.id)}
          isTransforming={gif.id === transformingElementId}
          onResizeEnd={(nw, nh, nx, ny, rot) =>
            handleResizeEnd(gif.id, nw, nh, nx, ny, rot)
          }
          slideDimensions={{
            width: slide.themeSettings.width,
            height: slide.themeSettings.height,
          }}
          onContextMenu={(px, py) => handleContextMenu(gif.id, px, py)}
          showContextMenu={
            (contextMenu?.visible && contextMenu?.activeElementUuid === gif.id) ||
            false
          }
          onChangeImage={(files) => handleMediaUpload(files, gif.id)}
          isGif
        />
      );
    }

    if (element.type === SlideElementBaseTypes.TEXT) {
      const text = element;
      if (
        text.subtype === SlideTextElementsVariants.PARAGRAPH ||
        text.subtype === SlideTextElementsVariants.QUOTE
      ) {
        return (
          <TextBlock
            key={text.id}
            isViewOnly={isViewOnly}
            slideUuid={slideUuid}
            elementUuid={text.id}
            isPreview={isPreview || isPresentationMode}
          />
        );
      }
      return null;
    }

    if (element.type === SlideElementBaseTypes.VIDEO) {
      const video = element as { id: string; src: string };
      return (
        <SlideVideo
          slideUuid={slideUuid}
          uuid={video.id}
          key={video.id}
          src={video.src}
          isTransforming={video.id === transformingElementId}
          isPreview={isPreview}
          isPresenting={isPresentationMode}
          onClick={() => handleClick(video.id)}
          onExit={() => handleExit(video.id)}
          onDrag={(nx, ny) => handleDrag(video.id, nx, ny)}
          onResize={(nw, nh, nx, ny) =>
            handleResize(video.id, nw, nh, nx, ny)
          }
          onContextMenu={(px, py) => handleContextMenu(video.id, px, py)}
          showContextMenu={
            (contextMenu?.visible &&
              contextMenu?.activeElementUuid === video.id) ||
            false
          }
          isViewOnly={isViewOnly}
          onChangeVideo={(files) => handleMediaUpload(files, video.id)}
        />
      );
    }

    if (element.type === SlideElementBaseTypes.SHAPE && (element as { fillColor?: string }).fillColor) {
      const shape = element as SlideLineShape & { fillColor: string };
      return (
        <SlideShape
          key={shape.id}
          type={shape.subtype}
          slideUuid={slideUuid}
          uuid={shape.id}
          points={(shape as SlideLineShape).points}
          color={shape.fillColor}
          isPreview={isPreview || isPresentationMode}
          onDragEnd={(nx, ny) => handleDragEnd(shape.id, nx, ny)}
          onClick={() => handleClick(shape.id)}
          isTransforming={shape.id === transformingElementId}
          onResizeEnd={(nw, nh, nx, ny, rot) =>
            handleResizeEnd(shape.id, nw, nh, nx, ny, rot)
          }
          onContextMenu={(px, py) => handleContextMenu(shape.id, px, py)}
          showContextMenu={
            (contextMenu?.visible &&
              contextMenu?.activeElementUuid === shape.id) ||
            false
          }
          onColorChange={(color) => handleColorChange(shape.id, color)}
          isViewOnly={isViewOnly}
        />
      );
    }

    if (element.type === SlideElementBaseTypes.TABLE) {
      const table = element as { id: string };
      return (
        <SlideTable
          key={table.id}
          slideUuid={slideUuid}
          uuid={table.id}
          isTransforming={table.id === transformingElementId}
          isPreview={isPreview || isPresentationMode}
          onDrag={(nx: number, ny: number) => handleDragEnd(table.id, nx, ny)}
          onClick={() => handleClick(table.id)}
          onResize={(
            nw: number,
            nh: number,
            nx: number,
            ny: number,
            rot?: number
          ) =>
            handleResizeEnd(table.id, nw, nh, nx, ny, rot)
          }
          onContextMenu={(px: number, py: number) =>
            handleContextMenu(table.id, px, py)
          }
          showContextMenu={
            (contextMenu?.visible &&
              contextMenu?.activeElementUuid === table.id) ||
            false
          }
          isViewOnly={isViewOnly}
        />
      );
    }

    return null;
  };

  if (slide.variant === SlideVariants.INTERACTIVE_MULTIPLE_CHOICE) {
    return (
      <Slide slideUuid={slideUuid} isPreview={isPreview}>
        <InteractiveMultipleChoice
          slideUuid={slideUuid}
          element={
            (slide.elements?.[0] as SlideInteractiveMultipleChoice) ?? ({} as SlideInteractiveMultipleChoice)
          }
          viewOnly={isPreview || isViewOnly}
        />
      </Slide>
    );
  }

  return (
    <Slide slideUuid={slideUuid} isPreview={isPreview}>
      {slide.elements?.map((el: SlideElement) => getSlideElement(el))}
    </Slide>
  );
};

export default memo(ElementsSlide);
