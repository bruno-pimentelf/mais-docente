export type TTemplateGroupId =
  | 'text'
  | 'text_with_images'
  | 'topics'
  | 'topics_with_images'
  | 'table'
  | 'timeline'
  | 'question'
  | 'quote'
  | 'data'
  | 'crossword'
  | 'word_search';

export type TemplateGroup = {
  id: TTemplateGroupId;
  multiple: boolean;
  icon: string;
  isInteractive?: boolean;
};

export type SlideTypeSelectorItemProps = {
  name: string;
  icon: string;
  isSelected: boolean;
  tag?: string;
  onClick: () => void;
};
