'use client';

import { useSlidePresentationEditorStore } from '@/zustand/useSlidePresentationEditorStore';
import { Image } from 'react-konva';
import { useImage } from 'react-konva-utils';
import { Html } from 'react-konva-utils';
import { Loader2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';

const useSlideBackgroundImage = ({
  slideUuid,
  uuid,
}: {
  slideUuid: string;
  uuid: string;
}) => {
  const slideBackgroundImage = useSlidePresentationEditorStore(
    useShallow((state) =>
      state.slides
        .find((s) => s.id === slideUuid)
        ?.elements?.find((el) => el.id === uuid)
    )
  );
  const slideScalingDelta = useSlideEditorLayoutStore(
    (state) => state.slideScalingDelta
  );

  if (!slideBackgroundImage) return { x: 0, y: 0, width: 0, height: 0 };

  return {
    x: slideBackgroundImage.x * slideScalingDelta,
    y: slideBackgroundImage.y * slideScalingDelta,
    width: slideBackgroundImage.width * slideScalingDelta,
    height: slideBackgroundImage.height * slideScalingDelta,
    originalX: slideBackgroundImage.x,
    originalY: slideBackgroundImage.y,
    originalWidth: slideBackgroundImage.width,
    originalHeight: slideBackgroundImage.height,
  };
};

type BackgroundImageProps = {
  slideUuid: string;
  uuid: string;
  src: string;
  isPreview?: boolean;
};

const BackgroundImage = ({
  slideUuid,
  uuid,
  src,
  isPreview,
}: BackgroundImageProps) => {
  const [image, imageStatus] = useImage(src);
  const isImageLoading = imageStatus === 'loading';

  const {
    x,
    y,
    width,
    height,
    originalX,
    originalY,
    originalWidth,
    originalHeight,
  } = useSlideBackgroundImage({ slideUuid, uuid });

  if (isPreview) {
    if (isImageLoading && !image) {
      return (
        <Html>
          <div
            className="absolute flex items-center justify-center bg-gray-200"
            style={{ left: originalX, top: originalY, width: originalWidth, height: originalHeight }}
          >
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <Loader2 className="size-6 animate-spin" />
              <span className="text-sm font-medium">Carregando...</span>
            </div>
          </div>
        </Html>
      );
    }
    return (
      <Image
        image={image ?? undefined}
        x={originalX}
        y={originalY}
        width={originalWidth}
        height={originalHeight}
      />
    );
  }

  if (isImageLoading && !image) {
    return (
      <Html>
        <div
          className="absolute flex items-center justify-center bg-gray-200"
          style={{ left: x, top: y, width, height }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm font-medium">Carregando...</span>
          </div>
        </div>
      </Html>
    );
  }

  return (
    <Image
      image={image ?? undefined}
      x={x}
      y={y}
      width={width}
      height={height}
      listening={false}
    />
  );
};

export default BackgroundImage;
