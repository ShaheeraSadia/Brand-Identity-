import { Color } from '../types';

export type PatternType =
  | 'dots'
  | 'stripes'
  | 'hexagons'
  | 'checkerboard'
  | 'chevron'
  | 'rings'
  | 'triangles'
  | 'grid'
  | 'memphis';

export interface PatternInfo {
  id: PatternType;
  name: string;
  category: string;
  description: string;
}

export const BRAND_PATTERN_TEMPLATES: PatternInfo[] = [
  {
    id: 'dots',
    name: 'Polka Dots Grid',
    category: 'Minimal & Clean',
    description: 'Symmetrical circular grid that introduces subtle rhythm and structured elegance to brand layouts.'
  },
  {
    id: 'stripes',
    name: 'Diagonal Stripes',
    category: 'Dynamic & Linear',
    description: 'Angled parallel lines that create momentum, speed, and modern architectural direction.'
  },
  {
    id: 'hexagons',
    name: 'Honeycomb Hexagons',
    category: 'Structural Tech',
    description: 'Interlocking hexagonal cells conveying precision, modular synergy, and strength.'
  },
  {
    id: 'checkerboard',
    name: 'Geometric Checker',
    category: 'Bold & Contrast',
    description: 'High-contrast alternating square grid for statement backgrounds and packaging borders.'
  },
  {
    id: 'chevron',
    name: 'Zig-Zag Chevrons',
    category: 'Dynamic Motion',
    description: 'V-shaped repeating bands delivering energetic rhythm and visual flow.'
  },
  {
    id: 'rings',
    name: 'Concentric Rings',
    category: 'Organic Radiance',
    description: 'Overlapping circular ripples symbolizing expansion, connectivity, and focus.'
  },
  {
    id: 'triangles',
    name: 'Geometric Tessellation',
    category: 'Modern Abstract',
    description: 'Interlocking triangular facets presenting multidimensional depth and energy.'
  },
  {
    id: 'grid',
    name: 'Architectural Mesh',
    category: 'Technical Blueprint',
    description: 'Precision wireframe grid with accent nodes for tech platforms, UI, and corporate stationery.'
  },
  {
    id: 'memphis',
    name: 'Memphis Geometry',
    category: 'Playful & Creative',
    description: 'Eclectic mixture of floating circles, triangles, crosses, and pills using the full brand palette.'
  }
];

export interface PatternGeneratorOptions {
  type: PatternType;
  scale?: number; // scale in px, default 40
  bgColor?: string;
  fgColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  opacity?: number; // 0 to 1
}

// Safely escape hex for SVG embedding
function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generatePatternSvg({
  type,
  scale = 40,
  bgColor = '#ffffff',
  fgColor = '#4f46e5',
  secondaryColor = '#10b981',
  accentColor = '#f59e0b',
  opacity = 0.85
}: PatternGeneratorOptions): string {
  const bg = escapeXml(bgColor);
  const fg = escapeXml(fgColor);
  const sec = escapeXml(secondaryColor || fgColor);
  const acc = escapeXml(accentColor || fgColor);
  const op = Math.max(0.01, Math.min(1, opacity));

  let svgContent = '';
  let width = scale;
  let height = scale;

  switch (type) {
    case 'dots': {
      const r = Math.max(2, scale / 6);
      svgContent = `
        <rect width="100%" height="100%" fill="${bg}" />
        <circle cx="${scale / 2}" cy="${scale / 2}" r="${r}" fill="${fg}" opacity="${op}" />
        <circle cx="0" cy="0" r="${r / 2}" fill="${acc}" opacity="${op * 0.8}" />
        <circle cx="${scale}" cy="0" r="${r / 2}" fill="${acc}" opacity="${op * 0.8}" />
        <circle cx="0" cy="${scale}" r="${r / 2}" fill="${acc}" opacity="${op * 0.8}" />
        <circle cx="${scale}" cy="${scale}" r="${r / 2}" fill="${acc}" opacity="${op * 0.8}" />
      `;
      break;
    }

    case 'stripes': {
      const strokeW = Math.max(2, scale / 4);
      svgContent = `
        <rect width="100%" height="100%" fill="${bg}" />
        <path d="M-1,1 l2,-2 M0,${scale} l${scale},-${scale} M${scale - 1},${scale + 1} l2,-2" stroke="${fg}" stroke-width="${strokeW}" opacity="${op}" />
        <path d="M0,${scale / 2} l${scale / 2},-${scale / 2}" stroke="${acc}" stroke-width="${strokeW / 2}" opacity="${op * 0.7}" />
      `;
      break;
    }

    case 'hexagons': {
      width = Math.round(scale * 1.732);
      height = scale * 2;
      const sw = Math.max(1, scale / 15);
      svgContent = `
        <rect width="100%" height="100%" fill="${bg}" />
        <path d="M 0,${scale * 0.5} L ${width / 2},0 L ${width},${scale * 0.5} L ${width},${scale * 1.5} L ${width / 2},${scale * 2} L 0,${scale * 1.5} Z" fill="none" stroke="${fg}" stroke-width="${sw}" opacity="${op}" />
        <circle cx="${width / 2}" cy="${scale}" r="${scale / 8}" fill="${acc}" opacity="${op * 0.9}" />
      `;
      break;
    }

    case 'checkerboard': {
      const hSize = scale / 2;
      svgContent = `
        <rect width="100%" height="100%" fill="${bg}" />
        <rect x="0" y="0" width="${hSize}" height="${hSize}" fill="${fg}" opacity="${op}" />
        <rect x="${hSize}" y="${hSize}" width="${hSize}" height="${hSize}" fill="${fg}" opacity="${op}" />
        <rect x="${hSize}" y="0" width="${hSize}" height="${hSize}" fill="${sec}" opacity="${op * 0.5}" />
        <rect x="0" y="${hSize}" width="${hSize}" height="${hSize}" fill="${sec}" opacity="${op * 0.5}" />
      `;
      break;
    }

    case 'chevron': {
      svgContent = `
        <rect width="100%" height="100%" fill="${bg}" />
        <path d="M 0,${scale / 2} L ${scale / 2},0 L ${scale},${scale / 2} L ${scale},${scale * 0.75} L ${scale / 2},${scale * 0.25} L 0,${scale * 0.75} Z" fill="${fg}" opacity="${op}" />
        <path d="M 0,${scale} L ${scale / 2},${scale / 2} L ${scale},${scale} L ${scale},${scale * 1.25} L ${scale / 2},${scale * 0.75} L 0,${scale * 1.25} Z" fill="${acc}" opacity="${op * 0.85}" />
      `;
      break;
    }

    case 'rings': {
      const strokeW = Math.max(1.5, scale / 16);
      svgContent = `
        <rect width="100%" height="100%" fill="${bg}" />
        <circle cx="0" cy="0" r="${scale * 0.75}" fill="none" stroke="${fg}" stroke-width="${strokeW}" opacity="${op}" />
        <circle cx="0" cy="0" r="${scale * 0.45}" fill="none" stroke="${acc}" stroke-width="${strokeW}" opacity="${op}" />
        <circle cx="${scale}" cy="${scale}" r="${scale * 0.75}" fill="none" stroke="${fg}" stroke-width="${strokeW}" opacity="${op}" />
        <circle cx="${scale}" cy="${scale}" r="${scale * 0.45}" fill="none" stroke="${sec}" stroke-width="${strokeW}" opacity="${op}" />
      `;
      break;
    }

    case 'triangles': {
      svgContent = `
        <rect width="100%" height="100%" fill="${bg}" />
        <polygon points="0,0 ${scale},0 ${scale / 2},${scale / 2}" fill="${fg}" opacity="${op * 0.8}" />
        <polygon points="${scale},0 ${scale},${scale} ${scale / 2},${scale / 2}" fill="${acc}" opacity="${op * 0.9}" />
        <polygon points="${scale},${scale} 0,${scale} ${scale / 2},${scale / 2}" fill="${sec}" opacity="${op * 0.7}" />
        <polygon points="0,${scale} 0,0 ${scale / 2},${scale / 2}" fill="${fg}" opacity="${op * 0.6}" />
      `;
      break;
    }

    case 'grid': {
      const sw = Math.max(1, scale / 24);
      svgContent = `
        <rect width="100%" height="100%" fill="${bg}" />
        <path d="M ${scale},0 L 0,0 0,${scale}" fill="none" stroke="${fg}" stroke-width="${sw}" opacity="${op}" />
        <circle cx="0" cy="0" r="${scale / 10}" fill="${acc}" opacity="${op}" />
        <circle cx="${scale}" cy="0" r="${scale / 12}" fill="${sec}" opacity="${op * 0.8}" />
      `;
      break;
    }

    case 'memphis': {
      width = scale * 2;
      height = scale * 2;
      svgContent = `
        <rect width="100%" height="100%" fill="${bg}" />
        <circle cx="${scale * 0.5}" cy="${scale * 0.5}" r="${scale * 0.25}" fill="${fg}" opacity="${op}" />
        <polygon points="${scale * 1.5},${scale * 0.2} ${scale * 1.8},${scale * 0.7} ${scale * 1.2},${scale * 0.7}" fill="${acc}" opacity="${op}" />
        <rect x="${scale * 0.25}" y="${scale * 1.25}" width="${scale * 0.45}" height="${scale * 0.45}" rx="${scale * 0.1}" fill="${sec}" opacity="${op}" />
        <line x1="${scale * 1.3}" y1="${scale * 1.3}" x2="${scale * 1.7}" y2="${scale * 1.7}" stroke="${fg}" stroke-width="${scale * 0.08}" stroke-linecap="round" opacity="${op}" />
        <line x1="${scale * 1.7}" y1="${scale * 1.3}" x2="${scale * 1.3}" y2="${scale * 1.7}" stroke="${fg}" stroke-width="${scale * 0.08}" stroke-linecap="round" opacity="${op}" />
      `;
      break;
    }

    default:
      svgContent = `<rect width="100%" height="100%" fill="${bg}" />`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${svgContent}</svg>`;
}

export function generatePatternDataUrl(options: PatternGeneratorOptions): string {
  const svg = generatePatternSvg(options);
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export function generatePatternCssRule(options: PatternGeneratorOptions): string {
  const dataUrl = generatePatternDataUrl(options);
  return `background-image: url("${dataUrl}");\nbackground-repeat: repeat;`;
}

// Helper to resolve colors from brand color palette array
export function extractBrandColors(palette: Color[]) {
  const getByRole = (role: string, fallback: string) => {
    const found = palette.find(c => c.role.toLowerCase().includes(role.toLowerCase()));
    return found ? found.hex : fallback;
  };

  const primary = getByRole('primary', palette[0]?.hex || '#4f46e5');
  const secondary = getByRole('secondary', palette[1]?.hex || '#10b981');
  const accent = getByRole('accent', palette[2]?.hex || '#f59e0b');
  const darkNeutral = getByRole('dark', palette[3]?.hex || '#1e293b');
  const lightNeutral = getByRole('light', palette[4]?.hex || '#f8fafc');

  return { primary, secondary, accent, darkNeutral, lightNeutral };
}
