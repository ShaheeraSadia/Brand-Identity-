import React, { useState, useEffect } from 'react';
import { BrandBible, BrandVoice } from '../types';
import { safeFetchJson } from '../utils/api';
import {
  Wand2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Compass,
  Type,
  ArrowRight,
  Sliders,
  CheckCircle,
  Flame,
  Zap,
  Target,
  FileText,
  Lightbulb,
  MessageSquare,
  Share2,
  Bookmark,
  Layers,
  ChevronDown,
  Info,
  Award,
  History,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface RephrasedVariation {
  variationTitle: string;
  rephrasedCopy: string;
  archetypeAlignmentScore: number;
  rationale: string;
  powerWords: string[];
  suggestedUse: string;
}

export interface VocabularyTransformation {
  beforeWord: string;
  afterWord: string;
  explanation: string;
}

export interface RephraseResult {
  targetArchetype: string;
  archetypeAnalysis: string;
  vocabularyTransformation: VocabularyTransformation[];
  variations: RephrasedVariation[];
}

export interface ArchetypeDefinition {
  name: string;
  subtitle: string;
  motto: string;
  coreDesire: string;
  toneDescription: string;
  powerKeywords: string[];
  colorTheme: string;
}

export const ARCHETYPES_CATALOG: ArchetypeDefinition[] = [
  {
    name: "The Creator",
    subtitle: "Artisan & Visionary",
    motto: "If you can imagine it, it can be created.",
    coreDesire: "To give form to original vision and craft enduring value.",
    toneDescription: "Artistic, inventive, meticulously designed, bespoke, and inspiring.",
    powerKeywords: ["Craft", "Envision", "Masterpiece", "Forge", "Originality"],
    colorTheme: "#6366f1"
  },
  {
    name: "The Hero",
    subtitle: "Champion & Achiever",
    motto: "Where there's a will, there's a way to triumph.",
    coreDesire: "To prove worth through courageous, disciplined mastery and victory.",
    toneDescription: "High-conviction, disciplined, gritty, athletic, and action-oriented.",
    powerKeywords: ["Relentless", "Conquer", "Triumph", "Champion", "Unstoppable"],
    colorTheme: "#ef4444"
  },
  {
    name: "The Magician",
    subtitle: "Visionary & Catalyst",
    motto: "Transform the ordinary into the extraordinary.",
    coreDesire: "To catalyze effortless transformation and create awe-inspiring breakthroughs.",
    toneDescription: "Visionary, wondrous, intuitive, frictionless, and transformative.",
    powerKeywords: ["Transform", "Alchemy", "Unlock", "Catalyze", "Effortless"],
    colorTheme: "#8b5cf6"
  },
  {
    name: "The Outlaw",
    subtitle: "Rebel & Disruptor",
    motto: "Rules were meant to be broken and rewritten.",
    coreDesire: "Revolution, unapologetic independence, and overturning outdated systems.",
    toneDescription: "Defiant, gritty, provocative, unapologetic, raw, and anti-establishment.",
    powerKeywords: ["Defy", "Break Free", "Disrupt", "Unapologetic", "Revolt"],
    colorTheme: "#f97316"
  },
  {
    name: "The Ruler",
    subtitle: "Leader & Standard-Bearer",
    motto: "Power isn't everything; excellence and leadership are.",
    coreDesire: "To build enduring prestige, command excellence, and set the industry gold standard.",
    toneDescription: "Authoritative, dignified, refined, sovereign, and impeccably composed.",
    powerKeywords: ["Command", "Standard", "Pinnacle", "Prestige", "Sovereign"],
    colorTheme: "#eab308"
  },
  {
    name: "The Sage",
    subtitle: "Thinker & Truth-Seeker",
    motto: "The truth will set you free; clarity unlocks progress.",
    coreDesire: "To discover truth, distill rigorous intelligence, and illuminate deep understanding.",
    toneDescription: "Analytical, lucid, deeply knowledgeable, objective, and philosophical.",
    powerKeywords: ["Illuminate", "Clarity", "Wisdom", "Distill", "Insight"],
    colorTheme: "#0ea5e9"
  },
  {
    name: "The Explorer",
    subtitle: "Pioneer & Trailblazer",
    motto: "Don't fence me in; life is an uncharted adventure.",
    coreDesire: "To experience boundless freedom, discover new frontiers, and push beyond horizons.",
    toneDescription: "Adventurous, untethered, boundary-pushing, rugged, and spirited.",
    powerKeywords: ["Trailblaze", "Frontier", "Uncharted", "Pioneer", "Limitless"],
    colorTheme: "#10b981"
  },
  {
    name: "The Caregiver",
    subtitle: "Protector & Altruist",
    motto: "Love and protect your neighbor as yourself.",
    coreDesire: "To nurture, shelter, protect, and provide selfless, trustworthy support.",
    toneDescription: "Warm, empathetic, devoted, reassuring, and unconditionally supportive.",
    powerKeywords: ["Nurture", "Safeguard", "Devoted", "Empathy", "Shelter"],
    colorTheme: "#ec4899"
  },
  {
    name: "The Innocent",
    subtitle: "Optimist & Idealist",
    motto: "Free to be you and me in pure simplicity.",
    coreDesire: "To experience wholesome happiness, honest goodness, and pure optimism.",
    toneDescription: "Pure, honest, refreshing, wholesome, joyful, and transparent.",
    powerKeywords: ["Pure", "Honest", "Wholesome", "Simple", "Serene"],
    colorTheme: "#06b6d4"
  },
  {
    name: "The Jester",
    subtitle: "Delighter & Wit",
    motto: "You only live once; make every moment delightfully memorable.",
    coreDesire: "To live in the joyful present, lighten the world, and make people laugh.",
    toneDescription: "Playful, witty, irreverent, fun, cheeky, and contagiously energetic.",
    powerKeywords: ["Delight", "Sparkle", "Witty", "Cheeky", "Unapologetic Fun"],
    colorTheme: "#f59e0b"
  },
  {
    name: "The Everyman",
    subtitle: "Neighbor & Realist",
    motto: "All people are created equal; honest connection matters most.",
    coreDesire: "Belonging, unpretentious connection, relatable equality, and practical dependability.",
    toneDescription: "Down-to-earth, genuine, friendly, straight-talking, and accessible.",
    powerKeywords: ["Dependable", "Straightforward", "Real", "Built for All", "Honest"],
    colorTheme: "#64748b"
  },
  {
    name: "The Lover",
    subtitle: "Sensualist & Romantic",
    motto: "You're the only one; passion elevates everything.",
    coreDesire: "To create deep intimacy, sensory beauty, emotional ecstasy, and aesthetic devotion.",
    toneDescription: "Sensual, poetic, deeply passionate, alluring, and intoxicating.",
    powerKeywords: ["Exquisite", "Intimate", "Devotion", "Captivating", "Sensual"],
    colorTheme: "#d946ef"
  }
];

interface BrandVoiceEditorProps {
  bible: BrandBible;
  isDark?: boolean;
  onUpdateMission?: (newMission: string) => void;
  onUpdateTagline?: (newTagline: string) => void;
  onUpdateVoice?: (newVoice: BrandVoice) => void;
  onShowToast?: (message: string, hex?: string) => void;
}

export function BrandVoiceEditor({
  bible,
  isDark = false,
  onUpdateMission,
  onUpdateTagline,
  onUpdateVoice,
  onShowToast
}: BrandVoiceEditorProps) {
  // Determine initial archetype from brand bible
  const detectedArchetypeName = bible.archetype?.primaryArchetype || "The Creator";
  const matchedArchetype = ARCHETYPES_CATALOG.find(
    a => a.name.toLowerCase() === detectedArchetypeName.toLowerCase() ||
         detectedArchetypeName.toLowerCase().includes(a.name.toLowerCase().replace('the ', ''))
  )?.name || "The Creator";

  const [selectedArchetype, setSelectedArchetype] = useState<string>(matchedArchetype);
  const [copyType, setCopyType] = useState<'tagline' | 'mission' | 'headline' | 'value_prop' | 'about_us' | 'social_post' | 'custom'>('mission');
  const [inputCopy, setInputCopy] = useState<string>(bible.mission || "Building exceptional digital products with purposeful craft.");
  const [intensity, setIntensity] = useState<'subtle' | 'balanced' | 'bold'>('balanced');
  
  // Fine tuning sliders
  const [boldness, setBoldness] = useState<number>(75);
  const [formality, setFormality] = useState<number>(40);
  const [wit, setWit] = useState<number>(50);
  const [emotionalResonance, setEmotionalResonance] = useState<number>(80);
  const [showAdvancedControls, setShowAdvancedControls] = useState<boolean>(false);

  // Generation state & results
  const [isRephrasing, setIsRephrasing] = useState<boolean>(false);
  const [rephraseResult, setRephraseResult] = useState<RephraseResult | null>(null);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number>(0);
  
  // UI states
  const [previewCanvasTheme, setPreviewCanvasTheme] = useState<'light' | 'dark' | 'brand'>('light');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedOriginal, setCopiedOriginal] = useState<boolean>(false);
  const [rephraseHistory, setRephraseHistory] = useState<Array<{ id: string; archetype: string; original: string; result: RephraseResult; timestamp: string }>>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Sync selected archetype if bible archetype changes externally
  useEffect(() => {
    if (bible.archetype?.primaryArchetype) {
      const match = ARCHETYPES_CATALOG.find(
        a => a.name.toLowerCase() === bible.archetype?.primaryArchetype.toLowerCase() ||
             bible.archetype?.primaryArchetype.toLowerCase().includes(a.name.toLowerCase().replace('the ', ''))
      )?.name;
      if (match) setSelectedArchetype(match);
    }
  }, [bible.archetype?.primaryArchetype]);

  // Current active archetype definition
  const currentArchetypeDef = ARCHETYPES_CATALOG.find(a => a.name === selectedArchetype) || ARCHETYPES_CATALOG[0];

  // Helper to load copy presets
  const handleLoadPreset = (type: 'mission' | 'tagline' | 'about_us' | 'value_prop' | 'launch_hook' | 'promise') => {
    setCopyType(type === 'launch_hook' || type === 'promise' ? 'value_prop' : type as any);
    if (type === 'mission') {
      setInputCopy(bible.mission || `Empower ${bible.targetAudience || 'teams'} to innovate with precision.`);
    } else if (type === 'tagline') {
      setInputCopy(bible.archetype?.tagline || `Built for the next generation of ${bible.industry || 'technology'}.`);
    } else if (type === 'about_us') {
      const about = typeof bible.brandVoice === 'object' && bible.brandVoice.aboutUsParagraph
        ? bible.brandVoice.aboutUsParagraph
        : `${bible.companyName} was founded with a single obsession: to transform the ${bible.industry} space through relentless execution and human-centric design.`;
      setInputCopy(about);
    } else if (type === 'value_prop') {
      setInputCopy(`We combine intelligent design with uncompromising performance to help ${bible.targetAudience || 'creators'} achieve outsized results.`);
    } else if (type === 'launch_hook') {
      setInputCopy(`Introducing the new benchmark in ${bible.industry}: engineered from the ground up for visionary ${bible.targetAudience || 'teams'}.`);
    } else if (type === 'promise') {
      setInputCopy(`We promise frictionless execution, dependable reliability, and transparent collaboration at every milestone.`);
    }
  };

  // Perform AI Rephrase API Call
  const handleRephrase = async () => {
    if (!inputCopy.trim()) {
      if (onShowToast) onShowToast("Please enter or select copy to rephrase.", "#ef4444");
      return;
    }

    setIsRephrasing(true);
    try {
      const response = await safeFetchJson('/api/brand/rephrase-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalCopy: inputCopy,
          copyType,
          brandArchetype: selectedArchetype,
          intensity,
          toneModifiers: {
            boldness,
            formality,
            wit,
            emotionalResonance
          },
          companyName: bible.companyName,
          industry: bible.industry,
          targetAudience: bible.targetAudience,
          brandPersonality: bible.brandPersonality || 50
        })
      });

      if (response && response.variations && response.variations.length > 0) {
        setRephraseResult(response);
        setSelectedVariationIndex(0);

        // Add to session history
        const historyItem = {
          id: `rephrase-${Date.now()}`,
          archetype: selectedArchetype,
          original: inputCopy,
          result: response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setRephraseHistory(prev => [historyItem, ...prev.slice(0, 9)]);

        if (onShowToast) {
          onShowToast(`✨ Rephrased copy for ${selectedArchetype}!`, bible.colorPalette[0]?.hex || '#6366f1');
        }
      }
    } catch (err: any) {
      console.error("Error rephrasing copy:", err);
      if (onShowToast) {
        onShowToast("Failed to rephrase copy. Please retry.", "#ef4444");
      }
    } finally {
      setIsRephrasing(false);
    }
  };

  // Copy helper
  const handleCopyText = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    }
    if (onShowToast) {
      onShowToast("Copied to clipboard!", bible.colorPalette[0]?.hex || '#6366f1');
    }
  };

  // Apply to Bible Handlers
  const handleApplyAsMission = (text: string) => {
    if (onUpdateMission) {
      onUpdateMission(text);
      if (onShowToast) {
        onShowToast("Applied as primary Brand Mission!", bible.colorPalette[0]?.hex || '#6366f1');
      }
    }
  };

  const handleApplyAsTagline = (text: string) => {
    if (onUpdateTagline) {
      onUpdateTagline(text);
      if (onShowToast) {
        onShowToast("Applied as primary Brand Tagline!", bible.colorPalette[0]?.hex || '#6366f1');
      }
    }
  };

  const handleApplyAsAboutUs = (text: string) => {
    if (onUpdateVoice) {
      const currentVoice = typeof bible.brandVoice === 'object' ? bible.brandVoice : {
        tone: typeof bible.brandVoice === 'string' ? bible.brandVoice : 'Professional and clear',
        personalityKeywords: bible.brandKeywords || [],
        doVoiceRules: [],
        dontVoiceRules: [],
        samplePhrases: []
      };
      onUpdateVoice({
        ...currentVoice,
        aboutUsParagraph: text
      });
      if (onShowToast) {
        onShowToast("Applied as primary 'About Us' story!", bible.colorPalette[0]?.hex || '#6366f1');
      }
    }
  };

  const handleSendToBannerStudio = (text: string) => {
    const bannerEl = document.getElementById('social-banners-brand-section');
    if (bannerEl) {
      bannerEl.scrollIntoView({ behavior: 'smooth' });
      if (onShowToast) {
        onShowToast("Scrolled to Social Banners Studio!", bible.colorPalette[0]?.hex || '#6366f1');
      }
    }
  };

  const headerFontName = bible.typography?.headerFont || 'Playfair Display';
  const bodyFontName = bible.typography?.bodyFont || 'Plus Jakarta Sans';
  const primaryBrandHex = bible.colorPalette[0]?.hex || '#6366f1';

  return (
    <div
      id="brand-voice-editor-section"
      className={`border rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header Bar */}
      <div className={`border-b pb-5 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 dark:text-indigo-400 block font-sans">
              03d / Brand Voice Rephrasing Studio
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-mono">
              Archetype AI Powered
            </span>
            {bible.archetype?.primaryArchetype && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono">
                Detected: {bible.archetype.primaryArchetype}
              </span>
            )}
          </div>
          <h2 className={`text-xl sm:text-2xl font-black flex items-center gap-2 font-sans tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <Wand2 className="w-5 h-5 text-indigo-600" />
            AI Brand Voice &amp; Copy Rephrase Editor
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1 max-w-2xl leading-relaxed">
            Rephrase your brand taglines, mission statements, value propositions, and marketing copy to strictly channel any of the 12 psychological Jungian brand archetypes.
          </p>
        </div>

        {/* Top Actions: History Drawer & Quick Rephrase Button */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
          {rephraseHistory.length > 0 && (
            <button
              id="voice-editor-history-btn"
              onClick={() => setShowHistoryModal(!showHistoryModal)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold font-sans flex items-center gap-1.5 transition cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-indigo-600'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-500" />
              <span>History ({rephraseHistory.length})</span>
            </button>
          )}

          <button
            id="voice-editor-rephrase-action-btn"
            onClick={handleRephrase}
            disabled={isRephrasing || !inputCopy.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer font-sans"
          >
            <Sparkles className={`w-4 h-4 ${isRephrasing ? 'animate-spin' : 'text-amber-300'}`} />
            <span>{isRephrasing ? 'Synthesizing Voice...' : 'Rephrase with Gemini AI'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 Cols): Archetype Selector, Presets & Copy Input */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Brand Archetype Selector Grid */}
          <div className={`p-4 sm:p-5 border rounded-2xl transition-all ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                Select Target Brand Archetype
              </span>
              <span className="text-[9px] font-mono font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                {selectedArchetype}
              </span>
            </div>

            {/* Archetype 12-button Pill Carousel/Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {ARCHETYPES_CATALOG.map((arch) => {
                const isSelected = selectedArchetype === arch.name;
                const isDetected = (bible.archetype?.primaryArchetype || '').toLowerCase().includes(arch.name.toLowerCase().replace('the ', ''));

                return (
                  <button
                    key={arch.name}
                    id={`archetype-select-btn-${arch.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedArchetype(arch.name)}
                    className={`p-2 rounded-xl text-left border transition-all duration-150 cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm ring-2 ring-indigo-500/30'
                        : isDark
                          ? 'bg-slate-900 border-slate-800/90 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black truncate">{arch.name}</span>
                      {isDetected && (
                        <span
                          className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`}
                          title="Detected as primary archetype in your Brand Bible"
                        />
                      )}
                    </div>
                    <span className={`text-[9px] mt-0.5 truncate font-sans ${
                      isSelected ? 'text-indigo-100' : 'text-slate-400'
                    }`}>
                      {arch.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Archetype Mini-Card */}
            <div className={`mt-3 p-3 rounded-xl border text-xs font-sans transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-indigo-500 text-[11px]">
                  {currentArchetypeDef.name} Profile:
                </span>
                <span className="text-[10px] text-slate-400 italic truncate max-w-[200px]">
                  "{currentArchetypeDef.motto}"
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {currentArchetypeDef.toneDescription}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {currentArchetypeDef.powerKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-mono"
                  >
                    ✦ {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Source Copy Input & Preset Loaders */}
          <div className={`p-4 sm:p-5 border rounded-2xl space-y-3.5 transition-all ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                Source Copy To Rephrase
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  {inputCopy.length} chars · {inputCopy.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  onClick={() => setInputCopy('')}
                  className="text-[10px] text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  title="Clear Input"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 mr-1 font-sans">Quick Presets:</span>
              <button
                id="preset-mission-btn"
                onClick={() => handleLoadPreset('mission')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  copyType === 'mission'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                🎯 Brand Mission
              </button>
              <button
                id="preset-tagline-btn"
                onClick={() => handleLoadPreset('tagline')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  copyType === 'tagline'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                🏷️ Tagline
              </button>
              <button
                id="preset-valueprop-btn"
                onClick={() => handleLoadPreset('value_prop')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  copyType === 'value_prop'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                🚀 Value Prop
              </button>
              <button
                id="preset-about-btn"
                onClick={() => handleLoadPreset('about_us')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  copyType === 'about_us'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                📖 About Us
              </button>
              <button
                id="preset-launch-btn"
                onClick={() => handleLoadPreset('launch_hook')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                ⚡ Launch Hook
              </button>
            </div>

            {/* Input Textarea */}
            <div className="relative">
              <textarea
                id="voice-editor-input-copy"
                rows={4}
                value={inputCopy}
                onChange={(e) => setInputCopy(e.target.value)}
                placeholder="Enter or paste any sentence, mission statement, or slogan to rephrase..."
                className={`w-full p-3.5 text-xs font-medium rounded-xl border transition-all resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans leading-relaxed ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Intensity Switcher */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Archetype Flavor Intensity:
              </span>
              <div className={`flex rounded-xl p-0.5 border text-[10px] font-sans font-bold ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                {(['subtle', 'balanced', 'bold'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    id={`intensity-btn-${lvl}`}
                    onClick={() => setIntensity(lvl)}
                    className={`px-2.5 py-1 rounded-lg transition-all capitalize cursor-pointer ${
                      intensity === lvl
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Sliders Toggle */}
            <div className="border-t pt-3 border-slate-200/20">
              <button
                id="toggle-advanced-voice-sliders-btn"
                onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer font-sans"
              >
                <Sliders className="w-3 h-3" />
                <span>{showAdvancedControls ? 'Hide Nuance Sliders' : 'Fine-Tune Archetype Tone Sliders'}</span>
              </button>

              {showAdvancedControls && (
                <div className="mt-3 space-y-2.5 pt-2 border-t border-slate-200/10">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 font-sans">
                      <span>Boldness / Conviction</span>
                      <span className="font-mono text-indigo-500">{boldness}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={boldness}
                      onChange={(e) => setBoldness(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 font-sans">
                      <span>Formality vs Casual</span>
                      <span className="font-mono text-indigo-500">{formality}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formality}
                      onChange={(e) => setFormality(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 font-sans">
                      <span>Emotional Resonance</span>
                      <span className="font-mono text-indigo-500">{emotionalResonance}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={emotionalResonance}
                      onChange={(e) => setEmotionalResonance(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Generate Trigger in Column 1 */}
            <button
              id="voice-editor-rephrase-bottom-btn"
              onClick={handleRephrase}
              disabled={isRephrasing || !inputCopy.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer font-sans"
            >
              <Sparkles className={`w-4 h-4 ${isRephrasing ? 'animate-spin' : 'text-amber-300'}`} />
              <span>{isRephrasing ? 'Transforming Copy with AI...' : `Rephrase for ${selectedArchetype}`}</span>
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Rephrased Variations & Live Canvas Preview */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Preview Canvas Control Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-200/20">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-500" />
                Live Brand Typography &amp; Archetype Preview
              </span>
            </div>

            {/* Background Theme Switcher */}
            <div className={`flex rounded-xl p-0.5 border text-[10px] font-sans font-bold self-start sm:self-auto ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                id="voice-editor-theme-light"
                onClick={() => setPreviewCanvasTheme('light')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  previewCanvasTheme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Light
              </button>
              <button
                id="voice-editor-theme-dark"
                onClick={() => setPreviewCanvasTheme('dark')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  previewCanvasTheme === 'dark' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dark
              </button>
              <button
                id="voice-editor-theme-brand"
                onClick={() => setPreviewCanvasTheme('brand')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  previewCanvasTheme === 'brand' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Brand Accent
              </button>
            </div>
          </div>

          {/* Active Rephrased Copy Showcase Card */}
          {(() => {
            const activeVariation = rephraseResult?.variations[selectedVariationIndex] || {
              variationTitle: `Visionary ${selectedArchetype} Expression`,
              rephrasedCopy: inputCopy || "Building exceptional digital products with purposeful craft.",
              archetypeAlignmentScore: 96,
              rationale: `Channels ${selectedArchetype}'s core motivation of ${currentArchetypeDef.coreDesire.toLowerCase()}`,
              powerWords: currentArchetypeDef.powerKeywords.slice(0, 3),
              suggestedUse: "Primary Brand Tagline / Headline"
            };

            let cardBg = '';
            let headlineColor = '';
            let paragraphColor = '';
            let metaBg = '';

            if (previewCanvasTheme === 'dark') {
              cardBg = 'bg-slate-950 text-slate-100 border-slate-800';
              headlineColor = 'text-white';
              paragraphColor = 'text-slate-300';
              metaBg = 'bg-slate-900/90 border-slate-800 text-slate-300';
            } else if (previewCanvasTheme === 'brand') {
              cardBg = 'text-white border-indigo-700/50 shadow-inner';
              headlineColor = 'text-white';
              paragraphColor = 'text-indigo-100';
              metaBg = 'bg-black/20 border-white/10 text-indigo-100';
            } else {
              cardBg = 'bg-slate-50 text-slate-900 border-slate-200';
              headlineColor = 'text-slate-900';
              paragraphColor = 'text-slate-700';
              metaBg = 'bg-white border-slate-200 text-slate-600 shadow-2xs';
            }

            return (
              <div
                className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 space-y-4 relative overflow-hidden ${cardBg}`}
                style={previewCanvasTheme === 'brand' ? { backgroundColor: primaryBrandHex } : {}}
              >
                {/* Top Badge: Active Archetype & Score */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase font-mono bg-black/10 border border-black/10">
                      {activeVariation.variationTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                      {activeVariation.archetypeAlignmentScore}% Archetype Affinity
                    </span>
                  </div>

                  <div className="text-[10px] font-bold font-mono opacity-70">
                    Header: {headerFontName} · Body: {bodyFontName}
                  </div>
                </div>

                {/* Rendered Text with Dynamic Google Fonts */}
                <div className="py-2">
                  <div
                    className={`text-xl sm:text-2xl font-bold tracking-tight leading-snug ${headlineColor}`}
                    style={{ fontFamily: `'${headerFontName}', serif, sans-serif` }}
                  >
                    "{activeVariation.rephrasedCopy}"
                  </div>
                </div>

                {/* Archetype Rationale & Power Words Breakdown */}
                <div className={`p-3.5 rounded-xl border text-xs font-sans space-y-2 ${metaBg}`}>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <strong className="font-bold">Archetype Rationale:</strong> {activeVariation.rationale}
                    </p>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-black/10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-60">Power Words:</span>
                      {activeVariation.powerWords.map((pw, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/10 border border-black/10">
                          {pw}
                        </span>
                      ))}
                    </div>
                    <span className="text-[9px] font-mono opacity-60">
                      Suggested: {activeVariation.suggestedUse}
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons on Active Variation */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/10">
                  <button
                    id="apply-active-variation-mission-btn"
                    onClick={() => handleApplyAsMission(activeVariation.rephrasedCopy)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs font-sans"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Apply to Brand Mission</span>
                  </button>

                  <button
                    id="apply-active-variation-tagline-btn"
                    onClick={() => handleApplyAsTagline(activeVariation.rephrasedCopy)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs font-sans"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Apply as Primary Tagline</span>
                  </button>

                  <button
                    id="copy-active-variation-btn"
                    onClick={() => handleCopyText(activeVariation.rephrasedCopy, selectedVariationIndex)}
                    className="px-3 py-1.5 rounded-xl border border-black/20 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer font-sans bg-black/10 hover:bg-black/20"
                  >
                    {copiedIndex === selectedVariationIndex ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  <button
                    id="send-to-banner-btn"
                    onClick={() => handleSendToBannerStudio(activeVariation.rephrasedCopy)}
                    className="px-3 py-1.5 rounded-xl border border-black/20 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer font-sans bg-black/10 hover:bg-black/20"
                  >
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Test in Social Banners</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Generated Variations Grid (4 Cards) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Archetype Rephrasing Variations (Click to Preview)
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {rephraseResult ? '4 Live AI Variations Generated' : 'Default Sample Archetype Variations'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(rephraseResult?.variations || [
                {
                  variationTitle: "Direct & High-Impact",
                  rephrasedCopy: `Break through limits with deliberate ${bible.industry || 'innovation'}.`,
                  archetypeAlignmentScore: 97,
                  rationale: `Sharp, memorable, and evokes the core desire of ${selectedArchetype}.`,
                  powerWords: ["Break Through", "Deliberate", "Innovation"],
                  suggestedUse: "Primary Brand Tagline"
                },
                {
                  variationTitle: "Visionary & Transformational",
                  rephrasedCopy: `Where visionary purpose forges the future of ${bible.industry || 'technology'}.`,
                  archetypeAlignmentScore: 94,
                  rationale: `Broadens the emotional scope and frames the brand as an archetype leader.`,
                  powerWords: ["Visionary", "Forges", "Future"],
                  suggestedUse: "Website Hero Headline"
                },
                {
                  variationTitle: "Sharp & Distinctive",
                  rephrasedCopy: `Uncompromising craft. Built for those who refuse the standard.`,
                  archetypeAlignmentScore: 93,
                  rationale: `Creates memorable differentiation against market incumbents.`,
                  powerWords: ["Uncompromising", "Craft", "Refuse"],
                  suggestedUse: "Campaign Hook"
                },
                {
                  variationTitle: "Premium & Resonant",
                  rephrasedCopy: `${bible.companyName || 'Our brand'}: Designed with relentless intent for modern ${bible.targetAudience || 'creators'}.`,
                  archetypeAlignmentScore: 95,
                  rationale: `Elevates the original message intent with polished archetype vocabulary.`,
                  powerWords: ["Relentless Intent", "Modern", "Designed"],
                  suggestedUse: "About Us Narrative"
                }
              ]).map((variation, idx) => {
                const isSelected = selectedVariationIndex === idx;

                return (
                  <div
                    key={idx}
                    id={`voice-variation-card-${idx}`}
                    onClick={() => setSelectedVariationIndex(idx)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? isDark
                          ? 'bg-slate-900 border-indigo-500/80 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/50'
                          : 'bg-white border-indigo-500 shadow-md shadow-indigo-100 ring-1 ring-indigo-500'
                        : isDark
                          ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                          : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-2xs'
                    }`}
                  >
                    <div>
                      {/* Title & Score Pill */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider font-sans ${
                          isSelected ? 'text-indigo-500' : 'text-slate-400'
                        }`}>
                          {variation.variationTitle}
                        </span>
                        <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {variation.archetypeAlignmentScore}%
                        </span>
                      </div>

                      {/* Copy snippet */}
                      <p className={`text-xs font-semibold leading-relaxed font-sans ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}>
                        "{variation.rephrasedCopy}"
                      </p>

                      {/* Rationale snippet */}
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight font-sans">
                        {variation.rationale}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/10">
                      <div className="flex gap-1 flex-wrap">
                        {variation.powerWords.slice(0, 2).map((pw, i) => (
                          <span
                            key={i}
                            className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {pw}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyText(variation.rephrasedCopy, idx);
                        }}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-indigo-600'
                        }`}
                        title="Copy text"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Archetype Vocabulary & Linguistic Translation Matrix */}
          {rephraseResult?.vocabularyTransformation && rephraseResult.vocabularyTransformation.length > 0 && (
            <div className={`p-4 rounded-2xl border transition-all ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-indigo-50/30 border-indigo-100/80'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-indigo-500" />
                <h4 className={`text-xs font-black uppercase tracking-wider font-sans ${
                  isDark ? 'text-indigo-300' : 'text-indigo-700'
                }`}>
                  Archetype Linguistic Translation Matrix ({selectedArchetype})
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {rephraseResult.vocabularyTransformation.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs font-sans ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <span className="text-slate-400 line-through text-[11px]">{item.beforeWord}</span>
                      <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="text-indigo-500 font-extrabold text-[11px]">{item.afterWord}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session History Modal / Overlay */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-xl p-6 rounded-3xl border shadow-2xl font-sans max-h-[85vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/20">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-extrabold">Rephrase Session History</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {rephraseHistory.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-500">{item.archetype}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate italic">
                    Original: "{item.original}"
                  </p>
                  <div className="space-y-1 pt-1">
                    {item.result.variations.slice(0, 2).map((v, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 text-xs font-medium">
                        <span className="truncate">"{v.rephrasedCopy}"</span>
                        <button
                          onClick={() => {
                            setInputCopy(v.rephrasedCopy);
                            setSelectedArchetype(item.archetype);
                            setShowHistoryModal(false);
                            if (onShowToast) onShowToast("Loaded variation into editor!", bible.colorPalette[0]?.hex || '#6366f1');
                          }}
                          className="text-[10px] font-bold text-indigo-500 hover:underline shrink-0"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
