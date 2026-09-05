import React, { useState, useEffect } from 'react';
import { downloadBrandPdf, previewBrandPdfInNewTab, PdfExportOptions } from '../utils/brandPdfGenerator';
import { PdfExportModal } from './PdfExportModal';
import { ShareLinkModal } from './ShareLinkModal';
import html2canvas from 'html2canvas';
import * as htmlToImage from 'html-to-image';
import { BrandBible, Color, BrandArchetype, BrandPattern, BrandFavicon, VoiceMetric, BrandVoice, StyleAuditReport } from '../types';
import { safeFetchJson } from '../utils/api';
import { generateShareableUrl, encodeBrandBibleToHash } from '../utils/share';
import { generatePatternSvg, generatePatternDataUrl, BRAND_PATTERN_TEMPLATES, PatternType, extractBrandColors } from '../utils/patternGenerator';
import { SocialBannersSection } from './SocialBannersSection';
import { BrandVoiceEditor } from './BrandVoiceEditor';
import { Palette, Type, CheckCircle, XCircle, Copy, Check, Download, RefreshCw, FileImage, ShieldCheck, AlignLeft, Eye, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, Shuffle, History, Compass, Sparkles, Layers, Grid, Globe, Activity, ThumbsUp, BarChart3, TrendingUp, FileJson, FileText, ChevronDown, Volume2, Sliders, MessageSquare, Code2, Target, Wand2, Bot, Zap, Share2, Lightbulb, Megaphone, X, Info, Search, ExternalLink, ArrowUpRight, Camera, Heart, Columns, LayoutGrid, Star, Ruler, Ban, Sun, Moon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as ChartTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export interface PersonalityTrait {
  trait: string;
  score: number;
  fullMark: number;
  description: string;
}

export function computePersonalityTraitsFromMission(
  missionText: string,
  keywords: string[] = [],
  industry: string = ''
): PersonalityTrait[] {
  const text = `${missionText || ''} ${keywords.join(' ')} ${industry || ''}`.toLowerCase();

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const getSeedScore = (offset: number) => 58 + ((seed * (offset + 1) * 31) % 32); // baseline 58-89

  const boldnessKW = ['bold', 'lead', 'disrupt', 'power', 'transform', 'courage', 'daring', 'fearless', 'impact', 'pioneer', 'frontier', 'dominate', 'master'];
  const playfulnessKW = ['play', 'fun', 'delight', 'joy', 'creative', 'vibrant', 'friendly', 'colorful', 'exciting', 'engaging', 'smile', 'magic', 'spark'];
  const sophisticationKW = ['luxury', 'premium', 'elegant', 'sophisticated', 'craft', 'refine', 'prestige', 'minimal', 'exclusive', 'heritage', 'sleek', 'flawless', 'quality'];
  const trustKW = ['trust', 'secure', 'reliable', 'safe', 'proven', 'authentic', 'integrity', 'guarantee', 'foundation', 'stable', 'transparent', 'expert', 'shield'];
  const innovationKW = ['innovate', 'next-gen', 'future', 'smart', 'tech', 'ai', 'modern', 'pioneer', 'cutting-edge', 'digital', 'vision', 'advanced', 'automation'];
  const empathyKW = ['human', 'empower', 'community', 'care', 'sustainable', 'green', 'inclusive', 'empathy', 'together', 'people', 'accessible', 'support', 'listen'];

  const countMatches = (list: string[]) => list.reduce((acc, kw) => (text.includes(kw) ? acc + 10 : acc), 0);

  const boldness = Math.min(98, Math.max(35, getSeedScore(1) + countMatches(boldnessKW)));
  const playfulness = Math.min(98, Math.max(35, getSeedScore(2) + countMatches(playfulnessKW)));
  const sophistication = Math.min(98, Math.max(35, getSeedScore(3) + countMatches(sophisticationKW)));
  const trustworthiness = Math.min(98, Math.max(35, getSeedScore(4) + countMatches(trustKW)));
  const innovation = Math.min(98, Math.max(35, getSeedScore(5) + countMatches(innovationKW)));
  const empathy = Math.min(98, Math.max(35, getSeedScore(6) + countMatches(empathyKW)));

  return [
    { trait: 'Boldness', score: boldness, fullMark: 100, description: 'Daring drive, market disruption & courage' },
    { trait: 'Playfulness', score: playfulness, fullMark: 100, description: 'Creative delight, warmth & energy' },
    { trait: 'Sophistication', score: sophistication, fullMark: 100, description: 'Sleek elegance, premium craft & refinement' },
    { trait: 'Trustworthiness', score: trustworthiness, fullMark: 100, description: 'Rock-solid reliability, security & integrity' },
    { trait: 'Innovation', score: innovation, fullMark: 100, description: 'Cutting-edge technology & forward vision' },
    { trait: 'Empathy', score: empathy, fullMark: 100, description: 'Human-centric care, sustainability & inclusion' }
  ];
}

interface BrandBibleDashboardProps {
  bible: BrandBible;
  onUpdateLogo: (newLogoUrl: string) => void;
  isLoadingLogo: boolean;
  onRegenerateLogo: (customPrompt?: string) => Promise<void>;
  logoSize: '1K' | '2K' | '4K';
  isDark?: boolean;
  onUpdatePalette: (newPalette: Color[]) => void;
  onUpdateArchetype: (newArchetype: BrandArchetype) => void;
  onUpdatePattern: (newPattern: BrandPattern) => void;
  onUpdateFavicon: (newFavicon: BrandFavicon) => void;
  onUpdateVoice?: (newVoice: BrandVoice) => void;
  onUpdateBible?: (newBible: BrandBible) => void;
  onUpdateMission?: (newMission: string) => void;
  onUpdateTagline?: (newTagline: string) => void;
}

export default function BrandBibleDashboard({
  bible,
  onUpdateLogo,
  isLoadingLogo,
  onRegenerateLogo,
  logoSize,
  isDark = false,
  onUpdatePalette,
  onUpdateArchetype,
  onUpdatePattern,
  onUpdateFavicon,
  onUpdateVoice,
  onUpdateBible,
  onUpdateMission,
  onUpdateTagline
}: BrandBibleDashboardProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [contrastBg, setContrastBg] = useState<string>(bible.colorPalette[0]?.hex || '#ffffff');
  const [contrastText, setContrastText] = useState<string>(bible.colorPalette[1]?.hex || '#0f172a');
  const [pairwiseTab, setPairwiseTab] = useState<'matrix' | 'list'>('matrix');

  // Contrast Sandbox Customization States
  const [sandboxCustomHeading, setSandboxCustomHeading] = useState<string>('Designing with Accessible Intent');
  const [sandboxCustomBody, setSandboxCustomBody] = useState<string>(`At ${bible.companyName || 'our brand'}, legibility is non-negotiable. Live-preview text and UI components on selected brand colors to ensure WCAG readability.`);
  const [sandboxCustomButtonText, setSandboxCustomButtonText] = useState<string>('Explore Platform');
  const [sandboxComponentView, setSandboxComponentView] = useState<'hero' | 'card' | 'form' | 'alert' | 'nav'>('hero');
  const [sandboxFontSize, setSandboxFontSize] = useState<number>(16);
  const [sandboxFontWeight, setSandboxFontWeight] = useState<'normal' | 'medium' | 'bold' | 'extrabold'>('bold');
  const [isSandboxFullscreen, setIsSandboxFullscreen] = useState<boolean>(false);

  // Mission Personality Traits Radar States
  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTrait[]>(() => {
    return computePersonalityTraitsFromMission(
      bible.mission,
      bible.brandKeywords,
      bible.industry
    );
  });
  const [selectedTraitPreset, setSelectedTraitPreset] = useState<string>('auto');
  const [showTraitSliders, setShowTraitSliders] = useState<boolean>(false);

  useEffect(() => {
    if (selectedTraitPreset === 'auto') {
      setPersonalityTraits(
        computePersonalityTraitsFromMission(
          bible.mission,
          bible.brandKeywords,
          bible.industry
        )
      );
    }
  }, [bible.mission, bible.brandKeywords, bible.industry, selectedTraitPreset]);

  const handleTraitPresetChange = (presetKey: string) => {
    setSelectedTraitPreset(presetKey);
    if (presetKey === 'auto') {
      setPersonalityTraits(
        computePersonalityTraitsFromMission(
          bible.mission,
          bible.brandKeywords,
          bible.industry
        )
      );
    } else if (presetKey === 'disruptive') {
      setPersonalityTraits([
        { trait: 'Boldness', score: 95, fullMark: 100, description: 'Daring drive, market disruption & courage' },
        { trait: 'Playfulness', score: 62, fullMark: 100, description: 'Creative delight, warmth & energy' },
        { trait: 'Sophistication', score: 70, fullMark: 100, description: 'Sleek elegance, premium craft & refinement' },
        { trait: 'Trustworthiness', score: 78, fullMark: 100, description: 'Rock-solid reliability, security & integrity' },
        { trait: 'Innovation', score: 96, fullMark: 100, description: 'Cutting-edge technology & forward vision' },
        { trait: 'Empathy', score: 60, fullMark: 100, description: 'Human-centric care, sustainability & inclusion' }
      ]);
    } else if (presetKey === 'luxury') {
      setPersonalityTraits([
        { trait: 'Boldness', score: 68, fullMark: 100, description: 'Daring drive, market disruption & courage' },
        { trait: 'Playfulness', score: 38, fullMark: 100, description: 'Creative delight, warmth & energy' },
        { trait: 'Sophistication', score: 98, fullMark: 100, description: 'Sleek elegance, premium craft & refinement' },
        { trait: 'Trustworthiness', score: 88, fullMark: 100, description: 'Rock-solid reliability, security & integrity' },
        { trait: 'Innovation', score: 65, fullMark: 100, description: 'Cutting-edge technology & forward vision' },
        { trait: 'Empathy', score: 55, fullMark: 100, description: 'Human-centric care, sustainability & inclusion' }
      ]);
    } else if (presetKey === 'empathetic') {
      setPersonalityTraits([
        { trait: 'Boldness', score: 48, fullMark: 100, description: 'Daring drive, market disruption & courage' },
        { trait: 'Playfulness', score: 85, fullMark: 100, description: 'Creative delight, warmth & energy' },
        { trait: 'Sophistication', score: 58, fullMark: 100, description: 'Sleek elegance, premium craft & refinement' },
        { trait: 'Trustworthiness', score: 92, fullMark: 100, description: 'Rock-solid reliability, security & integrity' },
        { trait: 'Innovation', score: 68, fullMark: 100, description: 'Cutting-edge technology & forward vision' },
        { trait: 'Empathy', score: 96, fullMark: 100, description: 'Human-centric care, sustainability & inclusion' }
      ]);
    } else if (presetKey === 'enterprise') {
      setPersonalityTraits([
        { trait: 'Boldness', score: 72, fullMark: 100, description: 'Daring drive, market disruption & courage' },
        { trait: 'Playfulness', score: 35, fullMark: 100, description: 'Creative delight, warmth & energy' },
        { trait: 'Sophistication', score: 82, fullMark: 100, description: 'Sleek elegance, premium craft & refinement' },
        { trait: 'Trustworthiness', score: 98, fullMark: 100, description: 'Rock-solid reliability, security & integrity' },
        { trait: 'Innovation', score: 80, fullMark: 100, description: 'Cutting-edge technology & forward vision' },
        { trait: 'Empathy', score: 72, fullMark: 100, description: 'Human-centric care, sustainability & inclusion' }
      ]);
    }
  };

  const handleTraitSliderChange = (traitName: string, newValue: number) => {
    setSelectedTraitPreset('custom');
    setPersonalityTraits(prev =>
      prev.map(item => (item.trait === traitName ? { ...item, score: newValue } : item))
    );
  };

  const dominantTrait = [...personalityTraits].sort((a, b) => b.score - a.score)[0] || personalityTraits[0];

  const getDesignTipForTrait = (trait: string) => {
    switch (trait) {
      case 'Boldness':
        return 'High Boldness: Pair heavy, high-contrast typography with sharp geometric brand marks and high-impact visual statements.';
      case 'Playfulness':
        return 'High Playfulness: Utilize energetic pastel or vibrant accent pops, soft organic radii, and expressive motion transitions.';
      case 'Sophistication':
        return 'High Sophistication: Embrace ample negative space, understated monochrome accents, and refined serif or clean grotesk typography.';
      case 'Trustworthiness':
        return 'High Trustworthiness: Anchor visuals in structured grid alignments, oceanic deep tones, and clear verification badges.';
      case 'Innovation':
        return 'High Innovation: Implement futuristic dark mode contrasts, electric neon swatches, and sleek geometric emblems.';
      case 'Empathy':
        return 'High Empathy: Use warm approachable neutrals, human story callouts, and accessible WCAG contrast balances.';
      default:
        return 'Balanced Profile: Maintain a clean, modern aesthetic with harmonized typography and flexible color roles.';
    }
  };

  const handleSwapContrastColors = () => {
    const temp = contrastBg;
    setContrastBg(contrastText);
    setContrastText(temp);
  };

  const handleSuggestMaxContrast = () => {
    const candidates = [
      ...bible.colorPalette.map(c => c.hex),
      '#ffffff',
      '#0f172a'
    ];
    let bestHex = candidates[0];
    let maxRatio = -1;
    candidates.forEach(hex => {
      const ratio = getContrastRatio(contrastBg, hex);
      if (ratio > maxRatio) {
        maxRatio = ratio;
        bestHex = hex;
      }
    });
    setContrastText(bestHex);
    setToast({
      message: `Auto-selected highest contrast color (${maxRatio.toFixed(1)}:1 ratio)!`,
      hex: bestHex
    });
    setTimeout(() => setToast(null), 2500);
  };

  const handleApplySandboxPreset = (preset: 'hero' | 'cta' | 'alert' | 'nav') => {
    if (preset === 'hero') {
      setSandboxCustomHeading(`Elevate Your ${bible.industry || 'Brand'} Identity`);
      setSandboxCustomBody(`Discover how ${bible.companyName || 'our brand'} combines purpose-driven craftsmanship with seamless digital experiences for ${bible.targetAudience || 'modern teams'}.`);
      setSandboxCustomButtonText('Explore Platform');
      setSandboxComponentView('hero');
    } else if (preset === 'cta') {
      setSandboxCustomHeading('Ready to Transform Your Workflow?');
      setSandboxCustomBody(`Join thousands of creators using ${bible.companyName || 'our platform'} to build distinct, accessible brand systems at scale.`);
      setSandboxCustomButtonText('Get Started Free');
      setSandboxComponentView('card');
    } else if (preset === 'alert') {
      setSandboxCustomHeading('Color System Notice');
      setSandboxCustomBody(`All brand color combinations pass WCAG 2.1 AA readability standards across digital viewports.`);
      setSandboxCustomButtonText('View Guidelines');
      setSandboxComponentView('alert');
    } else if (preset === 'nav') {
      setSandboxCustomHeading(bible.companyName || 'Brand Mark');
      setSandboxCustomBody('Products   ‚Ä¢   Solutions   ‚Ä¢   Enterprise   ‚Ä¢   Resources');
      setSandboxCustomButtonText('Sign In');
      setSandboxComponentView('nav');
    }
  };

  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isAboutUsCopied, setIsAboutUsCopied] = useState(false);

  const handleGenerateVoice = async (customPrompt?: string) => {
    setIsGeneratingVoice(true);
    try {
      const data = await safeFetchJson('/api/brand/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: bible.companyName,
          mission: bible.mission,
          industry: bible.industry,
          targetAudience: bible.targetAudience,
          brandPersonality: bible.brandPersonality || 50,
          customPrompt
        })
      });

      if (onUpdateVoice) {
        onUpdateVoice(data);
      }
    } catch (err) {
      console.error("Error generating brand voice:", err);
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const handleCopyAboutUs = () => {
    const voiceObj = typeof bible.brandVoice === 'object' ? bible.brandVoice : null;
    const textToCopy = voiceObj?.aboutUsParagraph || `${bible.companyName} is dedicated to pioneering ${bible.industry} solutions crafted for ${bible.targetAudience}. Guided by our mission‚Äî"${bible.mission}"‚Äîwe merge vision with quality to empower our community.`;
    navigator.clipboard.writeText(textToCopy);
    setIsAboutUsCopied(true);
    setTimeout(() => setIsAboutUsCopied(false), 2000);
  };

  useEffect(() => {
    if (bible.colorPalette && bible.colorPalette.length > 1) {
      setContrastBg(bible.colorPalette[0].hex);
      setContrastText(bible.colorPalette[1].hex);
    }
  }, [bible.colorPalette]);

  const calculateColorData = () => {
    const palette = bible.colorPalette || [];
    if (palette.length === 0) return [];
    
    const roleWeights: Record<string, number> = {
      'primary': 50,
      'secondary': 25,
      'accent': 15,
      'dark neutral': 10,
      'light neutral': 10
    };
    
    let totalWeight = 0;
    const mapped = palette.map((color) => {
      const roleKey = (color.role || '').toLowerCase().trim();
      const weight = roleWeights[roleKey] || 10;
      totalWeight += weight;
      return {
        name: color.name,
        hex: color.hex,
        role: color.role,
        weight: weight
      };
    });
    
    // Normalize to 100%
    return mapped.map(item => ({
      name: item.name,
      value: Math.round((item.weight / totalWeight) * 100),
      hex: item.hex,
      role: item.role
    }));
  };

  const getKeywordChartData = () => {
    const keywords = bible.brandKeywords || [];
    if (keywords.length === 0) return [];
    
    return keywords.map((keyword) => {
      let hash = 0;
      for (let i = 0; i < keyword.length; i++) {
        hash = keyword.charCodeAt(i) + ((hash << 5) - hash);
      }
      const sentiment = 72 + (Math.abs(hash) % 24); // 72% to 95%
      const strength = 66 + (Math.abs(hash >> 2) % 30); // 66% to 95%
      const clarity = 60 + (Math.abs(hash >> 4) % 36); // 60% to 95%
      return {
        name: keyword,
        Sentiment: sentiment,
        Strength: strength,
        Clarity: clarity,
      };
    });
  };

  const [customLogoPrompt, setCustomLogoPrompt] = useState(bible.logoPrompt);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<{ message: string; hex: string } | null>(null);

  const [logoAspectRatio, setLogoAspectRatio] = useState<'standard' | 'square'>('standard');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<StyleAuditReport | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Accessibility Auditor States
  const [showA11yAuditorModal, setShowA11yAuditorModal] = useState(false);
  const [a11yFilter, setA11yFilter] = useState<'all' | 'failing' | 'aa' | 'aaa'>('failing');

  // Motion Identity States
  const [motionPreset, setMotionPreset] = useState<'slide-up' | 'fade-scale' | 'elastic-pop' | 'shimmer'>('slide-up');
  const [motionDuration, setMotionDuration] = useState<number>(0.8);
  const [motionKey, setMotionKey] = useState<number>(0);
  const [isMotionCssCopied, setIsMotionCssCopied] = useState<boolean>(false);

  // Logo Usage Rules States
  const [clearSpaceFactor, setClearSpaceFactor] = useState<number>(1);
  const [usageTabFilter, setUsageTabFilter] = useState<'all' | 'clearspace' | 'backgrounds' | 'sizes' | 'donts'>('all');

  const handleRunStyleAudit = async () => {
    setIsAuditing(true);
    try {
      const data = await safeFetchJson('/api/brand/style-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandBible: bible,
          selectedModel: 'gemini-2.0-flash'
        })
      });

      if (data && (data.overallScore !== undefined || data.summary)) {
        setAuditReport(data);
        setShowAuditModal(true);
        setToast({
          message: `Style Audit Complete! Overall Score: ${data.overallScore || 95}/100`,
          hex: bible.colorPalette[0]?.hex || '#6366f1'
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        message: `Style Audit failed: ${err.message}`,
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopyShareableLink = async (openModalAfter = false) => {
    try {
      const base64Str = encodeBrandBibleToHash(bible);
      window.location.hash = `share=${base64Str}`;
      window.history.replaceState(null, '', `#share=${base64Str}`);

      const shareUrl = generateShareableUrl(bible);
      let copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          copied = true;
        } catch {
          // fallback below
        }
      }
      if (!copied) {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = shareUrl;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          copied = true;
        } catch (e) {
          console.warn('Fallback copy error:', e);
        }
      }

      setIsLinkCopied(true);
      setToast({
        message: "Shareable link generated and copied! Active brand bible encoded into URL hash.",
        hex: bible.colorPalette[0]?.hex || '#6366f1'
      });
      setTimeout(() => setIsLinkCopied(false), 2500);
      setTimeout(() => setToast(null), 3500);

      if (openModalAfter) {
        setShowShareModal(true);
      }
    } catch (err: any) {
      console.error("Failed to copy shareable link:", err);
      setToast({
        message: `Failed to copy shareable link: ${err?.message || 'Error'}`,
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3500);
    }
  };

  const [isLogoHistoryOpen, setIsLogoHistoryOpen] = useState(false);
  const [overlayViewMode, setOverlayViewMode] = useState<'grid' | 'carousel' | 'compare'>('grid');
  const [overlayCarouselIndex, setOverlayCarouselIndex] = useState(0);
  const [compareLogoAIndex, setCompareLogoAIndex] = useState(0);
  const [compareLogoBIndex, setCompareLogoBIndex] = useState(1);
  const [overlayBg, setOverlayBg] = useState<'dark' | 'light' | 'checker'>('dark');
  const [favoriteLogos, setFavoriteLogos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('brand_generator_favorite_logos');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleFavoriteLogo = (logoUrl: string) => {
    setFavoriteLogos(prev => {
      const exists = prev.includes(logoUrl);
      const updated = exists ? prev.filter(u => u !== logoUrl) : [...prev, logoUrl];
      try {
        localStorage.setItem('brand_generator_favorite_logos', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save favorite logos:', err);
      }
      return updated;
    });
  };

  useEffect(() => {
    if (!isLogoHistoryOpen) return;
    const count = bible.previousLogos?.length || (bible.primaryLogo ? 1 : 0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLogoHistoryOpen(false);
      } else if (overlayViewMode === 'carousel' && count > 0) {
        if (e.key === 'ArrowLeft') {
          setOverlayCarouselIndex(prev => (prev === 0 ? count - 1 : prev - 1));
        } else if (e.key === 'ArrowRight') {
          setOverlayCarouselIndex(prev => (prev === count - 1 ? 0 : prev + 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLogoHistoryOpen, overlayViewMode, bible.previousLogos, bible.primaryLogo]);

  const handleRestoreLogo = (logoUrl: string) => {
    onUpdateLogo(logoUrl);
    setToast({
      message: "Successfully set logo variation as active primary mark!",
      hex: "#6366f1"
    });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Shuffling states
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleStyle, setShuffleStyle] = useState<'shades' | 'complementary'>('shades');

  const handleShufflePalette = async () => {
    setIsShuffling(true);
    try {
      const data = await safeFetchJson('/api/brand/shuffle-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: bible.companyName,
          mission: bible.mission,
          industry: bible.industry,
          targetAudience: bible.targetAudience,
          currentPalette: bible.colorPalette,
          shuffleType: shuffleStyle === 'shades' ? 'alternative shades and tint variations' : 'complementary color harmonies'
        })
      });

      if (data.colorPalette && Array.isArray(data.colorPalette)) {
        onUpdatePalette(data.colorPalette);
        setToast({
          message: `Successfully generated ${shuffleStyle === 'shades' ? 'alternative shades' : 'complementary colors'}!`,
          hex: data.colorPalette[0].hex
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        message: `Shuffle failed: ${err.message}`,
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsShuffling(false);
    }
  };

  const handleRandomizeOrSwapPalette = () => {
    if (!bible.colorPalette || bible.colorPalette.length <= 1) return;

    // Identify primary index (typically has role "primary" or is index 0)
    let primaryIdx = bible.colorPalette.findIndex(
      c => (c.role || '').toLowerCase().trim() === 'primary'
    );
    if (primaryIdx === -1) {
      primaryIdx = 0; // fallback to first color
    }

    const primaryColor = bible.colorPalette[primaryIdx];
    const otherColors = bible.colorPalette.filter((_, idx) => idx !== primaryIdx);

    // Shuffle otherColors using Fisher-Yates
    const shuffledOthers = [...otherColors];
    for (let i = shuffledOthers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffledOthers[i];
      shuffledOthers[i] = shuffledOthers[j];
      shuffledOthers[j] = temp;
    }

    // Reconstruct the new palette array: keep the primary color at its original index,
    // and place the shuffled other colors in the remaining indices
    const newPalette = [...bible.colorPalette];
    let otherCount = 0;
    for (let i = 0; i < newPalette.length; i++) {
      if (i === primaryIdx) {
        newPalette[i] = primaryColor;
      } else {
        newPalette[i] = shuffledOthers[otherCount++];
      }
    }

    onUpdatePalette(newPalette);

    setToast({
      message: "Shuffled non-primary colors in palette while keeping the primary logo color consistent!",
      hex: primaryColor.hex
    });
    setTimeout(() => setToast(null), 3000);
  };

  // AI Palette Regeneration States & Handlers
  const [isRegeneratingAiPalette, setIsRegeneratingAiPalette] = useState(false);
  const [showRegenPaletteModal, setShowRegenPaletteModal] = useState(false);
  const [aiSuggestedPalette, setAiSuggestedPalette] = useState<Color[] | null>(null);
  const [aiSuggestedRationale, setAiSuggestedRationale] = useState<string | null>(null);
  const [customPaletteFocus, setCustomPaletteFocus] = useState<string>('');

  const handleRegenerateAiPalette = async (focusOverride?: string) => {
    setIsRegeneratingAiPalette(true);
    try {
      const data = await safeFetchJson('/api/brand/regenerate-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: bible.companyName,
          mission: bible.mission,
          industry: bible.industry,
          targetAudience: bible.targetAudience,
          brandKeywords: bible.brandKeywords,
          customFocus: focusOverride !== undefined ? focusOverride : customPaletteFocus
        })
      });

      if (data && data.colorPalette && Array.isArray(data.colorPalette)) {
        setAiSuggestedPalette(data.colorPalette);
        setAiSuggestedRationale(data.rationale || 'AI Consultant synthesized this fresh 5-color palette to embody your core brand mission and audience psychology.');
        setShowRegenPaletteModal(true);
      } else {
        throw new Error('Invalid palette output returned from AI consultant.');
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        message: `Palette regeneration failed: ${err.message}`,
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsRegeneratingAiPalette(false);
    }
  };

  const handleApplyAiPalette = () => {
    if (aiSuggestedPalette) {
      onUpdatePalette(aiSuggestedPalette);
      setToast({
        message: 'Fresh 5-Color AI Palette applied to your Brand Bible!',
        hex: aiSuggestedPalette[0]?.hex || '#6366f1'
      });
      setTimeout(() => setToast(null), 3000);
      setShowRegenPaletteModal(false);
    }
  };

  // Archetype states & generation
  const [isGeneratingArchetype, setIsGeneratingArchetype] = useState(false);

  const handleGenerateArchetype = async () => {
    setIsGeneratingArchetype(true);
    try {
      const data = await safeFetchJson('/api/brand/generate-archetype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: bible.companyName,
          mission: bible.mission,
          industry: bible.industry,
          targetAudience: bible.targetAudience
        })
      });

      if (data && data.primaryArchetype) {
        onUpdateArchetype(data);
        setToast({
          message: `Archetype Discovered: ${data.primaryArchetype}!`,
          hex: '#6366f1'
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        message: `Archetype Discovery failed: ${err.message}`,
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsGeneratingArchetype(false);
    }
  };

  // Brand Voice Spider Chart metrics logic
  const deriveDefaultVoiceMetrics = (brandBible: BrandBible): VoiceMetric[] => {
    if (typeof brandBible.brandVoice === 'object' && brandBible.brandVoice.metrics && brandBible.brandVoice.metrics.length >= 5) {
      return brandBible.brandVoice.metrics;
    }

    const voiceObj = typeof brandBible.brandVoice === 'object' ? brandBible.brandVoice : null;
    const toneText = (voiceObj?.tone || (typeof brandBible.brandVoice === 'string' ? brandBible.brandVoice : '')).toLowerCase();
    const keywords = (voiceObj?.personalityKeywords || brandBible.brandKeywords || []).map(k => k.toLowerCase()).join(' ');
    const fullText = `${toneText} ${keywords} ${brandBible.companyName.toLowerCase()} ${brandBible.industry.toLowerCase()}`;

    const getScore = (attrName: string, positiveTerms: string[], defaultBase: number) => {
      let score = defaultBase;
      positiveTerms.forEach(term => {
        if (fullText.includes(term)) score += 10;
      });
      let hash = 0;
      for (let i = 0; i < attrName.length; i++) {
        hash += attrName.charCodeAt(i) * (i + 1);
      }
      for (let i = 0; i < fullText.length; i++) {
        hash += fullText.charCodeAt(i);
      }
      score = score + (hash % 15);
      return Math.min(98, Math.max(35, score));
    };

    return [
      {
        attribute: 'Formality',
        value: getScore('Formality', ['formal', 'corporate', 'professional', 'authoritative', 'premium', 'academic', 'expert'], 65),
        description: 'Structured, professional & refined tone'
      },
      {
        attribute: 'Warmth',
        value: getScore('Warmth', ['warm', 'empathetic', 'friendly', 'caring', 'supportive', 'compassionate', 'community'], 72),
        description: 'Empathy, friendliness & human connection'
      },
      {
        attribute: 'Authority',
        value: getScore('Authority', ['authoritative', 'confident', 'expert', 'leader', 'trusted', 'secure', 'proven'], 82),
        description: 'Expertise, trust & confidence'
      },
      {
        attribute: 'Energy',
        value: getScore('Energy', ['energetic', 'dynamic', 'uplifting', 'passionate', 'vibrant', 'exciting', 'bold'], 75),
        description: 'Passionate & high-momentum expression'
      },
      {
        attribute: 'Boldness',
        value: getScore('Boldness', ['bold', 'disruptive', 'innovative', 'cutting-edge', 'pioneering', 'fearless'], 70),
        description: 'Trailblazing & provocative stance'
      },
      {
        attribute: 'Clarity',
        value: getScore('Clarity', ['clear', 'concise', 'direct', 'simple', 'transparent', 'punchy', 'accessible'], 86),
        description: 'Concise, direct & accessible copy'
      },
      {
        attribute: 'Playfulness',
        value: getScore('Playfulness', ['playful', 'witty', 'humorous', 'fun', 'quirky', 'creative', 'casual'], 52),
        description: 'Witty, lighthearted & creative humor'
      }
    ];
  };

  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetric[]>(() => deriveDefaultVoiceMetrics(bible));

  useEffect(() => {
    setVoiceMetrics(deriveDefaultVoiceMetrics(bible));
  }, [bible.id, bible.brandVoice]);

  const handleVoiceMetricChange = (idx: number, newValue: number) => {
    const updated = [...voiceMetrics];
    updated[idx] = { ...updated[idx], value: newValue };
    setVoiceMetrics(updated);
  };

  const handleResetVoiceMetrics = () => {
    setVoiceMetrics(deriveDefaultVoiceMetrics(bible));
  };

  const handleApplyVoicePreset = (preset: 'corporate' | 'startup' | 'warm' | 'disruptive') => {
    let updated = [...voiceMetrics];
    if (preset === 'corporate') {
      updated = updated.map(m => {
        if (m.attribute === 'Formality') return { ...m, value: 92 };
        if (m.attribute === 'Authority') return { ...m, value: 95 };
        if (m.attribute === 'Clarity') return { ...m, value: 88 };
        if (m.attribute === 'Playfulness') return { ...m, value: 30 };
        if (m.attribute === 'Boldness') return { ...m, value: 60 };
        return m;
      });
    } else if (preset === 'startup') {
      updated = updated.map(m => {
        if (m.attribute === 'Boldness') return { ...m, value: 94 };
        if (m.attribute === 'Energy') return { ...m, value: 90 };
        if (m.attribute === 'Formality') return { ...m, value: 45 };
        if (m.attribute === 'Playfulness') return { ...m, value: 75 };
        return m;
      });
    } else if (preset === 'warm') {
      updated = updated.map(m => {
        if (m.attribute === 'Warmth') return { ...m, value: 96 };
        if (m.attribute === 'Clarity') return { ...m, value: 90 };
        if (m.attribute === 'Formality') return { ...m, value: 50 };
        if (m.attribute === 'Playfulness') return { ...m, value: 68 };
        return m;
      });
    } else if (preset === 'disruptive') {
      updated = updated.map(m => {
        if (m.attribute === 'Boldness') return { ...m, value: 98 };
        if (m.attribute === 'Energy') return { ...m, value: 92 };
        if (m.attribute === 'Formality') return { ...m, value: 35 };
        if (m.attribute === 'Playfulness') return { ...m, value: 82 };
        return m;
      });
    }
    setVoiceMetrics(updated);
  };

  // Pattern states & generation
  const [isGeneratingPattern, setIsGeneratingPattern] = useState(false);
  const [selectedPatternStyle, setSelectedPatternStyle] = useState('Modern Minimal Grid');
  const [patternOverlayMode, setPatternOverlayMode] = useState<'light' | 'dark' | 'color'>('light');
  const [isPatternCopied, setIsPatternCopied] = useState(false);

  // Tiled Geometric Brand Pattern Section States
  const [selectedGeometricPattern, setSelectedGeometricPattern] = useState<PatternType>('dots');
  const [geometricScale, setGeometricScale] = useState<number>(40);
  const [geometricOpacity, setGeometricOpacity] = useState<number>(0.75);
  const [geometricFgRole, setGeometricFgRole] = useState<'primary' | 'secondary' | 'accent' | 'dark' | 'light'>('primary');
  const [geometricBgMode, setGeometricBgMode] = useState<'light' | 'dark' | 'brand'>('light');
  const [isCopiedGeometricSvg, setIsCopiedGeometricSvg] = useState<boolean>(false);
  const [isCopiedGeometricCss, setIsCopiedGeometricCss] = useState<boolean>(false);
  const [activePatternElementTab, setActivePatternElementTab] = useState<'business-card' | 'letterhead' | 'social-banner' | 'packaging' | 'full-canvas'>('business-card');
  const [patternCardSide, setPatternCardSide] = useState<'front' | 'back' | 'both'>('both');
  const [showTileGridLines, setShowTileGridLines] = useState<boolean>(false);

  const handleCopyPatternSvg = () => {
    const brandColors = extractBrandColors(bible.colorPalette);
    let fgColor = brandColors.primary;
    if (geometricFgRole === 'secondary') fgColor = brandColors.secondary;
    if (geometricFgRole === 'accent') fgColor = brandColors.accent;
    if (geometricFgRole === 'dark') fgColor = brandColors.darkNeutral;
    if (geometricFgRole === 'light') fgColor = '#ffffff';

    let bgColor = '#ffffff';
    if (geometricBgMode === 'dark') bgColor = '#0f172a';
    if (geometricBgMode === 'brand') bgColor = brandColors.primary;

    const svg = generatePatternSvg({
      type: selectedGeometricPattern,
      scale: geometricScale,
      bgColor,
      fgColor,
      secondaryColor: brandColors.secondary,
      accentColor: brandColors.accent,
      opacity: geometricOpacity
    });

    navigator.clipboard.writeText(svg);
    setIsCopiedGeometricSvg(true);
    setToast({
      message: 'Pattern SVG string copied to clipboard!',
      hex: fgColor
    });
    setTimeout(() => setIsCopiedGeometricSvg(false), 2500);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyPatternCss = () => {
    const brandColors = extractBrandColors(bible.colorPalette);
    let fgColor = brandColors.primary;
    if (geometricFgRole === 'secondary') fgColor = brandColors.secondary;
    if (geometricFgRole === 'accent') fgColor = brandColors.accent;
    if (geometricFgRole === 'dark') fgColor = brandColors.darkNeutral;
    if (geometricFgRole === 'light') fgColor = '#ffffff';

    let bgColor = '#ffffff';
    if (geometricBgMode === 'dark') bgColor = '#0f172a';
    if (geometricBgMode === 'brand') bgColor = brandColors.primary;

    const dataUrl = generatePatternDataUrl({
      type: selectedGeometricPattern,
      scale: geometricScale,
      bgColor,
      fgColor,
      secondaryColor: brandColors.secondary,
      accentColor: brandColors.accent,
      opacity: geometricOpacity
    });

    const cssSnippet = `/* ${bible.companyName} Brand Geometric Pattern - ${selectedGeometricPattern} */\nbackground-image: url("${dataUrl}");\nbackground-repeat: repeat;\nbackground-size: ${geometricScale}px;`;

    navigator.clipboard.writeText(cssSnippet);
    setIsCopiedGeometricCss(true);
    setToast({
      message: 'Pattern CSS background-image snippet copied!',
      hex: fgColor
    });
    setTimeout(() => setIsCopiedGeometricCss(false), 2500);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownloadPatternSvg = () => {
    const brandColors = extractBrandColors(bible.colorPalette);
    let fgColor = brandColors.primary;
    if (geometricFgRole === 'secondary') fgColor = brandColors.secondary;
    if (geometricFgRole === 'accent') fgColor = brandColors.accent;
    if (geometricFgRole === 'dark') fgColor = brandColors.darkNeutral;
    if (geometricFgRole === 'light') fgColor = '#ffffff';

    let bgColor = '#ffffff';
    if (geometricBgMode === 'dark') bgColor = '#0f172a';
    if (geometricBgMode === 'brand') bgColor = brandColors.primary;

    const svg = generatePatternSvg({
      type: selectedGeometricPattern,
      scale: geometricScale,
      bgColor,
      fgColor,
      secondaryColor: brandColors.secondary,
      accentColor: brandColors.accent,
      opacity: geometricOpacity
    });

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bible.companyName.toLowerCase().replace(/\s+/g, '-')}-pattern-${selectedGeometricPattern}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message: `Downloaded ${selectedGeometricPattern} pattern SVG!`,
      hex: fgColor
    });
    setTimeout(() => setToast(null), 3000);
  };

  // Mission-Driven Pattern Visualizer States
  const [missionPatternMotif, setMissionPatternMotif] = useState<'mission-grid' | 'diamond-emblem' | 'radiant-rings' | 'organic-waves' | 'typography-geometry'>('mission-grid');
  const [missionPatternTileSize, setMissionPatternTileSize] = useState<number>(64);
  const [missionPatternOpacity, setMissionPatternOpacity] = useState<number>(0.65);
  const [missionPatternBgMode, setMissionPatternBgMode] = useState<'light' | 'dark' | 'brand'>('light');
  const [isCopiedMissionPatternSvg, setIsCopiedMissionPatternSvg] = useState<boolean>(false);

  // AI Marketing Content Prompt Templates States
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<'about' | 'product' | 'social' | 'email' | 'tagline' | 'ad'>('about');
  const [promptCustomFeature, setPromptCustomFeature] = useState<string>('');
  const [promptCustomAudience, setPromptCustomAudience] = useState<string>('');
  const [promptViewMode, setPromptViewMode] = useState<'prompt' | 'sample'>('prompt');
  const [isCopiedPromptText, setIsCopiedPromptText] = useState<boolean>(false);
  const [isCopiedSampleText, setIsCopiedSampleText] = useState<boolean>(false);

  // Brand Voice Preview Feature States
  const [previewAngle, setPreviewAngle] = useState<'value_prop' | 'brand_story' | 'campaign_pitch' | 'social_hook' | 'cx_promise'>('value_prop');
  const [isGeneratingVoicePreview, setIsGeneratingVoicePreview] = useState<boolean>(false);
  const [previewCopy, setPreviewCopy] = useState<{ headline: string; paragraph: string; toneAlignmentNote: string } | null>(null);
  const [isCopiedPreviewText, setIsCopiedPreviewText] = useState<boolean>(false);
  const [previewCardBg, setPreviewCardBg] = useState<'light' | 'dark' | 'brand'>('light');

  // Copy Palette Code Modal / Dropdown States
  const [showPaletteCodeModal, setShowPaletteCodeModal] = useState<boolean>(false);
  const [selectedPaletteFormat, setSelectedPaletteFormat] = useState<'css' | 'tailwind' | 'json' | 'hex'>('css');
  const [isPaletteCodeCopied, setIsPaletteCodeCopied] = useState<boolean>(false);

  // Competitive Benchmarking States
  const [competitorInputUrls, setCompetitorInputUrls] = useState<string[]>(['stripe.com', 'linear.app']);
  const [newCompetitorUrl, setNewCompetitorUrl] = useState<string>('');
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [benchmarkData, setBenchmarkData] = useState<any | null>(null);

  const handleRunCompetitiveBenchmark = async () => {
    if (competitorInputUrls.length === 0) {
      setToast({
        message: 'Please add at least 1 competitor URL or brand domain!',
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsBenchmarking(true);
    try {
      const data = await safeFetchJson('/api/brand/competitive-benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitorUrls: competitorInputUrls,
          userBrand: bible
        })
      });

      if (data && data.competitors) {
        setBenchmarkData(data);
        setToast({
          message: `Search Grounding complete! Benchmarked ${data.competitors.length} competitors.`,
          hex: bible.colorPalette[0]?.hex || '#6366f1'
        });
        setTimeout(() => setToast(null), 3500);
      }
    } catch (err: any) {
      console.error('Competitive benchmarking error:', err);
      setToast({
        message: `Benchmarking error: ${err.message || 'Failed to fetch competitor data'}`,
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleAddCompetitorUrl = () => {
    const trimmed = newCompetitorUrl.trim();
    if (!trimmed) return;
    if (competitorInputUrls.length >= 3) {
      setToast({
        message: 'Maximum 3 competitors allowed for focused analysis.',
        hex: '#f59e0b'
      });
      setTimeout(() => setToast(null), 2500);
      return;
    }
    if (!competitorInputUrls.includes(trimmed)) {
      setCompetitorInputUrls([...competitorInputUrls, trimmed]);
      setNewCompetitorUrl('');
    }
  };

  const handleRemoveCompetitorUrl = (index: number) => {
    setCompetitorInputUrls(competitorInputUrls.filter((_, i) => i !== index));
  };

  // Load Google Fonts dynamically for active brand typography
  useEffect(() => {
    if (bible.typography) {
      const fonts = [bible.typography.headerFont, bible.typography.bodyFont].filter(Boolean);
      fonts.forEach(font => {
        if (font && !['System Sans', 'System Serif', 'Monospace', 'sans-serif', 'serif'].includes(font)) {
          const fontSlug = font.replace(/\s+/g, '+');
          const linkId = `google-font-${font.toLowerCase().replace(/\s+/g, '-')}`;
          if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${fontSlug}:ital,wght@0,300..800;1,300..800&display=swap`;
            document.head.appendChild(link);
          }
        }
      });
    }
  }, [bible.typography?.headerFont, bible.typography?.bodyFont]);

  const getInitialVoicePreview = (angle: string) => {
    const comp = bible.companyName || 'Our Brand';
    const ind = bible.industry || 'Technology';
    const aud = bible.targetAudience || 'Modern Professionals';
    const mission = bible.mission || 'Empowering people through purpose-driven, innovative solutions.';
    const voiceObj = typeof bible.brandVoice === 'object' ? bible.brandVoice : null;
    const tone = voiceObj?.tone || (typeof bible.brandVoice === 'string' ? bible.brandVoice : 'Professional, clear, and empathetic');

    if (angle === 'brand_story') {
      return {
        headline: `The Story Behind ${comp}: Rethinking ${ind} with Intent`,
        paragraph: `Founded on the belief that ${ind} should serve human potential, ${comp} was built to dismantle friction and restore momentum. Every decision we make stems from our core mission‚Äî"${mission}"‚Äîcombining uncompromising craftsmanship with intuitive simplicity for ${aud}.`,
        toneAlignmentNote: `Reflects a ${tone} tone with high narrative warmth and purpose-driven authority.`
      };
    } else if (angle === 'campaign_pitch') {
      return {
        headline: `Bold Execution for ${aud} Who Demand Excellence`,
        paragraph: `Stop settling for incremental tools that slow down your vision. ${comp} delivers a high-momentum ecosystem designed to transform how ${aud} operate in ${ind}. Powered by precision engineering and human-centered design, we turn complex challenges into effortless results.`,
        toneAlignmentNote: `High-energy, bold campaign pitch engineered for fast resonance.`
      };
    } else if (angle === 'social_hook') {
      return {
        headline: `A New Chapter in ${ind} Begins Now with ${comp}`,
        paragraph: `Great brands don't just follow industry standards‚Äîthey elevate them. ${comp} is proud to announce our latest milestone in ${ind}, engineered exclusively for ${aud}. Join us as we build the future of workflow efficiency together.`,
        toneAlignmentNote: `Punchy, social-first tone optimized for engagement and clarity.`
      };
    } else if (angle === 'cx_promise') {
      return {
        headline: `Our Uncompromising Promise to Every ${comp} Partner`,
        paragraph: `At ${comp}, your success is our absolute priority. We combine transparent communication, dedicated support, and relentless execution so you can focus on what truly matters. Experience a partnership built on trust, integrity, and measurable impact.`,
        toneAlignmentNote: `Empathetic, trust-first customer experience narrative.`
      };
    } else {
      return {
        headline: `Redefining ${ind} for ${aud}`,
        paragraph: `${comp} bridges the gap between vision and execution. By anchoring our platform in our core mission‚Äî"${mission}"‚Äîwe empower ${aud} to achieve clarity, speed, and elevated outcomes without compromising on design integrity.`,
        toneAlignmentNote: `Balanced value proposition aligning directly with your active brand persona.`
      };
    }
  };

  const handleGenerateVoicePreview = async (overrideAngle?: string) => {
    setIsGeneratingVoicePreview(true);
    const targetAngle = overrideAngle || previewAngle;
    try {
      const data = await safeFetchJson('/api/brand/generate-voice-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandBible: bible,
          angle: targetAngle,
          voiceMetrics
        })
      });

      if (data && data.headline && data.paragraph) {
        setPreviewCopy(data);
        setToast({
          message: "Generated Brand Voice Preview with AI!",
          hex: bible.colorPalette[0]?.hex || '#6366f1'
        });
        setTimeout(() => setToast(null), 2500);
      } else {
        setPreviewCopy(getInitialVoicePreview(targetAngle));
      }
    } catch (err: any) {
      console.warn("Voice preview API failed, using fallback generator:", err);
      setPreviewCopy(getInitialVoicePreview(targetAngle));
      setToast({
        message: "Generated Brand Voice Preview copy!",
        hex: bible.colorPalette[0]?.hex || '#6366f1'
      });
      setTimeout(() => setToast(null), 2500);
    } finally {
      setIsGeneratingVoicePreview(false);
    }
  };

  const handleCopyVoicePreview = () => {
    const currentData = previewCopy || getInitialVoicePreview(previewAngle);
    const textToCopy = `${currentData.headline}\n\n${currentData.paragraph}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopiedPreviewText(true);
    setToast({
      message: "Copied Brand Voice Preview copy to clipboard!",
      hex: bible.colorPalette[0]?.hex || '#6366f1'
    });
    setTimeout(() => setIsCopiedPreviewText(false), 2000);
    setTimeout(() => setToast(null), 2500);
  };

  const getTailoredMarketingPrompt = (category: 'about' | 'product' | 'social' | 'email' | 'tagline' | 'ad') => {
    const comp = bible.companyName || 'Our Brand';
    const ind = bible.industry || 'Technology';
    const aud = promptCustomAudience.trim() || bible.targetAudience || 'Modern professionals & decision makers';
    const feat = promptCustomFeature.trim() || `${comp} Flagship Solution`;
    const mission = bible.mission || 'To empower people through purpose-driven, innovative design.';

    const voiceObj = typeof bible.brandVoice === 'object' ? bible.brandVoice : null;
    const toneText = voiceObj?.tone || (typeof bible.brandVoice === 'string' ? bible.brandVoice : 'Professional, authentic, and forward-looking');
    const keywords = (voiceObj?.personalityKeywords || bible.brandKeywords || []).join(', ') || 'innovative, reliable, visionary';

    const metricsSummary = voiceMetrics.map(m => `‚Ä¢ ${m.attribute}: ${m.value}/100 (${m.description || ''})`).join('\n');
    const getMetricVal = (attr: string) => voiceMetrics.find(m => m.attribute === attr)?.value || 70;

    let promptText = '';
    let sampleDraft = '';

    if (category === 'about') {
      promptText = `Act as an expert brand strategist and copywriter for ${comp}, operating in the ${ind} industry.
Write a compelling, high-converting 'About Us' page copy tailored for our target audience: "${aud}".

# BRAND IDENTITY CONSTRAINTS:
- Company Name: ${comp}
- Industry / Niche: ${ind}
- Mission Statement: "${mission}"
- Core Tone of Voice: ${toneText}
- Personality Keywords: ${keywords}

# BRAND VOICE MATRIX SCORES (Adhere strictly to these balance levels):
${metricsSummary}

# COPY STRUCTURE REQUIRED:
1. High-Impact Headline & Subtitle reflecting Formality (${getMetricVal('Formality')}/100) and Warmth (${getMetricVal('Warmth')}/100).
2. The Origin Story & Vision (2 short, punchy paragraphs).
3. Core Values Bullet Points (3 points with bold title lead-ins).
4. Closing Call-to-Action matching our Boldness level (${getMetricVal('Boldness')}/100).`;

      sampleDraft = `ABOUT US: ${comp.toUpperCase()}

[HERO HEADLINE]
"Redefining the Future of ${ind} for ${aud}."

[OUR STORY]
At ${comp}, we believe true leadership in ${ind} requires both uncompromising clarity and relentless purpose. Founded to bridge critical industry gaps, our mission is simple: ${mission}.

We bring together ${keywords} to build solutions that remove friction and empower teams to reach their highest potential.

[OUR CORE VALUES]
‚Ä¢ Precision & Clarity (${getMetricVal('Clarity')}/100): We eliminate unnecessary complexity to focus strictly on high-value outcomes.
‚Ä¢ Empathetic Vision (${getMetricVal('Warmth')}/100): Every workflow we design starts with deep respect for user experience and trust.
‚Ä¢ Bold Innovation (${getMetricVal('Boldness')}/100): We don't settle for incremental gains‚Äîwe establish new benchmarks in ${ind}.

[CALL TO ACTION]
Ready to experience the next evolution in ${ind}? Join ${comp} and transform your workflow today.`;
    } else if (category === 'product') {
      promptText = `Write a high-converting product description for "${feat}" by ${comp}.

# PRODUCT & AUDIENCE CONTEXT:
- Feature / Offering: ${feat}
- Target Audience: ${aud}
- Industry: ${ind}

# BRAND VOICE MATRIX ALIGNMENT:
- Core Tone: ${toneText}
- Authority Level: ${getMetricVal('Authority')}/100
- Energy Rating: ${getMetricVal('Energy')}/100
- Clarity Score: ${getMetricVal('Clarity')}/100
- Keywords: ${keywords}

# OUTPUT REQUIREMENTS:
1. Attention-Grabbing Hook (1 sentence).
2. 3 Benefit-Driven Bullet Points (Focusing on ROI & value over technical features).
3. Ideal Use Case Scenario for ${aud}.
4. Direct Call-to-Action with a recommended button label.`;

      sampleDraft = `PRODUCT FEATURE: ${feat}

[THE HOOK]
"Unlock effortless performance with ${feat}‚Äîengineered by ${comp} specifically for ${aud}."

[KEY BENEFITS]
‚Ä¢ Intelligent Efficiency: Streamline your core operations with automated precision that saves hours every week.
‚Ä¢ Authority & Reliability (${getMetricVal('Authority')}/100): Backed by ${comp}'s proven track record and industry expertise in ${ind}.
‚Ä¢ Purpose-Built for ${aud}: Tailored to address the exact daily demands and pain points of your workflow.

[IDEAL USE CASE]
Perfect for ${aud} looking for a seamless, high-performance solution without steep learning curves.

[CALL TO ACTION]
Discover ${feat} Today ‚Üí`;
    } else if (category === 'social') {
      promptText = `Draft 3 engaging social media launch posts for ${comp} introducing "${feat}".

# PLATFORM VARIATIONS REQUIRED:
1. LinkedIn (Professional, authoritative tone - Formality ${getMetricVal('Formality')}/100)
2. Twitter / X (Short, punchy & high energy - Energy ${getMetricVal('Energy')}/100)
3. Instagram / Community (Warm, visual & conversational - Playfulness ${getMetricVal('Playfulness')}/100)

# BRAND VOICE PARAMETERS:
- Tone of Voice: ${toneText}
- Target Audience: ${aud}
- Personality Keywords: ${keywords}

Include relevant hashtags, strong opening hooks, and engaging call-to-action questions to drive community replies.`;

      sampleDraft = `SOCIAL MEDIA ANNOUNCEMENTS FOR ${comp.toUpperCase()}

[LINKEDIN POST]
We are thrilled to officially launch ${feat}! üöÄ

In today's fast-moving ${ind} landscape, ${aud} need tools that deliver both speed and reliability. That's why we built ${feat}‚Äîto help you ${mission.toLowerCase()}.

Key Highlights:
‚úì Engineered for speed, stability & precision
‚úì Tailored specifically for ${aud}
‚úì Powered by ${comp}'s commitment to quality

How is your team tackling this challenge today? Drop a line in the comments! üëá
#${comp.replace(/\s+/g, '')} #${ind.replace(/\s+/g, '')} #Innovation

---

[TWITTER / X POST]
Big news! ${feat} by ${comp} is officially live. ‚ö°

Built for ${aud} who demand clarity, speed, and real performance in ${ind}.

Try it today: [Link]
#${ind.replace(/\s+/g, '')} #${comp.replace(/\s+/g, '')}

---

[INSTAGRAM / COMMUNITY POST]
Say hello to ${feat} üëã‚ú®

We built this with one clear mission: ${mission}. Whether you're upgrading your current stack or starting fresh, ${comp} has you covered.

Drop a üî• in the comments if you're ready to level up!
#BrandLaunch #${comp.replace(/\s+/g, '')}`;
    } else if (category === 'email') {
      promptText = `Compose a customer outreach launch email for ${comp}.

# CAMPAIGN CONTEXT:
- Email Topic: Introducing ${feat}
- Target Audience: ${aud}
- Brand Voice Tone: ${toneText}
- Warmth Score: ${getMetricVal('Warmth')}/100 | Authority Score: ${getMetricVal('Authority')}/100

# DELIVERABLES:
1. 3 Subject Line Options (1 curiosity hook, 1 value-driven, 1 warm & personal).
2. Preview Text / Preheader line.
3. Main Email Body Copy (Opening story -> Pain point -> Introducing ${feat} -> Value proof -> CTA Button).`;

      sampleDraft = `EMAIL NEWSLETTER CAMPAIGN: ${comp.toUpperCase()}

SUBJECT LINE OPTIONS:
1. [Curiosity] Something exciting just arrived at ${comp}...
2. [Value-Driven] Meet ${feat}: Designed for ${aud}
3. [Warm & Personal] A quick note on how we're upgrading ${ind}

PREHEADER TEXT:
Discover how ${feat} delivers next-level efficiency for ${aud}.

---

Hi [First Name],

At ${comp}, we are constantly looking for ways to support ${aud} in mastering ${ind}.

We know how frustrating it is when outdated tools slow down your progress. That's why we created ${feat}.

Here is what makes ${feat} a game-changer:
‚Ä¢ Designed for seamless integration into your daily routine.
‚Ä¢ Anchored in our core mission: ${mission}.
‚Ä¢ Built with the clarity and precision you expect from ${comp}.

We'd love for you to be among the first to experience it in action.

[ BUTTON: Explore ${feat} Now ]

Warm regards,
The ${comp} Team`;
    } else if (category === 'tagline') {
      promptText = `Generate 10 distinct, memorable brand taglines and slogan options for ${comp} in the ${ind} space.

# BRAND MATRIX ATTRIBUTES:
- Primary Tone: ${toneText}
- Authority: ${getMetricVal('Authority')}/100 | Boldness: ${getMetricVal('Boldness')}/100 | Clarity: ${getMetricVal('Clarity')}/100
- Mission Context: ${mission}

# FORMAT INTO 3 CATEGORY BUCKETS:
1. Modern Minimalist (Short, 2-4 words)
2. Mission & Value-Driven
3. Bold & Provocative`;

      sampleDraft = `BRAND TAGLINE & SLOGAN CONCEPTS FOR ${comp.toUpperCase()}

[CATEGORY 1: MODERN MINIMALIST]
1. "${comp}. Purpose Delivered."
2. "Clarity in ${ind}."
3. "Elevate the Standard."

[CATEGORY 2: MISSION & VALUE-DRIVEN]
4. "Empowering ${aud} with Purpose."
5. "Where Innovation Meets Precision."
6. "Built for What Matters Most."
7. "Driving the Future of ${ind}."

[CATEGORY 3: BOLD & PROVOCATIVE]
8. "Reinventing ${ind}, One Choice at a Time."
9. "Don't Just Follow Trends. Set Them with ${comp}."
10. "The Standard Has Shifted."`;
    } else {
      promptText = `Create high-ROI ad copywriting variations for ${comp} running paid campaigns targeting ${aud}.

# AD CAMPAIGN PARAMETERS:
- Featured Offering: ${feat}
- Target Audience: ${aud}
- Primary Tone: ${toneText}
- Energy Level: ${getMetricVal('Energy')}/100 | Boldness Rating: ${getMetricVal('Boldness')}/100

# DELIVERABLES REQUIRED:
- 3 Search / Display Headlines (under 30 characters each).
- 3 Primary Text variations (Short & Punchy, Benefit-First, Social Proof / Authority).
- Recommended Call-to-Action button labels.`;

      sampleDraft = `AD CAMPAIGN COPY: ${comp.toUpperCase()}

[HEADLINES (Max 30 Chars)]
1. Upgrade Your ${ind}
2. Meet ${feat} Today
3. Built for ${aud}

[PRIMARY TEXT VARIATIONS]

‚Ä¢ Variation A (Short & Direct):
Ready for a smarter way to work? ${comp} introduces ${feat} engineered specifically for ${aud}. Try it today.

‚Ä¢ Variation B (Benefit-First):
Stop settling for friction in your workflow. ${comp} empowers ${aud} to ${mission.toLowerCase()}. See how ${feat} makes the difference.

‚Ä¢ Variation C (Authority & Trust):
Trusted leadership in ${ind}. ${comp} combines clarity and speed so you can achieve more. Get started with ${feat}.

[RECOMMENDED CALL-TO-ACTION BUTTONS]
‚Ä¢ "Get Started"
‚Ä¢ "Learn More"
‚Ä¢ "Claim Your Access"`;
    }

    return { promptText, sampleDraft };
  };

  const generateMissionPatternSvg = (
    primaryHex: string,
    secondaryHex: string,
    missionText: string,
    patternMotif: string,
    tileSize: number,
    opacity: number
  ) => {
    const primary = primaryHex || '#6366f1';
    const secondary = secondaryHex || '#a855f7';
    const mission = (missionText || 'To innovate and empower world-class experiences.').trim();

    // Deterministic seed derived from mission text length and character codes
    let hash = 0;
    for (let i = 0; i < mission.length; i++) {
      hash = (hash << 5) - hash + mission.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const strokeWidth = (absHash % 2) + 1.2;
    const rotation = (absHash % 30) + 15;
    const circleRadius = 6 + (absHash % 8);

    const viewDim = 60;

    if (patternMotif === 'mission-grid') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${viewDim} ${viewDim}">
  <rect width="${viewDim}" height="${viewDim}" fill="none"/>
  <path d="M0 30 H60 M30 0 V60" stroke="${primary}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" />
  <circle cx="30" cy="30" r="${circleRadius}" stroke="${primary}" stroke-width="${strokeWidth}" fill="${secondary}" fill-opacity="${opacity * 0.35}" stroke-opacity="${opacity}"/>
  <circle cx="0" cy="0" r="3.5" fill="${primary}" fill-opacity="${opacity}"/>
  <circle cx="60" cy="0" r="3.5" fill="${primary}" fill-opacity="${opacity}"/>
  <circle cx="0" cy="60" r="3.5" fill="${primary}" fill-opacity="${opacity}"/>
  <circle cx="60" cy="60" r="3.5" fill="${primary}" fill-opacity="${opacity}"/>
</svg>`;
    } else if (patternMotif === 'diamond-emblem') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${viewDim} ${viewDim}">
  <rect width="${viewDim}" height="${viewDim}" fill="none"/>
  <polygon points="30,4 56,30 30,56 4,30" fill="none" stroke="${primary}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}"/>
  <polygon points="30,16 44,30 30,44 16,30" fill="${secondary}" fill-opacity="${opacity * 0.25}" stroke="${primary}" stroke-width="1" stroke-opacity="${opacity}"/>
  <circle cx="30" cy="30" r="3" fill="${primary}" fill-opacity="${opacity}"/>
  <path d="M0 0 L10 10 M60 0 L50 10 M0 60 L10 50 M60 60 L50 50" stroke="${primary}" stroke-width="1" stroke-opacity="${opacity * 0.5}"/>
</svg>`;
    } else if (patternMotif === 'radiant-rings') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${viewDim} ${viewDim}">
  <rect width="${viewDim}" height="${viewDim}" fill="none"/>
  <circle cx="30" cy="30" r="26" fill="none" stroke="${primary}" stroke-width="${strokeWidth}" stroke-opacity="${opacity * 0.4}" stroke-dasharray="4 3"/>
  <circle cx="30" cy="30" r="18" fill="none" stroke="${secondary}" stroke-width="${strokeWidth}" stroke-opacity="${opacity * 0.7}"/>
  <circle cx="30" cy="30" r="9" fill="${primary}" fill-opacity="${opacity * 0.25}" stroke="${primary}" stroke-width="1.5" stroke-opacity="${opacity}"/>
  <path d="M15 30 H45 M30 15 V45" stroke="${primary}" stroke-width="1" stroke-opacity="${opacity * 0.5}"/>
</svg>`;
    } else if (patternMotif === 'organic-waves') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${viewDim} ${viewDim}">
  <rect width="${viewDim}" height="${viewDim}" fill="none"/>
  <path d="M 0,18 Q 15,4 30,18 T 60,18" fill="none" stroke="${primary}" stroke-width="${strokeWidth + 0.5}" stroke-opacity="${opacity}"/>
  <path d="M 0,38 Q 15,24 30,38 T 60,38" fill="none" stroke="${secondary}" stroke-width="${strokeWidth}" stroke-opacity="${opacity * 0.75}"/>
  <path d="M 0,58 Q 15,44 30,58 T 60,58" fill="none" stroke="${primary}" stroke-width="1" stroke-opacity="${opacity * 0.4}"/>
</svg>`;
    } else {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${viewDim} ${viewDim}">
  <rect width="${viewDim}" height="${viewDim}" fill="none"/>
  <g transform="rotate(${rotation} 30 30)">
    <rect x="14" y="14" width="32" height="32" rx="6" fill="${primary}" fill-opacity="${opacity * 0.18}" stroke="${primary}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}"/>
    <circle cx="30" cy="30" r="7" fill="${secondary}" fill-opacity="${opacity * 0.6}"/>
  </g>
  <path d="M0 0 L60 60 M60 0 L0 60" stroke="${primary}" stroke-width="0.75" stroke-opacity="${opacity * 0.3}" stroke-dasharray="3 3"/>
</svg>`;
    }
  };

  const getMissionSvgString = () => {
    const primaryHex = bible.colorPalette[0]?.hex || '#6366f1';
    const secondaryHex = bible.colorPalette[1]?.hex || '#a855f7';
    const missionText = bible.mission || 'To innovate and empower world-class experiences.';

    return generateMissionPatternSvg(
      primaryHex,
      secondaryHex,
      missionText,
      missionPatternMotif,
      missionPatternTileSize,
      missionPatternOpacity
    );
  };

  const getMissionPatternStyle = () => {
    const svgMarkup = getMissionSvgString();
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;
    return {
      backgroundImage: `url("${svgDataUrl}")`,
      backgroundRepeat: 'repeat'
    };
  };

  const handleCopyMissionPatternSvg = () => {
    const svgStr = getMissionSvgString();
    navigator.clipboard.writeText(svgStr);
    setIsCopiedMissionPatternSvg(true);
    setToast({
      message: "Copied Mission Pattern SVG source!",
      hex: bible.colorPalette[0]?.hex || '#6366f1'
    });
    setTimeout(() => setIsCopiedMissionPatternSvg(false), 2000);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopyMissionPatternCss = () => {
    const svgStr = getMissionSvgString();
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;
    const css = `background-image: url("${svgDataUrl}");\nbackground-repeat: repeat;`;
    navigator.clipboard.writeText(css);
    setToast({
      message: "Copied CSS background-image rule!",
      hex: bible.colorPalette[0]?.hex || '#6366f1'
    });
    setTimeout(() => setToast(null), 2500);
  };

  const handleDownloadMissionPatternSvg = () => {
    const svgStr = getMissionSvgString();
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bible.companyName.toLowerCase().replace(/\s+/g, '-')}-mission-pattern.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({
      message: "Downloaded Mission Pattern SVG file!",
      hex: bible.colorPalette[0]?.hex || '#6366f1'
    });
    setTimeout(() => setToast(null), 2500);
  };

  const handleGeneratePattern = async (styleOverride?: string) => {
    setIsGeneratingPattern(true);
    const styleToUse = styleOverride || selectedPatternStyle;
    try {
      const data = await safeFetchJson('/api/brand/generate-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: bible.companyName,
          mission: bible.mission,
          industry: bible.industry,
          targetAudience: bible.targetAudience,
          colorPalette: bible.colorPalette,
          brandPersonality: bible.brandPersonality ?? 50,
          stylePreference: styleToUse
        })
      });

      if (data && data.svgMarkup) {
        onUpdatePattern(data);
        setToast({
          message: `Pattern Generated: ${data.patternName}!`,
          hex: bible.colorPalette[0]?.hex || '#6366f1'
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        message: `Pattern Generation failed: ${err.message}`,
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsGeneratingPattern(false);
    }
  };

  // Lightbox & Gallery & Carousel State
  const allLogos = bible.previousLogos || (bible.primaryLogo ? [bible.primaryLogo] : []);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Logo Carousel / Slider State
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  useEffect(() => {
    if (allLogos.length > 0) {
      const primaryIdx = allLogos.findIndex(url => url === bible.primaryLogo);
      if (primaryIdx !== -1) {
        setCarouselIndex(primaryIdx);
      } else if (carouselIndex >= allLogos.length) {
        setCarouselIndex(0);
      }
    }
  }, [bible.primaryLogo, bible.previousLogos?.length]);

  const handlePrevSlide = () => {
    if (allLogos.length === 0) return;
    setCarouselIndex(prev => (prev === 0 ? allLogos.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    if (allLogos.length === 0) return;
    setCarouselIndex(prev => (prev === allLogos.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handleZoomIn = () => {
    setLightboxZoom(prev => Math.min(4, prev + 0.25));
  };

  const handleZoomOut = () => {
    setLightboxZoom(prev => Math.max(0.5, prev - 0.25));
  };

  const handleResetZoom = () => {
    setLightboxZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePrevLogo = () => {
    if (lightboxIndex === null) return;
    const prevIndex = (lightboxIndex - 1 + allLogos.length) % allLogos.length;
    setLightboxIndex(prevIndex);
    setLightboxZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleNextLogo = () => {
    if (lightboxIndex === null) return;
    const nextIndex = (lightboxIndex + 1) % allLogos.length;
    setLightboxIndex(nextIndex);
    setLightboxZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = 0.1;
    const newZoom = e.deltaY < 0 ? lightboxZoom + zoomFactor : lightboxZoom - zoomFactor;
    setLightboxZoom(Math.max(0.5, Math.min(4, newZoom)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSetPrimaryFromLightbox = () => {
    if (lightboxIndex === null) return;
    const selectedLogoUrl = allLogos[lightboxIndex];
    onUpdateLogo(selectedLogoUrl);
    setToast({
      message: "This logo is now set as the primary brand mark!",
      hex: "#6366f1"
    });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleDownloadLogo = async (overrideUrl?: string, customFilename?: string) => {
    const targetUrl = overrideUrl || allLogos[carouselIndex] || bible.primaryLogo;
    if (!targetUrl) return;
    try {
      setDownloading(true);
      const filename = customFilename || `${bible.companyName.toLowerCase().replace(/\s+/g, '-')}-logo.png`;

      if (targetUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = targetUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        try {
          const res = await fetch(targetUrl, { mode: 'cors' });
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        } catch {
          const link = document.createElement('a');
          link.href = targetUrl;
          link.target = '_blank';
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }

      setToast({
        message: `Downloaded logo mark (${filename})!`,
        hex: bible.colorPalette[0]?.hex || '#6366f1'
      });
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      console.error("Failed to download logo:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadLogoFromLightbox = async () => {
    if (lightboxIndex === null) return;
    const logoUrl = allLogos[lightboxIndex];
    if (!logoUrl) return;
    const filename = `${bible.companyName.toLowerCase().replace(/\s+/g, '-')}-logo-v${lightboxIndex + 1}.png`;
    await handleDownloadLogo(logoUrl, filename);
  };

  const copyToClipboard = (hex: string, colorName: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setToast({ message: `Copied ${colorName} (${hex}) to clipboard!`, hex });
    setTimeout(() => setCopiedHex(null), 1500);
    setTimeout(() => {
      setToast(prev => prev?.hex === hex ? null : prev);
    }, 2500);
  };

  const handleCopyAllHexCodes = () => {
    const allHexes = bible.colorPalette.map(c => c.hex).join(', ');
    navigator.clipboard.writeText(allHexes);
    setToast({
      message: `Copied all ${bible.colorPalette.length} color HEX codes!`,
      hex: bible.colorPalette[0]?.hex || '#6366f1'
    });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopyCssVariables = () => {
    const cssVars = `:root {\n` + bible.colorPalette.map(c => {
      const varName = `--color-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      return `  ${varName}: ${c.hex};`;
    }).join('\n') + `\n}`;

    navigator.clipboard.writeText(cssVars);
    setToast({
      message: "Copied palette as CSS Variables!",
      hex: bible.colorPalette[0]?.hex || '#6366f1'
    });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopyTailwindConfig = () => {
    const twObj = `// tailwind.config.js\ncolors: {\n` + bible.colorPalette.map(c => {
      const key = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return `  '${key}': '${c.hex}',`;
    }).join('\n') + `\n}`;

    navigator.clipboard.writeText(twObj);
    setToast({
      message: "Copied palette as Tailwind color object!",
      hex: bible.colorPalette[0]?.hex || '#6366f1'
    });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopyJsonPalette = () => {
    const jsonObj: Record<string, { hex: string; role: string; name: string }> = {};
    bible.colorPalette.forEach((c) => {
      const key = (c.role || c.name).toLowerCase().replace(/[^a-z0-9]+/g, '_');
      jsonObj[key || 'color'] = { hex: c.hex, name: c.name, role: c.role };
    });

    const jsonString = JSON.stringify(jsonObj, null, 2);
    navigator.clipboard.writeText(jsonString);
    setToast({
      message: "Copied 5-color palette as JSON object!",
      hex: bible.colorPalette[0]?.hex || '#6366f1'
    });
    setTimeout(() => setToast(null), 2500);
  };

  const getFormattedPaletteCode = (format: 'css' | 'tailwind' | 'json' | 'hex') => {
    if (format === 'css') {
      return `:root {\n` + bible.colorPalette.map(c => {
        const varName = `--color-${(c.role || c.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        return `  ${varName}: ${c.hex}; /* ${c.name} (${c.role}) */`;
      }).join('\n') + `\n}`;
    } else if (format === 'tailwind') {
      return `// tailwind.config.js (theme.extend.colors)\ncolors: {\n` + bible.colorPalette.map(c => {
        const key = (c.role || c.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `  '${key}': '${c.hex}', // ${c.name}`;
      }).join('\n') + `\n}`;
    } else if (format === 'json') {
      const jsonObj: Record<string, { hex: string; name: string; role: string }> = {};
      bible.colorPalette.forEach((c) => {
        const key = (c.role || c.name).toLowerCase().replace(/[^a-z0-9]+/g, '_');
        jsonObj[key || 'color'] = { hex: c.hex, name: c.name, role: c.role };
      });
      return JSON.stringify(jsonObj, null, 2);
    } else {
      return JSON.stringify(bible.colorPalette.map(c => c.hex), null, 2);
    }
  };

  const handleCopyFormattedPaletteCode = (format: 'css' | 'tailwind' | 'json' | 'hex') => {
    const code = getFormattedPaletteCode(format);
    navigator.clipboard.writeText(code);
    setIsPaletteCodeCopied(true);
    const formatLabels: Record<string, string> = {
      css: 'CSS Variables',
      tailwind: 'Tailwind Config',
      json: 'JSON Object',
      hex: 'HEX Array'
    };
    setToast({
      message: `Copied palette code as ${formatLabels[format]}!`,
      hex: bible.colorPalette[0]?.hex || '#6366f1'
    });
    setTimeout(() => setIsPaletteCodeCopied(false), 2000);
    setTimeout(() => setToast(null), 2500);
  };

  const handleDownloadBrandJson = () => {
    try {
      const exportData = {
        companyName: bible.companyName,
        industry: bible.industry,
        targetAudience: bible.targetAudience,
        mission: bible.mission,
        primaryLogo: bible.primaryLogo,
        colorPalette: bible.colorPalette,
        typography: bible.typography,
        brandVoice: bible.brandVoice,
        brandKeywords: bible.brandKeywords,
        doGuidelines: bible.doGuidelines,
        dontGuidelines: bible.dontGuidelines,
        favicon: bible.favicon,
        archetype: bible.archetype,
        pattern: bible.pattern,
        generatedAt: new Date().toISOString()
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bible.companyName.toLowerCase().replace(/\s+/g, '-')}-brand-kit.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setToast({
        message: "Downloaded Brand Specification JSON!",
        hex: bible.colorPalette[0]?.hex || "#6366f1"
      });
      setTimeout(() => setToast(null), 2500);
    } catch (err: any) {
      console.error("Failed to export JSON:", err);
      setToast({
        message: `Failed to download JSON: ${err.message}`,
        hex: "#ef4444"
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Helper function to convert oklch(...) colors to standard rgb/rgba strings for html2canvas compatibility
  const replaceOklchInString = (str: string): string => {
    if (!str || !str.includes('oklch')) return str;
    let result = str.replace(/oklch\(\s*([0-9.%]+)\s+([0-9.%]+)\s+([0-9.deg]+)(?:\s*\/\s*([0-9.%]+))?\s*\)/gi, (match, p1, p2, p3, p4) => {
      try {
        let l = parseFloat(p1);
        if (p1.endsWith('%')) l = l / 100;

        let c = parseFloat(p2);
        if (p2.endsWith('%')) c = c / 100;

        let h = parseFloat(p3);

        let a = 1;
        if (p4) {
          a = parseFloat(p4);
          if (p4.endsWith('%')) a = a / 100;
        }

        const hRad = (h * Math.PI) / 180;
        const aLab = c * Math.cos(hRad);
        const bLab = c * Math.sin(hRad);

        const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
        const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
        const s_ = l - 0.0894841775 * aLab - 1.2914855480 * bLab;

        const l3 = l_ * l_ * l_;
        const m3 = m_ * m_ * m_;
        const s3 = s_ * s_ * s_;

        const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
        const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
        const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

        const toGamma = (val: number) =>
          val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(Math.max(0, val), 1 / 2.4) - 0.055;

        const r = Math.min(255, Math.max(0, Math.round(toGamma(rLin) * 255)));
        const g = Math.min(255, Math.max(0, Math.round(toGamma(gLin) * 255)));
        const b = Math.min(255, Math.max(0, Math.round(toGamma(bLin) * 255)));

        if (a < 1) {
          return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
      } catch {
        return 'rgba(99, 102, 241, 0.8)';
      }
    });

    if (result.includes('oklch(')) {
      result = result.replace(/oklch\([^)]*\)/gi, 'rgba(99, 102, 241, 0.8)');
    }
    return result;
  };

  const handleDownloadDashboardPng = async () => {
    try {
      setIsExportingPng(true);
      setShowExportMenu(false);

      const dashboardElement = document.getElementById('brand-bible-dashboard');
      if (!dashboardElement) {
        throw new Error('Dashboard container (#brand-bible-dashboard) not found.');
      }

      setToast({
        message: "Rendering high-quality PNG snapshot of Brand Bible dashboard...",
        hex: bible.colorPalette[0]?.hex || '#6366f1'
      });

      let pngDataUrl: string | null = null;

      // Primary attempt: Native SVG ForeignObject rendering via html-to-image (supports oklch natively)
      try {
        pngDataUrl = await htmlToImage.toPng(dashboardElement, {
          pixelRatio: 2,
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          cacheBust: true,
          filter: (node: HTMLElement) => node.id !== 'toast-notification-banner'
        });
      } catch (nativeErr) {
        console.warn("html-to-image capture fallback triggered:", nativeErr);
      }

      // Fallback attempt: html2canvas with complete oklch -> RGB sanitization
      if (!pngDataUrl) {
        const canvas = await html2canvas(dashboardElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          logging: false,
          onclone: (clonedDoc) => {
            const floatingToast = clonedDoc.getElementById('toast-notification-banner');
            if (floatingToast) {
              floatingToast.style.display = 'none';
            }

            // Sanitize all style elements
            clonedDoc.querySelectorAll('style').forEach((styleEl) => {
              if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
                styleEl.textContent = replaceOklchInString(styleEl.textContent);
              }
            });

            // Sanitize all inline styles
            clonedDoc.querySelectorAll('[style]').forEach((el) => {
              const styleAttr = el.getAttribute('style');
              if (styleAttr && styleAttr.includes('oklch')) {
                el.setAttribute('style', replaceOklchInString(styleAttr));
              }
            });
          }
        });
        pngDataUrl = canvas.toDataURL('image/png');
      }

      if (!pngDataUrl) {
        throw new Error('Failed to generate PNG data URL from dashboard.');
      }

      const safeName = (bible.companyName || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const link = document.createElement('a');
      link.href = pngDataUrl;
      link.download = `${safeName}-brand-dashboard.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast({
        message: "Downloaded High-Quality Dashboard PNG Snapshot!",
        hex: bible.colorPalette[0]?.hex || '#6366f1'
      });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to capture dashboard PNG snapshot:", err);
      setToast({
        message: `Failed to capture PNG snapshot: ${err.message || 'Error capturing dashboard'}`,
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadAssetSheetPdf = async () => {
    try {
      setIsExportingPdf(true);
      const fileName = await downloadBrandPdf(bible, {
        documentType: 'executive',
        auditReport: auditReport || undefined
      });
      setToast({
        message: `Exported executive asset sheet: ${fileName}`,
        hex: bible.colorPalette[0]?.hex || '#6366f1'
      });
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      console.error('Failed to create executive asset sheet PDF:', err);
      setToast({
        message: `Failed to create PDF: ${err.message}`,
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadBrandPdf = async (options?: Partial<PdfExportOptions>) => {
    try {
      setIsExportingPdf(true);
      const fileName = await downloadBrandPdf(bible, {
        documentType: 'comprehensive',
        auditReport: auditReport || undefined,
        includeAuditReport: Boolean(auditReport),
        ...options
      });
      setToast({
        message: `Exported brand guidelines: ${fileName}`,
        hex: bible.colorPalette[0]?.hex || '#6366f1'
      });
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setToast({
        message: `Failed to generate PDF: ${err.message}`,
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleRegenLogoClick = async () => {
    await onRegenerateLogo(customLogoPrompt);
    setShowPromptEditor(false);
  };

  const getCleanSvg = (svgMarkup: string) => {
    let cleanSvg = svgMarkup;
    if (cleanSvg.includes('```xml')) {
      cleanSvg = cleanSvg.split('```xml')[1].split('```')[0];
    } else if (cleanSvg.includes('```html')) {
      cleanSvg = cleanSvg.split('```html')[1].split('```')[0];
    } else if (cleanSvg.includes('```svg')) {
      cleanSvg = cleanSvg.split('```svg')[1].split('```')[0];
    } else if (cleanSvg.includes('```')) {
      cleanSvg = cleanSvg.split('```')[1].split('```')[0];
    }
    return cleanSvg.trim();
  };

  const hexToRgb = (hex: string) => {
    const cleanHex = hex.trim().replace(/^#/, '');
    if (cleanHex.length === 3) {
      const r = parseInt(cleanHex[0] + cleanHex[0], 16);
      const g = parseInt(cleanHex[1] + cleanHex[1], 16);
      const b = parseInt(cleanHex[2] + cleanHex[2], 16);
      return { r, g, b };
    }
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return { r, g, b };
    }
    return null;
  };

  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const a = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (hex1: string, hex2: string) => {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const getAccessibilityScore = (hex: string) => {
    const contrastWhite = getContrastRatio(hex, '#ffffff');
    const contrastDark = getContrastRatio(hex, '#0f172a');
    const bestRatio = Math.max(contrastWhite, contrastDark);
    let rating = 'FAIL';
    let badgeStyle = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (bestRatio >= 7.0) {
      rating = 'AAA';
      badgeStyle = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (bestRatio >= 4.5) {
      rating = 'AA';
      badgeStyle = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    } else if (bestRatio >= 3.0) {
      rating = 'AA Lg';
      badgeStyle = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    return { contrastWhite, contrastDark, bestRatio, rating, badgeStyle };
  };

  const getCompliantPairs = (minRatio: number, maxRatio: number = 999) => {
    const list: { bg: string; text: string; ratio: number }[] = [];
    const colors = [
      ...bible.colorPalette.map(c => c.hex),
      '#ffffff',
      '#0f172a'
    ];

    // Deduplicate and normalize to include '#'
    const uniqueColors = Array.from(new Set(colors.map(c => {
      let h = c.trim().toLowerCase();
      return h.startsWith('#') ? h : `#${h}`;
    })));

    for (let i = 0; i < uniqueColors.length; i++) {
      for (let j = 0; j < uniqueColors.length; j++) {
        if (i === j) continue;
        const bg = uniqueColors[i];
        const text = uniqueColors[j];
        const ratio = getContrastRatio(bg, text);
        if (ratio >= minRatio && ratio < maxRatio) {
          list.push({ bg, text, ratio });
        }
      }
    }

    // Sort by ratio descending
    return list.sort((a, b) => b.ratio - a.ratio);
  };

  // Calculate adjusted hex color that meets target WCAG ratio against bgHex
  const calculateAdjustedCompliantColor = (bgHex: string, fgHex: string, targetRatio: number = 4.5): string => {
    const bgRgb = hexToRgb(bgHex) || { r: 255, g: 255, b: 255 };
    const fgRgb = hexToRgb(fgHex) || { r: 99, g: 102, b: 241 };
    const bgLum = getLuminance(bgHex);
    const shouldDarken = bgLum > 0.4;

    let bestHex = fgHex;
    let bestRatio = getContrastRatio(bgHex, fgHex);

    for (let step = 1; step <= 100; step++) {
      const factor = step / 100;
      let r: number, g: number, b: number;
      if (shouldDarken) {
        r = Math.max(0, Math.floor(fgRgb.r * (1 - factor)));
        g = Math.max(0, Math.floor(fgRgb.g * (1 - factor)));
        b = Math.max(0, Math.floor(fgRgb.b * (1 - factor)));
      } else {
        r = Math.min(255, Math.floor(fgRgb.r + (255 - fgRgb.r) * factor));
        g = Math.min(255, Math.floor(fgRgb.g + (255 - fgRgb.g) * factor));
        b = Math.min(255, Math.floor(fgRgb.b + (255 - fgRgb.b) * factor));
      }
      const candidateHex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      const ratio = getContrastRatio(bgHex, candidateHex);
      if (ratio >= targetRatio) {
        return candidateHex;
      }
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestHex = candidateHex;
      }
    }
    return bestHex;
  };

  const handleApplyA11yFixToPalette = (oldHex: string, newHex: string, colorName: string) => {
    const updatedPalette = bible.colorPalette.map(c => {
      if (c.hex.toLowerCase() === oldHex.toLowerCase()) {
        return { ...c, hex: newHex };
      }
      return c;
    });
    onUpdatePalette(updatedPalette);
    setToast({
      message: `Updated ${colorName} to ${newHex.toUpperCase()} for WCAG AA compliance!`,
      hex: newHex
    });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyA11yReport = () => {
    const palette = bible.colorPalette || [];
    let reportText = `WCAG 2.1 Accessibility Audit Report for ${bible.companyName}\n`;
    reportText += `Generated: ${new Date().toLocaleDateString()}\n\n`;

    let failCount = 0;
    let passCount = 0;

    palette.forEach((textCol) => {
      palette.forEach((bgCol) => {
        if (textCol.hex !== bgCol.hex) {
          const ratio = getContrastRatio(bgCol.hex, textCol.hex);
          const status = ratio >= 7.0 ? 'AAA Compliant' : ratio >= 4.5 ? 'AA Compliant' : ratio >= 3.0 ? 'AA Large Only' : 'FAIL';
          if (ratio < 4.5) failCount++; else passCount++;
          reportText += `‚Ä¢ ${textCol.name} (${textCol.hex}) on ${bgCol.name} (${bgCol.hex}): ${ratio.toFixed(2)}:1 [${status}]\n`;
        }
      });
    });

    reportText += `\nSummary: ${passCount} Passing Combinations, ${failCount} Failing Combinations (<4.5:1).\n`;
    navigator.clipboard.writeText(reportText);
    setToast({
      message: "Copied Accessibility Audit Report to clipboard!",
      hex: bible.colorPalette[0]?.hex || '#6366f1'
    });
    setTimeout(() => setToast(null), 2500);
  };

  const getPatternStyle = () => {
    if (!bible.pattern?.svgMarkup) return {};
    try {
      const cleanSvg = getCleanSvg(bible.pattern.svgMarkup);
      const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
      return {
        backgroundImage: `url("${svgDataUrl}")`,
        backgroundRepeat: 'repeat'
      };
    } catch (e) {
      console.error("Failed to parse pattern SVG:", e);
      return {};
    }
  };

  const handleCopySvg = () => {
    if (!bible.pattern?.svgMarkup) return;
    const cleanSvg = getCleanSvg(bible.pattern.svgMarkup);
    navigator.clipboard.writeText(cleanSvg);
    setIsPatternCopied(true);
    setTimeout(() => setIsPatternCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!bible.pattern?.svgMarkup) return;
    const cleanSvg = getCleanSvg(bible.pattern.svgMarkup);
    const blob = new Blob([cleanSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bible.companyName.toLowerCase().replace(/\s+/g, '-')}-brand-pattern.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [selectedFaviconStyle, setSelectedFaviconStyle] = useState<string>("Minimalist Icon Glyph");
  const [isGeneratingFavicon, setIsGeneratingFavicon] = useState(false);
  const [isFaviconCopied, setIsFaviconCopied] = useState(false);

  const handleGenerateFavicon = async () => {
    setIsGeneratingFavicon(true);
    try {
      const data = await safeFetchJson('/api/brand/generate-favicon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: bible.companyName,
          mission: bible.mission,
          industry: bible.industry,
          targetAudience: bible.targetAudience,
          colorPalette: bible.colorPalette,
          primaryLogo: bible.primaryLogo,
          faviconStyle: selectedFaviconStyle
        })
      });

      if (data && data.svgMarkup) {
        onUpdateFavicon(data);
        setToast({
          message: `Favicon generated: ${data.faviconName}!`,
          hex: bible.colorPalette[0]?.hex || '#6366f1'
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        message: `Favicon generation failed: ${err.message}`,
        hex: '#ef4444'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsGeneratingFavicon(false);
    }
  };

  const handleCopyFaviconSvg = () => {
    if (!bible.favicon?.svgMarkup) return;
    const cleanSvg = getCleanSvg(bible.favicon.svgMarkup);
    navigator.clipboard.writeText(cleanSvg);
    setIsFaviconCopied(true);
    setTimeout(() => setIsFaviconCopied(false), 2000);
  };

  const handleDownloadFaviconSvg = () => {
    if (!bible.favicon?.svgMarkup) return;
    const cleanSvg = getCleanSvg(bible.favicon.svgMarkup);
    const blob = new Blob([cleanSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `favicon-${bible.companyName.toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="brand-bible-dashboard" className="space-y-8">
      {/* Overview Block */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden font-sans border border-slate-800">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600 rounded-full filter blur-3xl opacity-20 -mr-16 -mt-16" />
        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-bold border border-indigo-500/30">
                01 / Specifications Summary
              </span>
              <h1 className="text-3xl font-black tracking-tight mt-3">
                {bible.companyName}
              </h1>
              <p className="text-xs text-slate-300 font-sans max-w-xl mt-1.5 leading-relaxed">
                {bible.mission}
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                id="dashboard-automated-style-audit-btn"
                onClick={handleRunStyleAudit}
                disabled={isAuditing}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white px-4 py-2.5 text-xs font-bold rounded-full flex items-center gap-2 shadow-md border border-emerald-500/50 transition cursor-pointer"
                title="Trigger AI analysis of color contrast, font legibility, and archetype consistency"
              >
                {isAuditing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-200" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                )}
                <span>{isAuditing ? "Auditing Brand Specs..." : "Automated Style Audit"}</span>
              </button>

              <button
                id="shareable-link-btn"
                data-testid="shareable-link-btn"
                onClick={() => handleCopyShareableLink(false)}
                className="bg-slate-800/90 hover:bg-slate-700 active:scale-98 text-white px-4 py-2.5 text-xs font-bold rounded-full flex items-center gap-2 shadow-md border border-slate-700/80 transition cursor-pointer"
                title="Encode active brand bible into a base64 string and update URL hash to share with others"
              >
                {isLinkCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-indigo-300" />
                )}
                <span>{isLinkCopied ? "Link Copied!" : "Shareable Link"}</span>
              </button>

              <button
                id="dashboard-download-pdf-direct-btn"
                onClick={handleDownloadBrandPdf}
                disabled={isExportingPdf}
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white px-4 py-2.5 text-xs font-bold rounded-full flex items-center gap-2 shadow-md border border-indigo-500/50 transition cursor-pointer disabled:opacity-50"
                title="Generate and download complete Brand Specification PDF document"
              >
                {isExportingPdf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-200" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-indigo-200" />
                )}
                <span>{isExportingPdf ? "Generating PDF..." : "Download PDF"}</span>
              </button>

              <button
                id="dashboard-download-png-direct-btn"
                onClick={handleDownloadDashboardPng}
                disabled={isExportingPng}
                className="bg-purple-600 hover:bg-purple-500 active:scale-98 text-white px-4 py-2.5 text-xs font-bold rounded-full flex items-center gap-2 shadow-md border border-purple-500/50 transition cursor-pointer disabled:opacity-50"
                title="Capture and download high-quality PNG image snapshot of the active dashboard using html2canvas"
              >
                {isExportingPng ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-200" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-purple-200" />
                )}
                <span>{isExportingPng ? "Capturing PNG..." : "Dashboard PNG"}</span>
              </button>

              <div className="relative">
                <button
                  id="dashboard-download-brand-assets-btn"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-bold rounded-full flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Brand Kit</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showExportMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 text-xs font-sans text-left"
                      >
                        <button
                          id="export-share-link-btn"
                          onClick={() => {
                            setShowExportMenu(false);
                            handleCopyShareableLink(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 transition flex items-start gap-3 cursor-pointer group border-b border-slate-800/80 mb-1 pb-2.5"
                        >
                          <Share2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0 group-hover:scale-110 transition" />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>Shareable Link</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">URL HASH</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                              Encode active brand bible into a base64 string and update URL hash.
                            </p>
                          </div>
                        </button>

                      <button
                        id="export-social-banners-btn"
                        onClick={() => {
                          setShowExportMenu(false);
                          const el = document.getElementById('social-banners-brand-section');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 transition flex items-start gap-3 cursor-pointer group"
                      >
                        <Share2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0 group-hover:scale-110 transition" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>Social Media Banners Studio</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                            Generate &amp; download X, LinkedIn, YouTube &amp; Instagram banners.
                          </p>
                        </div>
                      </button>

                      <button
                        id="export-dashboard-png-btn"
                        onClick={() => {
                          setShowExportMenu(false);
                          handleDownloadDashboardPng();
                        }}
                        disabled={isExportingPng}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 transition flex items-start gap-3 cursor-pointer group"
                      >
                        <Camera className="w-4 h-4 text-purple-400 mt-0.5 shrink-0 group-hover:scale-110 transition" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>Dashboard PNG Snapshot</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                            High-resolution 2x canvas snapshot of active dashboard.
                          </p>
                        </div>
                      </button>

                      <button
                        id="open-pdf-modal-btn"
                        onClick={() => {
                          setShowExportMenu(false);
                          setShowPdfExportModal(true);
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 transition flex items-start gap-3 cursor-pointer group"
                      >
                        <Sliders className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0 group-hover:scale-110 transition" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>Configure &amp; Export PDF...</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">MODAL</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                            Choose 1-sheet vs 3-page manual, dark/light theme, paper size &amp; preview.
                          </p>
                        </div>
                      </button>
                      <button
                        id="export-pdf-btn"
                        onClick={() => {
                          setShowExportMenu(false);
                          handleDownloadBrandPdf();
                        }}
                        disabled={isExportingPdf}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 transition flex items-start gap-3 cursor-pointer group"
                      >
                        <FileText className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0 group-hover:scale-110 transition" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>Download PDF Specification</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                            Compiled brand guide with logo, palette swatches & typography.
                          </p>
                        </div>
                      </button>

                      <button
                        id="export-json-btn"
                        onClick={() => {
                          setShowExportMenu(false);
                          handleDownloadBrandJson();
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 transition flex items-start gap-3 cursor-pointer group"
                      >
                        <FileJson className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0 group-hover:scale-110 transition" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>Download JSON Specification</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                            Raw structured data including base64 logo & hex codes.
                          </p>
                        </div>
                      </button>

                      {bible.primaryLogo && (
                        <button
                          id="export-logo-png-btn"
                          onClick={() => {
                            setShowExportMenu(false);
                            handleDownloadLogo();
                          }}
                          disabled={downloading}
                          className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 transition flex items-start gap-3 cursor-pointer group border-t border-slate-800/80 mt-1 pt-2.5"
                        >
                          <FileImage className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 group-hover:scale-110 transition" />
                          <div>
                            <div className="font-bold text-white">Download Logo PNG</div>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                              High-resolution primary logo image file.
                            </p>
                          </div>
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-800 pt-5 text-xs font-sans">
            <div>
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Industry / Sector</span>
              <p className="text-white font-semibold mt-1">{bible.industry || 'General'}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Primary Target Audience</span>
              <p className="text-white font-semibold mt-1">{bible.targetAudience || 'Universal'}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Voice & Style Guidelines</span>
              <p className="text-white font-semibold mt-1 capitalize truncate max-w-[240px]">
                {typeof bible.brandVoice === 'object' ? bible.brandVoice.tone : (bible.brandVoice || 'Professional')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Primary Logo + Keywords/Voice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Logo Card */}
        <div
          id="logo-branding-card"
          className={`lg:col-span-7 border rounded-3xl p-8 shadow-sm flex flex-col justify-between transition-all duration-300 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-4 w-full">
            <div className={`flex justify-between items-start border-b pb-4 transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">02 / Primary Mark</span>
                <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <FileImage className="w-5 h-5 text-indigo-600" />
                  Primary Brand Mark
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                  High-fidelity graphical vector logo generated on grid space.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Aspect Ratio Switcher */}
                <div className={`flex items-center gap-1 p-1 rounded-full border transition-all ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    id="aspect-ratio-standard-btn"
                    onClick={() => setLogoAspectRatio('standard')}
                    className={`px-3 py-1 text-[10px] font-sans font-bold rounded-full transition-all cursor-pointer ${
                      logoAspectRatio === 'standard'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    id="aspect-ratio-square-btn"
                    onClick={() => setLogoAspectRatio('square')}
                    className={`px-3 py-1 text-[10px] font-sans font-bold rounded-full transition-all cursor-pointer ${
                      logoAspectRatio === 'square'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Square (1:1)
                  </button>
                </div>

                {allLogos.length > 0 && (
                  <button
                    id="header-compare-logos-btn"
                    onClick={() => {
                      setOverlayViewMode('grid');
                      setIsLogoHistoryOpen(true);
                    }}
                    className={`text-[10px] font-sans font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all duration-300 cursor-pointer shadow-sm ${
                      isDark
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600 hover:text-white'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white'
                    }`}
                    title="Open Fullscreen Logo Comparison & Selection Overlay"
                  >
                    <Columns className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Compare All ({allLogos.length})</span>
                  </button>
                )}

                {bible.primaryLogo && (
                  <button
                    id="header-download-logo-btn"
                    onClick={handleDownloadLogo}
                    disabled={downloading}
                    className={`text-[10px] font-sans font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-850 hover:text-white'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                    title="Download PNG to device"
                  >
                    <Download className="w-3 h-3 text-indigo-500" />
                    {downloading ? 'Saving...' : 'Download PNG'}
                  </button>
                )}
                <span className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-full border transition-all duration-300 ${
                  isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {logoSize} Quality
                </span>
              </div>
            </div>

            {/* Logo Viewer Stage with Carousel Slider */}
            <div className={`rounded-2xl border p-6 sm:p-8 flex flex-col items-center justify-between min-h-[280px] relative overflow-hidden group transition-all duration-300 ${
              isDark ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* Top Bar inside Stage: Version & Status Info */}
              {allLogos.length > 0 && !isLoadingLogo && (
                <div className="w-full flex justify-between items-center z-10 mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      Version {carouselIndex + 1} of {allLogos.length}
                    </span>
                    {allLogos[carouselIndex] === bible.primaryLogo ? (
                      <span className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active Primary Mark
                      </span>
                    ) : (
                      <button
                        id="carousel-set-primary-btn"
                        onClick={() => handleRestoreLogo(allLogos[carouselIndex])}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition transform hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer"
                        title="Set this logo as the active primary mark"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" /> Set as Primary
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id="stage-lightbox-btn"
                      onClick={() => openLightbox(carouselIndex)}
                      className={`text-[10px] font-bold p-1.5 rounded-lg border transition cursor-pointer ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Expand to Full Lightbox"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Main Image Stage Display */}
              {isLoadingLogo ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center font-sans">
                  <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <div>
                    <p className={`text-xs font-bold transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Synthesizing Creative Visual Mark...</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-relaxed">Drawing abstract elements with gemini-3-pro-image-preview</p>
                  </div>
                </div>
              ) : allLogos.length > 0 ? (
                <div className="relative w-full flex-1 flex items-center justify-center py-2 group/stage">
                  {/* Left Carousel Arrow */}
                  {allLogos.length > 1 && (
                    <button
                      id="carousel-prev-btn"
                      onClick={handlePrevSlide}
                      className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-indigo-600 text-white p-2.5 rounded-full backdrop-blur shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-20"
                      title="Previous Logo Variation"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  {/* Right Carousel Arrow */}
                  {allLogos.length > 1 && (
                    <button
                      id="carousel-next-btn"
                      onClick={handleNextSlide}
                      className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-indigo-600 text-white p-2.5 rounded-full backdrop-blur shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-20"
                      title="Next Logo Variation"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Active Logo Container with Motion Animation & Scale Effects */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={carouselIndex}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                      className="relative group/logo flex flex-col items-center my-auto cursor-pointer"
                    >
                      {logoAspectRatio === 'square' ? (
                        <div className={`w-48 h-48 sm:w-52 sm:h-52 aspect-square flex items-center justify-center p-4 rounded-2xl shadow-md transition-all duration-300 relative border group-hover/logo:shadow-2xl group-hover/logo:shadow-indigo-500/20 group-hover/logo:border-indigo-500/40 ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}>
                          <img
                            src={allLogos[carouselIndex]}
                            alt={`Brand Logo Variation ${carouselIndex + 1}`}
                            className="w-full h-full object-contain rounded-lg transition-transform duration-300 ease-out group-hover/logo:scale-108 cursor-pointer"
                            onClick={() => openLightbox(carouselIndex)}
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-2 right-2 text-[8px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-600/10 text-indigo-500 border border-indigo-500/20">
                            1 : 1
                          </span>
                        </div>
                      ) : (
                        <img
                          src={allLogos[carouselIndex]}
                          alt={`Brand Logo Variation ${carouselIndex + 1}`}
                          className={`max-h-48 max-w-full object-contain rounded-xl shadow-sm p-3 transition-all duration-300 ease-out group-hover/logo:scale-105 group-hover/logo:shadow-xl group-hover/logo:shadow-indigo-500/15 cursor-pointer ${
                            isDark ? 'bg-slate-900 border border-slate-800 group-hover/logo:border-indigo-500/40' : 'bg-white mix-blend-multiply'
                          }`}
                          onClick={() => openLightbox(carouselIndex)}
                          referrerPolicy="no-referrer"
                        />
                      )}

                      {/* Floating Download Button (Permanently visible) */}
                      <motion.button
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        id="floating-download-logo-btn"
                        onClick={() => handleDownloadLogo(allLogos[carouselIndex])}
                        disabled={downloading}
                        className="absolute -top-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition-all cursor-pointer z-10"
                        title="Download PNG to device"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </motion.button>

                      {/* Hover Actions Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition duration-300 rounded-xl flex items-center justify-center gap-2.5 pointer-events-auto backdrop-blur-[2px]">
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          id="stage-download-logo-btn"
                          onClick={() => handleDownloadLogo(allLogos[carouselIndex])}
                          className="bg-white hover:bg-slate-50 text-slate-800 p-2.5 rounded-full shadow-lg transition cursor-pointer"
                          title="Download PNG File"
                        >
                          <Download className="w-4 h-4 text-indigo-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          id="stage-view-lightbox-btn"
                          onClick={() => openLightbox(carouselIndex)}
                          className="bg-white hover:bg-slate-50 text-slate-800 p-2.5 rounded-full shadow-lg transition cursor-pointer"
                          title="Zoom & Inspect"
                        >
                          <Eye className="w-4 h-4 text-indigo-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15, rotate: 180 }}
                          whileTap={{ scale: 0.9 }}
                          id="stage-edit-prompt-btn"
                          onClick={() => setShowPromptEditor(!showPromptEditor)}
                          className="bg-white hover:bg-slate-50 text-slate-800 p-2.5 rounded-full shadow-lg transition cursor-pointer"
                          title="Refine Logo Style"
                        >
                          <RefreshCw className="w-4 h-4 text-indigo-600" />
                        </motion.button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center space-y-3 font-sans py-6">
                  <p className="text-xs text-slate-400">No logo asset synthesized yet.</p>
                  <button
                    id="dashboard-regen-logo-initial"
                    onClick={() => onRegenerateLogo()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-bold rounded-full shadow-sm transition cursor-pointer"
                  >
                    Synthesize Brand Logo
                  </button>
                </div>
              )}

              {/* Bottom Dot Indicators for Carousel */}
              {allLogos.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-2 z-10">
                  {allLogos.map((_, idx) => (
                    <button
                      key={idx}
                      id={`carousel-dot-${idx}`}
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === carouselIndex
                          ? 'w-6 bg-indigo-600 shadow-sm'
                          : isDark
                            ? 'w-2 bg-slate-700 hover:bg-slate-500'
                            : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      title={`Jump to Logo Version ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Logo Gallery Tray / Carousel Thumbnails */}
            {allLogos.length > 0 && (
              <div id="logo-gallery-tray" className="space-y-2 mt-4 font-sans">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Logo History ({allLogos.length} Variations)
                    </span>
                  </div>
                  <button
                    onClick={() => setIsLogoHistoryOpen(true)}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <History className="w-3 h-3" /> View All in Modal
                  </button>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent items-center">
                  {allLogos.map((logoUrl, index) => {
                    const isPrimary = logoUrl === bible.primaryLogo;
                    const isSelectedInCarousel = index === carouselIndex;
                    return (
                      <button
                        id={`gallery-thumb-${index}`}
                        key={index}
                        onClick={() => setCarouselIndex(index)}
                        className={`relative w-16 h-16 rounded-xl border p-1 shrink-0 cursor-pointer transition-all duration-200 group overflow-hidden ${
                          isSelectedInCarousel
                            ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/40 scale-105 shadow-sm'
                            : isDark
                              ? 'border-slate-800 bg-slate-950 hover:border-slate-700'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                        title={`Select Version ${index + 1}`}
                      >
                        <img
                          src={logoUrl}
                          alt={`Logo version ${index + 1}`}
                          className="w-full h-full object-contain rounded-lg"
                        />
                        {isPrimary && (
                          <span className="absolute top-1 right-1 bg-emerald-600 text-white p-0.5 rounded-full text-[8px] z-10 shadow-xs" title="Primary Logo">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                        <span className={`absolute bottom-1 left-1 px-1 py-0.5 rounded text-[8px] font-mono scale-90 origin-bottom-left ${
                          isSelectedInCarousel ? 'bg-indigo-600 text-white font-bold' : 'bg-black/60 text-white'
                        }`}>
                          v{index + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Prompt Editor */}
            {showPromptEditor ? (
              <div className={`space-y-3 p-5 border rounded-2xl font-sans mt-3 transition-colors duration-300 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <label htmlFor="logo-custom-prompt" className={`block text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Edit Illustration Concept Prompt
                </label>
                <textarea
                  id="logo-custom-prompt"
                  rows={3}
                  value={customLogoPrompt}
                  onChange={(e) => setCustomLogoPrompt(e.target.value)}
                  className={`w-full p-3 border rounded-xl text-xs transition-colors duration-300 focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    id="prompt-editor-cancel-btn"
                    onClick={() => setShowPromptEditor(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-500 rounded-full font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="prompt-editor-generate-btn"
                    onClick={handleRegenLogoClick}
                    disabled={isLoadingLogo}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                    Regenerate Logo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap justify-between items-center py-2 gap-2 font-sans">
                <button
                  id="dashboard-toggle-prompt-editor-btn"
                  onClick={() => setShowPromptEditor(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Customize Logo Graphic Prompt & Regenerate
                </button>
                <button
                  onClick={() => setIsLogoHistoryOpen(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102"
                >
                  <History className="w-3.5 h-3.5" /> Full Logo History Modal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Brand Core Card (Voice + Keywords) */}
        <div
          id="brand-core-guideline-card"
          className={`lg:col-span-5 border rounded-3xl p-8 shadow-sm flex flex-col justify-between transition-all duration-300 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-6 w-full font-sans">
            <div className={`border-b pb-4 transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">03 / Core Mission</span>
              <h2 className={`text-xl font-black flex items-center gap-2 tracking-tight transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <AlignLeft className="w-5 h-5 text-indigo-600" />
                Brand Persona
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Core keywords and tone specifications for standard brand copies.
              </p>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Semantic Keywords</span>
              <div className="flex flex-wrap gap-1.5">
                {bible.brandKeywords.map((word) => (
                  <span
                    id={`keyword-pill-${word.replace(/\s+/g, '-').toLowerCase()}`}
                    key={word}
                    className={`text-xs px-3 py-1.5 border rounded-full font-bold transition duration-200 cursor-default ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-indigo-950/60 hover:border-indigo-500/50 hover:text-indigo-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Brand Voice */}
            <div className="space-y-4 text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Verbal Tone & Brand Voice</span>
              {bible.brandVoice && typeof bible.brandVoice === 'object' ? (
                <div className="space-y-4">
                  {/* General Tone */}
                  <div className={`p-4 border rounded-2xl transition-all duration-300 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <p className={`text-xs leading-relaxed italic font-medium transition-colors duration-300 ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      "{bible.brandVoice.tone}"
                    </p>
                  </div>

                  {/* Sample 'About Us' Paragraph if present */}
                  {bible.brandVoice.aboutUsParagraph && (
                    <div className={`p-4 border rounded-2xl transition-all duration-300 ${
                      isDark ? 'bg-indigo-950/20 border-indigo-900/40 text-slate-200' : 'bg-indigo-50/40 border-indigo-100/80 text-slate-800'
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-sans">
                          <Sparkles className="w-3 h-3 text-amber-500" /> Sample 'About Us' Story
                        </span>
                        <button
                          onClick={handleCopyAboutUs}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer transition font-sans"
                          title="Copy About Us paragraph"
                        >
                          {isAboutUsCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {isAboutUsCopied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed font-sans font-medium">
                        "{bible.brandVoice.aboutUsParagraph}"
                      </p>
                    </div>
                  )}

                  {/* Personality Keywords */}
                  {bible.brandVoice.personalityKeywords && bible.brandVoice.personalityKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {bible.brandVoice.personalityKeywords.map((word) => (
                        <span
                          key={word}
                          className={`text-[9px] uppercase tracking-wider px-2.5 py-1 border rounded-lg font-extrabold transition duration-200 cursor-default ${
                            isDark
                              ? 'bg-slate-950/60 border-slate-800/80 text-indigo-400'
                              : 'bg-indigo-50/50 border-indigo-100/80 text-indigo-700'
                          }`}
                        >
                          üó£Ô∏è {word}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Voice Guidelines Do's & Don'ts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                    {/* Voice Do's */}
                    {bible.brandVoice.doVoiceRules && bible.brandVoice.doVoiceRules.length > 0 && (
                      <div className={`p-3.5 border rounded-2xl ${
                        isDark ? 'bg-slate-950/30 border-slate-850' : 'bg-slate-50/50 border-slate-200/50'
                      }`}>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-500 block mb-2 font-sans">Write with this</span>
                        <ul className="space-y-1.5 text-xs text-left">
                          {bible.brandVoice.doVoiceRules.map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className={`text-[11px] leading-tight font-medium ${isDark ? 'text-slate-350' : 'text-slate-600'}`}>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Voice Don'ts */}
                    {bible.brandVoice.dontVoiceRules && bible.brandVoice.dontVoiceRules.length > 0 && (
                      <div className={`p-3.5 border rounded-2xl ${
                        isDark ? 'bg-slate-950/30 border-slate-850' : 'bg-slate-50/50 border-slate-200/50'
                      }`}>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-500 block mb-2 font-sans">Avoid writing this</span>
                        <ul className="space-y-1.5 text-xs text-left">
                          {bible.brandVoice.dontVoiceRules.map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span className={`text-[11px] leading-tight font-medium ${isDark ? 'text-slate-350' : 'text-slate-600'}`}>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Sample Phrases */}
                  {bible.brandVoice.samplePhrases && bible.brandVoice.samplePhrases.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Sample Copy Taglines</span>
                      <div className="space-y-1">
                        {bible.brandVoice.samplePhrases.map((phrase, idx) => (
                          <div key={idx} className={`px-3.5 py-2.5 rounded-xl border text-[11px] font-mono leading-relaxed transition-all duration-350 ${
                            isDark ? 'bg-slate-950/45 border-slate-800 text-indigo-300' : 'bg-white border-slate-200 text-indigo-600'
                          }`}>
                            "{phrase}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`p-4 border rounded-2xl transition-all duration-300 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`text-xs leading-relaxed italic font-medium transition-colors duration-300 ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    "{bible.brandVoice}"
                  </p>
                </div>
              )}
            </div>

            {/* Secondary concepts / marks */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Secondary Graphic Marks</span>
              <ul className={`space-y-2 text-xs transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {bible.secondaryMarks?.map((mark, idx) => (
                  <li id={`secondary-mark-item-${idx}`} key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono text-indigo-600 font-extrabold mt-0.5">{idx + 1}.</span>
                    <span className="leading-relaxed font-medium">{mark}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 03b / Mission-Driven Brand Personality Radar Widget */}
      <div
        id="brand-personality-radar-section"
        className={`border rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block">
                03b / Mission-Driven Analysis
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Data Viz Widget
              </span>
            </div>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight mt-1 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Activity className="w-5 h-5 text-indigo-600" />
              Brand Personality Trait Radar
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
              Automated multi-axial trait breakdown calculated directly from your initial brand mission and keywords.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            {/* Dominant Trait Badge */}
            {dominantTrait && (
              <div className="px-3 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-sans text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span>Dominant Trait: <strong className={isDark ? 'text-white' : 'text-indigo-900'}>{dominantTrait.trait} ({dominantTrait.score}/100)</strong></span>
              </div>
            )}

            <button
              onClick={() => setShowTraitSliders(!showTraitSliders)}
              className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                showTraitSliders
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isDark
                    ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Toggle Fine-Tune Sliders"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showTraitSliders ? 'Hide Sliders' : 'Fine-Tune Sliders'}</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-2xl border bg-slate-950/20 border-slate-800/60 font-sans">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Target className="w-3 h-3 text-indigo-400" /> Presets:
            </span>
            <button
              onClick={() => handleTraitPresetChange('auto')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                selectedTraitPreset === 'auto'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" /> Mission AI Analysis
            </button>
            <button
              onClick={() => handleTraitPresetChange('disruptive')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTraitPreset === 'disruptive'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Disruptive Leader
            </button>
            <button
              onClick={() => handleTraitPresetChange('luxury')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTraitPreset === 'luxury'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Luxury &amp; Prestige
            </button>
            <button
              onClick={() => handleTraitPresetChange('empathetic')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTraitPreset === 'empathetic'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Friendly Care
            </button>
            <button
              onClick={() => handleTraitPresetChange('enterprise')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTraitPreset === 'enterprise'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Enterprise Trust
            </button>
          </div>

          {selectedTraitPreset !== 'auto' && (
            <button
              onClick={() => handleTraitPresetChange('auto')}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition"
            >
              <RefreshCw className="w-3 h-3" /> Reset to Mission Analysis
            </button>
          )}
        </div>

        {/* Widget Grid Layout: Radar Chart + Trait Cards / Sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Recharts Radar Chart Stage */}
          <div className={`lg:col-span-6 rounded-2xl p-4 sm:p-6 border flex flex-col items-center justify-center relative min-h-[320px] ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={personalityTraits}>
                  <PolarGrid stroke={isDark ? '#334155' : '#cbd5e1'} strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="trait"
                    tick={{
                      fill: isDark ? '#cbd5e1' : '#334155',
                      fontSize: 11,
                      fontWeight: 800,
                      fontFamily: 'sans-serif'
                    }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 9 }}
                  />
                  <Radar
                    name="Brand Trait Score"
                    dataKey="score"
                    stroke={bible.colorPalette[0]?.hex || '#6366f1'}
                    fill={bible.colorPalette[0]?.hex || '#6366f1'}
                    fillOpacity={0.45}
                    dot={{ r: 4, fill: bible.colorPalette[0]?.hex || '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as PersonalityTrait;
                        return (
                          <div className={`p-3 rounded-xl border shadow-xl font-sans text-xs ${
                            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                          }`}>
                            <div className="font-extrabold text-indigo-400 flex items-center justify-between gap-4">
                              <span>{data.trait}</span>
                              <span className="font-mono text-emerald-400">{data.score}/100</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] leading-tight">
                              {data.description}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-400 font-mono font-semibold">
                * Radar curve calculated from semantic mission text &amp; keywords
              </span>
            </div>
          </div>

          {/* Right: Trait Metric Breakdown & Fine-Tuning Sliders */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-3">
              {personalityTraits.map((item) => {
                const isDominant = item.trait === dominantTrait?.trait;
                return (
                  <div
                    key={item.trait}
                    className={`p-3 rounded-2xl border transition-all duration-200 ${
                      isDominant
                        ? isDark
                          ? 'bg-indigo-950/30 border-indigo-500/40'
                          : 'bg-indigo-50/60 border-indigo-200'
                        : isDark
                          ? 'bg-slate-950/40 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black font-sans ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {item.trait}
                        </span>
                        {isDominant && (
                          <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400">
                            Peak
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        {item.score}%
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-tight mb-2">
                      {item.description}
                    </p>

                    {/* Score Bar or Interactive Slider */}
                    {showTraitSliders ? (
                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={item.score}
                        onChange={(e) => handleTraitSliderChange(item.trait, parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-600 h-1.5 rounded-lg cursor-pointer bg-slate-700"
                      />
                    ) : (
                      <div className={`w-full h-2 rounded-full overflow-hidden ${
                        isDark ? 'bg-slate-800' : 'bg-slate-200'
                      }`}>
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Design Actionability Callout */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
              isDark ? 'bg-indigo-950/20 border-indigo-900/40 text-slate-200' : 'bg-indigo-50/50 border-indigo-100 text-slate-800'
            }`}>
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="font-sans text-xs leading-relaxed">
                <span className="font-bold text-indigo-400 block mb-0.5">Brand Strategy Guidance:</span>
                <p className="text-[11px] text-slate-300">
                  {getDesignTipForTrait(dominantTrait?.trait || '')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Favicon & Web Tab Identity Section */}
      <div
        id="brand-favicon-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">02b / Web Tab & Browser Identity</span>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Globe className="w-5 h-5 text-indigo-600" />
              AI Favicon Generator & Tab Preview
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
              Extract and simplify your brand mark into a clean, modern vector web favicon, optimized for browser tabs, bookmark bars, and address bars.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={selectedFaviconStyle}
              onChange={(e) => setSelectedFaviconStyle(e.target.value)}
              disabled={isGeneratingFavicon}
              className={`px-3 py-2 text-xs rounded-xl border font-bold font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-300' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="Minimalist Icon Glyph">Minimalist Icon Glyph</option>
              <option value="Rounded Brand Symbol">Rounded Brand Symbol</option>
              <option value="Monogram / Lettermark">Monogram / Lettermark</option>
              <option value="Flat Geometric Silhouette">Flat Geometric Silhouette</option>
            </select>

            <button
              onClick={handleGenerateFavicon}
              disabled={isGeneratingFavicon}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-full text-xs font-extrabold flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-500/10 active:scale-95 cursor-pointer font-sans"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingFavicon ? 'animate-spin' : ''}`} />
              {isGeneratingFavicon ? 'Extracting...' : 'Generate Favicon'}
            </button>
          </div>
        </div>

        {bible.favicon ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Simulated Browser Environment & Canvas */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">
                Live Web Browser Environment Simulation
              </span>

              {/* Simulated Browser Frame */}
              <div className={`w-full rounded-2xl border shadow-lg overflow-hidden flex flex-col font-sans ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                {/* Simulated Chrome/Safari Window Header */}
                <div className={`px-4 py-3 border-b flex items-center gap-4 ${
                  isDark ? 'bg-slate-900 border-slate-850' : 'bg-slate-200/60 border-slate-300/40'
                }`}>
                  {/* Window Controls (Red, Yellow, Green dots) */}
                  <div className="flex gap-1.5 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-rose-500 block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
                  </div>

                  {/* Simulated Tabs Container */}
                  <div className="flex items-center gap-1.5 overflow-hidden shrink-0">
                    {/* Active Tab */}
                    <div className={`px-4 py-2 rounded-t-xl text-[11px] font-bold flex items-center gap-2 relative ${
                      isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-800 shadow-sm'
                    }`}>
                      {/* Active favicon SVG rendered inline inside the tab! */}
                      <div 
                        className="w-4 h-4 shrink-0 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: getCleanSvg(bible.favicon.svgMarkup) }}
                      />
                      <span className="max-w-[100px] truncate">{bible.companyName}</span>
                      <span className="text-[10px] text-slate-400 font-normal hover:text-red-500 ml-1 cursor-pointer">√ó</span>
                    </div>

                    {/* Secondary Inactive Tab */}
                    <div className={`px-3 py-1.5 rounded-t-lg text-[10px] font-bold flex items-center gap-2 ${
                      isDark ? 'bg-slate-900/40 text-slate-500' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                      <Layers className="w-3.5 h-3.5" />
                      <span className="max-w-[100px] truncate font-sans">AI Brand Suite</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Chrome Address Bar */}
                <div className={`px-4 py-2 border-b flex items-center gap-3 ${
                  isDark ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-50 border-slate-200'
                }`}>
                  {/* Navigation Arrows */}
                  <div className="flex gap-2 text-slate-400 shrink-0 select-none">
                    <span className="text-xs font-bold cursor-default opacity-50">&larr;</span>
                    <span className="text-xs font-bold cursor-default opacity-50">&rarr;</span>
                    <span className="text-xs font-bold cursor-default opacity-80 rotate-45">&#x21bb;</span>
                  </div>

                  {/* Input URL field */}
                  <div className={`flex-1 flex items-center justify-between px-3.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-indigo-400' 
                      : 'bg-white border-slate-200/80 text-indigo-600 shadow-inner'
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-400 text-[10px]">&nbsp;&#128274;</span>
                      <span className="text-slate-400 font-normal select-none">https://</span>
                      <span className="truncate">{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
                    </div>
                    <span className="text-slate-400 select-none">&#9733;</span>
                  </div>
                </div>

                {/* Simulated Bookmark Bar */}
                <div className={`px-4 py-1.5 border-b flex items-center gap-4 text-[10px] font-bold shrink-0 ${
                  isDark ? 'bg-slate-900/30 border-slate-850/50 text-slate-500' : 'bg-slate-100/50 border-slate-200/50 text-slate-400'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500">&#128193;</span> Bookmarks
                  </div>
                  <div className={`h-3 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-3.5 h-3.5 shrink-0 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: getCleanSvg(bible.favicon.svgMarkup) }}
                    />
                    <span className={isDark ? 'text-slate-400 font-sans' : 'text-slate-600 font-sans'}>{bible.companyName} Link</span>
                  </div>
                </div>

                {/* Simulated Page Content (Empty / Branding Display) */}
                <div className={`flex-1 p-8 flex flex-col items-center justify-center min-h-[140px] text-center ${
                  isDark ? 'bg-slate-950 text-slate-400' : 'bg-white text-slate-500'
                }`}>
                  <div className="max-w-sm space-y-2">
                    <p className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {bible.companyName} Web Portal
                    </p>
                    <p className="text-[10px] leading-relaxed">
                      Your high-resolution SVG favicon renders perfectly in the browser tab on the top-left corner, preserving sharp edges and brand aesthetics at microscopic sizes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Utility Tools */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopyFaviconSvg}
                  className={`flex-1 py-2.5 px-4 border rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition duration-200 active:scale-95 cursor-pointer ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {isFaviconCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      Copied Raw SVG Source!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      Copy SVG Source Code
                    </>
                  )}
                </button>

                <button
                  id="dashboard-download-favicon-btn"
                  onClick={handleDownloadFaviconSvg}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition duration-200 active:scale-95 shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Favicon (.svg)
                </button>
              </div>
            </div>

            {/* Right Column: Narrative & Strategic Guidelines */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 font-sans">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-extrabold bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Favicon Specifications Spec
                  </span>
                  <h3 className={`text-2xl font-black mt-2 tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {bible.favicon.faviconName}
                  </h3>
                  <p className="text-xs text-indigo-500 font-bold mt-1 font-sans">
                    Extracted under style: "{selectedFaviconStyle}"
                  </p>
                </div>

                <div className={`p-5 border rounded-2xl transition-all duration-300 leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Aesthetic Extraction Strategy
                  </h4>
                  <p className="text-xs font-medium whitespace-pre-line leading-relaxed text-left">
                    {bible.favicon.explanation}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Integration Code Snippet
                  </h4>
                  <div className={`p-4 border rounded-xl font-mono text-[10px] relative overflow-x-auto ${
                    isDark ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <code>{`<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`}</code>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed text-left">
                    <strong>Why SVG?</strong> Modern browsers natively scale vector SVG favicons flawlessly to all DPI sizes, reducing performance payload and rendering razor-sharp geometry on retina displays.
                  </p>
                </div>
              </div>

              {/* Large Grid Preview of Favicon itself */}
              <div className={`p-5 border rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                isDark ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-150'
              }`}>
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-4 self-start">Grid Alignment Preview (64x64)</h4>
                <div className="w-24 h-24 p-2 rounded-2xl border-2 border-dashed border-indigo-500/20 bg-grid-pattern relative flex items-center justify-center bg-slate-900">
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: getCleanSvg(bible.favicon.svgMarkup) }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-12 border border-dashed rounded-3xl text-center flex flex-col items-center justify-center transition duration-300 ${
            isDark ? 'bg-slate-950/20 border-slate-800 text-slate-400' : 'bg-slate-50/50 border-slate-200 text-slate-500'
          }`}>
            <Globe className="w-12 h-12 text-slate-400/80 mb-3 animate-pulse" />
            <h3 className={`text-sm font-bold tracking-tight mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Tab Identity Favicon Not Extracted Yet
            </h3>
            <p className="text-xs max-w-md mx-auto mb-5 leading-relaxed text-slate-400 font-sans">
              Simplify the primary brand mark to formulate an ultra-clean website favicon using the smart vector SVG generator. Choose a rendering style to configure.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <select
                value={selectedFaviconStyle}
                onChange={(e) => setSelectedFaviconStyle(e.target.value)}
                disabled={isGeneratingFavicon}
                className={`px-3.5 py-2 text-xs rounded-full border font-bold font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-300' 
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <option value="Minimalist Icon Glyph">Minimalist Icon Glyph</option>
                <option value="Rounded Brand Symbol">Rounded Brand Symbol</option>
                <option value="Monogram / Lettermark">Monogram / Lettermark</option>
                <option value="Flat Geometric Silhouette">Flat Geometric Silhouette</option>
              </select>
              <button
                id="generate-favicon-initial-btn"
                onClick={handleGenerateFavicon}
                disabled={isGeneratingFavicon}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-full text-xs font-extrabold flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-500/10 active:scale-95 cursor-pointer font-sans"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingFavicon ? 'animate-spin' : ''}`} />
                {isGeneratingFavicon ? 'Extracting Brand Favicon...' : 'Generate Favicon Mark'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Brand Archetype & Personality Section */}
      <div
        id="brand-archetype-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">03b / Psychological Personality</span>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Compass className="w-5 h-5 text-indigo-600" />
              Brand Archetype & Persona Profile
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
              The archetypal positioning map based on the company's core mission statement and values.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              id="jump-to-voice-editor-from-archetype-btn"
              onClick={() => document.getElementById('brand-voice-editor-section')?.scrollIntoView({ behavior: 'smooth' })}
              className={`px-3.5 py-2 rounded-full text-xs font-bold font-sans flex items-center gap-1.5 transition cursor-pointer border ${
                isDark ? 'bg-slate-950 border-slate-800 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/50' : 'bg-indigo-50/60 border-indigo-200 text-indigo-600 hover:bg-indigo-100/70'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Copy Rephrase Editor</span>
            </button>

            {!bible.archetype && (
              <button
                onClick={handleGenerateArchetype}
                disabled={isGeneratingArchetype}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-full text-xs font-extrabold flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-500/10 active:scale-95 cursor-pointer shrink-0 font-sans"
              >
                <Compass className={`w-4 h-4 ${isGeneratingArchetype ? 'animate-spin' : ''}`} />
                {isGeneratingArchetype ? 'Analyzing...' : 'Discover Brand Archetype'}
              </button>
            )}
          </div>
        </div>

        {bible.archetype ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Radar Chart Visualizer */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 self-start font-sans">
                Jungian Profile Radar Map
              </span>
              <div className={`w-full h-[300px] border rounded-2xl flex items-center justify-center relative overflow-hidden p-2 transition-all duration-300 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={bible.archetype.scores}>
                    <PolarGrid stroke={isDark ? "#1e293b" : "#cbd5e1"} />
                    <PolarAngleAxis
                      dataKey="archetype"
                      tick={{
                        fill: isDark ? "#94a3b8" : "#475569",
                        fontSize: 9,
                        fontWeight: 700
                      }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 8 }}
                    />
                    <Radar
                      name="Affinity %"
                      dataKey="score"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.2}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className={`p-3 rounded-xl border shadow-xl max-w-xs font-sans text-xs ${
                              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                            }`}>
                              <p className="font-extrabold text-indigo-500">{data.archetype}</p>
                              <p className="font-black text-base mt-0.5">{data.score}% Affinity</p>
                              {data.description && (
                                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed border-t pt-1 border-slate-200/20">
                                  {data.description}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strategy & Attributes */}
            <div className="lg:col-span-7 space-y-5 font-sans">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Primary Brand Archetype
                  </span>
                </div>
                <h3 className={`text-2xl font-black mt-2 tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {bible.archetype.primaryArchetype}
                </h3>
                <p className="text-sm text-indigo-500 font-extrabold italic mt-1 font-sans">
                  "{bible.archetype.tagline}"
                </p>
              </div>

              <div className={`p-5 border rounded-2xl transition-all duration-300 leading-relaxed ${
                isDark ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <h4 className={`text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2`}>
                  Psychological & Strategic Alignment
                </h4>
                <p className="text-xs font-medium">
                  {bible.archetype.summary}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Core Character Traits
                </h4>
                <div className="flex flex-wrap gap-2">
                  {bible.archetype.attributes.map((attr, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 border transition duration-250 ${
                        isDark
                          ? 'bg-slate-900/40 border-slate-800 text-indigo-300'
                          : 'bg-indigo-50/50 border-indigo-100 text-indigo-600'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      {attr}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {bible.brandPersonality !== undefined && (
              <div className={`col-span-1 border-t transition-all duration-300 pt-6 mt-2 lg:col-span-12 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-sans">
                    Aesthetic Tone: Brand Personality Spectrum
                  </h4>
                  <span className="text-xs font-bold text-indigo-500 font-sans bg-indigo-500/10 px-2.5 py-0.5 rounded-full dark:bg-indigo-500/20 dark:text-indigo-300">
                    {bible.brandPersonality < 30 ? 'Minimalist / Professional' : bible.brandPersonality > 70 ? 'Playful / Vibrant' : 'Balanced / Versatile'} ({bible.brandPersonality}%)
                  </span>
                </div>
                <div className={`h-3 rounded-full relative overflow-hidden ${
                  isDark ? 'bg-slate-950' : 'bg-slate-100'
                }`}>
                  <div 
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${bible.brandPersonality}%` }}
                  />
                  {/* Subtle markers */}
                  <div className="absolute top-0 bottom-0 left-1/4 w-px bg-slate-300 dark:bg-slate-700 opacity-30" />
                  <div className="absolute top-0 bottom-0 left-2/4 w-px bg-slate-300 dark:bg-slate-700 opacity-30" />
                  <div className="absolute top-0 bottom-0 left-3/4 w-px bg-slate-300 dark:bg-slate-700 opacity-30" />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-extrabold mt-2 uppercase font-sans tracking-wider">
                  <span>Minimalist & Professional</span>
                  <span>Balanced & Versatile</span>
                  <span>Playful & Vibrant</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`p-10 border border-dashed rounded-3xl text-center flex flex-col items-center justify-center transition duration-300 ${
            isDark ? 'bg-slate-950/20 border-slate-800 text-slate-400' : 'bg-slate-50/50 border-slate-200 text-slate-500'
          }`}>
            <Compass className="w-12 h-12 text-slate-400/80 mb-3 animate-pulse" />
            <h3 className={`text-sm font-bold tracking-tight mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Archetype Analysis Pending
            </h3>
            <p className="text-xs max-w-md mx-auto mb-4 leading-relaxed text-slate-400 font-sans">
              Analyze your brand's mission and keywords to map out its archetype on a radar chart.
            </p>
            <button
              onClick={handleGenerateArchetype}
              disabled={isGeneratingArchetype}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-full text-xs font-extrabold flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-500/10 active:scale-95 cursor-pointer font-sans"
            >
              <Compass className={`w-4 h-4 ${isGeneratingArchetype ? 'animate-spin' : ''}`} />
              {isGeneratingArchetype ? 'Analyzing...' : 'Discover Brand Archetype'}
            </button>
          </div>
        )}
      </div>

      {/* Brand Voice & Written Communication Guidelines Section */}
      <div
        id="brand-voice-written-communication-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block">
                03a / Brand Voice & Communication Strategy
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-mono">
                Gemini API Powered
              </span>
            </div>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Megaphone className="w-5 h-5 text-indigo-600" />
              Brand Voice & Written Communication Guidelines
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
              Sample 'About Us' narrative paragraph and specific Do's & Don'ts for written communication generated based on the active brand personality ({bible.brandPersonality || 50}%).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              id="jump-to-voice-editor-from-voice-header-btn"
              onClick={() => document.getElementById('brand-voice-editor-section')?.scrollIntoView({ behavior: 'smooth' })}
              className={`px-3.5 py-2 rounded-full text-xs font-bold font-sans flex items-center gap-1.5 transition cursor-pointer border ${
                isDark ? 'bg-slate-950 border-slate-800 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/50' : 'bg-indigo-50/60 border-indigo-200 text-indigo-600 hover:bg-indigo-100/70'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Rephrase Studio</span>
            </button>

            <button
              id="generate-voice-gemini-btn"
              onClick={() => handleGenerateVoice()}
              disabled={isGeneratingVoice}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-full text-xs font-extrabold flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-500/10 active:scale-95 cursor-pointer font-sans"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isGeneratingVoice ? 'animate-spin' : ''}`} />
              {isGeneratingVoice ? 'Synthesizing Voice...' : 'Refine Voice with Gemini AI'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Brand Voice Preview (Live Marketing Copy & Typography) */}
          <div className={`p-6 border rounded-2xl transition-all duration-300 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-5 border-slate-200/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-sans">
                    <Type className="w-3.5 h-3.5 text-indigo-500" />
                    Brand Voice Preview
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
                    Tone + Typography Live Sync
                  </span>
                </div>
                <h3 className={`text-base font-extrabold tracking-tight font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Live Marketing Copy Preview
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Generates sample marketing copy using your brand's tone, rendered live with your selected header and body typography.
                </p>
              </div>

              {/* Actions: Background theme switcher, Regenerate, Copy */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Background Mode Switcher */}
                <div className={`flex rounded-xl p-1 border text-[10px] font-sans font-bold ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    id="voice-preview-bg-light"
                    onClick={() => setPreviewCardBg('light')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      previewCardBg === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Light Canvas"
                  >
                    Light
                  </button>
                  <button
                    id="voice-preview-bg-dark"
                    onClick={() => setPreviewCardBg('dark')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      previewCardBg === 'dark' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Dark Canvas"
                  >
                    Dark
                  </button>
                  <button
                    id="voice-preview-bg-brand"
                    onClick={() => setPreviewCardBg('brand')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      previewCardBg === 'brand' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Brand Accent Canvas"
                  >
                    Brand
                  </button>
                </div>

                <button
                  id="regenerate-voice-preview-btn"
                  onClick={() => handleGenerateVoicePreview()}
                  disabled={isGeneratingVoicePreview}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 cursor-pointer font-sans"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingVoicePreview ? 'animate-spin' : ''}`} />
                  {isGeneratingVoicePreview ? 'Generating...' : 'Regenerate Copy'}
                </button>

                <button
                  id="copy-voice-preview-btn"
                  onClick={handleCopyVoicePreview}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer font-sans ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-indigo-600'
                  }`}
                >
                  {isCopiedPreviewText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copy Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Copy Angle Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-slate-200/10 font-sans text-xs">
              {[
                { id: 'value_prop', label: 'üöÄ Value Proposition' },
                { id: 'brand_story', label: 'üìñ Brand Mission Story' },
                { id: 'campaign_pitch', label: '‚ö° Campaign Hook' },
                { id: 'social_hook', label: 'üì£ Social Announcement' },
                { id: 'cx_promise', label: 'ü§ù Customer Promise' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  id={`voice-preview-tab-${tab.id}`}
                  onClick={() => {
                    setPreviewAngle(tab.id as any);
                    setPreviewCopy(getInitialVoicePreview(tab.id));
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                    previewAngle === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isDark
                        ? 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Rendered Live Canvas using Brand Typography */}
            {(() => {
              const currentData = previewCopy || getInitialVoicePreview(previewAngle);
              const headerFontName = bible.typography?.headerFont || 'Playfair Display';
              const bodyFontName = bible.typography?.bodyFont || 'Plus Jakarta Sans';
              const primaryHex = bible.colorPalette[0]?.hex || '#6366f1';

              let bgStyle = '';
              let textColor = '';
              let headlineColor = '';
              let noteBg = '';

              if (previewCardBg === 'dark') {
                bgStyle = 'bg-slate-950 text-slate-100 border-slate-800';
                textColor = 'text-slate-300';
                headlineColor = 'text-white';
                noteBg = 'bg-slate-900/80 border-slate-800 text-slate-400';
              } else if (previewCardBg === 'brand') {
                bgStyle = 'text-white border-indigo-700/50 shadow-inner';
                textColor = 'text-indigo-100';
                headlineColor = 'text-white';
                noteBg = 'bg-black/20 border-white/10 text-indigo-100';
              } else {
                bgStyle = 'bg-slate-50 text-slate-900 border-slate-200/80';
                textColor = 'text-slate-700';
                headlineColor = 'text-slate-900';
                noteBg = 'bg-white border-slate-200 text-slate-500 shadow-2xs';
              }

              return (
                <div 
                  className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 space-y-4 relative overflow-hidden ${bgStyle}`}
                  style={previewCardBg === 'brand' ? { backgroundColor: primaryHex } : {}}
                >
                  {/* Active Typography Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest font-mono font-bold opacity-75">
                        Active Typography System:
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-black/10 border border-black/10">
                        Header: <span className="underline">{headerFontName}</span> ({bible.typography?.headerCategory || 'Display'})
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-black/10 border border-black/10">
                        Body: <span className="underline">{bodyFontName}</span> ({bible.typography?.bodyCategory || 'Sans-Serif'})
                      </span>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase font-mono opacity-60">
                      Tone: {typeof bible.brandVoice === 'object' ? bible.brandVoice.tone : (bible.brandVoice || 'Professional')}
                    </span>
                  </div>

                  {/* Live Rendered Headline */}
                  <h3 
                    className={`text-2xl sm:text-3xl font-bold tracking-tight leading-tight ${headlineColor}`}
                    style={{ fontFamily: `'${headerFontName}', serif, sans-serif` }}
                  >
                    {currentData.headline}
                  </h3>

                  {/* Live Rendered Marketing Paragraph */}
                  <p 
                    className={`text-sm sm:text-base leading-relaxed ${textColor}`}
                    style={{ fontFamily: `'${bodyFontName}', sans-serif` }}
                  >
                    {currentData.paragraph}
                  </p>

                  {/* Tone Alignment & Attribute Breakdown */}
                  <div className={`p-3 rounded-xl border text-xs font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${noteBg}`}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-semibold text-[11px] leading-snug">
                        {currentData.toneAlignmentNote}
                      </span>
                    </div>

                    {/* Key Metric Chips */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      {voiceMetrics.slice(0, 3).map((m, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-black/10 border border-black/10 font-mono">
                          {m.attribute}: {m.value}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Sample 'About Us' Story Paragraph Card */}
          <div className={`p-6 border rounded-2xl relative overflow-hidden transition-all duration-300 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-indigo-50/40 border-indigo-100/80'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b pb-3 border-slate-200/20">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-sans">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Sample 'About Us' Paragraph (Personality Spectrum: {bible.brandPersonality || 50}%)
                </span>
              </div>
              <button
                id="copy-about-us-btn"
                onClick={handleCopyAboutUs}
                className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer font-sans ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600 shadow-xs'
                }`}
              >
                {isAboutUsCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Copied 'About Us' Text!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    Copy 'About Us' Text
                  </>
                )}
              </button>
            </div>

            <p className={`text-sm leading-relaxed font-sans font-medium italic ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}>
              "{typeof bible.brandVoice === 'object' && bible.brandVoice.aboutUsParagraph
                ? bible.brandVoice.aboutUsParagraph
                : `${bible.companyName} was founded to redefine the ${bible.industry} landscape for ${bible.targetAudience}. Driven by our core mission‚Äî"${bible.mission}"‚Äîwe pair strategic intent with relentless execution to deliver meaningful outcomes.`}"
            </p>
          </div>

          {/* Written Communication Guidelines (Do's & Don'ts Grid) */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 font-sans flex items-center justify-between">
              <span>Do's & Don'ts for Written Communication</span>
              <span className="text-[9px] text-slate-400 font-normal">Derived from selected brand personality</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Do's Column */}
              <div className={`p-5 border rounded-2xl font-sans ${
                isDark ? 'bg-slate-950/60 border-emerald-950/60' : 'bg-emerald-50/30 border-emerald-100/80'
              }`}>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-500/20">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Do's for Written Communication
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {(typeof bible.brandVoice === 'object' && bible.brandVoice.doVoiceRules && bible.brandVoice.doVoiceRules.length > 0
                    ? bible.brandVoice.doVoiceRules
                    : [
                        "Use active, empowering verbs that inspire user action and confidence",
                        "Keep sentences clear, punchy, and structured around key reader benefits",
                        "Highlight human-centric value and problem solving directly",
                        "Maintain warmth, empathy, and clarity without sacrificing professional authority"
                      ]
                  ).map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className={`font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {rule}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts Column */}
              <div className={`p-5 border rounded-2xl font-sans ${
                isDark ? 'bg-slate-950/60 border-rose-950/60' : 'bg-rose-50/30 border-rose-100/80'
              }`}>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-rose-500/20">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Don'ts for Written Communication
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {(typeof bible.brandVoice === 'object' && bible.brandVoice.dontVoiceRules && bible.brandVoice.dontVoiceRules.length > 0
                    ? bible.brandVoice.dontVoiceRules
                    : [
                        "Avoid dense corporate jargon, hyperbole, and empty marketing hype",
                        "Do not sound robotic, detached, or cold in user communications",
                        "Avoid passive phrasing and unsubstantiated claims",
                        "Don't rely on aggressive sales pressure tactics or misleading urgency"
                      ]
                  ).map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs">
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className={`font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {rule}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Voice Metrics Spider Chart Section */}
      <div
        id="brand-voice-radar-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">03c / Verbal Identity & Voice Radar</span>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Volume2 className="w-5 h-5 text-indigo-600" />
              Brand Voice & Personality Spider Chart
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
              Spider (radar) chart visualizer mapping tone dimensions across formality, empathy, authority, energy, boldness, clarity, and playfulness.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 mr-1 font-sans hidden md:inline">Presets:</span>
            <button
              id="voice-preset-corporate-btn"
              onClick={() => handleApplyVoicePreset('corporate')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600'
              }`}
            >
              Corporate
            </button>
            <button
              id="voice-preset-startup-btn"
              onClick={() => handleApplyVoicePreset('startup')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600'
              }`}
            >
              Startup Bold
            </button>
            <button
              id="voice-preset-warm-btn"
              onClick={() => handleApplyVoicePreset('warm')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600'
              }`}
            >
              Empathetic
            </button>
            <button
              id="voice-preset-disruptive-btn"
              onClick={() => handleApplyVoicePreset('disruptive')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600'
              }`}
            >
              Disruptive
            </button>
            <button
              id="voice-metrics-reset-btn"
              onClick={handleResetVoiceMetrics}
              className={`p-1.5 rounded-full border transition cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-indigo-600'
              }`}
              title="Reset metrics to defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Radar Chart Display */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-full flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">
                Tone Attribute Polygon (Spider Map)
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {voiceMetrics
                  .slice()
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 2)
                  .map(topAttr => (
                    <span
                      key={topAttr.attribute}
                      className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                    >
                      Top: {topAttr.attribute} ({topAttr.value}%)
                    </span>
                  ))}
              </div>
            </div>

            <div className={`w-full h-[330px] border rounded-2xl flex items-center justify-center relative overflow-hidden p-2 transition-all duration-300 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={voiceMetrics}>
                  <PolarGrid stroke={isDark ? "#1e293b" : "#cbd5e1"} />
                  <PolarAngleAxis
                    dataKey="attribute"
                    tick={{
                      fill: isDark ? "#cbd5e1" : "#334155",
                      fontSize: 10,
                      fontWeight: 700
                    }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 8 }}
                  />
                  <Radar
                    name="Voice Metric Score"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.45}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className={`p-3 rounded-xl shadow-xl border text-xs font-sans ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}>
                            <div className="font-extrabold flex items-center justify-between gap-3 text-indigo-500">
                              <span>{item.attribute}</span>
                              <span className="font-mono text-xs">{item.value}/100</span>
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] leading-tight">
                                {item.description}
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className={`w-full p-4 border rounded-2xl text-xs font-sans leading-relaxed ${
              isDark ? 'bg-slate-950/50 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <span className="font-extrabold text-indigo-500 block mb-1 uppercase text-[9px] tracking-wider">
                Verbal Tone Statement
              </span>
              <p className="italic">
                "{typeof bible.brandVoice === 'object' ? bible.brandVoice.tone : (bible.brandVoice || 'Professional, clear, and empathetic tone.')}"
              </p>
            </div>
          </div>

          {/* Interactive Metric Controls & Personality Traits */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                Fine-Tune Personality Dimensions
              </span>
              <span className="text-[9px] text-slate-400 font-sans">Drag sliders to adjust</span>
            </div>

            <div className="space-y-3">
              {voiceMetrics.map((metric, idx) => (
                <div
                  key={metric.attribute}
                  className={`p-3 border rounded-xl transition-all duration-200 ${
                    isDark ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className={`font-sans ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {metric.attribute}
                    </span>
                    <span className="font-mono text-indigo-500 font-extrabold">{metric.value}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={metric.value}
                    onChange={(e) => handleVoiceMetricChange(idx, parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  {metric.description && (
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      {metric.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Keyword Pills */}
            {typeof bible.brandVoice === 'object' && bible.brandVoice.personalityKeywords?.length > 0 && (
              <div className="pt-2">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-2 font-sans">
                  Associated Personality Keywords
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {bible.brandVoice.personalityKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        isDark ? 'bg-slate-950 border-slate-800 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                      }`}
                    >
                      ‚ú¶ {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Prompt Templates Module for Marketing Content */}
      <div
        id="ai-prompt-templates-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block">
                03c-2 / Verbal Identity & AI Prompt Templates
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-mono">
                Brand-Voice Tailored
              </span>
            </div>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Bot className="w-5 h-5 text-indigo-500" />
              AI Marketing Prompt Templates
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-1 max-w-2xl">
              Pre-defined LLM prompts and live copy drafts engineered specifically around your brand voice matrix metrics, target demographic, and tone parameters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="prompt-view-mode-prompt-btn"
              onClick={() => setPromptViewMode('prompt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                promptViewMode === 'prompt'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              AI Prompt Template
            </button>
            <button
              id="prompt-view-mode-sample-btn"
              onClick={() => setPromptViewMode('sample')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                promptViewMode === 'sample'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sample Draft Output
            </button>
          </div>
        </div>

        {/* Custom Variable Adjusters (Product/Feature & Target Audience) */}
        <div className={`p-4 rounded-2xl border mb-6 ${
          isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              Dynamic Context Variables
            </span>
            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              Active Voice Tone: {typeof bible.brandVoice === 'object' ? bible.brandVoice.tone : (typeof bible.brandVoice === 'string' ? bible.brandVoice : 'Custom')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1 font-sans">
                Featured Product / Offering Title
              </label>
              <input
                id="prompt-custom-feature-input"
                type="text"
                placeholder={`${bible.companyName} Core Platform`}
                value={promptCustomFeature}
                onChange={(e) => setPromptCustomFeature(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border font-semibold font-sans transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1 font-sans">
                Target Audience Context
              </label>
              <input
                id="prompt-custom-audience-input"
                type="text"
                placeholder={bible.targetAudience || "Modern professionals & innovators"}
                value={promptCustomAudience}
                onChange={(e) => setPromptCustomAudience(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border font-semibold font-sans transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Prompt Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'about', label: "'About Us' Story", icon: MessageSquare, badge: 'Page Copy' },
            { id: 'product', label: 'Product Description', icon: Target, badge: 'High Converting' },
            { id: 'social', label: 'Social Media Launch', icon: Share2, badge: '3 Platforms' },
            { id: 'email', label: 'Email Newsletter', icon: Megaphone, badge: 'Outreach' },
            { id: 'tagline', label: 'Brand Taglines & Slogans', icon: Lightbulb, badge: '10 Concepts' },
            { id: 'ad', label: 'Ad Campaign Creative', icon: Zap, badge: 'Search & Paid' }
          ].map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedPromptCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`prompt-cat-tab-${cat.id}`}
                onClick={() => setSelectedPromptCategory(cat.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-2 border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20 scale-[1.02]'
                    : isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                <span>{cat.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                  isSelected ? 'bg-white/20 text-white' : isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Prompt / Draft Display Container */}
        <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 text-slate-100 border-slate-800'
        }`}>
          {/* Top Bar with Status & Copy Buttons */}
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold text-slate-200 font-sans">
                {promptViewMode === 'prompt' ? 'Tailored AI Prompt Template' : 'Live Generated Sample Draft'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Category: {selectedPromptCategory.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {promptViewMode === 'prompt' ? (
                <button
                  id="copy-ai-prompt-btn"
                  onClick={() => {
                    const { promptText } = getTailoredMarketingPrompt(selectedPromptCategory);
                    navigator.clipboard.writeText(promptText);
                    setIsCopiedPromptText(true);
                    setToast({
                      message: "Copied AI Prompt for ChatGPT / Gemini!",
                      hex: bible.colorPalette[0]?.hex || '#6366f1'
                    });
                    setTimeout(() => setIsCopiedPromptText(false), 2000);
                    setTimeout(() => setToast(null), 2500);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-sans flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  {isCopiedPromptText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied Prompt!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy AI Prompt</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  id="copy-sample-draft-btn"
                  onClick={() => {
                    const { sampleDraft } = getTailoredMarketingPrompt(selectedPromptCategory);
                    navigator.clipboard.writeText(sampleDraft);
                    setIsCopiedSampleText(true);
                    setToast({
                      message: "Copied Sample Copy Draft!",
                      hex: bible.colorPalette[0]?.hex || '#6366f1'
                    });
                    setTimeout(() => setIsCopiedSampleText(false), 2000);
                    setTimeout(() => setToast(null), 2500);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-sans flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  {isCopiedSampleText ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Sample Draft!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Draft Text</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Text Content Box */}
          <div className="p-6 font-mono text-xs leading-relaxed text-slate-300 max-h-[460px] overflow-y-auto whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
            {promptViewMode === 'prompt'
              ? getTailoredMarketingPrompt(selectedPromptCategory).promptText
              : getTailoredMarketingPrompt(selectedPromptCategory).sampleDraft
            }
          </div>

          {/* Bottom Information Footer */}
          <div className="px-5 py-3 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-sans">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Paste directly into Gemini, ChatGPT, Claude, or any LLM marketing workflow.</span>
            </div>
            <span className="font-mono text-indigo-400">
              {voiceMetrics.length} Active Voice Metrics Integrated
            </span>
          </div>
        </div>
      </div>

      {/* 03d. Brand Voice & Archetype Copy Rephrase Editor */}
      <BrandVoiceEditor
        bible={bible}
        isDark={isDark}
        onUpdateMission={(newMission) => {
          if (onUpdateMission) {
            onUpdateMission(newMission);
          } else if (onUpdateBible) {
            onUpdateBible({ ...bible, mission: newMission });
          }
        }}
        onUpdateTagline={(newTagline) => {
          if (onUpdateTagline) {
            onUpdateTagline(newTagline);
          } else if (bible.archetype) {
            onUpdateArchetype({ ...bible.archetype, tagline: newTagline });
          } else if (onUpdateBible) {
            onUpdateBible({
              ...bible,
              archetype: {
                primaryArchetype: bible.archetype?.primaryArchetype || 'The Creator',
                tagline: newTagline,
                summary: bible.archetype?.summary || 'Visionary craft and original execution.',
                attributes: bible.archetype?.attributes || ['Creative', 'Visionary'],
                scores: bible.archetype?.scores || []
              }
            });
          }
        }}
        onUpdateVoice={(newVoice) => {
          if (onUpdateVoice) {
            onUpdateVoice(newVoice);
          } else if (onUpdateBible) {
            onUpdateBible({ ...bible, brandVoice: newVoice });
          }
        }}
        onShowToast={(message, hex) => {
          setToast({ message, hex: hex || bible.colorPalette[0]?.hex || '#6366f1' });
          setTimeout(() => setToast(null), 2500);
        }}
      />

      {/* Brand Analytics Section */}
      <div
        id="brand-analytics-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">03d / Brand Analytics & Visual Insights</span>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Brand Design & Semantic Analytics
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
              Quantitative visualization of color weight composition and keyword semantic performance metrics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Color Weight Composition (Donut Chart) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 block font-sans">
                60-30-10 Color Weight Distribution
              </span>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                Recommended design balance showing visual footprint allocation for primary, secondary, accent, and neutral roles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-7 h-[220px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={calculateColorData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {calculateColorData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.hex} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className={`p-3 rounded-xl border shadow-xl font-sans text-xs ${
                              isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                            }`}>
                              <p className="font-extrabold flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.hex }} />
                                {data.name}
                              </p>
                              <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">{data.role}</p>
                              <p className="font-black text-sm mt-0.5">{data.value}% Volume</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center metric */}
                <div className="absolute text-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Harmony
                  </span>
                  <p className={`text-2xl font-black transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    98%
                  </p>
                </div>
              </div>

              {/* Legends with color specs */}
              <div className="sm:col-span-5 space-y-2.5">
                {calculateColorData().map((color, idx) => {
                  const a11y = getAccessibilityScore(color.hex);
                  return (
                    <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between font-sans ${
                      isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/50 border-slate-200/80'
                    }`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-4 h-4 rounded-full shrink-0 border border-slate-200/10 shadow-sm" style={{ backgroundColor: color.hex }} />
                        <div className="min-w-0">
                          <p className={`text-[11px] font-extrabold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {color.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[9px] text-slate-400 font-medium truncate uppercase tracking-tight">
                              {color.role}
                            </p>
                            <span className={`text-[7px] font-extrabold px-1 py-0.2 rounded border uppercase tracking-wider ${a11y.badgeStyle}`}>
                              A11y {a11y.rating} ({a11y.bestRatio.toFixed(1)}:1)
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[11px] font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {color.value}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Keyword Semantic Metrics (Bar Chart) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 block font-sans">
                Keyword Semantic Performance Map
              </span>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                Analysis of core brand terms mapped across customer sentiment, target audience connection, and brand positioning strength.
              </p>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getKeywordChartData()}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: isDark ? "#94a3b8" : "#475569", fontSize: 9, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 8 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={`p-3 rounded-xl border shadow-xl font-sans text-xs ${
                            isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                          }`}>
                            <p className="font-extrabold text-indigo-500 mb-1">{payload[0].payload.name}</p>
                            <div className="space-y-1 mt-1 border-t pt-1 border-slate-200/10">
                              {payload.map((p, index) => (
                                <p key={index} className="flex justify-between gap-6">
                                  <span className="text-slate-400">{p.name}:</span>
                                  <span className="font-black" style={{ color: p.color }}>{p.value}%</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="Sentiment"
                    name="Resonance"
                    fill={bible.colorPalette[0]?.hex || '#6366f1'}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Strength"
                    name="Strength"
                    fill={bible.colorPalette[1]?.hex || '#10b981'}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Clarity"
                    name="Aesthetic Clarity"
                    fill={bible.colorPalette[2]?.hex || '#f59e0b'}
                    radius={[4, 4, 0, 0]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 9, fontFamily: 'Inter, sans-serif', fontWeight: 600, paddingTop: 10 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Pattern Generator Section */}
      <div
        id="brand-pattern-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">03c / Visual Texture & Artistry</span>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Layers className="w-5 h-5 text-indigo-600" />
              Generative Brand Patterns
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
              Create gorgeous, seamless repeating background patterns tailored to the brand personality and colors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={selectedPatternStyle}
              onChange={(e) => setSelectedPatternStyle(e.target.value)}
              disabled={isGeneratingPattern}
              className={`px-3 py-2 text-xs rounded-xl border font-bold font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-300' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="Modern Minimal Grid">Modern Minimal Grid</option>
              <option value="Organic Fluid Waves">Organic Fluid Waves</option>
              <option value="Abstract Floating Particles">Abstract Floating Particles</option>
              <option value="Playful Memphis Confetti">Playful Memphis Confetti</option>
              <option value="Symmetrical Hexagonal Cells">Symmetrical Hexagonal Cells</option>
              <option value="Duo-tone Waves">Duo-tone Waves</option>
            </select>

            <button
              onClick={() => handleGeneratePattern()}
              disabled={isGeneratingPattern}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-full text-xs font-extrabold flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-500/10 active:scale-95 cursor-pointer font-sans"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingPattern ? 'animate-spin' : ''}`} />
              {isGeneratingPattern ? 'Weaving...' : 'Generate Pattern'}
            </button>
          </div>
        </div>

        {bible.pattern ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Sandbox Preview Canvas */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">
                  Seamless Texture Sandbox
                </span>
                
                {/* Overlay Mode Switcher */}
                <div className={`flex items-center rounded-lg p-0.5 border text-[10px] font-sans font-bold ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    onClick={() => setPatternOverlayMode('light')}
                    className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                      patternOverlayMode === 'light'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setPatternOverlayMode('dark')}
                    className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                      patternOverlayMode === 'dark'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setPatternOverlayMode('color')}
                    className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                      patternOverlayMode === 'color'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Brand Color
                  </button>
                </div>
              </div>

              {/* Seamless Preview Area */}
              <div 
                className={`w-full min-h-[320px] rounded-2xl border flex items-center justify-center relative overflow-hidden transition-all duration-500 shadow-inner`}
                style={{
                  backgroundColor: 
                    patternOverlayMode === 'light' 
                      ? '#f8fafc' 
                      : patternOverlayMode === 'dark' 
                        ? '#020617' 
                        : (bible.colorPalette[0]?.hex || '#6366f1'),
                  ...getPatternStyle()
                }}
              >
                {/* Floating indicator */}
                <div className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-xl border text-[10px] font-bold font-mono tracking-wide backdrop-blur-md shadow-sm pointer-events-none ${
                  patternOverlayMode === 'dark' 
                    ? 'bg-slate-950/80 border-slate-800 text-slate-400' 
                    : 'bg-white/80 border-slate-200/50 text-slate-600'
                }`}>
                  REPEATING BG TILE
                </div>
              </div>

              {/* Utility Tools */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopySvg}
                  className={`flex-1 py-2.5 px-4 border rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition duration-200 active:scale-95 cursor-pointer ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {isPatternCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      Copied Raw SVG Source!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      Copy Raw SVG Markup
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadSvg}
                  className={`flex-1 py-2.5 px-4 border rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition duration-200 active:scale-95 cursor-pointer ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  Download Pattern (.svg)
                </button>
              </div>
            </div>

            {/* Right Column: Narrative & Strategic Guidelines */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6 font-sans">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-extrabold bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Generative Texture Spec
                  </span>
                  <h3 className={`text-2xl font-black mt-2 tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {bible.pattern.patternName}
                  </h3>
                  <p className="text-xs text-indigo-500 font-bold mt-1 font-sans">
                    Custom-aligned to {bible.brandPersonality ?? 50}% Brand Personality
                  </p>
                </div>

                <div className={`p-5 border rounded-2xl transition-all duration-300 leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Aesthetic Concept & Strategy
                  </h4>
                  <p className="text-xs font-medium whitespace-pre-line leading-relaxed">
                    {bible.pattern.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Integration Recommendations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={`p-4 border rounded-xl ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-slate-150'}`}>
                      <h5 className={`text-xs font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Website Backgrounds</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Apply as a CSS background-image to hero sections or main page wrappers at low-opacity overlays to add custom luxury brand texture.</p>
                    </div>
                    <div className={`p-4 border rounded-xl ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-slate-150'}`}>
                      <h5 className={`text-xs font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Marketing Collateral</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Use as background visuals for corporate slides, product packaging accents, banners, and business cards to cement brand consistency.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Palette swatches used in pattern */}
              <div className={`p-4 border rounded-2xl flex items-center justify-between transition-all duration-300 ${
                isDark ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-100/50 border-slate-200'
              }`}>
                <div className="space-y-1">
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Selected Colors</h4>
                  <p className="text-[10px] text-slate-400">Pattern utilizes brand-locked system hexes.</p>
                </div>
                <div className="flex -space-x-2 overflow-hidden">
                  {bible.colorPalette.map((color, idx) => (
                    <div
                      key={idx}
                      className="inline-block h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} (${color.hex})`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-12 border border-dashed rounded-3xl text-center flex flex-col items-center justify-center transition duration-300 ${
            isDark ? 'bg-slate-950/20 border-slate-800 text-slate-400' : 'bg-slate-50/50 border-slate-200 text-slate-500'
          }`}>
            <Grid className="w-12 h-12 text-slate-400/80 mb-3 animate-pulse" />
            <h3 className={`text-sm font-bold tracking-tight mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Seamless Texture Not Generated Yet
            </h3>
            <p className="text-xs max-w-md mx-auto mb-5 leading-relaxed text-slate-400 font-sans">
              Discover unique tileable visual backgrounds designed entirely by AI around your chosen brand personality spectrum ({bible.brandPersonality ?? 50}%) and 5-color system.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <select
                value={selectedPatternStyle}
                onChange={(e) => setSelectedPatternStyle(e.target.value)}
                disabled={isGeneratingPattern}
                className={`px-3.5 py-2 text-xs rounded-full border font-bold font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-300' 
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <option value="Modern Minimal Grid">Modern Minimal Grid</option>
                <option value="Organic Fluid Waves">Organic Fluid Waves</option>
                <option value="Abstract Floating Particles">Abstract Floating Particles</option>
                <option value="Playful Memphis Confetti">Playful Memphis Confetti</option>
                <option value="Symmetrical Hexagonal Cells">Symmetrical Hexagonal Cells</option>
                <option value="Duo-tone Waves">Duo-tone Waves</option>
              </select>
              <button
                onClick={() => handleGeneratePattern()}
                disabled={isGeneratingPattern}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-full text-xs font-extrabold flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-500/10 active:scale-95 cursor-pointer font-sans"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingPattern ? 'animate-spin' : ''}`} />
                {isGeneratingPattern ? 'Weaving Pattern...' : 'Generate Brand Pattern'}
              </button>
            </div>
          </div>
        )}

        {/* Tiled Geometric Patterns Library & Interactive Studio */}
        <div id="brand-patterns-library-studio" className={`mt-8 border rounded-2xl p-6 transition-all duration-300 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  Palette-Driven Pattern Library
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {BRAND_PATTERN_TEMPLATES.length} Seamless Geometric Presets
                </span>
              </div>
              <h3 className={`text-base font-black flex items-center gap-2 font-sans tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Grid className="w-4 h-4 text-indigo-500" />
                Tiled Geometric Patterns Library
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
                Choose from seamless vector geometric patterns crafted using your active brand palette. Customize parameters and apply them directly to brand mockups.
              </p>
            </div>

            {/* Stage Mode Selector */}
            <div className={`flex items-center rounded-lg p-1 border text-[10px] font-sans font-bold self-start md:self-auto ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <span className="text-slate-400 px-2 text-[9px] uppercase font-bold">Stage Fill:</span>
              <button
                type="button"
                onClick={() => setGeometricBgMode('light')}
                className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                  geometricBgMode === 'light' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setGeometricBgMode('dark')}
                className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                  geometricBgMode === 'dark' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setGeometricBgMode('brand')}
                className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                  geometricBgMode === 'brand' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                Brand Fill
              </button>
            </div>
          </div>

          {/* Grid of Geometric Pattern Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {BRAND_PATTERN_TEMPLATES.map((tmpl) => {
              const { primary, secondary, accent, darkNeutral, lightNeutral } = extractBrandColors(bible.colorPalette);
              const fgHex =
                geometricFgRole === 'primary' ? primary :
                geometricFgRole === 'secondary' ? secondary :
                geometricFgRole === 'accent' ? accent :
                geometricFgRole === 'dark' ? darkNeutral : lightNeutral;

              const tileDataUrl = generatePatternDataUrl({
                type: tmpl.id,
                scale: geometricScale,
                bgColor: 'transparent',
                fgColor: fgHex,
                secondaryColor: secondary,
                accentColor: accent,
                opacity: geometricOpacity
              });

              const isSelected = selectedGeometricPattern === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedGeometricPattern(tmpl.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10 shadow-md'
                      : isDark
                        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Pattern Preview Box */}
                    <div
                      className="w-full h-28 rounded-xl border mb-3 relative overflow-hidden transition-all duration-300 shadow-inner flex items-center justify-center"
                      style={{
                        backgroundColor:
                          geometricBgMode === 'light' ? '#f8fafc' :
                          geometricBgMode === 'dark' ? '#090d16' : primary,
                        backgroundImage: `url("${tileDataUrl}")`,
                        backgroundRepeat: 'repeat'
                      }}
                    >
                      <span className="absolute top-2 right-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white border border-white/10 backdrop-blur-md">
                        {tmpl.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-xs font-bold font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {tmpl.name}
                      </h4>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-500 font-bold">
                      {tmpl.id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {isSelected ? 'Active Selection' : 'Click to Preview'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Studio Large Stage & Fine-Tuning Parameters */}
          {(() => {
            const { primary, secondary, accent, darkNeutral, lightNeutral } = extractBrandColors(bible.colorPalette);
            const fgHex =
              geometricFgRole === 'primary' ? primary :
              geometricFgRole === 'secondary' ? secondary :
              geometricFgRole === 'accent' ? accent :
              geometricFgRole === 'dark' ? darkNeutral : lightNeutral;

            const studioTileDataUrl = generatePatternDataUrl({
              type: selectedGeometricPattern,
              scale: geometricScale,
              bgColor: 'transparent',
              fgColor: fgHex,
              secondaryColor: secondary,
              accentColor: accent,
              opacity: geometricOpacity
            });

            const studioSvgMarkup = generatePatternSvg({
              type: selectedGeometricPattern,
              scale: geometricScale,
              bgColor: 'transparent',
              fgColor: fgHex,
              secondaryColor: secondary,
              accentColor: accent,
              opacity: geometricOpacity
            });

            const selectedTmpl = BRAND_PATTERN_TEMPLATES.find(t => t.id === selectedGeometricPattern);

            const handleSavePatternToBible = () => {
              const patternObj: BrandPattern = {
                patternName: selectedTmpl ? selectedTmpl.name : 'Geometric Pattern',
                description: selectedTmpl ? selectedTmpl.description : 'Custom brand geometric pattern.',
                svgMarkup: studioSvgMarkup
              };
              onUpdatePattern(patternObj);
              setToast({
                message: `Set "${selectedTmpl?.name}" as the active brand pattern!`,
                hex: fgHex
              });
              setTimeout(() => setToast(null), 3000);
            };

            const handleCopyGeometricSvg = () => {
              navigator.clipboard.writeText(studioSvgMarkup);
              setIsCopiedGeometricSvg(true);
              setTimeout(() => setIsCopiedGeometricSvg(false), 2000);
            };

            const handleCopyGeometricCss = () => {
              const cssRule = `background-image: url("${studioTileDataUrl}");\nbackground-repeat: repeat;\nbackground-size: ${geometricScale}px ${geometricScale}px;`;
              navigator.clipboard.writeText(cssRule);
              setIsCopiedGeometricCss(true);
              setTimeout(() => setIsCopiedGeometricCss(false), 2000);
            };

            const handleDownloadGeometricSvg = () => {
              const blob = new Blob([studioSvgMarkup], { type: 'image/svg+xml;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${bible.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-pattern-${selectedGeometricPattern}.svg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            };

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                {/* Large Canvas Sandbox */}
                <div className="lg:col-span-7 flex flex-col space-y-3">
                  <div
                    className="w-full min-h-[300px] rounded-2xl border relative overflow-hidden transition-all duration-300 shadow-inner flex items-center justify-center p-6"
                    style={{
                      backgroundColor:
                        geometricBgMode === 'light' ? '#f8fafc' :
                        geometricBgMode === 'dark' ? '#090d16' : primary,
                      backgroundImage: `url("${studioTileDataUrl}")`,
                      backgroundRepeat: 'repeat'
                    }}
                  >
                    <div className={`p-4 rounded-xl border backdrop-blur-md shadow-lg max-w-xs text-center space-y-1.5 ${
                      geometricBgMode === 'dark' || geometricBgMode === 'brand'
                        ? 'bg-slate-950/85 border-slate-800 text-white'
                        : 'bg-white/90 border-slate-200 text-slate-900'
                    }`}>
                      <h5 className="text-xs font-black tracking-tight font-sans">
                        {selectedTmpl?.name} Sandbox
                      </h5>
                      <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                        {selectedTmpl?.description}
                      </p>
                      <div className="pt-1 flex items-center justify-center gap-2 text-[9px] font-mono text-indigo-500 font-bold">
                        <span>Tile: {geometricScale}px</span>
                        <span>‚Ä¢</span>
                        <span>Opacity: {Math.round(geometricOpacity * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSavePatternToBible}
                      className="flex-1 min-w-[160px] py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Set as Active Brand Pattern</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyGeometricSvg}
                      className={`py-2.5 px-3 border rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600'
                      }`}
                    >
                      {isCopiedGeometricSvg ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied SVG</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Copy SVG</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyGeometricCss}
                      className={`py-2.5 px-3 border rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600'
                      }`}
                    >
                      {isCopiedGeometricCss ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied CSS</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copy CSS</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadGeometricSvg}
                      className={`py-2.5 px-3 border rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Download SVG</span>
                    </button>
                  </div>
                </div>

                {/* Fine-Tuning Controls */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4 font-sans">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                      Pattern Customization Parameters
                    </span>

                    {/* Color Role Selector */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-2">
                        Pattern Foreground Color Role
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {(['primary', 'secondary', 'accent', 'dark', 'light'] as const).map((role) => {
                          const hex =
                            role === 'primary' ? primary :
                            role === 'secondary' ? secondary :
                            role === 'accent' ? accent :
                            role === 'dark' ? darkNeutral : lightNeutral;

                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setGeometricFgRole(role)}
                              className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                                geometricFgRole === role
                                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/10'
                                  : isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="w-4 h-4 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: hex }} />
                              <span className="text-[9px] font-bold capitalize text-slate-400 truncate w-full">{role}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scale Slider */}
                    <div className={`p-3 border rounded-xl ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Tile Scale</span>
                        <span className="font-mono text-indigo-500 font-extrabold">{geometricScale}px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="96"
                        step="4"
                        value={geometricScale}
                        onChange={(e) => setGeometricScale(parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Opacity Slider */}
                    <div className={`p-3 border rounded-xl ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Pattern Opacity</span>
                        <span className="font-mono text-indigo-500 font-extrabold">{Math.round(geometricOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="1.0"
                        step="0.05"
                        value={geometricOpacity}
                        onChange={(e) => setGeometricOpacity(parseFloat(e.target.value))}
                        className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className={`p-3.5 border rounded-xl text-[11px] text-slate-400 font-sans leading-relaxed ${
                    isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/50 border-slate-200'
                  }`}>
                    <span className="font-bold text-indigo-500 block mb-0.5">Mockup Integration Active</span>
                    This geometric pattern can also be previewed and dynamically toggled over business cards, letterheads, social banners, and web landing page mockups in section 07.
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Mission-Driven Repeating Brand Pattern Visualizer & Generator */}
        <div className={`mt-8 border rounded-2xl p-6 transition-all duration-300 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  Mission-Driven Pattern Engine
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  Primary Color: {bible.colorPalette[0]?.hex || '#6366f1'}
                </span>
              </div>
              <h3 className={`text-base font-black flex items-center gap-2 font-sans tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Wand2 className="w-4 h-4 text-indigo-500" />
                Live Mission-Based Pattern Visualizer
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
                Dynamically synthesizes repeating background vector tiles derived from your brand's primary color and core mission statement.
              </p>
            </div>

            {/* Canvas Overlay Mode */}
            <div className={`flex items-center rounded-lg p-1 border text-[10px] font-sans font-bold self-start md:self-auto ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <span className="text-slate-400 px-2 text-[9px] uppercase font-bold">Canvas Mode:</span>
              <button
                id="mission-bg-mode-light-btn"
                onClick={() => setMissionPatternBgMode('light')}
                className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                  missionPatternBgMode === 'light'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                Light
              </button>
              <button
                id="mission-bg-mode-dark-btn"
                onClick={() => setMissionPatternBgMode('dark')}
                className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                  missionPatternBgMode === 'dark'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                Dark
              </button>
              <button
                id="mission-bg-mode-brand-btn"
                onClick={() => setMissionPatternBgMode('brand')}
                className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${
                  missionPatternBgMode === 'brand'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                Brand Fill
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Interactive Preview Canvas with Overlay Card */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <div
                id="mission-pattern-preview-canvas"
                className="w-full min-h-[340px] rounded-2xl border flex items-center justify-center relative overflow-hidden transition-all duration-500 p-6 shadow-inner"
                style={{
                  backgroundColor:
                    missionPatternBgMode === 'light'
                      ? '#f8fafc'
                      : missionPatternBgMode === 'dark'
                        ? '#090d16'
                        : (bible.colorPalette[0]?.hex || '#6366f1'),
                  ...getMissionPatternStyle()
                }}
              >
                {/* Floating Brand Mission Overlay Banner */}
                <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-2xl max-w-md w-full text-center space-y-2.5 transition duration-300 ${
                  missionPatternBgMode === 'dark' || missionPatternBgMode === 'brand'
                    ? 'bg-slate-950/85 border-slate-800 text-white shadow-black/50'
                    : 'bg-white/90 border-white/80 text-slate-900 shadow-slate-200/50'
                }`}>
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: bible.colorPalette[0]?.hex || '#6366f1' }}
                    />
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-500 font-sans">
                      {bible.companyName} Mission Backdrop
                    </span>
                  </div>
                  <p className="text-xs font-bold leading-relaxed font-sans italic">
                    "{bible.mission || 'Empowering people through purpose-driven design.'}"
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1 text-[9px] text-slate-400 font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      Motif: {missionPatternMotif}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      Tile: {missionPatternTileSize}px
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-2.5 right-3 px-2.5 py-1 rounded-lg border text-[9px] font-bold font-mono tracking-wider backdrop-blur-md bg-slate-900/80 text-white border-white/10 pointer-events-none">
                  LIVE REPEATING SVG TILE
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  id="copy-mission-svg-btn"
                  onClick={handleCopyMissionPatternSvg}
                  className={`flex-1 min-w-[140px] py-2 px-3 border rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition duration-150 cursor-pointer active:scale-95 ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white hover:border-indigo-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600 shadow-2xs'
                  }`}
                >
                  {isCopiedMissionPatternSvg ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied SVG!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Copy Pattern SVG</span>
                    </>
                  )}
                </button>

                <button
                  id="copy-mission-css-btn"
                  onClick={handleCopyMissionPatternCss}
                  className={`flex-1 min-w-[140px] py-2 px-3 border rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition duration-150 cursor-pointer active:scale-95 ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white hover:border-indigo-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600 shadow-2xs'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copy CSS Rule</span>
                </button>

                <button
                  id="download-mission-svg-btn"
                  onClick={handleDownloadMissionPatternSvg}
                  className={`py-2 px-3 border rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition duration-150 cursor-pointer active:scale-95 ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white hover:border-indigo-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600 shadow-2xs'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download SVG</span>
                </button>
              </div>
            </div>

            {/* Pattern Tuning & Parameters Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans block">
                  Pattern Generator Parameters
                </span>

                {/* Motif Choice */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 dark:text-slate-300 block mb-1.5 font-sans">
                    Geometric Motif Style
                  </label>
                  <select
                    id="mission-pattern-motif-select"
                    value={missionPatternMotif}
                    onChange={(e) => setMissionPatternMotif(e.target.value as any)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-bold font-sans transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${
                      isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="mission-grid">Mission Grid & Cross Nodes</option>
                    <option value="diamond-emblem">Interlocking Diamond Emblem</option>
                    <option value="radiant-rings">Concentric Radiant Rings</option>
                    <option value="organic-waves">Organic Mission Wave Lines</option>
                    <option value="typography-geometry">Rotated Geometric Mesh</option>
                  </select>
                </div>

                {/* Tile Size Slider */}
                <div className={`p-3 border rounded-xl ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5 font-sans">
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Tile Scale Size</span>
                    <span className="font-mono text-indigo-500 font-extrabold">{missionPatternTileSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={32}
                    max={128}
                    step={4}
                    value={missionPatternTileSize}
                    onChange={(e) => setMissionPatternTileSize(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                    <span>Dense (32px)</span>
                    <span>Spacious (128px)</span>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className={`p-3 border rounded-xl ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5 font-sans">
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Vector Stroke Opacity</span>
                    <span className="font-mono text-indigo-500 font-extrabold">{Math.round(missionPatternOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.15}
                    max={1.0}
                    step={0.05}
                    value={missionPatternOpacity}
                    onChange={(e) => setMissionPatternOpacity(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                    <span>Subtle (15%)</span>
                    <span>High Contrast (100%)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Mission Hash info box */}
              <div className={`p-3.5 border rounded-xl text-xs font-sans leading-relaxed ${
                isDark ? 'bg-indigo-950/20 border-indigo-900/40 text-slate-300' : 'bg-indigo-50/60 border-indigo-100 text-slate-700'
              }`}>
                <div className="flex items-center gap-1.5 font-extrabold text-indigo-500 text-[10px] uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Mission-Algorithmic Vector Binding
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  The primary color <span className="font-mono text-indigo-500 font-bold">{bible.colorPalette[0]?.hex || '#6366f1'}</span> establishes vector stroke tints, while the length and character tokens of your mission statement calculate stroke weights, rotation angles, and node ring radiuses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Benchmarking Section */}
      <div
        id="competitive-benchmarking-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 mt-8 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600">
                Competitive Intelligence
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Search Grounded
              </span>
            </div>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Target className="w-5 h-5 text-indigo-600" />
              <span>Competitive Benchmarking & Strategic Differentiation</span>
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed max-w-3xl">
              Input 2-3 competitor URLs. Powered by Gemini with live Google Search Grounding, we inspect their visual aesthetics, color palettes, and positioning to reveal actionable strategies for <span className="font-bold text-indigo-500">{bible.companyName}</span> to stand out.
            </p>
          </div>

          <button
            id="run-competitive-benchmark-btn"
            onClick={handleRunCompetitiveBenchmark}
            disabled={isBenchmarking || competitorInputUrls.length === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-black font-sans flex items-center justify-center gap-2 shadow-md transition duration-200 cursor-pointer active:scale-95 shrink-0 ${
              isBenchmarking
                ? 'bg-indigo-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            }`}
          >
            {isBenchmarking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching Google & Benchmarking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run Grounded Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Input & Tags Form */}
        <div className={`p-5 rounded-2xl border mb-6 ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <label className="text-xs font-bold block mb-2 font-sans dark:text-slate-200">
            Competitor Brand URLs or Domains (Max 3)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5 items-center mb-3">
            <div className="relative flex-1 w-full">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={newCompetitorUrl}
                onChange={(e) => setNewCompetitorUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCompetitorUrl();
                  }
                }}
                placeholder="e.g. stripe.com, linear.app, notion.so"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
            <button
              onClick={handleAddCompetitorUrl}
              disabled={competitorInputUrls.length >= 3 || !newCompetitorUrl.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition shrink-0 w-full sm:w-auto"
            >
              Add Competitor
            </button>
          </div>

          {/* Active Competitors Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1">
              Active Target Set:
            </span>
            {competitorInputUrls.map((url, idx) => (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono flex items-center gap-2 ${
                  isDark ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}
              >
                <span>{url}</span>
                <button
                  onClick={() => handleRemoveCompetitorUrl(idx)}
                  className="hover:text-rose-500 transition cursor-pointer p-0.5 rounded-full"
                  title="Remove competitor"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Benchmarking Output Display */}
        {benchmarkData && (
          <div className="space-y-8 animate-fadeIn">
            {/* Competitors Visual Analysis Grid */}
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Search className="w-4 h-4 text-indigo-500" />
                1. Competitor Visual Aesthetics & Brand Signals
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {benchmarkData.competitors?.map((comp: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between transition-all duration-300 ${
                      isDark ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700' : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                        <div>
                          <h4 className="font-extrabold text-sm text-indigo-500 flex items-center gap-1.5">
                            {comp.name}
                          </h4>
                          <a
                            href={comp.url?.startsWith('http') ? comp.url : `https://${comp.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-slate-400 font-mono hover:underline flex items-center gap-1"
                          >
                            <span>{comp.url}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 font-mono">
                          Target #{idx + 1}
                        </span>
                      </div>

                      {/* Visual Aesthetic Summary */}
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          Visual Aesthetic Style
                        </span>
                        <p className="text-xs font-medium leading-relaxed dark:text-slate-200">
                          {comp.visualAesthetic}
                        </p>
                      </div>

                      {/* Extracted Swatches */}
                      {comp.dominantColors && comp.dominantColors.length > 0 && (
                        <div>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Inferred Dominant Palette
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            {comp.dominantColors.map((hex: string, hIdx: number) => (
                              <div key={hIdx} className="flex items-center gap-1">
                                <span
                                  className="w-4 h-4 rounded-md border border-black/10 shadow-xs shrink-0"
                                  style={{ backgroundColor: hex }}
                                  title={hex}
                                />
                                <span className="text-[9px] font-mono text-slate-400">{hex}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Typography Vibe */}
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          Typography Vibe
                        </span>
                        <p className="text-xs text-slate-300 font-mono bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                          {comp.typographyVibe}
                        </p>
                      </div>

                      {/* Market Positioning */}
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          Value Proposition Tone
                        </span>
                        <p className="text-xs italic text-slate-400 leading-relaxed">
                          "{comp.brandPositioning}"
                        </p>
                      </div>
                    </div>

                    {/* Strengths & Vulnerabilities */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-500 block mb-1">
                          Visual Strengths
                        </span>
                        <ul className="space-y-1">
                          {comp.strengths?.map((str: string, sIdx: number) => (
                            <li key={sIdx} className="text-[10px] text-slate-300 flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-1">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-400 block mb-1">
                          Design Vulnerabilities / Gaps
                        </span>
                        <ul className="space-y-1">
                          {comp.vulnerabilities?.map((vuln: string, vIdx: number) => (
                            <li key={vIdx} className="text-[10px] text-slate-400 flex items-start gap-1">
                              <XCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                              <span>{vuln}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Differentiation Matrix */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-indigo-50/40 border-indigo-100'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-500">
                    Differentiation Strategy Engine
                  </span>
                  <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    How {bible.companyName} Wins Visual & Market Differentiation
                  </h3>
                </div>
              </div>

              {/* Overall White Space Opportunity */}
              <div className={`p-4 rounded-2xl border mb-6 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-indigo-100'
              }`}>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 block mb-1">
                  Market White-Space Opportunity
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {benchmarkData.differentiatingStrategy?.overallOpportunity}
                </p>
              </div>

              {/* 3 Strategic Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Color Differentiation */}
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                    <Palette className="w-4 h-4" />
                    <span>Color Positioning</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {benchmarkData.differentiatingStrategy?.colorDifferentiation}
                  </p>
                </div>

                {/* Typography Differentiation */}
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                    <Type className="w-4 h-4" />
                    <span>Typography Pairings</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {benchmarkData.differentiatingStrategy?.typographyDifferentiation}
                  </p>
                </div>

                {/* Voice & Positioning */}
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Volume2 className="w-4 h-4" />
                    <span>Voice & Tone Clarity</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {benchmarkData.differentiatingStrategy?.voiceAndPositioning}
                  </p>
                </div>
              </div>

              {/* Actionable Pillars List */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                  Actionable Strategic Differentiation Pillars
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {benchmarkData.differentiatingStrategy?.actionablePillars?.map((pillar: any, pIdx: number) => (
                    <div
                      key={pIdx}
                      className={`p-4 rounded-2xl border space-y-2 relative overflow-hidden ${
                        isDark ? 'bg-slate-900 border-indigo-900/50' : 'bg-white border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {pIdx + 1}
                        </span>
                        <h4 className="font-extrabold text-xs text-indigo-400 leading-snug">
                          {pillar.pillarTitle}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">
                        {pillar.strategicAdvice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color Palette Section */}
      <div
        id="color-palette-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">04 / Color System</span>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Palette className="w-5 h-5 text-indigo-600" />
              <span>5-Color Hex Design Palette</span>
              <button
                id="palette-local-randomize-btn"
                onClick={handleRandomizeOrSwapPalette}
                className={`p-1.5 rounded-lg border transition duration-200 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center gap-1 group/rand`}
                title="Shuffle non-primary colors (keeps primary logo color consistent)"
              >
                <Shuffle className="w-3.5 h-3.5 text-indigo-500 group-hover/rand:rotate-45 transition-transform duration-300" />
                <span className="text-[9px] font-sans font-bold text-slate-400 group-hover/rand:text-indigo-500 hidden sm:inline">Swap Roles</span>
              </button>
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
              Click on any color block below to copy its exact hex code. Incorporate these into web designs, slides, or graphics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className={`flex rounded-full p-0.5 border text-[11px] font-sans font-bold ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setShuffleStyle('shades')}
                className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  shuffleStyle === 'shades'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Alternative Shades
              </button>
              <button
                onClick={() => setShuffleStyle('complementary')}
                className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  shuffleStyle === 'complementary'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Complementary
              </button>
            </div>

            <button
              id="regenerate-palette-ai-btn"
              onClick={() => handleRegenerateAiPalette()}
              disabled={isRegeneratingAiPalette}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white rounded-full text-xs font-black flex items-center gap-2 transition duration-300 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer border border-indigo-400/30 group/regen"
              title="AI Consultant: Generate a fresh 5-color palette based on your original company mission"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isRegeneratingAiPalette ? 'animate-spin' : 'group-hover/regen:rotate-12 transition-transform'}`} />
              <span>{isRegeneratingAiPalette ? 'Analyzing Mission...' : 'Regenerate Palette'}</span>
            </button>

            <button
              onClick={handleShufflePalette}
              disabled={isShuffling}
              className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-full text-xs font-extrabold flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-500/10 active:scale-95 cursor-pointer`}
            >
              <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
              {isShuffling ? 'Shuffling...' : 'Shuffle Palette'}
            </button>

            <button
              id="open-a11y-auditor-header-btn"
              onClick={() => setShowA11yAuditorModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-extrabold flex items-center gap-2 transition duration-200 shadow-md shadow-emerald-500/10 active:scale-95 cursor-pointer"
              title="Run WCAG 2.1 Contrast Audit across all brand color pairings"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accessibility Auditor</span>
            </button>
          </div>
        </div>

        {/* Developer Integration & Bulk Copy Bar */}
        <div className={`p-3.5 border rounded-2xl mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-bold font-sans text-slate-300 dark:text-slate-200">
              Developer Clipboard Integrations:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="copy-palette-code-primary-btn"
              onClick={() => setShowPaletteCodeModal(true)}
              className="px-3.5 py-1.5 text-[10px] font-black rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="Open full-screen developer code exporter with CSS, Tailwind, & JSON formats"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Copy Palette Code</span>
            </button>
            <button
              id="copy-css-vars-btn"
              onClick={handleCopyCssVariables}
              className={`px-3 py-1.5 text-[10px] font-extrabold rounded-full border transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white hover:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs'
              }`}
            >
              <FileText className="w-3 h-3 text-emerald-500" />
              <span>CSS Variables</span>
            </button>
            <button
              id="copy-tailwind-config-btn"
              onClick={handleCopyTailwindConfig}
              className={`px-3 py-1.5 text-[10px] font-extrabold rounded-full border transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white hover:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs'
              }`}
            >
              <FileJson className="w-3 h-3 text-amber-500" />
              <span>Tailwind Theme</span>
            </button>
            <button
              id="copy-json-palette-btn"
              onClick={handleCopyJsonPalette}
              className={`px-3 py-1.5 text-[10px] font-extrabold rounded-full border transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white hover:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs'
              }`}
            >
              <FileJson className="w-3 h-3 text-indigo-400" />
              <span>JSON Object</span>
            </button>
            <button
              id="copy-all-hex-btn"
              onClick={handleCopyAllHexCodes}
              className={`px-3 py-1.5 text-[10px] font-extrabold rounded-full border transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white hover:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs'
              }`}
            >
              <Copy className="w-3 h-3 text-indigo-500" />
              <span>HEX Array</span>
            </button>
          </div>
        </div>

        {/* Copy Palette Code Modal */}
        {showPaletteCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 relative overflow-hidden font-sans ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight font-sans">
                      Copy Palette Code Exporter
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Export your 5-color palette hex codes formatted for CSS, Tailwind, JSON, or raw arrays.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaletteCodeModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Format Selector Tabs */}
              <div className="my-5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 font-sans">
                  Select Target Code Format:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedPaletteFormat('css')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      selectedPaletteFormat === 'css'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>CSS Variables</span>
                  </button>
                  <button
                    onClick={() => setSelectedPaletteFormat('tailwind')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      selectedPaletteFormat === 'tailwind'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <FileJson className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tailwind Config</span>
                  </button>
                  <button
                    onClick={() => setSelectedPaletteFormat('json')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      selectedPaletteFormat === 'json'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <FileJson className="w-3.5 h-3.5 text-indigo-400" />
                    <span>JSON Object</span>
                  </button>
                  <button
                    onClick={() => setSelectedPaletteFormat('hex')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      selectedPaletteFormat === 'hex'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>HEX Array</span>
                  </button>
                </div>
              </div>

              {/* Code Live Preview Block */}
              <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-indigo-300 overflow-x-auto max-h-60 shadow-inner">
                <pre className="whitespace-pre">
                  {getFormattedPaletteCode(selectedPaletteFormat)}
                </pre>
              </div>

              {/* Color Swatch Indicators */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">
                    Palette Swatches:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {bible.colorPalette.map((c, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name}: ${c.hex}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPaletteCodeModal(false)}
                    className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleCopyFormattedPaletteCode(selectedPaletteFormat)}
                    className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-md"
                  >
                    {isPaletteCodeCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Code Snippet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Color Blocks */}
        <motion.div
          key={`palette-grid-${bible.companyName}-${bible.colorPalette.map(c => c.hex).join('-')}`}
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          {bible.colorPalette.map((color, colorIdx) => {
            const isWhiteOrLight = ['ffffff', 'f8fafc', 'f1f5f9', 'f9fafb', 'ffffff'].includes(color.hex.toLowerCase().replace('#', ''));
            const isPrimary = (color.role || '').toLowerCase().trim() === 'primary' || (
              !bible.colorPalette.some(c => (c.role || '').toLowerCase().trim() === 'primary') && colorIdx === 0
            );
            return (
              <motion.div
                variants={staggerItemVariants}
                whileHover={{ y: -8, scale: 1.04, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
                whileTap={{ scale: 0.97 }}
                id={`color-block-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                key={color.hex + colorIdx}
                onClick={() => copyToClipboard(color.hex, color.name)}
                className="group border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/15 dark:hover:shadow-indigo-500/25 hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[190px]"
                style={{ backgroundColor: color.hex }}
              >
                {/* Visual feedback overlay */}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />

                {/* Color detail text box */}
                <div className={`p-3 rounded-xl backdrop-blur-md border shadow-sm z-10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md ${
                  isWhiteOrLight || color.role.toLowerCase().includes('light')
                    ? 'bg-black/10 border-black/5 text-slate-900'
                    : 'bg-white/90 border-white/20 text-slate-800'
                }`}>
                  <div className="flex justify-between items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-60 flex items-center gap-1">
                      {color.role}
                      {isPrimary && (
                        <span className="text-[7px] bg-indigo-600/10 text-indigo-500 font-extrabold px-1 py-0.5 rounded border border-indigo-500/20 whitespace-nowrap">
                          Logo Solid
                        </span>
                      )}
                    </span>
                    {copiedHex === color.hex ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-40 group-hover:opacity-100 transition shrink-0" />
                    )}
                  </div>
                  <h3 className="text-xs font-black mt-1 truncate">{color.name}</h3>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="text-[10px] font-mono font-bold tracking-wide">{color.hex}</span>
                    {(() => {
                      const a11y = getAccessibilityScore(color.hex);
                      return (
                        <span
                          className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${a11y.badgeStyle}`}
                          title={`Max WCAG Contrast Ratio: ${a11y.bestRatio.toFixed(1)}:1 (${a11y.contrastWhite >= a11y.contrastDark ? 'vs White' : 'vs Slate Dark'})`}
                        >
                          {a11y.bestRatio.toFixed(1)}:1 {a11y.rating}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Explicit Copy to Clipboard Button */}
                  <button
                    id={`copy-btn-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(color.hex, color.name);
                    }}
                    className={`mt-2.5 w-full py-1.5 px-2 rounded-lg text-[10px] font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                      copiedHex === color.hex
                        ? 'bg-emerald-600 text-white font-extrabold'
                        : 'bg-slate-900/80 hover:bg-slate-900 text-white border border-white/10'
                    }`}
                  >
                    {copiedHex === color.hex ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-indigo-300" />
                        <span>Copy HEX</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Usage instruction line */}
                <p className={`text-[9px] leading-snug mt-3 font-sans font-semibold line-clamp-3 z-10 p-2.5 rounded-lg ${
                  isWhiteOrLight || color.role.toLowerCase().includes('light')
                    ? 'bg-slate-900/10 text-slate-800'
                    : 'bg-white/30 text-white drop-shadow-sm'
                }`}>
                  {color.usageNote}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Dynamic Divider */}
        <div className={`my-8 border-t transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-150'}`} />

        {/* Accessibility Contrast Analyzer & Visual Contrast Sandbox Section */}
        <div id="brand-contrast-sandbox" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] font-extrabold bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-full uppercase tracking-wider font-sans border border-indigo-500/20">
                  WCAG 2.1 Contrast Sandbox
                </span>
                <span className="text-[9px] font-extrabold bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full uppercase tracking-wider font-sans border border-emerald-500/20">
                  Live Preview Stage
                </span>
              </div>
              <h3 className={`text-base font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                <Activity className="w-5 h-5 text-indigo-500" />
                Color Contrast Sandbox & Readability Tester
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
                Live-preview custom headlines, paragraph copy, buttons, and real UI components on selected brand colors to ensure maximum legibility and WCAG accessibility compliance before finalizing.
              </p>
            </div>

            {/* Top Toolbar Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                id="contrast-swap-btn"
                onClick={handleSwapContrastColors}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white hover:border-indigo-500'
                    : 'bg-white border-slate-250 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs'
                }`}
                title="Swap Background and Text Colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                <span>Swap Colors</span>
              </button>

              <button
                id="contrast-auto-max-btn"
                onClick={handleSuggestMaxContrast}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300 hover:text-white hover:border-indigo-500'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-2xs'
                }`}
                title="Auto-select palette color with highest contrast against current background"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Auto-Max Contrast</span>
              </button>

              <button
                id="contrast-run-a11y-audit-btn"
                onClick={() => setShowA11yAuditorModal(true)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300 hover:text-white hover:border-emerald-500'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-2xs'
                }`}
                title="Evaluate contrast ratios and WCAG AA/AAA compliance with actionable fix suggestions"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Accessibility Auditor</span>
              </button>

              <button
                id="contrast-fullscreen-btn"
                onClick={() => setIsSandboxFullscreen(true)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white hover:border-indigo-500'
                    : 'bg-white border-slate-250 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs'
                }`}
                title="Expand into full-screen sandbox modal"
              >
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Fullscreen</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Control Panel Column */}
            <div className="lg:col-span-5 space-y-5 text-left">
              {/* Color Palette Choice Selectors */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                {/* Background Selector */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-sans">
                      1. Background Color
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={contrastBg.startsWith('#') ? contrastBg : `#${contrastBg}`}
                        onChange={(e) => setContrastBg(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                        title="Custom Hex Picker"
                      />
                      <span className="text-[10px] font-mono font-bold text-indigo-400">{contrastBg.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {bible.colorPalette.map((color) => (
                      <button
                        key={`bg-${color.hex}`}
                        onClick={() => setContrastBg(color.hex)}
                        className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold font-sans flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer ${
                          contrastBg.toLowerCase() === color.hex.toLowerCase()
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/10 text-indigo-500'
                            : isDark
                              ? 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-300'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                        <span>{color.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setContrastBg('#ffffff')}
                      className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold font-sans flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer ${
                        contrastBg.toLowerCase() === '#ffffff'
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/10 text-indigo-500'
                          : isDark ? 'border-slate-800 bg-slate-950/50 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-slate-300 bg-white shrink-0" />
                      <span>White</span>
                    </button>
                    <button
                      onClick={() => setContrastBg('#0f172a')}
                      className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold font-sans flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer ${
                        contrastBg.toLowerCase() === '#0f172a'
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/10 text-indigo-500'
                          : isDark ? 'border-slate-800 bg-slate-950/50 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-slate-800 bg-[#0f172a] shrink-0" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Text Color Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-sans">
                      2. Text / Foreground Color
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={contrastText.startsWith('#') ? contrastText : `#${contrastText}`}
                        onChange={(e) => setContrastText(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                        title="Custom Hex Picker"
                      />
                      <span className="text-[10px] font-mono font-bold text-indigo-400">{contrastText.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {bible.colorPalette.map((color) => (
                      <button
                        key={`text-${color.hex}`}
                        onClick={() => setContrastText(color.hex)}
                        className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold font-sans flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer ${
                          contrastText.toLowerCase() === color.hex.toLowerCase()
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/10 text-indigo-500'
                            : isDark
                              ? 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-300'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                        <span>{color.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setContrastText('#ffffff')}
                      className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold font-sans flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer ${
                        contrastText.toLowerCase() === '#ffffff'
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/10 text-indigo-500'
                          : isDark ? 'border-slate-800 bg-slate-950/50 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-slate-300 bg-white shrink-0" />
                      <span>White</span>
                    </button>
                    <button
                      onClick={() => setContrastText('#0f172a')}
                      className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold font-sans flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer ${
                        contrastText.toLowerCase() === '#0f172a'
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/10 text-indigo-500'
                          : isDark ? 'border-slate-800 bg-slate-950/50 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-slate-800 bg-[#0f172a] shrink-0" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Editable Text Customizer & Presets */}
              <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-sans flex items-center gap-1">
                    <Type className="w-3 h-3 text-indigo-500" /> Live Text Customizer
                  </span>
                  {/* Preset Pills */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleApplySandboxPreset('hero')}
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 cursor-pointer"
                    >
                      Hero
                    </button>
                    <button
                      onClick={() => handleApplySandboxPreset('cta')}
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 cursor-pointer"
                    >
                      CTA
                    </button>
                    <button
                      onClick={() => handleApplySandboxPreset('alert')}
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 cursor-pointer"
                    >
                      Notice
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Headline Text</label>
                  <input
                    type="text"
                    value={sandboxCustomHeading}
                    onChange={(e) => setSandboxCustomHeading(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Paragraph Body Copy</label>
                  <textarea
                    rows={2}
                    value={sandboxCustomBody}
                    onChange={(e) => setSandboxCustomBody(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                    }`}
                  />
                </div>

                {/* Typography Tuning Sliders */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span>Body Font Size</span>
                      <span className="text-indigo-400 font-mono">{sandboxFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={28}
                      value={sandboxFontSize}
                      onChange={(e) => setSandboxFontSize(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span>Font Weight</span>
                      <span className="text-indigo-400 font-mono capitalize">{sandboxFontWeight}</span>
                    </div>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-950">
                      {(['normal', 'medium', 'bold', 'extrabold'] as const).map((w) => (
                        <button
                          key={w}
                          onClick={() => setSandboxFontWeight(w)}
                          className={`flex-1 text-[9px] font-bold py-0.5 rounded capitalize transition cursor-pointer ${
                            sandboxFontWeight === w ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {w === 'extrabold' ? 'Black' : w.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel Column: Live Rendering Stage & Score Board */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              {/* Component View Stage Tabs */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                <span className="text-[10px] uppercase font-black text-slate-400 shrink-0 font-sans">
                  Component View:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSandboxComponentView('hero')}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      sandboxComponentView === 'hero'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Hero Section</span>
                  </button>
                  <button
                    onClick={() => setSandboxComponentView('card')}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      sandboxComponentView === 'card'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>UI Card</span>
                  </button>
                  <button
                    onClick={() => setSandboxComponentView('form')}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      sandboxComponentView === 'form'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Form Input</span>
                  </button>
                  <button
                    onClick={() => setSandboxComponentView('alert')}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      sandboxComponentView === 'alert'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Alert Banner</span>
                  </button>
                  <button
                    onClick={() => setSandboxComponentView('nav')}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      sandboxComponentView === 'nav'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Nav Bar</span>
                  </button>
                </div>
              </div>

              {/* LIVE RENDERING STAGE CANVAS */}
              <div
                className="w-full rounded-2xl p-6 sm:p-8 border flex flex-col justify-between min-h-[310px] transition-all duration-300 relative overflow-hidden shadow-inner text-left"
                style={{ backgroundColor: contrastBg }}
              >
                {/* Visual marker badge */}
                <div
                  className="absolute top-4 right-4 px-2.5 py-1 rounded-xl text-[9px] font-black font-mono uppercase tracking-wider backdrop-blur-md opacity-85 shadow-sm flex items-center gap-1.5"
                  style={{ color: contrastText, backgroundColor: `${contrastText}15`, border: `1px solid ${contrastText}30` }}
                >
                  <Eye className="w-3 h-3" />
                  <span>Live Sandbox Stage</span>
                </div>

                {/* Hero View Render */}
                {sandboxComponentView === 'hero' && (
                  <div className="space-y-4 pr-8 my-auto">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border"
                      style={{
                        borderColor: `${contrastText}40`,
                        color: contrastText,
                        backgroundColor: `${contrastText}10`
                      }}
                    >
                      {bible.companyName || 'Brand Mark'} ‚Ä¢ Feature Spotlight
                    </span>
                    <h1
                      className="text-2xl sm:text-3xl font-black tracking-tight leading-snug"
                      style={{
                        color: contrastText,
                        fontFamily: `'${bible.typography.headerFont}', serif`
                      }}
                    >
                      {sandboxCustomHeading}
                    </h1>
                    <p
                      className="leading-relaxed opacity-90 max-w-xl"
                      style={{
                        color: contrastText,
                        fontSize: `${sandboxFontSize}px`,
                        fontWeight: sandboxFontWeight === 'normal' ? 400 : sandboxFontWeight === 'medium' ? 500 : sandboxFontWeight === 'bold' ? 700 : 900,
                        fontFamily: `'${bible.typography.bodyFont}', sans-serif`
                      }}
                    >
                      {sandboxCustomBody}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        className="px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
                        style={{
                          backgroundColor: contrastText,
                          color: contrastBg
                        }}
                      >
                        {sandboxCustomButtonText}
                      </button>
                      <button
                        className="px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer"
                        style={{
                          borderColor: `${contrastText}40`,
                          color: contrastText
                        }}
                      >
                        Secondary Link
                      </button>
                    </div>
                  </div>
                )}

                {/* UI Card View Render */}
                {sandboxComponentView === 'card' && (
                  <div className="my-auto max-w-md w-full">
                    <div
                      className="p-6 rounded-2xl border shadow-xl space-y-3"
                      style={{
                        backgroundColor: `${contrastText}08`,
                        borderColor: `${contrastText}25`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider"
                          style={{ backgroundColor: `${contrastText}20`, color: contrastText }}
                        >
                          Card Module
                        </span>
                        <span className="text-[10px] font-mono opacity-60" style={{ color: contrastText }}>
                          {getContrastRatio(contrastBg, contrastText).toFixed(1)}:1
                        </span>
                      </div>
                      <h3
                        className="text-xl font-black"
                        style={{ color: contrastText, fontFamily: `'${bible.typography.headerFont}', serif` }}
                      >
                        {sandboxCustomHeading}
                      </h3>
                      <p
                        className="leading-relaxed opacity-90 text-xs"
                        style={{
                          color: contrastText,
                          fontSize: `${sandboxFontSize}px`,
                          fontFamily: `'${bible.typography.bodyFont}', sans-serif`
                        }}
                      >
                        {sandboxCustomBody}
                      </p>
                      <button
                        className="w-full py-2.5 rounded-xl text-xs font-black transition cursor-pointer"
                        style={{ backgroundColor: contrastText, color: contrastBg }}
                      >
                        {sandboxCustomButtonText}
                      </button>
                    </div>
                  </div>
                )}

                {/* Form Input View Render */}
                {sandboxComponentView === 'form' && (
                  <div className="my-auto max-w-md w-full space-y-4">
                    <h3
                      className="text-lg font-black"
                      style={{ color: contrastText, fontFamily: `'${bible.typography.headerFont}', serif` }}
                    >
                      {sandboxCustomHeading}
                    </h3>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold block" style={{ color: contrastText }}>
                        User Email Address
                      </label>
                      <div
                        className="w-full px-4 py-2.5 rounded-xl border flex items-center justify-between"
                        style={{
                          backgroundColor: `${contrastText}10`,
                          borderColor: `${contrastText}35`,
                          color: contrastText
                        }}
                      >
                        <span className="text-xs opacity-70">alex@{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
                        <span className="text-[10px] font-bold uppercase" style={{ color: contrastText }}>Valid</span>
                      </div>
                      <p className="text-[10px] opacity-70" style={{ color: contrastText }}>
                        We will never share your personal details.
                      </p>
                    </div>
                    <button
                      className="px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                      style={{ backgroundColor: contrastText, color: contrastBg }}
                    >
                      {sandboxCustomButtonText}
                    </button>
                  </div>
                )}

                {/* Alert View Render */}
                {sandboxComponentView === 'alert' && (
                  <div className="my-auto w-full">
                    <div
                      className="p-5 rounded-2xl border flex items-start gap-3.5 shadow-lg"
                      style={{
                        backgroundColor: `${contrastText}10`,
                        borderColor: `${contrastText}30`
                      }}
                    >
                      <div
                        className="p-2 rounded-xl shrink-0"
                        style={{ backgroundColor: contrastText, color: contrastBg }}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4
                          className="text-sm font-bold"
                          style={{ color: contrastText, fontFamily: `'${bible.typography.headerFont}', serif` }}
                        >
                          {sandboxCustomHeading}
                        </h4>
                        <p
                          className="text-xs leading-relaxed opacity-90"
                          style={{ color: contrastText, fontFamily: `'${bible.typography.bodyFont}', sans-serif` }}
                        >
                          {sandboxCustomBody}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nav Bar View Render */}
                {sandboxComponentView === 'nav' && (
                  <div className="my-auto w-full">
                    <div
                      className="p-4 rounded-2xl border flex items-center justify-between shadow-md"
                      style={{
                        backgroundColor: `${contrastText}08`,
                        borderColor: `${contrastText}20`
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs"
                          style={{ backgroundColor: contrastText, color: contrastBg }}
                        >
                          {bible.companyName[0] || 'B'}
                        </span>
                        <span
                          className="font-black text-sm"
                          style={{ color: contrastText, fontFamily: `'${bible.typography.headerFont}', serif` }}
                        >
                          {bible.companyName}
                        </span>
                      </div>

                      <div className="hidden sm:flex items-center gap-4 text-xs font-bold" style={{ color: contrastText }}>
                        <span>Overview</span>
                        <span className="underline font-black">Features</span>
                        <span>Docs</span>
                        <span>Pricing</span>
                      </div>

                      <button
                        className="px-3 py-1.5 rounded-lg text-xs font-black"
                        style={{ backgroundColor: contrastText, color: contrastBg }}
                      >
                        {sandboxCustomButtonText}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* LIVE SCORE & COMPLIANCE VERDICT BAR */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left big ratio */}
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block">
                        Contrast Ratio
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-indigo-500 tracking-tight font-mono">
                          {getContrastRatio(contrastBg, contrastText).toFixed(2)}:1
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getAccessibilityScore(contrastBg).badgeStyle}`}>
                          {getAccessibilityScore(contrastBg).rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* WCAG Compliance Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 sm:max-w-md">
                    <div className={`p-2 rounded-xl border text-left ${
                      getContrastRatio(contrastBg, contrastText) >= 4.5
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase">Body (&lt;18px)</span>
                        {getContrastRatio(contrastBg, contrastText) >= 4.5 ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[10px] font-black">{getContrastRatio(contrastBg, contrastText) >= 4.5 ? 'AA Pass' : 'Fail (<4.5)'}</span>
                    </div>

                    <div className={`p-2 rounded-xl border text-left ${
                      getContrastRatio(contrastBg, contrastText) >= 3.0
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase">Title (&gt;18px)</span>
                        {getContrastRatio(contrastBg, contrastText) >= 3.0 ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[10px] font-black">{getContrastRatio(contrastBg, contrastText) >= 3.0 ? 'AA Pass' : 'Fail (<3.0)'}</span>
                    </div>

                    <div className={`p-2 rounded-xl border text-left col-span-2 sm:col-span-1 ${
                      getContrastRatio(contrastBg, contrastText) >= 7.0
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase">AAA Enhanced</span>
                        {getContrastRatio(contrastBg, contrastText) >= 7.0 ? <CheckCircle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[10px] font-black">{getContrastRatio(contrastBg, contrastText) >= 7.0 ? 'AAA Pass' : 'Standard AA'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FULLSCREEN SANDBOX FOCUS MODAL */}
          {isSandboxFullscreen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
              <div className={`w-full max-w-5xl rounded-3xl border shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight font-sans">
                        Full-Screen Contrast Sandbox Stage
                      </h3>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        Interactive presentation canvas for evaluating brand color pair legibility and WCAG 2.1 standards.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSandboxFullscreen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Expanded Stage in Modal */}
                <div
                  className="w-full rounded-3xl p-8 sm:p-12 border min-h-[400px] flex flex-col justify-between shadow-2xl relative overflow-hidden text-left"
                  style={{ backgroundColor: contrastBg }}
                >
                  <div className="space-y-6 pr-12 my-auto">
                    <span
                      className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border"
                      style={{ borderColor: `${contrastText}40`, color: contrastText, backgroundColor: `${contrastText}10` }}
                    >
                      {bible.companyName} Brand Spec ‚Ä¢ Fullscreen Stage
                    </span>
                    <h1
                      className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
                      style={{ color: contrastText, fontFamily: `'${bible.typography.headerFont}', serif` }}
                    >
                      {sandboxCustomHeading}
                    </h1>
                    <p
                      className="text-base sm:text-lg leading-relaxed opacity-90 max-w-3xl"
                      style={{ color: contrastText, fontFamily: `'${bible.typography.bodyFont}', sans-serif` }}
                    >
                      {sandboxCustomBody}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      <button
                        className="px-6 py-3 rounded-2xl text-sm font-black shadow-xl transition active:scale-95 cursor-pointer"
                        style={{ backgroundColor: contrastText, color: contrastBg }}
                      >
                        {sandboxCustomButtonText}
                      </button>
                      <span className="text-xs font-mono font-bold opacity-75" style={{ color: contrastText }}>
                        Contrast Ratio: {getContrastRatio(contrastBg, contrastText).toFixed(2)}:1 ({getAccessibilityScore(contrastBg).rating})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsSandboxFullscreen(false)}
                    className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Done Testing
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5-Color Pairwise Accessibility Calculator */}
          <div className={`p-6 border rounded-2xl font-sans transition-all duration-300 text-left ${
            isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/30 border-slate-250/80'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-4 transition-colors duration-300 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-black flex items-center gap-1.5 transition-colors duration-300 dark:text-white">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  5-Color Palette Pairwise Contrast Grid
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-xl font-sans">
                  Comprehensive audit of all 20 combinations strictly between your generated 5-color palette. Discover which colors pair together naturally. Click any cell to test it in the preview above.
                </p>
              </div>

              {/* View Selector Tabs */}
              <div className={`flex rounded-lg p-0.5 border text-[10px] font-sans font-bold shrink-0 self-start sm:self-center ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <button
                  onClick={() => setPairwiseTab('matrix')}
                  className={`px-3 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                    pairwiseTab === 'matrix'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-450 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Interactive Matrix
                </button>
                <button
                  onClick={() => setPairwiseTab('list')}
                  className={`px-3 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                    pairwiseTab === 'list'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-450 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Ranked Pairwise List
                </button>
              </div>
            </div>

            {pairwiseTab === 'matrix' ? (
              /* Interactive Matrix Mode */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="p-2.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 w-[140px] font-sans">
                        Text \ Background
                      </th>
                      {bible.colorPalette.map((col, idx) => (
                        <th key={`col-h-${idx}`} className="p-2.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 text-center font-sans">
                          <div className="flex flex-col items-center gap-1">
                            <span className="w-4 h-4 rounded-full border border-black/10 shadow-sm shrink-0" style={{ backgroundColor: col.hex }} />
                            <span className="max-w-[80px] truncate text-center">{col.name}</span>
                            <span className="text-[7px] text-slate-500 font-mono font-medium">{col.hex}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bible.colorPalette.map((textCol, rIdx) => (
                      <tr key={`row-${rIdx}`} className={isDark ? 'border-t border-slate-850/60' : 'border-t border-slate-200/60'}>
                        {/* Row Header (Text Color) */}
                        <td className="p-2.5 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-sm shrink-0" style={{ backgroundColor: textCol.hex }} />
                            <div className="min-w-0">
                              <p className="text-[10px] font-extrabold truncate leading-tight dark:text-slate-300">{textCol.name}</p>
                              <p className="text-[8px] text-slate-400 font-mono">{textCol.hex}</p>
                            </div>
                          </div>
                        </td>

                        {/* Cells */}
                        {bible.colorPalette.map((bgCol, cIdx) => {
                          const isSelf = rIdx === cIdx;
                          if (isSelf) {
                            return (
                              <td key={`cell-${rIdx}-${cIdx}`} className="p-2 text-center">
                                <div className={`text-[8px] font-bold py-3 rounded-xl border border-dashed select-none uppercase tracking-wider ${
                                  isDark ? 'bg-slate-900/20 border-slate-850 text-slate-600' : 'bg-slate-50/50 border-slate-200/50 text-slate-400'
                                }`}>
                                  Self (1:1)
                                </div>
                              </td>
                            );
                          }

                          const ratio = getContrastRatio(bgCol.hex, textCol.hex);
                          
                          // Accessibility Levels
                          let levelText = "FAIL";
                          let levelColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
                          if (ratio >= 7.0) {
                            levelText = "AAA";
                            levelColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                          } else if (ratio >= 4.5) {
                            levelText = "AA";
                            levelColor = "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
                          } else if (ratio >= 3.0) {
                            levelText = "AA Lg";
                            levelColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
                          }

                          const isSelected = 
                            (contrastBg.toLowerCase() === bgCol.hex.toLowerCase() || (bgCol.hex.startsWith('#') ? contrastBg.toLowerCase() === bgCol.hex.toLowerCase() : contrastBg.toLowerCase() === `#${bgCol.hex.toLowerCase()}`)) &&
                            (contrastText.toLowerCase() === textCol.hex.toLowerCase() || (textCol.hex.startsWith('#') ? contrastText.toLowerCase() === textCol.hex.toLowerCase() : contrastText.toLowerCase() === `#${textCol.hex.toLowerCase()}`));

                          return (
                            <td key={`cell-${rIdx}-${cIdx}`} className="p-2 text-center font-sans">
                              <button
                                onClick={() => {
                                  setContrastBg(bgCol.hex);
                                  setContrastText(textCol.hex);
                                }}
                                className={`w-full py-2.5 px-1.5 rounded-xl border text-center transition group relative hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
                                  isSelected
                                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/5'
                                    : isDark
                                      ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-850'
                                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                                }`}
                              >
                                <span className={`text-[11px] font-black font-mono tracking-tight dark:text-slate-100`}>
                                  {ratio.toFixed(1)}:1
                                </span>
                                <span className={`text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded border mt-1 tracking-wider ${levelColor}`}>
                                  {levelText}
                                </span>

                                {/* Mini swatch preview tooltip/indicator */}
                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none -top-8 bg-slate-900 text-white text-[8px] font-bold px-2 py-1 rounded shadow-md z-15 whitespace-nowrap">
                                  Click to load preview
                                </div>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Ranked Pairs List Mode */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 max-h-[380px] overflow-y-auto pr-2">
                {(() => {
                  const items: { bg: Color; text: Color; ratio: number }[] = [];
                  bible.colorPalette.forEach((textCol) => {
                    bible.colorPalette.forEach((bgCol) => {
                      if (textCol.hex !== bgCol.hex) {
                        items.push({
                          bg: bgCol,
                          text: textCol,
                          ratio: getContrastRatio(bgCol.hex, textCol.hex)
                        });
                      }
                    });
                  });

                  // Sort desc by ratio
                  items.sort((a, b) => b.ratio - a.ratio);

                  return items.map((pair, idx) => {
                    let badgeColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
                    let badgeText = "FAIL";
                    if (pair.ratio >= 7.0) {
                      badgeText = "AAA";
                      badgeColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                    } else if (pair.ratio >= 4.5) {
                      badgeText = "AA";
                      badgeColor = "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
                    } else if (pair.ratio >= 3.0) {
                      badgeText = "AA Lg";
                      badgeColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
                    }

                    const isSelected = 
                      (contrastBg.toLowerCase() === pair.bg.hex.toLowerCase() || (pair.bg.hex.startsWith('#') ? contrastBg.toLowerCase() === pair.bg.hex.toLowerCase() : contrastBg.toLowerCase() === `#${pair.bg.hex.toLowerCase()}`)) &&
                      (contrastText.toLowerCase() === pair.text.hex.toLowerCase() || (pair.text.hex.startsWith('#') ? contrastText.toLowerCase() === pair.text.hex.toLowerCase() : contrastText.toLowerCase() === `#${pair.text.hex.toLowerCase()}`));

                    return (
                      <button
                        key={`ranked-${idx}`}
                        onClick={() => {
                          setContrastBg(pair.bg.hex);
                          setContrastText(pair.text.hex);
                        }}
                        className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between h-[100px] hover:scale-[1.01] active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/5'
                            : isDark
                              ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 text-slate-300'
                              : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {/* Top: Swatches & Ratio */}
                        <div className="flex justify-between items-start w-full">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: pair.bg.hex }} />
                            <span className="text-[10px] text-slate-400 font-sans font-medium">on</span>
                            <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: pair.text.hex }} />
                          </div>
                          <span className={`text-[10px] font-black font-mono`}>
                            {pair.ratio.toFixed(2)}:1
                          </span>
                        </div>

                        {/* Middle: Roles / Names */}
                        <div className="min-w-0 pr-2 mt-1.5 font-sans">
                          <p className={`text-[9px] font-extrabold truncate ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                            {pair.text.name}
                          </p>
                          <p className="text-[8px] text-slate-400 font-medium truncate uppercase tracking-tight">
                            on {pair.bg.name}
                          </p>
                        </div>

                        {/* Bottom: Level Badges */}
                        <div className="flex justify-between items-center w-full mt-2 border-t border-slate-100/10 pt-1.5 font-sans">
                          <span className="text-[7px] text-slate-500 font-mono font-medium">
                            {pair.text.role}
                          </span>
                          <span className={`text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded border tracking-wider ${badgeColor}`}>
                            {badgeText}
                          </span>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Automated Compliance Audit Matrix */}
          <div className={`p-6 border rounded-2xl font-sans transition-all duration-300 text-left ${
            isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/30 border-slate-250/80'
          }`}>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-indigo-500" />
              Automated Contrast Compliance Matrix (Highly Accessible Pairings)
            </h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 mb-4 leading-relaxed text-left font-sans">
              The algorithm has checked all possible permutations of your 5-color palette, pure white, and slate dark. Click any recommendation below to load it into the inspector above.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* AAA Tier */}
              <div className="space-y-2 text-left">
                <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded uppercase tracking-wider block w-fit font-sans">
                  AAA Highly Accessible (Ratio &gt;= 7.0)
                </span>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {getCompliantPairs(7.0).map((pair, idx) => (
                    <button
                      key={`aaa-${idx}`}
                      onClick={() => {
                        setContrastBg(pair.bg);
                        setContrastText(pair.text);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition hover:scale-[1.01] active:scale-95 cursor-pointer ${
                        isDark ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: pair.bg }} />
                        <span className="text-slate-400 font-normal font-sans">on</span>
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: pair.text }} />
                      </div>
                      <span className="text-emerald-500 font-extrabold font-mono text-[9px]">{pair.ratio.toFixed(1)}:1</span>
                    </button>
                  ))}
                  {getCompliantPairs(7.0).length === 0 && (
                    <p className="text-[9px] text-slate-400 italic font-sans">No pairings meet AAA standards.</p>
                  )}
                </div>
              </div>

              {/* AA Body Tier */}
              <div className="space-y-2 text-left">
                <span className="text-[9px] font-extrabold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded uppercase tracking-wider block w-fit font-sans">
                  AA Standard Copy (Ratio 4.5 - 7.0)
                </span>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {getCompliantPairs(4.5, 7.0).map((pair, idx) => (
                    <button
                      key={`aa-${idx}`}
                      onClick={() => {
                        setContrastBg(pair.bg);
                        setContrastText(pair.text);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition hover:scale-[1.01] active:scale-95 cursor-pointer ${
                        isDark ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: pair.bg }} />
                        <span className="text-slate-400 font-normal font-sans">on</span>
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: pair.text }} />
                      </div>
                      <span className="text-indigo-500 font-extrabold font-mono text-[9px]">{pair.ratio.toFixed(1)}:1</span>
                    </button>
                  ))}
                  {getCompliantPairs(4.5, 7.0).length === 0 && (
                    <p className="text-[9px] text-slate-400 italic font-sans">No pairings in this standard range.</p>
                  )}
                </div>
              </div>

              {/* AA Large Tier */}
              <div className="space-y-2 text-left">
                <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded uppercase tracking-wider block w-fit font-sans">
                  Header Only (Ratio 3.0 - 4.5)
                </span>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {getCompliantPairs(3.0, 4.5).map((pair, idx) => (
                    <button
                      key={`large-${idx}`}
                      onClick={() => {
                        setContrastBg(pair.bg);
                        setContrastText(pair.text);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition hover:scale-[1.01] active:scale-95 cursor-pointer ${
                        isDark ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: pair.bg }} />
                        <span className="text-slate-400 font-normal font-sans">on</span>
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: pair.text }} />
                      </div>
                      <span className="text-amber-500 font-extrabold font-mono text-[9px]">{pair.ratio.toFixed(1)}:1</span>
                    </button>
                  ))}
                  {getCompliantPairs(3.0, 4.5).length === 0 && (
                    <p className="text-[9px] text-slate-400 italic font-sans">No pairings limited to large-text compliance.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography pairing section */}
      <div
        id="typography-pairing-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">05 / Typography Pairing</span>
          <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <Type className="w-5 h-5 text-indigo-600" />
            Suggested Google Font Pairing
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            A carefully selected type scale loaded live from Google Fonts. Compare heading and body structures together.
          </p>
        </div>

        <motion.div
          key={`typography-grid-${bible.companyName}-${bible.typography?.headerFont}-${bible.typography?.bodyFont}`}
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Detailed Font Cards */}
          <div className="lg:col-span-5 space-y-4 font-sans">
            {/* Header Font Card */}
            <motion.div
              variants={staggerItemVariants}
              className={`p-5 border rounded-2xl transition-all duration-300 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Header Typography
              </span>
              <h3 className={`text-base font-black mt-2 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                {bible.typography.headerFont}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Category: {bible.typography.headerCategory}
              </p>
              <p className={`text-xs mt-2 border-t pt-2 leading-relaxed transition-all duration-300 ${
                isDark ? 'text-slate-400 border-slate-800' : 'text-slate-600 border-slate-200'
              }`}>
                <strong className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Strategic Application:</strong>
                {bible.typography.headerUsage}
              </p>
            </motion.div>

            {/* Body Font Card */}
            <motion.div
              variants={staggerItemVariants}
              className={`p-5 border rounded-2xl transition-all duration-300 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Body / Paragraph Typography
              </span>
              <h3 className={`text-base font-black mt-2 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                {bible.typography.bodyFont}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Category: {bible.typography.bodyCategory}
              </p>
              <p className={`text-xs mt-2 border-t pt-2 leading-relaxed transition-all duration-300 ${
                isDark ? 'text-slate-400 border-slate-800' : 'text-slate-600 border-slate-200'
              }`}>
                <strong className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Strategic Application:</strong>
                {bible.typography.bodyUsage}
              </p>
            </motion.div>
          </div>

          {/* Type Sandbox Sheet */}
          <motion.div
            variants={staggerItemVariants}
            className={`lg:col-span-7 rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 ${
              isDark ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-4 font-sans">
              Live Interactive Type-scale Sheet
            </span>

            {/* Renders dynamic stylesheet styles */}
            <div className="space-y-5">
              <div>
                <span className={`text-[9px] font-mono block border-b pb-1 mb-1 transition-colors duration-300 ${
                  isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-200'
                }`}>
                  DISPLAY H1 (40px, bold)
                </span>
                <h1
                  id="dynamic-h1-rendering"
                  className={`text-4xl font-extrabold tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}
                  style={{ fontFamily: `'${bible.typography.headerFont}', sans-serif` }}
                >
                  The Next Design Standard
                </h1>
              </div>

              <div>
                <span className={`text-[9px] font-mono block border-b pb-1 mb-1 transition-colors duration-300 ${
                  isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-200'
                }`}>
                  SUBHEAD H3 (20px, medium)
                </span>
                <h3
                  id="dynamic-h3-rendering"
                  className={`text-xl font-medium transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                  style={{ fontFamily: `'${bible.typography.headerFont}', sans-serif` }}
                >
                  Crafting distinctive brand foundations at light speed.
                </h3>
              </div>

              <div>
                <span className={`text-[9px] font-mono block border-b pb-1 mb-1 transition-colors duration-300 ${
                  isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-200'
                }`}>
                  PARAGRAPH BODY (13px, regular leading-relaxed)
                </span>
                <p
                  id="dynamic-body-rendering"
                  className={`text-xs leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                  style={{ fontFamily: `'${bible.typography.bodyFont}', sans-serif` }}
                >
                  Our layout scales dynamically, delivering high accessibility standards, precise spacing rhythm, and pixel-perfect clarity. Use this Google font combination across digital applications, newsletters, packaging copy, and print catalogs.
                </p>
              </div>
            </div>

            <div className={`mt-6 text-[10px] border-t pt-3 flex items-center gap-1.5 font-sans transition-all duration-300 ${
              isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-200'
            }`}>
              <span>Google Fonts API endpoint injected into index.html dynamically.</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 06 / Tiled Geometric Brand Pattern Previewer */}
      {(() => {
        const brandColors = extractBrandColors(bible.colorPalette);
        let fgColor = brandColors.primary;
        if (geometricFgRole === 'secondary') fgColor = brandColors.secondary;
        if (geometricFgRole === 'accent') fgColor = brandColors.accent;
        if (geometricFgRole === 'dark') fgColor = brandColors.darkNeutral;
        if (geometricFgRole === 'light') fgColor = '#ffffff';

        let bgColor = '#ffffff';
        if (geometricBgMode === 'dark') bgColor = '#0f172a';
        if (geometricBgMode === 'brand') bgColor = brandColors.primary;

        const patternDataUrl = generatePatternDataUrl({
          type: selectedGeometricPattern,
          scale: geometricScale,
          bgColor,
          fgColor,
          secondaryColor: brandColors.secondary,
          accentColor: brandColors.accent,
          opacity: geometricOpacity
        });

        return (
          <div
            id="geometric-pattern-previewer-section"
            className={`border rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className={`border-b pb-5 mb-6 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1 font-sans">
                  06 / Geometric Brand Pattern System
                </span>
                <h2 className="text-xl font-black flex items-center gap-2 font-sans tracking-tight">
                  <Grid className="w-5 h-5 text-indigo-600" />
                  Interactive Geometric Pattern Previewer
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed max-w-2xl">
                  Inspect how your brand's geometric SVG patterns tile seamlessly across physical stationery, business cards, letterheads, social headers, and packaging materials in real time.
                </p>
              </div>

              {/* Quick Action Export Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  id="copy-pattern-svg-btn"
                  onClick={handleCopyPatternSvg}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isCopiedGeometricSvg
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white hover:border-indigo-500'
                        : 'bg-slate-100 border-slate-250 text-slate-700 hover:text-indigo-600 hover:border-indigo-300'
                  }`}
                >
                  {isCopiedGeometricSvg ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedGeometricSvg ? 'SVG Copied!' : 'Copy SVG'}</span>
                </button>

                <button
                  id="copy-pattern-css-btn"
                  onClick={handleCopyPatternCss}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isCopiedGeometricCss
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white hover:border-indigo-500'
                        : 'bg-slate-100 border-slate-250 text-slate-700 hover:text-indigo-600 hover:border-indigo-300'
                  }`}
                >
                  {isCopiedGeometricCss ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Code2 className="w-3.5 h-3.5" />}
                  <span>{isCopiedGeometricCss ? 'CSS Copied!' : 'Copy CSS'}</span>
                </button>

                <button
                  id="download-pattern-svg-btn"
                  onClick={handleDownloadPatternSvg}
                  className="px-3.5 py-2 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>
              </div>
            </div>

            {/* Pattern Template Picker Cards */}
            <div className="mb-6">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-2 font-sans">
                Select Geometric Motif Template:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
                {BRAND_PATTERN_TEMPLATES.map((tmpl) => {
                  const previewDataUrl = generatePatternDataUrl({
                    type: tmpl.id,
                    scale: 24,
                    bgColor,
                    fgColor,
                    secondaryColor: brandColors.secondary,
                    accentColor: brandColors.accent,
                    opacity: geometricOpacity
                  });

                  const isSelected = selectedGeometricPattern === tmpl.id;

                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedGeometricPattern(tmpl.id)}
                      className={`p-2 rounded-2xl border text-left transition duration-200 flex flex-col justify-between cursor-pointer group active:scale-95 ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-500/10 shadow-sm'
                          : isDark
                            ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                      }`}
                    >
                      <div
                        className="w-full h-12 rounded-xl border border-black/10 shadow-inner mb-2 transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundImage: `url("${previewDataUrl}")`,
                          backgroundRepeat: 'repeat',
                          backgroundSize: '24px'
                        }}
                      />
                      <span className={`text-[10px] font-bold truncate block ${isSelected ? 'text-indigo-500 font-extrabold' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {tmpl.name.split(' ')[0]}
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono truncate block capitalize">
                        {tmpl.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine-Tuning Controls Row */}
            <div className={`p-4 rounded-2xl border mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* Tile Size / Scale */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1 font-sans">
                  <span className="flex items-center gap-1"><Sliders className="w-3 h-3 text-indigo-500" /> Tile Scale</span>
                  <span className="text-indigo-400 font-mono font-bold">{geometricScale}px</span>
                </div>
                <input
                  type="range"
                  min={16}
                  max={120}
                  step={4}
                  value={geometricScale}
                  onChange={(e) => setGeometricScale(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-slate-800"
                />
              </div>

              {/* Opacity */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1 font-sans">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-indigo-500" /> Pattern Opacity</span>
                  <span className="text-indigo-400 font-mono font-bold">{Math.round(geometricOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={geometricOpacity}
                  onChange={(e) => setGeometricOpacity(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-slate-800"
                />
              </div>

              {/* Foreground Role Selector */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1 font-sans">Pattern Color Role</label>
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-950">
                  {(['primary', 'secondary', 'accent', 'dark'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setGeometricFgRole(role)}
                      className={`flex-1 text-[9px] font-bold py-1 rounded capitalize transition cursor-pointer ${
                        geometricFgRole === role ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Canvas Mode */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1 font-sans">Canvas Background</label>
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-950">
                  {(['light', 'dark', 'brand'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setGeometricBgMode(mode)}
                      className={`flex-1 text-[9px] font-bold py-1 rounded capitalize transition cursor-pointer ${
                        geometricBgMode === mode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Element Tiling Preview Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800 flex-wrap gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">
                  Element Tiling Application Stage:
                </span>
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  <button
                    onClick={() => setActivePatternElementTab('business-card')}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activePatternElementTab === 'business-card'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>üé¥ Business Cards</span>
                  </button>
                  <button
                    onClick={() => setActivePatternElementTab('letterhead')}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activePatternElementTab === 'letterhead'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>üìÑ Letterhead</span>
                  </button>
                  <button
                    onClick={() => setActivePatternElementTab('social-banner')}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activePatternElementTab === 'social-banner'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>üñºÔ∏è Social Banner</span>
                  </button>
                  <button
                    onClick={() => setActivePatternElementTab('packaging')}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activePatternElementTab === 'packaging'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>üì¶ Packaging Box</span>
                  </button>
                  <button
                    onClick={() => setActivePatternElementTab('full-canvas')}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activePatternElementTab === 'full-canvas'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>üîç Full Tile Inspector</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: BUSINESS CARD PREVIEW */}
              {activePatternElementTab === 'business-card' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 font-sans">
                      Standard US 3.5" x 2.0" Business Cards (Front & Back Tiling Preview)
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <button
                        onClick={() => setPatternCardSide('both')}
                        className={`px-2.5 py-1 rounded-md border cursor-pointer ${patternCardSide === 'both' ? 'bg-indigo-600 text-white border-indigo-500' : 'text-slate-400'}`}
                      >
                        Both Sides
                      </button>
                      <button
                        onClick={() => setPatternCardSide('front')}
                        className={`px-2.5 py-1 rounded-md border cursor-pointer ${patternCardSide === 'front' ? 'bg-indigo-600 text-white border-indigo-500' : 'text-slate-400'}`}
                      >
                        Front
                      </button>
                      <button
                        onClick={() => setPatternCardSide('back')}
                        className={`px-2.5 py-1 rounded-md border cursor-pointer ${patternCardSide === 'back' ? 'bg-indigo-600 text-white border-indigo-500' : 'text-slate-400'}`}
                      >
                        Back
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Front Side Card */}
                    {(patternCardSide === 'both' || patternCardSide === 'front') && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                          Card Front ‚Ä¢ Primary Identity Mark
                        </span>
                        <div
                          className="w-full aspect-[1.75/1] rounded-2xl border border-slate-300 dark:border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl"
                          style={{
                            backgroundImage: `url("${patternDataUrl}")`,
                            backgroundRepeat: 'repeat',
                            backgroundSize: `${geometricScale}px`
                          }}
                        >
                          {/* Glass Overlay Card Center */}
                          <div className="m-auto backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border border-white/50 dark:border-slate-800/80 p-6 rounded-2xl shadow-2xl text-center max-w-[85%] space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                              {bible.companyName[0] || 'B'}
                            </div>
                            <h3
                              className="text-lg font-black tracking-tight text-slate-900 dark:text-white"
                              style={{ fontFamily: `'${bible.typography.headerFont}', serif` }}
                            >
                              {bible.companyName}
                            </h3>
                            <p className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 dark:text-indigo-400 font-sans">
                              {bible.industry || 'Brand Standards'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 dark:text-slate-400 font-bold relative z-10">
                            <span>EST. 2026</span>
                            <span>{bible.archetype?.primaryArchetype || 'ARCHETYPE SPEC'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Back Side Card */}
                    {(patternCardSide === 'both' || patternCardSide === 'back') && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                          Card Back ‚Ä¢ Executive Contact Spec
                        </span>
                        <div
                          className="w-full aspect-[1.75/1] rounded-2xl border border-slate-300 dark:border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl"
                          style={{
                            backgroundImage: `url("${patternDataUrl}")`,
                            backgroundRepeat: 'repeat',
                            backgroundSize: `${geometricScale}px`
                          }}
                        >
                          {/* Solid Info Card Panel */}
                          <div className="backdrop-blur-lg bg-slate-900/90 text-white p-5 rounded-xl border border-slate-800 shadow-xl flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="text-sm font-black tracking-tight font-sans">
                                Alex Morgan
                              </h4>
                              <p className="text-[10px] text-indigo-400 font-bold font-sans">
                                Creative Director & Founder
                              </p>
                              <div className="pt-2 text-[9px] font-mono text-slate-300 space-y-0.5">
                                <p>alex@{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com</p>
                                <p>www.{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com</p>
                                <p>+1 (555) 019-2834</p>
                              </div>
                            </div>

                            {/* QR Code Placeholder */}
                            <div className="w-16 h-16 rounded-lg bg-white p-1.5 shrink-0 border border-slate-200 shadow-md flex flex-col items-center justify-center text-slate-900">
                              <div className="w-full h-full border border-slate-900 border-dashed rounded flex items-center justify-center font-mono text-[8px] font-black text-center leading-tight">
                                SCAN QR
                              </div>
                            </div>
                          </div>

                          <div className="text-[8px] font-mono text-slate-400 font-bold text-right">
                            CONFIDENTIAL &bull; {bible.companyName.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: LETTERHEAD PREVIEW */}
              {activePatternElementTab === 'letterhead' && (
                <div className="space-y-3 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-400 font-sans block">
                    Standard Corporate Stationery & Executive Letterhead Spec
                  </span>
                  <div
                    className={`w-full max-w-3xl mx-auto rounded-2xl border p-8 sm:p-12 shadow-2xl relative overflow-hidden text-left ${
                      isDark ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-white text-slate-800 border-slate-300'
                    }`}
                  >
                    {/* Header Pattern Banner */}
                    <div
                      className="w-full h-20 rounded-xl border border-slate-200 dark:border-slate-800 mb-8 flex items-center justify-between px-6 shadow-sm relative overflow-hidden"
                      style={{
                        backgroundImage: `url("${patternDataUrl}")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: `${geometricScale}px`
                      }}
                    >
                      <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                          {bible.companyName[0] || 'B'}
                        </div>
                        <span className="font-black text-sm text-slate-900 dark:text-white" style={{ fontFamily: `'${bible.typography.headerFont}', serif` }}>
                          {bible.companyName}
                        </span>
                      </div>

                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-md bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 backdrop-blur-sm border border-slate-200 dark:border-slate-800">
                        OFFICIAL CORRESPONDENCE
                      </span>
                    </div>

                    {/* Letterhead Body */}
                    <div className="space-y-6 font-sans">
                      <div className="flex justify-between items-start text-xs font-mono text-slate-400">
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">To: Executive Board & Steering Committee</p>
                          <p>Ref: Brand Identity System Release</p>
                        </div>
                        <p>Date: July 29, 2026</p>
                      </div>

                      <div className="border-t pt-4 border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white" style={{ fontFamily: `'${bible.typography.headerFont}', serif` }}>
                          Subject: Official Brand Standards & Geometric Motif Authorization
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          We are pleased to introduce the standardized geometric pattern system for <strong>{bible.companyName}</strong>. This pattern system builds directly on our 5-color palette and core brand archetype: <em>{bible.archetype?.primaryArchetype || 'Innovative Leader'}</em>.
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Please utilize this tiled geometric artwork across all official stationery, print collateral, website hero accents, packaging wraps, and conference badges. Maintain minimum spacing clearance around primary logo marks.
                        </p>
                      </div>

                      {/* Signature block */}
                      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">Alex Morgan</p>
                          <p className="text-[10px] text-slate-400">Head of Global Brand Standards</p>
                        </div>
                        <div className="text-right text-[9px] font-mono text-slate-400">
                          <p>HQ: 100 Innovation Way, Suite 400</p>
                          <p>San Francisco, CA 94105</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Stripe */}
                    <div
                      className="w-full h-3 rounded-md mt-8 border-t border-slate-200 dark:border-slate-800"
                      style={{
                        backgroundImage: `url("${patternDataUrl}")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: `${geometricScale}px`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: SOCIAL MEDIA BANNER PREVIEW */}
              {activePatternElementTab === 'social-banner' && (
                <div className="space-y-3 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-400 font-sans block">
                    Social Media Widescreen Cover Banner (LinkedIn / Twitter / YouTube Spec)
                  </span>
                  <div className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-2xl relative">
                    {/* Widescreen Banner Container with Pattern */}
                    <div
                      className="w-full aspect-[3.2/1] relative flex items-center justify-between p-6 sm:p-10"
                      style={{
                        backgroundImage: `url("${patternDataUrl}")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: `${geometricScale}px`
                      }}
                    >
                      {/* Dark gradient vignette overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent pointer-events-none" />

                      <div className="relative z-10 flex items-center gap-4 max-w-xl">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-2xl border-2 border-white/20 shrink-0">
                          {bible.companyName[0] || 'B'}
                        </div>
                        <div className="text-white space-y-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: `'${bible.typography.headerFont}', serif` }}>
                              {bible.companyName}
                            </h2>
                            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black">
                              ‚úì
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 line-clamp-1 font-sans">
                            {bible.mission || 'Pioneering next-generation brand experiences and designs.'}
                          </p>
                        </div>
                      </div>

                      {/* CTA Badge on Right */}
                      <div className="hidden sm:flex items-center gap-3 relative z-10">
                        <button className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-black text-xs shadow-xl hover:bg-slate-100 transition cursor-pointer">
                          Follow Brand
                        </button>
                      </div>
                    </div>

                    <div className={`p-4 flex items-center justify-between text-xs font-bold ${
                      isDark ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-600'
                    }`}>
                      <span>Specs: 1584 x 396 px &bull; Vector Pattern Background</span>
                      <span className="font-mono text-[10px] text-indigo-400">LIVE SOCIAL PREVIEW</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PACKAGING BOX PREVIEW */}
              {activePatternElementTab === 'packaging' && (
                <div className="space-y-3 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-400 font-sans block">
                    Retail Box & Product Packaging Outer Sleeve Mockup
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* 3D Box Mockup Panel */}
                    <div
                      className="w-full aspect-square max-w-sm mx-auto rounded-3xl border border-slate-300 dark:border-slate-800 p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl"
                      style={{
                        backgroundImage: `url("${patternDataUrl}")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: `${geometricScale}px`
                      }}
                    >
                      <div className="backdrop-blur-md bg-slate-900/90 text-white p-4 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                            {bible.companyName[0] || 'B'}
                          </div>
                          <span className="font-bold text-xs font-sans">{bible.companyName}</span>
                        </div>
                        <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          PREMIUM PACK
                        </span>
                      </div>

                      <div className="m-auto text-center space-y-2 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-[85%]">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white" style={{ fontFamily: `'${bible.typography.headerFont}', serif` }}>
                          {bible.companyName} Edition
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                          Outer geometric packaging sleeve featuring precision tiled motif.
                        </p>
                      </div>

                      <div className="backdrop-blur-md bg-slate-900/80 text-white p-3 rounded-xl text-[9px] font-mono flex items-center justify-between border border-slate-800">
                        <span>BARCODE: 8-901234-567890</span>
                        <span>NET WT: 250G</span>
                      </div>
                    </div>

                    {/* Packaging Specs */}
                    <div className={`p-6 rounded-2xl border space-y-4 font-sans ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <h4 className="font-extrabold text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        Packaging Surface Guidelines
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-400">
                        <li className="flex gap-2">
                          <span className="text-indigo-500 font-bold">&bull;</span>
                          <span>Print pattern at 300 DPI high-resolution CMYK vector offset.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-indigo-500 font-bold">&bull;</span>
                          <span>Ensure outer box bleed of minimum 3mm around folding edges.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-indigo-500 font-bold">&bull;</span>
                          <span>Apply spot UV gloss coating to foreground pattern lines on matte dark box stock.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FULL TILE INSPECTOR */}
              {activePatternElementTab === 'full-canvas' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 font-sans">
                      Seamless Endless Canvas Inspection Stage
                    </span>
                    <button
                      onClick={() => setShowTileGridLines(!showTileGridLines)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${
                        showTileGridLines ? 'bg-indigo-600 text-white border-indigo-500' : 'text-slate-400 border-slate-700'
                      }`}
                    >
                      {showTileGridLines ? 'Hide Tile Boundaries' : 'Show Tile Boundaries'}
                    </button>
                  </div>

                  <div
                    className={`w-full h-80 rounded-2xl border border-slate-300 dark:border-slate-800 relative overflow-hidden transition-all duration-300 shadow-inner ${
                      showTileGridLines ? 'ring-2 ring-indigo-500/50' : ''
                    }`}
                    style={{
                      backgroundImage: `url("${patternDataUrl}")`,
                      backgroundRepeat: 'repeat',
                      backgroundSize: `${geometricScale}px`
                    }}
                  >
                    {/* Tile grid lines overlay */}
                    {showTileGridLines && (
                      <div
                        className="absolute inset-0 pointer-events-none opacity-30"
                        style={{
                          backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
                          backgroundSize: `${geometricScale}px ${geometricScale}px`
                        }}
                      />
                    )}

                    <div className="absolute bottom-3 right-3 backdrop-blur-md bg-slate-900/80 text-white px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono">
                      Scale: {geometricScale}px &bull; Opacity: {Math.round(geometricOpacity * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Motion Identity & Logo Reveal Animation Section */}
      {(() => {
        const getCssSnippet = () => {
          let keyframes = '';
          if (motionPreset === 'slide-up') {
            keyframes = `@keyframes brandLogoReveal {
  0% {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0px);
  }
}`;
          } else if (motionPreset === 'fade-scale') {
            keyframes = `@keyframes brandLogoReveal {
  0% {
    opacity: 0;
    transform: scale(0.88);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}`;
          } else if (motionPreset === 'elastic-pop') {
            keyframes = `@keyframes brandLogoReveal {
  0% {
    opacity: 0;
    transform: scale(0.7) translateY(12px);
  }
  70% {
    transform: scale(1.05) translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}`;
          } else if (motionPreset === 'shimmer') {
            keyframes = `@keyframes brandLogoReveal {
  0% {
    opacity: 0;
    filter: brightness(2) contrast(1.5) blur(6px);
    transform: scale(0.92);
  }
  100% {
    opacity: 1;
    filter: brightness(1) contrast(1) blur(0px);
    transform: scale(1);
  }
}`;
          }

          return `${keyframes}

/* Apply class to logo element */
.brand-logo-reveal {
  animation: brandLogoReveal ${motionDuration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}`;
        };

        const handleCopyMotionCss = () => {
          navigator.clipboard.writeText(getCssSnippet());
          setIsMotionCssCopied(true);
          setTimeout(() => setIsMotionCssCopied(false), 2000);
        };

        return (
          <div
            id="motion-identity-section"
            className={`border rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1 font-sans">
                  07 / Motion Identity & Animation System
                </span>
                <h2 className="text-xl font-black flex items-center gap-2 font-sans tracking-tight">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  Primary Logo Motion Identity & Reveal Snippet
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed max-w-2xl">
                  Standardized on-brand CSS entry animation specs for {bible.companyName}'s primary logo mark across web applications, splash screens, and video overlays.
                </p>
              </div>

              <button
                id="copy-motion-css-btn"
                onClick={handleCopyMotionCss}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 ${
                  isMotionCssCopied
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md'
                }`}
              >
                {isMotionCssCopied ? <Check className="w-4 h-4 text-emerald-200" /> : <Code2 className="w-4 h-4" />}
                <span>{isMotionCssCopied ? 'CSS Snippet Copied!' : 'Copy CSS Snippet'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Control & Live Stage Column */}
              <div className="lg:col-span-6 space-y-4 text-left">
                {/* Controls */}
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-sans">
                      Reveal Animation Preset
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">Duration: {motionDuration}s</span>
                      <input
                        type="range"
                        min="0.3"
                        max="2.0"
                        step="0.1"
                        value={motionDuration}
                        onChange={(e) => setMotionDuration(parseFloat(e.target.value))}
                        className="w-24 accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => { setMotionPreset('slide-up'); setMotionKey(k => k + 1); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        motionPreset === 'slide-up' ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Slide Up
                    </button>
                    <button
                      onClick={() => { setMotionPreset('fade-scale'); setMotionKey(k => k + 1); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        motionPreset === 'fade-scale' ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Fade & Scale
                    </button>
                    <button
                      onClick={() => { setMotionPreset('elastic-pop'); setMotionKey(k => k + 1); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        motionPreset === 'elastic-pop' ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Elastic Pop
                    </button>
                    <button
                      onClick={() => { setMotionPreset('shimmer'); setMotionKey(k => k + 1); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        motionPreset === 'shimmer' ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Shimmer Glow
                    </button>
                  </div>
                </div>

                {/* Stage Canvas */}
                <div className={`p-8 rounded-2xl border min-h-[260px] flex flex-col justify-center items-center relative overflow-hidden shadow-inner ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100/80 border-slate-200'
                }`}>
                  <button
                    onClick={() => setMotionKey(k => k + 1)}
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Replay Reveal</span>
                  </button>

                  <div className="text-center space-y-3" key={motionKey}>
                    <motion.div
                      initial={
                        motionPreset === 'slide-up'
                          ? { opacity: 0, y: 24, scale: 0.96, filter: 'blur(4px)' }
                          : motionPreset === 'fade-scale'
                            ? { opacity: 0, scale: 0.88 }
                            : motionPreset === 'elastic-pop'
                              ? { opacity: 0, scale: 0.7, y: 12 }
                              : { opacity: 0, filter: 'brightness(2) blur(6px)', scale: 0.92 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px) brightness(1)' }}
                      transition={{
                        duration: motionDuration,
                        type: motionPreset === 'elastic-pop' ? 'spring' : 'tween',
                        bounce: motionPreset === 'elastic-pop' ? 0.5 : 0,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className="inline-block p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800"
                    >
                      {bible.primaryLogo ? (
                        typeof bible.primaryLogo === 'string' && bible.primaryLogo.trim().startsWith('<svg') ? (
                          <div
                            className="w-20 h-20 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                            dangerouslySetInnerHTML={{ __html: getCleanSvg(bible.primaryLogo) }}
                          />
                        ) : (
                          <img
                            src={bible.primaryLogo}
                            alt={bible.companyName}
                            className="w-20 h-20 object-contain"
                          />
                        )
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                          {bible.companyName[0] || 'B'}
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: motionDuration * 0.5, duration: 0.4 }}
                    >
                      <h3 className="text-lg font-black tracking-tight" style={{ fontFamily: `'${bible.typography.headerFont}', serif` }}>
                        {bible.companyName}
                      </h3>
                      <p className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-widest mt-0.5">
                        Brand Identity Motion Standard
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Right CSS Code Snippet Column */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div className={`p-5 rounded-2xl border h-full flex flex-col justify-between font-mono text-xs ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 text-slate-100 border-slate-800'
                }`}>
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[10px] text-slate-400 font-sans">
                      <span className="font-bold uppercase tracking-wider text-indigo-400">Production CSS Code Snippet</span>
                      <span>Keyframe Animation Rule</span>
                    </div>

                    <pre className="text-[11px] leading-relaxed text-indigo-200 overflow-x-auto p-2 font-mono">
                      {getCssSnippet()}
                    </pre>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-sans text-slate-400">
                    <span>Target: Logo SVG / Brand Mark container</span>
                    <button
                      onClick={handleCopyMotionCss}
                      className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 07a / Programmatic Logo Usage Rules & Design Specifications Section */}
      <div
        id="logo-usage-rules-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        {/* Section Header */}
        <div className={`border-b pb-5 mb-6 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block">
                07a / Logo Usage Specifications
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Programmatic Design Specs
              </span>
            </div>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Ruler className="w-5 h-5 text-indigo-600" />
              Primary Mark Usage Rules &amp; Design Guidelines
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed max-w-2xl">
              Programmatically calculated clear space margins, background adaptability matrix, minimum scaling limits, and prohibited usage rules for <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{bible.companyName}</strong>.
            </p>
          </div>

          {/* Tab Filter Pills */}
          <div className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {[
              { id: 'all', label: 'All Specs', icon: Layers },
              { id: 'clearspace', label: 'Clear Space', icon: Grid },
              { id: 'backgrounds', label: 'Backgrounds', icon: Sun },
              { id: 'sizes', label: 'Min Sizes', icon: Ruler },
              { id: 'donts', label: "Do's & Don'ts", icon: Ban },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = usageTabFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`usage-tab-${tab.id}-btn`}
                  onClick={() => setUsageTabFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Modules */}
        <div className="space-y-8 font-sans">
          
          {/* Module A: Logo Clear Space & Grid Exclusion Zone */}
          {(usageTabFilter === 'all' || usageTabFilter === 'clearspace') && (
            <div id="logo-clear-space-guidelines" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className={`text-sm font-black flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <Grid className="w-4 h-4 text-indigo-500" />
                    <span>Logo Clear Space &amp; Margin Bounds</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Maintain an exclusion zone of <strong>{clearSpaceFactor}X</strong> (where X = 25% height of logo mark) to preserve optical legibility.
                  </p>
                </div>

                {/* Factor Switcher */}
                <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] font-bold text-slate-400 px-2">Zone Ratio:</span>
                  {[
                    { factor: 0.5, label: '0.5X (Compact)' },
                    { factor: 1, label: '1.0X (Standard)' },
                    { factor: 1.5, label: '1.5X (Generous)' },
                  ].map(item => (
                    <button
                      key={item.factor}
                      id={`clearspace-factor-${item.factor}-btn`}
                      onClick={() => setClearSpaceFactor(item.factor)}
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                        clearSpaceFactor === item.factor
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blueprint Stage */}
              <div className={`p-8 sm:p-12 rounded-2xl border relative overflow-hidden flex flex-col items-center justify-center min-h-[320px] transition-colors duration-300 ${
                isDark ? 'bg-slate-950/90 border-slate-800/80' : 'bg-indigo-50/30 border-indigo-100'
              }`}>
                {/* Graph Paper Grid Background */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(${isDark ? '#818cf8' : '#4f46e5'} 1px, transparent 1px)`,
                    backgroundSize: '16px 16px',
                  }}
                />

                {/* Clear Space Bounding Box Container */}
                <div className="relative p-6 sm:p-10 border-2 border-dashed border-indigo-500/60 rounded-xl bg-indigo-500/5 backdrop-blur-xs flex flex-col items-center justify-center transition-all duration-300">
                  {/* Outer 'X' Dimension Badges */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                    Clear Space = {clearSpaceFactor}X ({Math.round(24 * clearSpaceFactor)}px / {Math.round(6 * clearSpaceFactor)}mm)
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {clearSpaceFactor}X Margin
                  </div>
                  <div className="absolute top-1/2 -left-3 -translate-y-1/2 -rotate-90 bg-indigo-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {clearSpaceFactor}X Margin
                  </div>
                  <div className="absolute top-1/2 -right-3 -translate-y-1/2 rotate-90 bg-indigo-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {clearSpaceFactor}X Margin
                  </div>

                  {/* Actual Logo Image */}
                  {bible.primaryLogo ? (
                    <img
                      src={allLogos[carouselIndex] || bible.primaryLogo}
                      alt={`${bible.companyName} Logo Clear Space Blueprint`}
                      className="max-h-36 max-w-[240px] object-contain drop-shadow-md relative z-10"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-28 w-48 bg-indigo-500/10 rounded-xl flex items-center justify-center font-black text-indigo-400 text-xl tracking-wider">
                      {bible.companyName}
                    </div>
                  )}
                </div>

                {/* Blueprint Footer Rule Specs */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <strong>X Height Unit:</strong> ~25% of Primary Mark Height
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <strong>No-Interference Policy:</strong> Keep clear of text, borders, or graphics
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Module B: Background Adaptability Matrix */}
          {(usageTabFilter === 'all' || usageTabFilter === 'backgrounds') && (
            <div id="logo-background-rules" className="space-y-4">
              <div>
                <h3 className={`text-sm font-black flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <Sun className="w-4 h-4 text-indigo-500" />
                  <span>Usage on Light, Dark &amp; Palette Backgrounds</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-tested background adaptability matrix ensuring legibility across light surfaces, dark modes, and brand primary colors.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Light Canvas */}
                <div className="border rounded-2xl p-5 bg-white border-slate-200 text-slate-900 flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Light Surface
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> Pass 15.4:1
                    </span>
                  </div>

                  <div className="py-6 flex items-center justify-center min-h-[120px]">
                    {bible.primaryLogo ? (
                      <img
                        src={allLogos[carouselIndex] || bible.primaryLogo}
                        alt="Logo on Light Background"
                        className="max-h-20 max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-black text-slate-900 text-lg tracking-wider">{bible.companyName}</span>
                    )}
                  </div>

                  <div className="space-y-1 border-t pt-3 border-slate-100">
                    <div className="text-xs font-extrabold text-slate-900">Standard Light Mode</div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Primary placement for official documentation, light websites, and white print materials.
                    </p>
                  </div>
                </div>

                {/* 2. Dark Canvas */}
                <div className="border rounded-2xl p-5 bg-slate-950 border-slate-800 text-white flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                      Dark Surface
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" /> Pass 12.8:1
                    </span>
                  </div>

                  <div className="py-6 flex items-center justify-center min-h-[120px]">
                    {bible.primaryLogo ? (
                      <img
                        src={allLogos[carouselIndex] || bible.primaryLogo}
                        alt="Logo on Dark Background"
                        className="max-h-20 max-w-full object-contain filter drop-shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-black text-white text-lg tracking-wider">{bible.companyName}</span>
                    )}
                  </div>

                  <div className="space-y-1 border-t pt-3 border-slate-800">
                    <div className="text-xs font-extrabold text-white">Dark Mode Surface</div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Secondary placement for dark web themes, video overlays, and night presentation slides.
                    </p>
                  </div>
                </div>

                {/* 3. Primary Brand Palette */}
                <div
                  className="border rounded-2xl p-5 text-white flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: bible.colorPalette[0]?.hex || '#4f46e5' }}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-black/30 text-white backdrop-blur-xs">
                      Brand Accent
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> Monochrome
                    </span>
                  </div>

                  <div className="py-6 flex items-center justify-center min-h-[120px] z-10">
                    {bible.primaryLogo ? (
                      <img
                        src={allLogos[carouselIndex] || bible.primaryLogo}
                        alt="Logo on Brand Color"
                        className="max-h-20 max-w-full object-contain brightness-0 invert"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-black text-white text-lg tracking-wider">{bible.companyName}</span>
                    )}
                  </div>

                  <div className="space-y-1 border-t pt-3 border-white/20 z-10">
                    <div className="text-xs font-extrabold text-white">Brand Primary Background</div>
                    <p className="text-[10px] text-white/80 leading-normal">
                      Single-tone inverted mark recommended for packaging, merchandise, and brand cards.
                    </p>
                  </div>
                </div>

                {/* 4. Prohibited Background Surface */}
                <div className="border rounded-2xl p-5 bg-gradient-to-br from-amber-200 via-rose-300 to-indigo-300 border-rose-300 text-slate-900 flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                      Busy Pattern / Photo
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Prohibited
                    </span>
                  </div>

                  {/* Restrict Overlay */}
                  <div className="py-6 flex items-center justify-center min-h-[120px] relative z-10">
                    <div className="relative">
                      {bible.primaryLogo ? (
                        <img
                          src={allLogos[carouselIndex] || bible.primaryLogo}
                          alt="Prohibited Background Example"
                          className="max-h-20 max-w-full object-contain opacity-60 grayscale"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="font-black text-slate-800 text-lg">{bible.companyName}</span>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Ban className="w-16 h-16 text-rose-600/80 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 border-t pt-3 border-rose-400/40 z-10">
                    <div className="text-xs font-extrabold text-rose-950">No Busy Backgrounds</div>
                    <p className="text-[10px] text-rose-900 leading-normal font-medium">
                      Do not place mark over high-contrast imagery, gradients, or non-brand patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module C: Minimum Size & Scaling Specifications */}
          {(usageTabFilter === 'all' || usageTabFilter === 'sizes') && (
            <div id="logo-minimum-size-rules" className="space-y-4">
              <div>
                <h3 className={`text-sm font-black flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <Ruler className="w-4 h-4 text-indigo-500" />
                  <span>Minimum Digital &amp; Print Scaling Specifications</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ensure mark legibility across micro-screen favicons, mobile header bars, and large print collateral.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-end justify-items-center text-center">
                  {/* Micro: 16px Favicon */}
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center shadow-xs">
                      {bible.primaryLogo ? (
                        <img src={allLogos[carouselIndex] || bible.primaryLogo} alt="16px Favicon" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[10px] font-black text-indigo-400">16</span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold">16px √ó 16px</div>
                      <div className="text-[10px] text-slate-400">Favicon / Tray Icon</div>
                    </div>
                  </div>

                  {/* Small: 24px App Bar */}
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center shadow-xs">
                      {bible.primaryLogo ? (
                        <img src={allLogos[carouselIndex] || bible.primaryLogo} alt="24px App Bar" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-xs font-black text-indigo-400">24</span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold">24px √ó 24px</div>
                      <div className="text-[10px] text-slate-400">Digital Min Size</div>
                    </div>
                  </div>

                  {/* Medium: 48px Mobile Header */}
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center shadow-xs">
                      {bible.primaryLogo ? (
                        <img src={allLogos[carouselIndex] || bible.primaryLogo} alt="48px Mobile Header" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-sm font-black text-indigo-400">48</span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold">48px √ó 48px</div>
                      <div className="text-[10px] text-slate-400">Mobile Navigation</div>
                    </div>
                  </div>

                  {/* Large: 120px Desktop Hero */}
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-32 h-24 rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center shadow-xs p-2">
                      {bible.primaryLogo ? (
                        <img src={allLogos[carouselIndex] || bible.primaryLogo} alt="120px Desktop Header" className="max-h-16 max-w-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-base font-black text-indigo-400">120px</span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold">120px+ Width</div>
                      <div className="text-[10px] text-slate-400">Desktop Header / Print (10mm min)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module D: Prohibited Logo Modifications (Do's & Don'ts Visual Demos) */}
          {(usageTabFilter === 'all' || usageTabFilter === 'donts') && (
            <div id="logo-prohibited-modifications" className="space-y-4">
              <div>
                <h3 className={`text-sm font-black flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <Ban className="w-4 h-4 text-rose-500" />
                  <span>Prohibited Modifications &amp; Visual Anti-Patterns</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual demonstrations of improper alterations that violate brand consistency standards.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Distorted */}
                <div className={`border rounded-2xl p-4 flex flex-col justify-between space-y-3 text-center ${
                  isDark ? 'bg-rose-950/20 border-rose-900/40 text-slate-200' : 'bg-rose-50/40 border-rose-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-[9px] font-bold text-rose-500">
                    <span>PROHIBITED</span>
                    <XCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="h-24 flex items-center justify-center overflow-hidden">
                    {bible.primaryLogo ? (
                      <img
                        src={allLogos[carouselIndex] || bible.primaryLogo}
                        alt="Distorted Logo"
                        className="max-h-16 object-contain"
                        style={{ transform: 'scaleX(1.4) scaleY(0.6)' }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-black text-lg scale-x-150 scale-y-75">{bible.companyName}</span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-rose-500 leading-tight">
                    Do Not Stretch or Distort Proportions
                  </div>
                </div>

                {/* 2. Rotated */}
                <div className={`border rounded-2xl p-4 flex flex-col justify-between space-y-3 text-center ${
                  isDark ? 'bg-rose-950/20 border-rose-900/40 text-slate-200' : 'bg-rose-50/40 border-rose-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-[9px] font-bold text-rose-500">
                    <span>PROHIBITED</span>
                    <XCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="h-24 flex items-center justify-center overflow-hidden">
                    {bible.primaryLogo ? (
                      <img
                        src={allLogos[carouselIndex] || bible.primaryLogo}
                        alt="Rotated Logo"
                        className="max-h-16 object-contain"
                        style={{ transform: 'rotate(-22deg)' }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-black text-lg -rotate-12">{bible.companyName}</span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-rose-500 leading-tight">
                    Do Not Rotate or Tilt Logo Orientation
                  </div>
                </div>

                {/* 3. Shadow / Glow */}
                <div className={`border rounded-2xl p-4 flex flex-col justify-between space-y-3 text-center ${
                  isDark ? 'bg-rose-950/20 border-rose-900/40 text-slate-200' : 'bg-rose-50/40 border-rose-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-[9px] font-bold text-rose-500">
                    <span>PROHIBITED</span>
                    <XCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="h-24 flex items-center justify-center overflow-hidden">
                    {bible.primaryLogo ? (
                      <img
                        src={allLogos[carouselIndex] || bible.primaryLogo}
                        alt="Glow Logo"
                        className="max-h-16 object-contain"
                        style={{ filter: 'drop-shadow(0px 8px 12px #ef4444) drop-shadow(0px 0px 18px #f59e0b)' }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-black text-lg drop-shadow-[0_10px_10px_rgba(239,68,68,1)]">{bible.companyName}</span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-rose-500 leading-tight">
                    Do Not Apply Harsh Drop Shadows or Neon Glows
                  </div>
                </div>

                {/* 4. Low Contrast */}
                <div className={`border rounded-2xl p-4 flex flex-col justify-between space-y-3 text-center ${
                  isDark ? 'bg-rose-950/20 border-rose-900/40 text-slate-200' : 'bg-rose-50/40 border-rose-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-[9px] font-bold text-rose-500">
                    <span>PROHIBITED</span>
                    <XCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="h-24 flex items-center justify-center overflow-hidden bg-slate-200 rounded-lg p-2">
                    {bible.primaryLogo ? (
                      <img
                        src={allLogos[carouselIndex] || bible.primaryLogo}
                        alt="Low Contrast Logo"
                        className="max-h-16 object-contain opacity-30 grayscale"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-black text-lg text-slate-400">{bible.companyName}</span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-rose-500 leading-tight">
                    Do Not Place on Low-Contrast Backgrounds
                  </div>
                </div>

                {/* 5. Approved Pristine Mark */}
                <div className={`border rounded-2xl p-4 flex flex-col justify-between space-y-3 text-center ${
                  isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200' : 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-[9px] font-bold text-emerald-500">
                    <span>APPROVED</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="h-24 flex items-center justify-center overflow-hidden">
                    {bible.primaryLogo ? (
                      <img
                        src={allLogos[carouselIndex] || bible.primaryLogo}
                        alt="Approved Logo"
                        className="max-h-16 object-contain drop-shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-black text-lg text-indigo-600">{bible.companyName}</span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500 leading-tight">
                    Always Use Original Unaltered Vector Mark
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Copyable Summary Rules Bar */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 text-xs">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-slate-400">
                Rule set automatically compiled for <strong className={isDark ? 'text-white' : 'text-slate-900'}>{bible.companyName}</strong> brand designers &amp; web developers.
              </span>
            </div>

            <button
              id="copy-usage-rules-btn"
              onClick={() => {
                const rulesText = `# ${bible.companyName} - Official Logo Usage Rules & Specifications\n\n` +
                  `1. Clear Space: Maintain a minimum exclusion margin of ${clearSpaceFactor}X (approx. 24px) around all 4 sides of the primary mark.\n` +
                  `2. Background Adaptability: Use full-color logo on white/light surfaces (#FFFFFF), inverted white mark on dark mode (#0F172A) and primary brand background (${bible.colorPalette[0]?.hex || '#4f46e5'}).\n` +
                  `3. Minimum Scaling: Digital minimum size is 24px √ó 24px. Print minimum size is 10mm (0.4 in).\n` +
                  `4. Prohibited Modifications: Never stretch/distort aspect ratio, rotate orientation, apply heavy shadows/glows, or place on low-contrast backgrounds.\n`;
                navigator.clipboard.writeText(rulesText);
                setToast({
                  message: 'Usage Rules & Specifications copied to clipboard!',
                  hex: bible.colorPalette[0]?.hex || '#6366f1'
                });
                setTimeout(() => setToast(null), 2500);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Usage Rules</span>
            </button>
          </div>

        </div>
      </div>

      {/* Guidelines: Dos & Don'ts */}
      <div
        id="guidelines-dos-donts-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">07 / Brand Guidelines</span>
          <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Standard Brand Usage Guidelines
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            Enforce these strict brand alignment rules across all marketing teams, packaging facilities, and external agency partners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {/* Do's */}
          <div className={`border rounded-2xl p-6 space-y-4 transition-all duration-300 ${
            isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-100' : 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${
              isDark ? 'text-emerald-400' : 'text-emerald-800'
            }`}>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Do (Mandatory Directives)
            </h3>
            <ul className="space-y-2.5 text-xs">
              {bible.doGuidelines.map((guideline, idx) => (
                <li id={`do-guideline-item-${idx}`} key={idx} className="flex gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">&bull;</span>
                  <span className="leading-relaxed font-medium">{guideline}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className={`border rounded-2xl p-6 space-y-4 transition-all duration-300 ${
            isDark ? 'bg-rose-950/20 border-rose-900/40 text-rose-100' : 'bg-rose-50/40 border-rose-200 text-rose-950'
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300 ${
              isDark ? 'text-rose-400' : 'text-rose-800'
            }`}>
              <XCircle className="w-5 h-5 text-rose-500" />
              Don't (Prohibited Usage)
            </h3>
            <ul className="space-y-2.5 text-xs">
              {bible.dontGuidelines.map((guideline, idx) => (
                <li id={`dont-guideline-item-${idx}`} key={idx} className="flex gap-2">
                  <span className="text-rose-500 font-bold shrink-0">&bull;</span>
                  <span className="leading-relaxed font-medium">{guideline}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 08 / Social Media Profile Banners & Marketing Templates Section */}
      <SocialBannersSection
        bible={bible}
        isDark={isDark}
        onShowToast={(msg, hex) => {
          setToast({
            message: msg,
            hex: hex || bible.colorPalette[0]?.hex || '#4f46e5'
          });
          setTimeout(() => setToast(null), 2500);
        }}
      />

      {/* 09 / Download Brand Assets Section */}
      <div
        id="download-brand-assets-section"
        className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`border-b pb-4 mb-6 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1 font-sans">
              09 / Download Brand Assets
            </span>
            <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Download className="w-5 h-5 text-indigo-600" />
              Download Brand Assets &amp; Specifications Kit
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed max-w-2xl">
              Compile your official primary logo mark, 5-color palette specifications, and typography hierarchy into a structured, printable PDF document.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="dashboard-copy-shareable-link-btn"
              data-testid="bottom-shareable-link-btn"
              onClick={() => handleCopyShareableLink(false)}
              className={`px-4 py-3 text-xs font-bold rounded-2xl border transition flex items-center gap-2 cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="Encode active brand bible into a base64 string and update URL hash to share with others"
            >
              {isLinkCopied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Share2 className="w-4 h-4 text-indigo-500" />
              )}
              <span>{isLinkCopied ? "Link Copied!" : "Shareable Link"}</span>
            </button>

            <button
              id="download-dashboard-snapshot-png-btn"
              onClick={handleDownloadDashboardPng}
              disabled={isExportingPng}
              className="bg-purple-600 hover:bg-purple-500 active:scale-98 text-white px-5 py-3 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-600/20 transition cursor-pointer disabled:opacity-50"
              title="Capture full active Brand Bible dashboard as a single high-quality PNG image using html2canvas"
            >
              {isExportingPng ? (
                <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
              ) : (
                <Camera className="w-4 h-4 text-purple-200" />
              )}
              <span>{isExportingPng ? "Capturing PNG..." : "Download Dashboard PNG"}</span>
            </button>

            <button
              id="download-asset-spec-sheet-btn"
              onClick={handleDownloadAssetSheetPdf}
              disabled={isExportingPdf}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white px-5 py-3 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
              title="Download 1-page PDF compiling logo, palette, and typography specifications"
            >
              {isExportingPdf ? (
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
              ) : (
                <FileText className="w-4 h-4 text-indigo-200" />
              )}
              <span>{isExportingPdf ? "Generating PDF..." : "Download Brand Assets PDF"}</span>
            </button>

            <button
              id="open-pdf-customizer-btn"
              onClick={() => setShowPdfExportModal(true)}
              className={`px-4 py-3 text-xs font-bold rounded-2xl border transition flex items-center gap-2 cursor-pointer ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
              title="Open full PDF customization modal with 1-sheet vs 3-page, dark/light theme, and live preview"
            >
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>PDF Options &amp; Preview</span>
            </button>
            <button
              id="download-complete-bible-pdf-btn"
              onClick={handleDownloadBrandPdf}
              disabled={isExportingPdf}
              className={`px-4 py-3 text-xs font-bold rounded-2xl border transition flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
              title="Download 3-page comprehensive Brand Specification Bible PDF"
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Full Brand Bible (3 Pages)</span>
            </button>
          </div>
        </div>

        {/* Compiled Content Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
          {/* Card 1: Logo Specification */}
          <div className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                  01 ‚Ä¢ Identity Asset
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-600 border border-slate-200'
                }`}>
                  Vector &amp; High-Res
                </span>
              </div>
              <h3 className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <FileImage className="w-4 h-4 text-indigo-500" />
                Primary Brand Logo Mark
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Includes the active graphical primary mark, aspect ratio specifications ({logoAspectRatio}), and scalable vector rasterization.
              </p>
            </div>
            <div className={`mt-4 p-4 rounded-xl border flex items-center justify-center bg-white dark:bg-slate-900 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              {bible.primaryLogo ? (
                typeof bible.primaryLogo === 'string' && bible.primaryLogo.trim().startsWith('<svg') ? (
                  <div
                    className="w-14 h-14 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: getCleanSvg(bible.primaryLogo) }}
                  />
                ) : (
                  <img
                    src={bible.primaryLogo}
                    alt={bible.companyName}
                    className="w-14 h-14 object-contain"
                  />
                )
              ) : (
                <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center">
                  {(bible.companyName && bible.companyName[0]) || 'B'}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: 5-Color Palette */}
          <div className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                  02 ‚Ä¢ Color System
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  WCAG Verified
                </span>
              </div>
              <h3 className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Palette className="w-4 h-4 text-indigo-500" />
                5-Color Design Palette
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compiles all 5 brand colors ({bible.colorPalette?.map(c => c.hex.toUpperCase()).join(', ')}), role assignments, and WCAG accessibility contrast ratings.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-1.5">
              {(bible.colorPalette || []).map((color, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1.5 p-1.5 rounded-lg border border-slate-300/40 dark:border-slate-800 bg-white dark:bg-slate-900 text-center"
                >
                  <div
                    className="w-full h-8 rounded-md shadow-inner border border-black/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[9px] font-mono font-bold uppercase truncate w-full text-slate-500 dark:text-slate-400">
                    {color.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Typography & Fonts */}
          <div className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                  03 ‚Ä¢ Typography
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-600 border border-slate-200'
                }`}>
                  Google Fonts
                </span>
              </div>
              <h3 className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Type className="w-4 h-4 text-indigo-500" />
                Typography Hierarchy
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Documents the official Display Header Font ({bible.typography?.headerFont || 'Playfair Display'}) and Body Paragraph Font ({bible.typography?.bodyFont || 'Plus Jakarta Sans'}) pairings.
              </p>
            </div>
            <div className={`mt-4 p-3.5 rounded-xl border flex flex-col gap-2 text-left bg-white dark:bg-slate-900 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">Heading</span>
                <span className="text-xs font-black truncate max-w-[140px] text-indigo-500">
                  {bible.typography?.headerFont || 'Playfair Display'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                <span className="text-[10px] font-bold text-slate-400">Body</span>
                <span className="text-xs font-semibold truncate max-w-[140px]">
                  {bible.typography?.bodyFont || 'Plus Jakarta Sans'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: High-Res Canvas Snapshot PNG */}
          <div className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                  04 ‚Ä¢ Dashboard Canvas
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  html2canvas PNG
                </span>
              </div>
              <h3 className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Camera className="w-4 h-4 text-purple-500" />
                Full Dashboard PNG
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Captures a crisp, 2x retina snapshot of the entire active Brand Bible dashboard for slide presentations &amp; quick client sharing.
              </p>
            </div>
            <button
              id="card-trigger-dashboard-png-btn"
              onClick={handleDownloadDashboardPng}
              disabled={isExportingPng}
              className="mt-4 w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer disabled:opacity-50"
            >
              {isExportingPng ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Capturing Canvas...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture PNG Snapshot</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable, Zoomable Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md text-white select-none overflow-hidden"
          >
            {/* Top Bar Controls */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-sm z-10 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold font-sans">
                  Logo Iteration {lightboxIndex + 1} of {allLogos.length}
                </span>
                {allLogos[lightboxIndex] === bible.primaryLogo && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-sans">
                    <CheckCircle className="w-3.5 h-3.5" /> Primary Brand Mark
                  </span>
                )}
              </div>

              {/* Zoom slider & Button Toolbar */}
              <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 px-4 py-1.5 rounded-full text-xs font-sans">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-slate-800 rounded transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.1"
                    value={lightboxZoom}
                    onChange={(e) => setLightboxZoom(parseFloat(e.target.value))}
                    className="w-24 accent-indigo-500 h-1 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-[10px] w-8 text-right font-bold">
                    {Math.round(lightboxZoom * 100)}%
                  </span>
                </div>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-slate-800 rounded transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="h-4 w-[1px] bg-slate-800" />
                <button
                  onClick={handleResetZoom}
                  className="px-2.5 py-1 hover:bg-slate-800 rounded-md transition text-[10px] font-bold cursor-pointer"
                  title="Reset Zoom"
                >
                  Reset
                </button>
              </div>

              <div className="flex items-center gap-2 z-10">
                {allLogos[lightboxIndex] !== bible.primaryLogo && (
                  <button
                    onClick={handleSetPrimaryFromLightbox}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
                  >
                    <Check className="w-3.5 h-3.5" /> Use as Primary
                  </button>
                )}
                <button
                  onClick={handleDownloadLogoFromLightbox}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-full transition cursor-pointer"
                  title="Download Iteration"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={closeLightbox}
                  className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-200 hover:text-white rounded-full transition cursor-pointer ml-1"
                  title="Close Lightbox"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Middle Container: Navigator + Image Canvas */}
            <div className="flex-1 flex items-center justify-between relative">
              {/* Left Scroll Trigger */}
              <button
                onClick={handlePrevLogo}
                className="absolute left-6 z-10 p-4 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-white rounded-full transition shadow-xl hover:scale-110 cursor-pointer"
                title="Previous Logo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Central Zoom & Drag Stage */}
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing relative"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div
                  className="transition-transform duration-75 ease-out select-none"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${lightboxZoom})`,
                  }}
                >
                  <img
                    src={allLogos[lightboxIndex]}
                    alt={`Logo Iteration ${lightboxIndex + 1}`}
                    className="max-h-[75vh] max-w-[85vw] object-contain rounded-2xl bg-slate-900/40 p-4 border border-slate-800/40 shadow-2xl pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Right Scroll Trigger */}
              <button
                onClick={handleNextLogo}
                className="absolute right-6 z-10 p-4 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-white rounded-full transition shadow-xl hover:scale-110 cursor-pointer"
                title="Next Logo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Help Drawer */}
            <div className="p-3 bg-slate-900/40 border-t border-slate-800/60 text-center text-[10px] text-slate-400 font-sans tracking-wide shrink-0">
              <span className="font-semibold text-slate-300">Tips:</span> Scroll your wheel or pinch to zoom. Left-click and drag anywhere to pan around the artwork. Use left/right arrow buttons to scroll iterations.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Logo Comparison & Selection Overlay */}
      <AnimatePresence>
        {isLogoHistoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className={`w-full max-w-6xl max-h-[92vh] h-[88vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden font-sans ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Header */}
              <div className={`p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 ${
                isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/80'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-md shadow-indigo-500/20 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Logo Version Comparison &amp; Selection
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {allLogos.length} Variations
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Compare saved logo versions side-by-side or in a grid to pick your favorite active primary mark.
                    </p>
                  </div>
                </div>

                {/* Controls: View Mode & Canvas Background */}
                <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
                  {/* Mode Switcher */}
                  <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <button
                      id="mode-grid-btn"
                      onClick={() => setOverlayViewMode('grid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        overlayViewMode === 'grid'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Grid</span>
                    </button>

                    <button
                      id="mode-carousel-btn"
                      onClick={() => setOverlayViewMode('carousel')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        overlayViewMode === 'carousel'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Fullscreen Carousel View"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Carousel</span>
                    </button>

                    <button
                      id="mode-compare-btn"
                      onClick={() => setOverlayViewMode('compare')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        overlayViewMode === 'compare'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Side-by-Side Comparison"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>Compare (2)</span>
                    </button>
                  </div>

                  {/* Canvas Background selector */}
                  <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <button
                      onClick={() => setOverlayBg('dark')}
                      className={`w-6 h-6 rounded-md bg-slate-900 border ${overlayBg === 'dark' ? 'ring-2 ring-indigo-500 border-indigo-400' : 'border-slate-700'} cursor-pointer`}
                      title="Dark Background Canvas"
                    />
                    <button
                      onClick={() => setOverlayBg('light')}
                      className={`w-6 h-6 rounded-md bg-white border ${overlayBg === 'light' ? 'ring-2 ring-indigo-500 border-indigo-400' : 'border-slate-300'} cursor-pointer`}
                      title="Light Background Canvas"
                    />
                    <button
                      onClick={() => setOverlayBg('checker')}
                      className={`w-6 h-6 rounded-md bg-slate-800 border ${overlayBg === 'checker' ? 'ring-2 ring-indigo-500 border-indigo-400' : 'border-slate-700'} relative overflow-hidden cursor-pointer`}
                      title="Checkerboard Background Canvas"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:6px_6px] opacity-60" />
                    </button>
                  </div>

                  <button
                    onClick={() => setIsLogoHistoryOpen(false)}
                    className={`p-2 rounded-full transition cursor-pointer ${
                      isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                    title="Close Comparison Overlay (Esc)"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {/* 1. GRID VIEW MODE */}
                {overlayViewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {allLogos.map((logoUrl, index) => {
                      const isActive = logoUrl === bible.primaryLogo;
                      const isFav = favoriteLogos.includes(logoUrl);
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ y: -6, scale: 1.025, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                          whileTap={{ scale: 0.98 }}
                          className={`border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 relative group cursor-pointer ${
                            isActive
                              ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/15'
                              : isDark
                                ? 'border-slate-800 bg-slate-950/60 hover:border-indigo-500/40 hover:shadow-lg'
                                : 'border-slate-200 bg-slate-50/70 hover:border-indigo-500/40 hover:shadow-lg'
                          }`}
                        >
                          {/* Canvas Box */}
                          <div className={`rounded-xl border p-4 flex items-center justify-center h-48 relative overflow-hidden transition-all duration-300 ${
                            overlayBg === 'light'
                              ? 'bg-white border-slate-200'
                              : overlayBg === 'checker'
                                ? 'bg-slate-900 border-slate-800 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:10px_10px]'
                                : 'bg-slate-900 border-slate-800'
                          }`}>
                            <img
                              src={logoUrl}
                              alt={`Logo Version ${index + 1}`}
                              className="max-h-full max-w-full object-contain p-2 transition duration-200 group-hover:scale-105"
          xúÏZkS€H˝û_—„§ÇôâlŸ'∞
SCUxÏd∑ñ¢í∂›ñ{ê‘™VL<˛Ôsª%[Ônª3S[Òc§~ﬂsœ=˜J?úLÁÑ_2óéüY´KçW%Ì◊üˆ˛+Ì˝E˚GÙO†!;$D?∂ó⁄Ê{czèF.√sÏëACÊŒAÇV∑µç\2Í«ƒ%sDÒBkD|A8rp`u‡Œ7´c7ˆµ”¿DaÄ˝‘LãØ¡‹Í¢‡—≤aŒf˛òåë sa›tÏ`~ã&Ãñ«|˝2wå¬)≥+Ù–õÖaBÑh¯Û;tÄ6Üé∫Xkg€nÔÿ—4—ïûm£!„cÿOÙ'æ˛¡∂7–ÆÍ˙0ÖmÁ∫ΩØË÷ÖnÜÖ-ø.MáÖ–˝Ç¬ÅÃ—O®£7 úl[≠i»GÇﬁÙˆ-jÁœõ´Á@<¬±;∂∂Ì¯(‘¡†;ZìôÎ∆∆‹Y€RY∞F)À™∂!ˆC#¶‘Bèßdtó^ÈÉ’CS´◊ WAÒñ/9ı04Ô∫÷Qn\™>U√K∆˜åSÂjé„*èCú:Sav⁄·LÊñ…¸c‡ñª¡¢I6—`ôÜ¥BXƒ%gv∞†Ãon˛√ÿ)Z˝j3üò√ö.|˝ ]cÁ•	⁄i∫(0ì:+ı+¢°ˆÜxt7ÜçXCw∆ë‡ '*w§»
çf<d‹
U¨≈%∞√òJ8Iﬁ	b¯z„iƒ|c€Ì~Ü8∂†ﬂî›æ´.™±íkôé;u®ƒ–BP·¬È≠ñﬂ∏"LÑ&úyk ÜXs„Lr%◊W˙°ç|ˇ¡\d,é	fö™Ô7Î%mL®ÎZ`t†No∂%„úv¯v‰5¸Ïy≤è§˘C$ˇqÒ„Û#ıC",`ˇtLÉ”å® D 1∞"ÉÆÆv$\ég\9òå%î¯€,tÚòf». ∑[#Ã÷¢Ü49‘‰Ñ`€—·cÿaH‹S¢ö*P’ äÙü)y8cc“‹≈cm‘¡»(±"ﬂÃπV«Œ8$xä	%M ±CªN⁄lÍÁÑq/3a,0ä^¬…O‰óçˇ0√∑ü»=ú`≠Œ÷4Ñ96Ó…¡O˝lh‹ˇ€jòº+Ì_˙vãû®+j‚≥Ä–)ˆ«.π"°x6 òAëá ñ:ÃÍßi7æñ◊6:0÷–à∑*)9´bêdjÛ@œOuR#ıÙí±Å¶ÖíSåIÆ<ı'Ã@Óyj˜(∆jÒ@à¡bnR•≈<'…c‚Ï¶#±Ä´Ù$+TL]Hn‘»NaÕ*¶†◊usá:r˜i˛ÃÛÁN2∂P*€PWRÆùR^Ò’D{IÁ.ı…}÷Ï(◊DH7ÆóÖ‘Û*Ì¡<jØÌ1	îñ¶UE4^ñŒ[1¥-\ìû⁄m°„√´ã_ØO>°œß'ˇBgOJ}v¡≤rîHâHÏ∫0aÀ%æ#¶hŸU@Õ˚Ωry˘eçò´`ê›ˆ+¸>7Ë‚+'‡µ“]¢x··πı`uÁ.ÍNKzp!. ÷≥LÇç[ÆNY‚;r¢≥reíTùF$é'‘1vÛ≥åd!\óÆd≥¢B±EÍÈé«ªñ#ˇ¬∂õØ∑ﬁoo˜wæ cæS`ô%»ˇ7o—çLÚu†VHøë]Y7˙¢äG∫ïÏVRﬁW√¿{‘s*Á˘h∞XÅÙÜïË€jW∆Æ D%Ã˛fQ6Ä"zM&òu ∆ióÍ'˛FFº¿$h  ∆ñó|Êìj˛{F≥∫|)ô·2¬à˝tïKSê…ó™º% —-Ô«? «6†4œ'Í bT¯π©·›≤dQUO∑‡D{πÚD:y|_ñ˝ßUhE}2-@ÎÜ¨X\™ÑŒ5?¡
—!ÁÏa≥™ó&íÄ~ºÁÃWÉdT§ÃÛ∑5*“Â˛g6.≥ÔX>∂ÒOO∑qTá˙˘GÕ+UR|©Ö£Q˛ã&÷â˙ÅæUQ8ﬁ™î„Ö
vFÊû+d∏F‚W0b¥»°´í¡¥¬€.– „!∫§DäR6÷´s≥.7*r˝¢¥z4eÑ`.=Â—Í\•~R^"Û©~L%ÓµùHõëñ=tX’6π≥¬Â~úd3{S>f"Õ
#T¶O‘Ì=–ÌgóáW'œìÌÃìÚ≠\µP∑Ælw8#˘%e{huê7ﬁM˛Ì*{˜%∆™∏AÓ%äXjE4ÿÑ.´~ÓR–¯rÇ!_#°X*ı{˘CÀ gì´AMıÆS±πcéµ°π.‚5,,ÒÆ§§∆#Ó±;ÉSçÒ!qq®HEG)@W@QY?›pú†y>ÛÜÑ7IK`Ó—R3È‚{ˆëSëhíÿD÷ì K?yJê`x¢Tf‰|&Ú>[¶ÓÊûGûn\ô≈D]≤†£Æ$ºy8h6øºCTùΩæ*¥«≈Ãw‰q∞†ÀïπÈrˇ3·a\∞äBh˘Ë≠"çbòÉ3kF¨π?,⁄kGËVÆ≥9∞ÆB®¬eR".‰ïõîä∏ñ§r®gum≠¶@<±SN≠˛÷u›t%°L'Â*	lñÙEÇÍb¿üùÚ?3±7ºê!ì˚\_ ™€• ‘ëΩëº—xj÷›–f”:ï]âùƒñ10÷ÙﬂÉ`Â&ˇ“ xÙ“ xÙ=~Ç©œ_èæ¡ˇﬂ xTÇG∑ X˚F¡GJ⁄U=@+øæqØ}ËÉr…IH¸Y«ÊË•]
tLË(*˜'°xØ–s5˙B®~π‹y/YHfÂ‘ßê6X,VÔ+Ì"˚ÇÔ.¸Qo-¿Ö÷Œv˛]ÕüÈÿQì~ù|'2ß¢d™é~™Ã≥s:'c¿∞ÃìrCïZ˚Ëõˆ´RR/CÒÎ9=R(ıí◊Lã\P'2}»‘§ÍG•ùºf„Ph9¢^mÕøê¬©gŸäGWô(!àcÊ2æãHZS8âe·’:}°Tízc?BYÀ#aà≤,cÛÚc±NØpﬁÙaÂWK◊	≠Nvóπ‚˘[˜VedÜ‹[ûûku≤Âæº˜Ô˝ªnIØ¨˜"Ô?ïKƒq5„œËd0.–c7Õó„ItK›YœB√ãÄ¯ÉE8eŸ&…KS∞ê§Lq]h›ú`7$)√(Ì1X®?À‘t“AÒ+,…u<SqE‰p*í“ãêì*¿Bb<ΩCÄÃ¬{àk¨,P∫›Æ¸BøˇÀ¢ë¯%êâ‰∆æ=h≈w7^˜{˝˛§≥Åñôw‰®‘#l&öeê|áz€∂ùÍ±&ßv•ΩÆß—'p¬¢Ω‘=y´⁄^™I-[%-_dßÀÎ¿ª]æ˙  ˇˇ µ‘’