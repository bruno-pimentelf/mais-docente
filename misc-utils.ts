/**
 * Used by slide editor when loading media URLs (e.g. after upload).
 * Can be extended to add auth headers or transform URLs.
 */
export function slideEditorImageLoader(o: { src: string }): string {
  return o.src;
}
