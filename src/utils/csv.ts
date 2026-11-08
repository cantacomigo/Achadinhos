// ============================================
// CSV and Data Parsing Utilities
// ============================================

export function parseCSV(text: string): string[][] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      lines.push(current);
      current = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      lines.push(current);
      current = '';
      lines.push('\n');
    } else {
      current += ch;
    }
  }
  if (current) lines.push(current);

  const rows: string[][] = [];
  let row: string[] = [];
  for (const token of lines) {
    if (token === '\n') {
      if (row.length > 0) rows.push(row);
      row = [];
    } else {
      row.push(token.trim());
    }
  }
  if (row.length > 0) rows.push(row);
  return rows;
}

export function parsePrecoBR(val: string | undefined): number {
  const s = (val || '').trim();
  if (!s) return 0;
  // If comma: Brazilian format (e.g. 1.299,90 or 35,77)
  if (s.indexOf(',') !== -1) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  }
  // No comma: period is decimal or integer
  return parseFloat(s) || 0;
}

export function parseDataBR(val: string | undefined): Date | null {
  const s = (val || '').trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const d = new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 23, 59, 59);
  return isNaN(d.getTime()) ? null : d;
}

export function ofertaValida(validade: Date | null): boolean {
  if (!validade) return true;
  return new Date() <= validade;
}

export function ofertaExpiraEmBreve(validade: Date | null): boolean {
  if (!validade) return false;
  const diff = validade.getTime() - Date.now();
  return diff > 0 && diff <= 48 * 60 * 60 * 1000;
}

export function fp(v: number): string {
  return v.toFixed(2).replace('.', ',');
}

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function fixImg(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  // https://drive.google.com/file/d/XXXXX/view... -> direct link
  let m = trimmed.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (m) return 'https://lh3.googleusercontent.com/d/' + m[1];
  // https://drive.google.com/open?id=XXXXX -> direct link
  m = trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (m) return 'https://lh3.googleusercontent.com/d/' + m[1];
  // https://drive.google.com/uc?id=XXXXX -> direct link
  m = trimmed.match(/drive\.google\.com\/uc\?.*id=([^&]+)/);
  if (m) return 'https://lh3.googleusercontent.com/d/' + m[1];
  return trimmed;
}

export function ytEmbed(url: string | undefined): string {
  if (!url) return '';
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? 'https://www.youtube.com/embed/' + m[1] : '';
}

export function nameToHex(name: string): string | null {
  const paletas: Record<string, string> = {
    azul: '#2563EB',
    verde: '#2A5C3F',
    vermelho: '#DC2626',
    roxo: '#7C3AED',
    rosa: '#DB2777',
    laranja: '#EA580C',
    dourado: '#B8860B',
    preto: '#1B1B1B',
    marrom: '#78350F',
    turquesa: '#0D9488',
  };
  return paletas[name.toLowerCase().trim()] || null;
}

export function darkenColor(hexColor: string, factor: number): string {
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const r = Math.round(parseInt(hex.substring(0, 2), 16) * factor);
  const g = Math.round(parseInt(hex.substring(2, 4), 16) * factor);
  const b = Math.round(parseInt(hex.substring(4, 6), 16) * factor);
  return '#' + ('0' + r.toString(16)).slice(-2) + ('0' + g.toString(16)).slice(-2) + ('0' + b.toString(16)).slice(-2);
}

export function isLightColor(hexColor: string): boolean {
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}
