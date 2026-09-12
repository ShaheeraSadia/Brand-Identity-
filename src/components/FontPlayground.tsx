import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Type,
  Sparkles,
  Sliders,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Layers,
  ChevronDown,
  Search,
  ExternalLink,
  Code,
  Download,
  Info,
  Maximize2,
  Columns2,
  Pin,
  PinOff,
  ArrowLeftRight,
  CheckCircle2
} from 'lucide-react';
import { BrandBible, FontPairing } from '../types';

export interface FontPlaygroundProps {
  key?: React.Key;
  isDark?: boolean;
  activeBible: BrandBible | null;
  onApplyFontPairing?: (pairing: FontPairing) => void;
  onNavigateToStudio?: () => void;
}

interface GoogleFontOption {
  family: string;
  category: 'Sans-Serif' | 'Serif' | 'Display' | 'Monospace';
  weights: number[];
  sampleText?: string;
  popularPairing?: string;
}

const POPULAR_GOOGLE_FONTS: GoogleFontOption[] = [
  // Sans-Serif
  { family: 'Plus Jakarta Sans', category: 'Sans-Serif', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Inter', category: 'Sans-Serif', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Poppins', category: 'Sans-Serif', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Montserrat', category: 'Sans-Serif', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'DM Sans', category: 'Sans-Serif', weights: [400, 500, 700] },
  { family: 'Outfit', category: 'Sans-Serif', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Roboto', category: 'Sans-Serif', weights: [300, 400, 500, 700] },
  { family: 'Open Sans', category: 'Sans-Serif', weights: [300, 400, 600, 700] },
  { family: 'Raleway', category: 'Sans-Serif', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Space Grotesk', category: 'Sans-Serif', weights: [400, 500, 600, 700] },
  { family: 'Work Sans', category: 'Sans-Serif', weights: [300, 400, 500, 600, 700] },

  // Serif
  { family: 'Playfair Display', category: 'Serif', weights: [400, 500, 600, 700, 800] },
  { family: 'Merriweather', category: 'Serif', weights: [300, 400, 700] },
  { family: 'Lora', category: 'Serif', weights: [400, 500, 600, 700] },
  { family: 'Cormorant Garamond', category: 'Serif', weights: [400, 500, 600, 700] },
  { family: 'Cinzel', category: 'Serif', weights: [400, 600, 700, 800] },
  { family: 'Fraunces', category: 'Serif', weights: [400, 600, 700, 800] },
  { family: 'Bodoni Moda', category: 'Serif', weights: [400, 600, 700, 800] },

  // Display
  { family: 'Syne', category: 'Display', weights: [400, 600, 700, 800] },
  { family: 'Oswald', category: 'Display', weights: [400, 500, 600, 700] },
  { family: 'Cabinet Grotesk', category: 'Display', weights: [400, 500, 700, 800] },
  { family: 'Clash Display', category: 'Display', weights: [400, 600, 700] },
  { family: 'Bebas Neue', category: 'Display', weights: [400] },

  // Monospace
  { family: 'JetBrains Mono', category: 'Monospace', weights: [400, 500, 600, 700] },
  { family: 'Space Mono', category: 'Monospace', weights: [400, 700] },
  { family: 'Fira Code', category: 'Monospace', weights: [400, 500, 600, 700] }
];

interface CuratedPairing {
  id: string;
  name: string;
  vibe: string;
  headerFont: string;
  headerCategory: string;
  headerUsage: string;
  bodyFont: string;
  bodyCategory: string;
  bodyUsage: string;
  scaleRatio: number;
  scaleName: string;
}

const CURATED_PAIRINGS: CuratedPairing[] = [
  {
    id: 'modern-saas',
    name: 'Modern Tech & SaaS',
    vibe: 'Clean, approachable, and highly readable on high-DPI displays.',
    headerFont: 'Plus Jakarta Sans',
    headerCategory: 'Sans-Serif',
    headerUsage: 'Hero headers, section titles, and key marketing figures.',
    bodyFont: 'Inter',
    bodyCategory: 'Sans-Serif',
    bodyUsage: 'Body copy, dashboard data tables, and input forms.',
    scaleRatio: 1.25,
    scaleName: 'Major Third (1.250)'
  },
  {
    id: 'luxury-editorial',
    name: 'Luxury Editorial & Fashion',
    vibe: 'High contrast, refined serif elegance with airy body typography.',
    headerFont: 'Playfair Display',
    headerCategory: 'Serif',
    headerUsage: 'Large brand mastheads, editorial callouts, and feature pull-quotes.',
    bodyFont: 'Plus Jakarta Sans',
    bodyCategory: 'Sans-Serif',
    bodyUsage: 'Editorial body paragraphs, captions, and product descriptions.',
    scaleRatio: 1.333,
    scaleName: 'Perfect Fourth (1.333)'
  },
  {
    id: 'minimalist-studio',
    name: 'Minimalist Architecture & Studio',
    vibe: 'Architectural geometry with crisp humanist grotesk readability.',
    headerFont: 'Space Grotesk',
    headerCategory: 'Sans-Serif',
    headerUsage: 'Technical sub-headers, hero statements, and category labels.',
    bodyFont: 'DM Sans',
    bodyCategory: 'Sans-Serif',
    bodyUsage: 'Project descriptions, spec sheets, and clean navigational links.',
    scaleRatio: 1.2,
    scaleName: 'Minor Third (1.200)'
  },
  {
    id: 'creative-expressive',
    name: 'Creative Agency & Design',
    vibe: 'Experimental display shapes balanced by high-clarity geometric body text.',
    headerFont: 'Syne',
    headerCategory: 'Display',
    headerUsage: 'High-impact hero banners and manifesto headlines.',
    bodyFont: 'Poppins',
    bodyCategory: 'Sans-Serif',
    bodyUsage: 'Case study write-ups, client testimonials, and UI controls.',
    scaleRatio: 1.414,
    scaleName: 'Augmented Fourth (1.414)'
  },
  {
    id: 'classic-heritage',
    name: 'Heritage, Legal & Finance',
    vibe: 'Authoritative, stately, and grounded in centuries of typographic tradition.',
    headerFont: 'Cormorant Garamond',
    headerCategory: 'Serif',
    headerUsage: 'Formal declarations, partner names, and executive letters.',
    bodyFont: 'Montserrat',
    bodyCategory: 'Sans-Serif',
    bodyUsage: 'Legal disclosures, prospectus charts, and report summaries.',
    scaleRatio: 1.333,
    scaleName: 'Perfect Fourth (1.333)'
  },
  {
    id: 'developer-technical',
    name: 'Developer Tools & Infra',
    vibe: 'Technical precision with monospace accents and crisp UI metrics.',
    headerFont: 'Outfit',
    headerCategory: 'Sans-Serif',
    headerUsage: 'Documentation headings and feature release announcements.',
    bodyFont: 'JetBrains Mono',
    bodyCategory: 'Monospace',
    bodyUsage: 'Terminal commands, code snippets, config JSON, and system metrics.',
    scaleRatio: 1.125,
    scaleName: 'Major Second (1.125)'
  }
];

const MODULAR_SCALES = [
  { name: 'Minor Second', ratio: 1.067, desc: 'Ultra-compact data apps' },
  { name: 'Major Second', ratio: 1.125, desc: 'Dense UI & dashboards' },
  { name: 'Minor Third', ratio: 1.200, desc: 'Clean product UI' },
  { name: 'Major Third', ratio: 1.250, desc: 'Balanced standard marketing' },
  { name: 'Perfect Fourth', ratio: 1.333, desc: 'High contrast editorial' },
  { name: 'Augmented Fourth', ratio: 1.414, desc: 'Bold visual hierarchy' },
  { name: 'Golden Ratio', ratio: 1.618, desc: 'Dramatic display mastheads' }
];

export default function FontPlayground({
  isDark = false,
  activeBible,
  onApplyFontPairing,
  onNavigateToStudio
}: FontPlaygroundProps) {
  // Initial state derived from active brand or default
  const defaultHeader = activeBible?.typography?.headerFont || 'Playfair Display';
  const defaultBody = activeBible?.typography?.bodyFont || 'Plus Jakarta Sans';

  const [headerFont, setHeaderFont] = useState<string>(defaultHeader);
  const [bodyFont, setBodyFont] = useState<string>(defaultBody);
  const [headerCategory, setHeaderCategory] = useState<string>(activeBible?.typography?.headerCategory || 'Serif');
  const [bodyCategory, setBodyCategory] = useState<string>(activeBible?.typography?.bodyCategory || 'Sans-serif');

  const [baseSize, setBaseSize] = useState<number>(16); // 16px
  const [scaleRatio, setScaleRatio] = useState<number>(1.25);
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [headerWeight, setHeaderWeight] = useState<number>(700);
  const [bodyWeight, setBodyWeight] = useState<number>(400);
  type TextTransformOption = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  const [textTransform, setTextTransform] = useState<TextTransformOption>('none');

  // Pinned Pairing for Side-by-Side Comparison
  interface PinnedPairingConfig {
    headerFont: string;
    bodyFont: string;
    headerCategory: string;
    bodyCategory: string;
    headerWeight: number;
    bodyWeight: number;
    scaleRatio: number;
    lineHeight: number;
    letterSpacing: number;
    textTransform: TextTransformOption;
    label?: string;
  }

  const [pinnedPairing, setPinnedPairing] = useState<PinnedPairingConfig>({
    headerFont: defaultHeader,
    bodyFont: defaultBody,
    headerCategory: activeBible?.typography?.headerCategory || 'Serif',
    bodyCategory: activeBible?.typography?.bodyCategory || 'Sans-serif',
    headerWeight: 700,
    bodyWeight: 400,
    scaleRatio: 1.25,
    lineHeight: 1.5,
    letterSpacing: 0,
    textTransform: 'none',
    label: activeBible?.companyName ? `${activeBible.companyName} Default` : 'Baseline Pairing'
  });

  // Preview Mode
  type PreviewTabOption = 'hierarchy' | 'custom-type' | 'compare' | 'article' | 'glyphs';
  const [previewTab, setPreviewTab] = useState<PreviewTabOption>('hierarchy');
  const [customUserText, setCustomUserText] = useState<string>(
    activeBible?.mission
      ? activeBible.mission
      : 'Architecting world-class digital brands with mathematical precision.'
  );

  const [searchHeader, setSearchHeader] = useState<string>('');
  const [searchBody, setSearchBody] = useState<string>('');
  const [showCssModal, setShowCssModal] = useState<boolean>(false);
  const [copiedCss, setCopiedCss] = useState<boolean>(false);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  // Dynamically load Google Fonts when selected (active and pinned)
  useEffect(() => {
    const fontsToLoad = [headerFont, bodyFont, pinnedPairing.headerFont, pinnedPairing.bodyFont].filter(Boolean);
    fontsToLoad.forEach((font) => {
      const id = `google-font-${font.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
          font
        )}:wght@300;400;500;600;700;800&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [headerFont, bodyFont, pinnedPairing.headerFont, pinnedPairing.bodyFont]);

  // Computed Type Scales for Active Candidate Pairing
  const computedScales = useMemo(() => {
    const b = baseSize;
    const r = scaleRatio;

    const h1 = Math.round(b * Math.pow(r, 4));
    const h2 = Math.round(b * Math.pow(r, 3));
    const h3 = Math.round(b * Math.pow(r, 2));
    const h4 = Math.round(b * Math.pow(r, 1));
    const body = b;
    const small = Math.max(10, Math.round(b / r));

    return {
      h1: { px: h1, rem: (h1 / 16).toFixed(2), name: 'Header 1 (Display Hero)' },
      h2: { px: h2, rem: (h2 / 16).toFixed(2), name: 'Header 2 (Section Title)' },
      h3: { px: h3, rem: (h3 / 16).toFixed(2), name: 'Header 3 (Sub-heading)' },
      h4: { px: h4, rem: (h4 / 16).toFixed(2), name: 'Header 4 (Card Headline)' },
      body: { px: body, rem: (body / 16).toFixed(2), name: 'Body Text (Standard Paragraph)' },
      small: { px: small, rem: (small / 16).toFixed(2), name: 'Small / Caption (Metadata & Labels)' }
    };
  }, [baseSize, scaleRatio]);

  // Computed Type Scales for Pinned Baseline Pairing A
  const computedPinnedScales = useMemo(() => {
    const b = baseSize;
    const r = pinnedPairing.scaleRatio || 1.25;

    const h1 = Math.round(b * Math.pow(r, 4));
    const h2 = Math.round(b * Math.pow(r, 3));
    const h3 = Math.round(b * Math.pow(r, 2));
    const body = b;
    const small = Math.max(10, Math.round(b / r));

    return {
      h1: { px: h1, rem: (h1 / 16).toFixed(2) },
      h2: { px: h2, rem: (h2 / 16).toFixed(2) },
      h3: { px: h3, rem: (h3 / 16).toFixed(2) },
      body: { px: body, rem: (body / 16).toFixed(2) },
      small: { px: small, rem: (small / 16).toFixed(2) }
    };
  }, [baseSize, pinnedPairing.scaleRatio]);

  // Actions for Comparison Mode
  const handlePinCurrentPairing = () => {
    setPinnedPairing({
      headerFont,
      bodyFont,
      headerCategory,
      bodyCategory,
      headerWeight,
      bodyWeight,
      scaleRatio,
      lineHeight,
      letterSpacing,
      textTransform,
      label: `${headerFont} + ${bodyFont}`
    });
    setAppliedToast(`Pinned "${headerFont} + ${bodyFont}" as Baseline Pairing A!`);
    setTimeout(() => setAppliedToast(null), 3000);
  };

  const handleSwapPairings = () => {
    const tempPinned = { ...pinnedPairing };
    setPinnedPairing({
      headerFont,
      bodyFont,
      headerCategory,
      bodyCategory,
      headerWeight,
      bodyWeight,
      scaleRatio,
      lineHeight,
      letterSpacing,
      textTransform,
      label: `${headerFont} + ${bodyFont}`
    });
    setHeaderFont(tempPinned.headerFont);
    setBodyFont(tempPinned.bodyFont);
    setHeaderCategory(tempPinned.headerCategory);
    setBodyCategory(tempPinned.bodyCategory);
    setHeaderWeight(tempPinned.headerWeight);
    setBodyWeight(tempPinned.bodyWeight);
    setScaleRatio(tempPinned.scaleRatio);
    setLineHeight(tempPinned.lineHeight);
    setLetterSpacing(tempPinned.letterSpacing);
    setTextTransform(tempPinned.textTransform);
    setAppliedToast('Swapped Pairing A and Pairing B!');
    setTimeout(() => setAppliedToast(null), 2500);
  };

  const handleApplySpecificPairing = (
    hFont: string,
    hCat: string,
    bFont: string,
    bCat: string,
    ratio: number
  ) => {
    if (!onApplyFontPairing) return;
    const newPairing: FontPairing = {
      headerFont: hFont,
      headerCategory: hCat,
      headerUsage: `Hero statements, section headlines, and marketing callouts scaled at ${ratio}x.`,
      bodyFont: bFont,
      bodyCategory: bCat,
      bodyUsage: `Body copy, interactive forms, UI labels, and longform reading.`
    };

    onApplyFontPairing(newPairing);
    setAppliedToast(`Applied "${hFont} + ${bFont}" to your active Brand Bible!`);
    setTimeout(() => setAppliedToast(null), 3500);
  };

  // Apply Font Pairing Preset
  const handleSelectCuratedPairing = (pairing: CuratedPairing) => {
    setHeaderFont(pairing.headerFont);
    setHeaderCategory(pairing.headerCategory);
    setBodyFont(pairing.bodyFont);
    setBodyCategory(pairing.bodyCategory);
    setScaleRatio(pairing.scaleRatio);
  };

  // Apply to active Brand Bible
  const handleApplyToBrandBible = () => {
    if (!onApplyFontPairing) return;
    const newPairing: FontPairing = {
      headerFont,
      headerCategory,
      headerUsage: `Hero statements, section headlines, and marketing callouts scaled at ${scaleRatio}x.`,
      bodyFont,
      bodyCategory,
      bodyUsage: `Body copy, interactive forms, UI labels, and longform reading.`
    };

    onApplyFontPairing(newPairing);
    setAppliedToast(`Applied "${headerFont} + ${bodyFont}" to your active Brand Bible!`);
    setTimeout(() => setAppliedToast(null), 3500);
  };

  // Generate CSS Code snippet
  const cssCodeSnippet = useMemo(() => {
    const fontsParam = [headerFont, bodyFont]
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800`)
      .join('&');

    return `/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?${fontsParam}&display=swap');

/* Typography Variables & Classes */
:root {
  --font-header: '${headerFont}', ${headerCategory.toLowerCase()};
  --font-body: '${bodyFont}', ${bodyCategory.toLowerCase()};
  --font-base-size: ${baseSize}px;
  --font-scale-ratio: ${scaleRatio};
}

.brand-heading-1 {
  font-family: var(--font-header);
  font-size: ${computedScales.h1.rem}rem; /* ${computedScales.h1.px}px */
  font-weight: ${headerWeight};
  line-height: ${lineHeight};
  letter-spacing: ${letterSpacing}px;
  text-transform: ${textTransform};
}

.brand-heading-2 {
  font-family: var(--font-header);
  font-size: ${computedScales.h2.rem}rem; /* ${computedScales.h2.px}px */
  font-weight: ${headerWeight};
  line-height: ${lineHeight};
  text-transform: ${textTransform};
}

.brand-heading-3 {
  font-family: var(--font-header);
  font-size: ${computedScales.h3.rem}rem; /* ${computedScales.h3.px}px */
  font-weight: ${headerWeight};
  text-transform: ${textTransform};
}

.brand-body {
  font-family: var(--font-body);
  font-size: ${computedScales.body.rem}rem; /* ${computedScales.body.px}px */
  font-weight: ${bodyWeight};
  line-height: ${lineHeight};
  letter-spacing: ${letterSpacing}px;
}

.brand-caption {
  font-family: var(--font-body);
  font-size: ${computedScales.small.rem}rem; /* ${computedScales.small.px}px */
  font-weight: ${bodyWeight};
}`;
  }, [headerFont, bodyFont, headerCategory, bodyCategory, baseSize, scaleRatio, computedScales, headerWeight, bodyWeight, lineHeight, letterSpacing, textTransform]);

  const filteredHeaderFonts = useMemo(() => {
    return POPULAR_GOOGLE_FONTS.filter((f) =>
      f.family.toLowerCase().includes(searchHeader.toLowerCase())
    );
  }, [searchHeader]);

  const filteredBodyFonts = useMemo(() => {
    return POPULAR_GOOGLE_FONTS.filter((f) =>
      f.family.toLowerCase().includes(searchBody.toLowerCase())
    );
  }, [searchBody]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="font-sans max-w-7xl mx-auto space-y-8 py-2"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {appliedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{appliedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div
        className={`p-8 sm:p-10 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Type className="w-3.5 h-3.5" />
            <span>Interactive Google Font Playground &amp; Scale Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Live Font Pairing &amp; Modular Scale Studio
          </h1>
          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Type your own custom brand statements, test Google Font combinations, adjust mathematical modular scales, and preview typographic hierarchy live with real-time browser font rendering.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {activeBible && (
              <button
                id="playground-apply-brand-btn"
                onClick={handleApplyToBrandBible}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply to "{activeBible.companyName}" Brand Bible</span>
              </button>
            )}

            <button
              id="playground-view-css-btn"
              onClick={() => setShowCssModal(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-indigo-500" />
              <span>Export CSS Code</span>
            </button>

            {onNavigateToStudio && (
              <button
                onClick={onNavigateToStudio}
                className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1.5 transition cursor-pointer ml-auto"
              >
                <span>Back to Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Controls (4 cols) & Right Live Preview (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* Left Control Panel: Pairings, Selectors, Sliders */}
        <div className="lg:col-span-5 min-w-0 w-full space-y-6">
          
          {/* Curated Pairings Presets */}
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h2 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Curated Google Font Pairings
                </h2>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{CURATED_PAIRINGS.length} Presets</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CURATED_PAIRINGS.map((p) => {
                const isSelected = headerFont === p.headerFont && bodyFont === p.bodyFont;
                return (
                  <button
                    key={p.id}
                    id={`curated-pairing-${p.id}`}
                    onClick={() => handleSelectCuratedPairing(p)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                        : isDark
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                        : 'bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {p.headerFont} + {p.bodyFont}
                      </div>
                    </div>
                    <div className="mt-2 text-[9px] font-mono font-bold text-indigo-500 px-1.5 py-0.5 rounded bg-indigo-500/10 w-fit">
                      {p.scaleName.split(' ')[0]} ({p.scaleRatio}x)
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Font Pickers (Header & Body) */}
          <div
            className={`p-6 rounded-3xl border space-y-5 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <h2 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Font Family Selectors
                </h2>
              </div>
              <button
                onClick={() => {
                  setHeaderFont('Playfair Display');
                  setBodyFont('Plus Jakarta Sans');
                  setScaleRatio(1.25);
                  setBaseSize(16);
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-indigo-500 flex items-center gap-1 cursor-pointer"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Pinned Pairing Status Box */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
              isDark ? 'bg-slate-950/60 border-amber-500/30' : 'bg-amber-500/10 border-amber-500/25'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500 shrink-0">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Pinned Baseline (A)
                  </div>
                  <div className="text-xs font-extrabold truncate">
                    {pinnedPairing.headerFont} + {pinnedPairing.bodyFont}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  id="sidebar-pin-current-btn"
                  onClick={handlePinCurrentPairing}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition cursor-pointer"
                  title="Pin currently selected candidate fonts as baseline Pairing A"
                >
                  Pin Current
                </button>
                {previewTab !== 'compare' && (
                  <button
                    type="button"
                    id="sidebar-compare-shortcut-btn"
                    onClick={() => setPreviewTab('compare')}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                    title="Open Side-by-Side Compare View"
                  >
                    Compare
                  </button>
                )}
              </div>
            </div>

            {/* Header Font Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Header Font Family
                </label>
                <span className="text-[10px] font-mono font-bold text-indigo-500 px-2 py-0.5 rounded bg-indigo-500/10">
                  {headerCategory}
                </span>
              </div>
              <select
                id="playground-header-font-select"
                value={headerFont}
                onChange={(e) => {
                  const val = e.target.value;
                  setHeaderFont(val);
                  const matched = POPULAR_GOOGLE_FONTS.find((f) => f.family === val);
                  if (matched) setHeaderCategory(matched.category);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {POPULAR_GOOGLE_FONTS.map((font) => (
                  <option key={font.family} value={font.family}>
                    {font.family} ({font.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Body Font Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Body Font Family
                </label>
                <span className="text-[10px] font-mono font-bold text-indigo-500 px-2 py-0.5 rounded bg-indigo-500/10">
                  {bodyCategory}
                </span>
              </div>
              <select
                id="playground-body-font-select"
                value={bodyFont}
                onChange={(e) => {
                  const val = e.target.value;
                  setBodyFont(val);
                  const matched = POPULAR_GOOGLE_FONTS.find((f) => f.family === val);
                  if (matched) setBodyCategory(matched.category);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {POPULAR_GOOGLE_FONTS.map((font) => (
                  <option key={font.family} value={font.family}>
                    {font.family} ({font.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Scale Ratio Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Modular Scale Ratio
                </label>
                <span className="text-[10px] font-mono font-bold text-indigo-500 px-2 py-0.5 rounded bg-indigo-500/10">
                  {scaleRatio}x
                </span>
              </div>
              <select
                id="playground-scale-select"
                value={scaleRatio}
                onChange={(e) => setScaleRatio(parseFloat(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {MODULAR_SCALES.map((s) => (
                  <option key={s.name} value={s.ratio}>
                    {s.name} ({s.ratio}x) — {s.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Fine-Tuning Sliders: Base Size, Line Height, Letter Spacing */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-4">
              {/* Base Size Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Base Font Size</span>
                  <span className="text-indigo-500 font-mono">{baseSize}px (1rem)</span>
                </div>
                <input
                  id="playground-base-size-slider"
                  type="range"
                  min="13"
                  max="24"
                  step="1"
                  value={baseSize}
                  onChange={(e) => setBaseSize(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Line Height Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Line Height (Leading)</span>
                  <span className="text-indigo-500 font-mono">{lineHeight.toFixed(2)}</span>
                </div>
                <input
                  id="playground-line-height-slider"
                  type="range"
                  min="1.1"
                  max="2.0"
                  step="0.05"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Letter Spacing Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Letter Spacing (Tracking)</span>
                  <span className="text-indigo-500 font-mono">{letterSpacing}px</span>
                </div>
                <input
                  id="playground-letter-spacing-slider"
                  type="range"
                  min="-2"
                  max="4"
                  step="0.5"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Font Weight Toggles */}
              <div className="space-y-2 pt-1">
                <span className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Header Weight
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[400, 600, 700, 800].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setHeaderWeight(w)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                        headerWeight === w
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {w === 400 ? 'Regular' : w === 600 ? 'Semi' : w === 700 ? 'Bold' : 'Black'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Header Text Transform (Capitalization) Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Header Text Transform
                  </span>
                  <span className="text-[10px] font-mono text-indigo-500 font-bold capitalize">
                    {textTransform}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'none', label: 'None', sub: 'Natural', preview: 'Aa' },
                    { id: 'uppercase', label: 'UPPER', sub: 'All Caps', preview: 'AA' },
                    { id: 'lowercase', label: 'lower', sub: 'All Lower', preview: 'aa' },
                    { id: 'capitalize', label: 'Capital', sub: 'Title Case', preview: 'Aa Bb' }
                  ].map((tt) => (
                    <button
                      key={tt.id}
                      type="button"
                      id={`playground-transform-${tt.id}-btn`}
                      onClick={() => setTextTransform(tt.id as TextTransformOption)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        textTransform === tt.id
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                          : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                      title={`Header Text Transform: ${tt.label} (${tt.sub})`}
                    >
                      <span className="font-mono text-xs font-black">{tt.preview}</span>
                      <span className="text-[9px] uppercase tracking-wider opacity-90">{tt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 min-w-0 w-full space-y-6">
          
          {/* Preview Navigation Tabs & Mode Selector */}
          <div
            className={`p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-3 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 text-xs font-bold">
              {[
                { id: 'hierarchy', label: 'Modular Scale', icon: Layers },
                { id: 'custom-type', label: 'Custom Live Typing', icon: Type },
                { id: 'compare', label: 'Compare (A/B)', icon: Columns2 },
                { id: 'article', label: 'Article Layout', icon: BookOpen },
                { id: 'glyphs', label: 'Glyphs & Numbers', icon: Maximize2 }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = previewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`preview-tab-${tab.id}`}
                    onClick={() => setPreviewTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Sample Text Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCustomUserText('The quick brown fox jumps over the lazy dog.')}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-500 transition cursor-pointer"
                title="Use Pangram"
              >
                Pangram
              </button>
              <button
                type="button"
                onClick={() =>
                  setCustomUserText(
                    activeBible?.mission || 'Design is not just what it looks like. Design is how it works.'
                  )
                }
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-500 transition cursor-pointer"
                title="Use Mission"
              >
                Mission
              </button>
            </div>
          </div>

          {/* Live Editable Custom Text Input Box */}
          <div
            className={`p-6 rounded-3xl border space-y-3 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Interactive Live Preview Text
              </label>
              
              {/* Header Text Transform Quick Toggle Toolbar */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden xs:inline">Header Casing:</span>
                <div className="flex items-center gap-1 p-0.5 rounded-xl border bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                  {[
                    { id: 'none', label: 'None', preview: 'Aa' },
                    { id: 'uppercase', label: 'UPPER', preview: 'AA' },
                    { id: 'lowercase', label: 'lower', preview: 'aa' },
                    { id: 'capitalize', label: 'Capital', preview: 'Aa Bb' }
                  ].map((tt) => (
                    <button
                      key={tt.id}
                      type="button"
                      id={`preview-header-transform-${tt.id}-btn`}
                      onClick={() => setTextTransform(tt.id as TextTransformOption)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        textTransform === tt.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isDark
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={`Toggle header casing to ${tt.label}`}
                    >
                      <span className="font-mono text-xs font-bold">{tt.preview}</span>
                      <span className="hidden sm:inline">{tt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <textarea
              id="playground-custom-text-input"
              rows={2}
              value={customUserText}
              onChange={(e) => setCustomUserText(e.target.value)}
              placeholder="Type your company name, mission statement, or headline here..."
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Dynamic Content Views */}
          <div
            className={`p-8 sm:p-10 rounded-3xl border transition-all duration-300 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* View 1: Modular Scale Hierarchy */}
            {previewTab === 'hierarchy' && (
              <div className="space-y-8">
                {/* H1 */}
                <div className="space-y-2 border-b pb-6 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-indigo-500">{computedScales.h1.name}</span>
                    <span>
                      {computedScales.h1.px}px ({computedScales.h1.rem}rem) • {headerFont}
                    </span>
                  </div>
                  <h1
                    style={{
                      fontFamily: `'${headerFont}', sans-serif`,
                      fontSize: `${computedScales.h1.px}px`,
                      fontWeight: headerWeight,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      textTransform
                    }}
                    className="tracking-tight transition-all break-words"
                  >
                    {customUserText || 'Headline Level 1'}
                  </h1>
                </div>

                {/* H2 */}
                <div className="space-y-2 border-b pb-6 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-indigo-500">{computedScales.h2.name}</span>
                    <span>
                      {computedScales.h2.px}px ({computedScales.h2.rem}rem) • {headerFont}
                    </span>
                  </div>
                  <h2
                    style={{
                      fontFamily: `'${headerFont}', sans-serif`,
                      fontSize: `${computedScales.h2.px}px`,
                      fontWeight: headerWeight,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      textTransform
                    }}
                    className="tracking-tight transition-all break-words"
                  >
                    {customUserText || 'Headline Level 2'}
                  </h2>
                </div>

                {/* H3 */}
                <div className="space-y-2 border-b pb-6 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-indigo-500">{computedScales.h3.name}</span>
                    <span>
                      {computedScales.h3.px}px ({computedScales.h3.rem}rem) • {headerFont}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: `'${headerFont}', sans-serif`,
                      fontSize: `${computedScales.h3.px}px`,
                      fontWeight: headerWeight,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      textTransform
                    }}
                    className="tracking-tight transition-all break-words"
                  >
                    {customUserText || 'Headline Level 3'}
                  </h3>
                </div>

                {/* Body Text */}
                <div className="space-y-2 border-b pb-6 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-indigo-500">{computedScales.body.name}</span>
                    <span>
                      {computedScales.body.px}px ({computedScales.body.rem}rem) • {bodyFont}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: `'${bodyFont}', sans-serif`,
                      fontSize: `${computedScales.body.px}px`,
                      fontWeight: bodyWeight,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`
                    }}
                    className="transition-all leading-relaxed"
                  >
                    {customUserText}
                  </p>
                </div>

                {/* Small Caption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-indigo-500">{computedScales.small.name}</span>
                    <span>
                      {computedScales.small.px}px ({computedScales.small.rem}rem) • {bodyFont}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: `'${bodyFont}', sans-serif`,
                      fontSize: `${computedScales.small.px}px`,
                      fontWeight: bodyWeight,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`
                    }}
                    className="text-slate-500 dark:text-slate-400 transition-all"
                  >
                    SPECIFICATION NOTE: All body text lines adhere strictly to WCAG AA 4.5:1 minimum legibility contrast ratios against primary brand surfaces.
                  </p>
                </div>
              </div>
            )}

            {/* View 2: Custom Live Typing Sandbox */}
            {previewTab === 'custom-type' && (
              <div className="space-y-8">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-500 mb-2 font-bold">
                    Primary Display Headline ({headerFont})
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                      fontFamily: `'${headerFont}', sans-serif`,
                      fontSize: `${computedScales.h1.px}px`,
                      fontWeight: headerWeight,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      textTransform
                    }}
                    className="p-4 rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-800/80 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    {customUserText}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-500 mb-2 font-bold">
                    Longform Body Copy ({bodyFont})
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                      fontFamily: `'${bodyFont}', sans-serif`,
                      fontSize: `${computedScales.body.px}px`,
                      fontWeight: bodyWeight,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`
                    }}
                    className="p-4 rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-800/80 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all leading-relaxed"
                  >
                    {customUserText} The typography scale guarantees optical harmony across all consumer touchpoints, from responsive web banners to full-bleed billboard applications.
                  </div>
                </div>
              </div>
            )}

            {/* View: Side-by-Side Comparison Mode */}
            {previewTab === 'compare' && (
              <div className="space-y-6">
                {/* Comparison Control Toolbar Header */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-500">
                        <Columns2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-black tracking-tight">Side-by-Side Pairing Comparison</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold">
                        A/B Testing
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pairing A is pinned as your baseline. Adjust Pairing B on the left sidebar to audition alternatives live against the same sample text.
                    </p>
                  </div>

                  {/* Actions: Pin Current to A & Swap Pairings */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      id="pin-current-pairing-btn"
                      onClick={handlePinCurrentPairing}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 flex items-center gap-1.5 transition cursor-pointer"
                      title="Pin current settings (Pairing B) as baseline Pairing A"
                    >
                      <Pin className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span>Pin Current to A</span>
                    </button>

                    <button
                      type="button"
                      id="swap-compare-pairings-btn"
                      onClick={handleSwapPairings}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Swap Pairing A and Pairing B"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Swap A &amp; B</span>
                    </button>
                  </div>
                </div>

                {/* Quick Presets for Auditioning Pairing B */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Quick Test Presets on Candidate B:
                    </span>
                    <span className="text-[10px] text-slate-400">Click any preset to compare against Pinned A</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CURATED_PAIRINGS.map((p) => {
                      const isCandidateActive = headerFont === p.headerFont && bodyFont === p.bodyFont;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectCuratedPairing(p)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                            isCandidateActive
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : isDark
                              ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                          }`}
                        >
                          <span>{p.name}</span>
                          <span className="text-[9px] opacity-70 font-normal">({p.headerFont} + {p.bodyFont})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Two-Column Side-by-Side Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* COLUMN 1: PINNED PAIRING A */}
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between space-y-6 transition-all ${
                      isDark
                        ? 'bg-slate-950/60 border-amber-500/30 ring-1 ring-amber-500/10'
                        : 'bg-amber-500/5 border-amber-500/30 shadow-xs'
                    }`}
                  >
                    <div className="space-y-6">
                      {/* Column Header */}
                      <div className="flex items-center justify-between gap-2 border-b pb-4 border-amber-500/20">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1 shrink-0">
                            <Pin className="w-3 h-3 fill-current" />
                            Pairing A (Pinned)
                          </span>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 truncate">
                            {pinnedPairing.label || `${pinnedPairing.headerFont} + ${pinnedPairing.bodyFont}`}
                          </span>
                        </div>
                        {onApplyFontPairing && (
                          <button
                            type="button"
                            id="apply-pairing-a-btn"
                            onClick={() =>
                              handleApplySpecificPairing(
                                pinnedPairing.headerFont,
                                pinnedPairing.headerCategory,
                                pinnedPairing.bodyFont,
                                pinnedPairing.bodyCategory,
                                pinnedPairing.scaleRatio
                              )
                            }
                            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition cursor-pointer shrink-0"
                            title="Apply Pairing A to active Brand Bible"
                          >
                            Apply A
                          </button>
                        )}
                      </div>

                      {/* Font Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                          <span className="text-slate-400">Head:</span>{' '}
                          <strong className="text-amber-600 dark:text-amber-400">{pinnedPairing.headerFont}</strong> (
                          {pinnedPairing.headerCategory}, {pinnedPairing.headerWeight}w)
                        </div>
                        <div className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                          <span className="text-slate-400">Body:</span>{' '}
                          <strong className="text-amber-600 dark:text-amber-400">{pinnedPairing.bodyFont}</strong> (
                          {pinnedPairing.bodyCategory}, {pinnedPairing.bodyWeight}w)
                        </div>
                      </div>

                      {/* H1 Display Preview */}
                      <div className="space-y-1 border-b pb-4 border-slate-100 dark:border-slate-800/80">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Display Headline ({computedPinnedScales.h1.px}px)
                        </div>
                        <h1
                          style={{
                            fontFamily: `'${pinnedPairing.headerFont}', sans-serif`,
                            fontSize: `${computedPinnedScales.h1.px}px`,
                            fontWeight: pinnedPairing.headerWeight,
                            lineHeight: pinnedPairing.lineHeight,
                            letterSpacing: `${pinnedPairing.letterSpacing}px`,
                            textTransform: pinnedPairing.textTransform
                          }}
                          className="font-black leading-tight tracking-tight break-words transition-all"
                        >
                          {customUserText || 'Headline Level 1'}
                        </h1>
                      </div>

                      {/* H3 Sub-headline */}
                      <div className="space-y-1 border-b pb-4 border-slate-100 dark:border-slate-800/80">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Section Header ({computedPinnedScales.h3.px}px)
                        </div>
                        <h3
                          style={{
                            fontFamily: `'${pinnedPairing.headerFont}', sans-serif`,
                            fontSize: `${computedPinnedScales.h3.px}px`,
                            fontWeight: pinnedPairing.headerWeight,
                            lineHeight: 1.3,
                            textTransform: pinnedPairing.textTransform
                          }}
                          className="font-bold break-words transition-all"
                        >
                          Harmonic Typographic System
                        </h3>
                      </div>

                      {/* Body Copy */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Body Text ({computedPinnedScales.body.px}px)
                        </div>
                        <p
                          style={{
                            fontFamily: `'${pinnedPairing.bodyFont}', sans-serif`,
                            fontSize: `${computedPinnedScales.body.px}px`,
                            fontWeight: pinnedPairing.bodyWeight,
                            lineHeight: pinnedPairing.lineHeight,
                            letterSpacing: `${pinnedPairing.letterSpacing}px`
                          }}
                          className="leading-relaxed text-slate-700 dark:text-slate-300 transition-all text-sm sm:text-base"
                        >
                          {customUserText} This baseline specimen demonstrates optical balance between {pinnedPairing.headerFont} and {pinnedPairing.bodyFont} under {pinnedPairing.scaleRatio}x modular cadence.
                        </p>
                      </div>
                    </div>

                    {/* Specimen Strip */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono text-slate-400 space-y-1">
                      <div style={{ fontFamily: `'${pinnedPairing.headerFont}', sans-serif` }} className="text-sm font-bold truncate">
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                      </div>
                      <div style={{ fontFamily: `'${pinnedPairing.bodyFont}', sans-serif` }} className="text-xs truncate">
                        abcdefghijklmnopqrstuvwxyz 0123456789
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: CANDIDATE PAIRING B */}
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between space-y-6 transition-all ${
                      isDark
                        ? 'bg-slate-950/60 border-indigo-500/40 ring-1 ring-indigo-500/10'
                        : 'bg-indigo-500/5 border-indigo-500/40 shadow-xs'
                    }`}
                  >
                    <div className="space-y-6">
                      {/* Column Header */}
                      <div className="flex items-center justify-between gap-2 border-b pb-4 border-indigo-500/20">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white flex items-center gap-1 shrink-0">
                            <Sparkles className="w-3 h-3" />
                            Pairing B (Active)
                          </span>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                            Exploring Candidate
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            id="pin-b-as-a-btn"
                            onClick={handlePinCurrentPairing}
                            className="px-2.5 py-1 rounded-xl text-[10px] font-bold border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer flex items-center gap-1"
                            title="Set Candidate B as new Pinned Baseline A"
                          >
                            <Pin className="w-3 h-3" />
                            <span>Pin as A</span>
                          </button>
                          {onApplyFontPairing && (
                            <button
                              type="button"
                              id="apply-pairing-b-btn"
                              onClick={handleApplyToBrandBible}
                              className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs cursor-pointer"
                              title="Apply Pairing B to active Brand Bible"
                            >
                              Apply B
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Font Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                          <span className="text-slate-400">Head:</span>{' '}
                          <strong className="text-indigo-600 dark:text-indigo-400">{headerFont}</strong> ({headerCategory},{' '}
                          {headerWeight}w)
                        </div>
                        <div className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                          <span className="text-slate-400">Body:</span>{' '}
                          <strong className="text-indigo-600 dark:text-indigo-400">{bodyFont}</strong> ({bodyCategory},{' '}
                          {bodyWeight}w)
                        </div>
                      </div>

                      {/* H1 Display Preview */}
                      <div className="space-y-1 border-b pb-4 border-slate-100 dark:border-slate-800/80">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Display Headline ({computedScales.h1.px}px)
                        </div>
                        <h1
                          style={{
                            fontFamily: `'${headerFont}', sans-serif`,
                            fontSize: `${computedScales.h1.px}px`,
                            fontWeight: headerWeight,
                            lineHeight: lineHeight,
                            letterSpacing: `${letterSpacing}px`,
                            textTransform
                          }}
                          className="font-black leading-tight tracking-tight break-words transition-all"
                        >
                          {customUserText || 'Headline Level 1'}
                        </h1>
                      </div>

                      {/* H3 Sub-headline */}
                      <div className="space-y-1 border-b pb-4 border-slate-100 dark:border-slate-800/80">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Section Header ({computedScales.h3.px}px)
                        </div>
                        <h3
                          style={{
                            fontFamily: `'${headerFont}', sans-serif`,
                            fontSize: `${computedScales.h3.px}px`,
                            fontWeight: headerWeight,
                            lineHeight: 1.3,
                            textTransform
                          }}
                          className="font-bold break-words transition-all"
                        >
                          Harmonic Typographic System
                        </h3>
                      </div>

                      {/* Body Copy */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Body Text ({computedScales.body.px}px)
                        </div>
                        <p
                          style={{
                            fontFamily: `'${bodyFont}', sans-serif`,
                            fontSize: `${computedScales.body.px}px`,
                            fontWeight: bodyWeight,
                            lineHeight: lineHeight,
                            letterSpacing: `${letterSpacing}px`
                          }}
                          className="leading-relaxed text-slate-700 dark:text-slate-300 transition-all text-sm sm:text-base"
                        >
                          {customUserText} This candidate specimen reflects live parameter updates from the controls sidebar, enabling immediate aesthetic contrast analysis.
                        </p>
                      </div>
                    </div>

                    {/* Specimen Strip */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono text-slate-400 space-y-1">
                      <div style={{ fontFamily: `'${headerFont}', sans-serif` }} className="text-sm font-bold truncate">
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                      </div>
                      <div style={{ fontFamily: `'${bodyFont}', sans-serif` }} className="text-xs truncate">
                        abcdefghijklmnopqrstuvwxyz 0123456789
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {previewTab === 'article' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-500">
                  Case Study &amp; Brand Philosophy
                </div>

                <h1
                  style={{
                    fontFamily: `'${headerFont}', sans-serif`,
                    fontSize: `${computedScales.h1.px}px`,
                    fontWeight: headerWeight,
                    lineHeight: 1.2,
                    letterSpacing: `${letterSpacing}px`,
                    textTransform
                  }}
                  className="font-black leading-tight"
                >
                  {customUserText}
                </h1>

                <div
                  style={{ fontFamily: `'${bodyFont}', sans-serif` }}
                  className="flex items-center gap-3 text-xs text-slate-400 border-y py-3 border-slate-100 dark:border-slate-800"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                    BS
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Design Systems Team</span>
                    <span className="mx-2">•</span>
                    <span>3 min read</span>
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: `'${bodyFont}', sans-serif`,
                    fontSize: `${computedScales.body.px}px`,
                    fontWeight: bodyWeight,
                    lineHeight: lineHeight,
                    letterSpacing: `${letterSpacing}px`
                  }}
                  className="text-base leading-relaxed text-slate-700 dark:text-slate-300"
                >
                  Great brand design is invisible when executed flawlessly. By systematically establishing font pairings between <strong>{headerFont}</strong> for structural framing and <strong>{bodyFont}</strong> for fluid communication, we create an emotional cadence that commands attention without fatiguing the reader.
                </p>

                <h2
                  style={{
                    fontFamily: `'${headerFont}', sans-serif`,
                    fontSize: `${computedScales.h3.px}px`,
                    fontWeight: headerWeight,
                    lineHeight: 1.3,
                    textTransform
                  }}
                  className="pt-2 font-bold"
                >
                  Building Scalable Visual Systems
                </h2>

                <p
                  style={{
                    fontFamily: `'${bodyFont}', sans-serif`,
                    fontSize: `${computedScales.body.px}px`,
                    fontWeight: bodyWeight,
                    lineHeight: lineHeight
                  }}
                  className="text-base leading-relaxed text-slate-700 dark:text-slate-300"
                >
                  When selecting typographic ratios, mathematical precision prevents visual arbitrary drift. Adhering to the {scaleRatio}x modular scale preserves harmony across responsive viewport shifts.
                </p>
              </div>
            )}

            {/* View 4: Glyphs & Numerics */}
            {previewTab === 'glyphs' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-wider mb-2">
                    {headerFont} Character Set
                  </h3>
                  <div
                    style={{ fontFamily: `'${headerFont}', sans-serif` }}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-lg sm:text-xl leading-loose font-bold tracking-wider"
                  >
                    <div>ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
                    <div>abcdefghijklmnopqrstuvwxyz</div>
                    <div>0123456789 &amp; $ € £ ¥ % # @ ! ?</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-wider mb-2">
                    {bodyFont} Character Set
                  </h3>
                  <div
                    style={{ fontFamily: `'${bodyFont}', sans-serif` }}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-base leading-relaxed"
                  >
                    <div>ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
                    <div>abcdefghijklmnopqrstuvwxyz</div>
                    <div>0123456789 • ( ) [ ] { } / \ &lt; &gt; = + - * ~</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export CSS Modal */}
      <AnimatePresence>
        {showCssModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-8 space-y-5 shadow-2xl ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Code className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-black tracking-tight">Export Google Fonts CSS</h3>
                </div>
                <button
                  onClick={() => setShowCssModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Copy and paste this CSS snippet into your web project's stylesheet or Tailwind setup to use this exact typography system.
              </p>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-80 border border-slate-800">
                  {cssCodeSnippet}
                </pre>
                <button
                  id="copy-font-css-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(cssCodeSnippet);
                    setCopiedCss(true);
                    setTimeout(() => setCopiedCss(false), 2000);
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  {copiedCss ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy CSS</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowCssModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
