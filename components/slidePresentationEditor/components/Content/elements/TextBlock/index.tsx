import EditableTextBlock from './Editable';
import PreviewTextBlock from './Preview';

type CommonProps = {
  slideUuid: string;
  elementUuid: string;
};

type Props = CommonProps & {
  isPreview?: boolean;
  isViewOnly?: boolean;
};

const TextBlock = (props: Props) => {
  const { isPreview, ...rest } = props;

  return isPreview ? (
    <PreviewTextBlock {...rest} />
  ) : (
    <EditableTextBlock {...rest} />
  );
};

export default TextBlock;
