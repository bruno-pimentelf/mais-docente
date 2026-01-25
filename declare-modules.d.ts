declare module 'uuid' {
  export function v4(): string;
  export function v1(): string;
}

declare module 'react-color' {
  import { ComponentType } from 'react';
  export const SketchPicker: ComponentType<Record<string, unknown>>;
}
