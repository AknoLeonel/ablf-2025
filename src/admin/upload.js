import { getSupabase } from '../lib/supabase';

// Reduz a imagem no navegador e converte para WebP antes de enviar (menos banda, site mais rápido).
async function reduzir(file, maxSize) {
  try {
    const bmp = await createImageBitmap(file);
    const escala = Math.min(1, maxSize / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bmp.width * escala));
    canvas.height = Math.max(1, Math.round(bmp.height * escala));
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
    if (blob) return blob;
  } catch {
    // formato que o navegador não decodifica: envia o original
  }
  return file;
}

const EXT = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' };

export async function uploadImagem(file, { folder = 'geral', maxSize = 1600 } = {}) {
  const blob = await reduzir(file, maxSize);
  const ext = EXT[blob.type];
  if (!ext) throw new Error('Use uma imagem JPG, PNG ou WebP.');
  const sb = await getSupabase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from('midia').upload(path, blob, {
    contentType: blob.type,
    cacheControl: '31536000',
  });
  if (error) throw error;
  return sb.storage.from('midia').getPublicUrl(path).data.publicUrl;
}

const EXT_DOC = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

// Documentos oficiais (PDF/Word/Excel, até 20 MB) vão para o bucket "documentos", sem reduzir nada.
export async function uploadDocumento(file) {
  const ext = EXT_DOC[file.type];
  if (!ext) throw new Error('Use um arquivo PDF, Word (.doc/.docx) ou Excel (.xls/.xlsx).');
  if (file.size > 20 * 1024 * 1024) throw new Error('O arquivo passa de 20 MB.');
  const sb = await getSupabase();
  const nome = file.name.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 50) || 'documento';
  const path = `${new Date().getFullYear()}/${Date.now()}-${nome}.${ext}`;
  const { error } = await sb.storage.from('documentos').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) throw error;
  return { url: sb.storage.from('documentos').getPublicUrl(path).data.publicUrl, size: file.size };
}
