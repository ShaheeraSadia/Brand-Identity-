// Resilient client-side and server fallback generator for Brand Bible specifications
import { BrandBible, BrandVoice, Color, FontPairing, BrandArchetype } from "../types";

export interface FallbackInput {
  companyName?: string;
  mission?: string;
  industry?: string;
  targetAudience?: string;
  brandPersonality?: number;
  customInstructions?: string;
}

export function generateFallbackBrandBible(data: FallbackInput): Omit<BrandBible, "id" | "createdAt"> {
  const companyName = data.companyName?.trim() || "Innovate Studio";
  const mission = data.mission?.trim() || "Empowering teams with visionary design and intuitive experiences.";
  const industry = data.industry?.trim() || "Technology & Design";
  const targetAudience = data.targetAudience?.trim() || "Forward-thinking builders & leaders";
  const personality = Number(data.brandPersonality ?? 50);

  // Palette synthesis based on personality
  let primaryHex = "#4F46E5";
  let secondaryHex = "#0F172A";
  let accentHex = "#F59E0B";
  let headerFont = "Space Grotesk";
  let bodyFont = "Plus Jakarta Sans";
  let toneSummary = `Authoritative, inspiring, and clear tailored specifically for ${targetAudience}.`;

  if (personality < 35) {
    // Minimalist, serious, corporate
    primaryHex = "#1E293B";
    secondaryHex = "#334155";
    accentHex = "#0284C7";
    headerFont = "Cabinet Grotesk";
    bodyFont = "Inter";
    toneSummary = `Refined, measured, and executive with emphasis on strategic precision for ${targetAudience}.`;
  } else if (personality > 65) {
    // Vibrant, playful, energetic
    primaryHex = "#7C3AED";
    secondaryHex = "#06B6D4";
    accentHex = "#F43F5E";
    headerFont = "Clash Display";
    bodyFont = "Outfit";
    toneSummary = `Energetic, playful, and boldly optimistic designed to engage and delight ${targetAudience}.`;
  }

  const voice: BrandVoice = {
    tone: toneSummary,
    personalityKeywords: personality > 65 
      ? ["Playful", "Visionary", "Dynamic"] 
      : personality < 35 
      ? ["Authoritative", "Precise", "Sophisticated"] 
      : ["Empathetic", "Confident", "Direct"],
    aboutUsParagraph: `${companyName} is dedicated to pioneering transformative solutions across the ${industry} landscape. Guided by our purpose—"${mission}"—we unite craft, precision, and strategic clarity to create enduring value for ${targetAudience}.`,
    doVoiceRules: [
      "Keep sentences concise, active, and impactful",
      "Focus on tangible user outcomes and strategic clarity",
      "Use warm, confident language that empowers the reader",
      "Highlight human-centric value and thoughtful design"
    ],
    dontVoiceRules: [
      "Avoid dense corporate jargon, hyperbole, and buzzwords",
      "Do not sound robotic, indifferent, or overly distant",
      "Avoid making unbacked claims or aggressive sales pitches",
      "Don't rely on passive phrasing or complex terminology"
    ],
    samplePhrases: [
      `Empowering ${targetAudience} with purpose.`,
      `Designed with precision. Built for ${companyName}.`,
      "Clarity, craft, and conviction in every interaction."
    ]
  };

  const colorPalette: Color[] = [
    {
      hex: primaryHex,
      name: "Primary Signature",
      role: "Primary",
      usageNote: "Main accent color for primary emblems, call-to-action buttons, and signature touchpoints."
    },
    {
      hex: secondaryHex,
      name: "Deep Contrast",
      role: "Dark Neutral",
      usageNote: "Primary color for headings, dark card canvases, and high-contrast typography."
    },
    {
      hex: accentHex,
      name: "Vibrant Energy",
      role: "Accent",
      usageNote: "Apply selectively for badge highlights, active states, and critical notification signals."
    },
    {
      hex: "#64748B",
      name: "Slate Balance",
      role: "Secondary",
      usageNote: "Ideal for secondary action buttons, card borders, and subtle structural dividers."
    },
    {
      hex: "#F8FAFC",
      name: "Off-White Canvas",
      role: "Light Neutral",
      usageNote: "Dominant background canvas for light-mode screens, cards, and spacious layouts."
    }
  ];

  const typography: FontPairing = {
    headerFont,
    headerCategory: "Sans-serif",
    headerUsage: "Use bold weights with subtle letter-spacing for prominent display headings.",
    bodyFont,
    bodyCategory: "Sans-serif",
    bodyUsage: "Apply regular weight with 1.6 line height for paragraphs and body copy."
  };

  const archetype: BrandArchetype = {
    primaryArchetype: personality > 65 ? "The Magician" : personality < 35 ? "The Sage" : "The Creator",
    tagline: `Pioneering the future of ${industry}`,
    summary: `${companyName} embodies this archetype by synthesizing strategic vision into elegant, high-impact experiences for ${targetAudience}.`,
    attributes: ["Visionary", "Innovative", "Expressive"],
    scores: [
      { archetype: "The Creator", score: 92, description: "Core drive to innovate, craft distinct value, and build original solutions." },
      { archetype: "The Hero", score: 76, description: "Commitment to overcoming difficult technical barriers." },
      { archetype: "The Sage", score: 71, description: "Commitment to deep understanding, research, and clarity." },
      { archetype: "The Magician", score: 65, description: "Transforming ambitious visions into seamless digital realities." },
      { archetype: "The Explorer", score: 58, description: "Constantly venturing into uncharted design territory." },
      { archetype: "The Ruler", score: 52, description: "Setting exceptional quality benchmarks across the industry." }
    ]
  };

  return {
    companyName,
    mission,
    industry,
    targetAudience,
    brandKeywords: [industry, "Visionary", "Elevated", "Intuitive", "Crafted"],
    brandVoice: voice,
    logoPrompt: `A minimal, geometric 2D vector emblem for ${companyName}, clean graphic mark, solid dark background, primary color ${primaryHex}, flat vector art style`,
    secondaryMarks: [
      "Geometric Monogram Emblem",
      "Dynamic Contour Waveform",
      "Precision Modular Grid Badge"
    ],
    colorPalette,
    typography,
    doGuidelines: [
      "Maintain generous negative space around all brand assets and logos",
      "Ensure color contrast meets or exceeds WCAG AA legibility standards",
      "Use the cohesive 5-color palette consistently across all touchpoints"
    ],
    dontGuidelines: [
      "Do not stretch, rotate, or alter official logomark proportions",
      "Avoid placing low-contrast text over complex or noisy backgrounds",
      "Do not mix unapproved third-party font families or disparate weights"
    ],
    archetype,
    brandPersonality: personality
  };
}

export function generateFallbackSvgLogo(
  _promptStr?: string,
  companyName?: string,
  primaryColor: string = "#4F46E5",
  secondaryColor: string = "#7C3AED"
): string {
  const words = (companyName || "Brand Co").trim().split(/\s+/);
  const initials = words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : words[0].slice(0, 2).toUpperCase() || "BC";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="${primaryColor}" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="400" height="400" rx="56" fill="#0F172A" />
  <g transform="translate(80, 80)" filter="url(#glow)">
    <rect x="0" y="0" width="240" height="240" rx="48" fill="url(#logoGrad)" />
    <circle cx="120" cy="120" r="88" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-opacity="0.25" stroke-dasharray="8 6" />
    <text x="120" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="88" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-2">${initials}</text>
  </g>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
