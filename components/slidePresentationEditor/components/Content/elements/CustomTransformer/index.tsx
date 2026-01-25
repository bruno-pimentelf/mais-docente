import Konva from 'konva';
import { Transformer } from 'react-konva';

interface CustomTransformerProps extends Konva.TransformerConfig {}

const centerVerticalAnchors = ['middle-left', 'middle-right'];
const centerHorizontalAnchors = ['top-center', 'bottom-center'];

export default function CustomTransformer({
  enabledAnchors = [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
    'top-center',
    'bottom-center',
    'middle-left',
    'middle-right',
  ],
  rotationSnaps = [0, 90, 180, 270],
  rotationSnapTolerance = 3,
  flipEnabled = false,
  borderStroke = '#3055BF',
  borderStrokeWidth = 2,
  anchorStyleFunc,
  ...transformerProps
}: CustomTransformerProps) {
  return (
    <Transformer
      {...transformerProps}
      flipEnabled={flipEnabled}
      enabledAnchors={enabledAnchors}
      rotationSnaps={rotationSnaps}
      rotationSnapTolerance={rotationSnapTolerance}
      borderStroke={borderStroke}
      borderStrokeWidth={borderStrokeWidth}
      anchorStyleFunc={(anchor) => {
        if (anchorStyleFunc) {
          anchorStyleFunc(anchor);
        }

        anchor.cornerRadius(40);
        anchor.fill('#FFFFFF');
        anchor.stroke('#D5E1ED');

        if (
          centerVerticalAnchors.some((anchorName) => anchor.hasName(anchorName))
        ) {
          anchor.offsetY(13);
          anchor.size({ width: 10, height: 30 });
          return;
        }

        if (
          centerHorizontalAnchors.some((anchorName) =>
            anchor.hasName(anchorName)
          )
        ) {
          anchor.offsetX(14);
          anchor.size({ width: 30, height: 10 });
          return;
        }

        anchor.offset({ x: 8, y: 8 });
        anchor.size({ width: 15, height: 15 });

        if (anchor.hasName('rotater')) {
          anchor.offset({ x: 7.5, y: 8 });
        }
      }}
    />
  );
}
