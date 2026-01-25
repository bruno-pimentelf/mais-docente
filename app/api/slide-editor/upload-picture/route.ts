import { NextRequest, NextResponse } from 'next/server';

/**
 * API para upload de imagens no editor de slides.
 * Por enquanto retorna uma data URL (base64) para o elemento exibir
 * sem depender de bucket/S3. Para produção, trocar por upload em storage.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('picture') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: 'Imagem não está presente' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mime = file.type || 'image/png';
    const dataUrl = `data:${mime};base64,${base64}`;

    return NextResponse.json(dataUrl);
  } catch (err) {
    console.error('upload-picture:', err);
    return NextResponse.json(
      { message: 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}
