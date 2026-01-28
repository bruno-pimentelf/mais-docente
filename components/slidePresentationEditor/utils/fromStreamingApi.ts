import type { ContentChunk, EntireSlideItem } from '@/lib/slides-streaming-api';
import type { Slide } from '../types';
import type { SlideTheme } from './types/slide-theme.types';
import { defaultTheme } from './themes/slide-themes';
import { CoverSlideFactory } from './factories/cover-slide.factory';
import { MainImageSlideFactory } from './factories/main-image-slide.factory';
import { DevelopmentBulletSlideFactory } from './factories/development-bullet-slide.factory';
import { DevelopmentTextSlideFactory } from './factories/development-text-slide.factory';

const DEFAULT_LOGO = '/images/icons/mais-docente-logo.svg';

function getStr(o: unknown): string {
  if (o == null) return '';
  if (typeof o === 'string') return o;
  if (Array.isArray(o)) return o.map(String).join('\n');
  if (typeof o === 'object') return (o as Record<string, unknown>).title != null ? String((o as Record<string, unknown>).title) : JSON.stringify(o);
  return String(o);
}

function getStrings(o: unknown): string[] {
  if (Array.isArray(o)) return o.map(String);
  if (typeof o === 'string') return o.split('\n').filter(Boolean);
  return [];
}

/**
 * Converte o resultado da Slides Streaming API (ContentChunk) em slides do editor.
 */
export async function contentChunkToSlides(
  content: ContentChunk,
  theme: SlideTheme = defaultTheme as SlideTheme,
  logoPath: string = DEFAULT_LOGO
): Promise<Slide[]> {
  const slides: Slide[] = [];
  const info = content.presentation_info ?? {};
  const items = content.entire_slide_content ?? [];
  let order = 1;

  // Capa a partir de presentation_info (se houver título)
  const coverTitle = getStr(info.title);
  if (coverTitle) {
    const coverFactory = new CoverSlideFactory(theme.cover);
    const coverSlide = coverFactory.create({
      title: coverTitle,
      subtitle: getStr(info.subtitle),
      logo_path: logoPath,
      slideOrder: order++,
      cover_image_url: typeof info.cover_image_url === 'string' ? info.cover_image_url : undefined,
    });
    slides.push(coverSlide);
  }

  const mainImageFactory = new MainImageSlideFactory(theme.mainImage);
  const bulletFactory = new DevelopmentBulletSlideFactory(theme.developmentBullet);
  const textFactory = new DevelopmentTextSlideFactory(theme.developmentText);

  for (const item of items as EntireSlideItem[]) {
    const sc = item.slide_content ?? {};
    const template = (item.template ?? '').toLowerCase();
    const title = getStr(sc.title);
    const contentText = getStr(sc.content_text);
    const bullets = getStrings(sc.content_bullet_points);
    const itemAny = item as Record<string, unknown>;
    const imageUrl =
      typeof sc.image_url === 'string'
        ? sc.image_url
        : typeof (sc as Record<string, unknown>).image_url_1 === 'string'
          ? ((sc as Record<string, unknown>).image_url_1 as string)
          : typeof itemAny.image_url === 'string'
            ? itemAny.image_url
            : null;
    const imageCaption = getStr(sc.image_caption);

    if (template === 'main_image_slide' || template === 'full_image_slide') {
      const slide = await mainImageFactory.create(
        imageUrl || null,
        title || ' ',
        contentText || ' ',
        logoPath,
        order++,
        imageCaption || undefined
      );
      slides.push(slide);
    } else if (template === 'content_slide_bullet') {
      const slide = await bulletFactory.create(
        imageUrl || null,
        title || ' ',
        bullets.length ? bullets : ['• Conteúdo'],
        logoPath,
        order++,
        imageCaption || undefined
      );
      slides.push(slide);
    } else if (template === 'content_slide_text' || template === 'content_text') {
      const slide = textFactory.create(
        title || ' ',
        contentText || ' ',
        logoPath,
        order++
      );
      slides.push(slide);
    } else {
      // fallback: slide de texto
      const slide = textFactory.create(
        title || `Slide ${order}`,
        contentText || getStr(sc.content) || ' ',
        logoPath,
        order++
      );
      slides.push(slide);
    }
  }

  // garantir order sequencial
  return slides.map((s, i) => ({ ...s, order: i + 1 }));
}
