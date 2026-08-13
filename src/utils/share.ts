import { BrandBible } from '../types';

export function encodeBrandBibleToHash(bible: BrandBible): string {
  try {
    const jsonStr = JSON.stringify(bible);
    const base64 = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
    return base64;
  } catch (err) {
    console.error("Failed to encode brand bible:", err);
    return bible.id;
  }
}

export function decodeBrandBibleFromHash(hashData: string): BrandBible | null {
  try {
    const decoded = decodeURIComponent(
      Array.prototype.map.call(atob(hashData), (c: string) =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === 'object' && parsed.companyName && parsed.mission) {
      return parsed as BrandBible;
    }
  } catch (err) {
    console.error("Failed to decode brand bible from hash:", err);
  }
  return null;
}

export function generateShareableUrl(bible: BrandBible): string {
  const encoded = encodeBrandBibleToHash(bible);
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}#share=${encoded}`;
}
