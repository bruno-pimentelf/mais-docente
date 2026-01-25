import { useCallback } from 'react';
import type { SlideElement } from '../types';
import { INTERNAL_ELEMENT_PREFIX } from '../utils/helpers/slide-utils';

export type UseSlidePasteReturn = {
  isUploading: boolean;
  handlePaste: (e: ClipboardEvent) => Promise<void>;
};

/**
 * Minimal hook for paste handling. Export helpers for internal element clipboard.
 * For image/text paste, extend with usePasteImage/usePasteText when available.
 */
export default function useSlidePaste(): UseSlidePasteReturn {
  const handlePaste = useCallback(async (_e: ClipboardEvent) => {
    // Delegate internal element to ElementsSlide paste listener.
    // External image/text paste can be added here.
  }, []);

  return {
    isUploading: false,
    handlePaste,
  };
}

export async function getInternalElementFromClipboard(): Promise<
  SlideElement | SlideElement[] | null
> {
  try {
    const text = await navigator.clipboard.readText();
    if (text?.startsWith(INTERNAL_ELEMENT_PREFIX)) {
      const jsonText = text.slice(INTERNAL_ELEMENT_PREFIX.length);
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) return parsed as SlideElement[];
      return parsed as SlideElement;
    }
  } catch {
    // Clipboard API might not be available or permission denied
  }
  return null;
}

export function hasInternalElementInClipboard(e: ClipboardEvent): boolean {
  const cd = e.clipboardData;
  if (!cd) return false;
  const text = cd.getData('text/plain');
  return text?.startsWith(INTERNAL_ELEMENT_PREFIX) ?? false;
}
