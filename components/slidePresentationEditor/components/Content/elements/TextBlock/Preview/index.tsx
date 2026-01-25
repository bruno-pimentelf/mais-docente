import { Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import usePreviewTextBlock from './usePreviewTextBlock';

type Props = {
  slideUuid: string;
  elementUuid: string;
};

const PreviewTextBlock = (props: Props) => {
  const preview = usePreviewTextBlock(props);

  return (
    <Group
      x={preview.x}
      y={preview.y}
      rotation={preview.rotation}
    >
      <Html>
        <div
          style={{
            pointerEvents: 'none',
            fontSize: preview.fontSize,
            fontFamily: preview.fontFamily,
            textAlign: preview.textAlign,
            width: preview.width,
            wordBreak: 'break-word',
            lineHeight: preview.lineHeight,
          }}
          dangerouslySetInnerHTML={{
            __html: preview.text ?? '',
          }}
        />
      </Html>
    </Group>
  );
};

export default PreviewTextBlock;
