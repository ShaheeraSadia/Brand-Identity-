import React, { useState, useEffect } from 'react';
import { BrandBible } from '../types';
import {
  CreditCard, FileText, Monitor, Share2, Copy, Check, ZoomIn, ZoomOut, Maximize2, X, RotateCcw,
  Sun, Moon, Layers, Grid, Sliders, Download, Image as ImageIcon, Sparkles, CheckCircle,
  XCircle, Camera, User, Globe, Palette, ArrowDownToLine, Eye, RefreshCw, Zap, Layout,
  Play, Code, Code2, Film, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePatternDataUrl, BRAND_PATTERN_TEMPLATES, PatternType } from '../utils/patternGenerator';

interface BrandMockupsProps {
  bible: BrandBible;
  isDark?: boolean;
}

// Custom SVG platform icons
const TwitterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export interface SocialAssetDef {
  id: string;
  name: string;
  platform: 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'facebook';
  platformName: string;
  type: 'profile' | 'banner';
  dimensionsLabel: string;
  width: number;
  height: number;
  aspectRatioLabel: string;
  isCircleProfile?: boolean;
  recommendedUse: string;
}

const SOCIAL_ASSETS: SocialAssetDef[] = [
  // Profile Pictures
  {
    id: 'twitter-profile',
    name: 'X / Twitter Profile Avatar',
    platform: 'twitter',
    platformName: 'X (Twitter)',
    type: 'profile',
    dimensionsLabel: '400 × 400 px',
    width: 400,
    height: 400,
    aspectRatioLabel: '1:1 Square',
    isCircleProfile: true,
    recommendedUse: 'Circular profile picture displayed on X feeds and search popovers.'
  },
  {
    id: 'linkedin-profile',
    name: 'LinkedIn Company Avatar',
    platform: 'linkedin',
    platformName: 'LinkedIn',
    type: 'profile',
    dimensionsLabel: '400 × 400 px',
    width: 400,
    height: 400,
    aspectRatioLabel: '1:1 Square',
    isCircleProfile: false,
    recommendedUse: 'Rounded square company logo on job listings & corporate overview.'
  },
  {
    id: 'instagram-profile',
    name: 'Instagram Profile Picture',
    platform: 'instagram',
    platformName: 'Instagram',
    type: 'profile',
    dimensionsLabel: '320 × 320 px',
    width: 320,
    height: 320,
    aspectRatioLabel: '1:1 Square',
    isCircleProfile: true,
    recommendedUse: 'Circular avatar ring on Instagram bio & story highlights.'
  },
  {
    id: 'youtube-profile',
    name: 'YouTube Channel Icon',
    platform: 'youtube',
    platformName: 'YouTube',
    type: 'profile',
    dimensionsLabel: '800 × 800 px',
    width: 800,
    height: 800,
    aspectRatioLabel: '1:1 Square',
    isCircleProfile: true,
    recommendedUse: 'Channel avatar shown on YouTube video comments & search.'
  },
  {
    id: 'facebook-profile',
    name: 'Facebook Page Avatar',
    platform: 'facebook',
    platformName: 'Facebook',
    type: 'profile',
    dimensionsLabel: '500 × 500 px',
    width: 500,
    height: 500,
    aspectRatioLabel: '1:1 Square',
    isCircleProfile: true,
    recommendedUse: 'Page icon displayed on Facebook posts, ads & Messenger.'
  },

  // Banner Backgrounds
  {
    id: 'twitter-banner',
    name: 'X / Twitter Header Banner',
    platform: 'twitter',
    platformName: 'X (Twitter)',
    type: 'banner',
    dimensionsLabel: '1500 × 500 px',
    width: 1500,
    height: 500,
    aspectRatioLabel: '3:1 Banner',
    recommendedUse: 'Header graphic displayed on X user & brand profiles.'
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Cover Banner',
    platform: 'linkedin',
    platformName: 'LinkedIn',
    type: 'banner',
    dimensionsLabel: '1584 × 396 px',
    width: 1584,
    height: 396,
    aspectRatioLabel: '4:1 Widescreen',
    recommendedUse: 'Corporate page banner above company overview & posts.'
  },
  {
    id: 'youtube-banner',
    name: 'YouTube Channel Art Banner',
    platform: 'youtube',
    platformName: 'YouTube',
    type: 'banner',
    dimensionsLabel: '2560 × 1440 px',
    width: 2560,
    height: 1440,
    aspectRatioLabel: '16:9 Widescreen',
    recommendedUse: 'Channel header graphic with safe-zone desktop centering.'
  },
  {
    id: 'facebook-banner',
    name: 'Facebook Page Cover Photo',
    platform: 'facebook',
    platformName: 'Facebook',
    type: 'banner',
    dimensionsLabel: '820 × 312 px',
    width: 820,
    height: 312,
    aspectRatioLabel: '2.63:1 Banner',
    recommendedUse: 'Page cover image displayed on Facebook desktop & mobile.'
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story & Reel Backdrop',
    platform: 'instagram',
    platformName: 'Instagram',
    type: 'banner',
    dimensionsLabel: '1080 × 1920 px',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16 Vertical',
    recommendedUse: 'Full-bleed vertical backdrop for IG Stories & Reel covers.'
  }
];

export default function BrandMockups({ bible, isDark = false }: BrandMockupsProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'letterhead' | 'social' | 'social_assets' | 'website' | 'motion'>('social_assets');
  const [isCopied, setIsCopied] = useState(false);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [modalBgMode, setModalBgMode] = useState<'dark' | 'light' | 'grid'>('dark');

  // Motion Identity Section States
  const [motionPreset, setMotionPreset] = useState<'slide-up' | 'fade-scale' | 'elastic-drop' | 'blur-reveal'>('slide-up');
  const [motionDuration, setMotionDuration] = useState<number>(0.8);
  const [motionEasing, setMotionEasing] = useState<string>('cubic-bezier(0.16, 1, 0.3, 1)');
  const [motionYOffset, setMotionYOffset] = useState<number>(24);
  const [motionDelay, setMotionDelay] = useState<number>(0.1);
  const [motionPlayCount, setMotionPlayCount] = useState<number>(0);
  const [motionSnippetFormat, setMotionSnippetFormat] = useState<'css' | 'tailwind' | 'react'>('css');
  const [isMotionCssCopied, setIsMotionCssCopied] = useState<boolean>(false);

  // Brand pattern state for mockups
  const [selectedPattern, setSelectedPattern] = useState<PatternType | 'none'>('dots');
  const [patternOpacity, setPatternOpacity] = useState<number>(0.25);
  const [patternScale, setPatternScale] = useState<number>(36);
  const [patternColorRole, setPatternColorRole] = useState<'primary' | 'secondary' | 'accent' | 'dark' | 'light'>('primary');

  // Social Media Assets Section States
  const [socialAssetTypeFilter, setSocialAssetTypeFilter] = useState<'all' | 'profile' | 'banner'>('all');
  const [socialPlatformFilter, setSocialPlatformFilter] = useState<'all' | 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'facebook'>('all');
  const [assetBgPreset, setAssetBgPreset] = useState<'primary' | 'dark' | 'light' | 'secondary' | 'accent'>('primary');
  const [assetLogoScale, setAssetLogoScale] = useState<number>(50);
  const [showHandleOnBanner, setShowHandleOnBanner] = useState<boolean>(true);
  const [showSafeZoneOverlay, setShowSafeZoneOverlay] = useState<boolean>(false);
  const [downloadingAssetId, setDownloadingAssetId] = useState<string | null>(null);
  const [isBatchExporting, setIsBatchExporting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; hex?: string } | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsInspectModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to resolve color hexes safely
  const getBrandColor = (roleName: string, fallback: string) => {
    const found = bible.colorPalette.find(c => c.role.toLowerCase().includes(roleName.toLowerCase()));
    return found ? found.hex : fallback;
  };

  const primaryColor = getBrandColor('primary', '#4f46e5');
  const secondaryColor = getBrandColor('secondary', '#10b981');
  const accentColor = getBrandColor('accent', '#f59e0b');
  const darkNeutral = getBrandColor('dark', '#1e293b');
  const lightNeutral = getBrandColor('light', '#f8fafc');

  const headerFontFamily = `'${bible.typography.headerFont}', sans-serif`;
  const bodyFontFamily = `'${bible.typography.bodyFont}', sans-serif`;

  const patternFgColor =
    patternColorRole === 'primary' ? primaryColor :
    patternColorRole === 'secondary' ? secondaryColor :
    patternColorRole === 'accent' ? accentColor :
    patternColorRole === 'dark' ? darkNeutral : lightNeutral;

  const patternDataUrl = selectedPattern !== 'none'
    ? generatePatternDataUrl({
        type: selectedPattern,
        scale: patternScale,
        bgColor: 'transparent',
        fgColor: patternFgColor,
        secondaryColor: secondaryColor,
        accentColor: accentColor,
        opacity: patternOpacity
      })
    : null;

  // Active asset background color
  const activeAssetBgColor =
    assetBgPreset === 'primary' ? primaryColor :
    assetBgPreset === 'dark' ? darkNeutral :
    assetBgPreset === 'light' ? lightNeutral :
    assetBgPreset === 'secondary' ? secondaryColor : accentColor;

  const getContrastTextColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2) || '0', 16);
    const g = parseInt(hex.substring(2, 4) || '0', 16);
    const b = parseInt(hex.substring(4, 6) || '0', 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 140 ? darkNeutral : '#ffffff';
  };

  const activeAssetTextColor = getContrastTextColor(activeAssetBgColor);

  const handleCopyLink = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(`https://${bible.companyName.toLowerCase().replace(/\s+/g, '')}.com`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getMotionCssCode = () => {
    const companyCleanName = bible.companyName.replace(/[^a-zA-Z0-9]/g, '');

    if (motionSnippetFormat === 'css') {
      return `/* ==========================================================
 * ${bible.companyName} - Brand Motion Identity
 * On-Brand Logo Reveal Keyframes & CSS Utilities
 * ========================================================== */

@keyframes brandLogoReveal {
  0% {
    opacity: 0;
    transform: translateY(${motionYOffset}px)${motionPreset === 'fade-scale' ? ' scale(0.85)' : ''}${motionPreset === 'elastic-drop' ? ' scale(0.9)' : ''}${motionPreset === 'blur-reveal' ? ' filter(blur(12px))' : ''};
  }
  100% {
    opacity: 1;
    transform: translateY(0)${motionPreset === 'fade-scale' ? ' scale(1)' : ''}${motionPreset === 'elastic-drop' ? ' scale(1)' : ''}${motionPreset === 'blur-reveal' ? ' filter(blur(0px))' : ''};
  }
}

.brand-logo-reveal {
  animation: brandLogoReveal ${motionDuration}s ${motionEasing} ${motionDelay}s forwards;
  will-change: transform, opacity;
}

/* Accessibility: Respect Reduced Motion Preferences */
@media (prefers-reduced-motion: reduce) {
  .brand-logo-reveal {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}`;
    } else if (motionSnippetFormat === 'tailwind') {
      return `// tailwind.config.js configuration for ${bible.companyName}
module.exports = {
  theme: {
    extend: {
      keyframes: {
        brandLogoReveal: {
          '0%': {
            opacity: '0',
            transform: 'translateY(${motionYOffset}px)${motionPreset === 'fade-scale' ? ' scale(0.85)' : ''}'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)${motionPreset === 'fade-scale' ? ' scale(1)' : ''}'
          },
        },
      },
      animation: {
        'logo-reveal': 'brandLogoReveal ${motionDuration}s ${motionEasing} ${motionDelay}s forwards',
      },
    },
  },
};

<!-- Usage in HTML / JSX -->
<img
  src="${bible.primaryLogo || '/logo.svg'}"
  alt="${bible.companyName} Logo"
  className="h-16 w-auto animate-logo-reveal"
/>`;
    } else {
      return `import React from 'react';
import { motion } from 'motion/react';

export function ${companyCleanName}LogoReveal() {
  return (
    <motion.img
      src="${bible.primaryLogo || '/logo.svg'}"
      alt="${bible.companyName} Logo"
      initial={{
        opacity: 0,
        y: ${motionYOffset}${motionPreset === 'fade-scale' ? ', scale: 0.85' : ''}${motionPreset === 'blur-reveal' ? ', filter: "blur(12px)"' : ''}
      }}
      animate={{
        opacity: 1,
        y: 0${motionPreset === 'fade-scale' ? ', scale: 1' : ''}${motionPreset === 'blur-reveal' ? ', filter: "blur(0px)"' : ''}
      }}
      transition={{
        duration: ${motionDuration},
        delay: ${motionDelay},
        ease: [0.16, 1, 0.3, 1]
      }}
      className="h-16 w-auto object-contain"
    />
  );
}`;
    }
  };

  const handleCopyMotionCode = () => {
    navigator.clipboard.writeText(getMotionCssCode());
    setIsMotionCssCopied(true);
    setTimeout(() => setIsMotionCssCopied(false), 2500);
  };

  const renderPlatformIcon = (platform: string, className = "w-4 h-4") => {
    switch (platform) {
      case 'twitter': return <TwitterIcon className={className} />;
      case 'linkedin': return <LinkedinIcon className={className} />;
      case 'instagram': return <InstagramIcon className={className} />;
      case 'youtube': return <YoutubeIcon className={className} />;
      case 'facebook': return <FacebookIcon className={className} />;
      default: return <Share2 className={className} />;
    }
  };

  // High-Resolution HTML5 Canvas Generator for Export
  const drawCanvasAsset = async (
    canvas: HTMLCanvasElement,
    asset: SocialAssetDef,
    options: {
      bgColor: string;
      textColor: string;
      selectedPattern: PatternType | 'none';
      patternScale: number;
      patternOpacity: number;
      patternFgColor: string;
      logoScale: number;
      showHandle: boolean;
      showSafeZone: boolean;
    }
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = asset.width;
    const height = asset.height;

    // 1. Fill Background
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Pattern if active
    if (options.selectedPattern !== 'none') {
      const tileScale = Math.round(options.patternScale * (width / 600));
      const pDataUrl = generatePatternDataUrl({
        type: options.selectedPattern,
        scale: Math.max(16, tileScale),
        bgColor: 'transparent',
        fgColor: options.patternFgColor,
        secondaryColor: secondaryColor,
        accentColor: accentColor,
        opacity: options.patternOpacity
      });

      if (pDataUrl) {
        const pImg = new Image();
        pImg.src = pDataUrl;
        await new Promise<void>(resolve => {
          pImg.onload = () => resolve();
          pImg.onerror = () => resolve();
        });
        const pattern = ctx.createPattern(pImg, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, width, height);
        }
      }
    }

    // 3. Draw Profile Picture vs Banner Background
    if (asset.type === 'profile') {
      const maxDim = Math.min(width, height) * (options.logoScale / 100);

      if (bible.primaryLogo) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = bible.primaryLogo;

        const loaded = await new Promise<boolean>(resolve => {
          logoImg.onload = () => resolve(true);
          logoImg.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 2000);
        });

        if (loaded) {
          const aspect = logoImg.width / logoImg.height;
          let drawW = maxDim;
          let drawH = maxDim;
          if (aspect > 1) {
            drawH = maxDim / aspect;
          } else {
            drawW = maxDim * aspect;
          }

          const x = (width - drawW) / 2;
          const y = (height - drawH) / 2;

          if (asset.isCircleProfile) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, width / 2 - 4, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logoImg, x, y, drawW, drawH);
            ctx.restore();
          } else {
            ctx.drawImage(logoImg, x, y, drawW, drawH);
          }
        } else {
          // Fallback monogram
          drawMonogram(ctx, width, height, options.textColor);
        }
      } else {
        drawMonogram(ctx, width, height, options.textColor);
      }
    } else {
      // Banner Layout
      const logoHeight = height * 0.38;
      const logoMarginX = width * 0.08;
      const logoY = (height - logoHeight) / 2;
      let textStartX = logoMarginX;

      if (bible.primaryLogo) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = bible.primaryLogo;

        const loaded = await new Promise<boolean>(resolve => {
          logoImg.onload = () => resolve(true);
          logoImg.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 2000);
        });

        if (loaded) {
          const aspect = logoImg.width / logoImg.height;
          const logoWidth = logoHeight * aspect;
          ctx.drawImage(logoImg, logoMarginX, logoY, logoWidth, logoHeight);
          textStartX = logoMarginX + logoWidth + width * 0.04;
        } else {
          const monoSize = height * 0.35;
          ctx.fillStyle = options.textColor;
          ctx.font = `black ${Math.round(monoSize * 0.7)}px sans-serif`;
          ctx.fillText(bible.companyName.substring(0, 2).toUpperCase(), logoMarginX, logoY + monoSize * 0.7);
          textStartX = logoMarginX + monoSize + width * 0.04;
        }
      }

      // Title
      ctx.fillStyle = options.textColor;
      ctx.font = `bold ${Math.round(height * 0.13)}px sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(bible.companyName, textStartX, height * 0.38);

      // Handle & Industry
      if (options.showHandle) {
        const handleStr = `@${bible.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        ctx.fillStyle = options.textColor;
        ctx.globalAlpha = 0.8;
        ctx.font = `600 ${Math.round(height * 0.075)}px sans-serif`;
        ctx.fillText(`${handleStr}   |   ${bible.industry}`, textStartX, height * 0.58);
        ctx.globalAlpha = 1.0;
      }

      // Safe zone guide overlay if requested
      if (options.showSafeZone) {
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = 4;
        if (asset.platform === 'twitter') {
          ctx.beginPath();
          ctx.arc(width * 0.12, height * 0.75, height * 0.32, 0, Math.PI * 2);
          ctx.stroke();
        } else if (asset.platform === 'linkedin') {
          ctx.strokeRect(width * 0.05, height * 0.5, height * 0.6, height * 0.6);
        }
        ctx.setLineDash([]);
      }
    }
  };

  const drawMonogram = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    const size = Math.min(width, height) * 0.4;
    ctx.fillStyle = color;
    ctx.font = `black ${Math.round(size)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bible.companyName.substring(0, 2).toUpperCase(), width / 2, height / 2);
  };

  const handleDownloadSocialAsset = async (asset: SocialAssetDef) => {
    setDownloadingAssetId(asset.id);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = asset.width;
      canvas.height = asset.height;

      await drawCanvasAsset(canvas, asset, {
        bgColor: activeAssetBgColor,
        textColor: activeAssetTextColor,
        selectedPattern,
        patternScale,
        patternOpacity,
        patternFgColor,
        logoScale: assetLogoScale,
        showHandle: showHandleOnBanner,
        showSafeZone: showSafeZoneOverlay
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeCompany = bible.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `${safeCompany}-${asset.id}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast({
        message: `Exported ${asset.name} (${asset.dimensionsLabel})!`,
        hex: activeAssetBgColor
      });
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      console.error('Error downloading social asset:', err);
    } finally {
      setDownloadingAssetId(null);
    }
  };

  const handleBatchExportAll = async () => {
    setIsBatchExporting(true);
    const targetAssets = SOCIAL_ASSETS.filter(asset => {
      const matchesType = socialAssetTypeFilter === 'all' || asset.type === socialAssetTypeFilter;
      const matchesPlatform = socialPlatformFilter === 'all' || asset.platform === socialPlatformFilter;
      return matchesType && matchesPlatform;
    });

    for (let i = 0; i < targetAssets.length; i++) {
      const asset = targetAssets[i];
      await handleDownloadSocialAsset(asset);
      await new Promise(r => setTimeout(r, 450));
    }
    setIsBatchExporting(false);
  };

  const filteredAssets = SOCIAL_ASSETS.filter(asset => {
    const matchesType = socialAssetTypeFilter === 'all' || asset.type === socialAssetTypeFilter;
    const matchesPlatform = socialPlatformFilter === 'all' || asset.platform === socialPlatformFilter;
    return matchesType && matchesPlatform;
  });

  const renderMockupContent = () => {
    return (
      <>
        {/* 1. BUSINESS CARD MOCKUP */}
        {activeTab === 'card' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Front Side */}
            <div
              className="aspect-[1.75/1] rounded-2xl p-6 shadow-md border flex flex-col justify-between transition-all hover:scale-[1.02] relative overflow-hidden"
              style={{ backgroundColor: lightNeutral, borderColor: '#e2e8f0' }}
            >
              {patternDataUrl && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    backgroundImage: `url("${patternDataUrl}")`,
                    backgroundRepeat: 'repeat'
                  }}
                />
              )}

              <div className="flex justify-between items-start z-10">
                <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center bg-white shadow-sm">
                  {bible.primaryLogo ? (
                    <img src={bible.primaryLogo} alt="Logo" className="max-h-8 max-w-8 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: primaryColor }} />
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-200/60 shadow-2xs backdrop-blur-xs" style={{ color: secondaryColor }}>
                    Corporate Office
                  </span>
                </div>
              </div>
              <div className="z-10">
                <h3 className="text-lg font-extrabold tracking-tight" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                  {bible.companyName}
                </h3>
                <p className="text-[10px] tracking-wide font-bold" style={{ fontFamily: bodyFontFamily, color: primaryColor }}>
                  {bible.industry}
                </p>
              </div>
            </div>

            {/* Back Side */}
            <div
              className="aspect-[1.75/1] rounded-2xl p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.02]"
              style={{ backgroundColor: darkNeutral }}
            >
              {patternDataUrl && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300 opacity-60"
                  style={{
                    backgroundImage: `url("${patternDataUrl}")`,
                    backgroundRepeat: 'repeat'
                  }}
                />
              )}

              <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full filter blur-2xl opacity-20 -mr-8 -mb-8" style={{ backgroundColor: primaryColor }} />
              <div className="absolute left-1/2 top-0 w-24 h-24 rounded-full filter blur-xl opacity-10 -mt-10" style={{ backgroundColor: accentColor }} />

              <div className="flex justify-between items-start z-10">
                <div>
                  <h4 className="text-sm font-bold tracking-wide" style={{ fontFamily: headerFontFamily }}>
                    Sarah Jenkins
                  </h4>
                  <p className="text-[9px] opacity-70" style={{ fontFamily: bodyFontFamily }}>
                    Director of Creative Strategy
                  </p>
                </div>
                {bible.primaryLogo && (
                  <img src={bible.primaryLogo} alt="Logo white" className="h-6 w-6 object-contain brightness-0 invert opacity-80" referrerPolicy="no-referrer" />
                )}
              </div>

              <div className="space-y-1.5 z-10 font-sans">
                <div className="w-full h-[1px] opacity-20 bg-white my-1" />
                <div className="flex justify-between text-[8px] opacity-80 font-bold">
                  <span>M: +1 (555) 234-5678</span>
                  <span>E: s.jenkins@{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
                </div>
                <div className="flex justify-between text-[8px] opacity-80 font-bold">
                  <span>O: Chicago HQ</span>
                  <span>W: www.{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. LETTERHEAD MOCKUP */}
        {activeTab === 'letterhead' && (
          <div className="bg-white w-full max-w-xl shadow-lg border border-slate-200 p-8 rounded-2xl min-h-[480px] flex flex-col justify-between font-sans relative overflow-hidden">
            {patternDataUrl && (
              <div
                className="absolute top-0 left-0 right-0 h-10 pointer-events-none opacity-40 border-b border-slate-200/50"
                style={{
                  backgroundImage: `url("${patternDataUrl}")`,
                  backgroundRepeat: 'repeat'
                }}
              />
            )}

            <div className="border-b-2 pb-4 flex justify-between items-center z-10 pt-2" style={{ borderColor: primaryColor }}>
              <div className="flex items-center gap-3">
                {bible.primaryLogo ? (
                  <img src={bible.primaryLogo} alt="Logo" className="h-10 w-10 object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: primaryColor }} />
                )}
                <div>
                  <h3 className="text-base font-extrabold" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                    {bible.companyName}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-sans">
                    {bible.industry}
                  </p>
                </div>
              </div>
              <div className="text-right text-[8px] text-slate-500 font-sans font-bold">
                <p>100 Venture Boulevard, Suite 500</p>
                <p>San Francisco, CA 94107</p>
                <p>info@{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com</p>
              </div>
            </div>

            <div className="py-6 space-y-4 flex-grow font-sans z-10">
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>Ref: BRD-2026-04</span>
                <span>Date: July 14, 2026</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Dear Partners and Stakeholders,</p>
              <p className="text-[10px] text-slate-600 leading-relaxed font-sans" style={{ fontFamily: bodyFontFamily }}>
                As we initiate this new design phase, we are pleased to outline the primary operational rules of <span className="font-bold" style={{ color: primaryColor }}>{bible.companyName}</span>. 
                Our mission is simple: <span className="italic">"{bible.mission}"</span>.
                We expect all communication materials, products, and interactive setups to fully embody the core principles and color palette defined within this dynamic Brand Specification handbook.
              </p>
              <div className="pt-4 text-[10px] text-slate-500 font-sans">
                <p>Warm regards,</p>
                <p className="font-bold mt-2 text-slate-800" style={{ fontFamily: headerFontFamily }}>The Executive Leadership Team</p>
                <p className="text-[9px]">{bible.companyName}</p>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-between items-center text-[8px] text-slate-400 font-bold z-10 relative">
              <span>Confidential | &copy; 2026 {bible.companyName} All Rights Reserved</span>
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              </div>
            </div>
          </div>
        )}

        {/* 3. CAMPAIGN BANNER */}
        {activeTab === 'social' && (
          <div
            className="w-full max-w-2xl aspect-[1.91/1] rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between p-8 border border-slate-200"
            style={{ backgroundColor: lightNeutral }}
          >
            {patternDataUrl && (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-300"
                style={{
                  backgroundImage: `url("${patternDataUrl}")`,
                  backgroundRepeat: 'repeat'
                }}
              />
            )}

            <div className="absolute right-0 top-0 w-2/3 h-full opacity-10 transform skew-x-12 origin-top-right transition-all pointer-events-none" style={{ backgroundColor: primaryColor }} />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full opacity-15 filter blur-3xl pointer-events-none" style={{ backgroundColor: accentColor }} />

            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
                {bible.primaryLogo ? (
                  <img src={bible.primaryLogo} alt="Logo" className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-5 w-5 rounded-md" style={{ backgroundColor: primaryColor }} />
                )}
                <span className="text-xs font-black uppercase tracking-wider" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                  {bible.companyName}
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white shadow-xs" style={{ backgroundColor: secondaryColor }}>
                Launch Campaign
              </span>
            </div>

            <div className="space-y-3 z-10 my-auto bg-white/70 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/50 shadow-xs max-w-md">
              <h3 className="text-2xl md:text-3xl font-black leading-tight tracking-tight" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                The Future of {bible.industry.split('&')[0].split('and')[0].trim()}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2" style={{ fontFamily: bodyFontFamily }}>
                {bible.mission}
              </p>
            </div>

            <div className="flex justify-between items-center z-10 border-t border-slate-200/50 pt-3">
              <span className="text-[10px] font-mono font-bold tracking-wide text-slate-500 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/60">
                #{bible.companyName.replace(/\s+/g, '')}
              </span>
              <button
                id="social-copy-website-btn"
                onClick={handleCopyLink}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-4 py-1.5 text-[10px] font-bold rounded-full flex items-center gap-1 cursor-pointer transition shadow-2xs"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {isCopied ? 'Copied' : 'Copy Web Address'}
              </button>
            </div>
          </div>
        )}

        {/* 4. NEW: AUTO-SIZED SOCIAL MEDIA ASSETS KIT */}
        {activeTab === 'social_assets' && (
          <div className="w-full space-y-8 font-sans">
            {/* Top Toolbar / Customizer Bar */}
            <div className={`p-5 rounded-3xl border shadow-sm transition-all duration-300 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/90 border-slate-200/80'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4 mb-4 dark:border-slate-800 border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      <Camera className="w-4 h-4" />
                    </span>
                    <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Social Media Assets Kit
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Auto-generated profile pictures and cover banners formatted to exact social platform pixel standards.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="batch-export-social-kit-btn"
                    onClick={handleBatchExportAll}
                    disabled={isBatchExporting}
                    className="px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isBatchExporting ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <ArrowDownToLine className="w-4 h-4" />
                    )}
                    <span>{isBatchExporting ? 'Exporting Kit...' : `Download Social Kit (${filteredAssets.length})`}</span>
                  </button>
                </div>
              </div>

              {/* Filtering & Customizer Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
                {/* 1. Asset Category Type */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Asset Category:
                  </span>
                  <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <button
                      onClick={() => setSocialAssetTypeFilter('all')}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        socialAssetTypeFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All ({SOCIAL_ASSETS.length})
                    </button>
                    <button
                      onClick={() => setSocialAssetTypeFilter('profile')}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        socialAssetTypeFilter === 'profile' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Avatars
                    </button>
                    <button
                      onClick={() => setSocialAssetTypeFilter('banner')}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        socialAssetTypeFilter === 'banner' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Banners
                    </button>
                  </div>
                </div>

                {/* 2. Platform Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Social Platform:
                  </span>
                  <select
                    id="social-platform-filter-select"
                    value={socialPlatformFilter}
                    onChange={(e) => setSocialPlatformFilter(e.target.value as any)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="all">All Platforms (X, LinkedIn, IG, YT, FB)</option>
                    <option value="twitter">X / Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>

                {/* 3. Background Theme Preset */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Background Color Theme:
                  </span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[
                      { id: 'primary', hex: primaryColor, label: 'Primary' },
                      { id: 'dark', hex: darkNeutral, label: 'Dark' },
                      { id: 'light', hex: lightNeutral, label: 'Light' },
                      { id: 'secondary', hex: secondaryColor, label: 'Secondary' },
                      { id: 'accent', hex: accentColor, label: 'Accent' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAssetBgPreset(preset.id as any)}
                        className={`w-7 h-7 rounded-xl border transition-transform cursor-pointer flex items-center justify-center ${
                          assetBgPreset === preset.id ? 'ring-2 ring-indigo-500 scale-110 shadow-sm' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: preset.hex, borderColor: isDark ? '#334155' : '#cbd5e1' }}
                        title={`Theme: ${preset.label}`}
                      >
                        {assetBgPreset === preset.id && (
                          <Check className={`w-3.5 h-3.5 ${getContrastTextColor(preset.hex) === '#ffffff' ? 'text-white' : 'text-slate-900'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Logo Scale & Controls */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Logo Scale:</span>
                    <span className="font-mono text-indigo-400">{assetLogoScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="75"
                    step="5"
                    value={assetLogoScale}
                    onChange={(e) => setAssetLogoScale(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1 rounded cursor-pointer mt-2"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showHandleOnBanner}
                        onChange={(e) => setShowHandleOnBanner(e.target.checked)}
                        className="rounded accent-indigo-600 cursor-pointer"
                      />
                      <span>Show Handle</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSafeZoneOverlay}
                        onChange={(e) => setShowSafeZoneOverlay(e.target.checked)}
                        className="rounded accent-indigo-600 cursor-pointer"
                      />
                      <span>Safe Zone Guide</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets Display Grid */}
            <div className="space-y-8">
              {/* Profile Pictures & Avatars Section */}
              {(socialAssetTypeFilter === 'all' || socialAssetTypeFilter === 'profile') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800 border-slate-200">
                    <h4 className={`text-sm font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <User className="w-4 h-4 text-indigo-500" />
                      Auto-Sized Profile Pictures & Avatars (1:1 Ratio)
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {filteredAssets.filter(a => a.type === 'profile').length} Presets Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredAssets.filter(a => a.type === 'profile').map((asset) => {
                      const isDownloading = downloadingAssetId === asset.id;

                      return (
                        <div
                          key={asset.id}
                          className={`rounded-3xl border p-5 transition-all duration-300 hover:shadow-lg flex flex-col justify-between space-y-4 ${
                            isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Card Top Specs Bar */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                {renderPlatformIcon(asset.platform, "w-4 h-4")}
                              </span>
                              <span className={`text-xs font-black tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {asset.platformName}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {asset.dimensionsLabel}
                            </span>
                          </div>

                          {/* Avatar Preview Box */}
                          <div
                            className="w-full aspect-square rounded-2xl p-6 flex items-center justify-center relative overflow-hidden border border-black/10 shadow-inner transition-colors duration-300"
                            style={{ backgroundColor: activeAssetBgColor }}
                          >
                            {/* Brand Pattern Background */}
                            {patternDataUrl && (
                              <div
                                className="absolute inset-0 pointer-events-none transition-all duration-300"
                                style={{
                                  backgroundImage: `url("${patternDataUrl}")`,
                                  backgroundRepeat: 'repeat'
                                }}
                              />
                            )}

                            {/* Avatar Mask Container */}
                            <div
                              className={`w-3/4 h-3/4 p-4 flex items-center justify-center relative z-10 transition-transform hover:scale-105 shadow-md ${
                                asset.isCircleProfile ? 'rounded-full' : 'rounded-2xl'
                              } bg-white/10 backdrop-blur-xs border border-white/20`}
                            >
                              {bible.primaryLogo ? (
                                <img
                                  src={bible.primaryLogo}
                                  alt={asset.name}
                                  className="max-h-full max-w-full object-contain drop-shadow-sm"
                                  style={{ transform: `scale(${assetLogoScale / 50})` }}
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span
                                  className="text-2xl font-black font-sans tracking-wider"
                                  style={{ color: activeAssetTextColor }}
                                >
                                  {bible.companyName.substring(0, 2).toUpperCase()}
                                </span>
                              )}

                              {/* Platform Badge Overlay */}
                              {asset.platform === 'twitter' && (
                                <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-1 rounded-full shadow-xs border-2 border-white">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                              {asset.platform === 'instagram' && (
                                <div className="absolute inset-0 rounded-full border-2 border-amber-500/80 pointer-events-none" />
                              )}
                              {asset.platform === 'youtube' && (
                                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full shadow-xs border-2 border-white">
                                  <YoutubeIcon className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Asset Info & Action Button */}
                          <div className="space-y-3">
                            <div>
                              <h5 className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {asset.name}
                              </h5>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                                {asset.recommendedUse}
                              </p>
                            </div>

                            <button
                              id={`download-social-asset-btn-${asset.id}`}
                              onClick={() => handleDownloadSocialAsset(asset)}
                              disabled={isDownloading}
                              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-xs disabled:opacity-50"
                            >
                              {isDownloading ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span>{isDownloading ? 'Generating PNG...' : 'Download PNG'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Banner Backgrounds & Header Covers Section */}
              {(socialAssetTypeFilter === 'all' || socialAssetTypeFilter === 'banner') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800 border-slate-200 pt-4">
                    <h4 className={`text-sm font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <Layout className="w-4 h-4 text-indigo-500" />
                      Header Covers & Banner Backdrops
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {filteredAssets.filter(a => a.type === 'banner').length} Presets Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAssets.filter(a => a.type === 'banner').map((asset) => {
                      const isDownloading = downloadingAssetId === asset.id;

                      return (
                        <div
                          key={asset.id}
                          className={`rounded-3xl border p-5 transition-all duration-300 hover:shadow-lg flex flex-col justify-between space-y-4 ${
                            isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Card Top Bar */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                {renderPlatformIcon(asset.platform, "w-4 h-4")}
                              </span>
                              <span className={`text-xs font-black tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {asset.platformName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {asset.dimensionsLabel}
                              </span>
                            </div>
                          </div>

                          {/* Banner Live Preview Container */}
                          <div
                            className={`w-full rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-black/10 shadow-inner transition-colors duration-300 ${
                              asset.id === 'instagram-story' ? 'aspect-[9/16] max-h-80 mx-auto' : 'aspect-[3/1]'
                            }`}
                            style={{ backgroundColor: activeAssetBgColor }}
                          >
                            {/* Pattern Overlay */}
                            {patternDataUrl && (
                              <div
                                className="absolute inset-0 pointer-events-none transition-all duration-300"
                                style={{
                                  backgroundImage: `url("${patternDataUrl}")`,
                                  backgroundRepeat: 'repeat'
                                }}
                              />
                            )}

                            {/* Safe Zone Overlay Guide */}
                            {showSafeZoneOverlay && (
                              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-rose-500/70 z-20 flex items-center justify-center">
                                <span className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full font-mono">
                                  Safe Zone Guide
                                </span>
                              </div>
                            )}

                            {/* Banner Branding Content */}
                            <div className="flex items-center gap-4 z-10 my-auto">
                              <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-xs p-2 flex items-center justify-center shrink-0 border border-white/20">
                                {bible.primaryLogo ? (
                                  <img src={bible.primaryLogo} alt="Logo" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  <span className="text-sm font-black" style={{ color: activeAssetTextColor }}>
                                    {bible.companyName.substring(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>

                              <div className="space-y-0.5 min-w-0">
                                <h4
                                  className="text-base sm:text-lg font-black tracking-tight truncate"
                                  style={{ color: activeAssetTextColor, fontFamily: headerFontFamily }}
                                >
                                  {bible.companyName}
                                </h4>
                                {showHandleOnBanner && (
                                  <p
                                    className="text-[11px] font-bold opacity-80 truncate"
                                    style={{ color: activeAssetTextColor, fontFamily: bodyFontFamily }}
                                  >
                                    @{bible.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')} • {bible.industry}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Bottom Tagline / CTA Strip */}
                            <div className="flex items-center justify-between text-[10px] z-10 pt-2 border-t border-white/15 opacity-85">
                              <span className="font-semibold truncate" style={{ color: activeAssetTextColor }}>
                                {bible.mission}
                              </span>
                              <span className="font-mono text-[9px] font-extrabold uppercase shrink-0" style={{ color: activeAssetTextColor }}>
                                {asset.aspectRatioLabel}
                              </span>
                            </div>
                          </div>

                          {/* Card Bottom Bar */}
                          <div className="space-y-3">
                            <div>
                              <h5 className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {asset.name}
                              </h5>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                                {asset.recommendedUse}
                              </p>
                            </div>

                            <button
                              id={`download-social-banner-btn-${asset.id}`}
                              onClick={() => handleDownloadSocialAsset(asset)}
                              disabled={isDownloading}
                              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-xs disabled:opacity-50"
                            >
                              {isDownloading ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span>{isDownloading ? 'Generating PNG...' : 'Download High-Res PNG'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. WEBSITE HERO LANDING PAGE */}
        {activeTab === 'website' && (
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg border border-slate-200 overflow-hidden font-sans relative">
            <div className="bg-slate-50 border-b px-4 py-2 flex items-center gap-1.5 z-10 relative">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="bg-white border text-[9px] text-slate-400 px-3 py-0.5 rounded-md ml-4 w-1/2 overflow-hidden text-ellipsis">
                https://www.{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com
              </div>
            </div>

            <div className="px-6 py-3 border-b flex justify-between items-center z-10 relative bg-white">
              <div className="flex items-center gap-2">
                {bible.primaryLogo ? (
                  <img src={bible.primaryLogo} alt="Logo" className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-5 w-5 rounded-md" style={{ backgroundColor: primaryColor }} />
                )}
                <span className="text-xs font-extrabold tracking-tight" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                  {bible.companyName}
                </span>
              </div>
              <div className="flex gap-4 text-[10px] text-slate-500 font-sans font-bold">
                <span className="hover:text-slate-800 cursor-pointer">Platform</span>
                <span className="hover:text-slate-800 cursor-pointer">Solutions</span>
                <span className="hover:text-slate-800 cursor-pointer">Pricing</span>
              </div>
              <button
                id="nav-cta-btn"
                className="px-4 py-1.5 rounded-full text-[10px] font-bold text-white transition cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Get Started
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 items-center relative">
              <div className="space-y-4 z-10">
                <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-sans">Introducing our solutions</span>
                </div>

                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                  Elevating the standard of <span style={{ color: primaryColor }}>{bible.industry.split('&')[0]}</span>.
                </h1>
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans" style={{ fontFamily: bodyFontFamily }}>
                  {bible.mission}
                </p>
                <div className="flex gap-2">
                  <button
                    id="website-primary-cta"
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-sm transition cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Request Demo
                  </button>
                  <button
                    id="website-secondary-cta"
                    className="px-5 py-2.5 rounded-full text-xs font-semibold border transition bg-white hover:bg-slate-50 cursor-pointer"
                    style={{ color: darkNeutral, borderColor: '#e2e8f0' }}
                  >
                    Learn More &rarr;
                  </button>
                </div>
              </div>

              <div className="h-36 rounded-2xl border relative overflow-hidden flex flex-col justify-center items-center z-10" style={{ backgroundColor: lightNeutral, borderColor: '#f1f5f9' }}>
                {patternDataUrl && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-300"
                    style={{
                      backgroundImage: `url("${patternDataUrl}")`,
                      backgroundRepeat: 'repeat'
                    }}
                  />
                )}
                <div className="absolute top-4 left-4 h-6 w-6 rounded-full" style={{ backgroundColor: accentColor, opacity: 0.2 }} />
                {bible.primaryLogo ? (
                  <img src={bible.primaryLogo} alt="Logo hero" className="h-20 w-20 object-contain drop-shadow-sm transition hover:scale-105 z-10" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-12 w-12 rounded-xl shadow-lg animate-bounce z-10" style={{ backgroundColor: primaryColor }} />
                )}
                <div className="mt-2 text-[9px] font-semibold text-slate-400 font-mono tracking-wider z-10 bg-white/80 px-2 py-0.5 rounded">
                  PRIMARY LOGO SYSTEM
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. MOTION IDENTITY & LOGO REVEAL SECTION */}
        {activeTab === 'motion' && (
          <div className="w-full space-y-8 font-sans">
            {/* Motion Header & Overview Card */}
            <div className={`p-6 rounded-3xl border shadow-sm transition-all duration-300 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/90 border-slate-200/80'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-5 dark:border-slate-800 border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Zap className="w-4 h-4" />
                    </span>
                    <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Motion Identity & Logo Reveal System
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                    Define how <span className="font-bold text-indigo-400">{bible.companyName}</span> enters screens. Custom animation curves, easing timing, and ready-to-use CSS & React snippets for high-impact brand reveals.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="motion-replay-header-btn"
                    onClick={() => setMotionPlayCount(prev => prev + 1)}
                    className="px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Replay Reveal Animation</span>
                  </button>
                </div>
              </div>

              {/* Animation Preset Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-medium">
                {/* 1. Preset Style */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Reveal Motion Style:
                  </span>
                  <select
                    id="motion-preset-select"
                    value={motionPreset}
                    onChange={(e) => {
                      setMotionPreset(e.target.value as any);
                      setMotionPlayCount(prev => prev + 1);
                    }}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="slide-up">Smooth Slide-Up & Fade</option>
                    <option value="fade-scale">Scale-Up Pulse Reveal</option>
                    <option value="elastic-drop">Elastic Overshoot Drop</option>
                    <option value="blur-reveal">Subtle Blur-In Focus</option>
                  </select>
                </div>

                {/* 2. Duration Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Duration:</span>
                    <span className="font-mono text-indigo-400">{motionDuration}s</span>
                  </div>
                  <input
                    id="motion-duration-slider"
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.1"
                    value={motionDuration}
                    onChange={(e) => {
                      setMotionDuration(parseFloat(e.target.value));
                      setMotionPlayCount(prev => prev + 1);
                    }}
                    className="w-full accent-indigo-600 h-1 rounded cursor-pointer mt-2"
                  />
                </div>

                {/* 3. Delay Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Delay:</span>
                    <span className="font-mono text-indigo-400">{motionDelay}s</span>
                  </div>
                  <input
                    id="motion-delay-slider"
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={motionDelay}
                    onChange={(e) => {
                      setMotionDelay(parseFloat(e.target.value));
                      setMotionPlayCount(prev => prev + 1);
                    }}
                    className="w-full accent-indigo-600 h-1 rounded cursor-pointer mt-2"
                  />
                </div>

                {/* 4. Y Distance */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Slide Distance:</span>
                    <span className="font-mono text-indigo-400">{motionYOffset}px</span>
                  </div>
                  <input
                    id="motion-y-offset-slider"
                    type="range"
                    min="0"
                    max="60"
                    step="4"
                    value={motionYOffset}
                    onChange={(e) => {
                      setMotionYOffset(parseInt(e.target.value, 10));
                      setMotionPlayCount(prev => prev + 1);
                    }}
                    className="w-full accent-indigo-600 h-1 rounded cursor-pointer mt-2"
                  />
                </div>

                {/* 5. Easing Function */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Easing Curve:
                  </span>
                  <select
                    id="motion-easing-select"
                    value={motionEasing}
                    onChange={(e) => {
                      setMotionEasing(e.target.value);
                      setMotionPlayCount(prev => prev + 1);
                    }}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="cubic-bezier(0.16, 1, 0.3, 1)">Smooth Spring (Default)</option>
                    <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">Bouncy Overshoot</option>
                    <option value="ease-out">Standard Ease Out</option>
                    <option value="cubic-bezier(0.7, 0, 0.84, 0)">Accelerated Ease In</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Interactive Stage & Live Snippet Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interactive Motion Preview Stage */}
              <div className={`p-8 rounded-3xl border flex flex-col justify-between items-center relative overflow-hidden min-h-[380px] shadow-sm transition-all duration-300 ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                {/* Pattern Data overlay */}
                {patternDataUrl && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-300 opacity-40"
                    style={{
                      backgroundImage: `url("${patternDataUrl}")`,
                      backgroundRepeat: 'repeat'
                    }}
                  />
                )}

                <div className="w-full flex items-center justify-between z-10 border-b pb-3 border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold tracking-tight text-slate-400 uppercase font-mono">
                      Live Preview Stage
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {motionPreset.toUpperCase()} • {motionDuration}s
                  </span>
                </div>

                {/* Animated Logo Container */}
                <div className="my-auto py-12 flex flex-col items-center justify-center z-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={motionPlayCount}
                      initial={{
                        opacity: 0,
                        y: motionYOffset,
                        scale: motionPreset === 'fade-scale' ? 0.82 : motionPreset === 'elastic-drop' ? 0.88 : 1,
                        filter: motionPreset === 'blur-reveal' ? 'blur(12px)' : 'blur(0px)'
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: 'blur(0px)'
                      }}
                      transition={{
                        duration: motionDuration,
                        delay: motionDelay,
                        ease: motionPreset === 'elastic-drop'
                          ? [0.34, 1.56, 0.64, 1]
                          : [0.16, 1, 0.3, 1]
                      }}
                      className="flex flex-col items-center cursor-pointer group"
                      onClick={() => setMotionPlayCount(prev => prev + 1)}
                      title="Click to trigger logo reveal animation"
                    >
                      {bible.primaryLogo ? (
                        <img
                          src={bible.primaryLogo}
                          alt={bible.companyName}
                          className="h-28 w-28 object-contain drop-shadow-xl transition-transform duration-200 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div
                          className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-2xl text-white font-black text-3xl transition-transform duration-200 group-hover:scale-105"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {bible.companyName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <h3
                        className="mt-5 text-xl font-extrabold tracking-tight"
                        style={{ fontFamily: headerFontFamily, color: isDark ? '#ffffff' : darkNeutral }}
                      >
                        {bible.companyName}
                      </h3>
                      <p className="text-xs font-mono font-bold text-indigo-500 mt-1">
                        {bible.archetype?.tagline || bible.industry}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Stage Bottom Interactive Trigger */}
                <div className="w-full flex items-center justify-between z-10 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Click logo or button to re-trigger reveal frame
                  </span>
                  <button
                    id="motion-trigger-stage-btn"
                    onClick={() => setMotionPlayCount(prev => prev + 1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Replay</span>
                  </button>
                </div>
              </div>

              {/* Code Snippet Box & Export */}
              <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm transition-all duration-300 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 dark:border-slate-800 border-slate-200 mb-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-500" />
                      <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Generated Motion Code Snippet
                      </h4>
                    </div>

                    {/* Format Switcher */}
                    <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <button
                        id="motion-code-format-css"
                        onClick={() => setMotionSnippetFormat('css')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          motionSnippetFormat === 'css' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        CSS Keyframes
                      </button>
                      <button
                        id="motion-code-format-tailwind"
                        onClick={() => setMotionSnippetFormat('tailwind')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          motionSnippetFormat === 'tailwind' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Tailwind
                      </button>
                      <button
                        id="motion-code-format-react"
                        onClick={() => setMotionSnippetFormat('react')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          motionSnippetFormat === 'react' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        React / Motion
                      </button>
                    </div>
                  </div>

                  {/* Code Display Area */}
                  <div className="relative group">
                    <pre className="p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-[260px]">
                      <code>{getMotionCssCode()}</code>
                    </pre>

                    <button
                      id="copy-motion-code-snippet-btn"
                      onClick={handleCopyMotionCode}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
                    >
                      {isMotionCssCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied Code!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Motion Guidelines Specs */}
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 block mb-1">
                    Motion Brand Standards
                  </span>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span><strong>Optimal Duration:</strong> 0.6s–1.0s for primary hero brand unveils.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span><strong>Reduced Motion:</strong> Fully compliant with browser reduced motion media queries.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      id="brand-mockups-container"
      className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-4 mb-6 gap-4 transition-colors duration-300 ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">07 / Brand Applications</span>
          <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <Monitor className="w-5 h-5 text-indigo-600" />
            Interactive Brand Applications & Social Kits
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            See how your generated colors, typography, and logo apply dynamically on professional real-world mediums.
          </p>
        </div>

        {/* Mockup Tabs & Fullscreen Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex flex-wrap border p-1 rounded-full transition-colors duration-300 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              id="mockup-tab-social-assets"
              onClick={() => setActiveTab('social_assets')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
                activeTab === 'social_assets'
                  ? isDark
                    ? 'bg-slate-900 text-indigo-400 shadow-sm'
                    : 'bg-white text-indigo-600 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-indigo-500" />
              Social Assets Kit
            </button>
            <button
              id="mockup-tab-card"
              onClick={() => setActiveTab('card')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
                activeTab === 'card'
                  ? isDark
                    ? 'bg-slate-900 text-indigo-400 shadow-sm'
                    : 'bg-white text-indigo-600 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Business Card
            </button>
            <button
              id="mockup-tab-letterhead"
              onClick={() => setActiveTab('letterhead')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
                activeTab === 'letterhead'
                  ? isDark
                    ? 'bg-slate-900 text-indigo-400 shadow-sm'
                    : 'bg-white text-indigo-600 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Letterhead
            </button>
            <button
              id="mockup-tab-social"
              onClick={() => setActiveTab('social')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
                activeTab === 'social'
                  ? isDark
                    ? 'bg-slate-900 text-indigo-400 shadow-sm'
                    : 'bg-white text-indigo-600 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Social Banner
            </button>
            <button
              id="mockup-tab-website"
              onClick={() => setActiveTab('website')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
                activeTab === 'website'
                  ? isDark
                    ? 'bg-slate-900 text-indigo-400 shadow-sm'
                    : 'bg-white text-indigo-600 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Landing Hero
            </button>
            <button
              id="mockup-tab-motion"
              onClick={() => setActiveTab('motion')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
                activeTab === 'motion'
                  ? isDark
                    ? 'bg-slate-900 text-indigo-400 shadow-sm'
                    : 'bg-white text-indigo-600 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Motion Identity
            </button>
          </div>

          <button
            id="mockup-inspect-fullres-btn"
            type="button"
            onClick={() => {
              setZoomScale(1);
              setIsInspectModalOpen(true);
            }}
            className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs font-sans flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Inspect Fullres</span>
          </button>
        </div>
      </div>

      {/* Pattern Application Controls Bar */}
      <div className={`p-4 mb-6 rounded-2xl border flex flex-wrap items-center justify-between gap-4 font-sans transition-colors duration-300 ${
        isDark ? 'bg-slate-950/80 border-slate-800/80 text-slate-200' : 'bg-slate-50/80 border-slate-200/80 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs font-black tracking-tight">Apply Brand Pattern:</span>
          <select
            id="mockup-pattern-type-select"
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value as any)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500'
            }`}
          >
            <option value="none">None (Clean Background)</option>
            {BRAND_PATTERN_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.name} ({tmpl.category})
              </option>
            ))}
          </select>
        </div>

        {selectedPattern !== 'none' && (
          <div className="flex flex-wrap items-center gap-5 text-xs font-medium">
            {/* Pattern Color Tint */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Color:</span>
              <div className="flex items-center gap-1">
                {(['primary', 'secondary', 'accent', 'dark', 'light'] as const).map((role) => {
                  const colorHex =
                    role === 'primary' ? primaryColor :
                    role === 'secondary' ? secondaryColor :
                    role === 'accent' ? accentColor :
                    role === 'dark' ? darkNeutral : lightNeutral;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setPatternColorRole(role)}
                      className={`w-5 h-5 rounded-full border transition cursor-pointer ${
                        patternColorRole === role ? 'ring-2 ring-indigo-500 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: colorHex, borderColor: isDark ? '#475569' : '#cbd5e1' }}
                      title={`Tint: ${role}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Pattern Scale */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Scale:</span>
              <input
                type="range"
                min="16"
                max="80"
                step="4"
                value={patternScale}
                onChange={(e) => setPatternScale(parseInt(e.target.value, 10))}
                className="w-20 accent-indigo-600 h-1 rounded cursor-pointer"
              />
              <span className="font-mono text-[10px] text-slate-400 w-6 font-bold">{patternScale}px</span>
            </div>

            {/* Pattern Opacity */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Opacity:</span>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={patternOpacity}
                onChange={(e) => setPatternOpacity(parseFloat(e.target.value))}
                className="w-20 accent-indigo-600 h-1 rounded cursor-pointer"
              />
              <span className="font-mono text-[10px] text-slate-400 w-8 font-bold">{Math.round(patternOpacity * 100)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Sandbox Stage */}
      <div className="relative group bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 flex justify-center items-center overflow-x-auto min-h-[400px]">
        {/* Stage Zoom Badge Overlay */}
        <button
          id="mockup-stage-quick-inspect-badge"
          type="button"
          onClick={() => {
            setZoomScale(1);
            setIsInspectModalOpen(true);
          }}
          className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-[11px] font-sans flex items-center gap-1.5 backdrop-blur-md opacity-90 group-hover:opacity-100 transition shadow-md cursor-pointer border border-slate-700/60"
        >
          <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click to Zoom & Inspect</span>
        </button>

        {renderMockupContent()}
      </div>

      {/* Full Resolution Inspect Modal */}
      <AnimatePresence>
        {isInspectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md p-4 md:p-6 overflow-hidden"
          >
            {/* Modal Top Controls Bar */}
            <div className="flex flex-wrap justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-4 gap-3 shadow-xl font-sans">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white font-black text-sm">
                  <Maximize2 className="w-4 h-4 text-indigo-400" />
                  <span>Full Resolution Inspector</span>
                  <span className="text-xs font-bold text-indigo-300 font-mono bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-0.5 rounded-full">
                    {activeTab === 'social_assets' && 'Social Kit'}
                    {activeTab === 'card' && 'Business Card'}
                    {activeTab === 'letterhead' && 'Letterhead'}
                    {activeTab === 'social' && 'Social Banner'}
                    {activeTab === 'website' && 'Landing Hero'}
                    {activeTab === 'motion' && 'Motion Identity'}
                  </span>
                </div>
              </div>

              {/* Modal Tab Switcher */}
              <div className="flex bg-slate-950 p-1 rounded-full border border-slate-800 text-xs font-bold">
                <button
                  id="inspect-tab-social-assets"
                  type="button"
                  onClick={() => setActiveTab('social_assets')}
                  className={`px-3 py-1 rounded-full transition cursor-pointer ${activeTab === 'social_assets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Social Kit
                </button>
                <button
                  id="inspect-tab-card"
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`px-3 py-1 rounded-full transition cursor-pointer ${activeTab === 'card' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Card
                </button>
                <button
                  id="inspect-tab-letterhead"
                  type="button"
                  onClick={() => setActiveTab('letterhead')}
                  className={`px-3 py-1 rounded-full transition cursor-pointer ${activeTab === 'letterhead' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Letterhead
                </button>
                <button
                  id="inspect-tab-social"
                  type="button"
                  onClick={() => setActiveTab('social')}
                  className={`px-3 py-1 rounded-full transition cursor-pointer ${activeTab === 'social' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Social
                </button>
                <button
                  id="inspect-tab-website"
                  type="button"
                  onClick={() => setActiveTab('website')}
                  className={`px-3 py-1 rounded-full transition cursor-pointer ${activeTab === 'website' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Website
                </button>
                <button
                  id="inspect-tab-motion"
                  type="button"
                  onClick={() => setActiveTab('motion')}
                  className={`px-3 py-1 rounded-full transition cursor-pointer ${activeTab === 'motion' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Motion
                </button>
              </div>

              {/* Zoom & Canvas Controls */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs text-slate-400">
                  <button
                    id="inspect-bg-dark-btn"
                    type="button"
                    onClick={() => setModalBgMode('dark')}
                    className={`p-1.5 rounded transition cursor-pointer ${modalBgMode === 'dark' ? 'bg-slate-800 text-white' : 'hover:text-white'}`}
                    title="Dark Canvas"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id="inspect-bg-light-btn"
                    type="button"
                    onClick={() => setModalBgMode('light')}
                    className={`p-1.5 rounded transition cursor-pointer ${modalBgMode === 'light' ? 'bg-slate-800 text-white' : 'hover:text-white'}`}
                    title="Light Canvas"
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id="inspect-bg-grid-btn"
                    type="button"
                    onClick={() => setModalBgMode('grid')}
                    className={`p-1.5 rounded transition cursor-pointer ${modalBgMode === 'grid' ? 'bg-slate-800 text-white' : 'hover:text-white'}`}
                    title="Grid Canvas"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs text-white">
                  <button
                    id="inspect-zoom-out-btn"
                    type="button"
                    onClick={() => setZoomScale(z => Math.max(0.75, z - 0.25))}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                    disabled={zoomScale <= 0.75}
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[11px] px-2 font-bold select-none">{Math.round(zoomScale * 100)}%</span>
                  <button
                    id="inspect-zoom-in-btn"
                    type="button"
                    onClick={() => setZoomScale(z => Math.min(2.5, z + 0.25))}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                    disabled={zoomScale >= 2.5}
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id="inspect-zoom-reset-btn"
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  id="close-mockup-inspect-modal-btn"
                  type="button"
                  onClick={() => setIsInspectModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Close Inspector (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Zoom Stage View */}
            <div className={`flex-grow rounded-2xl border p-8 flex justify-center items-center overflow-auto relative transition-colors duration-300 ${
              modalBgMode === 'dark'
                ? 'bg-slate-950 border-slate-800'
                : modalBgMode === 'light'
                  ? 'bg-slate-200 border-slate-300'
                  : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-900 border-slate-800'
            }`}>
              <motion.div
                animate={{ scale: zoomScale }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="max-w-full max-h-full flex items-center justify-center origin-center"
              >
                {renderMockupContent()}
              </motion.div>
            </div>
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
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl font-sans text-xs transition-colors duration-300 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/80' : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/80'
            }`}
          >
            <div
              className="w-5 h-5 rounded-full border border-white/20 shadow-inner shrink-0"
              style={{ backgroundColor: toast.hex || primaryColor }}
            />
            <div className="flex flex-col">
              <span className="font-extrabold flex items-center gap-1 text-emerald-500">
                <Check className="w-3.5 h-3.5 shrink-0" />
                Asset Exported!
              </span>
              <span className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-full hover:bg-slate-800/20 text-slate-400 transition ml-2 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
