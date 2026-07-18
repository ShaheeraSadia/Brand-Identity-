export interface Color {
  hex: string;
  name: string;
  role: string; // e.g. "Primary", "Secondary", "Accent", "Dark Neutral", "Light Neutral"
  usageNote: string;
}

export interface FontPairing {
  headerFont: string;
  headerCategory: string; // Sans-serif, Serif, Display, Monospace
  headerUsage: string;
  bodyFont: string;
  bodyCategory: string;
  bodyUsage: string;
}

export interface ArchetypeScore {
  archetype: string; // e.g. "The Creator", "The Hero"
  score: number; // 0 to 100
  description: string;
}

export interface BrandArchetype {
  primaryArchetype: string; // e.g. "The Creator"
  tagline: string;
  summary: string;
  scores: ArchetypeScore[];
  attributes: string[];
}

export interface BrandPattern {
  patternName: string;
  description: string;
  svgMarkup: string;
}

export interface BrandFavicon {
  faviconName: string;
  explanation: string;
  svgMarkup: string;
}

export interface BrandBible {
  id: string;
  companyName: string;
  mission: string;
  industry: string;
  targetAudience: string;
  brandKeywords: string[];
  brandVoice: string;
  logoPrompt: string; // Prompt used to generate the logo
  primaryLogo?: string; // base64 data URL
  previousLogos?: string[]; // list of all previously generated logos
  secondaryMarks: string[]; // List of visual concepts or symbols
  colorPalette: Color[];
  typography: FontPairing;
  doGuidelines: string[];
  dontGuidelines: string[];
  createdAt: string;
  archetype?: BrandArchetype;
  brandPersonality?: number;
  pattern?: BrandPattern;
  favicon?: BrandFavicon;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
}
