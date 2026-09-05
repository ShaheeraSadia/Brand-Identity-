import { BrandBible } from '../types';

export function encodeBrandBibleToHash(bible: BrandBible): string {
  try {
    const jsonStr = JSON.stringify(bible);
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return window.btoa(
        encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );
    }
    return Buffer.from(jsonStr, 'utf-8').toString('base64');
  } catch (err) {
    console.error("Failed to encode brand bible:", err);
    return bible.id;
  }
}

export function decodeBrandBibleFromHash(hashData: string): BrandBible | null {
  try {
    if (!hashData) return null;
    let cleaned = hashData.trim();
    if (cleaned.startsWith('#')) cleaned = cleaned.substring(1);
    if (cleaned.startsWith('share=')) cleaned = cleaned.substring(6);
    cleaned = cleaned.split('&')[0];

    if (cleaned.includes('%')) {
      try {
        cleaned = decodeURIComponent(cleaned);
      } catch {
        // keep as is
      }
    }

    let jsonStr = '';
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      jsonStr = decodeURIComponent(
        Array.prototype.map.call(window.atob(cleaned), (c: string) =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
    } else {
      jsonStr = Buffer.from(cleaned, 'base64').toString('utf-8');
    }

    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object' && (parsed.companyName || parsed.mission)) {
      return parsed as BrandBible;
    }
  } catch (err) {
    console.error("Failed to decode brand bible from hash:", err);
  }
  return null;
}

export function generateShareableUrl(bible: BrandBible): string {
  const encoded = encodeBrandBibleToHash(bible);
  if (typeof window !== 'undefined') {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return `${baseUrl}#share=${encoded}`;
  }
  return `#share=${encoded}`;
}
