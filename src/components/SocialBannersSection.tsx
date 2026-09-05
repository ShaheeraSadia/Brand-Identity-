import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BrandBible } from '../types';
import {
  Share2, Download, Copy, Check, Eye, RefreshCw, Sliders, Layers, Grid,
  Sparkles, CheckCircle, Type, Palette, Layout, ShieldCheck, Image as ImageIcon,
  Maximize2, X, ChevronRight, ExternalLink, Zap, ArrowDownToLine, Info,
  Smartphone, Monitor, Globe, Award, MessageSquare, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_PATTERN_TEMPLATES, PatternType, generatePatternDataUrl } from '../utils/patternGenerator';

export interface SocialBannerPreset {
  id: string;
  name: string;
  platform: 'twitter' | 'linkedin' | 'youtube' | 'facebook' | 'instagram' | 'opengraph';
  platformName: string;
  category: 'banner' | 'post' | 'story';
  width: number;
  height: number;
  dimensionsLabel?: string;
  aspectRatioLabel: string;
  recommendedUse: string;
  hasSafeZone?: boolean;
  safeZoneType?: 'twitter' | 'linkedin' | 'youtube';
}

export const SOCIAL_BANNER_PRESETS: SocialBannerPreset[] = [
  {
    id: 'twitter-header',
    name: 'X / Twitter Profile Header',
    platform: 'twitter',
    platformName: 'X (Twitter)',
    category: 'banner',
    width: 1500,
    height: 500,
    aspectRatioLabel: '3:1 Banner',
    recommendedUse: 'High-impact profile banner with bottom-left avatar safe zone.',
    hasSafeZone: true,
    safeZoneType: 'twitter'
  },
  {
    id: 'linkedin-company-cover',
    name: 'LinkedIn Company Page Banner',
    platform: 'linkedin',
    platformName: 'LinkedIn',
    category: 'banner',
    width: 1584,
    height: 396,
    aspectRatioLabel: '4:1 Panoramic',
    recommendedUse: 'Corporate overview banner for company pages and talent recruitment.',
    hasSafeZone: true,
    safeZoneType: 'linkedin'
  },
  {
    id: 'linkedin-personal-banner',
    name: 'LinkedIn Personal Profile Cover',
    platform: 'linkedin',
    platformName: 'LinkedIn',
    category: 'banner',
    width: 1584,
    height: 396,
    aspectRatioLabel: '4:1 Panoramic',
    recommendedUse: 'Executive & founder branding banner with left avatar clearance.',
    hasSafeZone: true,
    safeZoneType: 'linkedin'
  },
  {
    id: 'youtube-channel-art',
    name: 'YouTube Channel Banner',
    platform: 'youtube',
    platformName: 'YouTube',
    category: 'banner',
    width: 2560,
    height: 1440,
    aspectRatioLabel: '16:9 Widescreen',
    recommendedUse: 'Responsive channel art with 1546 × 423 px central safe zone.',
    hasSafeZone: true,
    safeZoneType: 'youtube'
  },
  {
    id: 'facebook-page-cover',
    name: 'Facebook Page Cover Banner',
    platform: 'facebook',
    platformName: 'Facebook',
    category: 'banner',
    width: 1200,
    height: 675,
    aspectRatioLabel: '16:9 Cover',
    recommendedUse: 'Community & enterprise marketing page cover header.',
    hasSafeZone: false
  },
  {
    id: 'opengraph-social-share',
    name: 'OpenGraph / Web Share Preview Card',
    platform: 'opengraph',
    platformName: 'Web & OpenGraph',
    category: 'banner',
    width: 1200,
    height: 630,
    aspectRatioLabel: '1.91:1 Card',
    recommendedUse: 'Rich preview image for website links shared on Slack, Discord, & Twitter.',
    hasSafeZone: false
  },
  {
    id: 'instagram-square-post',
    name: 'Instagram & Social Post Template',
    platform: 'instagram',
    platformName: 'Instagram',
    category: 'post',
    width: 1080,
    height: 1080,
    aspectRatioLabel: '1:1 Square',
    recommendedUse: 'Square marketing graphic for announcements, quotes, and features.',
    hasSafeZone: false
  },
  {
    id: 'instagram-vertical-story',
    name: 'Instagram Story / Vertical Reel',
    platform: 'instagram',
    platformName: 'Instagram',
    category: 'story',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16 Vertical',
    recommendedUse: 'Full-screen mobile story template for campaigns and event spotlights.',
    hasSafeZone: false
  }
];

export type TemplateStyle = 'hero' | 'launch' | 'quote' | 'metric' | 'pattern' | 'split';

interface SocialBannersSectionProps {
  bible: BrandBible;
  isDark?: boolean;
  onShowToast?: (message: string, hex?: string) => void;
}

export const SocialBannersSection: React.FC<SocialBannersSectionProps> = ({
  bible,
  isDark = false,
  onShowToast
}) => {
  // Active selected preset & template
  const [selectedPresetId, setSelectedPresetId] = useState<string>('twitter-header');
  const [templateStyle, setTemplateStyle] = useState<TemplateStyle>('hero');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Active brand colors & theme
  const primaryColor = bible.colorPalette?.[0]?.hex || '#4f46e5';
  const secondaryColor = bible.colorPalette?.[1]?.hex || '#06b6d4';
  const accentColor = bible.colorPalette?.[2]?.hex || '#f59e0b';
  const darkNeutral = bible.colorPalette?.[3]?.hex || '#0f172a';
  const lightNeutral = bible.colorPalette?.[4]?.hex || '#f8fafc';

  const [colorTheme, setColorTheme] = useState<'primary' | 'dark' | 'light' | 'gradient' | 'custom'>('dark');
  const [customBgColor, setCustomBgColor] = useState<string>(darkNeutral);
  const [customTextColor, setCustomTextColor] = useState<string>('#ffffff');
  const [customAccentColor, setCustomAccentColor] = useState<string>(primaryColor);
  const [customSubtitleColor, setCustomSubtitleColor] = useState<string>('#94a3b8');

  // Content Customization
  const [headline, setHeadline] = useState<string>(
    bible.companyName ? `${bible.companyName}` : 'Empowering The Next Era'
  );
  const [tagline, setTagline] = useState<string>(
    bible.mission || 'Designing intuitive experiences and scalable brand systems.'
  );
  const [badgeText, setBadgeText] = useState<string>('OFFICIAL BRAND');
  const [handleText, setHandleText] = useState<string>(
    `@${(bible.companyName || 'brand').toLowerCase().replace(/\s+/g, '')} • ${(bible.companyName || 'brand').toLowerCase().replace(/\s+/g, '')}.io`
  );
  const [ctaText, setCtaText] = useState<string>('Explore Ecosystem');
  const [quoteAuthor, setQuoteAuthor] = useState<string>('Founder & CEO');
  const [metricNumber, setMetricNumber] = useState<string>('99.9%');
  const [metricLabel, setMetricLabel] = useState<string>('Client Satisfaction & Reliability');

  // Design Toggles & Controls
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [logoMode, setLogoMode] = useState<'primary' | 'monogram' | 'secondary'>('primary');
  const [logoScale, setLogoScale] = useState<'small' | 'medium' | 'large'>('medium');
  const [logoPosition, setLogoPosition] = useState<'left' | 'center' | 'right'>('left');
  
  const [useHeaderFont, setUseHeaderFont] = useState<boolean>(true);
  const [fontScale, setFontScale] = useState<number>(100); // 80 to 140%
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  
  const [enablePattern, setEnablePattern] = useState<boolean>(true);
  const [patternType, setPatternType] = useState<PatternType>('dots');
  const [patternOpacity, setPatternOpacity] = useState<number>(15);
  const [patternScale, setPatternScale] = useState<number>(1.2);
  
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [showGridGuide, setShowGridGuide] = useState<boolean>(false);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isBatchExporting, setIsBatchExporting] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [copiedClipboard, setCopiedClipboard] = useState<boolean>(false);
  const [fullscreenModal, setFullscreenModal] = useState<boolean>(false);

  // Hidden Canvas Ref for export
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Preset Object
  const activePreset = SOCIAL_BANNER_PRESETS.find(p => p.id === selectedPresetId) || SOCIAL_BANNER_PRESETS[0];

  // Derive active colors based on theme
  const getThemeColors = useCallback(() => {
    switch (colorTheme) {
      case 'primary':
        return {
          bg: primaryColor,
          text: '#ffffff',
          accent: accentColor,
          subtext: 'rgba(255, 255, 255, 0.85)',
          isGradient: false
        };
      case 'dark':
        return {
          bg: darkNeutral,
          text: '#ffffff',
          accent: primaryColor,
          subtext: '#94a3b8',
          isGradient: false
        };
      case 'light':
        return {
          bg: lightNeutral,
          text: darkNeutral,
          accent: primaryColor,
          subtext: '#64748b',
          isGradient: false
        };
      case 'gradient':
        return {
          bg: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${darkNeutral} 100%)`,
          text: '#ffffff',
          accent: accentColor,
          subtext: 'rgba(255, 255, 255, 0.9)',
          isGradient: true
        };
      case 'custom':
      default:
        return {
          bg: customBgColor,
          text: customTextColor,
          accent: customAccentColor,
          subtext: customSubtitleColor,
          isGradient: false
        };
    }
  }, [colorTheme, primaryColor, secondaryColor, accentColor, darkNeutral, lightNeutral, customBgColor, customTextColor, customAccentColor, customSubtitleColor]);

  const activeColors = getThemeColors();

  // Typography font families
  const headerFontFamily = bible.typography?.headerFont || 'Playfair Display, serif';
  const bodyFontFamily = bible.typography?.bodyFont || 'Plus Jakarta Sans, sans-serif';

  // Helper to ensure fonts are loaded before drawing on canvas
  const ensureFontsReady = async () => {
    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
    } catch {
      // Fallback
    }
  };

  // Helper to draw the banner onto a given Canvas context
  const renderBannerToCanvas = async (
    canvas: HTMLCanvasElement,
    preset: SocialBannerPreset,
    options: {
      drawSafeZoneOverlay?: boolean;
      drawGridGuideOverlay?: boolean;
    } = {}
  ) => {
    await ensureFontsReady();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = preset.width;
    const height = preset.height;
    canvas.width = width;
    canvas.height = height;

    const currentColors = getThemeColors();

    // 1. Draw Background
    if (colorTheme === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, primaryColor);
      grad.addColorStop(0.55, secondaryColor);
      grad.addColorStop(1, darkNeutral);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = currentColors.bg;
    }
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Geometric Pattern Overlay if enabled
    if (enablePattern) {
      try {
        const patternSvg = generatePatternDataUrl({
          type: patternType,
          bgColor: 'transparent',
          fgColor: currentColors.text,
          accentColor: currentColors.accent,
          opacity: 1,
          scale: Math.max(16, Math.round(patternScale * 24))
        });
        const patternImg = new Image();
        patternImg.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          patternImg.onload = () => resolve();
          patternImg.onerror = () => resolve();
          patternImg.src = patternSvg;
        });

        if (patternImg.width > 0) {
          const pattern = ctx.createPattern(patternImg, 'repeat');
          if (pattern) {
            ctx.save();
            ctx.globalAlpha = patternOpacity / 100;
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
          }
        }
      } catch (err) {
        console.warn('Pattern drawing skipped:', err);
      }
    }

    // 3. Template Style Specific Layout Drawings
    ctx.save();

    const hFont = useHeaderFont ? `"${bible.typography?.headerFont || 'Playfair Display'}", Georgia, serif` : `"${bible.typography?.bodyFont || 'Plus Jakarta Sans'}", sans-serif`;
    const bFont = `"${bible.typography?.bodyFont || 'Plus Jakarta Sans'}", -apple-system, BlinkMacSystemFont, sans-serif`;

    const fontMultiplier = (fontScale / 100);
    const isVertical = preset.category === 'story';
    const isSquare = preset.category === 'post';

    // Helper to draw Logo / Monogram
    const drawBrandLogo = async (lx: number, ly: number, lsize: number) => {
      if (!showLogo) return;

      if (logoMode === 'primary' && bible.primaryLogo) {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => resolve();
            logoImg.src = bible.primaryLogo!;
          });

          if (logoImg.width > 0) {
            const aspect = logoImg.width / logoImg.height;
            let dw = lsize;
            let dh = lsize;
            if (aspect > 1) {
              dh = lsize / aspect;
            } else {
              dw = lsize * aspect;
            }
            ctx.drawImage(logoImg, lx - dw / 2, ly - dh / 2, dw, dh);
            return;
          }
        } catch {
          // Fall through to monogram
        }
      }

      // Draw stylized monogram fallback or monogram mode
      ctx.save();
      ctx.fillStyle = currentColors.accent;
      ctx.beginPath();
      ctx.roundRect(lx - lsize / 2, ly - lsize / 2, lsize, lsize, lsize * 0.22);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(lsize * 0.45)}px ${bFont}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((bible.companyName || 'B').substring(0, 2).toUpperCase(), lx, ly);
      ctx.restore();
    };

    // Calculate dynamic base sizes
    const basePadding = isVertical ? width * 0.1 : height * 0.15;
    const logoDimension = (logoScale === 'small' ? 0.25 : logoScale === 'large' ? 0.5 : 0.35) * Math.min(width, height);

    // TEMPLATE 1: HERO IDENTITY
    if (templateStyle === 'hero') {
      const contentX = textAlign === 'center' ? width / 2 : textAlign === 'right' ? width - basePadding : (preset.platform === 'twitter' ? width * 0.35 : basePadding);
      const startY = height * 0.35;

      // Draw Logo
      const logoX = textAlign === 'center' ? width / 2 : textAlign === 'right' ? width - basePadding - logoDimension / 2 : (preset.platform === 'twitter' ? width * 0.16 : basePadding + logoDimension / 2);
      const logoY = isVertical ? height * 0.22 : height * 0.5;
      await drawBrandLogo(logoX, logoY, logoDimension);

      // Badge
      if (badgeText) {
        ctx.fillStyle = currentColors.accent;
        ctx.font = `800 ${Math.round(14 * fontMultiplier * (width / 1000))}px ${bFont}`;
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText.toUpperCase(), contentX, startY - height * 0.12);
      }

      // Headline
      ctx.fillStyle = currentColors.text;
      ctx.font = `bold ${Math.round(38 * fontMultiplier * (width / 1000))}px ${hFont}`;
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'middle';
      ctx.fillText(headline, contentX, startY);

      // Tagline
      ctx.fillStyle = currentColors.subtext;
      ctx.font = `500 ${Math.round(18 * fontMultiplier * (width / 1000))}px ${bFont}`;
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'middle';
      
      // Multi-line tagline wrapping if needed
      const maxTextWidth = width * 0.55;
      wrapCanvasText(ctx, tagline, contentX, startY + height * 0.14, maxTextWidth, Math.round(26 * (width / 1000)));

      // Handle & Website Pill at bottom
      if (handleText) {
        const footY = height - (isVertical ? basePadding * 1.5 : basePadding);
        ctx.fillStyle = currentColors.text;
        ctx.globalAlpha = 0.8;
        ctx.font = `600 ${Math.round(15 * (width / 1000))}px ${bFont}`;
        ctx.textAlign = textAlign;
        ctx.fillText(handleText, contentX, footY);
        ctx.globalAlpha = 1.0;
      }
    }

    // TEMPLATE 2: PRODUCT LAUNCH & ANNOUNCEMENT
    else if (templateStyle === 'launch') {
      const centerX = textAlign === 'center' ? width / 2 : basePadding + width * 0.25;
      const logoX = textAlign === 'right' ? width - basePadding - logoDimension / 2 : basePadding + logoDimension / 2;
      await drawBrandLogo(logoX, height * 0.25, logoDimension * 0.85);

      // Launch Badge Pill
      const pillY = isVertical ? height * 0.38 : height * 0.28;
      ctx.fillStyle = currentColors.accent;
      ctx.beginPath();
      const pillW = width * 0.22;
      const pillH = Math.max(30, height * 0.08);
      ctx.roundRect(centerX - (textAlign === 'center' ? pillW / 2 : 0), pillY - pillH / 2, pillW, pillH, pillH / 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(14 * (width / 1000))}px ${bFont}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText || 'NOW LIVE', textAlign === 'center' ? centerX : centerX + pillW / 2, pillY);

      // Main Headline
      ctx.fillStyle = currentColors.text;
      ctx.font = `bold ${Math.round(42 * fontMultiplier * (width / 1000))}px ${hFont}`;
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'middle';
      ctx.fillText(headline, centerX, pillY + height * 0.16);

      // Tagline
      ctx.fillStyle = currentColors.subtext;
      ctx.font = `500 ${Math.round(19 * fontMultiplier * (width / 1000))}px ${bFont}`;
      wrapCanvasText(ctx, tagline, centerX, pillY + height * 0.3, width * 0.65, Math.round(28 * (width / 1000)));

      // CTA Button
      if (ctaText) {
        const btnY = pillY + height * 0.46;
        const btnW = width * 0.24;
        const btnH = Math.max(40, height * 0.11);
        const btnX = textAlign === 'center' ? centerX - btnW / 2 : centerX;

        ctx.fillStyle = currentColors.accent;
        ctx.beginPath();
        ctx.roundRect(btnX, btnY - btnH / 2, btnW, btnH, 12);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(16 * (width / 1000))}px ${bFont}`;
        ctx.textAlign = 'center';
        ctx.fillText(ctaText, btnX + btnW / 2, btnY);
      }
    }

    // TEMPLATE 3: EXECUTIVE QUOTE
    else if (templateStyle === 'quote') {
      const quoteX = textAlign === 'center' ? width / 2 : basePadding;
      const logoX = width - basePadding - logoDimension / 2;
      await drawBrandLogo(logoX, height * 0.28, logoDimension * 0.75);

      // Large Quotation Mark
      ctx.fillStyle = currentColors.accent;
      ctx.globalAlpha = 0.35;
      ctx.font = `italic bold ${Math.round(120 * (width / 1000))}px ${hFont}`;
      ctx.textAlign = textAlign;
      ctx.fillText('“', quoteX, height * 0.35);
      ctx.globalAlpha = 1.0;

      // Quote Text
      ctx.fillStyle = currentColors.text;
      ctx.font = `italic bold ${Math.round(28 * fontMultiplier * (width / 1000))}px ${hFont}`;
      wrapCanvasText(ctx, `“${tagline}”`, quoteX, height * 0.48, width * 0.65, Math.round(38 * (width / 1000)));

      // Author & Title
      ctx.fillStyle = currentColors.accent;
      ctx.font = `bold ${Math.round(18 * (width / 1000))}px ${bFont}`;
      ctx.fillText(`— ${bible.companyName}`, quoteX, height * 0.76);

      ctx.fillStyle = currentColors.subtext;
      ctx.font = `500 ${Math.round(14 * (width / 1000))}px ${bFont}`;
      ctx.fillText(quoteAuthor, quoteX, height * 0.83);
    }

    // TEMPLATE 4: METRIC & MILESTONE
    else if (templateStyle === 'metric') {
      const metricX = isVertical ? width / 2 : width * 0.28;
      const metricY = isVertical ? height * 0.35 : height * 0.5;

      // Big Number
      ctx.fillStyle = currentColors.accent;
      ctx.font = `900 ${Math.round(72 * fontMultiplier * (width / 1000))}px ${bFont}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(metricNumber, metricX, metricY);

      // Label below number
      ctx.fillStyle = currentColors.subtext;
      ctx.font = `bold ${Math.round(15 * (width / 1000))}px ${bFont}`;
      ctx.fillText(metricLabel, metricX, metricY + height * 0.16);

      // Right Column / Secondary details
      const textX = isVertical ? width / 2 : width * 0.62;
      const textY = isVertical ? height * 0.65 : height * 0.42;

      ctx.fillStyle = currentColors.text;
      ctx.font = `bold ${Math.round(34 * fontMultiplier * (width / 1000))}px ${hFont}`;
      ctx.textAlign = isVertical ? 'center' : 'left';
      ctx.fillText(headline, textX, textY);

      ctx.fillStyle = currentColors.subtext;
      ctx.font = `500 ${Math.round(17 * fontMultiplier * (width / 1000))}px ${bFont}`;
      wrapCanvasText(ctx, tagline, textX, textY + height * 0.14, width * 0.45, Math.round(26 * (width / 1000)));

      // Logo Top Corner
      await drawBrandLogo(width - basePadding - logoDimension / 2, basePadding + logoDimension / 2, logoDimension * 0.7);
    }

    // TEMPLATE 5: PATTERN & MINIMALIST
    else if (templateStyle === 'pattern') {
      const logoX = width / 2;
      const logoY = height * 0.4;
      await drawBrandLogo(logoX, logoY, logoDimension * 1.3);

      ctx.fillStyle = currentColors.text;
      ctx.font = `bold ${Math.round(38 * fontMultiplier * (width / 1000))}px ${hFont}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bible.companyName, width / 2, height * 0.68);

      ctx.fillStyle = currentColors.accent;
      ctx.font = `600 ${Math.round(16 * (width / 1000))}px ${bFont}`;
      ctx.fillText(tagline, width / 2, height * 0.78);

      if (handleText) {
        ctx.fillStyle = currentColors.subtext;
        ctx.font = `500 ${Math.round(13 * (width / 1000))}px ${bFont}`;
        ctx.fillText(handleText, width / 2, height * 0.88);
      }
    }

    // TEMPLATE 6: SPLIT DIAGONAL DUOTONE
    else if (templateStyle === 'split') {
      // Draw split right angled triangle
      ctx.fillStyle = currentColors.accent;
      ctx.beginPath();
      ctx.moveTo(width * 0.6, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(width * 0.4, height);
      ctx.closePath();
      ctx.fill();

      // Left column content
      const leftX = basePadding;
      await drawBrandLogo(leftX + logoDimension / 2, height * 0.32, logoDimension * 0.8);

      ctx.fillStyle = currentColors.text;
      ctx.font = `bold ${Math.round(36 * fontMultiplier * (width / 1000))}px ${hFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(headline, leftX, height * 0.58);

      ctx.fillStyle = currentColors.subtext;
      ctx.font = `500 ${Math.round(16 * fontMultiplier * (width / 1000))}px ${bFont}`;
      wrapCanvasText(ctx, tagline, leftX, height * 0.72, width * 0.42, Math.round(24 * (width / 1000)));

      // Right column accent mark or handle
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(22 * (width / 1000))}px ${bFont}`;
      ctx.textAlign = 'center';
      ctx.fillText(bible.companyName.toUpperCase(), width * 0.78, height * 0.5);
    }

    ctx.restore();

    // 4. Draw Safe Zone Guides if requested
    if (options.drawSafeZoneOverlay && preset.hasSafeZone) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.lineWidth = Math.max(3, width / 500);
      ctx.setLineDash([8, 8]);

      if (preset.safeZoneType === 'twitter') {
        // Twitter avatar circle on bottom-left
        const avatarCenterX = width * 0.12;
        const avatarCenterY = height * 0.85;
        const avatarRadius = height * 0.35;
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.font = `bold ${Math.round(13 * (width / 1000))}px ${bFont}`;
        ctx.textAlign = 'center';
        ctx.fillText('Twitter Profile Avatar Area', avatarCenterX, avatarCenterY);
      } else if (preset.safeZoneType === 'linkedin') {
        // LinkedIn square avatar
        const rectX = width * 0.05;
        const rectY = height * 0.45;
        const rectW = height * 0.7;
        const rectH = height * 0.7;
        ctx.strokeRect(rectX, rectY, rectW, rectH);
        ctx.fillRect(rectX, rectY, rectW, rectH);

        ctx.fillStyle = '#ef4444';
        ctx.font = `bold ${Math.round(13 * (width / 1000))}px ${bFont}`;
        ctx.textAlign = 'center';
        ctx.fillText('LinkedIn Avatar Zone', rectX + rectW / 2, rectY + rectH / 2);
      } else if (preset.safeZoneType === 'youtube') {
        // YouTube central safe box: 1546 x 423
        const safeW = (1546 / 2560) * width;
        const safeH = (423 / 1440) * height;
        const safeX = (width - safeW) / 2;
        const safeY = (height - safeH) / 2;
        ctx.strokeRect(safeX, safeY, safeW, safeH);
        ctx.fillRect(safeX, safeY, safeW, safeH);

        ctx.fillStyle = '#ef4444';
        ctx.font = `bold ${Math.round(14 * (width / 1000))}px ${bFont}`;
        ctx.textAlign = 'center';
        ctx.fillText('YouTube Text & Logo Safe Zone (Mobile & Desktop)', width / 2, safeY + 30);
      }
      ctx.restore();
    }

    // 5. Draw Alignment Grid if requested
    if (options.drawGridGuideOverlay) {
      ctx.save();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      // Thirds
      ctx.beginPath();
      ctx.moveTo(width / 3, 0);
      ctx.lineTo(width / 3, height);
      ctx.moveTo((width * 2) / 3, 0);
      ctx.lineTo((width * 2) / 3, height);
      ctx.moveTo(0, height / 3);
      ctx.lineTo(width, height / 3);
      ctx.moveTo(0, (height * 2) / 3);
      ctx.lineTo(width, (height * 2) / 3);
      ctx.stroke();

      ctx.restore();
    }
  };

  // Helper function to wrap text neatly on Canvas
  const wrapCanvasText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  // Re-render live preview whenever options change
  useEffect(() => {
    if (previewCanvasRef.current) {
      renderBannerToCanvas(previewCanvasRef.current, activePreset, {
        drawSafeZoneOverlay: showSafeZone,
        drawGridGuideOverlay: showGridGuide
      });
    }
  }, [
    activePreset,
    templateStyle,
    colorTheme,
    customBgColor,
    customTextColor,
    customAccentColor,
    customSubtitleColor,
    headline,
    tagline,
    badgeText,
    handleText,
    ctaText,
    quoteAuthor,
    metricNumber,
    metricLabel,
    showLogo,
    logoMode,
    logoScale,
    logoPosition,
    useHeaderFont,
    fontScale,
    textAlign,
    enablePattern,
    patternType,
    patternOpacity,
    patternScale,
    showSafeZone,
    showGridGuide,
    bible
  ]);

  // Handle Download Single High-Res Banner
  const handleDownloadPreset = async (presetToDownload: SocialBannerPreset = activePreset) => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      await renderBannerToCanvas(canvas, presetToDownload, {
        drawSafeZoneOverlay: false, // Pure clean asset for production use
        drawGridGuideOverlay: false
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const safeCompany = (bible.companyName || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `${safeCompany}-${presetToDownload.id}-${templateStyle}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const msg = `Exported ${presetToDownload.name} (${presetToDownload.width}×${presetToDownload.height}px)!`;
      if (onShowToast) {
        onShowToast(msg, primaryColor);
      }
    } catch (err) {
      console.error('Failed to export banner:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Batch Export All Formats
  const handleBatchExportAll = async () => {
    setIsBatchExporting(true);
    setBatchProgress({ current: 0, total: SOCIAL_BANNER_PRESETS.length });

    try {
      for (let i = 0; i < SOCIAL_BANNER_PRESETS.length; i++) {
        const preset = SOCIAL_BANNER_PRESETS[i];
        setBatchProgress({ current: i + 1, total: SOCIAL_BANNER_PRESETS.length });
        await handleDownloadPreset(preset);
        await new Promise((r) => setTimeout(r, 450));
      }
      if (onShowToast) {
        onShowToast(`Completed export of all ${SOCIAL_BANNER_PRESETS.length} social banner presets!`, primaryColor);
      }
    } catch (err) {
      console.error('Batch export failed:', err);
    } finally {
      setIsBatchExporting(false);
      setBatchProgress(null);
    }
  };

  // Handle Copy to Clipboard
  const handleCopyToClipboard = async () => {
    try {
      const canvas = document.createElement('canvas');
      await renderBannerToCanvas(canvas, activePreset, {
        drawSafeZoneOverlay: false,
        drawGridGuideOverlay: false
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // Clipboard Item API
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setCopiedClipboard(true);
          setTimeout(() => setCopiedClipboard(false), 2500);
          if (onShowToast) {
            onShowToast('Banner image copied to clipboard!', primaryColor);
          }
        } catch (clipErr) {
          console.warn('Clipboard write failed, fallback to download:', clipErr);
          await handleDownloadPreset();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  // Filtered Presets
  const filteredPresets = SOCIAL_BANNER_PRESETS.filter((preset) => {
    const matchesPlatform = platformFilter === 'all' || preset.platform === platformFilter;
    const matchesCategory = categoryFilter === 'all' || preset.category === categoryFilter;
    return matchesPlatform && matchesCategory;
  });

  return (
    <div
      id="social-banners-brand-section"
      className={`border rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Section Header */}
      <div
        className={`border-b pb-5 mb-6 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block">
              08 / Social Media Banners &amp; Marketing Templates
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Active Brand Sync
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              High-Res PNG Export
            </span>
          </div>
          <h2
            className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <Share2 className="w-5 h-5 text-indigo-600" />
            Social Media Profile Banners &amp; Visual Templates
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed max-w-2xl">
            Generate and download pixel-perfect profile headers, OpenGraph share previews, and campaign templates customized with{' '}
            <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{bible.companyName || 'your brand'}</strong>'s active typography pairing, 5-color palette, and vector marks.
          </p>
        </div>

        {/* Global Section Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="batch-export-all-banners-btn"
            onClick={handleBatchExportAll}
            disabled={isBatchExporting}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95 disabled:opacity-50"
            title="Export all social media banner sizes in a single batch"
          >
            {isBatchExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Layers className="w-4 h-4 text-white" />
            )}
            <span>
              {isBatchExporting
                ? `Exporting ${batchProgress?.current || 0}/${batchProgress?.total || 0}...`
                : 'Batch Export All Formats'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls Left + Live Stage Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Preset Switcher & Customizer Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 text-left font-sans">
          {/* 1. Format & Platform Selector */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                1. Platform &amp; Format
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-500">
                {activePreset.dimensionsLabel || `${activePreset.width}×${activePreset.height}px`}
              </span>
            </div>

            {/* Platform Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All Formats' },
                { id: 'twitter', label: 'X / Twitter' },
                { id: 'linkedin', label: 'LinkedIn' },
                { id: 'youtube', label: 'YouTube' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'opengraph', label: 'OpenGraph' }
              ].map((plat) => (
                <button
                  key={plat.id}
                  id={`social-platform-filter-${plat.id}-btn`}
                  onClick={() => setPlatformFilter(plat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    platformFilter === plat.id
                      ? 'bg-indigo-600 text-white'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {plat.label}
                </button>
              ))}
            </div>

            {/* Presets List Scroll Tray */}
            <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    id={`select-banner-preset-${preset.id}-btn`}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer active:scale-98 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 ring-2 ring-indigo-500/20'
                        : isDark
                        ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold">{preset.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {preset.platformName} • {preset.aspectRatioLabel}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold block">
                        {preset.width}×{preset.height}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Template Layout Archetype */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-indigo-500" />
                2. Template Style
              </span>
              <span className="text-[10px] font-bold text-indigo-400 capitalize">
                {templateStyle} Layout
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hero', name: 'Identity Hero', icon: Award, desc: 'Logo & Tagline' },
                { id: 'launch', name: 'Product Launch', icon: Zap, desc: 'Badge & CTA' },
                { id: 'quote', name: 'Executive Quote', icon: MessageSquare, desc: 'Testimonial' },
                { id: 'metric', name: 'Key Metric', icon: TrendingUp, desc: 'Milestone stat' },
                { id: 'pattern', name: 'Brand Motif', icon: Grid, desc: 'Pattern focus' },
                { id: 'split', name: 'Split Duotone', icon: Layers, desc: 'Two-tone modern' }
              ].map((style) => {
                const Icon = style.icon;
                const isSelected = templateStyle === style.id;
                return (
                  <button
                    key={style.id}
                    id={`template-style-${style.id}-btn`}
                    onClick={() => setTemplateStyle(style.id as TemplateStyle)}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 font-extrabold shadow-xs'
                        : isDark
                        ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10.5px] leading-tight">{style.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Color Theme & Brand Palette Integration */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                3. Color Palette &amp; Theme
              </span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase">
                {colorTheme} Mode
              </span>
            </div>

            {/* Quick Preset Themes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'dark', label: 'Dark Neutral', bg: darkNeutral, text: '#ffffff' },
                { id: 'primary', label: 'Primary Brand', bg: primaryColor, text: '#ffffff' },
                { id: 'light', label: 'Editorial Light', bg: lightNeutral, text: darkNeutral },
                { id: 'gradient', label: 'Multi Gradient', bg: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, text: '#ffffff' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  id={`color-theme-${theme.id}-btn`}
                  onClick={() => setColorTheme(theme.id as any)}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    colorTheme === theme.id
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-500/10'
                      : isDark
                      ? 'border-slate-800 bg-slate-900/40 text-slate-400'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <div
                    className="w-full h-4 rounded-md border border-black/10 shadow-inner"
                    style={{ background: theme.bg }}
                  />
                  <span className="text-[10px] font-bold">{theme.label}</span>
                </button>
              ))}
            </div>

            {/* Active Palette Quick Swatches */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1.5">
                Quick Palette Selector (Set as Background):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(bible.colorPalette || []).map((color, idx) => (
                  <button
                    key={idx}
                    id={`palette-quick-swatch-${idx}`}
                    onClick={() => {
                      setColorTheme('custom');
                      setCustomBgColor(color.hex);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold flex items-center gap-1.5 bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-500 transition"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Text & Copy Content Customizer */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-500" />
              4. Copy &amp; Typography Settings
            </span>

            {/* Headline */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Headline Text</label>
              <input
                type="text"
                id="social-banner-headline-input"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                }`}
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Tagline / Mission Copy</label>
              <textarea
                rows={2}
                id="social-banner-tagline-input"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                }`}
              />
            </div>

            {/* Optional Specific inputs based on template */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Badge Text</label>
                <input
                  type="text"
                  id="social-banner-badge-input"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Handle / Website</label>
                <input
                  type="text"
                  id="social-banner-handle-input"
                  value={handleText}
                  onChange={(e) => setHandleText(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {templateStyle === 'launch' && (
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">CTA Button Copy</label>
                <input
                  type="text"
                  id="social-banner-cta-input"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                  }`}
                />
              </div>
            )}

            {templateStyle === 'metric' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Metric Number</label>
                  <input
                    type="text"
                    id="social-banner-metric-num-input"
                    value={metricNumber}
                    onChange={(e) => setMetricNumber(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Metric Label</label>
                  <input
                    type="text"
                    id="social-banner-metric-label-input"
                    value={metricLabel}
                    onChange={(e) => setMetricLabel(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Typography Tuning Bar */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="toggle-header-font-checkbox"
                  checked={useHeaderFont}
                  onChange={(e) => setUseHeaderFont(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] font-bold text-slate-400">
                  Use Display Font ({bible.typography?.headerFont || 'Playfair Display'})
                </span>
              </label>

              {/* Text Alignment */}
              <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    id={`text-align-${align}-btn`}
                    onClick={() => setTextAlign(align)}
                    className={`px-2 py-0.5 text-[9px] font-bold capitalize transition cursor-pointer rounded ${
                      textAlign === align ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Rendering Canvas Stage & Download Bar (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Live Stage Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-sans flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                Live Canvas Stage
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {activePreset.aspectRatioLabel}
              </span>
            </div>

            {/* Toggle Overlay Buttons */}
            <div className="flex items-center gap-1.5">
              {activePreset.hasSafeZone && (
                <button
                  id="toggle-safe-zone-overlay-btn"
                  onClick={() => setShowSafeZone(!showSafeZone)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                    showSafeZone
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                  title="Toggle Platform Avatar Safe Zone Overlay"
                >
                  <ShieldCheck className="w-3 h-3 text-rose-500" />
                  <span>Avatar Safe Zone</span>
                </button>
              )}

              <button
                id="toggle-grid-guide-overlay-btn"
                onClick={() => setShowGridGuide(!showGridGuide)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                  showGridGuide
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
                title="Toggle Rule-of-Thirds Grid Alignment Lines"
              >
                <Grid className="w-3 h-3 text-indigo-500" />
                <span>Rule of Thirds</span>
              </button>

              <button
                id="open-banner-fullscreen-btn"
                onClick={() => setFullscreenModal(true)}
                className={`p-1.5 rounded-xl border text-slate-400 hover:text-white transition cursor-pointer ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-600'
                }`}
                title="Fullscreen Preview"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* LIVE CANVAS CONTAINER */}
          <div
            className={`w-full rounded-2xl border p-4 sm:p-6 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden shadow-inner ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100/70 border-slate-250'
            }`}
          >
            {/* Visual platform tag badge */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider bg-black/40 text-white backdrop-blur-md border border-white/10 z-10">
              {activePreset.platformName} • {activePreset.name}
            </div>

            {/* Canvas Stage */}
            <div className="w-full flex items-center justify-center max-h-[420px] overflow-hidden my-auto py-2">
              <canvas
                id="social-banner-preview-canvas"
                ref={previewCanvasRef}
                className="max-w-full max-h-[380px] w-auto h-auto rounded-xl shadow-2xl border border-black/20 object-contain transition-transform"
                style={{
                  aspectRatio: `${activePreset.width} / ${activePreset.height}`
                }}
              />
            </div>

            {/* Bottom Info & Dimensions Bar */}
            <div className="w-full mt-3 pt-3 border-t border-slate-300/30 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-mono gap-2">
              <div>
                Render Target: <strong>{activePreset.width} × {activePreset.height} px</strong> @ 1:1 Scale
              </div>
              <div className="text-right">
                Fonts: <span className="text-indigo-400">{useHeaderFont ? headerFontFamily.split(',')[0] : bodyFontFamily.split(',')[0]}</span> + <span className="text-indigo-400">{bodyFontFamily.split(',')[0]}</span>
              </div>
            </div>
          </div>

          {/* EXPORT & DOWNLOAD CONTROLS BAR */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
              isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="space-y-0.5 text-left font-sans">
              <div className="text-xs font-black flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-500" />
                <span>Export High-Resolution Assets</span>
              </div>
              <p className="text-[10.5px] text-slate-400">
                Exports rasterized 2x retina PNG rendered with loaded brand typography.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                id="copy-banner-clipboard-btn"
                onClick={handleCopyToClipboard}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold font-sans flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                  copiedClipboard
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:text-indigo-600'
                }`}
                title="Copy rendered PNG image to clipboard"
              >
                {copiedClipboard ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy PNG</span>
                  </>
                )}
              </button>

              <button
                id="download-active-banner-png-btn"
                onClick={() => handleDownloadPreset(activePreset)}
                disabled={isExporting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-black font-sans flex items-center gap-2 transition shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                )}
                <span>{isExporting ? 'Rendering PNG...' : `Download ${activePreset.platformName} PNG`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Stage Modal */}
      <AnimatePresence>
        {fullscreenModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 select-none"
            onClick={() => setFullscreenModal(false)}
          >
            {/* Top Bar */}
            <div
              className="w-full flex items-center justify-between border-b border-slate-800 pb-4 shrink-0 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white">
                  {activePreset.name}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activePreset.width} × {activePreset.height} px
                </span>
              </div>
              <button
                onClick={() => setFullscreenModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Canvas Center */}
            <div
              className="w-full flex-1 flex items-center justify-center p-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <canvas
                ref={(node) => {
                  if (node) {
                    renderBannerToCanvas(node, activePreset, {
                      drawSafeZoneOverlay: showSafeZone,
                      drawGridGuideOverlay: showGridGuide
                    });
                  }
                }}
                className="max-w-[90vw] max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
              />
            </div>

            {/* Modal Bottom Toolbar */}
            <div
              className="w-full flex items-center justify-center gap-4 pt-4 border-t border-slate-800 text-xs shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => handleDownloadPreset(activePreset)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG ({activePreset.width}×{activePreset.height}px)</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
