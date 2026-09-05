import { jsPDF } from 'jspdf';
import { BrandBible, Color, StyleAuditReport } from '../types';

export interface PdfExportOptions {
  documentType: 'executive' | 'comprehensive'; // 'executive' = 1-page spec sheet; 'comprehensive' = 3-4 page manual
  theme: 'dark' | 'light'; // 'dark' = bold slate-900 headers; 'light' = clean print-friendly ink-saver
  pageSize: 'a4' | 'letter';
  includeAuditReport?: boolean;
  auditReport?: StyleAuditReport | null;
}

export interface PdfExportResult {
  doc: jsPDF;
  blob: Blob;
  blobUrl: string;
  fileName: string;
}

// Color conversion helpers
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.trim().replace(/^#/, '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r: isNaN(r) ? 99 : r, g: isNaN(g) ? 102 : g, b: isNaN(b) ? 241 : b };
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r: isNaN(r) ? 99 : r, g: isNaN(g) ? 102 : g, b: isNaN(b) ? 241 : b };
}

export function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rPrime = r / 255;
  const gPrime = g / 255;
  const bPrime = b / 255;
  const k = 1 - Math.max(rPrime, gPrime, bPrime);
  if (k >= 0.999) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const c = Math.round(((1 - rPrime - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gPrime - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bPrime - k) / (1 - k)) * 100);
  return { c, m, y, k: Math.round(k * 100) };
}

export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function getAccessibilityRating(hex: string): { rating: string; ratio: number; onWhite: number; onDark: number } {
  const onWhite = getContrastRatio(hex, '#ffffff');
  const onDark = getContrastRatio(hex, '#0f172a');
  const bestRatio = Math.max(onWhite, onDark);
  let rating = 'FAIL';
  if (bestRatio >= 7.0) {
    rating = 'AAA';
  } else if (bestRatio >= 4.5) {
    rating = 'AA';
  } else if (bestRatio >= 3.0) {
    rating = 'AA-Large';
  }
  return { rating, ratio: bestRatio, onWhite, onDark };
}

// Clean SVG string and inject viewBox or width/height attributes for crisp rendering
export function cleanSvgMarkup(svgMarkup: string): string {
  let clean = svgMarkup;
  if (clean.includes('```xml')) {
    clean = clean.split('```xml')[1].split('```')[0];
  } else if (clean.includes('```html')) {
    clean = clean.split('```html')[1].split('```')[0];
  } else if (clean.includes('```svg')) {
    clean = clean.split('```svg')[1].split('```')[0];
  } else if (clean.includes('```')) {
    clean = clean.split('```')[1].split('```')[0];
  }
  clean = clean.trim();

  // Ensure xmlns is present
  if (!clean.includes('xmlns=')) {
    clean = clean.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Ensure width and height exist if viewBox exists
  if (!clean.includes('width=') || !clean.includes('height=')) {
    const viewBoxMatch = clean.match(/viewBox="([\d\s.-]+)"/);
    if (viewBoxMatch && viewBoxMatch[1]) {
      const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
      const vbWidth = parts[2] || 400;
      const vbHeight = parts[3] || 400;
      clean = clean.replace('<svg', `<svg width="${vbWidth}" height="${vbHeight}"`);
    } else {
      clean = clean.replace('<svg', '<svg width="400" height="400"');
    }
  }

  return clean;
}

// Convert SVG markup or image URL to a high-res PNG data URL for jsPDF embedding
export async function rasterizeLogoForPdf(logoSource: string | undefined): Promise<string | null> {
  if (!logoSource || !logoSource.trim()) return null;

  const trimmed = logoSource.trim();

  // Direct PNG or JPEG base64 data URLs can be used directly
  if (trimmed.startsWith('data:image/png') || trimmed.startsWith('data:image/jpeg') || trimmed.startsWith('data:image/webp')) {
    return trimmed;
  }

  try {
    let src = trimmed;
    if (trimmed.startsWith('<svg') || trimmed.includes('<svg')) {
      const cleaned = cleanSvgMarkup(trimmed);
      src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleaned)}`;
    }

    return await new Promise<string | null>((resolve) => {
      const img = new Image();
      // Only set crossOrigin if it's a remote URL
      if (src.startsWith('http://') || src.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }

      const timeout = setTimeout(() => {
        resolve(null);
      }, 3500);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          const scale = 2; // 2x scale for sharp print resolution
          const width = (img.naturalWidth && img.naturalWidth > 0) ? img.naturalWidth : 400;
          const height = (img.naturalHeight && img.naturalHeight > 0) ? img.naturalHeight : 400;

          canvas.width = Math.min(width * scale, 1200);
          canvas.height = Math.min(height * scale, 1200);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(null);
          }
        } catch (err) {
          console.warn('Canvas rasterization error:', err);
          resolve(null);
        }
      };

      img.onerror = (err) => {
        clearTimeout(timeout);
        console.warn('Image load error for PDF:', err);
        resolve(null);
      };

      img.src = src;
    });
  } catch (err) {
    console.warn('Rasterize logo catch error:', err);
    return null;
  }
}

/**
 * Draws a backup vector monogram logo mark inside the PDF when no raster image is available
 */
function drawVectorFallbackLogo(doc: jsPDF, x: number, y: number, size: number, companyName: string, primaryColor: string) {
  const rgb = hexToRgb(primaryColor);
  const initial = (companyName.trim()[0] || 'B').toUpperCase();

  // Background square with rounded corners
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.roundedRect(x, y, size, size, 3, 3, 'F');

  // Subtle inner accent frame
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.roundedRect(x + 2, y + 2, size - 4, size - 4, 2, 2, 'S');

  // Initial letter
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size * 0.55);
  doc.text(initial, x + size / 2, y + (size * 0.68), { align: 'center' });
}

/**
 * Primary Generator function
 */
export async function generateBrandPdf(
  bible: BrandBible,
  options: Partial<PdfExportOptions> = {}
): Promise<PdfExportResult> {
  const documentType = options.documentType || 'comprehensive';
  const theme = options.theme || 'dark';
  const pageSize = options.pageSize || 'a4';
  const auditReport = options.auditReport || null;

  // Paper dimensions in millimeters
  const isLetter = pageSize === 'letter';
  const pageWidth = isLetter ? 215.9 : 210;
  const pageHeight = isLetter ? 279.4 : 297;
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSize
  });

  const primaryHex = bible.colorPalette[0]?.hex || '#6366f1';
  const primaryRgb = hexToRgb(primaryHex);
  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Pre-rasterize logo
  const logoDataUrl = await rasterizeLogoForPdf(bible.primaryLogo);

  // Helper for running header bar
  const renderHeader = (pageNumber: number, totalPages: number, subtitle: string) => {
    if (theme === 'dark') {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, pageNumber === 1 ? 40 : 16, 'F');
      
      // Top accent stripe in primary color
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(0, 0, pageWidth, 2.5, 'F');

      if (pageNumber === 1) {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(21);
        doc.text(bible.companyName || 'Brand Identity Specification', marginX, 17);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(165, 180, 252); // indigo-300
        doc.text(`BRAND SPECIFICATION MANUAL  •  ${(bible.industry || 'General Industry').toUpperCase()}`, marginX, 24.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`Target Audience: ${bible.targetAudience || 'Universal'}   |   Issued: ${todayStr}   |   Standard: WCAG 2.1 AA`, marginX, 32);

        // Header right pill
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(pageWidth - marginX - 38, 11, 38, 17, 2, 2, 'F');
        doc.setDrawColor(51, 65, 85);
        doc.roundedRect(pageWidth - marginX - 38, 11, 38, 17, 2, 2, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text('OFFICIAL GUIDE', pageWidth - marginX - 19, 17, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text('EXTERNAL USE', pageWidth - marginX - 19, 23, { align: 'center' });
      } else {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${(bible.companyName || 'BRAND').toUpperCase()}  —  ${subtitle.toUpperCase()}`, marginX, 10);

        doc.setTextColor(165, 180, 252);
        doc.setFontSize(7.5);
        doc.text(`PAGE ${pageNumber} OF ${totalPages}`, pageWidth - marginX, 10, { align: 'right' });
      }
    } else {
      // Light / Minimalist Print Mode
      doc.setFillColor(250, 250, 250);
      doc.rect(0, 0, pageWidth, pageNumber === 1 ? 38 : 15, 'F');
      
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(0, 0, pageWidth, 2, 'F');

      doc.setDrawColor(226, 232, 240);
      doc.line(0, pageNumber === 1 ? 38 : 15, pageWidth, pageNumber === 1 ? 38 : 15);

      if (pageNumber === 1) {
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(21);
        doc.text(bible.companyName || 'Brand Identity Specification', marginX, 16);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.text(`BRAND SPECIFICATION MANUAL  •  ${(bible.industry || 'General Industry').toUpperCase()}`, marginX, 23.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Target Audience: ${bible.targetAudience || 'Universal'}   |   Issued: ${todayStr}   |   External Format`, marginX, 30.5);

        // Header right pill
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(pageWidth - marginX - 38, 10, 38, 16, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
        doc.text('OFFICIAL GUIDE', pageWidth - marginX - 19, 16, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text('EXTERNAL USE', pageWidth - marginX - 19, 21.5, { align: 'center' });
      } else {
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${(bible.companyName || 'BRAND').toUpperCase()}  —  ${subtitle.toUpperCase()}`, marginX, 9.5);

        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.setFontSize(7.5);
        doc.text(`PAGE ${pageNumber} OF ${totalPages}`, pageWidth - marginX, 9.5, { align: 'right' });
      }
    }
  };

  // Helper for footer on each page
  const renderFooter = (pageNumber: number, totalPages: number) => {
    const footerY = pageHeight - 9;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 3, pageWidth - marginX, footerY - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${bible.companyName} Brand Identity Specification  •  Strictly Confidential & Proprietary  •  Generated by Google AI Studio`,
      marginX,
      footerY
    );

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - marginX, footerY, { align: 'right' });
  };

  // =========================================================================
  // OPTION A: 1-PAGE EXECUTIVE BRAND SPECIFICATION SHEET
  // =========================================================================
  if (documentType === 'executive') {
    const totalPages = 1;
    renderHeader(1, totalPages, 'Executive Specification');

    let curY = 46;

    // SECTION 1: Mission Statement & Keywords
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('1. Brand Mission Statement & Core Keywords', marginX, curY);
    curY += 5;

    // Mission Box
    const missionText = bible.mission || 'To deliver exceptional experiences through design clarity, visionary craftsmanship, and customer trust.';
    const splitMission = doc.splitTextToSize(missionText, contentWidth - 14);
    const missionBoxHeight = Math.max(18, splitMission.length * 4.2 + 9);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, curY, contentWidth, missionBoxHeight, 2, 2, 'FD');

    // Left accent bar
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.roundedRect(marginX, curY, 2.5, missionBoxHeight, 1, 1, 'F');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(splitMission, marginX + 6, curY + 6);

    const keywords = (bible.brandKeywords || ['Innovative', 'Trustworthy', 'Refined', 'Visionary']).join('   •   ');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(`CORE VALUES & KEYWORDS:  ${keywords}`, marginX + 6, curY + missionBoxHeight - 3);

    curY += missionBoxHeight + 7;

    // SECTION 2: Primary Logo Mark & Lockup
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('2. Primary Brand Logo & Clearspace Specification', marginX, curY);
    curY += 5;

    const logoCardHeight = 44;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, curY, contentWidth, logoCardHeight, 2.5, 2.5, 'FD');

    // Logo display frame
    const logoFrameWidth = 46;
    const logoFrameHeight = 36;
    const logoFrameX = marginX + 4;
    const logoFrameY = curY + 4;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(logoFrameX, logoFrameY, logoFrameWidth, logoFrameHeight, 2, 2, 'FD');

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', logoFrameX + 4, logoFrameY + 3, logoFrameWidth - 8, logoFrameHeight - 6);
      } catch {
        drawVectorFallbackLogo(doc, logoFrameX + 8, logoFrameY + 4, 28, bible.companyName, primaryHex);
      }
    } else {
      drawVectorFallbackLogo(doc, logoFrameX + 8, logoFrameY + 4, 28, bible.companyName, primaryHex);
    }

    // Logo Details text
    const textX = logoFrameX + logoFrameWidth + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${bible.companyName} Primary Mark`, textX, curY + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('• Vector Master: High-resolution scalable symbol & logotype combination.', textX, curY + 17);
    doc.text('• Isolation Perimeter: Maintain 0.5X margin clearance on all four bounding borders.', textX, curY + 22.5);
    doc.text(`• Minimum Display Dimensions: Digital: 36px height  |  Print Reproduction: 12mm.`, textX, curY + 28);
    doc.text(`• Primary Identity Hex: ${primaryHex.toUpperCase()}  |  Raster Quality: 300 DPI equivalent.`, textX, curY + 33.5);

    if (bible.archetype?.tagline) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text(`Strategic Tagline: "${bible.archetype.tagline}"`, textX, curY + 39);
    }

    curY += logoCardHeight + 7;

    // SECTION 3: 5-Color Design Palette & WCAG Compliance
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('3. 5-Color Design Palette & Accessibility Ratings', marginX, curY);
    curY += 5;

    const palette = (bible.colorPalette && bible.colorPalette.length > 0)
      ? bible.colorPalette.slice(0, 5)
      : [
          { hex: '#6366f1', name: 'Primary Indigo', role: 'Primary', usageNote: 'Primary branding' },
          { hex: '#3b82f6', name: 'Sky Blue', role: 'Secondary', usageNote: 'Secondary accents' },
          { hex: '#10b981', name: 'Emerald', role: 'Accent', usageNote: 'Highlights & alerts' },
          { hex: '#0f172a', name: 'Slate Dark', role: 'Dark Neutral', usageNote: 'Dark typography' },
          { hex: '#f8fafc', name: 'Slate Light', role: 'Light Neutral', usageNote: 'Canvas backgrounds' },
        ];

    const swatchGap = 3.5;
    const swatchWidth = (contentWidth - ((palette.length - 1) * swatchGap)) / palette.length;
    const swatchHeight = 22;

    palette.forEach((col, idx) => {
      const swatchX = marginX + (idx * (swatchWidth + swatchGap));
      const colRgb = hexToRgb(col.hex);
      const cmyk = rgbToCmyk(colRgb.r, colRgb.g, colRgb.b);
      const a11y = getAccessibilityRating(col.hex);

      // Color swatch rect
      doc.setFillColor(colRgb.r, colRgb.g, colRgb.b);
      doc.roundedRect(swatchX, curY, swatchWidth, swatchHeight, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(swatchX, curY, swatchWidth, swatchHeight, 2, 2, 'S');

      // Hex pill inside swatch if space permits
      doc.setFillColor(0, 0, 0);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);

      // Color metadata below swatch
      const metaY = curY + swatchHeight + 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const colNameLines = doc.splitTextToSize(col.name, swatchWidth);
      doc.text(colNameLines[0] || 'Color', swatchX, metaY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text(col.hex.toUpperCase(), swatchX, metaY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`RGB: ${colRgb.r}, ${colRgb.g}, ${colRgb.b}`, swatchX, metaY + 8.5);
      doc.text(`CMYK: ${cmyk.c},${cmyk.m},${cmyk.y},${cmyk.k}`, swatchX, metaY + 12.5);
      doc.text(`Role: ${col.role}`, swatchX, metaY + 16.5);

      // Accessibility badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      if (a11y.rating === 'AAA') {
        doc.setTextColor(16, 185, 129); // emerald-500
      } else if (a11y.rating.startsWith('AA')) {
        doc.setTextColor(99, 102, 241); // indigo-500
      } else {
        doc.setTextColor(239, 68, 68); // rose-500
      }
      doc.text(`WCAG: ${a11y.rating} (${a11y.ratio.toFixed(1)}:1)`, swatchX, metaY + 20.5);
    });

    curY += swatchHeight + 27;

    // SECTION 4: Typography Pairing & Scale
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('4. Typography & Google Font Pairings', marginX, curY);
    curY += 5;

    const typoBoxWidth = (contentWidth - 4) / 2;
    const typoBoxHeight = 36;

    // Box 1: Display Header Font
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, curY, typoBoxWidth, typoBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Display & Heading Typeface', marginX + 5, curY + 6);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(bible.typography?.headerFont || 'Playfair Display', marginX + 5, curY + 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Classification: ${bible.typography?.headerCategory || 'Serif / Modern'}`, marginX + 5, curY + 19);
    doc.text(`Application: ${bible.typography?.headerUsage || 'Hero headlines, large display titles, section covers'}`, marginX + 5, curY + 24.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('SAMPLE: ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdef 12345', marginX + 5, curY + 30.5);

    // Box 2: Body Paragraph Font
    const box2X = marginX + typoBoxWidth + 4;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(box2X, curY, typoBoxWidth, typoBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Body & Interactive Interface Typeface', box2X + 5, curY + 6);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(bible.typography?.bodyFont || 'Plus Jakarta Sans', box2X + 5, curY + 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Classification: ${bible.typography?.bodyCategory || 'Sans-Serif / Clean'}`, box2X + 5, curY + 19);
    doc.text(`Application: ${bible.typography?.bodyUsage || 'Paragraph body copy, data tables, buttons & nav labels'}`, box2X + 5, curY + 24.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('SAMPLE: The quick brown fox jumps over the lazy dog 12345', box2X + 5, curY + 30.5);

    curY += typoBoxHeight + 7;

    // SECTION 5: Archetype & Verbal Identity Snapshot
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('5. Strategic Archetype & Brand Directives', marginX, curY);
    curY += 5;

    const bottomBoxHeight = 32;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, curY, contentWidth, bottomBoxHeight, 2, 2, 'FD');

    // Left sub-col: Archetype
    const colHalf = (contentWidth - 8) / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(`ARCHETYPE: ${(bible.archetype?.primaryArchetype || 'The Creator').toUpperCase()}`, marginX + 5, curY + 6.5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`"${bible.archetype?.tagline || 'Crafting the future through deliberate, visionary form.'}"`, marginX + 5, curY + 12);

    const voiceTone = typeof bible.brandVoice === 'object' ? bible.brandVoice?.tone : (bible.brandVoice || 'Authoritative, clear, and empathetic');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const splitTone = doc.splitTextToSize(`Voice Tone: ${voiceTone}`, colHalf - 6);
    doc.text(splitTone, marginX + 5, curY + 18);

    // Right sub-col: Do & Don't Quick Rules
    const rightColX = marginX + colHalf + 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(rightColX - 3, curY + 3, rightColX - 3, curY + bottomBoxHeight - 3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text('Mandatory Directives (Do):', rightColX, curY + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const do1 = bible.doGuidelines?.[0] || 'Maintain generous negative space around the primary brand mark.';
    const do2 = bible.doGuidelines?.[1] || 'Ensure all typography meets WCAG AA 4.5:1 minimum contrast.';
    doc.text(`• ${do1.length > 55 ? do1.substring(0, 52) + '...' : do1}`, rightColX, curY + 11.5);
    doc.text(`• ${do2.length > 55 ? do2.substring(0, 52) + '...' : do2}`, rightColX, curY + 16.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(239, 68, 68); // rose-500
    doc.text('Prohibited Usages (Don\'t):', rightColX, curY + 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const dont1 = bible.dontGuidelines?.[0] || 'Never stretch, skew, or alter the vector proportions of the logo.';
    const dont2 = bible.dontGuidelines?.[1] || 'Never place text on low-contrast backgrounds.';
    doc.text(`• ${dont1.length > 55 ? dont1.substring(0, 52) + '...' : dont1}`, rightColX, curY + 26.5);
    doc.text(`• ${dont2.length > 55 ? dont2.substring(0, 52) + '...' : dont2}`, rightColX, curY + 30.5);

    renderFooter(1, 1);
  }

  // =========================================================================
  // OPTION B: COMPREHENSIVE 3-PAGE BRAND GUIDELINES MANUAL
  // =========================================================================
  else {
    const hasAudit = Boolean(auditReport);
    const totalPages = hasAudit ? 4 : 3;

    // -----------------------------------------------------------------------
    // PAGE 1: Brand Foundation, Primary Mark & Clearspace Architecture
    // -----------------------------------------------------------------------
    renderHeader(1, totalPages, 'Identity Foundation & Brand Mark');

    let y1 = 46;

    // 1. Executive Mission & Strategic Vision
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. Executive Mission & Strategic Purpose', marginX, y1);
    y1 += 5.5;

    const missionText = bible.mission || 'To empower users with world-class design standards and visionary clarity.';
    const splitMission = doc.splitTextToSize(missionText, contentWidth - 14);
    const missionBoxHeight = Math.max(22, (splitMission.length * 4.5) + 12);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, y1, contentWidth, missionBoxHeight, 2, 2, 'FD');

    // Accent left stripe
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.roundedRect(marginX, y1, 2.5, missionBoxHeight, 1, 1, 'F');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(splitMission, marginX + 7, y1 + 7);

    const keywords = (bible.brandKeywords || ['Visionary', 'Scalable', 'Modern', 'Trustworthy']).join('   •   ');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(`BRAND DNA & KEYWORDS:  ${keywords}`, marginX + 7, y1 + missionBoxHeight - 4);

    y1 += missionBoxHeight + 8;

    // 2. Primary Brand Logo Showcase
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('2. Primary Brand Mark & Visual Clearspace Frame', marginX, y1);
    y1 += 5.5;

    const logoSectionHeight = 72;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, y1, contentWidth, logoSectionHeight, 3, 3, 'FD');

    // Dedicated Logo Canvas Frame
    const canvasFrameWidth = 72;
    const canvasFrameHeight = 60;
    const canvasFrameX = marginX + 6;
    const canvasFrameY = y1 + 6;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(canvasFrameX, canvasFrameY, canvasFrameWidth, canvasFrameHeight, 2, 2, 'FD');

    // Dotted clearspace perimeter
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.roundedRect(canvasFrameX + 4, canvasFrameY + 4, canvasFrameWidth - 8, canvasFrameHeight - 8, 1.5, 1.5, 'S');
    doc.setLineDashPattern([], 0); // reset line dash

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', canvasFrameX + 10, canvasFrameY + 8, canvasFrameWidth - 20, canvasFrameHeight - 16);
      } catch {
        drawVectorFallbackLogo(doc, canvasFrameX + 14, canvasFrameY + 8, 44, bible.companyName, primaryHex);
      }
    } else {
      drawVectorFallbackLogo(doc, canvasFrameX + 14, canvasFrameY + 8, 44, bible.companyName, primaryHex);
    }

    // Clearspace dimension indicators
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('0.5X', canvasFrameX + (canvasFrameWidth / 2), canvasFrameY + 3.2, { align: 'center' });
    doc.text('0.5X', canvasFrameX + (canvasFrameWidth / 2), canvasFrameY + canvasFrameHeight - 1.2, { align: 'center' });

    // Right Column: Mark Specifications
    const specX = canvasFrameX + canvasFrameWidth + 8;
    const specWidth = contentWidth - canvasFrameWidth - 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${bible.companyName} Master Brand Mark`, specX, y1 + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    const specs = [
      'Format & Architecture: Clean Scalable Vector (SVG) rasterized to 300 DPI master.',
      'Clearspace Perimeter: Maintain minimum 0.5X bounding margin (where X is the mark height).',
      'Minimum Size Threshold: Digital: 32px height  •  Print Reproduction: 12.0 mm height.',
      'Color Fidelity: Always present on clean white or slate dark backdrops with locked hex values.',
      'Aspect Ratio Locking: Constrain 1:1 proportion locks across all multi-channel media.',
      `Primary Identity Hex: ${primaryHex.toUpperCase()} (${bible.colorPalette[0]?.name || 'Primary'})`
    ];

    let specY = y1 + 18;
    specs.forEach((s) => {
      const splitS = doc.splitTextToSize(`• ${s}`, specWidth);
      doc.text(splitS, specX, specY);
      specY += (splitS.length * 3.8) + 1.2;
    });

    y1 += logoSectionHeight + 8;

    // 3. Visual Concept & Secondary Marks
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. Secondary Marks & Visual Concept Strategy', marginX, y1);
    y1 += 5.5;

    const secondaryHeight = 44;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, y1, contentWidth, secondaryHeight, 2, 2, 'FD');

    const marks = (bible.secondaryMarks && bible.secondaryMarks.length > 0)
      ? bible.secondaryMarks
      : ['Monogram Icon Mark', 'Horizontal Lockup', 'Vertical Stacked Badge', 'Favicon Tab Symbol'];

    const markWidth = (contentWidth - 10) / marks.length;
    marks.slice(0, 4).forEach((mark, i) => {
      const markX = marginX + 3 + (i * markWidth);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(markX, y1 + 4, markWidth - 3, secondaryHeight - 8, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text(`Variant 0${i + 1}`, markX + 4, y1 + 11);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const splitM = doc.splitTextToSize(mark, markWidth - 10);
      doc.text(splitM, markX + 4, y1 + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Approved Sub-application', markX + 4, y1 + 31);
    });

    renderFooter(1, totalPages);

    // -----------------------------------------------------------------------
    // PAGE 2: 5-Color System, CMYK Formulation & WCAG Contrast Matrix
    // -----------------------------------------------------------------------
    doc.addPage();
    renderHeader(2, totalPages, 'Color System & Accessibility Matrix');

    let y2 = 24;

    // Section 4: 5-Color Design Palette
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('4. Official 5-Color Design Palette Specifications', marginX, y2);
    y2 += 6;

    const palette = (bible.colorPalette && bible.colorPalette.length > 0)
      ? bible.colorPalette.slice(0, 5)
      : [
          { hex: '#6366f1', name: 'Primary Indigo', role: 'Primary', usageNote: 'Primary branding' },
          { hex: '#3b82f6', name: 'Sky Blue', role: 'Secondary', usageNote: 'Secondary accents' },
          { hex: '#10b981', name: 'Emerald', role: 'Accent', usageNote: 'Highlights & alerts' },
          { hex: '#0f172a', name: 'Slate Dark', role: 'Dark Neutral', usageNote: 'Dark typography' },
          { hex: '#f8fafc', name: 'Slate Light', role: 'Light Neutral', usageNote: 'Canvas backgrounds' },
        ];

    const swatchGap = 3.5;
    const swatchWidth = (contentWidth - ((palette.length - 1) * swatchGap)) / palette.length;
    const swatchHeight = 32;

    palette.forEach((col, idx) => {
      const swatchX = marginX + (idx * (swatchWidth + swatchGap));
      const colRgb = hexToRgb(col.hex);
      const cmyk = rgbToCmyk(colRgb.r, colRgb.g, colRgb.b);
      const a11y = getAccessibilityRating(col.hex);

      // Color swatch rect
      doc.setFillColor(colRgb.r, colRgb.g, colRgb.b);
      doc.roundedRect(swatchX, y2, swatchWidth, swatchHeight, 2.5, 2.5, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(swatchX, y2, swatchWidth, swatchHeight, 2.5, 2.5, 'S');

      // Metadata card below
      const cardY = y2 + swatchHeight + 3.5;
      const cardHeight = 44;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(swatchX, cardY, swatchWidth, cardHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const splitName = doc.splitTextToSize(col.name, swatchWidth - 4);
      doc.text(splitName[0] || 'Color', swatchX + 3, cardY + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text(col.hex.toUpperCase(), swatchX + 3, cardY + 11.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`RGB: ${colRgb.r}, ${colRgb.g}, ${colRgb.b}`, swatchX + 3, cardY + 16.5);
      doc.text(`CMYK: ${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`, swatchX + 3, cardY + 21);
      doc.text(`Role: ${col.role}`, swatchX + 3, cardY + 25.5);

      // Usage Note
      const usageSnippet = col.usageNote ? (col.usageNote.length > 25 ? col.usageNote.substring(0, 23) + '...' : col.usageNote) : 'Brand design';
      doc.text(`Use: ${usageSnippet}`, swatchX + 3, cardY + 30);

      // A11y Badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      if (a11y.rating === 'AAA') {
        doc.setTextColor(16, 185, 129);
      } else if (a11y.rating.startsWith('AA')) {
        doc.setTextColor(99, 102, 241);
      } else {
        doc.setTextColor(239, 68, 68);
      }
      doc.text(`A11y ${a11y.rating} (${a11y.ratio.toFixed(1)}:1)`, swatchX + 3, cardY + 37);
    });

    y2 += swatchHeight + 54;

    // Section 5: The 60-30-10 Color Hierarchy Rule
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('5. Application Ratio & Visual Weight Strategy (60-30-10 Rule)', marginX, y2);
    y2 += 6;

    const ratioBoxHeight = 24;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, y2, contentWidth, ratioBoxHeight, 2, 2, 'FD');

    // Visual bar
    const barWidth = contentWidth - 10;
    const barX = marginX + 5;
    const barY = y2 + 4;
    const barH = 7;

    // 60% Light Neutral
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(barX, barY, barWidth * 0.6, barH, 1, 1, 'F');
    // 30% Dark Neutral / Secondary
    doc.setFillColor(15, 23, 42);
    doc.rect(barX + (barWidth * 0.6), barY, barWidth * 0.3, barH, 'F');
    // 10% Primary Accent
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.roundedRect(barX + (barWidth * 0.9), barY, barWidth * 0.1, barH, 1, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('• 60% Dominant Base: Clean canvas spaces, surface containers, and neutral white space.', barX, y2 + 15);
    doc.text('• 30% Structural Frame: High-contrast typography, dividers, cards, and secondary UI components.', barX, y2 + 19);
    doc.text(`• 10% Focal Accents: Key call-to-actions, active indicators, and hero brand moments (${primaryHex.toUpperCase()}).`, barX, y2 + 23);

    y2 += ratioBoxHeight + 8;

    // Section 6: WCAG 2.1 Full Color Contrast Compliance Matrix
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('6. WCAG 2.1 Contrast Matrix & Text Legibility Audit', marginX, y2);
    y2 += 6;

    const matrixHeight = 64;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, y2, contentWidth, matrixHeight, 2, 2, 'FD');

    // Matrix Table Header
    const colStep = (contentWidth - 36) / 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Text on Background:', marginX + 4, y2 + 6);

    palette.forEach((bgCol, j) => {
      doc.text(bgCol.name.length > 9 ? bgCol.name.substring(0, 8) + '..' : bgCol.name, marginX + 38 + (j * colStep), y2 + 6);
    });

    let rowY = y2 + 12;
    palette.forEach((textCol) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(15, 23, 42);
      doc.text(textCol.name.length > 10 ? textCol.name.substring(0, 9) + '..' : textCol.name, marginX + 4, rowY + 3.5);

      palette.forEach((bgCol, j) => {
        const ratio = getContrastRatio(textCol.hex, bgCol.hex);
        const cellX = marginX + 38 + (j * colStep);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        if (ratio >= 7.0) {
          doc.setTextColor(16, 185, 129); // AAA
          doc.text(`AAA ${ratio.toFixed(1)}`, cellX, rowY + 3.5);
        } else if (ratio >= 4.5) {
          doc.setTextColor(99, 102, 241); // AA
          doc.text(`AA ${ratio.toFixed(1)}`, cellX, rowY + 3.5);
        } else if (ratio >= 3.0) {
          doc.setTextColor(245, 158, 11); // Large
          doc.text(`Lg ${ratio.toFixed(1)}`, cellX, rowY + 3.5);
        } else {
          doc.setTextColor(203, 213, 225); // Fail
          doc.text(`- ${ratio.toFixed(1)}`, cellX, rowY + 3.5);
        }
      });
      rowY += 9;
    });

    // Summary line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text('Key: AAA = Pass Enhanced (>=7:1) | AA = Pass Standard (>=4.5:1) | Lg = Large Text Only (>=3:1) | - = Fail', marginX + 4, y2 + matrixHeight - 3);

    renderFooter(2, totalPages);

    // -----------------------------------------------------------------------
    // PAGE 3: Typography, Verbal Identity, Archetype & Usage Directives
    // -----------------------------------------------------------------------
    doc.addPage();
    renderHeader(3, totalPages, 'Typography, Voice & Governance');

    let y3 = 24;

    // Section 7: Typography & Google Font Scale
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('7. Typography System & Google Font Hierarchy', marginX, y3);
    y3 += 6;

    const typoBoxWidth = (contentWidth - 4) / 2;
    const typoBoxHeight = 44;

    // Header font box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, y3, typoBoxWidth, typoBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Primary Display & Heading Font', marginX + 5, y3 + 7);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(bible.typography?.headerFont || 'Playfair Display', marginX + 5, y3 + 15.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Classification: ${bible.typography?.headerCategory || 'Display / Serif'}`, marginX + 5, y3 + 22);
    doc.text(`Application: ${bible.typography?.headerUsage || 'Primary headings, section dividers, hero banners'}`, marginX + 5, y3 + 27.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('SAMPLE: ABCDEFGHIJKLMNOPQRSTUVWXYZ 12345', marginX + 5, y3 + 34);
    doc.text('GLYPHS: !@#$%^&*()_+-=[]{}|;:,.<>?', marginX + 5, y3 + 39.5);

    // Body font box
    const box2X = marginX + typoBoxWidth + 4;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(box2X, y3, typoBoxWidth, typoBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Body Copy & Interactive UI Font', box2X + 5, y3 + 7);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(bible.typography?.bodyFont || 'Plus Jakarta Sans', box2X + 5, y3 + 15.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Classification: ${bible.typography?.bodyCategory || 'Clean Sans-Serif'}`, box2X + 5, y3 + 22);
    doc.text(`Application: ${bible.typography?.bodyUsage || 'Paragraph copy, data labels, button microcopy, tables'}`, box2X + 5, y3 + 27.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('SAMPLE: The quick brown fox jumps over the lazy dog', box2X + 5, y3 + 34);
    doc.text('WEIGHTS: Regular (400) • Medium (500) • SemiBold (600)', box2X + 5, y3 + 39.5);

    y3 += typoBoxHeight + 8;

    // Section 8: Brand Archetype & Strategic Verbal Identity
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('8. Strategic Brand Archetype & Verbal Identity', marginX, y3);
    y3 += 6;

    const voiceBoxHeight = 36;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, y3, contentWidth, voiceBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(`PRIMARY ARCHETYPE: ${(bible.archetype?.primaryArchetype || 'The Creator').toUpperCase()}`, marginX + 6, y3 + 7);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Tagline: "${bible.archetype?.tagline || 'Crafting deliberate, transformative experiences.'}"`, marginX + 6, y3 + 13.5);

    const voiceObj = typeof bible.brandVoice === 'object' ? bible.brandVoice : null;
    const voiceTone = voiceObj?.tone || (typeof bible.brandVoice === 'string' ? bible.brandVoice : 'Authoritative, clear, and inspiring.');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const splitTone = doc.splitTextToSize(`Tone of Voice: "${voiceTone}"`, contentWidth - 12);
    doc.text(splitTone, marginX + 6, y3 + 20);

    if (voiceObj?.aboutUsParagraph) {
      const splitStory = doc.splitTextToSize(`Narrative Hook: "${voiceObj.aboutUsParagraph}"`, contentWidth - 12);
      doc.text(splitStory[0] || '', marginX + 6, y3 + 28);
    } else {
      doc.text('Verbal Directives: Emphasize precision, eliminate buzzwords, and speak with unwavering clarity.', marginX + 6, y3 + 28);
    }

    y3 += voiceBoxHeight + 8;

    // Section 9: Mandatory Directives (Do's & Don'ts)
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('9. Brand Governance & Usage Directives (Do\'s & Don\'ts)', marginX, y3);
    y3 += 6;

    const rulesWidth = (contentWidth - 4) / 2;
    const rulesHeight = 52;

    // DO BOX
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(marginX, y3, rulesWidth, rulesHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(6, 95, 70); // emerald-800
    doc.text('Mandatory Directives (Do)', marginX + 6, y3 + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    let doY = y3 + 14;
    const doList = (bible.doGuidelines && bible.doGuidelines.length > 0)
      ? bible.doGuidelines.slice(0, 4)
      : [
          'Maintain generous negative space around all official marks.',
          'Ensure typography meets WCAG AA 4.5:1 minimum contrast.',
          'Use primary accent color strictly for key visual priorities.',
          'Lock aspect ratios on all vector assets.'
        ];

    doList.forEach((rule) => {
      const splitR = doc.splitTextToSize(`• ${rule}`, rulesWidth - 10);
      doc.text(splitR, marginX + 6, doY);
      doY += (splitR.length * 3.8) + 1;
    });

    // DON'T BOX
    const dontBoxX = marginX + rulesWidth + 4;
    doc.setFillColor(254, 242, 242); // rose-50
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(dontBoxX, y3, rulesWidth, rulesHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(159, 18, 57); // rose-800
    doc.text('Prohibited Usages (Don\'t)', dontBoxX + 6, y3 + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    let dontY = y3 + 14;
    const dontList = (bible.dontGuidelines && bible.dontGuidelines.length > 0)
      ? bible.dontGuidelines.slice(0, 4)
      : [
          'Never stretch, rotate, or skew the brand mark vectors.',
          'Never place typography over low-contrast background images.',
          'Never invent unauthorized tertiary color variations.',
          'Never omit required padding around identity badges.'
        ];

    dontList.forEach((rule) => {
      const splitR = doc.splitTextToSize(`• ${rule}`, rulesWidth - 10);
      doc.text(splitR, dontBoxX + 6, dontY);
      dontY += (splitR.length * 3.8) + 1;
    });

    y3 += rulesHeight + 6;

    // Digital Assets: Pattern & Favicon note
    if (bible.pattern || bible.favicon) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(marginX, y3, contentWidth, 14, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text('DIGITAL COMPANION ASSETS:', marginX + 5, y3 + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      const patternNote = bible.pattern ? `Seamless Pattern: "${bible.pattern.patternName}"` : '';
      const faviconNote = bible.favicon ? `Favicon: "${bible.favicon.faviconName}"` : '';
      doc.text(`${patternNote}   |   ${faviconNote}   |   Optimized for print collateral, packaging, web tabs, and native apps.`, marginX + 5, y3 + 10.5);
    }

    renderFooter(3, totalPages);

    // -----------------------------------------------------------------------
    // PAGE 4 (OPTIONAL): Automated Style Audit Quality Report
    // -----------------------------------------------------------------------
    if (hasAudit && auditReport) {
      doc.addPage();
      renderHeader(4, totalPages, 'Automated Style Audit Quality Report');

      let y4 = 24;

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('10. Automated Style Audit Quality Report', marginX, y4);
      y4 += 6;

      const auditCardHeight = 40;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(marginX, y4, contentWidth, auditCardHeight, 2.5, 2.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text(`Overall Brand Quality Score: ${auditReport.overallScore}/100  —  "${auditReport.ratingTagline || 'High Quality'}"`, marginX + 6, y4 + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`• Color Contrast Audit Score: ${auditReport.colorContrastReport?.score ?? 95}/100 (${auditReport.colorContrastReport?.status || 'OPTIMAL'})`, marginX + 6, y4 + 16);
      doc.text(`• Typography Legibility Score: ${auditReport.fontLegibilityReport?.score ?? 90}/100 (${auditReport.fontLegibilityReport?.status || 'PASSED'})`, marginX + 6, y4 + 22);
      doc.text(`• Archetype Consistency Score: ${auditReport.archetypeConsistencyReport?.score ?? 92}/100 (${auditReport.archetypeConsistencyReport?.status || 'OPTIMAL'})`, marginX + 6, y4 + 28);
      doc.text(`• Overall Strategic Health: WCAG 2.1 Compliant with locked color hierarchy`, marginX + 6, y4 + 34);

      y4 += auditCardHeight + 8;

      // Actionable Recommendations
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Actionable Architectural Recommendations', marginX, y4);
      y4 += 5.5;

      const recs = auditReport.actionableImprovements || [
        'Maintain current high-contrast pairings across all external marketing collateral.',
        'Use secondary marks for favicon and mobile launcher icon representations.',
        'Apply consistent 0.5X margin clearances across all printed mediums.'
      ];

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      const recsHeight = Math.max(30, (recs.length * 6) + 10);
      doc.roundedRect(marginX, y4, contentWidth, recsHeight, 2, 2, 'FD');

      let recY = y4 + 7;
      recs.forEach((rec, idx) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.text(`0${idx + 1}`, marginX + 6, recY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
        const splitRec = doc.splitTextToSize(rec, contentWidth - 22);
        doc.text(splitRec, marginX + 14, recY);
        recY += (splitRec.length * 4) + 2.5;
      });

      renderFooter(4, totalPages);
    }
  }

  // Generate binary output and blob URL
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const cleanName = (bible.companyName || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fileName = `${cleanName}-${documentType}-specification.pdf`;

  return { doc, blob, blobUrl, fileName };
}

/**
 * Downloads the Brand PDF directly to the user's filesystem
 */
export async function downloadBrandPdf(
  bible: BrandBible,
  options: Partial<PdfExportOptions> = {}
): Promise<string> {
  const { doc, fileName } = await generateBrandPdf(bible, options);
  doc.save(fileName);
  return fileName;
}

/**
 * Opens a generated PDF blob in a new tab/window for immediate preview
 */
export async function previewBrandPdfInNewTab(
  bible: BrandBible,
  options: Partial<PdfExportOptions> = {}
): Promise<void> {
  const { blobUrl } = await generateBrandPdf(bible, options);
  window.open(blobUrl, '_blank');
}
