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

export interface VoiceMetric {
  attribute: string;
  value: number; // 0 to 100
  description?: string;
}

export interface BrandVoice {
  tone: string; // e.g. "Authoritative, clear, and educational yet highly empathetic."
  personalityKeywords: string[]; // e.g. ["Transparent", "Uplifting", "Confident"]
  doVoiceRules: string[]; // e.g. ["Use active voice", "Keep sentences punchy"]
  dontVoiceRules: string[]; // e.g. ["Don't use salesy hyperbole", "Don't sound indifferent"]
  samplePhrases: string[]; // e.g. ["We're in this together.", "Making complex simple."]
  metrics?: VoiceMetric[];
}

export interface BrandBible {
  id: string;
  companyName: string;
  mission: string;
  industry: string;
  targetAudience: string;
  brandKeywords: string[];
  brandVoice: string | BrandVoice;
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
