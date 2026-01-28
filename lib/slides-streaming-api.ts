/**
 * Slides Streaming API – tipos e cliente para geração de slides.
 * Base URL: https://slides-streaming-618765472012.us-central1.run.app
 */

const SLIDES_STREAMING_BASE =
  process.env.NEXT_PUBLIC_SLIDES_STREAMING_URL ||
  "https://slides-streaming-618765472012.us-central1.run.app";

// --- Tipos da API ---

export interface SlideRequest {
  category: string;
  description: string;
  locale: string;
  slidesNumber: number;
  grade?: string;
  uploadedContents?: string[] | null;
  language?: string | null;
}

export interface SlideStructureItem {
  title: string;
  description: string;
  template: string;
  slide_number: number;
}

export interface StructureChunk {
  status: "in_progress" | "complete";
  type: "structure";
  message?: string;
  slides_structure?: SlideStructureItem[];
}

export interface SlideContentChunk {
  status: "in_progress" | "complete";
  type: "slide_content";
  message?: string;
  slide_number: number;
  template: string;
  slide_content: Record<string, unknown>;
  image_url?: string;
  image_caption?: string;
  [key: string]: unknown;
}

export interface PresentationInfo {
  title?: string;
  subtitle?: string;
  cover_image_url?: string;
  cover_image_caption?: string;
  agenda_header?: string;
  agenda_subtitle?: string;
  agenda?: string[];
  conclusion_header?: string;
  conclusion_subtitle?: string;
  conclusion?: string[];
  [key: string]: unknown;
}

export interface EntireSlideItem {
  slide_number: number;
  template: string;
  slide_content: Record<string, unknown>;
}

export interface ContentChunk {
  status: "complete";
  type: "content";
  slides_generated: number;
  message?: string;
  entire_slide_content: EntireSlideItem[];
  presentation_info: PresentationInfo;
}

export interface ApiErrorChunk {
  status: "error";
  type: "api_error";
  error: string;
}

export type StreamChunk =
  | StructureChunk
  | SlideContentChunk
  | ContentChunk
  | ApiErrorChunk;

export interface StreamCallbacks {
  onStructure?: (chunk: StructureChunk) => void;
  onSlideContent?: (chunk: SlideContentChunk) => void;
  onContent?: (chunk: ContentChunk) => void;
  onError?: (chunk: ApiErrorChunk) => void;
}

/** Verifica se o serviço está saudável */
export async function healthCheck(): Promise<{ status: string; service?: string }> {
  const res = await fetch(`${SLIDES_STREAMING_BASE}/api/health`, {
    method: "GET",
  });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

/**
 * Gera slides em streaming (NDJSON).
 * Consome o body como stream e invoca os callbacks conforme o tipo de chunk.
 */
export async function generateSlidesStream(
  body: SlideRequest,
  callbacks: StreamCallbacks,
  options?: { endpoint?: string; signal?: AbortSignal }
): Promise<void> {
  const endpoint =
    options?.endpoint ?? "/slide/v3";
  const url = `${SLIDES_STREAMING_BASE}${endpoint}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options?.signal,
  });

  if (!res.ok) {
    const text = await res.text();
    callbacks.onError?.({
      status: "error",
      type: "api_error",
      error: `HTTP ${res.status}: ${text}`,
    });
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    callbacks.onError?.({
      status: "error",
      type: "api_error",
      error: "No response body",
    });
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\n\n|\n/);
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const obj = JSON.parse(trimmed) as StreamChunk;
          if (obj.type === "structure") callbacks.onStructure?.(obj as StructureChunk);
          else if (obj.type === "slide_content")
            callbacks.onSlideContent?.(obj as SlideContentChunk);
          else if (obj.type === "content") callbacks.onContent?.(obj as ContentChunk);
          else if (obj.type === "api_error" || obj.status === "error")
            callbacks.onError?.(obj as ApiErrorChunk);
        } catch {
          // ignore malformed lines
        }
      }
    }
    if (buffer.trim()) {
      try {
        const obj = JSON.parse(buffer.trim()) as StreamChunk;
        if (obj.type === "structure") callbacks.onStructure?.(obj as StructureChunk);
        else if (obj.type === "slide_content")
          callbacks.onSlideContent?.(obj as SlideContentChunk);
        else if (obj.type === "content") callbacks.onContent?.(obj as ContentChunk);
        else if (obj.type === "api_error" || obj.status === "error")
          callbacks.onError?.(obj as ApiErrorChunk);
      } catch {
        // ignore
      }
    }
  } finally {
    reader.releaseLock();
  }
}
