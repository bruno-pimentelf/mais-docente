'use client';

import { Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import type { SlideInteractiveMultipleChoice } from '../../../../../types';
import { SlideQuizOption } from './SlideQuizOption';

type Props = {
  slideUuid: string;
  element: SlideInteractiveMultipleChoice;
  viewOnly?: boolean;
};

export default function InteractiveMultipleChoice({
  slideUuid: _slideUuid,
  element,
  viewOnly = true,
}: Props) {
  const slideScalingDelta = useSlideEditorLayoutStore((s) => s.slideScalingDelta);
  const x = (element?.x ?? 0) * slideScalingDelta;
  const y = (element?.y ?? 0) * slideScalingDelta;
  const width = (element?.width ?? 400) * slideScalingDelta;
  const height = (element?.height ?? 300) * slideScalingDelta;

  const alternatives = element?.alternatives ?? [];

  return (
    <Group x={x} y={y}>
      <Html>
        <div
          className="flex flex-col gap-2 rounded border border-gray-200 bg-white p-4"
          style={{ width, minHeight: height, pointerEvents: viewOnly ? 'none' : 'auto' }}
        >
          <div className="font-quicksand font-bold text-ds-gray-900">
            {element?.question || 'Pergunta'}
          </div>
          <div className="flex flex-col gap-2">
            {alternatives.map((opt, i) => (
              <SlideQuizOption
                key={opt.id}
                text={opt.text}
                index={i}
                optionPlaceholder="Opção"
                studentView={viewOnly}
                disabled={viewOnly}
              />
            ))}
          </div>
        </div>
      </Html>
    </Group>
  );
}
