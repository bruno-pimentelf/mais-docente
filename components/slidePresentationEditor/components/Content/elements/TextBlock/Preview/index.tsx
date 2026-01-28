import { Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import usePreviewTextBlock from './usePreviewTextBlock';

type Props = {
  slideUuid: string;
  elementUuid: string;
};

const PreviewTextBlock = (props: Props) => {
  const previewTextBlock = usePreviewTextBlock(props);

  return (
    <Group
      x={previewTextBlock.x}
      y={previewTextBlock.y}
      rotation={previewTextBlock.rotation}
    >
      <Html>
        <div
          style={{
            pointerEvents: 'none',
            fontSize: previewTextBlock.fontSize,
            fontFamily: previewTextBlock.fontFamily,
            textAlign: previewTextBlock.textAlign,
            width: previewTextBlock.width,
            wordBreak: 'break-word',
            lineHeight: previewTextBlock.lineHeight,
          }}
          dangerouslySetInnerHTML={{
            __html: previewTextBlock.text ?? '',
          }}
        ></div>
      </Html>
    </Group>
  );
};

export default PreviewTextBlock;
