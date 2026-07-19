import React, { useState, useEffect } from 'react';
import { BrandBible, Color, BrandArchetype, BrandPattern, BrandFavicon } from '../types';
import { Palette, Type, CheckCircle, XCircle, Copy, Check, Download, RefreshCw, FileImage, ShieldCheck, AlignLeft, Eye, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, Shuffle, History, Compass, Sparkles, Layers, Grid, Globe, Activity, ThumbsUp, BarChart3, TrendingUp } from 'lucide-react';
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
  onUpdateFavicon
}: BrandBibleDashboardProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [contrastBg, setContrastBg] = useState<string>(bible.colorPalette[0]?.hex || '#ffffff');
  const [contrastText, setContrastText] = useState<string>(bible.colorPalette[1]?.hex || '#0f172a');
  const [pairwiseTab, setPairwiseTab] = useState<'matrix' | 'list'>('matrix');

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

  const [isLogoHistoryOpen, setIsLogoHistoryOpen] = useState(false);

  const handleRestoreLogo = (logoUrl: string) => {
    onUpdateLogo(logoUrl);
    setToast({
      message: "Successfully restored brand logo variation as active primary mark!",
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
      const response = await fetch('/api/brand/shuffle-palette', {
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

      if (!response.ok) {
        throw new Error("Failed to shuffle palette.");
      }

      const data = await response.json();
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

  // Archetype states & generation
  const [isGeneratingArchetype, setIsGeneratingArchetype] = useState(false);

  const handleGenerateArchetype = async () => {
    setIsGeneratingArchetype(true);
    try {
      const response = await fetch('/api/brand/generate-archetype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: bible.companyName,
          mission: bible.mission,
          industry: bible.industry,
          targetAudience: bible.targetAudience
        })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze brand archetype.");
      }

      const data = await response.json();
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

  // Pattern states & generation
  const [isGeneratingPattern, setIsGeneratingPattern] = useState(false);
  const [selectedPatternStyle, setSelectedPatternStyle] = useState('Modern Minimal Grid');
  const [patternOverlayMode, setPatternOverlayMode] = useState<'light' | 'dark' | 'color'>('light');
  const [isPatternCopied, setIsPatternCopied] = useState(false);

  const handleGeneratePattern = async (styleOverride?: string) => {
    setIsGeneratingPattern(true);
    const styleToUse = styleOverride || selectedPatternStyle;
    try {
      const response = await fetch('/api/brand/generate-pattern', {
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

      if (!response.ok) {
        throw new Error("Failed to generate pattern.");
      }

      const data = await response.json();
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

  // Lightbox & Gallery State
  const allLogos = bible.previousLogos || (bible.primaryLogo ? [bible.primaryLogo] : []);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  const handleDownloadLogoFromLightbox = async () => {
    if (lightboxIndex === null) return;
    const logoUrl = allLogos[lightboxIndex];
    try {
      const link = document.createElement('a');
      link.href = logoUrl;
      link.download = `${bible.companyName.toLowerCase().replace(/\s+/g, '-')}-logo-v${lightboxIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
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

  const handleDownloadLogo = async () => {
    if (!bible.primaryLogo) return;
    try {
      setDownloading(true);
      const link = document.createElement('a');
      link.href = bible.primaryLogo;
      link.download = `${bible.companyName.toLowerCase().replace(/\s+/g, '-')}-logo.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
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
      const response = await fetch('/api/brand/generate-favicon', {
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

      if (!response.ok) {
        throw new Error("Failed to generate brand favicon.");
      }

      const data = await response.json();
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
            {bible.primaryLogo && (
              <button
                id="dashboard-download-logo-btn"
                onClick={handleDownloadLogo}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-bold rounded-full flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Brand Assets
              </button>
            )}
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
              <div className="flex items-center gap-2 shrink-0">
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

            {/* Logo Viewer Stage */}
            <div className={`rounded-2xl border p-8 flex flex-col items-center justify-center min-h-[240px] relative overflow-hidden group transition-all duration-300 ${
              isDark ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'
            }`}>
              {isLoadingLogo ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center font-sans">
                  <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <div>
                    <p className={`text-xs font-bold transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Synthesizing Creative Visual Mark...</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-relaxed">Drawing abstract elements with gemini-3-pro-image-preview</p>
                  </div>
                </div>
              ) : bible.primaryLogo ? (
                <div className="relative group/logo">
                  <img
                    src={bible.primaryLogo}
                    alt="Primary Brand Logo"
                    className={`max-h-48 max-w-full object-contain rounded-xl shadow-sm p-3 transition duration-200 group-hover/logo:scale-102 ${
                      isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white mix-blend-multiply'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating Download Button (Permanently visible) */}
                  <button
                    id="floating-download-logo-btn"
                    onClick={handleDownloadLogo}
                    disabled={downloading}
                    className="absolute -top-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition transform hover:scale-110 active:scale-95 cursor-pointer z-10"
                    title="Download PNG to device"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center gap-2">
                    <button
                      id="stage-download-logo-btn"
                      onClick={handleDownloadLogo}
                      className="bg-white hover:bg-slate-50 text-slate-800 p-2.5 rounded-full shadow-md transition cursor-pointer"
                      title="Download PNG File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      id="stage-edit-prompt-btn"
                      onClick={() => setShowPromptEditor(!showPromptEditor)}
                      className="bg-white hover:bg-slate-50 text-slate-800 p-2.5 rounded-full shadow-md transition cursor-pointer"
                      title="Refine Logo Style"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
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
            </div>

            {/* Logo Gallery Tray */}
            {allLogos.length > 0 && (
              <div id="logo-gallery-tray" className="space-y-2 mt-4 font-sans">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Generated Logo History ({allLogos.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setIsLogoHistoryOpen(true)}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <History className="w-3 h-3" /> View Logo History Modal
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
                  {allLogos.map((logoUrl, index) => {
                    const isActive = logoUrl === bible.primaryLogo;
                    return (
                      <div
                        id={`gallery-thumb-${index}`}
                        key={index}
                        onClick={() => openLightbox(index)}
                        className={`relative w-16 h-16 rounded-xl border p-1 shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 group overflow-hidden ${
                          isActive
                            ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500/15'
                            : isDark
                              ? 'border-slate-800 bg-slate-950 hover:border-slate-700'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={logoUrl}
                          alt={`Logo version ${index + 1}`}
                          className="w-full h-full object-contain rounded-lg"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center rounded-xl">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                        {isActive && (
                          <span className="absolute top-1 right-1 bg-indigo-600 text-white p-0.5 rounded-full text-[8px] z-10">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white px-1 py-0.5 rounded text-[8px] font-mono scale-90 origin-bottom-left">
                          v{index + 1}
                        </span>
                      </div>
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
                          🗣️ {word}
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
                      <span className="text-[10px] text-slate-400 font-normal hover:text-red-500 ml-1 cursor-pointer">×</span>
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
                {calculateColorData().map((color, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between font-sans ${
                    isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/50 border-slate-200/80'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-4 h-4 rounded-full shrink-0 border border-slate-200/10 shadow-sm" style={{ backgroundColor: color.hex }} />
                      <div className="min-w-0">
                        <p className={`text-[11px] font-extrabold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {color.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium truncate uppercase tracking-tight">
                          {color.role}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {color.value}%
                    </span>
                  </div>
                ))}
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
              onClick={handleShufflePalette}
              disabled={isShuffling}
              className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-full text-xs font-extrabold flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-500/10 active:scale-95 cursor-pointer`}
            >
              <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
              {isShuffling ? 'Shuffling...' : 'Shuffle Palette'}
            </button>
          </div>
        </div>

        {/* Color Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {bible.colorPalette.map((color, colorIdx) => {
            const isWhiteOrLight = ['ffffff', 'f8fafc', 'f1f5f9', 'f9fafb', 'ffffff'].includes(color.hex.toLowerCase().replace('#', ''));
            const isPrimary = (color.role || '').toLowerCase().trim() === 'primary' || (
              !bible.colorPalette.some(c => (c.role || '').toLowerCase().trim() === 'primary') && colorIdx === 0
            );
            return (
              <div
                id={`color-block-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                key={color.hex}
                onClick={() => copyToClipboard(color.hex, color.name)}
                className="group border border-slate-200/80 rounded-2xl p-4 cursor-pointer hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                style={{ backgroundColor: color.hex }}
              >
                {/* Visual feedback overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition" />

                {/* Color detail text box */}
                <div className={`p-3 rounded-xl backdrop-blur-md border shadow-sm z-10 transition duration-150 ${
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
                  <span className="text-[10px] font-mono font-bold tracking-wide mt-0.5 block">{color.hex}</span>
                </div>

                {/* Usage instruction line */}
                <p className={`text-[9px] leading-snug mt-4 font-sans font-semibold line-clamp-3 z-10 p-2.5 rounded-lg ${
                  isWhiteOrLight || color.role.toLowerCase().includes('light')
                    ? 'bg-slate-900/10 text-slate-800'
                    : 'bg-white/30 text-white drop-shadow-sm'
                }`}>
                  {color.usageNote}
                </p>
              </div>
            );
          })}
        </div>

        {/* Dynamic Divider */}
        <div className={`my-8 border-t transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-150'}`} />

        {/* Accessibility Contrast Analyzer Section */}
        <div id="brand-contrast-analyzer" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
            <div>
              <span className="text-[9px] font-extrabold bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-full uppercase tracking-wider block w-fit mb-1.5 font-sans">
                WCAG 2.1 Compliance Auditor
              </span>
              <h3 className={`text-sm font-bold flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Activity className="w-4 h-4 text-indigo-500" />
                Color Contrast & Pairing Compliance
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Evaluate background and text pairing compliance against the W3C Web Content Accessibility Guidelines.
              </p>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 font-sans ${
              isDark ? 'bg-indigo-950/40 border-indigo-900/50 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}>
              W3C Standard AAA/AA Compliance
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Interactive Selector Column */}
            <div className="lg:col-span-6 space-y-5 text-left">
              {/* Background Selector */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-400 block mb-2 font-sans">
                  1. Choose Background Color
                </span>
                <div className="flex flex-wrap gap-2">
                  {bible.colorPalette.map((color) => (
                    <button
                      id={`analyzer-bg-choice-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                      key={`bg-${color.hex}`}
                      onClick={() => setContrastBg(color.hex)}
                      className={`px-3 py-2 rounded-xl border text-[11px] font-bold font-sans flex items-center gap-2 transition duration-200 active:scale-95 cursor-pointer ${
                        contrastBg.toLowerCase() === color.hex.toLowerCase() || (color.hex.startsWith('#') ? contrastBg.toLowerCase() === color.hex.toLowerCase() : contrastBg.toLowerCase() === `#${color.hex.toLowerCase()}`)
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/5'
                          : isDark
                            ? 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-300 hover:text-white'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                      <span>{color.name}</span>
                    </button>
                  ))}
                  {/* Standard White and Black */}
                  <button
                    id="analyzer-bg-choice-white"
                    onClick={() => setContrastBg('#ffffff')}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-bold font-sans flex items-center gap-2 transition duration-200 active:scale-95 cursor-pointer ${
                      contrastBg === '#ffffff' || contrastBg.toLowerCase() === '#ffffff'
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/5'
                        : isDark
                          ? 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-300 hover:text-white'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-white shrink-0" />
                    <span>Pure White</span>
                  </button>
                  <button
                    id="analyzer-bg-choice-dark"
                    onClick={() => setContrastBg('#0f172a')}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-bold font-sans flex items-center gap-2 transition duration-200 active:scale-95 cursor-pointer ${
                      contrastBg === '#0f172a' || contrastBg.toLowerCase() === '#0f172a'
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/5'
                        : isDark
                          ? 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-300 hover:text-white'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-800 bg-[#0f172a] shrink-0" />
                    <span>Slate Dark</span>
                  </button>
                </div>
              </div>

              {/* Text Color Selector */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-400 block mb-2 font-sans">
                  2. Choose Text / Foreground Color
                </span>
                <div className="flex flex-wrap gap-2">
                  {bible.colorPalette.map((color) => (
                    <button
                      id={`analyzer-fg-choice-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                      key={`text-${color.hex}`}
                      onClick={() => setContrastText(color.hex)}
                      className={`px-3 py-2 rounded-xl border text-[11px] font-bold font-sans flex items-center gap-2 transition duration-200 active:scale-95 cursor-pointer ${
                        contrastText.toLowerCase() === color.hex.toLowerCase() || (color.hex.startsWith('#') ? contrastText.toLowerCase() === color.hex.toLowerCase() : contrastText.toLowerCase() === `#${color.hex.toLowerCase()}`)
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/5'
                          : isDark
                            ? 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-300 hover:text-white'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                      <span>{color.name}</span>
                    </button>
                  ))}
                  {/* Standard White and Black */}
                  <button
                    id="analyzer-fg-choice-white"
                    onClick={() => setContrastText('#ffffff')}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-bold font-sans flex items-center gap-2 transition duration-200 active:scale-95 cursor-pointer ${
                      contrastText === '#ffffff' || contrastText.toLowerCase() === '#ffffff'
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/5'
                        : isDark
                          ? 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-300 hover:text-white'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-white shrink-0" />
                    <span>Pure White</span>
                  </button>
                  <button
                    id="analyzer-fg-choice-dark"
                    onClick={() => setContrastText('#0f172a')}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-bold font-sans flex items-center gap-2 transition duration-200 active:scale-95 cursor-pointer ${
                      contrastText === '#0f172a' || contrastText.toLowerCase() === '#0f172a'
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-500/5'
                        : isDark
                          ? 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-300 hover:text-white'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-800 bg-[#0f172a] shrink-0" />
                    <span>Slate Dark</span>
                  </button>
                </div>
              </div>

              {/* Scoring Analysis Card */}
              <div className={`p-5 border rounded-2xl ${isDark ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50/80 border-slate-200/80'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  {/* Left big score */}
                  <div className="text-center sm:text-left shrink-0">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Contrast Ratio</span>
                    <span className="text-4xl font-black text-indigo-500 tracking-tight">{getContrastRatio(contrastBg, contrastText).toFixed(2)}:1</span>
                  </div>

                  {/* Right compliance badges */}
                  <div className="flex-1 space-y-3.5 sm:pl-6 sm:border-l sm:border-slate-200 sm:dark:border-slate-800">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700 font-sans'}>Normal Body Text (&lt; 18px)</span>
                        {getContrastRatio(contrastBg, contrastText) >= 4.5 ? (
                          <span className="text-emerald-500 flex items-center gap-1 font-extrabold text-[11px] font-sans">
                            <CheckCircle className="w-4 h-4 text-emerald-500" /> {getContrastRatio(contrastBg, contrastText) >= 7.0 ? 'AAA Pass' : 'AA Pass'}
                          </span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-1 font-extrabold text-[11px] font-sans">
                            <XCircle className="w-4 h-4 text-rose-500" /> Fail
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed font-sans">Requires at least 4.5:1 ratio for regular paragraph body copy.</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold border-t pt-2.5 dark:border-slate-800">
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700 font-sans'}>Large Headings (&gt; 18px / Bold)</span>
                        {getContrastRatio(contrastBg, contrastText) >= 3.0 ? (
                          <span className="text-emerald-500 flex items-center gap-1 font-extrabold text-[11px] font-sans">
                            <CheckCircle className="w-4 h-4 text-emerald-500" /> {getContrastRatio(contrastBg, contrastText) >= 4.5 ? 'AAA Pass' : 'AA Pass'}
                          </span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-1 font-extrabold text-[11px] font-sans">
                            <XCircle className="w-4 h-4 text-rose-500" /> Fail
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed font-sans">Requires at least 3.0:1 ratio for large titles, headlines, or callouts.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Rendering Sandbox Column */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div 
                className="w-full h-full rounded-2xl p-8 border flex flex-col justify-between min-h-[300px] transition-all duration-300 relative overflow-hidden shadow-inner text-left"
                style={{ backgroundColor: contrastBg }}
              >
                {/* Visual marker inside background */}
                <div className="absolute top-4 right-4 px-2.5 py-1.5 bg-black/10 dark:bg-white/10 rounded-xl text-[9px] font-bold font-mono uppercase tracking-wider backdrop-blur-md opacity-75 animate-pulse" style={{ color: contrastText }}>
                  Live Contrast Preview
                </div>

                {/* Simulated heading and text */}
                <div className="space-y-4 pr-12">
                  <h1 
                    className="text-2xl font-black tracking-tight" 
                    style={{ 
                      color: contrastText,
                      fontFamily: `'${bible.typography.headerFont}', sans-serif`
                    }}
                  >
                    Interactive Accessibility Preview
                  </h1>
                  <p 
                    className="text-xs leading-relaxed font-semibold opacity-90" 
                    style={{ 
                      color: contrastText,
                      fontFamily: `'${bible.typography.bodyFont}', sans-serif`
                    }}
                  >
                    Adjust colors to test contrast limits live. This paragraph is rendered using your brand font, '{bible.typography.bodyFont}', enabling clear evaluation of typographical weight and readability.
                  </p>
                </div>

                {/* Simulated UI components */}
                <div className="flex flex-wrap gap-2.5 pt-6">
                  <button 
                    className="px-4 py-2 rounded-xl text-xs font-black shadow-sm transition active:scale-95 cursor-pointer"
                    style={{ 
                      backgroundColor: contrastText, 
                      color: contrastBg 
                    }}
                  >
                    Inverted Button Preview
                  </button>
                  <span 
                    className="px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center font-sans"
                    style={{ 
                      borderColor: `${contrastText}40`, 
                      color: contrastText 
                    }}
                  >
                    Outlined Badge
                  </span>
                </div>
              </div>
            </div>
          </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Detailed Font Cards */}
          <div className="lg:col-span-5 space-y-4 font-sans">
            {/* Header Font Card */}
            <div className={`p-5 border rounded-2xl transition-all duration-300 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
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
            </div>

            {/* Body Font Card */}
            <div className={`p-5 border rounded-2xl transition-all duration-300 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
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
            </div>
          </div>

          {/* Type Sandbox Sheet */}
          <div className={`lg:col-span-7 rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 ${
            isDark ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'
          }`}>
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
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">06 / Brand Guidelines</span>
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

      {/* Dedicated Logo History Modal */}
      <AnimatePresence>
        {isLogoHistoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className={`w-full max-w-4xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden font-sans ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Header */}
              <div className={`p-6 border-b flex items-center justify-between shrink-0 ${
                isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/60'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm shadow-indigo-500/20">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Logo Iteration History
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      View, compare, and restore any historically synthesized brand mark.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLogoHistoryOpen(false)}
                  className={`p-2 rounded-full transition cursor-pointer ${
                    isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Grid content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {allLogos.map((logoUrl, index) => {
                    const isActive = logoUrl === bible.primaryLogo;
                    return (
                      <div
                        key={index}
                        className={`border rounded-2xl p-4 flex flex-col justify-between transition-all duration-250 ${
                          isActive
                            ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/10 shadow-md shadow-indigo-500/5'
                            : isDark
                              ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}
                      >
                        {/* Image Canvas */}
                        <div className={`rounded-xl border p-4 flex items-center justify-center h-40 relative group overflow-hidden ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}>
                          <img
                            src={logoUrl}
                            alt={`Logo version ${index + 1}`}
                            className="max-h-full max-w-full object-contain p-2 transition duration-200 group-hover:scale-102"
                            referrerPolicy="no-referrer"
                          />
                          {/* Quick Hover Controls */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setIsLogoHistoryOpen(false);
                                openLightbox(index);
                              }}
                              className="bg-white hover:bg-slate-100 text-slate-800 p-2 rounded-full shadow-md transition cursor-pointer"
                              title="Full Screen Lightbox"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const link = document.createElement('a');
                                  link.href = logoUrl;
                                  link.download = `${bible.companyName.toLowerCase().replace(/\s+/g, '-')}-logo-v${index + 1}.png`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="bg-white hover:bg-slate-100 text-slate-800 p-2 rounded-full shadow-md transition cursor-pointer"
                              title="Download PNG File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {isActive && (
                            <span className="absolute top-2.5 right-2.5 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-sm font-sans">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                          <span className={`absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isDark ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600'
                          }`}>
                            Version {index + 1}
                          </span>
                        </div>

                        {/* Bottom Action buttons */}
                        <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2">
                          {isActive ? (
                            <div className="w-full text-center py-2 text-xs font-bold text-indigo-500 bg-indigo-500/10 rounded-xl font-sans">
                              Current Active Mark
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                handleRestoreLogo(logoUrl);
                              }}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition cursor-pointer font-sans shadow-sm"
                            >
                              Restore as Active Logo
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {allLogos.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm font-sans">
                    No logo variations have been generated yet.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`p-4 border-t text-center text-xs shrink-0 ${
                isDark ? 'border-slate-800 bg-slate-950/20 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}>
                Restoring a historic logo updates your Brand Bible's primary asset and syncs with color palette views instantly.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl font-sans text-xs transition-colors duration-300 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/50'
                : 'bg-white border-slate-100 text-slate-800 shadow-slate-200/50'
            }`}
          >
            <div
              className="w-5 h-5 rounded-full border border-white/20 shadow-inner shrink-0"
              style={{ backgroundColor: toast.hex }}
            />
            <div className="flex flex-col">
              <span className="font-extrabold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Copied!
              </span>
              <span className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {toast.message}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToast(null);
              }}
              className={`p-1 rounded-full transition ml-2 cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
