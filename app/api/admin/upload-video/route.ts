import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAdminAuthenticated } from '@/lib/admin-auth';

const MAX_VIDEO_SIZE = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v', '.ogv'];

export async function POST(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get('video');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Fichier vidéo manquant' }, { status: 400 });
    }

    const ext = path.extname(file.name || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: 'Format non supporté. Formats acceptés : mp4, webm, mov, m4v, ogv.' },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.byteLength <= 0) {
      return NextResponse.json({ error: 'Fichier vide' }, { status: 400 });
    }
    if (bytes.byteLength > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: 'Vidéo trop volumineuse. Taille maximale : 15 Mo.' },
        { status: 400 }
      );
    }

    const baseName = (file.name || 'video').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]+/g, '-');
    const fileName = `${Date.now()}-${baseName}${ext}`;
    const dir = path.join(process.cwd(), 'public', 'videos');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, fileName), bytes);

    return NextResponse.json({ success: true, url: `/videos/${fileName}` });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}