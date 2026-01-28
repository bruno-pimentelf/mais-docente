import {
  SlideElement,
  SlideElementBaseTypes,
  SlideImageElementsVariants,
  SlideShape,
  SlideShapeElementsVariants,
  SlideTextElementsVariants,
  SlideInteractiveElementsVariants,
  SlideInteractiveMultipleChoice,
  Slide as SlideType,
} from '../../../../types';
import { useState } from 'react';
import Image from 'next/image';
import { SlideQuizOption } from '../../elements/interactive/InteractiveMultipleChoice/SlideQuizOption';

const t = (k: string) =>
  ({
    'slideImage.loading': 'Carregando…',
    'interactiveMultipleChoice.questionPlaceholder': 'Pergunta',
    'interactiveMultipleChoice.optionPlaceholder': 'Opção',
  })[k] ?? k;

type PureSlideRendererProps = {
  slide: SlideType;
  scale?: number;
  className?: string;
};

const PureSlideRenderer = ({
  slide,
  scale = 1,
  className = '',
}: PureSlideRendererProps) => {
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (imageId: string) => {
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(imageId);
      return next;
    });
  };

  const handleImageLoadStart = (imageId: string) => {
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.add(imageId);
      return next;
    });
  };

  const getSlideElement = (element: SlideElement) => {
    // Para o preview puro, vamos simplificar os elementos e focar nos visuais

    if (element.subtype === SlideImageElementsVariants.BACKGROUND_IMAGE) {
      const image = element;
      return (
        <div
          key={image.id}
          className="absolute"
          style={{
            left: image.x * scale,
            top: image.y * scale,
            width: image.width * scale,
            height: image.height * scale,
            backgroundImage: `url(${image.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: image.rotation
              ? `rotate(${image.rotation}deg)`
              : undefined,
            transformOrigin: 'top left',
          }}
        />
      );
    }

    if (
      element.subtype === SlideImageElementsVariants.IMAGE ||
      element.subtype === SlideImageElementsVariants.GIF
    ) {
      const image = element;
      const isLoading = loadingImages.has(image.id);

      return (
        <div
          key={image.id}
          className="absolute"
          style={{
            left: image.x * scale,
            top: image.y * scale,
            width: image.width * scale,
            height: image.height * scale,
            borderRadius: image.borderRadius
              ? `${image.borderRadius * scale}px`
              : '0',
            transform: image.rotation
              ? `rotate(${image.rotation}deg)`
              : undefined,
            transformOrigin: 'top left',
          }}
        >
          {isLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded"
              style={{
                borderRadius: image.borderRadius
                  ? `${image.borderRadius * scale}px`
                  : '0',
              }}
            >
              <div className="flex flex-col items-center gap-1 text-gray-500">
                <span className="text-xs">{t('slideImage.loading')}</span>
              </div>
            </div>
          )}
          <img
            src={image.src}
            alt=""
            className="size-full object-cover"
            style={{
              borderRadius: image.borderRadius
                ? `${image.borderRadius * scale}px`
                : '0',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.2s ease-in-out',
            }}
            onLoad={() => handleImageLoad(image.id)}
            onError={() => handleImageLoad(image.id)}
          />
        </div>
      );
    }

    if (element.type === SlideElementBaseTypes.TEXT) {
      const text = element;
      if (
        text.subtype === SlideTextElementsVariants.PARAGRAPH ||
        text.subtype === SlideTextElementsVariants.QUOTE
      ) {
        // Check if content contains a list
        const hasList = text.text.includes('<ul') || text.text.includes('<ol');

        return (
          <div
            key={text.id}
            className="absolute"
            style={{
              left: text.x * scale,
              top: text.y * scale,
              width: text.width * scale,
              height: text.height * scale,
              fontSize: `${(text.fontSize || 16) * scale}px`,
              fontFamily: text.fontFamily || 'Quicksand',
              textAlign: text.textAlign || 'left',
              lineHeight: text.lineHeight || 1.2,
              transform: text.rotation
                ? `rotate(${text.rotation}deg)`
                : undefined,
              transformOrigin: 'top left',
              overflowWrap: 'break-word',
              // List-specific styles to ensure bullets render correctly
              ...(hasList && {
                listStylePosition: 'inside' as const,
              }),
            }}
            dangerouslySetInnerHTML={{ __html: text.text }}
          />
        );
      }
    }

    if (element.type === SlideElementBaseTypes.VIDEO) {
      const video = element;
      return (
        <div
          key={video.id}
          className="absolute flex items-center justify-center bg-cinza-300"
          style={{
            left: video.x * scale,
            top: video.y * scale,
            width: video.width * scale,
            height: video.height * scale,
            transform: video.rotation
              ? `rotate(${video.rotation}deg)`
              : undefined,
            transformOrigin: 'top left',
          }}
        >
          <span className="text-xs text-cinza-600">Video</span>
        </div>
      );
    }

    if (element.type === SlideElementBaseTypes.SHAPE && element.fillColor) {
      const shape = element as SlideShape;
      const isCircle =
        shape.subtype === SlideShapeElementsVariants.CIRCLE;

      const left = isCircle
        ? (shape.x - shape.width / 2) * scale
        : shape.x * scale;
      const top = isCircle
        ? (shape.y - shape.height / 2) * scale
        : shape.y * scale;

      return (
        <div
          key={shape.id}
          className="absolute"
          style={{
            left,
            top,
            width: shape.width * scale,
            height: shape.height * scale,
            backgroundColor: shape.fillColor,
            opacity: shape.opacity ?? 1,
            borderRadius: isCircle
              ? '50%'
              : shape.subtype === SlideShapeElementsVariants.RECTANGLE
                ? `${8 * scale}px`
                : '0',
            transform: shape.rotation
              ? `rotate(${shape.rotation}deg)`
              : undefined,
            transformOrigin: isCircle ? 'center center' : 'top left',
          }}
        />
      );
    }

    if (element.type === SlideElementBaseTypes.TABLE) {
      const table = element;

      return (
        <div
          key={table.id}
          className="absolute"
          style={{
            left: table.x * scale,
            top: table.y * scale,
            width: table.width * scale,
            height: table.height * scale,
            backgroundColor: table.backgroundColor || '#ffffff',
            borderColor: table.borderColor || '#000000',
            borderWidth: '1px',
            borderStyle: 'solid',
            transform: table.rotation
              ? `rotate(${table.rotation}deg)`
              : undefined,
            transformOrigin: 'top left',
          }}
        >
          <table
            className="size-full border-collapse"
            style={{
              tableLayout: 'fixed',
              height: `${table.height * scale}px`,
            }}
          >
            <tbody>
              {table.content.data.map((row, rowIndex) => {
                const rowHeight =
                  table.content.rowHeights?.[rowIndex] ??
                  table.defaultRowHeight ??
                  40;
                return (
                  <tr
                    key={rowIndex}
                    style={{
                      height: `${rowHeight * scale}px`,
                      maxHeight: `${rowHeight * scale}px`,
                      minHeight: `${rowHeight * scale}px`,
                      display: 'table-row',
                    }}
                  >
                    {row.map((cell, colIndex) => {
                      const columnWidth =
                        table.content.columnWidths?.[colIndex] ??
                        table.defaultColumnWidth ??
                        table.width / table.content.cols;
                      const textAlign = cell.textAlign || 'left';
                      const verticalAlign = cell.verticalAlign || 'top';

                      return (
                        <td
                          key={colIndex}
                          style={{
                            padding: '0px',
                            backgroundColor:
                              cell.backgroundColor || 'transparent',
                            height: `${rowHeight * scale}px`,
                            maxHeight: `${rowHeight * scale}px`,
                            minHeight: `${rowHeight * scale}px`,
                            width: `${columnWidth * scale}px`,
                            maxWidth: `${columnWidth * scale}px`,
                            minWidth: `${columnWidth * scale}px`,
                            verticalAlign: 'top',
                            overflow: 'hidden',
                            position: 'relative',
                            borderColor: table.borderColor || '#000000',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                          }}
                        >
                          <div
                            style={{
                              height: `${rowHeight * scale}px`,
                              maxHeight: `${rowHeight * scale}px`,
                              overflow: 'hidden',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'flex',
                              justifyContent:
                                textAlign === 'center'
                                  ? 'center'
                                  : textAlign === 'right'
                                    ? 'flex-end'
                                    : 'flex-start',
                              alignItems:
                                verticalAlign === 'center'
                                  ? 'center'
                                  : verticalAlign === 'bottom'
                                    ? 'flex-end'
                                    : 'flex-start',
                              padding: '4px 8px',
                            }}
                          >
                            <p
                              style={{
                                fontSize: `${(cell.fontSize || 12) * scale}px`,
                                fontFamily: cell.fontFamily || 'Arial',
                                color: cell.color || '#000000',
                                fontWeight:
                                  cell.fontWeight ??
                                  (cell.bold ? 'bold' : 'normal'),
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                lineHeight: '1.2',
                                width: '100%',
                                textAlign: textAlign as 'left' | 'center' | 'right' | 'justify',
                              }}
                            >
                              <span>{cell.value || ''}</span>
                            </p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (
      element.type === SlideElementBaseTypes.INTERACTIVE &&
      element.subtype === SlideInteractiveElementsVariants.MULTIPLE_CHOICE
    ) {
      const interactive = element as SlideInteractiveMultipleChoice;

      const hasQuestion = Boolean(interactive?.question?.trim());
      const hasOptionText = Array.isArray(interactive?.alternatives)
        ? interactive.alternatives.some((o) => Boolean(o?.text?.trim()))
        : false;
      const hasContent = hasQuestion || hasOptionText;
      const showFallbackImage = !interactive.image && !hasContent;
      const hasLeftVisual = Boolean(interactive.image) || showFallbackImage;
      const contentWidthClass = hasLeftVisual ? 'w-[65%]' : 'w-[90%]';

      return (
        <div
          key={interactive.id}
          className="absolute inset-0 bg-white"
          style={{
            width: 1920 * scale,
            height: 1080 * scale,
            transform: interactive.rotation
              ? `rotate(${interactive.rotation}deg)`
              : undefined,
            transformOrigin: 'top left',
          }}
        >
          <div
            style={{
              width: 1920,
              height: 1080,
              transform: `scale(${scale})`,
              transformOrigin: 'left top',
            }}
            className="flex items-center justify-center"
          >
            <div className="flex justify-center gap-4 py-4 px-20 w-full">
              {hasLeftVisual &&
                (interactive.image ? (
                  <div className="shrink-0 flex items-center justify-center">
                    <img
                      src={interactive.image}
                      alt="Quiz image"
                      width={450}
                      height={450}
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <Image
                    src="/images/iara/lara-profile.svg"
                    alt="Lara"
                    width={450}
                    height={450}
                    className="shrink-0"
                  />
                ))}
              <div className={`flex flex-col gap-12 p-8 ${contentWidthClass}`}>
                {interactive.question ? (
                  <span className="font-quicksand font-bold text-ds-gray-900 text-[3rem] leading-[1.1]">
                    {interactive.question}
                  </span>
                ) : (
                  <span className="font-quicksand font-bold text-ds-gray-300/70 text-[4rem] leading-[1.1]">
                    {t('interactiveMultipleChoice.questionPlaceholder')}
                  </span>
                )}
                <div className="flex flex-col gap-8">
                  {interactive.alternatives.map((option, index) => (
                    <SlideQuizOption
                      key={option.id}
                      text={option.text}
                      index={index}
                      optionPlaceholder={t(
                        'interactiveMultipleChoice.optionPlaceholder'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const backgroundStyle = {
    width: slide.themeSettings.width * scale,
    height: slide.themeSettings.height * scale,
    backgroundColor: slide.themeSettings.backgroundColor,
    ...(slide.themeSettings.backgroundImage && {
      backgroundImage: `url(${slide.themeSettings.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }),
  };

  return (
    <div
      key={slide.id}
      id={`preview-${slide.id}`}
      className={`relative overflow-hidden pointer-events-none ${className}`}
      style={backgroundStyle}
    >
      {slide.elements?.map((element: SlideElement) =>
        getSlideElement(element)
      )}
    </div>
  );
};

export default PureSlideRenderer;
